
(() => {
  'use strict';
  const VERSION = '7.9.0';
  const rules = [
    {range:[1,12], key:'earlyJustice', name:'清平聲望', bonus:'民心 +1', text:'前期完美結局會提高後續救援與談判評分。'},
    {range:[13,24], key:'mountainPact', name:'山寨盟約', bonus:'派遣收益 +1%', text:'中期結盟選擇會增加山寨派遣與補給效率。'},
    {range:[25,36], key:'riverIntel', name:'水路情報', bonus:'水戰敵情提前揭露', text:'水路章回良好結局會降低遠征水戰風險。'},
    {range:[37,54], key:'marketTrust', name:'市井信任', bonus:'商店折扣', text:'交易與救濟章回會影響商店與鍛造事件。'},
    {range:[55,72], key:'courtEvidence', name:'公案證冊', bonus:'斷案判斷提示', text:'公斷章回會累積證據旗標，後續查案更容易取得完美。'},
    {range:[73,90], key:'frontierRoute', name:'遠征路標', bonus:'遠征隱藏事件率 +', text:'後期路線選擇會開啟遠征隱藏房與首領弱點。'},
    {range:[91,108], key:'finalOath', name:'百八誓約', bonus:'隱藏終章條件', text:'最終篇章的完美結局會累積百八真結局條件。'}
  ];
  const now = () => new Date().toISOString();
  function bucket(chapter){ return rules.find(r => chapter >= r.range[0] && chapter <= r.range[1]) || rules[0]; }
  function ensure(state){
    state.chain = state.chain || {version:VERSION, flags:{}, log:[], perfect:0, renown:0, lastApplied:{}};
    state.chain.flags = state.chain.flags || {};
    state.chain.log = Array.isArray(state.chain.log) ? state.chain.log : [];
    state.chain.lastApplied = state.chain.lastApplied || {};
    return state.chain;
  }
  function apply(state, chapter, run, record){
    const n = Number(chapter?.number || run?.chapter || 1);
    const chain = ensure(state);
    const key = `${n}:${record?.completedAt || now()}`;
    if(chain.lastApplied[String(n)] === key) return {applied:false, message:'已套用過'};
    const b = bucket(n);
    const perfect = record?.grade === 'S' && (record?.trialSuccess || run?.trialSuccess) && (record?.guestSurvived || run?.stats?.guestSurvived);
    const delta = perfect ? 3 : record?.grade === 'S' ? 2 : record?.grade === 'A' ? 1 : 0;
    chain.flags[b.key] = (chain.flags[b.key] || 0) + delta;
    chain.renown = (chain.renown || 0) + delta;
    if(perfect) chain.perfect = (chain.perfect || 0) + 1;
    const entry = {chapter:n, title:chapter?.title || '', grade:record?.grade || '', bucket:b.key, name:b.name, delta, perfect, at:now(), ending:record?.branchEnding?.title || ''};
    chain.log.unshift(entry);
    chain.log = chain.log.slice(0,80);
    chain.lastApplied[String(n)] = key;
    return {applied:true, entry, message:`${b.name} +${delta}`};
  }
  function activeEffects(state={}){
    const chain = state.chain || {};
    const flags = chain.flags || {};
    return rules.map(r => ({...r, value: flags[r.key] || 0, active:(flags[r.key]||0)>0, level:Math.min(5, Math.floor((flags[r.key]||0)/3)+((flags[r.key]||0)>0?1:0))}));
  }
  function summary(state={}){
    const effects = activeEffects(state);
    return {version:VERSION, renown:state.chain?.renown||0, perfect:state.chain?.perfect||0, active:effects.filter(x=>x.active), effects, log:(state.chain?.log||[]).slice(0,20)};
  }
  function endingHint(state={}){
    const s = summary(state);
    if((s.perfect||0) >= 36) return '已接近百八真結局條件。';
    if((s.renown||0) >= 80) return '梁山聲望高漲，後續遠征會出現更多隱藏事件。';
    return '完成更多完美結局可累積章回連鎖影響。';
  }
  window.LS79Chain = {VERSION, rules, apply, activeEffects, summary, endingHint};
})();
