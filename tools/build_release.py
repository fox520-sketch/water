#!/usr/bin/env python3
from pathlib import Path
import argparse, hashlib, re, zipfile
VERSION='7.7.0'
MODULES=[
 'chapters.js','modules/tiangang.js','modules/dizha.js','modules/save-schema.js','modules/cloud-sync.js','modules/endgame.js','modules/content-v74.js','modules/epic-chapters.js','modules/epic-chapters-v76.js','modules/roguelike.js','modules/roguelike-v76.js','modules/telemetry.js','modules/balance-v76.js','modules/operations-v76.js','modules/epic-chapters-v77.js','modules/roguelike-v77.js','modules/balance-v77.js','modules/operations-v77.js','modules/audio-v76.js','modules/accessibility.js','game.js'
]
def standalone(src,out):
 html=(src/'index.html').read_text(encoding='utf-8');css=(src/'styles.css').read_text(encoding='utf-8')
 html=re.sub(r'<link rel="stylesheet" href="(?:\./)?styles\.css">',f'<style>\n{css}\n</style>',html)
 html=re.sub(r'\s*<link rel="manifest"[^>]+>','',html);html=re.sub(r'\s*<link rel="icon"[^>]+>','',html)
 bundles=[]
 for name in MODULES:
  js=(src/name).read_text(encoding='utf-8');html=re.sub(rf'\s*<script defer src="(?:\./)?{re.escape(name)}"></script>','',html);bundles.append(f'<script>\n{js}\n</script>')
 # SVG assets remain relative in standalone, so embed the procedural portraits/backgrounds as data URLs in the HTML via CSS variables map.
 assets={}
 for folder in ['portraits','backgrounds']:
  for f in (src/'assets'/folder).glob('*.svg'):
   import base64
   assets[f'assets/{folder}/{f.name}']='data:image/svg+xml;base64,'+base64.b64encode(f.read_bytes()).decode()
 if assets:
  import json
  bundles.insert(0,'<script>window.__LS76_ASSET_MAP__='+json.dumps(assets,separators=(",",":"))+';</script>')
 html=html.replace('</body>','\n'.join(bundles)+'\n</body>')
 if assets:
  html=html.replace('<body ','<body data-standalone-assets="embedded" ',1)
 out.write_text(html,encoding='utf-8')

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--source',default='.');ap.add_argument('--output',default='dist');a=ap.parse_args();src=Path(a.source).resolve();out=Path(a.output).resolve();out.mkdir(parents=True,exist_ok=True)
 stand=out/f'Liangshan_v{VERSION}_Standalone.html';standalone(src,stand);zip_path=out/f'Liangshan_v{VERSION}_Windows.zip'
 with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for f in sorted(src.rglob('*')):
   if not f.is_file() or '.git' in f.parts or 'dist' in f.relative_to(src).parts or '__pycache__' in f.parts or f.name.endswith('_Windows.zip') or f.name.endswith('_Windows.sha256.txt') or f.name.endswith('_Standalone.html') or f.name=='game.v75.backup.js':continue
   z.write(f,Path(Path(f'Liangshan_v{VERSION}'))/f.relative_to(src))
  z.write(stand,Path(Path(f'Liangshan_v{VERSION}'))/stand.name)
 digest=hashlib.sha256(zip_path.read_bytes()).hexdigest();(out/f'Liangshan_v{VERSION}_Windows.sha256.txt').write_text(f'{digest}  {zip_path.name}\n',encoding='ascii');print(zip_path);print(digest)
if __name__=='__main__':main()
