# Pending cross-off toggles vs. realtime echo (iOS)

## Problem

Double-tap cross-off uses a 1.5s delayed commit per item (`scheduleToggleItem` in
`ios-native/GatherLists/GatherLists/ViewModels/ListDetailViewModel.swift`). When several
items were crossed off in quick succession, only the first one stuck: the first item's
commit wrote to the DB, Supabase realtime echoed that change back to the same device, and
the items-channel handler called `cancelAllPendingToggles()` — wiping every other item's
still-pending toggle.

## Rule

**Never cancel all pending optimistic state on a realtime event — your own commits echo
back through the channel.** Clear pending state per item, and only when that item's
server state actually diverged from what it was when the user acted.

The fix mirrors the web hook (`src/hooks/usePendingToggles.js`), which got this right from
the start:

- record `originalChecked` at schedule time (`runtime.pendingToggleOriginals`)
- on a realtime items change: refetch, then `clearStalePendingToggles()` — cancel a
  pending toggle only if its item is gone or `isChecked` no longer matches the recorded
  original (i.e. someone else really changed it; remote wins)
- commit the stored **target** state (`pendingToggleStates[itemId]`), not a re-flip of
  whatever the current state happens to be after a mid-delay refetch

If the web and iOS delayed-toggle behaviors ever change, change both — they are meant to
be semantically identical.
