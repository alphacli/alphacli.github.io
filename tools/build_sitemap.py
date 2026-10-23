"""Regenerates sitemap.xml (pages only — no CSS/JS/markdown/assets) and robots.txt."""
import pathlib
from i18n_data import LOCALES
R=pathlib.Path(__file__).resolve().parent.parent;U='https://alphacli.github.io';NOW='2026-10-23'
alt=''.join(f'\n    <xhtml:link rel="alternate" hreflang="{l[1]}" href="{U}/{l[0]}/"/>' for l in LOCALES)+f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{U}/"/>'
def url(loc,freq,pri,extra=''):return f'  <url>\n    <loc>{U}{loc}</loc>\n    <lastmod>{NOW}</lastmod>\n    <changefreq>{freq}</changefreq>\n    <priority>{pri}</priority>{extra}\n  </url>\n'
img=f'\n    <image:image>\n      <image:loc>{U}/og-image.png</image:loc>\n      <image:title>AlphaCode, the free open-source AI coding agent</image:title>\n    </image:image>'
x='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
x+=url('/','weekly','1.0',alt)
for p,f,pr in [('/alpha-code/','monthly','0.9'),('/docs/','weekly','0.9'),('/mcp/','monthly','0.8'),('/ai-coding-agent/','monthly','0.8'),('/about/','monthly','0.7')]:x+=url(p,f,pr)
for l in LOCALES:x+=url(f'/{l[0]}/','weekly','0.8',alt)
x+='</urlset>\n'
(R/'sitemap.xml').write_text(x)
bots=['*','Googlebot','Bingbot','DuckDuckBot','YandexBot','Baiduspider','Applebot','Applebot-Extended','GPTBot','OAI-SearchBot','ChatGPT-User','ClaudeBot','Claude-SearchBot','PerplexityBot','Google-Extended']
(R/'robots.txt').write_text('# Search and AI answer engines are welcome. Build tooling is not indexable.\n'+''.join(f'User-agent: {b}\nAllow: /\nDisallow: /tools/\n\n' for b in bots)+f'Sitemap: {U}/sitemap.xml\n')
print('sitemap urls:',x.count('<loc>'))
