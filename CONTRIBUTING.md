# Contributing

Thanks for your interest in improving this site or **Alphacode**.

## What lives here

This repo (`alphacli/alphacli.github.io`) is the **marketing site only** — the static HTML/CSS/JS at <https://alphacli.github.io>.

Bugs in the **CLI itself** belong in the product repo: <https://github.com/dragonked2/alphacode>.

## How to contribute to the site

1. Fork this repo.
2. Create a branch: `git checkout -b fix/something`.
3. Edit `index.html`, `styles.css`, or `script.js`.
4. Open a PR describing the change (screenshots before/after help).
5. Wait for review.

## Local preview

```bash
python -m http.server 8080
# or
npx serve .
```

Then open <http://localhost:8080>.

## Style

- Keep it minimal. The site is dark, technical, premium — Linear / Vercel / Raycast territory.
- Avoid adding heavy dependencies. Vanilla HTML/CSS/JS only.
- Respect `prefers-reduced-motion`.
- Respect both dark and light themes.

## Commit & PR

- Use Conventional Commits if possible: `feat:`, `fix:`, `chore:`, `docs:`.
- Squash-merge is enabled on this repo.
- The PR template will guide you.

By contributing, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
