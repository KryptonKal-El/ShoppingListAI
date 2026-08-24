import ActivityKit
import Foundation

/// Live Activity attributes for an in-progress cook. Compiled into BOTH the
/// app target (which starts/updates the activity) and the widget extension
/// (which renders it) — the two copies must stay one file.
struct CookActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var currentStep: Int
        var totalSteps: Int
        var instruction: String
        var completedSteps: Int
    }

    let recipeId: UUID
    let recipeName: String
    let startedAt: Date
}
