"""Targeted content/UX/SEO fixes applied to the generated pages. Run BEFORE tools/optimize.py:
    python tools/fixes.py
Idempotent."""
import re,pathlib
from bs4 import BeautifulSoup
R=pathlib.Path(__file__).resolve().parent.parent;TODAY='2026-10-23'
def rd(p):return BeautifulSoup((R/p).read_text(encoding='utf8'),'html.parser')
def wr(p,s):(R/p).write_text(str(s),encoding='utf8')
# 1) MCP page: relative link resolved to /mcp/index.html#install (broken) -> site root anchor
s=rd('mcp/index.html')
for a in s.find_all('a',href=True):
    if a['href'].startswith('index.html#'):a['href']='/'+a['href'][len('index.html'):]
wr('mcp/index.html',s)
# 2) 404: heading order (h1 -> h3 skipped h2). Add a visually-hidden h2 for the link list.
s=rd('404.html')
g=s.find(class_='m-grid')
if g and not g.find_previous_sibling('h2'):
    h2=s.new_tag('h2',attrs={'class':'sr-only'});h2.string='Pages you might be looking for';g.insert_before(h2)
wr('404.html',s)
# 3) alpha-code: meta description 162 chars -> <=160
s=rd('alpha-code/index.html');new='Looking for Alpha Code? AlphaCode is a free, open-source AI coding agent for your terminal. See what it is, how it differs from similar names, and install free.'
assert len(new)<=160,len(new)
for sel in ({'name':'description'},{'property':'og:description'},{'name':'twitter:description'}):
    m=s.find('meta',attrs=sel)
    if m and len(m['content'])>160:m['content']=new
wr('alpha-code/index.html',s)
# 4) Hero: one primary + one secondary CTA (Discord is already in the nav, floating pill, community section and closing CTA)
for p in ['index.html']+[f'{d}/index.html' for d in ('en-us','en-gb','ar-eg','ar-sa','ar-ae','nl-nl','de-de','fr-fr','es-es','pt-br','tr-tr')]:
    s=rd(p);c=s.find(class_='hero__cta')
    if c:
        for a in c.find_all('a',class_='btn--discord'):a.decompose()
    wr(p,s)
# 5) Freshness: JSON-LD dateModified + sitemap lastmod
for f in R.glob('**/*.html'):
    if any(x in f.parts for x in('tools','.git')):continue
    t=f.read_text(encoding='utf8');n=re.sub(r'("dateModified":\s*")\d{4}-\d\d-\d\d',r'\g<1>'+TODAY,t)
    if n!=t:f.write_text(n,encoding='utf8')
sm=R/'sitemap.xml';sm.write_text(re.sub(r'<lastmod>[^<]+</lastmod>',f'<lastmod>{TODAY}</lastmod>',sm.read_text(encoding='utf8')),encoding='utf8')
bs=R/'tools/build_sitemap.py';bs.write_text(re.sub(r"NOW='[^']+'",f"NOW='{TODAY}'",bs.read_text(encoding='utf8')),encoding='utf8')
print('fixes applied')
