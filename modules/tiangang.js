(() => {
  'use strict';

  const records = {
    1:{hero:'武松',activeName:'景陽伏虎連斬',activeText:'連斬三次；擊倒目標時立即追擊氣血最低的敵人。',passiveName:'打虎餘威',passiveText:'擊倒敵人後回復豪氣並提高暴擊。',cooldown:2,mechanic:'tiger_chain',stats:{crit:.08}},
    2:{hero:'魯達',activeName:'倒拔垂楊震嶽',activeText:'重擊全敵並為全隊建立護盾；有機率震懾。',passiveName:'禪杖護眾',passiveText:'護盾破裂時震傷全體敵人。',cooldown:3,mechanic:'monk_quake',stats:{hp:1.08}},
    3:{hero:'林沖',activeName:'風雪回馬槍',activeText:'無視部分防禦，進入高機率反擊姿態。',passiveName:'豹子頭守關',passiveText:'成功格擋後必定反擊。',cooldown:2,mechanic:'spear_counter',stats:{counter:.18}},
    4:{hero:'楊志',activeName:'青面護綱陣',activeText:'攻擊目標並保護氣血最低的隊友，提高其速度。',passiveName:'押綱不失',passiveText:'前排受傷時替氣血最低隊友分擔傷害。',cooldown:3,mechanic:'escort_guard',stats:{speed:8}},
    5:{hero:'宋江',activeName:'呼保義聚眾令',activeText:'治療全隊、回復豪氣並提升合擊值。',passiveName:'及時雨',passiveText:'每個完整回合結束時治療氣血最低的隊友。',cooldown:4,mechanic:'benevolent_command',stats:{heal:1.15}},
    6:{hero:'李逵',activeName:'黑旋風裂陣',activeText:'依自身已損氣血提高傷害，連續劈擊兩名敵人。',passiveName:'越戰越狂',passiveText:'氣血越低，攻擊與速度越高。',cooldown:2,mechanic:'berserk_cleave',stats:{lowHpDamage:.22}},
    7:{hero:'扈三娘',activeName:'日月雙刀回旋',activeText:'快速攻擊全敵並施加流血，自身獲得閃避。',passiveName:'一丈青身法',passiveText:'每回合首次受到攻擊時有機率閃避。',cooldown:3,mechanic:'blade_dance',stats:{evade:.12}},
    8:{hero:'呼延灼',activeName:'連環甲馬衝陣',activeText:'重創前排敵人並降低全敵速度。',passiveName:'雙鞭鐵騎',passiveText:'首輪行動前為全隊前排增加護盾。',cooldown:3,mechanic:'cavalry_charge',stats:{def:1.08}},
    9:{hero:'盧俊義',activeName:'玉麒麟無雙勢',activeText:'對首領造成巨額傷害；非首領則追加一次攻擊。',passiveName:'河北無雙',passiveText:'對首領增傷，且不受首領反震的首次傷害。',cooldown:3,mechanic:'peerless_duel',stats:{bossDamage:.20}},
    10:{hero:'公孫勝',activeName:'入雲龍五雷法',activeText:'雷擊全敵，隨機施加暈眩、遲緩或破甲。',passiveName:'御風行雷',passiveText:'施放技能有機率不進入冷卻。',cooldown:4,mechanic:'thunder_ritual',stats:{cooldownRefund:.18}},
    11:{hero:'張清',activeName:'沒羽飛石連珠',activeText:'飛石三連擊，最後一擊必定暴擊。',passiveName:'百步飛石',passiveText:'攻擊後有機率使目標遲緩。',cooldown:2,mechanic:'stone_barrage',stats:{crit:.06}},
    12:{hero:'花榮',activeName:'小李廣穿雲箭',activeText:'鎖定後排或術士，造成高額穿透傷害。',passiveName:'神箭定魂',passiveText:'對滿血敵人的第一擊必定暴擊。',cooldown:2,mechanic:'piercing_arrow',stats:{firstStrikeCrit:true}},
    13:{hero:'瓊英',activeName:'瓊矢流星陣',activeText:'對隨機敵人投石五次，命中同一目標時傷害遞增。',passiveName:'流星飛石',passiveText:'每次暴擊提高下一次技能傷害。',cooldown:3,mechanic:'meteor_stones',stats:{skillRamp:.08}},
    14:{hero:'燕青',activeName:'浪子擒拿破綻',activeText:'偷取目標增益，施加沉默並提高自身速度。',passiveName:'相撲巧勁',passiveText:'攻擊有負面狀態的敵人時提高傷害。',cooldown:3,mechanic:'grapple_steal',stats:{debuffDamage:.18}},
    15:{hero:'張順',activeName:'浪裡白條翻江',activeText:'全敵水擊並使自身立即提前至下一回合前段。',passiveName:'水底神行',passiveText:'水戰或後排時速度與閃避提高。',cooldown:3,mechanic:'river_dash',stats:{speed:12,evade:.06}},
    16:{hero:'戴宗',activeName:'神行甲馬急遞',activeText:'全隊神行並重排行動條，使最慢隊友立即行動。',passiveName:'日行八百',passiveText:'全隊基礎速度提高。',cooldown:4,mechanic:'initiative_shift',stats:{teamSpeed:6}},
    17:{hero:'朱武',activeName:'神機軍陣轉位',activeText:'重置一名隊友的技能冷卻並為全隊補充豪氣。',passiveName:'陣圖推演',passiveText:'首領換階時全隊獲得護盾。',cooldown:4,mechanic:'tactical_reset',stats:{spRegen:8}},
    18:{hero:'蕭讓',activeName:'聖手檄文封令',activeText:'封印目標技能並降低攻防；對首領改為延後行動。',passiveName:'筆落成令',passiveText:'首次施加控制時延長一回合。',cooldown:3,mechanic:'edict_seal',stats:{status:.08}},
    19:{hero:'裴宣',activeName:'鐵面明法斷罪',activeText:'依目標負面狀態數量增加傷害，清除其增益。',passiveName:'賞罰分明',passiveText:'擊倒帶有三種以上負面狀態的敵人時全隊回氣。',cooldown:3,mechanic:'judgement',stats:{debuffDamage:.16}},
    20:{hero:'樂和',activeName:'鐵叫子振軍曲',activeText:'全隊鼓舞、回復少量氣血並解除遲緩。',passiveName:'清音定心',passiveText:'全隊控制抗性提高。',cooldown:4,mechanic:'war_song',stats:{controlResist:.18}},
    21:{hero:'金大堅',activeName:'玉臂金印鎮煞',activeText:'為一名隊友刻印護符，受到致命傷時保留 1 點氣血。',passiveName:'金石不磨',passiveText:'裝備套裝效果提高。',cooldown:5,mechanic:'saving_seal',stats:{setBonus:1.10}},
    22:{hero:'孟康',activeName:'玉幡竿破浪舟',activeText:'撞擊全敵並依隊伍護盾值增加傷害。',passiveName:'造船巧匠',passiveText:'全隊護盾效果提高。',cooldown:3,mechanic:'ramming_ship',stats:{shieldBonus:1.18}},
    23:{hero:'侯健',activeName:'通臂猿錦甲術',activeText:'為全隊修補護甲，提高防禦並解除破甲。',passiveName:'巧手裁甲',passiveText:'防具提供的屬性提高。',cooldown:4,mechanic:'armor_mend',stats:{armorBonus:1.12}},
    24:{hero:'湯隆',activeName:'金錢豹子鍛兵',activeText:'強化全隊武器三回合，攻擊與暴擊提高。',passiveName:'鐵砧火星',passiveText:'武器提供的屬性提高。',cooldown:4,mechanic:'weapon_temper',stats:{weaponBonus:1.12}},
    25:{hero:'凌振',activeName:'轟天雷震城砲',activeText:'蓄力砲擊全敵，對護盾與召喚物傷害加倍。',passiveName:'火砲校準',passiveText:'每隔三回合下一次技能必定暴擊。',cooldown:4,mechanic:'cannon_blast',stats:{shieldDamage:1.8}},
    26:{hero:'皇甫端',activeName:'紫髯伯療馬方',activeText:'大幅治療氣血最低隊友並賦予持續回復。',passiveName:'獸醫仁心',passiveText:'戰鬥勝利後額外恢復全隊。',cooldown:3,mechanic:'regeneration',stats:{heal:1.20}},
    27:{hero:'曹正',activeName:'操刀鬼庖解斬',activeText:'精準攻擊弱點，對破甲敵人必定暴擊並延長流血。',passiveName:'庖丁解骨',passiveText:'對流血敵人提高暴擊傷害。',cooldown:2,mechanic:'butcher_cut',stats:{bleedDamage:.22}},
    28:{hero:'孫二娘',activeName:'母夜叉麻翻酒',activeText:'對全敵施加中毒與遲緩，首領受到的控制時間減半。',passiveName:'十字坡伏客',passiveText:'首輪攻擊有機率使敵人無法行動。',cooldown:4,mechanic:'poison_feast',stats:{firstStun:.12}},
    29:{hero:'張青',activeName:'菜園子暗標襲',activeText:'從後排奇襲氣血最低敵人，擊倒時隱匿並提前行動。',passiveName:'菜園伏擊',passiveText:'對氣血低於一半的敵人增傷。',cooldown:2,mechanic:'ambush_mark',stats:{execute:.18}},
    30:{hero:'顧大嫂',activeName:'母大蟲登州號',activeText:'呼集援手，治療全隊並補充一份章回藥品。',passiveName:'登州豪膽',passiveText:'隊友陣亡時立即獲得合擊值。',cooldown:5,mechanic:'reinforcement_call',stats:{comboOnDown:25}},
    31:{hero:'孫新',activeName:'小尉遲雙鉤護店',activeText:'嘲諷敵軍並反擊下一次攻擊，保護後排。',passiveName:'店門護陣',passiveText:'後排受到的傷害降低。',cooldown:3,mechanic:'hook_guard',stats:{backDamageTaken:.88}},
    32:{hero:'解珍',activeName:'兩頭蛇獵網',activeText:'束縛目標並對其他敵人施加流血。',passiveName:'山林獵首',passiveText:'對野獸、召喚物與首領援兵增傷。',cooldown:3,mechanic:'hunter_net',stats:{minionDamage:.20}},
    33:{hero:'解寶',activeName:'雙尾蠍毒矢',activeText:'施加劇毒，目標每次行動都會受到傷害。',passiveName:'毒蠍追跡',passiveText:'中毒敵人死亡時毒性擴散。',cooldown:3,mechanic:'venom_arrow',stats:{poisonSpread:true}},
    34:{hero:'鄒淵',activeName:'出林龍泉脈護陣',activeText:'清除全隊持續傷害並依清除數量建立護盾。',passiveName:'泉脈回流',passiveText:'每次解除負面狀態時回復豪氣。',cooldown:4,mechanic:'spring_cleanse',stats:{cleanseSp:12}},
    35:{hero:'鄒潤',activeName:'獨角龍突額',activeText:'強制撞退目標行動位置並造成暈眩。',passiveName:'獨角硬闖',passiveText:'免疫每場戰鬥第一次暈眩。',cooldown:3,mechanic:'horn_charge',stats:{stunImmuneOnce:true}},
    36:{hero:'陶宗旺',activeName:'九尾龜築壘',activeText:'建立可承受多次攻擊的土壘並提升全隊防禦。',passiveName:'土木總管',passiveText:'梁山建築每級都略微提高自身能力。',cooldown:4,mechanic:'earthworks',stats:{baseScale:.012}}
  };

  const get = number => records[Number(number)] || null;

  function execute(number, c) {
    const r = get(number);
    if (!r || !c) return '';
    const a = c.actor, t = c.target;
    const hit = (target, mult, opts={}) => c.hit(target, mult, opts);
    const enemies = () => c.enemies().filter(x => x.alive);
    const allies = () => c.allies().filter(x => x.alive);
    const low = () => allies().sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp)[0];
    let note = '';
    switch (r.mechanic) {
      case 'tiger_chain': {
        let total=0; for(let i=0;i<3&&t.alive;i++) total+=hit(t,.48+i*.08,{crit:i===2});
        if(!t.alive){const next=enemies().sort((x,y)=>x.hp-y.hp)[0]; if(next) total+=hit(next,.72,{pierce:true}); a.sp=Math.min(a.maxSp,a.sp+45);}
        note=`三斬共 ${total}`; break;
      }
      case 'monk_quake': {let total=0; enemies().forEach(e=>{total+=hit(e,.72); if(c.random()<.25)c.status(e,'stun',1,1);}); allies().forEach(x=>c.shield(x,70+a.level*5)); note=`震嶽 ${total}，全隊護盾`; break;}
      case 'spear_counter': {const d=hit(t,1.28,{pierce:true}); c.status(a,'counter',2,.8); c.shield(a,90+a.level*4); note=`回馬槍 ${d}，進入反擊`; break;}
      case 'escort_guard': {const d=hit(t,.95); const x=low(); if(x){c.shield(x,120+a.level*5); c.status(x,'haste',2,18); c.status(x,'guarded',2,.35);} note=`護綱 ${d}，護衛 ${x?.name||''}`; break;}
      case 'benevolent_command': {allies().forEach(x=>c.heal(x,a.atk*.55)); c.teamSp(38); c.combo(34); note='全隊治療、回氣與聚義'; break;}
      case 'berserk_cleave': {const missing=1-a.hp/a.maxHp; let total=0; enemies().slice(0,2).forEach(e=>total+=hit(e,.82+missing*.9,{crit:missing>.55})); note=`狂斬 ${total}`; break;}
      case 'blade_dance': {let total=0; enemies().forEach(e=>{total+=hit(e,.58);c.status(e,'bleed',3,24+a.level);}); c.status(a,'evade',2,.28); note=`回旋 ${total}，附加流血`; break;}
      case 'cavalry_charge': {let total=0; enemies().forEach(e=>{total+=hit(e,e.type==='boss'?.82:1.02);c.status(e,'slow',2,18);}); note=`鐵騎衝陣 ${total}`; break;}
      case 'peerless_duel': {let d=hit(t,t.type==='boss'?1.75:1.25,{pierce:true,crit:t.type==='boss'}); if(t.type!=='boss'&&t.alive)d+=hit(t,.65,{pierce:true}); note=`無雙決鬥 ${d}`; break;}
      case 'thunder_ritual': {let total=0; const effects=['stun','slow','armorBreak']; enemies().forEach((e,i)=>{total+=hit(e,.68,{pierce:true}); const k=effects[(i+number)%effects.length]; c.status(e,k,k==='stun'?1:3,k==='stun'?1:22);}); note=`五雷齊落 ${total}`; break;}
      case 'stone_barrage': {let total=0; for(let i=0;i<3&&t.alive;i++)total+=hit(t,.42+i*.08,{crit:i===2}); note=`飛石連珠 ${total}`; break;}
      case 'piercing_arrow': {const priority=enemies().find(e=>e.type==='caster'||e.type==='ranged')||t; const d=hit(priority,1.55,{pierce:true,crit:priority.hp===priority.maxHp}); note=`穿雲箭 ${d}`; break;}
      case 'meteor_stones': {let total=0,counts={}; for(let i=0;i<5;i++){const list=enemies();if(!list.length)break;const e=list[Math.floor(c.random()*list.length)];counts[e.id]=(counts[e.id]||0)+1;total+=hit(e,.32+counts[e.id]*.09,{crit:counts[e.id]>=3});} note=`流星五投 ${total}`; break;}
      case 'grapple_steal': {const d=hit(t,.92,{pierce:true}); const buff=['haste','power','precision'].find(k=>t.statuses?.[k]); if(buff){delete t.statuses[buff];c.status(a,buff,2,18);} c.status(t,'silence',1,1); c.status(a,'haste',2,20); note=`擒拿 ${d}，奪勢封技`; break;}
      case 'river_dash': {let total=0;enemies().forEach(e=>total+=hit(e,.68));c.status(a,'haste',3,26);c.requeue(a.id,999);note=`翻江 ${total}，提前行動`;break;}
      case 'initiative_shift': {allies().forEach(x=>c.status(x,'haste',2,22));const x=allies().sort((p,q)=>p.speed-q.speed)[0];if(x)c.requeue(x.id,998);note=`全隊神行，${x?.name||''}提前`;break;}
      case 'tactical_reset': {const x=allies().sort((p,q)=>(q.cooldowns?.skill||0)-(p.cooldowns?.skill||0))[0];if(x){x.cooldowns={skill:0,system:Math.max(0,(x.cooldowns?.system||0)-1)};}c.teamSp(48);c.combo(20);note=`重整 ${x?.name||''} 冷卻並回氣`;break;}
      case 'edict_seal': {const d=hit(t,.72,{pierce:true});c.status(t,t.type==='boss'?'slow':'silence',t.type==='boss'?2:1,t.type==='boss'?30:1);c.status(t,'weaken',3,24);c.status(t,'armorBreak',3,24);note=`檄文封令 ${d}`;break;}
      case 'judgement': {const debuffs=Object.keys(t.statuses||{}).filter(k=>['burn','poison','bleed','slow','weaken','armorBreak','silence','stun'].includes(k)).length;const d=hit(t,1+debuffs*.22,{pierce:debuffs>=2,crit:debuffs>=4});['haste','power','precision'].forEach(k=>delete t.statuses?.[k]);note=`斷罪 ${d}（${debuffs} 項罪證）`;break;}
      case 'war_song': {allies().forEach(x=>{c.heal(x,a.atk*.28);c.status(x,'power',3,18);if(x.statuses)delete x.statuses.slow;});c.teamSp(24);note='振軍曲：鼓舞、治療、解緩';break;}
      case 'saving_seal': {const x=low();if(x){c.status(x,'savingSeal',4,1);c.shield(x,80+a.level*4);}note=`金印護住 ${x?.name||''}`;break;}
      case 'ramming_ship': {const shield=allies().reduce((s,x)=>s+(x.shield||0),0);let total=0;enemies().forEach(e=>total+=hit(e,.58+Math.min(.65,shield/1800),{pierce:shield>400}));note=`破浪舟撞擊 ${total}`;break;}
      case 'armor_mend': {allies().forEach(x=>{delete x.statuses?.armorBreak;c.shield(x,65+a.level*4);c.status(x,'fortify',3,20);});note='全隊修甲與護盾';break;}
      case 'weapon_temper': {allies().forEach(x=>{c.status(x,'power',3,22);c.status(x,'precision',3,12);});note='全隊兵刃淬火';break;}
      case 'cannon_blast': {let total=0;enemies().forEach(e=>total+=hit(e,e.shield>0?1.55:1.02,{pierce:e.type==='minion',crit:c.battle.round%3===0}));note=`震城砲 ${total}`;break;}
      case 'regeneration': {const x=low();if(x){c.heal(x,a.atk*1.35);c.status(x,'regen',4,Math.round(a.atk*.22));}note=`療馬方救治 ${x?.name||''}`;break;}
      case 'butcher_cut': {const hasBreak=!!t.statuses?.armorBreak;const d=hit(t,hasBreak?1.48:1.08,{pierce:hasBreak,crit:hasBreak});const old=t.statuses?.bleed;if(old)old.duration+=2;else c.status(t,'bleed',3,28+a.level);note=`庖解斬 ${d}`;break;}
      case 'poison_feast': {enemies().forEach(e=>{c.status(e,'poison',4,24+a.level);c.status(e,'slow',3,16);});note='全敵麻毒與遲緩';break;}
      case 'ambush_mark': {const x=enemies().sort((p,q)=>p.hp-q.hp)[0]||t;const d=hit(x,x.hp/x.maxHp<.5?1.65:1.15,{crit:x.hp/x.maxHp<.5});if(!x.alive){c.status(a,'evade',2,.45);c.requeue(a.id,997);}note=`暗標奇襲 ${d}`;break;}
      case 'reinforcement_call': {allies().forEach(x=>c.heal(x,a.atk*.48));c.combo(42);c.addMedicine(1);note='援手抵達：治療、合擊、補藥';break;}
      case 'hook_guard': {const d=hit(t,.76);c.status(a,'taunt',2,1);c.status(a,'counter',2,.72);allies().filter(x=>x.row==='back').forEach(x=>c.shield(x,90));note=`雙鉤護陣 ${d}`;break;}
      case 'hunter_net': {const d=hit(t,.86);c.status(t,'stun',1,1);enemies().filter(e=>e!==t).forEach(e=>c.status(e,'bleed',3,22+a.level));note=`獵網束敵 ${d}`;break;}
      case 'venom_arrow': {const d=hit(t,1.02,{pierce:true});c.status(t,'actionPoison',4,30+a.level);note=`毒矢 ${d}，行動即受毒傷`;break;}
      case 'spring_cleanse': {let cleared=0;allies().forEach(x=>{for(const k of ['burn','poison','bleed','slow','weaken','armorBreak','silence'])if(x.statuses?.[k]){delete x.statuses[k];cleared++;}});allies().forEach(x=>c.shield(x,45+cleared*25));c.teamSp(cleared*8);note=`清除 ${cleared} 項危害並築泉盾`;break;}
      case 'horn_charge': {const d=hit(t,1.15,{pierce:true});c.status(t,'stun',1,1);c.requeue(t.id,-999);note=`突額撞退 ${d}`;break;}
      case 'earthworks': {allies().forEach(x=>{c.shield(x,105+a.level*5);c.status(x,'fortify',3,24);});note='築壘：全隊護盾與防禦';break;}
      default: note='專屬戰法發動';
    }
    return note;
  }

  window.LS74Tiangang = {records,get,execute,count:Object.keys(records).length};
})();
