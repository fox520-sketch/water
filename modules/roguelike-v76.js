(() => {
  'use strict';
  const base=(window.LS75Rogue?.relics||[]).map(x=>({...x}));
  const extra=[
    ['phoenix_ash','鳳凰餘燼','每次遠征第一次陣亡立即復起並回復 30% 氣血。',{revive:1,reviveHp:.30}],
    ['broken_halberd','斷戟殘鋒','對首領傷害提高 14%，但受到首領傷害提高 6%。',{bossDamage:1.14,bossTaken:1.06}],
    ['moon_cup','月下銀杯','休息節點額外回復一次容錯。',{restReserve:1}],
    ['merchant_abacus','行商算盤','商店價格降低 25%。',{shopDiscount:.25}],
    ['silent_bell','無聲銅鈴','精英戰首輪敵人速度降低 18。',{eliteSlow:18}],
    ['river_map','百川圖','水軍與後排英雄傷害提高 12%。',{backDamage:1.12}],
    ['iron_oath','鐵誓牌','前排氣血提高 15%，後排防禦降低 5%。',{frontHp:1.15,backDef:.95}],
    ['herbal_pouch','百草囊','每三個節點補充一份藥品。',{medicineEvery:3}],
    ['storm_drum','風雷鼓','合擊後全隊速度提高 16。',{comboHaste:16}],
    ['ink_talisman','墨符','控制命中提高 12%，控制失敗時回復豪氣。',{status:.12,statusRefund:15}],
    ['old_banner','殘旗','隊伍僅剩兩人時攻防提高 20%。',{desperate:1.20}],
    ['golden_scale','金鱗甲','每場戰鬥開始時獲得最大氣血 12% 護盾。',{openingShield:.12}],
    ['watch_fire','守夜火','事件節點顯示額外結果提示。',{eventPreview:true}],
    ['hidden_path','密道圖','每層可重新抽取一次分岔節點。',{reroll:1}],
    ['smith_hammer','百鍛錘','遠征商店可免費強化一件裝備。',{freeUpgrade:1}],
    ['jade_token','玉符令','每週挑戰獎勵提高 18%。',{weeklyReward:1.18}],
    ['swift_rein','疾風韁','坐騎屬性提高 25%。',{mountBonus:1.25}],
    ['healer_lamp','醫者燈','治療溢出量轉為護盾。',{overhealShield:.65}],
    ['judge_tablet','明法簡','敵方每有一種負面狀態，受到傷害提高 3%。',{debuffAmp:.03}],
    ['twin_blades','雙月刃','普通攻擊有 24% 機率追加一次 45% 傷害。',{followup:.24}],
    ['warhorse_bell','戰馬鈴','每場首名英雄行動後，全隊回復 8 豪氣。',{firstTurnSp:8}],
    ['cloud_ladder','雲梯圖','無盡塔獎勵提高 15%。',{towerReward:1.15}],
    ['fisher_net','漁獵網','召喚物與援兵受到傷害提高 25%。',{minionDamage:1.25}],
    ['clear_mirror','明鏡','每場首次受到負面狀態時免疫。',{statusGuard:1}]
  ].map(([key,name,text,bonus])=>({key,name,text,bonus}));
  const relics=[...base,...extra];
  function hash(text){let h=2166136261;for(const ch of String(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function rng(seed){let x=seed||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return((x>>>0)%100000)/100000;};}
  function weekKey(date=new Date()){const d=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));const day=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()+4-day);const y=new Date(Date.UTC(d.getUTCFullYear(),0,1));const w=Math.ceil((((d-y)/86400000)+1)/7);return`${d.getUTCFullYear()}-W${String(w).padStart(2,'0')}`;}
  const modifiers=[
    {key:'no_medicine',name:'禁藥演武',text:'不可使用藥品；治療技能效果提高 20%。'},
    {key:'speed_storm',name:'疾風亂序',text:'每回合速度浮動，慢速英雄攻擊提高。'},
    {key:'earthly_only',name:'地煞試煉',text:'只可使用 37～108 號英雄。'},
    {key:'single_role',name:'同職聚義',text:'至少三名英雄職業相同。'},
    {key:'boss_chain',name:'首領連戰',text:'連續挑戰三名三階首領。'},
    {key:'low_sp',name:'豪氣匱乏',text:'初始豪氣減半，但專屬技傷害提高。'},
    {key:'no_front',name:'空城奇策',text:'只能使用一名前排；後排傷害提高。'},
    {key:'status_week',name:'百毒爭鋒',text:'敵我持續傷害提高 35%。'},
    {key:'limited_rarity',name:'凡器試煉',text:'傳說裝備效果減半，精良裝備提高。'},
    {key:'guest_command',name:'客將統軍',text:'章回主角客將能力提高並必須存活。'}
  ];
  function weekly(date=new Date()){const key=weekKey(date),r=rng(hash(key));const modifier=modifiers[Math.floor(r()*modifiers.length)];const seed=hash(`${key}:${modifier.key}`);return{key,seed,modifier,chapter:1+Math.floor(r()*108),reward:{silver:2000,essence:7,iron:20,wood:20,cloth:20},challengeCode:`LS-${key.replace('-','')}-${String(seed).slice(-5)}`};}
  const laneTypes=[
    ['battle','event','battle'],['elite','rest','event'],['battle','shop','elite'],['event','battle','rest'],
    ['elite','event','battle'],['shop','battle','event'],['battle','elite','rest'],['event','elite','shop'],['battle','event','elite']
  ];
  function createRun(route='weekly-seed',date=new Date(),customSeed=''){
    const seed=customSeed?hash(customSeed):hash(`${route}:${date.toISOString().slice(0,10)}:${Date.now()}`),r=rng(seed);
    const nodes=[];
    for(let i=0;i<9;i++){
      const types=laneTypes[(i+Math.floor(r()*laneTypes.length))%laneTypes.length];
      const alternatives=types.map((type,lane)=>({id:`n${i+1}-${lane+1}`,lane,type,chapter:1+Math.floor(r()*108),reward:Math.round(130+(i+1)*58+r()*100),risk:lane===0?'穩健':lane===1?'均衡':'高風險'}));
      nodes.push({id:`floor-${i+1}`,index:i,alternatives,selected:null,cleared:false,choice:null});
    }
    nodes.push({id:'floor-10',index:9,alternatives:[{id:'final-boss',lane:1,type:'boss',chapter:1+Math.floor(r()*108),reward:1200,risk:'終局'}],selected:0,cleared:false});
    return{seed,route,challengeCode:`RUN-${seed.toString(36).toUpperCase()}`,startedAt:new Date().toISOString(),nodeIndex:0,nodes,path:[],relics:[],hpReserve:3,completed:false,score:0,rerolls:1};
  }
  function floor(run){return run?.nodes?.[run.nodeIndex]||null;}
  function pathChoices(run){const f=floor(run);return f?.alternatives||[];}
  function currentNode(run){const f=floor(run);if(!f)return null;const idx=f.selected==null?(f.alternatives.length===1?0:null):Number(f.selected);return idx==null?null:f.alternatives[idx]||null;}
  function choosePath(run,index){const f=floor(run);if(!f||f.cleared)return null;const i=Math.max(0,Math.min(f.alternatives.length-1,Number(index)||0));f.selected=i;const node=f.alternatives[i];run.path=Array.isArray(run.path)?run.path:[];run.path[run.nodeIndex]=node.id;return node;}
  function rerollFloor(run){const f=floor(run);if(!f||(run.rerolls||0)<=0||f.selected!=null)return false;const r=rng(run.seed+run.nodeIndex*1777+Date.now());f.alternatives.forEach(a=>{a.chapter=1+Math.floor(r()*108);a.reward=Math.round(a.reward*(.9+r()*.28));});run.rerolls--;return true;}
  function relicChoices(run){const r=rng((run?.seed||1)+(run?.nodeIndex||0)*7919+(run?.relics?.length||0)*313);const pool=relics.filter(x=>!(run?.relics||[]).includes(x.key)),out=[];while(pool.length&&out.length<3)out.push(pool.splice(Math.floor(r()*pool.length),1)[0]);return out;}
  function eventChoices(node){const idx=(Number(node?.chapter)||1)%6;return [
    [{key:'risk',title:'冒險深入',text:'取得較多銀兩，但下一戰敵方攻擊提高。',reward:300,penalty:'enemyAtk'},{key:'safe',title:'穩健偵察',text:'取得素材並保持狀態。',reward:120,material:'wood'}],
    [{key:'trade',title:'與行商交換',text:'支付銀兩換取隨機遺物。',cost:180,relic:true},{key:'leave',title:'不作停留',text:'保留資源繼續前進。'}],
    [{key:'rescue',title:'救援傷兵',text:'消耗藥品，下一戰全隊護盾提高。',medicine:1,shield:140},{key:'scout',title:'追查伏兵',text:'下一戰敵人減少一名。',extraEnemy:-1}],
    [{key:'forge',title:'修補裝備',text:'本次遠征全隊防禦提高。',def:1.10},{key:'rest',title:'就地休息',text:'恢復一次容錯次數。',hpReserve:1}],
    [{key:'curse',title:'接受詛咒遺物',text:'獲得遺物，但下一戰敵方速度提高。',relic:true,enemySpeed:1.10},{key:'purify',title:'焚香淨路',text:'消耗精華解除下一場負面環境。',essence:1,clean:true}],
    [{key:'guide',title:'救下嚮導',text:'顯示下一層全部風險與獎勵。',reveal:true},{key:'shortcut',title:'走險路捷徑',text:'立即獲得分數，但失去一次容錯。',score:260,hpReserve:-1}]
  ][idx];}
  window.LS76Rogue={relics,weekly,weekKey,createRun,currentNode,pathChoices,choosePath,rerollFloor,relicChoices,eventChoices,modifiers};
})();
