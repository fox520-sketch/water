(() => {
  'use strict';
  const prev=window.LS76Rogue||window.LS75Rogue||{};
  const baseRelics=prev.relics||[];
  const comboRelics=[
    ['oath_map','義路圖','同時持有百川圖與鐵誓牌時，全隊開戰護盾提高。',{combo:['river_map','iron_oath'],shield:.18}],
    ['shadow_drums','夜鼓','同時持有無聲銅鈴與風雷鼓時，精英戰首輪我方加速。',{combo:['silent_bell','storm_drum'],speed:18}],
    ['healer_jade','回春玉','同時持有百草囊與醫者燈時，治療溢出全隊共享。',{combo:['herbal_pouch','healer_lamp'],healShare:.35}],
    ['judge_mirror','明法鏡','同時持有明鏡與明法簡時，敵方增益會被削弱。',{combo:['clear_mirror','judge_tablet'],purge:.25}],
    ['merchant_path','行商密徑','同時持有行商算盤與密道圖時，每層商店出現率提高。',{combo:['merchant_abacus','hidden_path'],shop:1}],
    ['phoenix_banner','鳳旗','同時持有鳳凰餘燼與殘旗時，瀕死爆發後不會立刻倒下。',{combo:['phoenix_ash','old_banner'],lastStand:1}]
  ].map(([key,name,text,bonus])=>({key,name,text,bonus,combo:true}));
  const relics=[...baseRelics,...comboRelics];
  const exclusiveBosses=['黑風寨連環馬','曾頭市毒箭陣','方臘銅佛軍','江州血書獄','大名府鐵索橋','祝家莊迷盤','清風寨雙首領','梁山天命影'];
  function hash(text){let h=2166136261;for(const ch of String(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function rng(seed){let x=seed||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return((x>>>0)%100000)/100000;};}
  function createRun(route='weekly-seed',date=new Date(),customSeed=''){
    const run=prev.createRun?prev.createRun(route,date,customSeed):{nodes:[],nodeIndex:0,relics:[],path:[],completed:false};
    run.version='7.7.0';run.mapMode='branching-visual';run.comboRelics=[];run.exclusiveBoss=exclusiveBosses[(run.seed||hash(route))%exclusiveBosses.length];
    (run.nodes||[]).forEach((floor,i)=>{floor.x=80+i*76;floor.y=80+((i*37)%160);(floor.alternatives||[]).forEach((a,lane)=>{a.x=floor.x;a.y=floor.y+(lane-1)*42;a.preview=`${a.risk}・${a.type}・${a.reward} 銀兩`;if(a.type==='boss')a.boss=run.exclusiveBoss;});});
    return run;
  }
  function relicChoices(run){const prevChoices=prev.relicChoices?prev.relicChoices(run):[];const owned=new Set(run?.relics||[]);const combos=comboRelics.filter(r=>!owned.has(r.key)&&r.bonus.combo.every(x=>owned.has(x))).slice(0,1);return [...combos,...prevChoices].slice(0,3);}
  function describe(){return{version:'7.7.0',relics:relics.length,combos:comboRelics.length,bosses:exclusiveBosses.length,map:'10 層三岔視覺地圖'};}
  window.LS77Rogue={...prev,relics,comboRelics,exclusiveBosses,createRun,relicChoices,describe};
})();
