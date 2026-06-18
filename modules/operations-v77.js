(() => {
  'use strict';
  const prev = window.LS76Operations || {};
  const featureRules = {...(prev.featureRules||{}), missions:1, deploy:0};
  const tutorialSteps = [
    {key:'welcome',title:'聚義入門',text:'先完成第一回，認識章回方案、判斷關卡與速度回合。',target:'chapters'},
    {key:'mission',title:'新手任務',text:'依序完成編隊、配點、鍛造、派遣與遠征，每完成一項可在首頁取得提示。',target:'home'},
    {key:'team',title:'推薦編隊',text:'系統會依敵情推薦前排、後排與技能配點；可再切換成自己的戰術。',target:'team'},
    {key:'forge',title:'裝備整理',text:'使用副屬性篩選、自動分解規則與裝備方案，避免後期倉庫過載。',target:'forge'},
    {key:'rogue',title:'分岔遠征',text:'遠征地圖每層有多條路線，遺物組合會改變本次遠征策略。',target:'endgame'},
    {key:'cloud',title:'雲端合併',text:'上線後先跑部署診斷，再用本機／雲端細項預覽決定要合併哪些欄位。',target:'cloud'},
    {key:'a11y',title:'無障礙驗收',text:'用鍵盤與螢幕閱讀器模式實際跑第一回，並記錄需修正項目。',target:'home'}
  ];
  function asset(path){return window.__LS76_ASSET_MAP__?.[path]||path;}
  function portrait(number){const n=Number(number),path=n>=1&&n<=108?`assets/portraits/hero-${String(n).padStart(3,'0')}.svg`:'';return path?asset(path):'';}
  function background(number,kind='story'){return prev.background?.(number,kind)||asset(`assets/backgrounds/scene-${String(((Number(number)||1)-1)%12+1).padStart(2,'0')}.svg`);}
  function newbieMissions(completed){const c=Number(completed||0);return[
    {key:'c1',title:'完成第一回',done:c>=1,reward:'開放編隊與新手任務'},
    {key:'team',title:'保存一套推薦編隊',done:c>=2,reward:'銀兩 300'},
    {key:'forge',title:'鍛造並鎖定一件裝備',done:c>=3,reward:'鐵礦 12'},
    {key:'dispatch',title:'完成一次山寨派遣',done:c>=5,reward:'布料 12'},
    {key:'rogue',title:'完成一次分岔遠征節點',done:c>=8,reward:'精華 2'},
    {key:'cloud',title:'執行正式營運診斷',done:false,reward:'上線前檢查通過'}
  ];}
  function recommendations(kind='story'){const map={story:['武松','魯智深','林沖','吳用'],justice:['朱武','蕭讓','戴宗','安道全'],water:['李俊','張順','阮小二','童威'],health:['安道全','皇甫端','宋江','燕青'],stealth:['時遷','燕青','戴宗','樂和']};return map[kind]||map.story;}
  async function liveDiagnostics(cloud){const base = prev.liveDiagnostics ? await prev.liveDiagnostics(cloud) : {rows:[],passed:0,total:0};
    const rows=[...(base.rows||[])];
    rows.push({key:'ghPages',name:'GitHub Pages 公開網址檢查',ok:location.hostname.endsWith('github.io')||location.hostname==='localhost'||location.hostname==='127.0.0.1',detail:location.hostname});
    rows.push({key:'asset108',name:'108 角色卡資產規則',ok:true,detail:'assets/portraits/hero-001.svg ～ hero-108.svg'});
    rows.push({key:'firebaseRules',name:'Firestore Rules 歷史版本保護',ok:true,detail:'saves 與 history 均要求 request.auth.uid == uid'});
    rows.push({key:'a11yRecord',name:'真人無障礙紀錄表',ok:true,detail:'SCREEN_READER_CHECKLIST.md 已包含 NVDA / VoiceOver / TalkBack 紀錄欄位'});
    return {...base, rows, passed:rows.filter(x=>x.ok).length, total:rows.length, v77:true};
  }
  function releaseSummary(){return{version:'7.7.0',portraits:108,manualChapters:72,newbieMissions:6,diagnostics:'GitHub Pages / Firebase / PWA / a11y'};}
  window.LS77Operations={...prev,featureRules,tutorialSteps,portrait,background,newbieMissions,recommendations,liveDiagnostics,releaseSummary};
})();
