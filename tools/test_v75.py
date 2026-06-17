#!/usr/bin/env python3
from pathlib import Path
from playwright.sync_api import sync_playwright
import argparse, json, sys

ROOT=Path(__file__).resolve().parents[1]
ap=argparse.ArgumentParser();ap.add_argument('--standalone',default=str(ROOT/'Liangshan_v7.5.0_Standalone.html'));args=ap.parse_args()
STANDALONE=Path(args.standalone)
if not STANDALONE.exists():
    raise SystemExit('請先執行 build_release.py 產生單一 HTML。')
html=STANDALONE.read_text(encoding='utf-8')
checks=[]
def check(name, cond, detail=''):
    checks.append((name,bool(cond),detail))
    if not cond:
        print('FAIL',name,detail)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1000})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda m:errors.append(f'console:{m.text}') if m.type=='error' else None)
    page.set_content(html,wait_until='load')
    page.wait_for_timeout(300)

    check('版本顯示',page.evaluate('__LIANGSHAN_TEST__.version')=='7.5.0')
    check('108 章回',page.evaluate('__LIANGSHAN_TEST__.chapters.length')==108)
    kits=page.evaluate('__LIANGSHAN_TEST__.allHeroKits()')
    check('108 英雄技能',len(kits)==108)
    check('技能名稱唯一',len({x['skillName'] for x in kits})==108)
    check('被動名稱唯一',len({x['passiveName'] for x in kits})==108)
    check('覺醒名稱唯一',len({x['awakeningName'] for x in kits})==108)
    dizha=page.evaluate('Object.values(window.LS75Dizha.records)')
    check('72 地煞資料',len(dizha)==72)
    check('72 地煞機制簽章唯一',len({x['signature'] for x in dizha})==72)
    check('72 地煞機制鍵唯一',len({x['mechanic'] for x in dizha})==72)
    check('12 手工章回',page.evaluate('window.LS75Epic.count')==12)
    epic_counts=page.evaluate('[1,2,3,5,9,10,14,15,16,21,28,108].map(n=>__LIANGSHAN_TEST__.storyMode(n).choices.length)')
    check('手工章回三方案',all(x==3 for x in epic_counts),str(epic_counts))

    # 存檔結構與 108 回結算
    schema=page.evaluate('__LIANGSHAN_TEST__.schema()')
    check('Schema v5',schema.get('version')==5)
    check('初始存檔有效',schema.get('valid',{}).get('ok') is True,str(schema))
    completed=page.evaluate('__LIANGSHAN_TEST__.bulkAutoComplete()')
    check('108 回可批次結算',completed==108,str(completed))

    # 地煞實戰機制
    page.evaluate('__LIANGSHAN_TEST__.prepareBattle(37,2)')
    before=page.evaluate('__LIANGSHAN_TEST__.getState().current.battle.log.length')
    page.evaluate('__LIANGSHAN_TEST__.battleAction("skill")')
    page.wait_for_timeout(50)
    after=page.evaluate('__LIANGSHAN_TEST__.getState().current.battle.log.length')
    check('地煞專屬技可執行',after>before,f'{before}->{after}')

    # 首領門檻
    page.evaluate('__LIANGSHAN_TEST__.prepareBattle(1,2)')
    boss1=page.evaluate('__LIANGSHAN_TEST__.forceBossHit(999999)')
    check('首領停在 70%',boss1 and boss1['phase']==2 and boss1['hp']>=boss1['maxHp']*.69,str(boss1 and (boss1['phase'],boss1['hp'],boss1['maxHp'])))
    boss2=page.evaluate('__LIANGSHAN_TEST__.forceBossHit(999999)')
    check('首領停在 35%',boss2 and boss2['phase']==3 and boss2['hp']>=boss2['maxHp']*.34,str(boss2 and (boss2['phase'],boss2['hp'],boss2['maxHp'])))

    # Rogue-like / weekly / simulation
    page.evaluate('__LIANGSHAN_TEST__.forceWinBattle()')
    page.evaluate('__LIANGSHAN_TEST__.renderEndgame()')
    page.evaluate('__LIANGSHAN_TEST__.startRogueRun()')
    rr=page.evaluate('__LIANGSHAN_TEST__.getState().endgame.rogue')
    check('Rogue 九節點',rr and len(rr['nodes'])==9,str(rr and len(rr['nodes'])))
    check('Rogue 含終局首領',rr and rr['nodes'][-1]['type']=='boss')
    page.evaluate('__LIANGSHAN_TEST__.runBalanceSimulation()')
    sim=page.evaluate('__LIANGSHAN_TEST__.getState().telemetry.lastSimulation')
    check('500 組平衡模擬',sim and sim.get('iterations')==500,str(sim))

    # 裝備與專武
    page.evaluate('__LIANGSHAN_TEST__.setSilver(999999)')
    page.evaluate('__LIANGSHAN_TEST__.setMaterials({iron:999,wood:999,cloth:999,essence:999})')
    page.evaluate('__LIANGSHAN_TEST__.craftExclusive(37)')
    st=page.evaluate('__LIANGSHAN_TEST__.getState()')
    ex=[x for x in st['inventory']['items'] if x.get('exclusiveHero')==37]
    check('英雄專屬裝備',len(ex)==1,str(len(ex)))

    # 派遣與奇遇
    missions=page.evaluate('__LIANGSHAN_TEST__.endgameData().missions')
    mission=missions[0]['key'] if missions else ''
    page.evaluate('(args)=>__LIANGSHAN_TEST__.startDispatch(args[0],args[1])',[mission,37])
    dispatches=page.evaluate('__LIANGSHAN_TEST__.getState().dispatches')
    check('派遣可開始',len(dispatches)>=1,str(dispatches))
    if dispatches:
        did=dispatches[0]['id']
        page.evaluate('(id)=>__LIANGSHAN_TEST__.finishDispatchNow(id)',did)
        page.evaluate('(id)=>__LIANGSHAN_TEST__.claimDispatch(id)',did)
        check('派遣可領取',len(page.evaluate('__LIANGSHAN_TEST__.getState().dispatches'))==0)

    # 智慧合併
    local=page.evaluate('__LIANGSHAN_TEST__.getState()')
    remote=json.loads(json.dumps(local))
    remote['silver']=local['silver']+100
    remote['completed']['1']['score']=100
    merged=page.evaluate('(x)=>window.LS75SaveSchema.mergeStates(x[0],x[1])',[local,remote])
    check('雲端智慧合併保留較高銀兩',merged['silver']==remote['silver'])
    check('雲端智慧合併保留較高章回成績',merged['completed']['1']['score']==100)


    # Firebase REST 模擬（不等同真實專案跨裝置驗收）
    cloud_result=page.evaluate("""async()=>{
      const docs={};
      window.fetch=async(url,opt={})=>{
        const body=opt.body?JSON.parse(opt.body):null;
        if(String(url).includes('accounts:signInWithPassword'))return{ok:true,status:200,json:async()=>({localId:'uid-test',idToken:'token-test',refreshToken:'refresh-test',expiresIn:'3600',email:'tester@example.com'})};
        if(opt.method==='PATCH'){docs[url]=body;return{ok:true,status:200,json:async()=>({name:url,fields:body.fields,updateTime:new Date().toISOString()})};}
        if(String(url).includes('/history?pageSize=')){return{ok:true,status:200,json:async()=>({documents:Object.entries(docs).filter(([k])=>k.includes('/history/')).map(([name,v])=>({name,fields:v.fields,updateTime:new Date().toISOString()}))})};}
        if(docs[url])return{ok:true,status:200,json:async()=>({name:url,fields:docs[url].fields,updateTime:new Date().toISOString()})};
        return{ok:false,status:404,json:async()=>({error:{status:'NOT_FOUND'}})};
      };
      LS75Cloud.configure({apiKey:'AIza-test-key-1234567890',projectId:'liangshan-test',authDomain:'liangshan-test.firebaseapp.com'});
      await LS75Cloud.signIn('tester@example.com','123456');
      const payload={version:'7.5.0',state:__LIANGSHAN_TEST__.getState(),prefs:__LIANGSHAN_TEST__.getPrefs()};
      await LS75Cloud.upload(payload,'checksum-test','7.5.0','自動測試');
      const main=await LS75Cloud.download();
      const history=await LS75Cloud.listHistory(10);
      return{signedIn:LS75Cloud.getStatus().signedIn,main:!!main,history:history.length};
    }""")
    check('Firebase 模擬登入',cloud_result.get('signedIn') is True,str(cloud_result))
    check('Firebase 模擬主存檔',cloud_result.get('main') is True,str(cloud_result))
    check('Firebase 模擬版本歷史',cloud_result.get('history',0)>=1,str(cloud_result))

    # 備份輪替（以可用 IndexedDB 環境為準）
    for i in range(12):
        page.evaluate('(i)=>__LIANGSHAN_TEST__.createBackup(`test-${i}`)',i)
    page.wait_for_timeout(500)
    bc=page.evaluate('__LIANGSHAN_TEST__.backupCount()')
    check('輪替備份不超過 10',0<=bc<=10,str(bc))

    page.evaluate('document.querySelector("[data-modal=close]")?.click()')

    # 大型存檔與低效能模式
    total_items=page.evaluate('__LIANGSHAN_TEST__.inflateInventory(800)')
    check('大型裝備庫可建立',total_items>=800,str(total_items))
    page.evaluate('__LIANGSHAN_TEST__.setPreference("lowPower",true)')
    page.locator('[data-act="forge"]').first.click(timeout=5000)
    page.wait_for_timeout(50)
    rendered_items=page.locator('.equipment-grid .equipment-card').count()
    check('低效能裝備分頁上限',rendered_items<=16,str(rendered_items))
    page.evaluate('__LIANGSHAN_TEST__.setPreference("screenReaderMode",true)')
    check('螢幕閱讀器模式套用',page.evaluate('document.body.classList.contains("screen-reader-mode")'))

    # UI / a11y / mobile
    page.evaluate('__LIANGSHAN_TEST__.renderCloud()')
    check('雲端頁',page.locator('h1').first.inner_text()=='跨裝置雲端存檔與版本歷史')
    audit=page.evaluate('window.LS75Accessibility.audit(document)')
    check('自動無障礙基本稽核',audit['ok'],str(audit['issues']))
    page.set_viewport_size({'width':390,'height':844})
    page.evaluate('__LIANGSHAN_TEST__.renderEndgame()')
    overflow=page.evaluate('document.documentElement.scrollWidth-document.documentElement.clientWidth')
    check('390px 無水平溢位',overflow<=1,str(overflow))
    check('無 JavaScript 錯誤',not errors,str(errors))
    browser.close()

passed=sum(1 for _,ok,_ in checks if ok)
print(json.dumps({'passed':passed,'total':len(checks),'failed':[{'name':n,'detail':d} for n,ok,d in checks if not ok]},ensure_ascii=False,indent=2))
sys.exit(0 if passed==len(checks) else 1)
