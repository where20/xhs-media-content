# Publishable Workbench Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate the current contributor guide, unified navigation/mobile menu, and daily publishing workbench drafts into a verified publishable static site state.

**Architecture:** Keep the dependency-free static-site architecture. Treat the current uncommitted edits as intentional drafts, verify them, make only defect fixes found during verification, and split commits by responsibility.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, JSON content data, browser `localStorage`, Python static server for smoke verification.

---

## File Structure

- Create/commit: `AGENTS.md` — contributor guide.
- Modify/commit: `index.html`, `strategy.html`, `playbook.html`, `prompts.html`, `calendar.html`, `xhs.html`, `D1.html`, `D2.html`, `daily.html`, `assets/css/main.css`, `assets/js/app.js` — unified navigation and mobile menu.
- Modify/commit: `daily.html`, `content-kit/daily-content.json`, `content-kit/README.md`, `content-kit/30天日历-前端转AI电商.md`, `content-kit/冷启动SOP.md` — daily workbench and cold-start SOP.

## Task 1: Commit Contributor Guide

**Files:**
- Create: `AGENTS.md`

- [ ] **Step 1: Review the guide content**

Run:

```bash
sed -n '1,220p' AGENTS.md
```

Expected: title is `Repository Guidelines`; content describes this static repository accurately.

- [ ] **Step 2: Commit only `AGENTS.md`**

Run:

```bash
git add AGENTS.md
git commit -m "docs: add repository contributor guide"
```

Expected: commit contains only `AGENTS.md`.

## Task 2: Verify and Commit Navigation/Mobile Menu

**Files:**
- Modify: `index.html`
- Modify: `strategy.html`
- Modify: `playbook.html`
- Modify: `prompts.html`
- Modify: `calendar.html`
- Modify: `xhs.html`
- Modify: `D1.html`
- Modify: `D2.html`
- Modify: `daily.html`
- Modify: `assets/css/main.css`
- Modify: `assets/js/app.js`

- [ ] **Step 1: Verify each page has the unified nav labels**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const pages = ['index.html','strategy.html','playbook.html','prompts.html','calendar.html','xhs.html','D1.html','D2.html','daily.html'];
const required = ['主页','策略方案','30天起号','提示词库','日历','前端转AI电商'];
const failures = [];
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  for (const label of required) {
    if (!html.includes(`>${label}<`)) failures.push(`${page}: missing ${label}`);
  }
  if (!html.includes('class="nav-toggle"')) failures.push(`${page}: missing nav-toggle`);
}
console.log(JSON.stringify(failures, null, 2));
process.exit(failures.length ? 1 : 0);
NODE
```

Expected output: `[]`

- [ ] **Step 2: Verify shared script syntax**

Run:

```bash
node --check assets/js/app.js
```

Expected: no output and exit code `0`.

- [ ] **Step 3: Browser-check mobile menu**

Open `http://127.0.0.1:8080/index.html` at mobile viewport. Click `.nav-toggle`.

Expected:

```text
aria-expanded = "true"
.nav-links has class "is-open"
clicking a nav link closes the drawer
```

- [ ] **Step 4: Commit navigation/mobile files**

Run:

```bash
git add index.html strategy.html playbook.html prompts.html calendar.html xhs.html D1.html D2.html daily.html assets/css/main.css assets/js/app.js
git commit -m "feat: consolidate navigation and mobile menu"
```

Expected: commit contains navigation/mobile changes only.

## Task 3: Verify and Commit Daily Workbench + Content Kit

**Files:**
- Modify: `daily.html`
- Modify: `content-kit/daily-content.json`
- Modify: `content-kit/README.md`
- Modify: `content-kit/30天日历-前端转AI电商.md`
- Create: `content-kit/冷启动SOP.md`

- [ ] **Step 1: Verify JSON parses and exposes v1.1 data**

Run:

```bash
node - <<'NODE'
const d = require('./content-kit/daily-content.json');
const failures = [];
if (d.version !== '1.1') failures.push('version is not 1.1');
for (const day of ['1','2','3']) {
  if (!d.days[day]) failures.push(`missing day ${day}`);
}
if (!Array.isArray(d.days['1'].preSops)) failures.push('D1 missing preSops');
if (!Array.isArray(d.days['2'].kpiTargets)) failures.push('D2 missing kpiTargets');
if (!d.days['3'].selfCheck) failures.push('D3 missing selfCheck placeholder');
console.log(JSON.stringify(failures, null, 2));
process.exit(failures.length ? 1 : 0);
NODE
```

Expected output: `[]`

- [ ] **Step 2: Verify SOP references exist**

Run:

```bash
test -f content-kit/冷启动SOP.md
rg -n "冷启动SOP|6h 曝光|selfCheck" daily.html content-kit/README.md content-kit/30天日历-前端转AI电商.md content-kit/冷启动SOP.md
```

Expected: matches appear in all intended files.

- [ ] **Step 3: Static local link check**

Run:

```bash
node - <<'NODE'
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));
const missing = [];
for (const file of htmlFiles) {
  const s = fs.readFileSync(file, 'utf8');
  for (const m of s.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const raw = m[1];
    if (/^(https?:|mailto:|tel:|#|javascript:)/.test(raw)) continue;
    if (raw.includes('${')) continue;
    const clean = raw.split('#')[0].split('?')[0];
    if (!clean) continue;
    if (!fs.existsSync(path.join(root, decodeURIComponent(clean)))) {
      missing.push({ file, raw });
    }
  }
}
console.log(JSON.stringify(missing, null, 2));
process.exit(missing.length ? 1 : 0);
NODE
```

Expected output: `[]`

- [ ] **Step 4: Browser-check daily pages**

Open these URLs:

```text
http://127.0.0.1:8080/daily.html?day=1
http://127.0.0.1:8080/daily.html?day=2
http://127.0.0.1:8080/daily.html?day=3
```

Expected:

```text
D1/D2 show enriched SOP/self-check sections.
D3 renders draft placeholders without JS errors.
Copy buttons show success feedback.
Browser console has no error logs.
```

- [ ] **Step 5: Commit daily workflow files**

Run:

```bash
git add daily.html content-kit/daily-content.json content-kit/README.md content-kit/30天日历-前端转AI电商.md content-kit/冷启动SOP.md
git commit -m "feat: enhance daily publishing workbench"
```

Expected: commit contains daily workbench and content-kit changes only.

## Task 4: Final Verification

**Files:**
- Verify: all project changes

- [ ] **Step 1: Run syntax, JSON, and link checks**

Run:

```bash
node --check assets/js/app.js
node -e "const d=require('./content-kit/daily-content.json'); console.log(d.version, Object.keys(d.days).join(','))"
node - <<'NODE'
const fs = require('fs');
const path = require('path');
const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));
const missing = [];
for (const file of htmlFiles) {
  const s = fs.readFileSync(file, 'utf8');
  for (const m of s.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const raw = m[1];
    if (/^(https?:|mailto:|tel:|#|javascript:)/.test(raw)) continue;
    if (raw.includes('${')) continue;
    const clean = raw.split('#')[0].split('?')[0];
    if (!clean) continue;
    if (!fs.existsSync(path.join(root, decodeURIComponent(clean)))) missing.push({ file, raw });
  }
}
console.log(JSON.stringify(missing, null, 2));
process.exit(missing.length ? 1 : 0);
NODE
```

Expected:

```text
assets/js/app.js syntax check exits 0
JSON command prints: 1.1 1,2,3
link checker prints []
```

- [ ] **Step 2: Confirm git status**

Run:

```bash
git status --short
```

Expected: no intended second-round files remain uncommitted.
