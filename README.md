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
- `security.js`, `_headers` — clickjacking fallback + full HTTP header set (see `SECURITY-HARDENING.md`)
- `tools/harden.py` — adds CSP meta, completes OG/Twitter tags
- `tools/fixes.py` — targeted content/UX/SEO fixes (idempotent)
- `tools/optimize.py` — **run last**: bundles CSS/JS into `assets/site.css`, `assets/site.js` (+ `docs.css`, `mcp.css`), non-blocking fonts, `init.js`
- `assets/`, `init.js` — generated output; edit the source `*.css` / `*.js` files, then re-run the build
- `LICENSE` — MIT (inherited from Alphacode)
- `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`
- `.github/` — Dependabot, issue + PR templates

## Build order

```bash
python tools/build_i18n.py && python tools/build_home.py && python tools/polish.py
python tools/harden.py && python tools/fixes.py && python tools/optimize.py
python tools/build_sitemap.py   # then re-run fixes.py to restamp lastmod if needed
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
