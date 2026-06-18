
(() => {
  'use strict';
  const VERSION = '7.9.0';
  const relicSets = [
    {key:'tiger', name:'伏虎套組', parts:['虎牙符','伏虎鼓','山君印'], bonus:'首領戰暴擊與破甲提升'},
    {key:'cloud', name:'雲龍套組', parts:['雲龍旗','青霄卷','行雲靴'], bonus:'速度、閃避與先制提升'},
    {key:'river', name:'混江套組', parts:['分浪珠','潮聲角','水寨圖'], bonus:'水戰遠征與恢復提升'},
    {key:'justice', name:'公斷套組', parts:['證冊','明鏡令','斷案筆'], bonus:'判斷關卡提示與控場提升'}
  ];
  const bosses = ['九幽虎王','玄浪龍君','鐵門巨靈','毒霧判官','焚城炎魁','影寨首領','星壇妖師','裂地魔將'];
  const weeklyRules = ['禁用藥品','只可天罡','只可地煞','首領血量提升','敵方速度提升','每層隨機詛咒','商店價格翻倍','完美結局加分','連戰不回復','低戰力挑戰'];
  const now = () => new Date();
  function weekKey(date=now()){
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2,'0')}`;
  }
  function seasonInfo(date=now()){
    const wk = weekKey(date);
    let seed = [...wk].reduce((s,c)=>s+c.charCodeAt(0),0);
    const rule = weeklyRules[seed % weeklyRules.length];
    const boss = bosses[seed % bosses.length];
    const set = relicSets[seed % relicSets.length];
    return {version:VERSION, key:wk, rule, boss, relicSet:set, challengeCode:`LS-${wk}-${String(seed*37).slice(-4)}`, startsAt:wk, text:`${rule}・終局首領 ${boss}・推薦遺物 ${set.name}`};
  }
  function ensure(state){
    state.endgame = state.endgame || {};
    state.endgame.seasons = state.endgame.seasons || {records:{}, personalBest:[], lastReport:null};
    state.endgame.seasons.records = state.endgame.seasons.records || {};
    state.endgame.seasons.personalBest = Array.isArray(state.endgame.seasons.personalBest) ? state.endgame.seasons.personalBest : [];
    return state.endgame.seasons;
  }
  function record(state, run){
    const season = ensure(state);
    const info = seasonInfo();
    const score = Math.max(0, Math.round((run?.score || 0) + (run?.floor || 0)*25 + (run?.relics || 0)*12 - (run?.defeats || 0)*40));
    const entry = {season:info.key, score, floor:run?.floor||0, boss:run?.boss||info.boss, relics:run?.relics||0, at:new Date().toISOString(), rule:info.rule};
    const old = season.records[info.key];
    if(!old || score > old.score) season.records[info.key] = entry;
    season.personalBest.unshift(entry);
    season.personalBest = season.personalBest.sort((a,b)=>b.score-a.score).slice(0,30);
    return entry;
  }
  function leaderboard(state={}){
    const season = state.endgame?.seasons || {records:{}, personalBest:[]};
    return {current:seasonInfo(), currentBest:season.records?.[seasonInfo().key] || null, personalBest:(season.personalBest||[]).slice(0,10), relicSets, bosses};
  }
  window.LS79Season = {VERSION, relicSets, bosses, weeklyRules, seasonInfo, record, leaderboard};
})();
