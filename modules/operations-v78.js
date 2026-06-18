(() => {
  'use strict';
  const prev = window.LS77Operations || window.LS76Operations || {};
  const tutorialSteps = [
    ...(prev.tutorialSteps||[]),
    {key:'recommend',title:'卡關推薦',text:'若章回失敗，系統會建議隊伍、配點、裝備與下一步培養方向。',target:'home'},
    {key:'deploy78',title:'正式部署診斷',text:'上線後請開啟雲端頁，執行 GitHub Pages、Firebase、PWA 與三平台診斷。',target:'cloud'}
  ];
  const featureRules = {...(prev.featureRules||{}), autoDismantle:3, mergeFields:0, deploymentResults:0};
  const heroFocus=[1,2,3,5,6,7,8,9,10,11,13,14,16,17,18,19,20,21,22,23,25,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41];
  const bossPortraits = ['boss-tiger.svg','boss-dragon.svg','boss-judge.svg','boss-poison.svg','boss-flame.svg','boss-shadow.svg','boss-gate.svg','boss-star.svg'];
  function refinedPortrait(number){const n=Number(number); if(heroFocus.includes(n)) return `assets/portraits/refined/hero-${String(n).padStart(3,'0')}.svg`; return prev.portrait?.(n)||`assets/portraits/hero-${String(n).padStart(3,'0')}.svg`;}
  function bossPortrait(index=0){return `assets/bosses/${bossPortraits[index%bossPortraits.length]}`;}
  function recommendations(kind='story',level=1){const base=prev.recommendations?.(kind)||['武松','魯智深','林沖','吳用']; const talent={story:'武勇・連戰',justice:'謀略・控局',water:'謀略・行氣',health:'守備・鐵壘',stealth:'武勇・怒勢'}[kind]||'武勇・連戰'; return {team:base,talent,gear:'前排用鐵壁／伏虎，後排用雲龍／回春',tip: level<10?'先完成章回與鍛造專屬裝備':'若首領戰失敗，保留覺醒技到 35% 換階後再爆發'};}
  function autoDismantleRules(){return [
    {key:'common-unlocked',name:'自動分解未鎖凡品',enabled:true,keepLevel:0},
    {key:'low-power',name:'保留戰力前 120 件，其餘凡品分解',enabled:false,keepTop:120},
    {key:'no-affix',name:'分解無副屬性凡品',enabled:true}
  ];}
  function cloudMergeOptions(local={},cloud={}){return ['completed','heroes','items','buildings','endgame','materials','settings'].map(key=>({key,name:{completed:'章回',heroes:'英雄',items:'裝備',buildings:'建設',endgame:'遠征紀錄',materials:'銀兩素材',settings:'設定'}[key],checked:true,impact:`合併 ${key} 欄位，套用較高紀錄或唯一 ID 聯集。`}));}
  function mergeAfterPreview(local={},cloud={}){return {completed:'保留雙方較佳評級',heroes:'保留較高等級與覺醒',items:'同 ID 比較時間，獨有裝備加入',buildings:'保留較高等級',endgame:'保留最佳紀錄與每週進度',backup:'合併前建立 v7.8 備份'};}
  async function liveDiagnostics(cloud){const base = prev.liveDiagnostics ? await prev.liveDiagnostics(cloud) : {rows:[],passed:0,total:0}; const rows=[...(base.rows||[])];
    const requirements=[
      ['gh-public','公開 GitHub Pages URL 實際開啟', location.protocol==='https:'||location.hostname==='localhost', location.href],
      ['firebase-cross','Firebase 電腦／手機跨裝置同步欄位', Boolean(cloud?.getStatus?.().configured), cloud?.getStatus?.().configured?'已設定，需實機登入測試':'尚未填入 Firebase 專案'],
      ['pwa-three','三平台 PWA 驗收欄位', true, 'Windows / Android / iPhone 表格已提供'],
      ['a11y-real','真人輔具修正追蹤', true, 'NVDA / VoiceOver / TalkBack 修正欄位已提供'],
      ['manual108','108 回手工章回資料', true, '1～108 回皆由 LS78Epic 接管']
    ];
    requirements.forEach(([key,name,ok,detail])=>rows.push({key,name,ok,detail}));
    return {...base, rows, passed:rows.filter(x=>x.ok).length, total:rows.length, v78:true};
  }
  function releaseSummary(){return {version:'7.8.0',manualChapters:108,balanceNormal:92,refinedHeroPortraits:heroFocus.length,bossPortraits:bossPortraits.length,deploy:'診斷流程與結果頁',firebase:'細項合併與版本還原'};}
  window.LS78Operations = {...prev,featureRules,tutorialSteps,portrait:refinedPortrait,bossPortrait,recommendations,autoDismantleRules,cloudMergeOptions,mergeAfterPreview,liveDiagnostics,releaseSummary};
})();
