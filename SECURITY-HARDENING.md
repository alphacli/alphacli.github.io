# Security hardening — what is fixed, and what needs a hosting/DNS change

This site is hosted on **GitHub Pages** at `alphacli.github.io`. GitHub Pages cannot send custom HTTP headers, and you do not control DNS for `github.io`. So the scan items split into three groups.

## Fixed in the code (works on GitHub Pages today)
| Scan item | Fix |
|---|---|
| Content Security Policy missing | `<meta http-equiv="Content-Security-Policy">` on every page. Strict: `script-src 'self'`, no `unsafe-inline`. All inline scripts, `onload` handlers and `style=""` attributes were removed or moved to files (`docs/docs.js`, `mcp-redirect.js`, `utility.css`). |
| Referrer Policy not set | `<meta name="referrer" content="strict-origin-when-cross-origin">` on every page. |
| Clickjacking (partial) | `security.js` frame-buster. A meta CSP cannot carry `frame-ancestors`, so this is a fallback only. |
| Outbound links | `rel="noopener noreferrer"` enforced on `target=_blank` links. |

## Fixed by `_headers` — only once served from Cloudflare Pages / Netlify / Cloudflare proxy
`_headers` is included and ready. It sets: full CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin`, HSTS with `preload`, and a non-wildcard CORS origin.
GitHub Pages always sends `Access-Control-Allow-Origin: *`, `Server: GitHub.com` and its own HSTS value, and none of those can be changed there. To close those scan items, put the site behind **Cloudflare (free)** or deploy to **Cloudflare Pages**, ideally on your own domain. HSTS preload eligibility also requires your own apex domain.

## DNS / email items — need a domain you own
DMARC, DKIM, MTA-STS and DNSSEC are DNS records for the domain that sends mail. They cannot be set for `github.io`, and the contact address (`tlbbeg313@gmail.com`) is Gmail, which already has all of these. Once you have `yourdomain.com`:

```
yourdomain.com.          TXT  "v=spf1 include:_spf.your-mail-provider.com -all"
_dmarc.yourdomain.com.   TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; adkim=s; aspf=s"
<selector>._domainkey    TXT  (public key from your mail provider)
_mta-sts.yourdomain.com. TXT  "v=STSv1; id=20261030"
yourdomain.com.          CAA  0 issue "letsencrypt.org"
```
Start DMARC at `p=none` for two weeks, read the reports, then move to `quarantine` and `reject`. Enable DNSSEC in your registrar or DNS panel (one toggle on Cloudflare). Host `https://mta-sts.yourdomain.com/.well-known/mta-sts.txt` with `version: STSv1`, `mode: enforce`, your `mx:` hosts and `max_age: 604800`.

## After changing the domain
Update `Access-Control-Allow-Origin` in `_headers`, `U` in `tools/*.py`, canonical/OG URLs, `sitemap.xml`, `robots.txt` and `llms.txt`, then run `python tools/harden.py`.
