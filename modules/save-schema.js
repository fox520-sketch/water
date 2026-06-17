(() => {
  'use strict';
  const SCHEMA_VERSION = 4;
  const REQUIRED_TOP_LEVEL = ['version','silver','completed','inventory','heroes','formations','base'];

  function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object') {
      return Object.keys(value).sort().reduce((out,key) => {
        if (!['updatedAt','lastBackupAt','checksum'].includes(key)) out[key] = canonical(value[key]);
        return out;
      }, {});
    }
    return value;
  }

  async function checksum(value) {
    const text = JSON.stringify(canonical(value));
    if (globalThis.crypto?.subtle) {
      const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return [...new Uint8Array(bytes)].map(x => x.toString(16).padStart(2,'0')).join('');
    }
    let h = 2166136261;
    for (let i=0;i<text.length;i++) { h ^= text.charCodeAt(i); h = Math.imul(h,16777619); }
    return `fnv1a-${(h>>>0).toString(16).padStart(8,'0')}`;
  }

  function validateState(state) {
    const errors = [];
    if (!state || typeof state !== 'object') errors.push('存檔不是物件。');
    else {
      for (const key of REQUIRED_TOP_LEVEL) if (!(key in state)) errors.push(`缺少欄位：${key}`);
      if (state.completed && typeof state.completed !== 'object') errors.push('completed 格式錯誤。');
      if (state.heroes && typeof state.heroes !== 'object') errors.push('heroes 格式錯誤。');
      if (state.inventory && !Array.isArray(state.inventory.items)) errors.push('inventory.items 格式錯誤。');
      if (state.formations && !Array.isArray(state.formations)) errors.push('formations 格式錯誤。');
      if (Number(state.silver) < 0) errors.push('銀兩不可為負數。');
    }
    return {ok:errors.length===0,errors};
  }

  function validateExport(payload) {
    if (!payload || typeof payload !== 'object') return {ok:false,errors:['匯入內容不是有效物件。']};
    const state = payload.state || payload;
    const result = validateState(state);
    return {...result,state,prefs:payload.prefs||{},version:payload.version||state.version||'未知'};
  }

  function compare(localState, cloudState) {
    const l = new Date(localState?.updatedAt||0).getTime();
    const c = new Date(cloudState?.updatedAt||0).getTime();
    const localCompleted = Object.keys(localState?.completed||{}).length;
    const cloudCompleted = Object.keys(cloudState?.completed||{}).length;
    let recommendation = 'local';
    if (c > l + 1000 || cloudCompleted > localCompleted) recommendation = 'cloud';
    if (l === c && localCompleted === cloudCompleted) recommendation = 'same';
    return {localUpdatedAt:localState?.updatedAt||'',cloudUpdatedAt:cloudState?.updatedAt||'',localCompleted,cloudCompleted,recommendation};
  }

  window.LS74SaveSchema = {SCHEMA_VERSION,checksum,validateState,validateExport,compare,canonical};
})();
