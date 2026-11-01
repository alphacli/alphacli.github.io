#!/usr/bin/env python3
"""Ping IndexNow (Bing, Yandex, Seznam, Naver) with every URL in sitemap.xml. Run AFTER deploying."""
import re, json, os, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = '5db844014a1b414f13881d85223e09db'
urls = re.findall(r'<loc>([^<]+)</loc>', open(ROOT + '/sitemap.xml', encoding='utf8').read())
body = json.dumps({'host': 'alphacli.github.io', 'key': KEY, 'keyLocation': f'https://alphacli.github.io/{KEY}.txt', 'urlList': urls}).encode()
req = urllib.request.Request('https://api.indexnow.org/indexnow', body, {'Content-Type': 'application/json; charset=utf-8'})
print(urllib.request.urlopen(req).status, 'submitted', len(urls), 'urls')
