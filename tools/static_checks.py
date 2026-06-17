#!/usr/bin/env python3
from pathlib import Path
import argparse, hashlib, json, subprocess, sys, zipfile

VERSION='7.5.0'
ROOT=Path(__file__).resolve().parents[1]
JS=[ROOT/'game.js',ROOT/'chapters.js',*sorted((ROOT/'modules').glob('*.js'))]
checks=[]
def check(name,ok,detail=''):
    checks.append((name,bool(ok),detail))

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--dist',required=True);args=ap.parse_args();dist=Path(args.dist).resolve()
    for f in JS:
        result=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
        check(f'JavaScript 語法：{f.name}',result.returncode==0,result.stderr.strip())
    try:
        manifest=json.loads((ROOT/'manifest.webmanifest').read_text(encoding='utf-8'))
        check('Manifest 可解析',True)
        check('Manifest 版本',VERSION in manifest.get('name',''),manifest.get('name',''))
        check('Manifest 相對 scope',manifest.get('scope')=='./')
        check('Manifest 相對 start_url',manifest.get('start_url')=='./')
    except Exception as e:
        check('Manifest 可解析',False,str(e))
    sw=(ROOT/'service-worker.js').read_text(encoding='utf-8')
    check('Service Worker 版本',f'liangshan-v{VERSION}-cache-1' in sw)
    required=['modules/dizha.js','modules/epic-chapters.js','modules/roguelike.js','modules/telemetry.js','LIVE_DEPLOYMENT_CHECKLIST.md','SCREEN_READER_CHECKLIST.md']
    for name in required:
        check(f'必要資產：{name}',(ROOT/name).exists())
        check(f'SW 預快取：{name}',f"./{name}" in sw)
    index=(ROOT/'index.html').read_text(encoding='utf-8')
    for name in ['modules/dizha.js','modules/epic-chapters.js','modules/roguelike.js','modules/telemetry.js']:
        check(f'首頁載入：{name}',name in index)
    rules=(ROOT/'firebase.rules').read_text(encoding='utf-8')
    check('Rules 保護主存檔','/saves/{saveId}' in rules and 'request.auth.uid == userId' in rules)
    check('Rules 保護版本歷史','/history/{historyId}' in rules and 'request.auth.uid == userId' in rules)
    zip_path=dist/f'Liangshan_v{VERSION}_Windows.zip';stand=dist/f'Liangshan_v{VERSION}_Standalone.html';sha=dist/f'Liangshan_v{VERSION}_Windows.sha256.txt'
    check('Windows ZIP 存在',zip_path.exists())
    check('單一 HTML 存在',stand.exists())
    check('SHA 檔存在',sha.exists())
    if zip_path.exists():
        try:
            with zipfile.ZipFile(zip_path) as z:
                bad=z.testzip();names=z.namelist()
                check('ZIP CRC',bad is None,str(bad))
                check('ZIP 全英文路徑',all(all(ord(c)<128 for c in n) for n in names))
                check('ZIP 單一根目錄',all(n.startswith(f'Liangshan_v{VERSION}/') for n in names))
                check('ZIP 無巢狀發布檔',not any(n.endswith('_Windows.zip') or n.endswith('_Windows.sha256.txt') for n in names))
                check('ZIP 最長路徑 < 220',max(map(len,names),default=0)<220,str(max(map(len,names),default=0)))
        except Exception as e:
            check('ZIP CRC',False,str(e))
    if stand.exists():
        text=stand.read_text(encoding='utf-8')
        check('Standalone 版本',f'v{VERSION}' in text)
        check('Standalone 無外部遊戲 JS',not any(f'src="{x}"' in text or f'src="./{x}"' in text for x in ['game.js','chapters.js','modules/dizha.js']))
    if zip_path.exists() and sha.exists():
        actual=hashlib.sha256(zip_path.read_bytes()).hexdigest();expected=sha.read_text(encoding='ascii').split()[0]
        check('SHA-256 相符',actual==expected,f'{actual} != {expected}')
    passed=sum(ok for _,ok,_ in checks)
    print(json.dumps({'passed':passed,'total':len(checks),'failed':[{'name':n,'detail':d} for n,ok,d in checks if not ok]},ensure_ascii=False,indent=2))
    return 0 if passed==len(checks) else 1
if __name__=='__main__':sys.exit(main())
