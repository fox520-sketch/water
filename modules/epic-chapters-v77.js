(() => {
  'use strict';
  const base = window.LS76Epic || window.LS75Epic || {};
  const EPIC = Array.from({length:72},(_,i)=>i+1);
  const scenarioNames = ['義路開端','風雪抉擇','山寨攻防','江州救援','祝家破局','水泊合流','市井公斷','草澤追蹤','梁山總議','征途暗潮','方臘前哨','百姓歸心'];
  const planTitles = ['正面聚義','暗線查訪','先安百姓'];
  function idx(ch){return (Number(ch?.number||ch)-1)%scenarioNames.length;}
  function isEpic(n){return EPIC.includes(Number(n));}
  function count(){return EPIC.length;}
  function introForChapter(ch){if(!isEpic(ch.number))return base.introForChapter?.(ch)||'';return `${ch.nickname}・${ch.name}親入「${ch.focus}」局中。本回為 v7.7 手工精修章回，含三條故事方案、專屬判斷、補救路線與多重結局；玩家的選擇會影響敵情、獎勵、後續紀錄與章回評級。`;}
  function storyForChapter(ch){if(!isEpic(ch.number))return base.storyForChapter?.(ch);const i=idx(ch),title=scenarioNames[i];return{key:`epic77-${ch.number}`,name:`${title}・三策`,icon:['⚔️','🕯️','🏯','🚩','🌊','📜'][i%6],choices:[
    {key:'direct',title:planTitles[0],text:'正面亮明梁山旗號，壓制首領士氣；敵攻略升、獎勵提高。',enemyAtk:1.06,reward:1.18,combo:1.10,scoreBonus:3},
    {key:'covert',title:planTitles[1],text:'派探子蒐證，降低敵方速度與防禦；若判斷失誤，回合數較多。',enemySpeed:.92,enemyDef:.90,status:0.07},
    {key:'relief',title:planTitles[2],text:'先救百姓與傷者，開戰獲得護盾與藥品；銀兩獎勵略降。',shield:150,medicine:1,reward:.94,hp:1.06}
  ]};}
  function trialForChapter(ch){if(!isEpic(ch.number))return base.trialForChapter?.(ch);const i=idx(ch),answer=(Number(ch.number)+i)%3;return{name:`${scenarioNames[i]}判斷`,question:`${ch.nickname}處理「${ch.focus}」時，哪一項最能避免後續擴大成災？`,options:[
    {text:'先保存證據與名冊，讓後續處置有憑有據。',success:answer===0,effect:{scoreBonus:6,enemyDef:.94,material:1.15},result:'證據完整，眾人心服，敵方防線鬆動。'},
    {text:'先救急、再追責，避免百姓與隊伍陷入二次損害。',success:answer===1,effect:{scoreBonus:5,shield:130,medicine:1},result:'救援及時，士氣提高，首戰更穩。'},
    {text:'先切斷黑手補給與退路，逼首領提前現形。',success:answer===2,effect:{scoreBonus:5,extraEnemy:-1,reward:1.10},result:'退路被封，首領不得不正面迎戰。'}
  ],fail:{scoreBonus:-4,enemyAtk:1.08,result:'判斷未盡周全，只能以補救行動降低損害。'}};}
  function branchEnding(ch,run){if(!isEpic(ch.number))return base.branchEnding?.(ch,run);const choice=run?.choice||'direct';const score=Number(run?.score||0);const grade=score>=90?'完美':'良好';const name={direct:'義旗昭明',covert:'暗線成局',relief:'安民先行'}[choice]||'聚義功成';return{key:`v77-${ch.number}-${choice}-${grade}`,title:`${grade}結局・${name}`,text:`${ch.nickname}・${ch.name}以「${name}」完成本回。${score>=90?'百姓、同伴與軍心皆得安定，後續章回記下完美旗標。':'雖有波折，仍守住梁山義理並留下可補強的後續線索。'}`};}
  window.LS77Epic={...base,count:EPIC.length,handcrafted:EPIC,isEpic,storyForChapter,trialForChapter,branchEnding,introForChapter};
})();
