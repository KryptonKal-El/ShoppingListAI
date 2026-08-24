import Foundation
import Supabase

/// Service layer wrapping Supabase queries for cook sessions (the cook log).
struct CookSessionService {
    private static var client: SupabaseClient { SupabaseManager.shared.client }

    /// Starts a cook: inserts the session and snapshots the recipe's current
    /// steps into `cook_session_steps` so later recipe edits never affect it.
    static func startCook(
        recipeId: UUID,
        userId: UUID,
        steps: [RecipeStep]
    ) async throws -> (session: CookSession, steps: [CookSessionStep]) {
        let session: CookSession = try await client
            .from("cook_sessions")
            .insert(NewCookSession(recipeId: recipeId, userId: userId))
            .select()
            .single()
            .execute()
            .value

        guard !steps.isEmpty else { return (session, []) }

        let snapshots = steps
            .sorted { $0.sortOrder < $1.sortOrder }
            .enumerated()
            .map { index, step in
                NewCookSessionStep(
                    sessionId: session.id,
                    sortOrder: index,
                    instruction: step.instruction
                )
            }
        let inserted: [CookSessionStep] = try await client
            .from("cook_session_steps")
            .insert(snapshots)
            .select()
            .execute()
            .value

        return (session, inserted.sorted { $0.sortOrder < $1.sortOrder })
    }

    /// Fetches the user's in-progress session for a recipe, if any, with its steps.
    static func fetchActiveSession(
        recipeId: UUID,
        userId: UUID
    ) async throws -> (session: CookSession, steps: [CookSessionStep])? {
        let sessions: [CookSession] = try await client
            .from("cook_sessions")
            .select()
            .eq("recipe_id", value: recipeId)
            .eq("user_id", value: userId)
            .is("completed_at", value: nil)
            .execute()
            .value

        guard let session = sessions.first else { return nil }
        let steps = try await fetchSessionSteps(sessionId: session.id)
        return (session, steps)
    }

    /// Fetches the completed cooks for a recipe, newest first.
    static func fetchHistory(recipeId: UUID) async throws -> [CookSession] {
        let sessions: [CookSession] = try await client
            .from("cook_sessions")
            .select()
            .eq("recipe_id", value: recipeId)
            .not("completed_at", operator: .is, value: "null")
            .order("completed_at", ascending: false)
            .execute()
            .value
        return sessions
    }

    /// Fetches the step snapshots for a session, in cooking order.
    static func fetchSessionSteps(sessionId: UUID) async throws -> [CookSessionStep] {
        let steps: [CookSessionStep] = try await client
            .from("cook_session_steps")
            .select()
            .eq("session_id", value: sessionId)
            .order("sort_order", ascending: true)
            .execute()
            .value
        return steps
    }

    /// Marks a step done (or not done again) by setting/clearing completed_at.
    static func setStepCompleted(stepId: UUID, completed: Bool) async throws {
        try await client
            .from("cook_session_steps")
            .update(StepCompletionUpdate(completedAt: completed ? Date() : nil))
            .eq("id", value: stepId)
            .execute()
    }

    /// Persists the step the cook is currently on, so the session resumes there.
    static func updateCurrentStep(sessionId: UUID, currentStep: Int) async throws {
        try await client
            .from("cook_sessions")
            .update(CurrentStepUpdate(currentStep: currentStep))
            .eq("id", value: sessionId)
            .execute()
    }

    /// Finishes a cook. The DB trigger updates the recipe's cook_count and
    /// last_cooked_at.
    static func completeSession(sessionId: UUID) async throws {
        try await client
            .from("cook_sessions")
            .update(CompleteSessionUpdate(completedAt: Date()))
            .eq("id", value: sessionId)
            .execute()
    }

    /// Discards an in-progress cook entirely (step snapshots cascade).
    static func cancelSession(sessionId: UUID) async throws {
        try await client
            .from("cook_sessions")
            .delete()
            .eq("id", value: sessionId)
            .execute()
    }
}

// MARK: - DTOs

private struct NewCookSession: Encodable {
    let recipeId: UUID
    let userId: UUID

    enum CodingKeys: String, CodingKey {
        case recipeId = "recipe_id"
        case userId = "user_id"
    }
}

private struct NewCookSessionStep: Encodable {
    let sessionId: UUID
    let sortOrder: Int
    let instruction: String

    enum CodingKeys: String, CodingKey {
        case sessionId = "session_id"
        case sortOrder = "sort_order"
        case instruction
    }
}

private struct StepCompletionUpdate: Encodable {
    let completedAt: Date?

    enum CodingKeys: String, CodingKey {
        case completedAt = "completed_at"
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        if let completedAt {
            try container.encode(completedAt, forKey: .completedAt)
        } else {
            try container.encodeNil(forKey: .completedAt)
        }
    }
}

private struct CurrentStepUpdate: Encodable {
    let currentStep: Int

    enum CodingKeys: String, CodingKey {
        case currentStep = "current_step"
    }
}

private struct CompleteSessionUpdate: Encodable {
    let completedAt: Date

    enum CodingKeys: String, CodingKey {
        case completedAt = "completed_at"
    }
}
