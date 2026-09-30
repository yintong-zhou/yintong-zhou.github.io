# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Static Jekyll site on GitHub Pages (user site `yintong-zhou.github.io`) that presents the owner's GitHub projects. Content and UI copy are in Italian. `AGENT.md` is the authoritative operating spec (3-layer architecture: `directives/` → orchestration → `execution/*.py`; self-correction loop; Jekyll rules) — read it before non-trivial work. Notable rules from it: never create or overwrite a directive without asking; check `execution/` before writing a script; scripts write to `_data/`, templates read `site.data.*`; everything published is public; add every new service folder to `exclude` in `_config.yml`.

## Commands

Ruby 3.3 (RubyInstaller + DevKit) lives in `C:\Ruby33-x64\bin`; it may not be on `PATH` in an already-open shell (Git Bash: `export PATH="/c/Ruby33-x64/bin:$PATH"`). Gems install into `vendor/bundle` (`.bundle/config`).

```bash
bundle install
bundle exec jekyll serve --livereload    # http://localhost:4000 — restart after editing _config.yml
bundle exec jekyll build                 # -> _site/, must pass with no new warnings
bundle exec jekyll build --trace --verbose
bundle exec jekyll doctor
bundle exec jekyll build --baseurl "/repo"   # only relevant for project sites
```

No test suite or linter. Verification = build passes + pages checked in the browser (AGENT.md also asks for `html-proofer` on `_site/`, not set up yet). A `faraday-retry` warning on build is benign.

## Architecture

**Deploy mode is branch deploy** (`github-pages` gem, whitelisted plugins only: seo-tag, sitemap, feed). No custom plugins or generators; anything needing more means switching to a GitHub Actions workflow (`.github/workflows/pages.yml`, not present).

**Projects are a Jekyll collection**, not `_data`: one file per project in `_projects/<name>.md` (`output: true`, permalink `/projects/:name/`, `layout: project` via `defaults`). Front matter is the repository info: `title`, `repo` (GitHub URL), `summary`, `language`, `topics`, `updated` (date, drives sort order), optional `demo` and `image`. The markdown body, if any, renders as the long description; an empty body is hidden. Adding a project = adding one file; nothing else changes.

Page flow (all read `site.projects | sort: "updated" | reverse`):
- `index.md` → `_layouts/home.html` (hero copy comes from its front matter + 3 most recent rows)
- `dashboard.md` (`/dashboard/`) → `_layouts/dashboard.html` (language chips generated from the data, search, full list)
- `_layouts/project.html` (detail page, prev/next pager computed in Liquid)
- `_includes/project-row.html` is shared by home and dashboard; `date-it.html` formats dates using `_data/it.yml` (Liquid's `date` only outputs English month names).

**Styling** — `brand-guidelines.md` is mapped to `_sass/_variables.scss` (the only place with hex values and font names). `_theme.scss` turns them into CSS custom properties for light/dark (system preference, overridden by `html[data-theme]`); components use only `var(--…)`. Accent color is for calls to action only (`.btn`). Brand constraints: one heading weight, 2–4px radius, 8px spacing scale, 8-column grid, no texture/noise. `assets/css/main.scss` imports the partials.

**Two Sass/CSS gotchas**: GitHub Pages compiles Sass with libsass (`sassc`), so no `@use`, no `color-mix()`, avoid `min()`/`max()` with mixed units, and avoid `&__x` after a descendant combinator. View-transition rules live in `assets/css/transitions.css` (plain CSS, no front matter) for that reason.

**Motion** — the 8 column guides (`_includes/grid-lines.html`) are the main decorative device. `_includes/head.html` has an inline script that restores the saved theme and adds `html.intro` only on the first page of a session; `_sass/_motion.scss` animates only under `html.intro` and `prefers-reduced-motion: no-preference`. Page-to-page motion is cross-document View Transitions: each project title gets `view-transition-name: project-<slug>` inline, both in the row and on the detail page, so it morphs between them (names must stay unique per page). `assets/js/main.js` handles the theme toggle and the dashboard filter/search (FLIP animation via Web Animations API); it must never use `innerHTML` on external data.

## Conventions specific to this repo

- Use `relative_url` for every link and asset; never hand-write `/assets/...`.
- Files with `---` front matter are processed by Jekyll; `assets/css/main.scss` needs the empty `---\n---`.
- Git identity for this repo is `Yintong Zhou <zhouyintong96@gmail.com>` (set in local config); commit messages end with the Co-Authored-By trailer when Claude authors them.
