import ActivityKit
import Foundation

/// Manages the cook Live Activity (Lock Screen card + Dynamic Island):
/// one activity at a time, started when a cook begins or resumes, updated as
/// steps advance, and ended when the cook finishes or is discarded.
@MainActor
final class CookActivityController {
    static let shared = CookActivityController()

    private var activity: Activity<CookActivityAttributes>?

    private init() {}

    /// Starts (or adopts) the Live Activity for a cook. Any activity left over
    /// from another cook is ended first.
    func start(
        recipeId: UUID,
        recipeName: String,
        startedAt: Date,
        state: CookActivityAttributes.ContentState
    ) async {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }

        if let existing = Activity<CookActivityAttributes>.activities
            .first(where: { $0.attributes.recipeId == recipeId }) {
            activity = existing
            await existing.update(ActivityContent(state: state, staleDate: nil))
            return
        }
        await endAll()

        let attributes = CookActivityAttributes(
            recipeId: recipeId,
            recipeName: recipeName,
            startedAt: startedAt
        )
        do {
            activity = try Activity.request(
                attributes: attributes,
                content: ActivityContent(state: state, staleDate: nil)
            )
        } catch {
            print("[CookActivityController] Failed to start Live Activity: \(error.localizedDescription)")
        }
    }

    /// Pushes the latest cook progress to the Lock Screen / Dynamic Island.
    func update(state: CookActivityAttributes.ContentState) async {
        await activity?.update(ActivityContent(state: state, staleDate: nil))
    }

    /// Ends every cook Live Activity (finish, discard, or stale reconciliation).
    func endAll() async {
        for activity in Activity<CookActivityAttributes>.activities {
            await activity.end(nil, dismissalPolicy: .immediate)
        }
        activity = nil
    }
}
