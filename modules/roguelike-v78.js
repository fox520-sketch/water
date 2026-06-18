(() => {
  'use strict';
  const prev = window.LS77Rogue || window.LS76Rogue || window.LS75Rogue || {};
  const exclusiveBosses = ['黑風幻虎','赤潮龍王','鐵券鬼判','霧林毒君','碎甲火帥','無面暗將','天門守印','方外魔星'].map((name,i)=>({key:`v78-boss-${i+1}`,name,chapter:101+i,trait:['破盾','潮勢','審判','中毒','燃燒','潛行','封印','狂暴'][i]}));
  const hiddenEvents = ['義倉暗門','水泊迷霧','破碑藏圖','孤村醫棚','夜市商人','古井回聲','野渡遺舟','客棧密語','山神破籤','風雪歸人','斷橋伏筆','燈下雙證'];
  const relicCombos = [
    {key:'river-oath',name:'百川義誓',requires:['oath_map','river_map'],reward:'全隊開戰護盾與潮勢提高'},
    {key:'night-drums',name:'夜鼓風雷',requires:['shadow_drums','storm_drum'],reward:'精英戰首回合全隊加速'},
    {key:'healer-jade',name:'回春雙玉',requires:['healer_jade','herbal_pouch'],reward:'治療溢出轉為護盾'},
    {key:'judge-mirror',name:'明法照膽',requires:['judge_mirror','law_tablet'],reward:'首領增益會轉為我方豪氣'}
  ];
  function drawMap(run){if(!run) return []; const nodes=run.nodes||[]; return nodes.map((n,i)=>({index:i+1,x:8+(i%5)*20,y:18+Math.floor(i/5)*34,type:n.type,risk:n.risk||'',current:i===run.nodeIndex,done:!!n.cleared,hidden:!!n.hidden,event:n.hiddenEvent||''}));}
  function pathChoices(run){const base=prev.pathChoices?.(run)||[]; return base.map((x,i)=>({...x,mapX:10+((run?.nodeIndex||0)+i)%4*26,mapY:24+i*22,hiddenChance: i===2?.18:.08,exclusiveReward: i===2?'專屬首領線索':''}));}
  function weekly(){const w=prev.weekly?.()||{}; return {...w, modifier:{...(w.modifier||{}), name:`${w.modifier?.name||'每週遠征'}・v7.8`, text:`${w.modifier?.text||''} 本週額外啟用隱藏事件與遺物組合。`}, visualSeed:`V78-${new Date().getFullYear()}-${Math.ceil((Date.now()%2419200000)/604800000)}`};}
  function describe(){const d=prev.describe?.()||{}; return {...d,version:'7.8.0',map:'十層分岔視覺地圖',hiddenEvents:hiddenEvents.length,exclusiveBosses:exclusiveBosses.length,relicCombos:relicCombos.length};}
  window.LS78Rogue = {...prev,pathChoices,weekly,drawMap,describe,hiddenEvents,exclusiveBosses,relicCombos};
})();
