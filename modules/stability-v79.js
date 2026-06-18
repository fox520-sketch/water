
(() => {
  'use strict';
  const VERSION = '7.9.0';
  const now = () => new Date().toISOString();
  const safe = fn => { try { return fn(); } catch (error) { return { ok:false, detail:error.message || String(error) }; } };
  const bool = (name, ok, detail='') => ({ name, ok: Boolean(ok), detail });
  const fileList = [
    'index.html','game.js','styles.css','manifest.webmanifest','service-worker.js','update.html',
    'modules/stability-v79.js','modules/chain-v79.js','modules/season-v79.js'
  ];
  async function headExists(path){
    try{ const res = await fetch(path, {cache:'no-store'}); return {ok:res.ok, status:res.status}; }
    catch(error){ return {ok:false, status:0, error:error.message}; }
  }
  function versionReport(state={}, prefs={}){
    const expected = VERSION;
    const cached = localStorage.getItem('liangshan-v79-cache-version') || '';
    const rows = [
      bool('頁面版本', document.title.includes(expected), document.title),
      bool('遊戲存檔版本', String(state.version||'').startsWith(expected), `state.version=${state.version||'尚未寫入'}`),
      bool('v7.9 維護模組', !!window.LS79Stability, 'stability-v79.js 已載入'),
      bool('章回連鎖模組', !!window.LS79Chain, 'chain-impact system'),
      bool('遠征賽季模組', !!window.LS79Season, 'season leaderboard'),
      bool('IndexedDB 支援', 'indexedDB' in window, '主存檔與備份'),
      bool('localStorage 支援', safe(()=>{localStorage.setItem('__ls79_probe','1'); localStorage.removeItem('__ls79_probe'); return {ok:true};}).ok, '相容鏡像'),
      bool('快取版本標記', cached === expected || cached === '', cached ? `目前 ${cached}` : '尚未由 Service Worker 回寫')
    ];
    return {type:'version-compatibility', version:expected, generatedAt:now(), passed:rows.filter(x=>x.ok).length, total:rows.length, rows};
  }
  async function swReport(){
    const rows = [];
    rows.push(bool('安全來源', location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1', `${location.protocol}//${location.host}`));
    rows.push(bool('Service Worker API', 'serviceWorker' in navigator, 'navigator.serviceWorker'));
    let reg = null;
    if('serviceWorker' in navigator){ try{ reg = await navigator.serviceWorker.getRegistration('./'); }catch{} }
    rows.push(bool('Service Worker 註冊', !!reg, reg?.scope || '尚未註冊'));
    let cacheNames = [];
    if('caches' in window){ try{ cacheNames = await caches.keys(); }catch{} }
    rows.push(bool('Cache Storage', 'caches' in window, cacheNames.join(', ') || '尚無快取'));
    rows.push(bool('v7.9 快取', cacheNames.some(x=>x.includes('7.9.0')), cacheNames.join(', ') || '未發現 v7.9 cache'));
    for(const f of fileList){ const r = await headExists(f); rows.push(bool(`必要檔案 ${f}`, r.ok, r.ok ? `HTTP ${r.status}` : (r.error || `HTTP ${r.status}`))); }
    return {type:'service-worker-cache', version:VERSION, generatedAt:now(), passed:rows.filter(x=>x.ok).length, total:rows.length, rows};
  }
  function migrationReport(state={}, prefs={}){
    const completed = Object.keys(state.completed||{}).length;
    const heroes = Object.keys(state.heroes||{}).length;
    const items = state.inventory?.items?.length || 0;
    const backups = state.saveMeta?.backupCount || 0;
    const rows = [
      bool('章回紀錄', completed >= 0, `完成 ${completed}/108 回`),
      bool('英雄資料', heroes >= 108 || heroes === 0, `英雄紀錄 ${heroes} 筆；新存檔會逐步建立`),
      bool('裝備資料', Array.isArray(state.inventory?.items), `${items} 件裝備`),
      bool('山寨資料', !!state.base, '建築、派遣、離線收益'),
      bool('雲端資料', !!state.cloud, `歷史 ${state.cloud?.history?.length || 0} 筆`),
      bool('備份資料', backups >= 0, `目前備份 ${backups} 份`),
      bool('Schema 版本', Number(state.schemaVersion||0) >= 6, `schemaVersion=${state.schemaVersion||'未知'}`),
      bool('遷移訊息', !!state.migration, state.migration?.note || '無遷移警告')
    ];
    return {type:'save-migration', version:VERSION, generatedAt:now(), passed:rows.filter(x=>x.ok).length, total:rows.length, rows, summary:{completed, heroes, items, backups}};
  }
  function issueReport(state={}, prefs={}, lastError=''){
    const ua = navigator.userAgent;
    const sw = !!navigator.serviceWorker?.controller;
    return {
      type:'issue-report', version:VERSION, generatedAt:now(),
      environment:{url:location.href, protocol:location.protocol, userAgent:ua, online:navigator.onLine, standalone:matchMedia('(display-mode: standalone)').matches, serviceWorkerControlled:sw},
      game:{saveVersion:state.version, schemaVersion:state.schemaVersion, completed:Object.keys(state.completed||{}).length, silver:state.silver, currentChapter:state.current?.chapter||null, screen:document.body.dataset.screen || ''},
      storage:{backupCount:state.saveMeta?.backupCount||0, backend:state.saveMeta?.backend||'', checksum:state.saveMeta?.checksum||''},
      cloud:{configured:!!localStorage.getItem('liangshan-firebase-config'), signedIn:!!state.cloud?.lastSyncAt, lastSyncAt:state.cloud?.lastSyncAt||''},
      prefs:{theme:prefs.theme, difficulty:prefs.difficulty, highContrast:!!prefs.highContrast, screenReaderMode:!!prefs.screenReaderMode, lowPower:!!prefs.lowPower},
      lastError:String(lastError||'')
    };
  }
  function deploymentReport(state={}, prefs={}, lastDoctor=null){
    const rows = [
      bool('HTTPS 或 localhost', location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1', location.href),
      bool('PWA Manifest', !!document.querySelector('link[rel="manifest"]'), 'manifest.webmanifest'),
      bool('Service Worker 控制', !!navigator.serviceWorker?.controller, navigator.serviceWorker?.controller?.scriptURL || '尚未接管'),
      bool('IndexedDB', 'indexedDB' in window, '本機主存檔'),
      bool('v7.9 模組', !!window.LS79Stability && !!window.LS79Chain && !!window.LS79Season, 'stability / chain / season'),
      bool('Firebase 設定', !!localStorage.getItem('liangshan-firebase-config'), '可在雲端頁填入設定'),
      bool('螢幕閱讀器模式可用', true, '可於無障礙設定開啟'),
      bool('安裝模式', matchMedia('(display-mode: standalone)').matches, matchMedia('(display-mode: standalone)').matches ? 'PWA standalone' : '瀏覽器模式')
    ];
    return {type:'github-pages-live-report', version:VERSION, generatedAt:now(), passed:rows.filter(x=>x.ok).length, total:rows.length, rows, previousDoctor:lastDoctor||null};
  }
  function firebaseReport(state={}, cloudStatus={}, lastDiagnostics=null){
    const rows = [
      bool('Firebase 設定存在', !!cloudStatus.configured, cloudStatus.configured ? '已設定' : '尚未設定'),
      bool('登入狀態', !!cloudStatus.signedIn, cloudStatus.email || '尚未登入'),
      bool('最近同步', !!state.cloud?.lastSyncAt, state.cloud?.lastSyncAt || '尚未同步'),
      bool('版本歷史', Array.isArray(state.cloud?.history), `${state.cloud?.history?.length||0} 筆`),
      bool('最近診斷 Auth', !!lastDiagnostics?.auth, lastDiagnostics?.error || ''),
      bool('最近診斷 Firestore', !!lastDiagnostics?.firestore, lastDiagnostics?.error || '')
    ];
    return {type:'firebase-cross-device-report', version:VERSION, generatedAt:now(), passed:rows.filter(x=>x.ok).length, total:rows.length, rows};
  }
  async function clearRuntimeCaches(){
    const names = await caches.keys();
    await Promise.all(names.filter(x=>x.includes('liangshan')).map(x=>caches.delete(x)));
    localStorage.setItem('liangshan-v79-cache-version', VERSION);
    return names.length;
  }
  window.LS79Stability = { VERSION, fileList, versionReport, swReport, migrationReport, issueReport, deploymentReport, firebaseReport, clearRuntimeCaches };
})();
