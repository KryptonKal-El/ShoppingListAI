# Ad-hoc Session Summary
**Date:** 2026-06-04  
**Task:** TSK-20260604-140645  
**Session:** builder-1780599642-d00dd7  
**Pipeline:** Lightweight A4  
**Branch:** main

---

## What Was Built

Redesigned the Gather marketing page (`public/index-marketing.html`) hero section from a static split layout into a FacilPay-style scroll-driven experience, with nav and CTA section polish across multiple change rounds.

---

## Changes Delivered

### Hero Section
- **300vh scroll-driven hero** — `.hero-scroll-height` scroll space + `.hero-sticky` 100vh sticky viewport
- **iPhone 17 Pro mockup** (`public/marketing/iphone-mockup.png`) fills the screen on load (`min(80vw, 920px)`), shrinks to 380px via `easeOutCubic` on scroll
- `align-items: flex-start` + `padding-top: 152px` — phone top visible above the fold on load
- **5 hero slides** inside `.hero-phone-screens` (z-index: 2):
  - Slide 0: headline + subline + white Download App CTA button
  - Slides 1–4: feature cards (emoji + title + desc)
- Slide cycling driven by scroll progress (after 18% scroll)
- Old static `<section class="features">` and its CSS fully removed; nav "Features" link removed

### Canvas Particles
- Replaced circular dots with **tiny heart shapes** (`drawHeart()` bezier helper, `PARTICLE_RADIUS: 4`)
- **Always-on drift** — each particle has `driftVx`/`driftVy` (±0.175 px/frame) so motion never stops
- Mouse interaction adds extra velocity (`vx`/`vy`) with `0.96` friction decay; repulsion force doubled (`0.06 → 0.12`)
- `dist > 0` null-safety guard

### Navigation
- **Logo** enlarged: `44px → 52px` desktop, `36px → 44px` mobile
- **Support link** added to nav pill (`href="/support"`, `.nav-link` class)
- **"Launch App" → "Download App"** with withnovu-style letter-by-letter animation:
  - 12 `.letter-wrapper` spans, 22ms stagger, `cubic-bezier(0.65, 0, 0.35, 1)`, 500ms duration
  - Letters slide up on hover revealing duplicate chars positioned at `top: 100%`
  - Apple  SVG icon (Font Awesome, 12×16px, `fill="currentColor"`)
  - Links to `https://apps.apple.com/app/id6760205400`, `target="_blank" rel="noopener noreferrer"`
- **Sign In link** (top right, `.nav-right` grid column) → `/app`
- Mobile: Download App button + Sign In both in `.nav-right`

### Download App Buttons — All Three
All three Download App buttons (nav, hero slide, green CTA section) share:
- Same letter animation HTML structure (`.btn-text` wrapper + staggered inline `transition-delay`)
- Apple SVG icon, App Store URL, `aria-label`, `rel="noopener noreferrer"`
- **Nav button**: dark bg (`#111`), white text
- **Hero slide button**: white bg (`#fff`), dark text (`#111`), `height: 48px`
- **CTA section button**: same white pill as hero (`hero-cta cta-download`)

### Accessibility
- `aria-hidden="true"` on canvas and all Apple SVG icons
- `:focus-visible` rings on all interactive elements
- `.hero-cta:focus-visible` dark override (`rgba(17,17,17,0.8)`, 10.3:1 contrast) for white button
- `pointer-events: auto` preserved on hero CTA (inside pointer-events-none container)

---

## Files Changed

| File | Change |
|------|--------|
| `public/index-marketing.html` | Full hero rewrite + nav restructure + CTA section button |
| `public/marketing/iphone-mockup.png` | New asset — iPhone 17 Pro mockup (~733 KB) |
| `public/marketing/app-screenshot.png` | New asset — app screenshot |
| `src/__tests__/marketing-page.test.js` | Updated for all structural changes; 121 tests passing |

---

## Commits

- `d6fca99` — feat: redesign marketing page hero with scroll-driven iPhone mockup and nav polish
- `7dcd526` — chore: complete TSK-20260604-140645 — update registry and task spec

---

## Test Status

✅ 121 tests passing — 13 test files

---

## Critic Findings Resolved

| Round | Stage | Blocking | Resolution |
|-------|-------|----------|------------|
| Nav changes | web-critic | 0 | — |
| Button polish | web-critic | 0 | — |
| Heart particles | web-critic | 0 | — |
| Hero CTA | web-critic | 1 | Focus ring: white-on-white → dark override (10.3:1) |
| CTA section | web-critic | 0 | — |
