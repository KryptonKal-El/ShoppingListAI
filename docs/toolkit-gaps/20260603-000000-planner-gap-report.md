# Toolkit Gap Report

## Session: prd-marketing-site-redesign — 2026-06-03 00:00:00

### Context

PRD `prd-marketing-site-redesign` with 5 static HTML/CSS stories (`S-01` through `S-05`). All work targets `public/index-marketing.html` (static HTML, no React, no Vite) and test file `src/__tests__/marketing-page.test.js` (Vitest file-system reads). Project is primarily a React + Vite + TypeScript app, but this PRD branch is static web work.

### Findings

#### Missing Project-Level Specialists

- **Priority:** Critical
- **Scope:** project
- **Remediation:** project-setup workflow / re-run `project-bootstrap`
- **Finding:** The project Specialists block (in `AGENTS.md`) lacks three required static-web specialists. When the PRD work reaches `Concepture-Developer`, the router will not find a matching developer specialist for static HTML/CSS work. Fallback to React specialists is incorrect — static HTML has no components, hooks, or TypeScript type patterns.
- **Specialists Missing:**
  1. `web-dev` — HTML structure, inline CSS, vanilla JavaScript implementation (from `templates/agents/web-dev.md`)
  2. `web-critic` — HTML structure, CSS patterns, vanilla JS code review (from `templates/agents/web-critic.md`)
  3. `web-quality` — ESLint, Stylelint, HTMLHint static analysis (from `templates/agents/web-quality.md`)
- **Rationale:** The project's current Specialists block declares `react-dev` and `react-critic` only. When the planner creates stories for static HTML work (S-01 through S-05), routers cannot distinguish static-web from React. Without static-web specialists, Concepture-Developer will attempt to route to react-dev, which is incorrectly scoped. The stack manifest `templates/stacks/static-web.json` exists and is valid, but the templates are not installed in the project.

#### Recommended Next Actions

1. **Install static-web specialists (project-setup workflow):**
   - Copy `templates/agents/web-dev.md` to `.opencode/agents/web-dev.md`
   - Copy `templates/agents/web-critic.md` to `.opencode/agents/web-critic.md`
   - Copy `templates/agents/web-quality.md` to `.opencode/agents/web-quality.md`
   - Add entries to the Specialists block in `AGENTS.md`:
     ```markdown
     - developer: web-dev | HTML, CSS, vanilla JavaScript implementation
     - critic-source: web-critic | HTML structure, CSS patterns, vanilla JS code review, accessibility
     - quality: web-quality | ESLint, Stylelint, HTMLHint
     ```
   - Remediation owner: `project-bootstrap` (or manual if bootstrap is not available)

2. **Update project routing discipline:**
   - Document in `docs/CONVENTIONS.md` (if not present) that static marketing pages route to static-web specialists, not React specialists.
   - Tag stories S-01 through S-05 with stack hint "static-web" in the PRD description or acceptance criteria if possible, to aid router selection when multiple developer specialists are present.

### Toolkit Health Summary

- **Templates available:** ✓ All three static-web specialists referenced by manifest exist
- **Manifest validation:** ✓ `static-web.json` is valid and references only existing templates
- **Specialist gap location:** Project tier (not toolkit tier) — the toolkit provides the templates; the project has not installed them yet
- **No global agent gaps detected**
- **No global skill gaps detected**
- **No template library gaps detected**

---

**Gap report generated:** 2026-06-03 00:00:00  
**Assessment source:** Planner workflow — PRD readiness assessment  
**Next step:** Run `project-bootstrap` to install static-web specialists, then resume PRD refinement.
