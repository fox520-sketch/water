(() => {
  'use strict';
  const relics=[
    {key:'tiger_fang',name:'伏虎牙',text:'全隊暴擊率提高 8%。',bonus:{crit:.08}},
    {key:'cloud_feather',name:'入雲羽',text:'全隊速度提高 10。',bonus:{speed:10}},
    {key:'river_pearl',name:'混江珠',text:'每回合額外回復 10 豪氣。',bonus:{spRegen:10}},
    {key:'iron_tablet',name:'鐵壁牌',text:'全隊防禦提高 12%。',bonus:{def:1.12}},
    {key:'healing_scroll',name:'回春卷',text:'治療效果提高 18%。',bonus:{heal:1.18}},
    {key:'justice_seal',name:'公義印',text:'戰鬥銀兩提高 20%。',bonus:{reward:1.20}},
    {key:'swift_boots',name:'神行靴',text:'首輪行動條額外提前。',bonus:{initiative:20}},
    {key:'poison_gourd',name:'奇毒葫蘆',text:'專屬技有機率附加中毒。',bonus:{poison:18}},
    {key:'guardian_bell',name:'護軍鐘',text:'開戰獲得 110 點護盾。',bonus:{shield:110}},
    {key:'combo_banner',name:'聚義旗',text:'合擊值獲得量提高 35%。',bonus:{combo:1.35}},
    {key:'cooldown_book',name:'機略書',text:'每場首個技能冷卻縮短一回合。',bonus:{cooldown:1}},
    {key:'revive_charm',name:'還魂符',text:'每次遠征一次，陣亡英雄以 1 點氣血復起。',bonus:{revive:1}}
  ];
  const nodeTypes=['battle','event','battle','rest','elite','event','battle','shop','boss'];
  function hash(text){let h=2166136261;for(const ch of String(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function rng(seed){let x=seed||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return((x>>>0)%100000)/100000;};}
  function weekKey(date=new Date()){const d=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));const day=d.getUTCDay()||7;d.setUTCDate(d.getUTCDate()+4-day);const y=new Date(Date.UTC(d.getUTCFullYear(),0,1));const w=Math.ceil((((d-y)/86400000)+1)/7);return`${d.getUTCFullYear()}-W${String(w).padStart(2,'0')}`;}
  function weekly(date=new Date()){const key=weekKey(date),r=rng(hash(key));const mods=[
    {key:'no_medicine',name:'禁藥演武',text:'自動與手動均不可使用藥品。'},
    {key:'speed_storm',name:'疾風亂序',text:'敵我速度波動加大。'},
    {key:'earthly_only',name:'地煞試煉',text:'只可使用 37～108 號英雄。'},
    {key:'single_role',name:'同職聚義',text:'隊伍至少三名英雄職業相同。'},
    {key:'boss_chain',name:'首領連戰',text:'連續挑戰三名三階首領。'},
    {key:'low_sp',name:'豪氣匱乏',text:'初始豪氣減半，但技能傷害提高。'}];
    const mod=mods[Math.floor(r()*mods.length)];return{key,modifier:mod,chapter:1+Math.floor(r()*108),reward:{silver:1800,essence:6,iron:18,wood:18,cloth:18}};
  }
  function createRun(route='random',date=new Date()){
    const seed=hash(`${route}:${date.toISOString().slice(0,10)}:${Date.now()}`),r=rng(seed);const nodes=nodeTypes.map((type,i)=>({id:`n${i+1}`,index:i,type,chapter:1+Math.floor(r()*108),cleared:false,choice:null,reward:Math.round(120+(i+1)*55+r()*90)}));return{seed,route,startedAt:new Date().toISOString(),nodeIndex:0,nodes,relics:[],hpReserve:3,completed:false,score:0};
  }
  function currentNode(run){return run?.nodes?.[run.nodeIndex]||null;}
  function relicChoices(run){const r=rng((run?.seed||1)+(run?.nodeIndex||0)*7919);const pool=[...relics],out=[];while(pool.length&&out.length<3){out.push(pool.splice(Math.floor(r()*pool.length),1)[0]);}return out;}
  function eventChoices(node){const idx=(Number(node?.chapter)||1)%4;return [
    [{key:'risk',title:'冒險深入',text:'取得較多銀兩，但下一戰敵方攻擊提高。',reward:260,penalty:'enemyAtk'},{key:'safe',title:'穩健偵察',text:'取得少量素材並保持狀態。',reward:120,material:'wood'}],
    [{key:'trade',title:'與行商交換',text:'支付 180 銀兩換取隨機遺物。',cost:180,relic:true},{key:'leave',title:'不作停留',text:'保留資源繼續前進。'}],
    [{key:'rescue',title:'救援傷兵',text:'消耗一份藥品，下一戰全隊護盾提高。',medicine:1,shield:120},{key:'scout',title:'追查伏兵',text:'下一戰敵人減少一名。',extraEnemy:-1}],
    [{key:'forge',title:'修補裝備',text:'本次遠征全隊防禦提高。',def:1.08},{key:'rest',title:'就地休息',text:'恢復一次遠征容錯次數。',hpReserve:1}]
  ][idx];}
  window.LS75Rogue={relics,weekly,weekKey,createRun,currentNode,relicChoices,eventChoices};
})();
