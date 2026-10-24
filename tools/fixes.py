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

# ======================= v2: UX / SEO / CLS polish =======================
import sys;sys.path.insert(0,str(R/'tools'))
from i18n_data import LOCALES
LANG_LI=lambda cur:''.join(f'<li><a href="/{s}/" hreflang="{h}" lang="{h}"'+(' aria-current="true"' if s==cur else '')+f'>{lbl}</a></li>' for s,h,o,l,d,lbl in LOCALES)
NAV_STATIC=lambda cur:('<details class="m-lang m-lang--icon"><summary aria-label="Language"><span aria-hidden="true">🌐</span></summary><ul>'+LANG_LI(cur)+'</ul></details>'
 '<button class="m-theme" type="button" aria-label="Toggle light or dark theme">☾</button>'
 '<button type="button" class="nav__k" aria-label="Open command palette"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.500-3.500"></path></svg><kbd>CtrlK</kbd></button>')
COPY_SVG=('<svg class="i-copy" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V6a2 2 0 0 1 2-2h9"></path></svg>'
 '<svg class="i-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>')
HERO_BAR=('<div class="hero__install"><div class="hero__cmd" role="group" aria-label="Install command">'
 '<code data-os="unix"><span class="p">$</span>curl -fsSL https://raw.githubusercontent.com/dragonked2/alphacode/main/scripts/install.sh | bash</code>'
 '<code data-os="win" hidden><span class="p">PS&gt;</span>iwr -useb https://raw.githubusercontent.com/dragonked2/alphacode/main/scripts/install.ps1 | iex</code></div>'
 '<button class="hero__copy" type="button" aria-label="Copy install command">'+COPY_SVG+'<span class="sr-only" aria-live="polite"></span></button></div>'
 '<p class="hero__note">macOS, Linux and Windows · <a href="#install">all install options</a></p>')
FACTS=('<section class="facts" id="facts" aria-labelledby="facts-title"><div class="container"><header class="section__head">'
 '<p class="prompt-label"><span class="p">$</span> <span class="cmd">alphacode --about</span></p>'
 '<h2 class="section__title" id="facts-title">AlphaCode at a glance</h2>'
 '<p class="section__lede">AlphaCode is a free, open-source AI coding agent that lives in your terminal. It reads your codebase, edits files, runs tests and automates a browser, using the model provider you choose, or a built-in free one that needs no API key.</p></header>'
 '<dl class="facts__grid">'
 '<div class="facts__item"><dt>License</dt><dd>MIT, written in Rust. Free to use, modify and share.</dd></div>'
 '<div class="facts__item"><dt>Platforms</dt><dd>Windows, macOS and Linux</dd></div>'
 '<div class="facts__item"><dt>Cost to start</dt><dd>Free. A built-in free model provider works with no API key or signup.</dd></div>'
 '<div class="facts__item"><dt>Model providers</dt><dd>54, including Claude, GPT, Gemini, DeepSeek, Mistral, Groq, xAI and local models through Ollama, plus any OpenAI-compatible endpoint.</dd></div>'
 '<div class="facts__item"><dt>Built-in tools</dt><dd>40+ for file edits, code search, shell commands, web fetch, browser automation, desktop control and scheduling.</dd></div>'
 '<div class="facts__item"><dt>Parallel work</dt><dd>Swarm mode splits a big job across several agents and merges the results.</dd></div>'
 '<div class="facts__item"><dt>Extensions</dt><dd>Model Context Protocol (MCP) servers add extra tools.</dd></div>'
 '<div class="facts__item"><dt>Sessions</dt><dd>Pick up previous work with <code>alphacode --resume</code>.</dd></div>'
 '<div class="facts__item"><dt>Safety</dt><dd>Asks before risky actions, and you review the diff before keeping changes.</dd></div>'
 '</dl><p class="facts__more"><a href="#install">Install in one line</a> · <a href="/docs/">Read the documentation</a></p></div></section>')
HOMES=['index.html']+[f'{x[0]}/index.html' for x in LOCALES]
ALL=[p for p in (str(f.relative_to(R).as_posix()) for f in R.glob('**/*.html')) if not p.startswith(('tools/','assets/')) and not p.split('/')[-1].startswith('google') and p!='mcp.html']
for p in ALL:
    s=rd(p);cur=p.split('/')[0] if p.endswith('/index.html') and p.split('/')[0] in [l[0] for l in LOCALES] else None
    cta=s.find(class_='nav__cta')
    if cta and not cta.find(class_='m-lang'):
        frag=BeautifulSoup(NAV_STATIC(cur),'html.parser')
        for el in reversed(list(frag.contents)):cta.insert(0,el)
    nl=s.find(class_='nav__links')
    if nl:
        for a in nl.find_all('a',href=True):
            if a['href'].endswith('#install') and 'nav__dup' not in (a.get('class') or []):a['class']=(a.get('class') or [])+['nav__dup']
    for a in s.find_all('a',href=True):
        if re.search(r'(facebook\.com/sharer|linkedin\.com/sharing|x\.com/intent|twitter\.com/intent)',a['href']):a['rel']='nofollow noopener noreferrer'
        if a.get_text(strip=True)=='SVG demo' and a['href']=='#demo':a.string='Demo'
    if p in HOMES:
        sub=s.find(class_='hero__sub')
        if sub and 'AI pair programmer for your terminal' in sub.get_text():
            for t in sub.find_all(string=True):
                if 'AI pair programmer for your terminal' in t:t.replace_with(t.replace('AI pair programmer for your terminal','AI pair programmer that lives in your terminal'))
        elif sub and p in('en-us/index.html','en-gb/index.html') and 'lives in your terminal' not in sub.get_text():
            sub.string=sub.get_text().rstrip()+' It lives in your terminal.'
        c=s.find(class_='hero__cta')
        if c and not s.find(class_='hero__install'):c.insert_before(BeautifulSoup(HERO_BAR,'html.parser'))
        how=s.find('section',id='how')
        if how and not s.find(id='facts'):how.insert_after(BeautifulSoup(FACTS,'html.parser'))
    wr(p,s)
print('v2 fixes applied to',len(ALL),'pages')

# ---- v2b: pre-render the hero terminal transcript (crawlable, no-JS friendly, stable height) ----
STEPS=[('alphacode','<span class="l-dim">›</span> <span class="l-info">launching — no API key found, no key needed</span>'),
('provider','<span class="l-free">✓ free model provider ready</span> <span class="l-dim">$0 · 0 setup steps</span>'),
('you','<span class="l-info">"scan repo, plan migration to OAuth 2.1"</span>'),
('plan','<span class="l-warn">[planner]</span> <span class="l-info">decomposing goal…</span> <span class="l-dim">3 agents</span>'),
('agent-1','<span class="l-warn">[auth/routes.ts]</span> <span class="l-info">refactor login → authorization code</span>'),
('agent-2','<span class="l-warn">[auth/tokens.ts]</span> <span class="l-info">add PKCE, refresh-rotation</span>'),
('tests','<span class="l-info">running</span> <span class="l-dim">cargo test --workspace</span> <span class="l-ok">✓ 142/142</span>'),
('done','<span class="l-ok l-bold">✓ ready to commit</span> <span class="l-dim">2 files · 142 tests · $0 spent</span>')]
TRANSCRIPT=''.join(f'<div><span class="l-prompt">$</span> <span class="l-bold">{p}</span>  {t}</div>' for p,t in STEPS)
for p in HOMES:
    s=rd(p);b=s.find(id='demoBody')
    if b and not b.find('div'):
        b.append(BeautifulSoup(TRANSCRIPT,'html.parser'));wr(p,s)
print('hero transcript pre-rendered')
