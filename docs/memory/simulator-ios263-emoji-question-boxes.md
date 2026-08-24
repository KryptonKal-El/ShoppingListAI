# iOS 26.3 simulator renders all emoji as ?-boxes

## Problem

On the iOS 26.3 (26.3.1) simulator runtime, every emoji in the app renders as a
boxed "?" glyph — collection markers, chip icons, list emoji, all of them. The
data is fine (normal code points like U+1F4D6) and the same build renders emoji
correctly on a physical device. The missing glyphs also shift layout slightly,
so the simulator stops matching the live device.

## Root cause

A known bug in the iOS 26.3.1 simulator runtime shipped with Xcode 26.3: emoji /
Unicode don't render in the Simulator or Xcode Canvas (Apple Color Emoji is
present in the runtime but not resolved during text rendering). Fixed in the
iOS 26.4 simulator runtime. Nothing in app code can work around it.

## Fix

Run the app on an iOS 26.4+ simulator. This machine has 26.4 and 26.5 runtimes
installed with iPhone 17 Pro devices available — boot one of those instead of
the default 26.3 device:

```bash
xcrun simctl list devices   # find an iPhone under "iOS 26.4" / "iOS 26.5"
xcrun simctl boot <udid>
```

Do not chase this as an app bug (fonts, string handling, containsVisualEmoji —
all innocent), and don't "fix" layouts to accommodate the ?-boxes.
