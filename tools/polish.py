"""Unifies header/footer/brand across non-locale pages and fixes leftover raw markdown."""
import re,copy,html,pathlib
from bs4 import BeautifulSoup,NavigableString
R=pathlib.Path(__file__).resolve().parent.parent
rd=lambda f:BeautifulSoup((R/f).read_text(),'html.parser')
home=rd('index.html');docs=rd('docs/index.html')
HEADER=docs.find('header',class_='nav')
FOOTER=home.find('footer')
for a in FOOTER.find_all('a',href=True):
    if a['href'].startswith('#'):a['href']='/'+a['href']
V='?v=20261023'
def ensure_link(soup,href):
    if not any(l.get('href','').split('?')[0]==href.split('?')[0] for l in soup.find_all('link',rel='stylesheet')):
        soup.head.append(soup.new_tag('link',rel='stylesheet',href=href))
def ensure_script(soup,src,before=None):
    if any(s.get('src','').split('?')[0]==src.split('?')[0] for s in soup.find_all('script')):return
    t=soup.new_tag('script',src=src);t['defer']=None;soup.body.append(t)
CURRENT={'docs/index.html':'/docs/','mcp/index.html':'/mcp/','about/index.html':'/about/'}
for f in ['about/index.html','alpha-code/index.html','404.html','docs/index.html','mcp/index.html','ai-coding-agent/index.html']:
    s=rd(f)
    # ---------- shared header
    old=s.find('header')
    h=copy.copy(HEADER)
    for a in h.find_all('a',attrs={'aria-current':True}):del a['aria-current']
    nav=h.find('nav',id='navLinks')
    if nav and not nav.find('a',href='/about/'):
        ab=s.new_tag('a',href='/about/');ab.string='About'
        dr=nav.find(class_='nav__drawer');(dr.insert_before(ab) if dr else nav.append(ab))
    cur=CURRENT.get(f)
    if cur:
        a=h.find('a',href=cur)
        if a:a['aria-current']='page'
    if old: old.replace_with(h)
    else: s.body.insert(0,h)
    # ---------- shared footer
    ft=copy.copy(FOOTER);of=s.find('footer')
    if of:of.replace_with(ft)
    else:
        (s.find('main') or s.body).insert_after(ft)
    # ---------- assets
    for href in ['https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap','/community.css'+V,'/styles.css'+V,'/theme.css'+V,'/modern.css'+V,'/pro.css'+V,'/pro2.css'+V]:
        pass
    for href in ['/community.css?v=20261019']:ensure_link(s,href)
    ensure_link(s,'/pro3.css'+V)
    # pro3 must be last stylesheet
    l=s.find('link',href=re.compile(r'/pro3\.css'));l.extract();s.head.append(l)
    for src in ['/script.js?v=20261019','/community.js?v=20261019','/app.js?v=20261019']:
        if not any(x.get('src','').split('?')[0].endswith(src.split('?')[0].split('/')[-1]) for x in s.find_all('script')):
            t=s.new_tag('script',src=src);t['defer']='';first=s.find('script',src=re.compile(r'pro2\.js'))
            (first.insert_before(t) if first else s.body.append(t))
    if not any('i18n.js' in (x.get('src') or '') for x in s.find_all('script')):
        t=s.new_tag('script',src='/i18n.js?v=20261022');t['defer']='';s.body.append(t)
    # ---------- brand case + stray markdown in text nodes (not code/pre/script/style)
    skip={'script','style','pre','code','textarea'}
    for n in list(s.find_all(string=True)):
        if n.parent.name in skip or any(p.name in skip for p in n.parents) or isinstance(n,type(s.find('head').contents[0])) and False:continue
        t=str(n);new=t
        if f in('docs/index.html','mcp/index.html','ai-coding-agent/index.html'):
            new=new.replace('Alphacode','AlphaCode')
            if '**' in new or '`' in new:
                e=html.escape(new,quote=False)
                e=re.sub(r'\*\*(.+?)\*\*',r'<strong>\1</strong>',e);e=re.sub(r'`([^`\n]+)`',r'<code>\1</code>',e)
                if e!=html.escape(t,quote=False):
                    frag=BeautifulSoup(e,'html.parser');n.replace_with(*list(frag.contents));continue
        if new!=t:n.replace_with(NavigableString(new))
    if s.title and f!='404.html':s.title.string=(s.title.string or '').replace('Alphacode','AlphaCode')
    for m in s.find_all('meta',content=True):m['content']=m['content'].replace('Alphacode','AlphaCode') if f.startswith(('docs','mcp','ai-')) else m['content']
    # 404: keep noindex, drop old inline main styles fine
    (R/f).write_text(str(s))
# ensure pro3 on home too
s=rd('index.html');ensure_link(s,'/pro3.css'+V);l=s.find('link',href=re.compile(r'/pro3\.css'));l.extract();s.head.append(l);(R/'index.html').write_text(str(s))
print('polished')
