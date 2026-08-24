import Foundation
import Observation

/// Drives the cook log for one recipe: the active (in-progress) session,
/// the completed-cook history, and the guided cook-mode flow.
@Observable
@MainActor
final class CookSessionViewModel {
    let recipeId: UUID
    let userId: UUID

    var activeSession: CookSession?
    var activeSteps: [CookSessionStep] = []
    var history: [CookSession] = []
    var error: String?

    init(recipeId: UUID, userId: UUID) {
        self.recipeId = recipeId
        self.userId = userId
    }

    /// Loads the in-progress session (if any) and the completed history.
    func loadState() async {
        do {
            async let active = CookSessionService.fetchActiveSession(recipeId: recipeId, userId: userId)
            async let completed = CookSessionService.fetchHistory(recipeId: recipeId)
            let (activeResult, historyResult) = try await (active, completed)
            activeSession = activeResult?.session
            activeSteps = activeResult?.steps ?? []
            history = historyResult
        } catch {
            self.error = error.localizedDescription
            print("[CookSessionViewModel] Failed to load cook state: \(error.localizedDescription)")
        }
    }

    /// Starts a new cook, snapshotting the recipe's current steps.
    /// Returns true when the session is ready to present.
    func startCook(steps: [RecipeStep]) async -> Bool {
        error = nil
        do {
            let started = try await CookSessionService.startCook(
                recipeId: recipeId,
                userId: userId,
                steps: steps
            )
            activeSession = started.session
            activeSteps = started.steps
            return true
        } catch {
            self.error = error.localizedDescription
            print("[CookSessionViewModel] Failed to start cook: \(error.localizedDescription)")
            return false
        }
    }

    /// Marks a step done/undone, keeping local state in sync.
    func setStepCompleted(_ step: CookSessionStep, completed: Bool) async {
        guard let index = activeSteps.firstIndex(where: { $0.id == step.id }) else { return }
        let previous = activeSteps[index].completedAt
        activeSteps[index].completedAt = completed ? Date() : nil
        do {
            try await CookSessionService.setStepCompleted(stepId: step.id, completed: completed)
        } catch {
            activeSteps[index].completedAt = previous
            self.error = error.localizedDescription
            print("[CookSessionViewModel] Failed to update step: \(error.localizedDescription)")
        }
    }

    /// Persists the step index the cook is on, so resuming lands there.
    func setCurrentStep(_ index: Int) async {
        guard var session = activeSession, session.currentStep != index else { return }
        session.currentStep = index
        activeSession = session
        do {
            try await CookSessionService.updateCurrentStep(sessionId: session.id, currentStep: index)
        } catch {
            print("[CookSessionViewModel] Failed to save current step: \(error.localizedDescription)")
        }
    }

    /// Finishes the active cook and refreshes history.
    func finishCook() async {
        guard let session = activeSession else { return }
        error = nil
        do {
            try await CookSessionService.completeSession(sessionId: session.id)
            activeSession = nil
            activeSteps = []
            await loadState()
        } catch {
            self.error = error.localizedDescription
            print("[CookSessionViewModel] Failed to finish cook: \(error.localizedDescription)")
        }
    }

    /// Discards the active cook without recording it.
    func cancelCook() async {
        guard let session = activeSession else { return }
        error = nil
        do {
            try await CookSessionService.cancelSession(sessionId: session.id)
            activeSession = nil
            activeSteps = []
        } catch {
            self.error = error.localizedDescription
            print("[CookSessionViewModel] Failed to cancel cook: \(error.localizedDescription)")
        }
    }
}
