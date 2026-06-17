(() => {
  'use strict';
  const towerModifiers = [
    {key:'swift',name:'疾風層',text:'敵方速度提高 12%。',enemySpeed:1.12},
    {key:'iron',name:'鐵壁層',text:'敵方防禦提高 18%。',enemyDef:1.18},
    {key:'venom',name:'毒霧層',text:'我方開戰受到中毒。',allyPoison:18},
    {key:'fury',name:'狂怒層',text:'敵方攻擊提高 15%。',enemyAtk:1.15},
    {key:'seal',name:'封技層',text:'我方首輪技能冷卻增加一回合。',cooldown:1},
    {key:'horde',name:'群敵層',text:'額外增加一名敵人。',extraEnemy:1}
  ];
  function towerFloor(floor){const n=Math.max(1,Number(floor)||1);return{floor:n,chapter:(n*7-1)%108+1,modifier:towerModifiers[(n-1)%towerModifiers.length],scale:1+Math.min(2.6,(n-1)*.035),reward:{silver:180+n*26,essence:n%5===0?3:1}};}
  const routes = [
    {key:'northern',name:'北地糧道',icon:'🌾',text:'護送糧草穿越寒原。',chapter:4,battles:3,reward:{silver:1100,iron:12,wood:18,cloth:8,essence:2}},
    {key:'river',name:'江州水路',icon:'⛵',text:'沿江掃除水賊與暗礁。',chapter:15,battles:3,reward:{silver:980,iron:8,wood:20,cloth:12,essence:3}},
    {key:'mountain',name:'登州獵徑',icon:'🏹',text:'追查山林異獸與伏兵。',chapter:32,battles:4,reward:{silver:1280,iron:14,wood:12,cloth:14,essence:4}},
    {key:'capital',name:'東京密探',icon:'🌙',text:'潛入京城取得密卷。',chapter:14,battles:4,reward:{silver:1500,iron:10,wood:10,cloth:20,essence:5}},
    {key:'medical',name:'疫區救援',icon:'🩺',text:'護送藥材並救治傷患。',chapter:26,battles:3,reward:{silver:1050,iron:6,wood:12,cloth:24,essence:3}},
    {key:'forge',name:'百工採礦',icon:'⚒️',text:'深入礦區奪回鍛造素材。',chapter:24,battles:5,reward:{silver:1750,iron:32,wood:16,cloth:12,essence:6}}
  ];
  const dispatchMissions = [
    {key:'patrol',name:'巡山查哨',minutes:10,reward:{silver:180,wood:4}},
    {key:'mine',name:'礦場採集',minutes:20,reward:{silver:260,iron:7}},
    {key:'weave',name:'織坊協作',minutes:20,reward:{silver:240,cloth:7}},
    {key:'escort',name:'護送商隊',minutes:35,reward:{silver:520,iron:4,wood:4,cloth:4}},
    {key:'secret',name:'密探遠行',minutes:60,reward:{silver:900,essence:2}}
  ];
  window.LS74Endgame = {towerModifiers,towerFloor,routes,dispatchMissions};
})();
