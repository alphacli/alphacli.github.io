"""Builds full localized homepages (/ar-eg/, /nl-nl/ ...) as clones of index.html. Run AFTER build_i18n.py."""
import sys,json,html,pathlib,re
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from bs4 import BeautifulSoup,NavigableString
from i18n_data import T,LOCALES
from home_strings import KEYS,S,XK,X
R=pathlib.Path(__file__).resolve().parent.parent;U='https://alphacli.github.io'
src=(R/'index.html').read_text()
EN_Q={'free':"Is AlphaCode really free? Do I need an API key?",'what':'What is Alpha Code?','same':'Is AlphaCode the same as Alpha Coders or Wallpaper Abyss?'}
def walk(o,fn):
    if isinstance(o,dict):
        fn(o);[walk(v,fn) for v in o.values()]
    elif isinstance(o,list):[walk(v,fn) for v in o]
for slug,lang,og,k,dr,label in LOCALES:
    t=T[k];url=f'{U}/{slug}/';soup=BeautifulSoup(src,'html.parser')
    h=soup.html;h['lang']=lang;h['dir']=dr
    # --- head
    soup.title.string=t['title']
    def meta(attr,val,content):
        m=soup.find('meta',attrs={attr:val})
        if m: m['content']=content
        return m
    meta('name','description',t['desc']);meta('property','og:title',t['title']);meta('property','og:description',t['desc']);meta('property','og:url',url)
    meta('name','twitter:title',t['title']);meta('name','twitter:description',t['desc'])
    if not meta('property','og:locale',og): soup.head.append(soup.new_tag('meta',attrs={'property':'og:locale','content':og}))
    c=soup.find('link',rel='canonical');c['href']=url
    if dr=='rtl':
        for rel,hr in [('preconnect','https://fonts.googleapis.com'),('stylesheet','https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap')]:
            soup.head.append(soup.new_tag('link',rel=rel,href=hr))
    # --- JSON-LD: FAQ must match visible (translated) questions
    for sc in soup.find_all('script',type='application/ld+json'):
        d=json.loads(sc.string)
        def fix(o):
            if o.get('@type')=='FAQPage':
                o['inLanguage']=lang
                o['mainEntity']=[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in (t['faq'][1],t['faq'][0],t['faq'][2])]
            if o.get('@type') in('WebPage','WebSite','SoftwareApplication'):o['inLanguage']=lang
            if o.get('@type')=='WebPage':o['url']=url
        walk(d,fix);sc.string=json.dumps(d,ensure_ascii=False)
    # --- text replacement (UI strings)
    if k in S:
        tr=dict(zip(KEYS,S[k].split('|')));m={}
        for en,x in tr.items(): m[' '.join(html.unescape(en).split())]=x
        for en,x in zip(XK,X[k].split('|')): m[' '.join(en.split())]=x
        for s in soup.find_all(string=True):
            if s.parent.name in('script','style') or isinstance(s,type(soup.new_string(''))) and False: continue
            key=' '.join(str(s).split())
            if key in m and not s.parent.name=='title':
                lead=str(s)[:len(str(s))-len(str(s).lstrip())];trail=str(s)[len(str(s).rstrip()):]
                s.replace_with(NavigableString(lead+m[key]+trail))
    # --- hero headline + subline
    ht=soup.find(class_='hero__title')
    if ht:
        ht.clear();ht.append(NavigableString(t['h1a']+' '));sp=soup.new_tag('span');sp['class']='amber';sp.string=t['h1b'];ht.append(sp)
    hs=soup.find(class_='hero__sub')
    if hs: hs.clear();hs.append(NavigableString(t['lede']))
    # --- FAQ (3 translated questions)
    for key,idx in (('free',1),('what',0),('same',2)):
        for sm in soup.find_all('summary'):
            if ' '.join(sm.get_text().split())==EN_Q[key]:
                sm.string=t['faq'][idx][0];p=sm.find_next_sibling('p')
                if p: p.clear();p.append(NavigableString(t['faq'][idx][1]))
    # --- install copy button labels
    b=soup.find(class_='ins__copy')
    if b: b['data-label']=t['copy'];b['data-done']=t['copied'];b.string=t['copy']
    # --- brand link stays inside locale
    br=soup.find('a',class_='nav__brand')
    if br: br['href']=f'/{slug}/'
    (R/slug).mkdir(exist_ok=True);(R/slug/'index.html').write_text(str(soup))
print('built',len(LOCALES),'full homepages')
