# alphacli.github.io

Static marketing site for **Alphacode** — the agentic CLI for your terminal.

This repo is served at <https://alphacli.github.io>.

## Files

- `index.html` — markup, social meta, JSON-LD, sitemap, robots
- `styles.css` — design tokens, layout, components, motion-safe animations
- `script.js` — install tabs, copy-to-clipboard, animated terminal, swarm DAG, benchmark bars, scroll reveal
- `404.html` — graceful fallback for GitHub Pages
- `robots.txt` — allow all
- `sitemap.xml` — single-page sitemap
- `.well-known/security.txt` — security disclosure contact
- `LICENSE` — MIT (inherited from Alphacode)
- `SECURITY.md` — vulnerability disclosure policy
- `CODE_OF_CONDUCT.md` — Contributor Covenant v2.1
- `CONTRIBUTING.md` — how to help with the site
- `.github/ISSUE_TEMPLATE/bug_report.yml` — bug template
- `.github/ISSUE_TEMPLATE/feature_request.yml` — feature template
- `.github/PULL_REQUEST_TEMPLATE.md` — PR template
- `.github/dependabot.yml` — weekly npm/GitHub Actions updates

## Local preview

```bash
python -m http.server 8080
# or
npx serve .
```

Then open <http://localhost:8080>.

## Deploy

Push to `main`. GitHub Pages (root, no Jekyll) auto-deploys.

## Links

- Product: <https://github.com/dragonked2/alphacode>
- Releases: <https://github.com/dragonked2/alphacode/releases>
- Org: <https://github.com/alphacli>
