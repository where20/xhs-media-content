# Project Stability Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize the current static XHS media content workspace by fixing confirmed broken links, preserving local brainstorming artifacts, and verifying core navigation and interactions.

**Architecture:** Keep the project as a dependency-free static site. Make only targeted edits to existing HTML, CSS, JS, and ignore configuration; do not introduce a build system or framework.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, browser `localStorage`, Python static server for manual verification.

---

## File Structure

- Modify: `.gitignore` — ignore `.superpowers/` visual companion artifacts.
- Modify: `D2.html` — replace the broken `D3.html` link with the existing `daily.html?day=3` preview route.
- Modify: `assets/js/app.js` — add fallback copy behavior to the calendar modal copy button.
- Verify: top-level `.html` pages and `content-kit/daily-content.json`.

## Task 1: Ignore Visual Companion Artifacts

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add `.superpowers/` to ignored temporary files**

Add this block to `.gitignore`:

```gitignore
# Superpowers visual companion artifacts
.superpowers/
```

- [ ] **Step 2: Verify `.superpowers/` is no longer listed as untracked**

Run: `git status --short`

Expected: no `?? .superpowers/` line.

## Task 2: Fix the Confirmed Broken D2 → D3 Link

**Files:**
- Modify: `D2.html`

- [ ] **Step 1: Replace the missing static page link**

Change:

```html
<a class="btn btn-primary" href="D3.html" style="margin-left:8px;">Day 3 草稿（生成中）→</a>
```

To:

```html
<a class="btn btn-primary" href="daily.html?day=3" style="margin-left:8px;">Day 3 预览（生成中）→</a>
```

- [ ] **Step 2: Verify the target exists in daily content data**

Run:

```bash
node -e "const d=require('./content-kit/daily-content.json'); if(!d.days['3']) process.exit(1); console.log(d.days['3'].title)"
```

Expected output includes: `D3 · W2 第1天 · 商品素材自动化`

## Task 3: Add Calendar Modal Copy Fallback

**Files:**
- Modify: `assets/js/app.js`

- [ ] **Step 1: Reuse the existing `fallbackCopy` helper for modal copy**

Replace the `modalCopy` click handler body:

```js
const text = title + '\n\n' + content + (tip ? '\n\n【封面】' + tip : '');
const btn = document.getElementById('modalCopy');
if (navigator.clipboard) {
  navigator.clipboard.writeText(text).then(() => {
    btn.innerText = '✓ 已复制'; setTimeout(() => btn.innerText = '复制文案', 1500);
  });
}
```

With:

```js
const text = title + '\n\n' + content + (tip ? '\n\n【封面】' + tip : '');
const btn = document.getElementById('modalCopy');
const done = () => {
  btn.innerText = '✓ 已复制';
  setTimeout(() => btn.innerText = '复制文案', 1500);
};
if (navigator.clipboard && window.isSecureContext) {
  navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
} else {
  fallbackCopy(text, done);
}
```

- [ ] **Step 2: Verify syntax**

Run: `node --check assets/js/app.js`

Expected: no output and exit code `0`.

## Task 4: Static Link Verification

**Files:**
- Verify: top-level `.html`

- [ ] **Step 1: Run local static reference check**

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

## Task 5: Browser Smoke Verification

**Files:**
- Verify: `index.html`, `calendar.html`, `xhs.html`, `D1.html`, `D2.html`, `daily.html`

- [ ] **Step 1: Serve the static site**

Run: `python3 -m http.server 8080`

Expected: local site available at `http://localhost:8080`.

- [ ] **Step 2: Verify desktop page basics**

Open these URLs and check that each has one global nav and a visible `h1`:

```text
http://localhost:8080/index.html
http://localhost:8080/calendar.html
http://localhost:8080/xhs.html
http://localhost:8080/D1.html
http://localhost:8080/D2.html
http://localhost:8080/daily.html?day=3
```

- [ ] **Step 3: Verify mobile navigation**

At a mobile viewport width, open `index.html`, click the hamburger button, and confirm:

```text
aria-expanded becomes "true"
.nav-links has class "is-open"
clicking a nav link closes the drawer
```

- [ ] **Step 4: Verify key interactions**

Check:

```text
calendar.html: click a day opens the modal; modal copy shows "✓ 已复制"; double click toggles completion.
D2.html: Day 3 button opens daily.html?day=3.
daily.html?day=3: page renders D3 content and previous/next links remain usable.
```

## Task 6: Final Review and Commit

**Files:**
- Review: `.gitignore`, `D2.html`, `assets/js/app.js`

- [ ] **Step 1: Review diff**

Run: `git diff -- .gitignore D2.html assets/js/app.js`

Expected: only the three targeted changes from this plan.

- [ ] **Step 2: Commit only targeted files**

Run:

```bash
git add .gitignore D2.html assets/js/app.js
git commit -m "fix: stabilize navigation and copy behavior"
```

Expected: commit contains only targeted stability fixes.
