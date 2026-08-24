import Foundation

/// One cook of a recipe, mapped to the `cook_sessions` Supabase table.
/// A nil `completedAt` means the cook is still in progress.
struct CookSession: Codable, Identifiable, Hashable {
    let id: UUID
    let recipeId: UUID
    let userId: UUID
    let startedAt: Date
    var completedAt: Date?
    var currentStep: Int
    var notes: String?

    enum CodingKeys: String, CodingKey {
        case id
        case recipeId = "recipe_id"
        case userId = "user_id"
        case startedAt = "started_at"
        case completedAt = "completed_at"
        case currentStep = "current_step"
        case notes
    }

    var isInProgress: Bool { completedAt == nil }

    /// Duration of the cook; for an in-progress cook, elapsed time so far.
    var duration: TimeInterval {
        (completedAt ?? Date()).timeIntervalSince(startedAt)
    }
}

/// A step snapshot belonging to a cook session, mapped to the
/// `cook_session_steps` Supabase table. Snapshotted from the recipe's steps
/// when the cook starts, so later recipe edits never alter cook history.
struct CookSessionStep: Codable, Identifiable, Hashable {
    let id: UUID
    let sessionId: UUID
    let sortOrder: Int
    let instruction: String
    var completedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case sessionId = "session_id"
        case sortOrder = "sort_order"
        case instruction
        case completedAt = "completed_at"
    }
}
