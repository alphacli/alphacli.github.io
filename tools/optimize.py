"""Performance + consistency post-processor. Run LAST (after build_home.py / polish.py / harden.py):
    python tools/optimize.py
- Bundles the 9-10 render-blocking stylesheets into ONE minified file per page type (cascade order preserved).
- Bundles the 8 deferred scripts into ONE file; page-specific scripts (docs.js, mcp.js) stay separate.
- Loads Google Fonts without blocking render (media=print swap, flipped in site.js; <noscript> fallback) on EVERY page.
- Moves the clickjacking guard + stored-theme init into a tiny synchronous /init.js (prevents light-theme flash).
Idempotent: source files stay in place, bundles are regenerated from them every run."""
import re,hashlib,pathlib
from bs4 import BeautifulSoup
R=pathlib.Path(__file__).resolve().parent.parent
FONT_INTER='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap'
CSS_BASE=['styles','theme','community','modern','pro','pro2','pro3','ui','utility']
JS_BASE=['script','community','app','pro2','pro','modern','i18n','ui']
def min_css(s):
    out=[];i=0;n=len(s);q=None
    while i<n:
        c=s[i]
        if q:
            out.append(c)
            if c=='\\':out.append(s[i+1]);i+=1
            elif c==q:q=None
        elif c in '"\'':q=c;out.append(c)
        elif s.startswith('/*',i):
            j=s.find('*/',i+2);i=n if j<0 else j+1
        else:out.append(c)
        i+=1
    t=''.join(out)
    t=re.sub(r'\s+',' ',t)
    t=re.sub(r' ?([{};,]) ?',r'\1',t)
    t=re.sub(r';}','}',t)
    return t.strip()
def ver(b):return hashlib.md5(b).hexdigest()[:8]
def read(n):return (R/n).read_text(encoding='utf8')
(R/'assets').mkdir(exist_ok=True)
def bundle_css(name,parts):
    css='\n'.join(min_css(read(p)) for p in parts)
    (R/'assets'/name).write_text(css,encoding='utf8');return ver(css.encode())
def bundle_js(name,parts):
    js=';\n'.join(read(p).strip() for p in parts)+';\n'
    js+="(function(){document.querySelectorAll('link[data-font]').forEach(function(l){l.media='all'})})();\n"
    (R/'assets'/name).write_text(js,encoding='utf8');return ver(js.encode())
init=read('security.js').strip()+"\n(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}})();\n"
(R/'init.js').write_text(init,encoding='utf8');V_INIT=ver(init.encode())
CV={'site':bundle_css('site.css',[f+'.css' for f in CSS_BASE]),
    'docs':bundle_css('docs.css',['styles.css','theme.css','docs/docs.css']+[f+'.css' for f in CSS_BASE[2:]]),
    'mcp':bundle_css('mcp.css',['styles.css','theme.css','mcp.css']+[f+'.css' for f in CSS_BASE[2:]])}
V_JS=bundle_js('site.js',[f+'.js' for f in JS_BASE])
V_DOCSJS=ver(read('docs/docs.js').encode());V_MCPJS=ver(read('mcp.js').encode())
kind=lambda rel:'docs' if rel=='docs/index.html' else 'mcp' if rel=='mcp/index.html' else 'site'
BUNDLED={x+'.js' for x in JS_BASE}|{'docs.js','mcp.js','init.js','security.js'}
files=[f for f in R.glob('**/*.html') if not any(p in f.parts for p in('tools','.git','node_modules','assets'))and not f.name.startswith('google')]
for f in sorted(files):
    rel=f.relative_to(R).as_posix();s=BeautifulSoup(f.read_text(encoding='utf8'),'html.parser');h=s.head
    if not h or rel=='mcp.html':continue
    k=kind(rel);fonts=[]
    for l in list(s.find_all('link',rel='stylesheet')):
        href=l.get('href','')
        if 'fonts.googleapis.com' in href:fonts.append(href.replace('&amp;','&'));l.extract()
        elif not href.startswith(('http','//')):l.extract()
    for nt in s.find_all('noscript'):
        if 'fonts.googleapis' in str(nt):nt.extract()
    fonts=list(dict.fromkeys(fonts))
    if FONT_INTER not in fonts:fonts.insert(0,FONT_INTER)
    for l in s.find_all('link',rel='preconnect'):l.extract()
    h.append(s.new_tag('link',rel='preconnect',href='https://fonts.googleapis.com'))
    p2=s.new_tag('link',rel='preconnect',href='https://fonts.gstatic.com');p2['crossorigin']='';h.append(p2)
    h.append(s.new_tag('link',rel='stylesheet',href=f'/assets/{k}.css?v={CV[k]}'))
    for fu in fonts:
        fl=s.new_tag('link',rel='stylesheet',href=fu);fl['media']='print';fl['data-font']='';h.append(fl)
        ns=s.new_tag('noscript');ns.append(BeautifulSoup(f'<link rel="stylesheet" href="{fu}">','html.parser'));h.append(ns)
    for sc in list(s.find_all('script',src=True)):
        src=sc['src'].split('?')[0]
        if src.rsplit('/',1)[-1] in BUNDLED or src.endswith('assets/site.js'):sc.extract()
    ini=s.new_tag('script',src=f'/init.js?v={V_INIT}')
    a=h.find('meta',attrs={'name':'referrer'}) or h.find('meta',attrs={'http-equiv':'Content-Security-Policy'}) or h.find('meta',charset=True)
    (a.insert_after(ini) if a else h.insert(0,ini))
    for src,v in [(f'/assets/site.js?v={V_JS}',0)]+([(f'/docs/docs.js?v={V_DOCSJS}',0)] if k=='docs' else [])+([(f'/mcp.js?v={V_MCPJS}',0)] if k=='mcp' else []):
        t=s.new_tag('script',src=src);t['defer']='';s.body.append(t)
    f.write_text(str(s),encoding='utf8')
print('optimized',len(files),'pages | css',CV,'| js',V_JS)
