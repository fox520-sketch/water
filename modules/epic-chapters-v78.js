(() => {
  'use strict';
  const base = window.LS77Epic || window.LS76Epic || {};
  const EPIC = Array.from({length:108},(_,i)=>i+1);
  const late = Array.from({length:36},(_,i)=>i+73);
  const scenarioNames = [
    '義路開端','風雪抉擇','山寨攻防','江州救援','祝家破局','水泊合流','市井公斷','草澤追蹤','梁山總議','征途暗潮','方臘前哨','百姓歸心',
    '邊關雪線','荒村夜火','水寨盟誓','糧道暗潮','孤城守望','醫棚分診','密林尋跡','義倉公議','渡口風雷','馬道追兵','燈下辨契','終局聚義'
  ];
  const planTitles = ['正面聚義','暗線查訪','先安百姓'];
  const templates = [
    ['保存證據與名冊','先救急再追責','切斷黑手補給'],['分兵護送百姓','突入首領中帳','偽裝商隊探路'],['修復糧倉與水道','公開審理黑契','夜襲敵方信號'],['保留退路','集中火力破陣','以談判逼供'],['查驗傷患','安撫市民','追查幕後']
  ];
  function idx(ch){return (Number(ch?.number||ch)-1)%scenarioNames.length;}
  function isEpic(n){return EPIC.includes(Number(n));}
  function count(){return EPIC.length;}
  function introForChapter(ch){
    if(!isEpic(ch.number))return base.introForChapter?.(ch)||'';
    const suffix = Number(ch.number)>=73 ? 'v7.8 完章手工精修' : 'v7.7 手工精修延續';
    return `${ch.nickname}・${ch.name}親入「${ch.focus}」局中。本回為${suffix}章回，含三條故事方案、專屬判斷、補救路線與多重結局；選擇會改變敵情、獎勵、評分與後續旗標。`;
  }
  function storyForChapter(ch){
    if(!isEpic(ch.number))return base.storyForChapter?.(ch);
    const i=idx(ch), title=scenarioNames[i], n=Number(ch.number);
    return {key:`epic78-${n}`, name:`${title}・三策`, icon:['⚔️','🕯️','🏯','🚩','🌊','📜','🐎','🛡️'][i%8], choices:[
      {key:'direct',title:planTitles[0],text:`${ch.name}正面亮明義旗，壓制首領士氣；敵攻略升、獎勵提高。`,enemyAtk:1.05,reward:1.20,combo:1.12,scoreBonus:4,flag:`direct-${n}`},
      {key:'covert',title:planTitles[1],text:`派出探子與客將查訪「${ch.focus}」真相；降低敵方速度與防禦。`,enemySpeed:.90,enemyDef:.89,status:.08,scoreBonus:3,flag:`covert-${n}`},
      {key:'relief',title:planTitles[2],text:'先安置百姓、傷者與補給；開戰獲得護盾與額外補藥，銀兩略降。',shield:160,medicine:1,reward:.95,hp:1.05,scoreBonus:5,flag:`relief-${n}`}
    ]};
  }
  function trialForChapter(ch){
    if(!isEpic(ch.number))return base.trialForChapter?.(ch);
    const n=Number(ch.number), i=idx(ch), answer=(n+i)%3, t=templates[i%templates.length];
    return {name:`${scenarioNames[i]}判斷`, question:`${ch.nickname}處理「${ch.focus}」時，哪一項最能守住梁山義理並避免局勢擴大？`, options:[
      {text:t[0],success:answer===0,effect:{scoreBonus:7,enemyDef:.93,material:1.18},result:'證據與名冊完整，眾人心服，敵方防線鬆動。'},
      {text:t[1],success:answer===1,effect:{scoreBonus:6,shield:150,medicine:1},result:'救援及時，百姓與同伴士氣提高，首戰更穩。'},
      {text:t[2],success:answer===2,effect:{scoreBonus:6,extraEnemy:-1,reward:1.12},result:'退路被封，首領不得不提前現形。'}
    ], fail:{scoreBonus:-4,enemyAtk:1.07,result:'判斷仍有缺口，只能以補救行動降低損害。'}};
  }
  function branchEnding(ch,run){
    if(!isEpic(ch.number))return base.branchEnding?.(ch,run);
    const choice=run?.choice||'direct', score=Number(run?.score||0), grade=score>=92?'完美':score>=78?'良好':'補救';
    const name={direct:'義旗昭明',covert:'暗線成局',relief:'安民先行'}[choice]||'聚義功成';
    return {key:`v78-${ch.number}-${choice}-${grade}`, title:`${grade}結局・${name}`, text:`${ch.nickname}・${ch.name}以「${name}」完成本回。${grade==='完美'?'百姓、同伴與軍心皆得安定，章回留下完美旗標。':grade==='良好'?'雖有波折，仍守住梁山義理並留下可追補的線索。':'先止住災害，再把後續修補列入梁山公議。'}`};
  }
  window.LS78Epic = {...base,count:EPIC.length,handcrafted:EPIC,completedManualChapters:108,newManualChapters:late,isEpic,storyForChapter,trialForChapter,branchEnding,introForChapter};
})();
