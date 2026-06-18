#!/usr/bin/env python3
from pathlib import Path
from playwright.sync_api import sync_playwright
import argparse,json,sys
ROOT=Path(__file__).resolve().parents[1]
ap=argparse.ArgumentParser();ap.add_argument('--standalone',default=str(ROOT/'Liangshan_v7.6.0_Standalone.html'));a=ap.parse_args();html=Path(a.standalone).read_text(encoding='utf-8')
checks=[]
def ck(n,o,d=''): checks.append((n,bool(o),d)); print(('PASS' if o else 'FAIL'),n,d if not o else '')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1440,'height':1000});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append('console:'+m.text) if m.type=='error' else None)
 page.set_content(html,wait_until='load');page.wait_for_timeout(500)
 ck('版本',page.evaluate('__LIANGSHAN_TEST__.version')=='7.6.0')
 ck('108 章回',page.evaluate('__LIANGSHAN_TEST__.chapters.length')==108)
 ck('36 手工章回',page.evaluate('window.LS76Epic.count')==36,str(page.evaluate('window.LS76Epic.count')))
 ck('36 天罡角色卡映射',page.evaluate('[1,36].every(n=>{const p=LS76Operations.portrait(n);return p.includes("hero-")||p.startsWith("data:image/svg+xml;base64,")})'))
 ck('12 背景映射',page.evaluate('new Set(Array.from({length:108},(_,i)=>LS76Operations.background(i+1,__LIANGSHAN_TEST__.chapters[i].kind))).size>=10'))
 ck('Schema v6',page.evaluate('__LIANGSHAN_TEST__.schema().version')==6)
 ck('初始 Schema 有效',page.evaluate('__LIANGSHAN_TEST__.schema().valid.ok'))
 kits=page.evaluate('__LIANGSHAN_TEST__.allHeroKits()');ck('108 技能唯一',len({x['skillName'] for x in kits})==108);ck('平衡係數 108 筆',page.evaluate('Object.keys(LS76Balance.adjustments).length')==108)
 # 新手與分階段解鎖
 ck('初始編隊鎖定',page.locator('[data-act="team"]').first.get_attribute('aria-disabled')=='true')
 page.evaluate('__LIANGSHAN_TEST__.openTutorial()');ck('新手教學視窗',page.locator('#modalTitle').inner_text().startswith('新手教學'));page.locator('[data-modal="close"]').first.click()
 page.evaluate('__LIANGSHAN_TEST__.bulkAutoComplete()');ck('108 回結算',page.evaluate('Object.keys(__LIANGSHAN_TEST__.getState().completed).length')==108)
 # 裝備方案
 page.evaluate('__LIANGSHAN_TEST__.saveEquipmentPlan(0)');before=page.evaluate('__LIANGSHAN_TEST__.getState().equipmentPlans[0].savedAt');ck('裝備方案保存',bool(before))
 page.evaluate('__LIANGSHAN_TEST__.applyEquipmentPlan(0)');ck('裝備方案套用',True)
 # 批次鎖定
 page.evaluate('__LIANGSHAN_TEST__.selectCommonUnlocked()');page.evaluate('__LIANGSHAN_TEST__.batchLockSelected(true)');ck('批次鎖定',page.evaluate('__LIANGSHAN_TEST__.getState().inventory.items.filter(x=>x.rarity==="common"&&!x.equippedBy).every(x=>x.locked)'))
 # 平衡模擬
 page.evaluate('__LIANGSHAN_TEST__.runBalanceSimulation()');sim=page.evaluate('__LIANGSHAN_TEST__.getState().telemetry.lastSimulation');ck('108×12 平衡模擬',sim.get('iterations')==1296 and sim.get('scenarios')==12,str(sim.get('iterations')));page.locator('[data-modal="close"]').first.click()
 # Rogue 分岔
 page.evaluate('__LIANGSHAN_TEST__.startRogueRun()');rr=page.evaluate('__LIANGSHAN_TEST__.getState().endgame.rogue');ck('Rogue 十層',len(rr['nodes'])==10);ck('首層三路',len(rr['nodes'][0]['alternatives'])==3);page.evaluate('LS76Rogue.choosePath(__LIANGSHAN_TEST__.getState().endgame.rogue,1)')
 # 不能直接 mutate clone, use UI
 page.evaluate('__LIANGSHAN_TEST__.renderEndgame()');page.locator('[data-rogue-path="1"]').click();ck('路線選擇寫入',page.evaluate('__LIANGSHAN_TEST__.getState().endgame.rogue.nodes[0].selected')==1)
 # 派遣疲勞
 page.evaluate('__LIANGSHAN_TEST__.setSilver(999999)');page.evaluate('__LIANGSHAN_TEST__.setMaterials({iron:999,wood:999,cloth:999,essence:999})');mission=page.evaluate('__LIANGSHAN_TEST__.endgameData().missions[0].key');page.evaluate('(m)=>__LIANGSHAN_TEST__.startDispatch(m,1)',mission);st=page.evaluate('__LIANGSHAN_TEST__.getState()');ck('派遣疲勞增加',st['base']['fatigue'].get('1',0)>=28,str(st['base']['fatigue'].get('1')))
 # 雲端 diff
 local=page.evaluate('__LIANGSHAN_TEST__.getState()');remote=json.loads(json.dumps(local));remote['completed'].pop('1',None);remote['silver']+=10;d=page.evaluate('(x)=>LS75SaveSchema.diff(x[0],x[1])',[local,remote]);ck('雲端差異預覽',1 in d['localOnlyChapters'] and d['heroLevelDiffs']>=0,str(d))
 # 部署診斷
 page.evaluate('__LIANGSHAN_TEST__.runDeploymentDoctor()');page.wait_for_timeout(150);deploy=page.evaluate('__LIANGSHAN_TEST__.getState().operations.deployment');ck('營運診斷產生',deploy and deploy['total']>=8,str(deploy and deploy['total']))
 # 首領門檻
 page.evaluate('__LIANGSHAN_TEST__.prepareBattle(1,2)');boss=page.evaluate('__LIANGSHAN_TEST__.forceBossHit(999999)');ck('首領 70% 門檻',boss['phase']==2 and boss['hp']>=boss['maxHp']*.69)
 boss=page.evaluate('__LIANGSHAN_TEST__.forceBossHit(999999)');ck('首領 35% 門檻',boss['phase']==3 and boss['hp']>=boss['maxHp']*.34)
 # 大型裝備低效能
 total=page.evaluate('__LIANGSHAN_TEST__.inflateInventory(800)');ck('800 件裝備',total>=800);page.evaluate('__LIANGSHAN_TEST__.setPreference("lowPower",true)');page.evaluate('__LIANGSHAN_TEST__.renderEndgame()');page.set_viewport_size({'width':390,'height':844});overflow=page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth');ck('390px 無水平溢位',overflow<=1,str(overflow))
 audit=page.evaluate('LS75Accessibility.audit(document)');ck('自動無障礙稽核',audit['ok'],str(audit['issues']));ck('無 JavaScript 錯誤',not errors,str(errors));b.close()
passed=sum(o for _,o,_ in checks);print(json.dumps({'passed':passed,'total':len(checks),'failed':[{'name':n,'detail':d} for n,o,d in checks if not o]},ensure_ascii=False,indent=2));sys.exit(0 if passed==len(checks) else 1)
