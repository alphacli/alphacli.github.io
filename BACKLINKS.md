# Backlink & visibility playbook for AlphaCode

Already done in this update: `rel="me"` identity links, `sameAs` schema (X, Facebook, LinkedIn, GitHub, Discord), About page with author entity, share buttons, copy-paste "Built with AlphaCode" badge, sitemap + llms.txt updated.

## Do next (highest impact first)
1. **GitHub repo**: set the homepage URL to https://alphacli.github.io/, add topics (ai-agent, coding-agent, rust, cli, mcp, llm), and put the site link in the README top section.
2. **Profile bios**: put https://alphacli.github.io/ in the bio/website field of X, Facebook, LinkedIn and Discord, and pin a launch post.
3. **Directories** (free, dofollow/nofollow mix): Product Hunt, Hacker News (Show HN), Awesome lists (awesome-rust, awesome-cli-apps, awesome-ai-agents, awesome-mcp-servers), AlternativeTo, LibHunt, Console.dev, Dev.to / Hashnode tutorials linking to /docs/.
4. **Content links**: publish tutorials ("fix failing tests with AlphaCode", "MCP + Burp walkthrough") and link back to /mcp/ and /ai-coding-agent/.
5. **Badge**: ask users to add the README badge from the homepage Follow section.
6. **Search Console**: submit sitemap.xml (verification file already present) and request indexing for /about/.

## Get indexed on every search engine (do once)
- Google: Search Console -> add https://alphacli.github.io/ -> Sitemaps -> submit `sitemap.xml` -> URL Inspection -> Request indexing for `/`, `/about/`, `/docs/`, `/mcp/`, `/ai-coding-agent/`.
- Bing + Yahoo + DuckDuckGo: Bing Webmaster Tools -> import from Google Search Console -> submit sitemap.
- IndexNow (Bing, Yandex, Seznam, Naver): key file `5db844014a1b414f13881d85223e09db.txt` is in the site root. Open
  https://www.bing.com/indexnow?url=https://alphacli.github.io/&key=5db844014a1b414f13881d85223e09db
- Yandex Webmaster and Baidu Webmaster: add the site and submit the sitemap.
