# Alphacode

> The agentic CLI for your terminal.

Alphacode reads your repo, picks the right model, edits files, runs tests, and ships — with your permission at every risky step.

**Live site:** [alphacli.github.io](https://alphacli.github.io/)
**Source repo:** [github.com/dragonked2/alphacode](https://github.com/dragonked2/alphacode)

---

## What it is

A blazing-fast terminal-native coding agent with multi-model orchestration, swarm coordination, and 40+ tools. Built in Rust. MIT licensed.

- **Plan, edit, verify** — reads your codebase, plans steps, picks the best model, edits files, runs tests, and self-reviews before declaring anything done.
- **Any model, any time** — Claude, GPT, Gemini, Copilot, Cursor, Bedrock, OpenRouter, or any OpenAI-compatible endpoint. Switch mid-conversation with `Ctrl+T`.
- **Swarm mode** — big jobs split into independent pieces, run by multiple agents in parallel, then merged and reviewed automatically.
- **Safety built in** — blocks catastrophic commands outright. Confirms before anything risky. Never sends your code anywhere by default.
- **40+ tools** — file editing, regex/AST search, shell, browser control, web fetch, memory, scheduling, diagrams, PDFs. No plugin surgery.
- **Never lose work** — sessions saved to disk. `alphacode --resume` reopens exactly where you left off — even after a crash.

---

## This repository

Static, single-page marketing site for Alphacode. No build step, no framework, no dependencies.

### Files

| File | Purpose |
| --- | --- |
| `index.html` | Markup + content |
| `styles.css` | Design system (tokens, layout, components) |
| `script.js` | Interactivity (mobile nav, install tabs, copy-to-clipboard, animated terminal, scroll reveal) |
| `.htaccess` | Apache config (compression, caching, security headers) |

### Run locally

Just open `index.html` in a browser. Fonts load from Google Fonts via CDN.

For a local server (recommended so the IntersectionObserver behaves):

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

Then visit [http://localhost:8080](http://localhost:8080).

### Deploy

Drop the folder onto any static host — Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3+CloudFront. No environment variables required. The repo is already served at <https://alphacli.github.io/>.

---

## Install Alphacode

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/dragonked2/alphacode/main/scripts/install.sh | bash
```

### Windows

```powershell
iwr -useb https://raw.githubusercontent.com/dragonked2/alphacode/main/scripts/install.ps1 | iex
```

### From source

```bash
git clone https://github.com/dragonked2/alphacode.git
cd alphacode
cargo build --release
```

### Verify

```bash
which alphacode
alphacode --version
alphacode doctor
alphacode
```

---

## Works with

Claude · GPT-4o/5 · Gemini · Copilot · Cursor · Bedrock · OpenRouter · any OpenAI-compatible endpoint.

---

## License

MIT — see [LICENSE](https://github.com/dragonked2/alphacode/blob/main/LICENSE).

## Security

Report issues per [SECURITY.md](https://github.com/dragonked2/alphacode/blob/main/SECURITY.md).