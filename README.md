# alphacli.github.io

Marketing site + docs for **Alphacode** — the agentic CLI for your terminal.

- Live site: <https://alphacli.github.io/>
- MCP explainer: <https://alphacli.github.io/mcp/>
- Docs (rendered README): <https://alphacli.github.io/docs/>
- Product repo: <https://github.com/dragonked2/alphacode>

This repo only contains static site assets. CLI source lives in
`dragonked2/alphacode`.

## Site files

- `index.html` — landing page
- `mcp/index.html`, `mcp.css`, `mcp.js` — MCP explainer (Burp walkthrough, architecture, tools table, FAQ)
- `styles.css`, `script.js` — design + behavior
- `docs/index.html` — full README, rendered with sidebar TOC
- `404.html` — fallback for Pages
- `robots.txt`, `sitemap.xml`, `.well-known/security.txt` — SEO + disclosure
- `community.css`, `community.js` — Discord popup, floating join pill, community buttons
- `ui.css`, `ui.js` — modern UX layer (count-up stats, animated FAQ/tabs, press states)
- `ux.css`, `ux.js` — final UX layer (collapsible docs TOC, heading anchors, scroll-spy, language menu, hero fold fix, light-mode contrast); bundled last by optimize.py
- `security.js`, `_headers` — clickjacking fallback + full HTTP header set (see `SECURITY-HARDENING.md`)
- `tools/harden.py` — adds CSP meta, completes OG/Twitter tags
- `tools/fixes.py` — targeted content/UX/SEO fixes (idempotent)
- `tools/seo_boost.py` — **run after optimize.py**: regenerates robots.txt, sitemap.xml (hreflang + image), llms-full.txt, localized JSON-LD, non-blocking fonts
- `tools/indexnow.py` — run after deploy to push every URL to IndexNow engines
- `tools/sync_version.py` — stamps `site.config.json` version everywhere (`--fetch`, `--check`)
- `tools/optimize.py` — bundles CSS/JS: bundles CSS/JS into `assets/site.css`, `assets/site.js` (+ `docs.css`, `mcp.css`), non-blocking fonts, `init.js`
- `assets/`, `init.js` — generated output; edit the source `*.css` / `*.js` files, then re-run the build
- `LICENSE` — MIT (inherited from Alphacode)
- `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`
- `.github/` — Dependabot, issue + PR templates

## Build order

```bash
python tools/sync_version.py --fetch      # optional: pull the latest release tag from GitHub into site.config.json
for s in build_i18n build_home polish harden fixes sync_version optimize seo_boost sync_version; do python tools/$s.py; done
python tools/sync_version.py --check      # CI guard: exits 1 if any page disagrees with site.config.json
# after deploy: python tools/indexnow.py  # pings Bing/Yandex/Seznam/Naver
```

`sync_version.py` runs **twice on purpose**: `seo_boost.py` regenerates the JSON-LD and drops `softwareVersion`, so the final stamp must come last.
Every step is idempotent - re-running the whole chain produces byte-identical output.

## Keeping the site in sync with the GitHub repo

`site.config.json` is the single source of truth for the release version. `tools/sync_version.py` stamps it into the hero pill
on all 11 locales, the MCP page, docs install examples, `llms-full.txt` and the JSON-LD (`softwareVersion`, `dateModified`).
At runtime `script.js` upgrades the pill and star count from the GitHub API with a 6 h localStorage cache, so shared-IP
visitors never exhaust the 60 req/h anonymous limit.

`.github/workflows/sync-site.yml` does this automatically (daily, manually, on PRs as a guard, and on a `repository_dispatch`
of type `alphacode-release`). To make releases instant, add this step to the **alphacode** repo's release workflow:

```yaml
- run: gh api repos/alphacli/alphacli.github.io/dispatches -f event_type=alphacode-release
  env: { GH_TOKEN: "${{ secrets.SITE_DISPATCH_TOKEN }}" }   # PAT with repo scope on the site repo
```
```

## Local preview

```bash
python -m http.server 8080
# or
npx serve .
```

Then open <http://localhost:8080>.

## Deploy

Push to `main`. GitHub Pages deploys automatically.
