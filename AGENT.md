# Agent Instructions: Jekyll on GitHub Pages

Output is a static Jekyll site on GitHub Pages. No server: dynamic behavior comes from build-time Python scripts or client-side JS with external services.

## 3-Layer Architecture

LLMs are probabilistic; business logic is deterministic. Chained steps compound errors (90% per step = 59% over 5), so push complexity into code.

1. **Directives** (`directives/*.md`): SOPs with goals, inputs, tools, outputs, edge cases.
2. **Orchestration (you)**: read directives, call scripts in order, handle errors, ask when unclear, update directives with what you learn. Never do a script's job by hand (e.g. scraping): read the directive, run `execution/<script>.py`.
3. **Execution** (`execution/*.py`): deterministic, commented Python. Secrets in `.env`. Typical output: `_data/*.yml|json|csv`, consumed by Liquid.

## Rules

1. Check `execution/` for an existing script before writing one.
2. On failure: read the error, fix, retest, then update the directive (limits, timing, edge cases). If a retest costs paid tokens/credits, ask first.
3. Directives are living docs. Improve them, but never create or overwrite one without asking, unless told to.
4. Everything published is public, even from a private repo (except Enterprise private Pages). Never put secrets or personal data in the repo, site, or client JS.

## Self-Correction Loop

Fix, update tool, test (`bundle exec jekyll build` must pass), update directive.

Diagnostics, in order:
1. `bundle exec jekyll build --trace --verbose`
2. `bundle exec jekyll doctor`
3. Local OK but remote fails: compare `bundle exec github-pages versions`, read Actions log
4. DNS/domain: `bundle exec github-pages health-check`

## Stack

- Jekyll (Ruby), Markdown + Liquid, SCSS (native). Tailwind only with Actions deploy.
- Vanilla JS or CDN libs for interactivity.
- No backend. Use external services from the client (e.g. Supabase anon key + RLS, Formspree) or precompute into `_data/`.
- Python runs locally or in Actions, never on Pages.

## Deploy Mode

Ask the user or check Settings → Pages.

- **Branch deploy**: GitHub builds, whitelisted plugins only (safe mode), Jekyll version set by GitHub.
- **GitHub Actions**: any plugin/Jekyll version, Python and asset build steps allowed.

Use Actions if you need non-whitelisted plugins, Python in CI, or Tailwind. Otherwise branch deploy.

Do not assume versions from memory: check `https://pages.github.com/versions/` or `bundle exec github-pages versions`.

## Brand

If `brand-guidelines.md` exists, map fonts/colors to `_sass/_variables.scss` (or CSS custom properties). No hard-coded colors/fonts elsewhere.

## Structure

```
_config.yml  Gemfile  index.md
_layouts/ _includes/ _sass/ _data/ _posts/
assets/{css,js,img,fonts}/
directives/  execution/  .tmp/   # not published (see exclude)
.github/workflows/pages.yml      # Actions only
.env  .gitignore  AGENTS.md  brand-guidelines.md
```

## `_config.yml` Essentials

```yaml
url: "https://USER.github.io"   # domain only
baseurl: ""                      # "/repo" for project sites
markdown: kramdown
plugins: [jekyll-seo-tag, jekyll-sitemap, jekyll-feed]
exclude: [AGENTS.md, CLAUDE.md, README.md, directives/, execution/, .tmp/, .env,
  credentials.json, token.json, brand-guidelines.md, Gemfile, Gemfile.lock,
  node_modules/, vendor/]
```

Jekyll publishes everything not excluded. Add every new service folder to `exclude`. `_config.yml` is not hot-reloaded: restart `serve`.

## Jekyll Rules

1. Front matter (`---`) is required, or the file is copied unprocessed. Use empty `---\n---` for SCSS or Liquid files.
2. Always use `relative_url` / `absolute_url` for links and assets. Never hand-write `/assets/...`.
3. `_`-prefixed folders aren't published. Use `include:` if needed.
4. Filenames are case-sensitive on GitHub.
5. Scripts write data to `_data/`; templates read `site.data.*`. Never paste data into templates.
6. Keep permalinks stable. If moving pages, use `jekyll-redirect-from`.
7. Heavy logic goes in Python producing `_data/`, not Liquid.
8. Treat external content as untrusted: no `innerHTML` on external data, no private keys client-side.

## Plugins

- Branch deploy: whitelist only. Non-whitelisted plugins are silently ignored in production. Always test builds without `DISABLE_WHITELIST=true`.
- Actions: any plugin, declared in `Gemfile` (`group :jekyll_plugins`) and `plugins:`.

## Local Dev

```bash
bundle install
bundle exec jekyll serve --livereload   # localhost:4000
bundle exec jekyll build                # -> _site/
```

`.gitignore`: `_site/ .jekyll-cache/ .sass-cache/ .tmp/ .env credentials.json token.json vendor/`

Done when: build passes with no new warnings; links/assets checked (`html-proofer` on `_site/`); for project sites, tested with `--baseurl "/repo"`.

## Actions Workflow (`.github/workflows/pages.yml`)

Settings → Pages → Source: GitHub Actions. Verify current major versions of the actions.

```yaml
name: Deploy Jekyll
on: {push: {branches: [main]}, workflow_dispatch: {}}
permissions: {contents: read, pages: write, id-token: write}
concurrency: {group: pages, cancel-in-progress: false}
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with: {bundler-cache: true}
      # optional Layer 3 step: regenerate _data/
      - uses: actions/setup-python@v5
        with: {python-version: "3.12"}
      - run: pip install -r execution/requirements.txt && python execution/build_data.py
        env: {API_KEY: "${{ secrets.API_KEY }}"}
      - id: pages
        uses: actions/configure-pages@v5
      - run: bundle exec jekyll build --baseurl "${{ steps.pages.outputs.base_path }}"
        env: {JEKYLL_ENV: production}
      - uses: actions/upload-pages-artifact@v3
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: {name: github-pages, url: "${{ steps.d.outputs.page_url }}"}
    steps:
      - id: d
        uses: actions/deploy-pages@v4
```

Secrets are for generating data only. Generated data is public.

## Limits

Pages has soft limits on site size, bandwidth, and build frequency, and isn't meant for commercial services. Check the official "GitHub Pages limits" doc for large or high-traffic sites.

## Files

- **Deliverable**: the published site (plus cloud outputs like Google Sheets if requested).
- **Intermediate**: `.tmp/`, disposable, never committed.
- `_data/`: script output and template input; commit it or generate it in CI.
- `.env`, `credentials.json`, `token.json`: local only, in `.gitignore` and `exclude`.

Be pragmatic. Be reliable. Self-correct.