import sys,re,json,html,pathlib
sys.path.insert(0,str(pathlib.Path(__file__).parent))
from i18n_data import T,LOCALES
R=pathlib.Path(__file__).resolve().parent.parent;U='https://alphacli.github.io'
e=html.escape
about=(R/'about/index.html').read_text()
footer_src=re.search(r'<footer.*?</footer>',about,re.S).group(0)
GH='https://github.com/dragonked2/alphacode'
MAC='curl -fsSL https://raw.githubusercontent.com/dragonked2/alphacode/main/scripts/install.sh | bash'
WIN='iwr -useb https://raw.githubusercontent.com/dragonked2/alphacode/main/scripts/install.ps1 | iex'
SRC='git clone https://github.com/dragonked2/alphacode.git && cd alphacode && cargo build --release'
def alts(): 
    a=''.join(f'<link rel="alternate" hreflang="{l[1]}" href="{U}/{l[0]}/" />\n' for l in LOCALES)
    return a+f'<link rel="alternate" hreflang="en" href="{U}/" />\n<link rel="alternate" hreflang="x-default" href="{U}/" />\n'
def langnav():
    return '<nav class="m-langs" aria-label="Languages"><ul>'+''.join(f'<li><a href="/{l[0]}/" hreflang="{l[1]}" lang="{l[1]}">{e(l[5])}</a></li>' for l in LOCALES)+'</ul></nav>'
def page(loc):
    slug,lang,og,k,dr,label=loc;t=T[k];url=f'{U}/{slug}/'
    ld={"@context":"https://schema.org","@graph":[
     {"@type":"WebPage","@id":url+"#page","url":url,"name":t['title'],"description":t['desc'],"inLanguage":lang,"isPartOf":{"@id":U+"/#website"},"dateModified":"2026-10-16"},
     {"@type":"SoftwareApplication","name":"AlphaCode","alternateName":["Alpha Code","alphacode"],"applicationCategory":"DeveloperApplication","operatingSystem":"Windows, macOS, Linux","inLanguage":lang,"license":"https://opensource.org/licenses/MIT","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"author":{"@type":"Person","name":"Ali Essam","url":U+"/about/"},"url":url,"description":t['desc']},
     {"@type":"FAQPage","inLanguage":lang,"mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in t['faq']]},
     {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"AlphaCode","item":U+"/"},{"@type":"ListItem","position":2,"name":label,"item":url}]}]}
    sw='<details class="m-lang"><summary aria-label="'+e(t['lang'])+'"><span aria-hidden="true">🌐</span> '+e(label)+'</summary><ul>'+''.join(f'<li><a href="/{l[0]}/" hreflang="{l[1]}" lang="{l[1]}"'+(' aria-current="true"' if l[0]==slug else '')+f'>{e(l[5])}</a></li>' for l in LOCALES)+'</ul></details>'
    font='<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" />\n' if k=='ar' else ''
    tab=lambda p,ti,lb:f'<button class="ins__tab" role="tab" data-p="{p}" data-title="{ti}" aria-selected="false">{lb}</button>'
    pan=lambda p,c,h:f'<div class="ins__panel" data-p="{p}" data-cmd="{e(c)}" role="tabpanel" hidden><pre><code>{h}</code></pre></div>'
    cards=''.join(f'<div class="m-card m-reveal"><h3>{e(a)}</h3><p>{e(b)}</p></div>' for a,b in t['cards'])
    faq=''.join(f'<details class="faq__item m-faq"><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q,a in t['faq'])
    foot=re.sub(r'Built by .*?(?=<ul class="social")',e(t['foot'])+' ',footer_src,count=1,flags=re.S)
    foot=foot.replace('</footer>',langnav()+'</footer>')
    return f'''<!doctype html>
<html lang="{lang}" dir="{dr}"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
<title>{e(t['title'])}</title><meta name="description" content="{e(t['desc'])}" /><meta name="author" content="Ali Essam" />
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" /><meta name="color-scheme" content="dark light" /><meta name="theme-color" content="#0A0A12" />
<link rel="canonical" href="{url}" />
{alts()}<meta property="og:type" content="website" /><meta property="og:site_name" content="AlphaCode" /><meta property="og:locale" content="{og}" /><meta property="og:title" content="{e(t['title'])}" /><meta property="og:description" content="{e(t['desc'])}" /><meta property="og:url" content="{url}" /><meta property="og:image" content="{U}/og-image.png" /><meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" /><meta name="twitter:site" content="@alphaclicode" /><meta name="twitter:title" content="{e(t['title'])}" /><meta name="twitter:description" content="{e(t['desc'])}" /><meta name="twitter:image" content="{U}/og-image.png" />
<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" /><link rel="apple-touch-icon" href="/apple-touch-icon.png" /><link rel="manifest" href="/site.webmanifest" />
{font}<link rel="stylesheet" href="/styles.css?v=20261019" /><link rel="stylesheet" href="/theme.css?v=20261019" /><link rel="stylesheet" href="/modern.css?v=20261020" /><link rel="stylesheet" href="/pro.css?v=20261021" /><link rel="stylesheet" href="/pro2.css?v=20261022" />
<script type="application/ld+json">{json.dumps(ld,ensure_ascii=False)}</script></head>
<body><a class="skip" href="#main">Skip to content</a>
<header class="m-head"><div class="m-head__in"><a href="/{slug}/" class="nav__brand" aria-label="AlphaCode"><span class="p">$</span><span>alphacode</span></a>
<nav aria-label="Primary"><a href="/docs/" hreflang="en">{e(t['docs'])}</a><a href="/about/" hreflang="en">{e(t['about'])}</a><a class="keep" href="{GH}" rel="noopener">GitHub</a></nav>{sw}</div></header>
<main id="main" class="m-wrap">
<section class="m-hero"><h1>{e(t['h1a'])} <span>{e(t['h1b'])}</span></h1><p class="m-lede">{e(t['lede'])}</p>
<p style="margin-top:22px;display:flex;gap:12px;flex-wrap:wrap"><a class="btn btn--primary btn--lg" href="#install">{e(t['cta1'])}</a><a class="btn btn--ghost btn--lg" href="/docs/" hreflang="en">{e(t['cta2'])}</a></p></section>
<section class="m-sec"><h2>{e(t['why'])}</h2><div class="m-grid">{cards}</div></section>
<section class="m-sec" id="install"><h2>{e(t['inst_h'])}</h2><p>{e(t['inst_p'])}</p><div class="ins"><div class="ins__tabs" role="tablist">{tab('mac','bash — macOS / Linux','macOS / Linux')}{tab('win','PowerShell — Windows','Windows')}{tab('src','bash — source','Source')}</div>
<div class="ins__term"><div class="ins__bar"><span class="ins__dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="ins__title" id="insTitle">bash</span><button class="ins__copy" type="button" data-label="{e(t['copy'])}" data-done="{e(t['copied'])}">{e(t['copy'])}</button></div>
{pan('mac',MAC,'<span class="p">$</span> <span class="c">curl</span> <span class="o">-fsSL</span> https://raw.githubusercontent.com/dragonked2/alphacode/main/scripts/install.sh | <span class="c">bash</span>')}{pan('win',WIN,'<span class="p">PS&gt;</span> <span class="c">iwr</span> <span class="o">-useb</span> https://raw.githubusercontent.com/dragonked2/alphacode/main/scripts/install.ps1 | <span class="c">iex</span>')}{pan('src',SRC,'<span class="p">$</span> <span class="c">git clone</span> https://github.com/dragonked2/alphacode.git &amp;&amp; <span class="c">cd</span> alphacode &amp;&amp; <span class="c">cargo build</span> <span class="o">--release</span>')}</div>
<p style="margin:18px 0 0;color:var(--text-dim);font-size:14px">{e(t['verify'])}</p><ol class="ins__steps"><li>which alphacode</li><li>alphacode --version</li><li>alphacode doctor</li><li>alphacode</li></ol></div></section>
<section class="m-sec"><h2>{e(t['faq_h'])}</h2>{faq}<div class="m-note"><b>{e(t['note_t'])}</b> {e(t['note_p'])}</div></section>
</main>
{foot}
<script src="/pro2.js?v=20261022" defer></script><script src="/pro.js?v=20261021" defer></script><script src="/modern.js?v=20261020" defer></script><script src="/i18n.js?v=20261022" defer></script></body></html>'''
for loc in LOCALES:
    d=R/loc[0];d.mkdir(exist_ok=True);(d/'index.html').write_text(page(loc))
# homepage: hreflang + footer language list
h=R/'index.html';s=h.read_text()
s=re.sub(r'<link rel="alternate" hreflang="[^"]*" href="[^"]*" />\n?','',s)
s=s.replace('</head>',alts()+'</head>',1)
s=re.sub(r'<nav class="m-langs".*?</nav>','',s,flags=re.S)
s=s.replace('</footer>',langnav()+'</footer>',1)
if 'i18n.js' not in s: s=s.replace('</body>','<script src="/i18n.js?v=20261022" defer></script>\n</body>',1)
h.write_text(s)
# sitemap
sm=R/'sitemap.xml';t=sm.read_text()
t=re.sub(r'\s*<url><loc>[^<]*/(?:en-us|en-gb|ar-eg|ar-sa|ar-ae|nl-nl|de-de|fr-fr|es-es|pt-br|tr-tr)/</loc>.*?</url>','',t,flags=re.S)
t=re.sub(r'<xhtml:link[^>]*/>','',t)
if 'xmlns:xhtml' not in t: t=t.replace('<urlset ','<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml" ',1)
x=''.join(f'<xhtml:link rel="alternate" hreflang="{l[1]}" href="{U}/{l[0]}/"/>' for l in LOCALES)+f'<xhtml:link rel="alternate" hreflang="x-default" href="{U}/"/>'
t=t.replace(f'<loc>{U}/</loc>',f'<loc>{U}/</loc>{x}',1)
new=''.join(f'  <url><loc>{U}/{l[0]}/</loc><lastmod>2026-10-16</lastmod><changefreq>monthly</changefreq><priority>0.8</priority>{x}</url>\n' for l in LOCALES)
t=t.replace('</urlset>',new+'</urlset>');sm.write_text(t)
ll=R/'llms.txt';z=ll.read_text()
if '## Languages' not in z: z+='\n## Languages\n'+''.join(f'- [{l[5]}]({U}/{l[0]}/)\n' for l in LOCALES);ll.write_text(z)
print('built',len(LOCALES),'locale pages')
