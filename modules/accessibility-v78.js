(() => {
  'use strict';
  const prev = window.LS75Accessibility || window.LS74Accessibility || {};
  const fixes = [
    {tool:'NVDA',area:'章回與戰鬥',fix:'戰鬥紀錄改用 polite 摘要，避免每次傷害都打斷朗讀。'},
    {tool:'VoiceOver',area:'彈窗焦點',fix:'合併預覽、裝備篩選與遠征路線開啟後焦點指向第一個標題。'},
    {tool:'TalkBack',area:'觸控目標',fix:'主要操作按鈕維持 44px 以上，路線節點補上文字名稱。'},
    {tool:'Narrator',area:'雲端合併',fix:'欄位勾選表加入群組標籤與結果描述。'}
  ];
  function apply(prefs={}){prev.apply?.(prefs); document.body.classList.toggle('a11y-v78', true); document.body.dataset.srMode = prefs.screenReaderMode ? '精簡播報' : '一般播報';}
  function report(){return {version:'7.8.0',fixes,manualRequired:['請以真實 NVDA 完成第一回','請以 VoiceOver 完成雲端合併頁','請以 TalkBack 完成遠征節點選擇']};}
  window.LS78Accessibility = {...prev,apply,report,fixes};
  window.LS75Accessibility = window.LS78Accessibility;
})();
