(() => {
  'use strict';
  const tutorialSteps=[
    {key:'welcome',title:'歡迎來到梁山',text:'先完成第一回互動教學；系統會逐步開放養成、鍛造、山寨與遠征。',target:'home'},
    {key:'chapter',title:'選擇章回與方案',text:'進入第一回，選擇故事方案並完成關鍵判斷。',target:'chapters'},
    {key:'battle',title:'速度回合戰鬥',text:'觀察行動條，以普通攻擊累積豪氣，再施放專屬技。',target:'chapter'},
    {key:'team',title:'調整前後排',text:'完成第一回後開放編隊與戰術 AI。',target:'team'},
    {key:'hero',title:'培養英雄',text:'完成第二回後開放英雄技能樹與覺醒。',target:'heroes'},
    {key:'forge',title:'鍛造與裝備方案',text:'完成第三回後開放六部位鍛造、批次管理與裝備方案。',target:'forge'},
    {key:'base',title:'山寨與長期玩法',text:'完成第五回後開放山寨派遣；完成第八回後開放遠征與每週挑戰。',target:'base'}
  ];
  const featureRules={home:0,chapters:0,cloud:0,team:1,heroes:2,forge:3,base:5,endgame:8};
  function unlocked(feature,completed){return Number(completed||0)>=Number(featureRules[feature]||0);}
  function nextFeature(completed){return Object.entries(featureRules).filter(([,n])=>n>completed).sort((a,b)=>a[1]-b[1])[0]||null;}
  function asset(path){return window.__LS76_ASSET_MAP__?.[path]||path;}
  function portrait(number){const n=Number(number),path=n>=1&&n<=36?`assets/portraits/hero-${String(n).padStart(3,'0')}.svg`:'';return path?asset(path):'';}
  function background(number,kind='story'){const map={story:1,justice:2,military:7,transport:4,water:11,health:3,civic:5,trade:8,wild:1,stealth:9};const idx=Number(number)===108?12:(map[kind]||((Number(number)-1)%11+1));return asset(`assets/backgrounds/scene-${String(idx).padStart(2,'0')}.svg`);}
  function freshTutorial(){return{completed:false,step:0,seen:[],startedAt:new Date().toISOString(),dismissed:false};}
  function freshLoadouts(){return[0,1,2].map(i=>({name:`裝備方案 ${i+1}`,savedAt:'',heroes:{}}));}
  function saveLoadout(state,index,heroNumbers){const i=Math.max(0,Math.min(2,Number(index)||0));state.equipmentPlans=Array.isArray(state.equipmentPlans)?state.equipmentPlans:freshLoadouts();const plan=state.equipmentPlans[i];plan.savedAt=new Date().toISOString();plan.heroes={};for(const n of heroNumbers||[]){const h=state.heroes?.[String(n)];if(h)plan.heroes[String(n)]={...(h.equipment||{})};}return plan;}
  function applyLoadout(state,index,getItem){const i=Math.max(0,Math.min(2,Number(index)||0)),plan=state.equipmentPlans?.[i];if(!plan)return{applied:0,missing:0};let applied=0,missing=0;for(const [num,equipment] of Object.entries(plan.heroes||{})){const h=state.heroes?.[num];if(!h)continue;for(const [type,id] of Object.entries(equipment||{})){if(!id)continue;const item=getItem(id);if(!item){missing++;continue;}if(item.exclusiveHero&&Number(item.exclusiveHero)!==Number(num)){missing++;continue;}h.equipment[type]=id;item.equippedBy=Number(num);applied++;}}return{applied,missing};}
  function deploymentChecks(){const secure=location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1';return[
    {key:'https',name:'HTTPS／localhost 安全來源',ok:secure,detail:location.href},
    {key:'serviceWorker',name:'Service Worker 支援',ok:'serviceWorker'in navigator,detail:navigator.serviceWorker?'可用':'不可用'},
    {key:'indexedDB',name:'IndexedDB 支援',ok:'indexedDB'in window,detail:'indexedDB'in window?'可用':'不可用'},
    {key:'manifest',name:'Web App Manifest',ok:Boolean(document.querySelector('link[rel="manifest"]')),detail:document.querySelector('link[rel="manifest"]')?.href||'未載入'},
    {key:'standalone',name:'PWA 獨立模式',ok:matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true,detail:'需安裝後才會通過'},
    {key:'online',name:'網路狀態',ok:navigator.onLine,detail:navigator.onLine?'線上':'離線'}
  ];}
  async function liveDiagnostics(cloud){const rows=deploymentChecks();let sw={ok:false,detail:'尚未註冊'};try{const reg=await navigator.serviceWorker?.getRegistration?.('./');sw={ok:Boolean(reg),detail:reg?`scope ${reg.scope}`:'找不到註冊'};}catch(error){sw={ok:false,detail:error.message};}rows.push({key:'swRegistered',name:'Service Worker 已註冊',...sw});const cloudStatus=cloud?.getStatus?.()||{};rows.push({key:'firebaseConfig',name:'Firebase 專案設定',ok:Boolean(cloudStatus.configured),detail:cloudStatus.config?.projectId||'尚未設定'});rows.push({key:'firebaseLogin',name:'Firebase 已登入',ok:Boolean(cloudStatus.signedIn),detail:cloudStatus.email||'尚未登入'});return{at:new Date().toISOString(),url:location.href,userAgent:navigator.userAgent,rows,passed:rows.filter(x=>x.ok).length,total:rows.length};}
  function economyCap(base){return Math.min(24,12+(Number(base?.hall)||1)*2);}
  function fatigueRecover(hours){return Math.floor(Math.max(0,hours)*8);}
  window.LS76Operations={tutorialSteps,featureRules,unlocked,nextFeature,portrait,background,freshTutorial,freshLoadouts,saveLoadout,applyLoadout,deploymentChecks,liveDiagnostics,economyCap,fatigueRecover};
})();
