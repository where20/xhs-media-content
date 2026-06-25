# Project Stability Optimization Design

## Goal

Make the current static XHS media content workspace safer to use and easier to continue editing, without redesigning the product or overwriting existing content drafts. This pass focuses on fixes that are immediately executable: broken links, navigation consistency, mobile navigation behavior, and basic interaction reliability.

## Current Context

The project is a dependency-free static site built from top-level HTML files, shared CSS in `assets/css/main.css`, shared JavaScript in `assets/js/app.js`, and reusable publishing assets in `content-kit/`.

The working tree already contains uncommitted edits across core pages, including:

- Mobile hamburger navigation styles and behavior.
- Navigation updates across most pages.
- A larger `daily.html` publishing-workbench enhancement.
- A new `AGENTS.md` contributor guide.

Those existing edits are treated as in-scope user work and should be preserved.

## Scope

This optimization pass will:

1. Fix confirmed broken navigation, especially `D2.html` linking to missing `D3.html`.
2. Add `.superpowers/` to `.gitignore` so visual-brainstorming artifacts are not committed.
3. Normalize core navigation across `index.html`, `strategy.html`, `playbook.html`, `prompts.html`, `calendar.html`, `xhs.html`, `D1.html`, `D2.html`, and `daily.html`.
4. Preserve and verify the existing mobile hamburger menu pattern.
5. Smoke-test key interactions: copy buttons, calendar modal, day completion persistence, and daily page state persistence.
6. Produce a concise follow-up list for larger content-workflow or visual-productization improvements.

This pass will not introduce a package manager, build system, framework, or broad visual redesign.

## Design

### Navigation

Use one consistent global navigation set:

- `主页` → `index.html`
- `策略方案` → `strategy.html`
- `30天起号` → `playbook.html`
- `提示词库` → `prompts.html`
- `日历` → `calendar.html`
- `前端转AI电商` → `xhs.html`

Each page should mark the most relevant section active. Day-specific pages can keep `30天起号` active unless a future dedicated day index is added.

### Mobile Menu

Keep the current `.nav-toggle` + `.nav-links.is-open` implementation. Verify these behaviors:

- Button is visible under the mobile breakpoint.
- `aria-expanded` changes between `false` and `true`.
- Link clicks close the menu.
- Outside clicks and `Escape` close the menu.
- Resizing back to desktop closes the mobile menu state.

### Broken Links

Run a lightweight static link check over top-level HTML files. Treat missing static `href` and `src` targets as blockers unless the reference is intentionally generated at runtime. Replace or remove `D2.html` → `D3.html` because `D3.html` does not exist.

### Interaction Reliability

No major JavaScript refactor is required for this pass. Verify current shared and inline scripts instead:

- Prompt copy buttons.
- D1/D2/daily copy actions.
- Calendar modal open/close and completion toggle.
- `localStorage` persistence for calendar and daily state.

Only make targeted fixes where verification shows a user-visible failure.

## Verification Plan

1. Run `git diff --stat` before editing to understand the existing dirty tree.
2. Run a static link checker for local `href` and `src` references.
3. Serve the project with `python3 -m http.server 8080`.
4. Browser-check desktop and mobile views for:
   - `index.html`
   - `calendar.html`
   - `xhs.html`
   - `D1.html`
   - `D2.html`
   - `daily.html`
5. Re-run link checks after fixes.
6. Report changed files and remaining recommended follow-ups.

## Risks and Constraints

- The working tree is already dirty; implementation must avoid reverting unrelated user edits.
- `daily.html` is large and contains substantial inline behavior, so this pass should not restructure it unless required for a visible bug.
- Browser clipboard APIs vary by context; fallback behavior should be verified through the served localhost page rather than only direct file opening.

## Out of Scope Follow-ups

- Product-level visual redesign.
- Converting daily content to a fully centralized data source.
- Adding automated tests, npm scripts, or a build pipeline.
- Creating `D3.html` content unless explicitly requested.
