# Publishable Workbench Consolidation Design

## Goal

Turn the current uncommitted navigation, mobile menu, daily workbench, and cold-start SOP drafts into a stable publishable version. The work should preserve existing content, avoid broad redesign, and split commits by responsibility so future changes remain easy to review.

## Current Context

The repository is a static HTML/CSS/JS site with shared styles in `assets/css/main.css`, shared scripts in `assets/js/app.js`, and content operations files under `content-kit/`.

The current working tree includes three meaningful draft groups:

1. Global navigation and mobile hamburger menu updates across top-level pages.
2. `daily.html` expansion into a daily publishing workbench with SOP blocks, self-check, 6h exposure check, JSON export, and richer daily state.
3. Content-kit updates, including `daily-content.json` v1.1 and a new `冷启动SOP.md`.

`AGENTS.md` also exists as a generated contributor guide and should be committed separately as documentation.

## Scope

This consolidation pass will:

- Keep and verify the unified global navigation pattern.
- Keep and verify the mobile hamburger menu behavior.
- Keep and verify the enhanced `daily.html` workbench.
- Keep and verify `content-kit/daily-content.json` v1.1 fields used by `daily.html`.
- Add `content-kit/冷启动SOP.md` and its README/calendar references.
- Commit `AGENTS.md` as repository contributor documentation.
- Split commits into understandable groups: contributor docs, navigation/mobile, daily workflow/content kit.

This pass will not introduce a framework, package manager, build pipeline, or major visual redesign.

## Design

### Contributor Guide

Commit `AGENTS.md` as-is unless a quick review finds repository-inaccurate guidance. It documents static-site structure, local serving commands, manual testing expectations, and contribution conventions.

### Navigation and Mobile Menu

Use one consistent navigation set:

- `主页` → `index.html`
- `策略方案` → `strategy.html`
- `30天起号` → `playbook.html`
- `提示词库` → `prompts.html`
- `日历` → `calendar.html`
- `前端转AI电商` → `xhs.html`

The `前端转AI电商` link should use `nav-featured` so it is visually distinct but still participates in active-state styling. Day-specific pages should keep `30天起号` active.

Mobile behavior stays in `assets/js/app.js` and `assets/css/main.css`:

- `.nav-toggle` appears under the mobile breakpoint.
- Clicking it toggles `.nav-links.is-open`, `body.nav-open`, and `aria-expanded`.
- Clicking a nav link closes the drawer.
- Outside click, `Escape`, and desktop resize close the drawer.

### Daily Workbench

`daily.html` becomes the operational page for `daily.html?day=N`. It should continue to render from `content-kit/daily-content.json`, with graceful placeholders for missing optional fields.

Supported optional fields:

- `preSops`
- `postSops`
- `kpiTargets`
- `dataRecap`
- `selfCheck`

The page should preserve existing copy buttons, day navigation, self-check controls, 6h exposure check, and JSON export/clear controls.

### Content Kit

Keep `content-kit/daily-content.json` at version `1.1` with schema notes for optional fields. Keep D1/D2 enriched data and D3 draft data.

Add `content-kit/冷启动SOP.md` as the cold-start operating manual. Link it from:

- `content-kit/README.md`
- `content-kit/30天日历-前端转AI电商.md`
- `daily.html` where relevant SOP detail links already point to it

## Verification Plan

Run fresh checks after implementation:

1. `node --check assets/js/app.js`
2. Parse `content-kit/daily-content.json` with Node.
3. Static local link check for all top-level HTML files, ignoring runtime template strings.
4. Serve locally with `python3 -m http.server 8080`.
5. Browser smoke-test:
   - `index.html`
   - `calendar.html`
   - `xhs.html`
   - `D1.html`
   - `D2.html`
   - `daily.html?day=1`
   - `daily.html?day=2`
   - `daily.html?day=3`
6. Mobile smoke-test:
   - hamburger opens
   - link click closes drawer
   - desktop resize clears mobile state
7. Daily workbench smoke-test:
   - D1/D2 render enriched SOP sections
   - D3 renders draft placeholders without errors
   - copy buttons show success feedback
   - self-check and 6h exposure widgets render
8. Confirm browser console has no error logs on checked pages.

## Risks and Constraints

- `daily.html` is large and inline-script heavy; this pass should stabilize it, not split it.
- Existing uncommitted edits are treated as intentional draft work unless verification proves otherwise.
- Clipboard behavior depends on browser security context; verify through localhost.
- Local state in `localStorage` can affect visual results, so checks should focus on render and interaction behavior rather than exact persisted values.

## Commit Plan

1. `docs: add repository contributor guide`
   - `AGENTS.md`
2. `feat: consolidate navigation and mobile menu`
   - HTML navigation updates
   - `assets/css/main.css`
   - `assets/js/app.js`
3. `feat: enhance daily publishing workbench`
   - `daily.html`
   - `content-kit/daily-content.json`
   - `content-kit/冷启动SOP.md`
   - related content-kit references

If verification uncovers defects, fix them in the relevant commit group before committing.
