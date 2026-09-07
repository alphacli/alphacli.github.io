# alphacli.github.io

Marketing site + docs for **Alphacode** — the agentic CLI for your terminal.

- Live site: <https://alphacli.github.io/>
- MCP explainer: <https://alphacli.github.io/mcp.html>
- Docs (rendered README): <https://alphacli.github.io/docs/>
- Product repo: <https://github.com/dragonked2/alphacode>

This repo only contains static site assets. CLI source lives in
`dragonked2/alphacode`.

## Site files

- `index.html` — landing page
- `mcp.html`, `mcp.css`, `mcp.js` — MCP explainer (Burp walkthrough, architecture, tools table, FAQ)
- `styles.css`, `script.js` — design + behavior
- `docs/index.html` — full README, rendered with sidebar TOC
- `404.html` — fallback for Pages
- `robots.txt`, `sitemap.xml`, `.well-known/security.txt` — SEO + disclosure
- `LICENSE` — MIT (inherited from Alphacode)
- `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`
- `.github/` — Dependabot, issue + PR templates

## Local preview

```bash
python -m http.server 8080
# or
npx serve .
```

Then open <http://localhost:8080>.

## Deploy

Push to `main`. GitHub Pages deploys automatically.
