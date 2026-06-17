#!/usr/bin/env python3
from pathlib import Path
import argparse, hashlib, re, zipfile

VERSION='7.5.0'
MODULES=[
    'chapters.js','modules/tiangang.js','modules/dizha.js','modules/save-schema.js',
    'modules/cloud-sync.js','modules/endgame.js','modules/content-v74.js',
    'modules/epic-chapters.js','modules/roguelike.js','modules/telemetry.js',
    'modules/accessibility.js','game.js'
]
EXCLUDE={
    'game.v73.backup.js','Liangshan_v7.3.0_Standalone.html',
    'Liangshan_v7.4.0_Standalone.html','Liangshan_v7.5.0_Standalone.html'
}
RELEASE_PATTERNS=(f'Liangshan_v{VERSION}_Windows.zip',f'Liangshan_v{VERSION}_Windows.sha256.txt')

def standalone(src:Path,out:Path):
    html=(src/'index.html').read_text(encoding='utf-8')
    css=(src/'styles.css').read_text(encoding='utf-8')
    html=re.sub(r'<link rel="stylesheet" href="(?:\./)?styles\.css">',f'<style>\n{css}\n</style>',html)
    html=re.sub(r'\s*<link rel="manifest"[^>]+>','',html)
    html=re.sub(r'\s*<link rel="icon"[^>]+>','',html)
    bundles=[]
    for name in MODULES:
        js=(src/name).read_text(encoding='utf-8')
        pat=rf'\s*<script defer src="(?:\./)?{re.escape(name)}"></script>'
        html=re.sub(pat,'',html)
        bundles.append(f'<script>\n{js}\n</script>')
    html=html.replace('</body>', '\n'.join(bundles)+'\n</body>')
    out.write_text(html,encoding='utf-8')

def should_skip(path:Path,src:Path,out:Path):
    if not path.is_file() or '.git' in path.parts:
        return True
    if path.name in EXCLUDE or path.name in RELEASE_PATTERNS:
        return True
    try:
        path.relative_to(out)
        return True
    except ValueError:
        pass
    rel=path.relative_to(src)
    return any(part in {'dist','__pycache__'} for part in rel.parts)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--source',default='.')
    ap.add_argument('--output',default='dist')
    args=ap.parse_args()
    src=Path(args.source).resolve();out=Path(args.output).resolve();out.mkdir(parents=True,exist_ok=True)
    stand=out/f'Liangshan_v{VERSION}_Standalone.html';standalone(src,stand)
    zip_path=out/f'Liangshan_v{VERSION}_Windows.zip'
    with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for f in sorted(src.rglob('*')):
            if should_skip(f,src,out):
                continue
            rel=f.relative_to(src)
            z.write(f,Path(f'Liangshan_v{VERSION}')/rel)
        z.write(stand,Path(f'Liangshan_v{VERSION}')/stand.name)
    digest=hashlib.sha256(zip_path.read_bytes()).hexdigest()
    sha=out/f'Liangshan_v{VERSION}_Windows.sha256.txt'
    sha.write_text(f'{digest}  {zip_path.name}\n',encoding='ascii')
    print(zip_path);print(digest)
if __name__=='__main__':main()
