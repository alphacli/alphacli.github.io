"""Single-source-of-truth version stamping.  Run BEFORE optimize.py (it is idempotent and surgical:
it edits only version text, so git diffs stay tiny).

    python tools/sync_version.py            # stamp everything from site.config.json
    python tools/sync_version.py --fetch    # first ask GitHub for the latest release tag, save it, then stamp
    python tools/sync_version.py --check    # CI guard: exit 1 if any page disagrees with the config

What gets stamped
  * every <... class="js-version">vX.Y.Z</...> (hero pill on all 11 homepages)
  * the MCP page pill, which used to be hardcoded to an unrelated old tag
  * docs / llms-full install examples (--version, -Version, ALPHACODE_VERSION, release URLs)
  * JSON-LD SoftwareApplication.softwareVersion + dateModified (rich-result freshness signal)
At runtime script.js still upgrades `.js-version` from the GitHub API (cached 6 h) - this file only
guarantees the *no-JS / crawler / first-paint* value is correct too.
"""
import json, pathlib, re, sys, urllib.request

R = pathlib.Path(__file__).resolve().parent.parent
CFG_PATH = R / "site.config.json"
cfg = json.loads(CFG_PATH.read_text())
VER_RE = r"v\d+\.\d+\.\d+"


def fetch_latest():
    url = f"https://api.github.com/repos/{cfg['repo']}/releases/latest"
    import os
    hdr = {"Accept": "application/vnd.github+json", "User-Agent": "alphacode-site-sync"}
    if os.environ.get("GITHUB_TOKEN"): hdr["Authorization"] = "Bearer " + os.environ["GITHUB_TOKEN"]   # 5000 req/h in CI
    req = urllib.request.Request(url, headers=hdr)
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            j = json.load(r)
        tag = j["tag_name"] if j["tag_name"].startswith("v") else "v" + j["tag_name"]
        cfg["version"] = tag
        cfg["released"] = (j.get("published_at") or cfg["released"])[:10]
        CFG_PATH.write_text(json.dumps(cfg, indent=2) + "\n")
        print(f"fetched latest release: {tag} ({cfg['released']})")
    except Exception as e:  # offline / rate-limited: keep the committed value, never break the build
        print(f"WARN could not reach GitHub ({e}); keeping {cfg['version']}")


def stamp_text(s, v):
    """version text inside js-version elements"""
    s = re.sub(r'(class="js-version"[^>]*>)' + VER_RE + r'(<)', rf"\g<1>{v}\g<2>", s)
    s = re.sub(r'(<b[^>]*class="js-version"[^>]*>)' + VER_RE + r'(</b>)', rf"\g<1>{v}\g<2>", s)
    return s


def stamp_docs(s, v):
    """pinned examples in docs + llms-full (v1.0.7 style, not followed by another digit)"""
    s = re.sub(r"v\d+\.\d+\.\d+(?=/(?:SHA256SUMS|alphacode-))", v, s)          # release asset URLs
    s = re.sub(r"(--version |-Version |ALPHACODE_VERSION=|e\.g\. (?:<code>)?)v\d+\.\d+\.\d+(?!\d)", rf"\g<1>{v}", s)
    s = re.sub(r"(→ )v\d+\.\d+\.\d+(?!\d) \([0-9a-f]{7}, …\)", rf"\g<1>{v} (…)", s)   # stale sample commit hash
    return s


def stamp_mcp_pill(s, v):
    # make the MCP page pill track the product version like the homepage does
    s = re.sub(r"(<b>Documentation</b> · MCP · )(?:<span class=\"js-version\">)?" + VER_RE + r"(?:</span>)?",
               rf'\g<1><span class="js-version">{v}</span>', s)
    return re.sub(r"(Documentation · MCP · )" + VER_RE, rf"\g<1>{v}", s)   # plain-text form (llms-full.txt)


def stamp_jsonld(s, v, released):
    def fix_block(m):
        try:
            d = json.loads(m.group(2))
        except Exception:
            return m.group(0)
        changed = False

        def walk(o):
            nonlocal changed
            if isinstance(o, dict):
                t = o.get("@type")
                if t == "SoftwareApplication" or (isinstance(t, list) and "SoftwareApplication" in t):
                    o["softwareVersion"] = v.lstrip("v"); o["dateModified"] = released
                    o.setdefault("downloadUrl", f"https://github.com/{cfg['repo']}/releases/latest")
                    changed = True
                for x in o.values(): walk(x)
            elif isinstance(o, list):
                for x in o: walk(x)
        walk(d)
        return m.group(1) + json.dumps(d, ensure_ascii=False) + m.group(3) if changed else m.group(0)
    return re.sub(r'(<script type="application/ld\+json">)(.*?)(</script>)', fix_block, s, flags=re.S)


def main():
    check = "--check" in sys.argv
    if "--fetch" in sys.argv: fetch_latest()
    v, rel = cfg["version"], cfg["released"]
    assert re.fullmatch(VER_RE, v), f"bad version in site.config.json: {v}"
    files = [p for p in R.glob("**/*.html") if not any(x in p.parts for x in ("tools", ".git", "node_modules", "assets")) and not p.name.startswith("google")]
    files += [R / "llms-full.txt", R / "llms.txt"]
    dirty = []
    for f in files:
        if not f.exists(): continue
        s0 = f.read_text(encoding="utf8"); s = stamp_text(s0, v)
        rel_path = f.relative_to(R).as_posix()
        if rel_path in ("docs/index.html", "llms-full.txt"): s = stamp_docs(s, v)
        if rel_path in ("mcp/index.html", "llms-full.txt"): s = stamp_mcp_pill(s, v)
        if f.suffix == ".html": s = stamp_jsonld(s, v, rel)
        if s != s0:
            dirty.append(rel_path)
            if not check: f.write_text(s, encoding="utf8")
    if check:
        if dirty: print("OUT OF SYNC with site.config.json:", *dirty, sep="\n  "); sys.exit(1)
        print(f"ok: all pages match {v}")
    else:
        print(f"stamped {v} into {len(dirty)} files" + ("" if not dirty else ": " + ", ".join(dirty[:6]) + ("…" if len(dirty) > 6 else "")))


if __name__ == "__main__":
    main()
