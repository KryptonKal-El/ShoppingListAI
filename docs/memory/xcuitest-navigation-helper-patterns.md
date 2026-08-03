# XCUITest Navigation Helper Patterns for iOS Native Tests

## Problem

ListDetailViewCollaboratorMenuTests needed 8 navigation helper methods to reach different list types with specific role/configuration combinations. The challenge: XCUITest can't directly query Supabase for list type or role; it must infer them from UI elements.

## Solution

Use **capability detection via menu inspection** to navigate to the correct list type:

```swift
// Look for collaborator lists WITHOUT stores by checking if menu contains manageStores button
for index in 1..<listCells.count {
    let list = listCells.element(boundBy: index)
    list.tap()
    
    let collaboratorMenuButton = app.buttons["listDetail-collaboratorMenuButton"]
    if collaboratorMenuButton.waitForExistence(timeout: 2) {
        collaboratorMenuButton.tap()
        let manageStoresButton = app.buttons["collaboratorMenu-manageStores"]
        if !manageStoresButton.exists {
            // Found a collaborator list WITHOUT stores!
            return
        } else {
            // Wrong list, go back and try next
            app.navigationBars.buttons.element(boundBy: 0).tap()
            Thread.sleep(forTimeInterval: 0.5)
        }
    }
}
```

## Key Insights

1. **Role detection:** Check which menu button exists (collaborator vs owner) via accessibility identifiers
2. **Feature detection:** Tap menu and inspect for feature-specific buttons (manageStores, manageCategories)
3. **Guest list detection:** Scan for RSVP status labels ("Confirmed", "Declined", "Maybe", "Not Yet Invited")
4. **Fallback pattern:** Every helper has a fallback to the first available matching list

## Test Data Requirements

Tests require pre-seeded Supabase data:
- At least 2 test users (owner and collaborator)
- Min 7 shared lists with different type/role combinations
- Guest lists with RSVP-enabled items

Set via environment or hardcoded in `setUpWithError()`.

## Screenshot Teardown

Added `tearDownWithError()` with automatic screenshot capture on failure:

```swift
override func tearDownWithError() throws {
    if let currentTest = testRun, currentTest.failureCount > 0 {
        let screenshot = app.screenshot()
        let attachment = XCTAttachment(screenshot: screenshot)
        attachment.lifetime = .keepAlways
        add(attachment)
    }
    try super.tearDownWithError()
}
```

Attached screenshots appear in Xcode test report for debugging failed assertions.
