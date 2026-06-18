#!/usr/bin/env python3
from pathlib import Path
import argparse,hashlib,json,subprocess,sys,zipfile
VERSION='7.6.0';ROOT=Path(__file__).resolve().parents[1];checks=[]
def check(n,o,d=''):checks.append((n,bool(o),d))
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--dist',required=True);a=ap.parse_args();dist=Path(a.dist)
 for f in [ROOT/'game.js',ROOT/'chapters.js',*sorted((ROOT/'modules').glob('*.js'))]:
  r=subprocess.run(['node','--check',str(f)],capture_output=True,text=True);check(f'JavaScript：{f.name}',r.returncode==0,r.stderr)
 try:m=json.loads((ROOT/'manifest.webmanifest').read_text());check('Manifest 解析',True);check('Manifest 版本',VERSION in m['name']);check('相對 scope/start',m['scope']=='./' and m['start_url']=='./')
 except Exception as e:check('Manifest 解析',False,str(e))
 sw=(ROOT/'service-worker.js').read_text();check('SW 版本',f'liangshan-v{VERSION}-cache-1' in sw)
 required=['modules/epic-chapters-v76.js','modules/roguelike-v76.js','modules/balance-v76.js','modules/operations-v76.js','modules/audio-v76.js','LIVE_DEPLOYMENT_CHECKLIST.md','SCREEN_READER_CHECKLIST.md']
 for n in required:check(f'必要資產 {n}',(ROOT/n).exists());check(f'SW 快取 {n}',f'./{n}' in sw)
 check('36 角色卡',len(list((ROOT/'assets/portraits').glob('hero-*.svg')))==36);check('12 背景',len(list((ROOT/'assets/backgrounds').glob('scene-*.svg')))==12)
 idx=(ROOT/'index.html').read_text();
 for n in ['modules/epic-chapters-v76.js','modules/roguelike-v76.js','modules/balance-v76.js','modules/operations-v76.js','modules/audio-v76.js']:check(f'首頁載入 {n}',n in idx)
 z=dist/f'Liangshan_v{VERSION}_Windows.zip';h=dist/f'Liangshan_v{VERSION}_Standalone.html';sha=dist/f'Liangshan_v{VERSION}_Windows.sha256.txt'
 for n,x in [('ZIP',z),('Standalone',h),('SHA',sha)]:check(f'{n} 存在',x.exists())
 if z.exists():
  with zipfile.ZipFile(z) as q:names=q.namelist();check('ZIP CRC',q.testzip() is None);check('英文路徑',all(all(ord(c)<128 for c in n) for n in names));check('單一根目錄',all(n.startswith(f'Liangshan_v{VERSION}/') for n in names));check('路徑長度',max(map(len,names))<220,str(max(map(len,names))))
 if h.exists():
  t=h.read_text();check('Standalone 版本',f'v{VERSION}' in t);check('Standalone 無外部遊戲 JS','src="game.js"' not in t and 'src="./game.js"' not in t);check('Standalone 內嵌角色卡','data:image/svg+xml;base64,' in t and 'data-standalone-assets="embedded"' in t)
 if z.exists() and sha.exists():check('SHA 相符',hashlib.sha256(z.read_bytes()).hexdigest()==sha.read_text().split()[0])
 passed=sum(o for _,o,_ in checks);print(json.dumps({'passed':passed,'total':len(checks),'failed':[{'name':n,'detail':d} for n,o,d in checks if not o]},ensure_ascii=False,indent=2));return 0 if passed==len(checks) else 1
if __name__=='__main__':sys.exit(main())
