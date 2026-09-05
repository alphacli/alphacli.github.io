# Alphacode — marketing site

Static, single-page site for [Alphacode](https://github.com/dragonked2/alphacode).

## Files
- `index.html` — markup + content
- `styles.css` — design system (tokens, layout, components)
- `script.js` — interactivity (mobile nav, install tabs, copy-to-clipboard, animated terminal, scroll reveal)

## Run locally
Just open `index.html` in a browser. No build step. Fonts load from Google Fonts via CDN.

For a local server (recommended so the IntersectionObserver behaves):

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

Then visit http://localhost:8080

## Deploy
Drop the folder onto any static host: Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3+CloudFront. No environment variables required.
