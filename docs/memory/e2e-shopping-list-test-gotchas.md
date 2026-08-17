# E2E Shopping List Test Gotchas

## CSS Modules break class selectors

Direct class selectors like `.details` don't work because CSS modules mangle class names (e.g., `._details_xyz_123`). 

**Fix:** Use `[class*="confirmBtn"]` to match partial class names.

## Multiple test lists from failed runs

Previous test runs can leave orphaned lists in the database. Selectors must be specific enough to match the exact list name being tested.

**Fix:** Use `filter({ hasText: LIST_NAME }).filter({ hasText: /\d+ items?/ })` to match the specific list.

## AI Suggestions section contains item names

The AI Suggestions section shows item names (e.g., "apples") based on shopping history. When asserting an item was removed, the selector may match the AI suggestion instead of the list item.

**Fix:** Be specific about WHERE you're looking for items. List items have category headings like "Produce 1" and "Edit item" buttons; AI suggestions have "Purchased X times before" text.

## Realtime/database timing issues

Operations like "clear checked" and "delete list" complete (dialog closes) before the database change is reflected in the UI via realtime subscriptions.

**Fix:** Add `page.reload()` after these operations to ensure fresh data is loaded before asserting the change took effect.

## ConfirmDialog renders via portal

The ConfirmDialog component renders via `createPortal` to `document.body`, not inside the component tree. Use global selectors to find dialog elements.

## Button name conflicts

`getByRole('button', { name: LIST_NAME })` can match multiple buttons (the list button AND the options menu button).

**Fix:** Use more specific locators that filter by expected structure.

## Touch events need delays for React state updates

When simulating swipe gestures via `TouchEvent` dispatch, React's async state updates require small delays (20-50ms) between touchstart/touchmove/touchend events.

**Fix:** Use `page.waitForTimeout()` between touch event dispatches.

## Autocomplete dropdown intercepts clicks

When adding items, the autocomplete dropdown can intercept clicks on the "Add" button.

**Fix:** Use `input.press('Enter')` instead of clicking the Add button.

## Edit panel delete button doesn't work on mobile

The Delete button inside the ShoppingItem edit panel doesn't respond to clicks on mobile. Native click events fire but React's onClick handler doesn't execute.

**Fix:** Close the edit panel and use swipe-to-delete as a workaround. See `docs/memory/edit-panel-delete-button-mobile-bug.md` for details.

## Reload restores the last-open list (updated)

OUTDATED: reload used to return the mobile app to the lists view. The app now
RESTORES the last-open list after `page.reload()`, landing back in the detail
view. Wait for `button[aria-label="Back to My Lists"]` instead of clicking back
into the list.

## The app lives at /app; / is a marketing landing page

`page.goto('/')` reaches the public landing page, which has no login form or
app UI. All specs (and auth.setup.js) must `page.goto('/app')`.

## Sortable rows swallow accessible names on mobile

The dnd-kit sortable list-row wrapper (`role="button"`, `aria-roledescription="sortable"`)
can resolve for `getByRole('button', { name: ... })` queries aimed at its nested
buttons (options menu, action-sheet items), causing strict-mode violations.
**Fix:** add `exact: true` to those locators.

## Sign-out must stay local-scope

`supabase.auth.signOut()` defaults to scope 'global', revoking EVERY session for
the user — including the storageState sessions of other running specs and the
user's other devices. `AuthContext.signOut` passes `{ scope: 'local' }`; keep it
that way or the e2e suite fails intermittently after auth-flow's logout test.
