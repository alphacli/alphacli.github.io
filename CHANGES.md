# Changes in this pass

## Fixed
- **Hardcoded versions** - homepage v1.0.76, docs v1.0.7, MCP page v1.0.23 -> one source (`site.config.json`) stamped everywhere by `tools/sync_version.py`.
- **Broken Windows commands in docs/llms-full** - `irm ... | iex -Version/-Prefix/-FromSource` cannot pass parameters; replaced with the script-block form from the repo README. Added `-NoPath`, `-PathDryRun`, `--no-path`, `--link`.
- **JSON-LD** now carries `softwareVersion`, `dateModified`, `downloadUrl`.
- **GitHub API**: 2 anonymous calls per page view -> 1 cached lookup (6 h TTL, 10 min back-off) so shared IPs don't hit the 60 req/h limit.
- **`optimize.py` not idempotent** - added an empty `<noscript>` per run. Fixed.
- **`build_i18n.py` not idempotent** - appended 11 hreflang links + a footer language nav per run (bs4 reorders attributes, the cleanup regexes assumed the old order). Fixed; full chain now byte-identical across runs.
- **Touch targets** (`art.css`): copy, pause, language menu, share links raised to 44px on coarse pointers; reduced-motion catch-all.
- **CI**: `.github/workflows/sync-site.yml` (daily, manual, PR guard, `repository_dispatch`).

## Verified (not changed)
11 locales x desktop/mobile: 0 JS errors, no horizontal overflow, RTL correct, CLS 0, copy/Ctrl+K/focus rings OK, 0 broken links, sitemap matches disk.

## Needs you
- Run `python tools/sync_version.py --fetch` once online to confirm the live latest tag (v1.0.76 could not be verified from the sandbox).
- Docs still lack OrcaRouter, `--gui` and the Royal Gold theme from the repo README.
- `alphacode-demo.mp4` (668 KB) is unreferenced by the site.
- Workflow dispatch target `alphacli/alphacli.github.io` in README is an assumption - adjust to the real site repo.
