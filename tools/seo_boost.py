#!/usr/bin/env python3
"""seo_boost.py - idempotent SEO / performance / discovery pass. Run after optimize.py.
Usage: python tools/seo_boost.py"""
import re, json, glob, os, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'https://alphacli.github.io'
TODAY = datetime.date.today().isoformat()
LOCALES = ['en-us','en-gb','ar-eg','ar-sa','ar-ae','nl-nl','de-de','fr-fr','es-es','pt-br','tr-tr']
FONT_RE = re.compile(r'<link[^>]*href="https://fonts\.googleapis\.com/css2[^"]*"[^>]*/?>')

def rd(p): return open(p, encoding='utf8').read()
def wr(p, s): open(p, 'w', encoding='utf8').write(s)

def pages():
    for p in glob.glob(ROOT + '/**/index.html', recursive=True):
        if '/tools/' in p or '/assets/' in p: continue
        yield p
    p = ROOT + '/404.html'
    if os.path.exists(p): yield p

def fix_head(h):
    h = h.replace('<noscript></noscript>', '')
    # dedupe preconnects
    for pat in (r'<link href="https://fonts\.googleapis\.com" rel="preconnect"/>',
                r'<link crossorigin="" href="https://fonts\.gstatic\.com" rel="preconnect"/>'):
        ms = list(re.finditer(pat, h))
        for m in reversed(ms[1:]):
            h = h[:m.start()] + h[m.end():]
    # remove the render-blocking duplicate font stylesheet (keep media=print swap variant)
    links = list(FONT_RE.finditer(h))
    if any('data-font' in m.group(0) for m in links):
        for m in reversed(links):
            if 'data-font' not in m.group(0) and 'media="print"' not in m.group(0):
                # keep if inside <noscript>
                before = h[:m.start()]
                if before.rfind('<noscript>') > before.rfind('</noscript>'): continue
                h = h[:m.start()] + h[m.end():]
    return h

def load_home_nodes():
    h = rd(ROOT + '/index.html'); nodes = {}
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', h, re.S):
        d = json.loads(m.group(1))
        for n in (d.get('@graph') or [d]):
            if '@id' in n: nodes[n['@id']] = n
    return nodes

def localize_jsonld(h, path, home):
    rel = os.path.relpath(path, ROOT).split(os.sep)[0]
    if rel not in LOCALES: return h
    title = re.search(r'<title>(.*?)</title>', h, re.S).group(1).strip()
    desc = re.search(r'<meta[^>]*name="description"[^>]*content="([^"]*)"', h) or re.search(r'<meta[^>]*content="([^"]*)"[^>]*name="description"', h)
    desc = desc.group(1)
    lang = re.search(r'<html[^>]*lang="([^"]+)"', h).group(1)
    url = f'{BASE}/{rel}/'
    blocks = list(re.finditer(r'<script type="application/ld\+json">(.*?)</script>', h, re.S))
    out, graph_done = h, False
    for m in reversed(blocks):
        d = json.loads(m.group(1))
        if '@graph' not in d:
            # standalone SoftwareApplication duplicate -> merged into graph below
            out = out[:m.start()] + out[m.end():]; continue
        g = d['@graph']; ids = {n.get('@id') for n in g}
        for n in g:
            t = n.get('@type')
            if t == 'WebPage':
                n.update({'name': title, 'description': desc, 'url': url, 'inLanguage': lang,
                          'dateModified': TODAY, 'isPartOf': {'@id': BASE + '/#website'}})
                n['breadcrumb'] = {'@id': url + '#breadcrumb'}
            elif t == 'WebSite':
                n['description'] = desc; n['inLanguage'] = lang
            elif t == 'BreadcrumbList':
                n['@id'] = url + '#breadcrumb'
            elif t == 'FAQPage':
                n['@id'] = url + '#faq'
            elif t == 'Organization' and 'founder' not in n:
                n['founder'] = {'@id': BASE + '/#author'}
        if BASE + '/#author' not in ids and BASE + '/#author' in home:
            g.append(home[BASE + '/#author'])
        # replace SoftwareSourceCode with the richer combined home node
        sw = home.get(BASE + '/#software')
        if sw:
            g[:] = [n for n in g if n.get('@id') != BASE + '/#software'] + [sw]
        out = out[:m.start()] + '<script type="application/ld+json">' + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + '</script>' + out[m.end():]
    return out

def bump_modified(h):
    return re.sub(r'("dateModified"\s*:\s*")\d{4}-\d{2}-\d{2}', r'\g<1>' + TODAY, h)

SWAP = "\n/* Non-blocking Google Fonts: media=print link is promoted once loaded (CSP forbids inline onload). */\n(function(){function p(){var l=document.querySelectorAll('link[data-font]');for(var i=0;i<l.length;i++){(function(k){if(k.sheet){k.media='all'}else{k.addEventListener('load',function(){k.media='all'})}})(l[i])}}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',p);else p()})();\n"

def patch_initjs():
    p = ROOT + '/init.js'; s = rd(p)
    if 'data-font' not in s: wr(p, s.rstrip('\n') + '\n' + SWAP)

def robots():
    agents = ['*','Googlebot','Googlebot-Image','Googlebot-News','Google-Extended','GoogleOther','Bingbot','BingPreview','DuckDuckBot','DuckAssistBot',
              'YandexBot','Baiduspider','Applebot','Applebot-Extended','Slurp','Seznambot','NaverBot','Yeti','PetalBot','Sogou',
              'GPTBot','OAI-SearchBot','ChatGPT-User','ClaudeBot','Claude-SearchBot','Claude-User','anthropic-ai','PerplexityBot','Perplexity-User',
              'Amazonbot','Meta-ExternalAgent','FacebookBot','MistralAI-User','cohere-ai','YouBot','Bytespider','CCBot','LinkedInBot','Twitterbot','Discordbot','Slackbot','TelegramBot','WhatsApp']
    body = '# AlphaCode robots.txt\n# Search engines, social crawlers and AI answer engines are welcome. Only build tooling is excluded.\n\n'
    body += ''.join(f'User-agent: {a}\n' for a in agents) + 'Allow: /\nDisallow: /tools/\n\n'
    body += f'Sitemap: {BASE}/sitemap.xml\n'
    wr(ROOT + '/robots.txt', body)

def sitemap():
    urls = [('/', 1.0, 'weekly'), ('/docs/', 0.9, 'weekly'), ('/mcp/', 0.8, 'monthly'), ('/ai-coding-agent/', 0.9, 'monthly'),
            ('/alpha-code/', 0.8, 'monthly'), ('/about/', 0.6, 'monthly')] + [(f'/{l}/', 0.8, 'weekly') for l in LOCALES]
    hl = {'en-us':'en-US','en-gb':'en-GB','ar-eg':'ar-EG','ar-sa':'ar-SA','ar-ae':'ar-AE','nl-nl':'nl-NL','de-de':'de-DE','fr-fr':'fr-FR','es-es':'es-ES','pt-br':'pt-BR','tr-tr':'tr-TR'}
    alts = ''.join(f'    <xhtml:link rel="alternate" hreflang="{v}" href="{BASE}/{k}/"/>\n' for k, v in hl.items()) + f'    <xhtml:link rel="alternate" hreflang="x-default" href="{BASE}/"/>\n'
    img = f'    <image:image>\n      <image:loc>{BASE}/og-image.png</image:loc>\n      <image:title>AlphaCode, free open-source AI coding agent for the terminal</image:title>\n    </image:image>\n'
    x = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
    for path, pr, cf in urls:
        is_loc = path == '/' or path.strip('/') in LOCALES
        x += f'  <url>\n    <loc>{BASE}{path}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <changefreq>{cf}</changefreq>\n    <priority>{pr}</priority>\n'
        if is_loc: x += alts
        if path == '/': x += img
        x += '  </url>\n'
    wr(ROOT + '/sitemap.xml', x + '</urlset>\n')

def text_of(p):
    h = rd(p)
    m = re.search(r'<main[^>]*>(.*?)</main>', h, re.S)
    b = m.group(1) if m else h
    b = re.sub(r'<(script|style|svg|noscript)[^>]*>.*?</\1>', '', b, flags=re.S)
    b = re.sub(r'</(p|div|li|h[1-6]|tr|pre|section)>', '\n', b)
    b = re.sub(r'<[^>]+>', ' ', b)
    import html
    b = html.unescape(b)
    b = re.sub(r'[ \t]+', ' ', b)
    return re.sub(r'\n\s*\n+', '\n\n', b).strip()

def llms_full():
    out = ['# AlphaCode: full documentation for LLMs', '', '> Plain-text export of the AlphaCode website (https://alphacli.github.io/). AlphaCode is a free, open-source (MIT) AI coding agent written in Rust that runs in the terminal.', f'> Generated {TODAY}. Canonical sources: the page URLs listed below.', '']
    for title, path, f in [('Home', '/', 'index.html'), ('What is an AI coding agent?', '/ai-coding-agent/', 'ai-coding-agent/index.html'),
                           ('Documentation', '/docs/', 'docs/index.html'), ('MCP servers guide', '/mcp/', 'mcp/index.html'),
                           ('What is Alpha Code?', '/alpha-code/', 'alpha-code/index.html'), ('About', '/about/', 'about/index.html')]:
        out += [f'\n---\n\n## {title}\nURL: {BASE}{path}\n', text_of(os.path.join(ROOT, f))]
    wr(ROOT + '/llms-full.txt', '\n'.join(out) + '\n')
    s = rd(ROOT + '/llms.txt')
    if 'llms-full.txt' not in s:
        s = s.replace('## Community', f'- [Full text export for LLMs]({BASE}/llms-full.txt): all pages above as one plain-text file\n\n## Community', 1)
        wr(ROOT + '/llms.txt', s)

def add_alt_links(h):
    if 'llms-full.txt' not in h and '</head>' in h and 'rel="alternate" title="LLM-readable summary"' in h:
        h = h.replace('</head>', '<link href="/llms-full.txt" rel="alternate" title="Full LLM-readable text" type="text/plain"/></head>', 1)
    return h

def main():
    home = load_home_nodes()
    for p in pages():
        h = rd(p); o = h
        h = fix_head(h)
        if not p.endswith('404.html'):
            h = localize_jsonld(h, p, home)
            h = bump_modified(h)
            h = add_alt_links(h)
        if h != o: wr(p, h)
    robots(); sitemap(); llms_full()
    print('seo_boost: done', TODAY)
if __name__ == '__main__': main()
