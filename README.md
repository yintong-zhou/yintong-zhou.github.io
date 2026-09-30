<p align="center">
  <img src="assets/img/icon-512.png" alt="Project logo" width="128" height="128">
</p>

# yintong-zhou.github.io

My personal showcase of GitHub projects: a dashboard that lists every project, plus a dedicated page for each repository with its details and a direct link to GitHub.

**Live site:** <https://yintong-zhou.github.io>

[Features](#features) · [Getting started](#getting-started) · [Adding a project](#adding-a-project) · [How it works](#how-it-works) · [Deployment](#deployment)

## Features

- **Dashboard** with the full project list, filtering by language and text search.
- **One page per project**: summary, language, topics, last update, link to the repository, optional live demo link and screenshot.
- **English content**, with UI strings kept in `_data/i18n.yml` so another language can be added later.
- **Light and dark theme**, following the system setting with a manual toggle.
- **Modern motion**: column guides that draw in on first visit, animated list filtering, and smooth page-to-page transitions (cross-document View Transitions, with a plain-navigation fallback). All motion respects `prefers-reduced-motion`.
- **No backend and no client-side secrets**: a static Jekyll site, built by GitHub Pages.

## Getting started

### Prerequisites

- Ruby 3.3 with Bundler (on Windows, RubyInstaller with DevKit)

### Run locally

```bash
bundle install
bundle exec jekyll serve --livereload   # http://localhost:4000
```

`_config.yml` is not hot-reloaded: restart `serve` after editing it.

### Build

```bash
bundle exec jekyll build                # output in _site/
```

For troubleshooting, use `bundle exec jekyll build --trace --verbose` and `bundle exec jekyll doctor`.

## Adding a project

Projects are a Jekyll collection, one file per project. Create `_projects/<name>.md` with the repository data:

```yaml
---
title: my-project
repo: https://github.com/yintong-zhou/my-project
summary: One sentence describing what it does.
language: TypeScript
topics: [cli, tooling]
updated: 2026-09-30        # drives the sort order
demo: https://example.com  # optional
image: /assets/img/my-project.png  # optional screenshot
---
```

Any markdown below the front matter is shown on the project page as a longer description. The project shows up on the dashboard and gets its own page at `/projects/<name>/`.

## How it works

The site uses Liquid, SCSS and a small amount of vanilla JavaScript. It has no plugins beyond the ones GitHub Pages allows (`jekyll-seo-tag`, `jekyll-sitemap`, `jekyll-feed`).

| Path | Purpose |
|---|---|
| `_projects/` | One file per project (Jekyll collection) |
| `_data/i18n.yml` | UI strings, one block per language (English only for now) |
| `_layouts/`, `_includes/` | Page templates and shared components |
| `_sass/` | Styles. Colors and fonts are defined only in `_variables.scss`, derived from `brand-guidelines.md` |
| `assets/js/main.js` | Theme toggle and dashboard filter/search |
| `assets/css/transitions.css` | View Transition rules, kept as plain CSS on purpose |
| `directives/`, `execution/` | Not published: SOPs and deterministic scripts that generate `_data/` (see `AGENT.md`) |

To add a language back, see the multilanguage notes in `CLAUDE.md`.

## Deployment

The site is deployed with GitHub Pages branch deploy: pushing to `main` publishes it. Everything in the repository's published output is public, so never commit secrets or personal data.

> [!TIP]
> If you later need non-whitelisted plugins, Python steps in CI or Tailwind, switch to a GitHub Actions workflow (Settings → Pages → Source: GitHub Actions).
