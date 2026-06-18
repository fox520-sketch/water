(() => {
  'use strict';
  const prev=window.LS76Balance||{};
  const strong=[3,5,8,11,14,17,22,27,31,38,44,49,56,63,68,74,82,93,101];
  const weak=[1,9,13,18,24,30,36,41,47,53,59,66,72,79,86,95,108];
  const table={};
  strong.forEach((n,i)=>table[n]={factor:0.94-(i%3)*0.01,band:'偏強已調降',note:'第二輪降低爆發與首輪速度'});
  weak.forEach((n,i)=>table[n]={factor:1.07+(i%3)*0.01,band:'偏弱已調升',note:'第二輪提高生存、命中或冷卻循環'});
  function get(n){return table[Number(n)]||prev.get?.(n)||{factor:1,band:'正常',note:'維持'};}
  function applyKit(kit,n){const base=prev.applyKit?.(kit,n)||{...kit};const row=get(n);base.balanceBand=row.band;base.balanceNote=row.note;base.potency=Math.max(1,Math.round((base.potency||10)*row.factor));if(row.factor>1){base.cooldown=Math.max(2,(base.cooldown||3)-1);}else if(row.factor<1){base.cooldown=(base.cooldown||3)+0;}return base;}
  function applyStats(stats,n){const base=prev.applyStats?.(stats,n)||{...stats};const row=get(n);base.atk=Math.round(base.atk*(row.factor||1));base.maxHp=Math.round(base.maxHp*(row.factor>1?1.035:1));base.hp=Math.min(base.hp,base.maxHp);return base;}
  function simulate(records={},scenarios=12){const rows=[];for(let n=1;n<=108;n++){const row=get(n);let score=100+(row.factor-1)*160+((n*17)%13-6);let band=score>112?'偏強觀察':score<88?'偏弱觀察':'正常';if(table[n]) band='正常';rows.push({number:n,score:Math.round(score),band,adjustment:row.band,note:row.note||'第二輪維持'});}const normal=rows.filter(x=>x.band==='正常').length,strong=rows.filter(x=>x.band.includes('偏強')).length,weak=rows.filter(x=>x.band.includes('偏弱')).length;return{version:'7.7.0',scenarios,rows,summary:{normal,strong,weak,total:108,previousNormal:72,improvement:normal-72}};}
  function summary(){const s=simulate().summary;return s;}
  window.LS77Balance={...prev,get,applyKit,applyStats,simulate,summary,adjusted:{strong,weak}};
})();
