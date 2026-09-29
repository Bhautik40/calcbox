"""Render share images (1200x630) for pages listed in .og-jobs.json (written by build.js). Only renders missing files unless --all."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
jobs = json.load(open(os.path.join(ROOT, '.og-jobs.json')))
ALL = '--all' in sys.argv
logo = '<svg viewBox="0 0 32 32" width="56" height="56"><rect width="32" height="32" rx="9" fill="#E4570B"/><path d="M9.5 12.5h5M12 10v5M18 12.5h4.5M9.8 19.8l4 4M13.8 19.8l-4 4M18 20.5h4.5M18 23.5h4.5" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/></svg>'
tpl = '''<html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#FAFAF8;color:#141414;font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;padding:64px 80px;display:flex;flex-direction:column;position:relative;overflow:hidden}
.top{display:flex;align-items:center;gap:16px;font-size:36px;font-weight:800;letter-spacing:-1px}
.ic{position:absolute;right:80px;top:56px;width:120px;height:120px;border-radius:32px;background:rgba(228,87,11,.1);color:#E4570B;display:grid;place-items:center}
.ic svg{width:68px;height:68px}
h1{margin-top:auto;font-size:64px;line-height:1.05;font-weight:800;letter-spacing:-2.5px;max-width:960px}
.big{margin-top:18px;font-size:92px;font-weight:800;letter-spacing:-4px;color:#E4570B;line-height:1.05;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:1040px}
.big.small{font-size:64px;letter-spacing:-2px}
.sub{margin-top:14px;font-size:30px;color:#6b6b66;max-width:720px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.url{position:absolute;right:80px;bottom:64px;font-size:28px;font-weight:700;background:#141414;color:#FAFAF8;padding:14px 26px;border-radius:999px}
</style></head><body><div class="top">''' + logo + '''CalcBox</div><div class="ic" id="ic"></div><h1 id="h"></h1><div class="big" id="b"></div><div class="sub" id="s"></div><div class="url">mycalcbox.in</div></body></html>'''
todo = [j for j in jobs if ALL or not os.path.exists(os.path.join(ROOT, 'static', j['file']))]
os.makedirs(os.path.join(ROOT, 'static', 'og'), exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 630}); pg.set_content(tpl)
    for j in todo:
        big = '' if j['icon'] == 'words' else (j.get('big') or '')
        pg.evaluate('''([ic,h,b,s,small])=>{document.getElementById('ic').innerHTML=ic;document.getElementById('h').textContent=h;const e=document.getElementById('b');e.textContent=b;e.className='big'+(small?' small':'');e.style.display=b?'':'none';document.getElementById('s').textContent=s;}''', [j['svg'], j['h'], big, j.get('sub') or '', len(big) > 14])
        pg.screenshot(path=os.path.join(ROOT, 'static', j['file']), type='png')
print('rendered', len(todo), 'of', len(jobs))
