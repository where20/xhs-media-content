# Repository Guidelines

## Project Structure & Module Organization

This repository is a static XHS media content workspace with no build system. Top-level HTML files are user-facing pages: `index.html`, `strategy.html`, `playbook.html`, `prompts.html`, `calendar.html`, `daily.html`, `D1.html`, `D2.html`, and `xhs.html`. Shared styling lives in `assets/css/main.css`; shared browser behavior lives in `assets/js/app.js`. Image assets are under `assets/`. Reusable source content, CSV calendars, prompt libraries, and note images live in `content-kit/`. Original imported source documents remain at the project root as `.md` and `.html` references.

## Build, Test, and Development Commands

There is no install or compile step.

- `open index.html` opens the site directly on macOS.
- `python3 -m http.server 8080` serves the repository at `http://localhost:8080`.
- `npx serve .` is an optional Node-based local server if Node is available.
- `rg "D3.html|TODO|FIXME" .` is useful for quick broken-reference or task-marker checks.

Prefer serving locally when testing clipboard, navigation, and `localStorage` behavior.

## Coding Style & Naming Conventions

Use plain HTML5, CSS variables, Grid/Flex, and vanilla JavaScript. Keep indentation consistent with existing files, generally two spaces in HTML/CSS/JS blocks. Reuse existing classes such as `prompt-card`, `search-item`, and `cal-day` before adding new patterns. Name new day pages as `D<number>.html` and related image folders as `content-kit/D<number>-笔记/`.

## Testing Guidelines

No automated test framework is currently configured. For each change, manually verify affected pages in a browser, especially navigation links, copy buttons, calendar modal behavior, progress persistence, and mobile layout. When editing `content-kit/30天日历.csv` or day pages, cross-check that links and labels match the visible site.

## Commit & Pull Request Guidelines

Recent history uses conventional-style commits such as `feat: 初始化项目 - 自媒体起号工作台`. Continue with short prefixes like `feat:`, `fix:`, `docs:`, or `chore:` followed by a concise Chinese or English summary. Pull requests should include a short change summary, pages touched, manual verification steps, and screenshots for visual or layout changes.

## Agent-Specific Instructions

Keep this repository dependency-light. Do not add package managers, generated build artifacts, or external frameworks unless explicitly requested. Preserve user content in Chinese and avoid broad rewrites when a focused edit solves the issue.
