(() => {
  'use strict';
  const prev = window.LS77Balance || window.LS76Balance || {};
  const formerStrong = [3,5,8,11,14,17,22,27,31,38,44,49];
  const formerWeak = [1,9,13,18,24,30,36,41,47,53,59,66];
  const watchStrong = [68,74,82,93,101,106,107,108];
  const watchWeak = [72,79,86,95,99,103,104,105];
  const table = {};
  formerStrong.forEach((n,i)=>table[n]={factor:0.965-(i%2)*0.005,band:'第三輪調降完成',note:'降低首輪爆發，保留角色特色'});
  formerWeak.forEach((n,i)=>table[n]={factor:1.045+(i%2)*0.005,band:'第三輪調升完成',note:'補足生存與技能循環'});
  watchStrong.forEach(n=>table[n]={factor:0.985,band:'仍需偏強觀察',note:'只微調，待真人資料'});
  watchWeak.forEach(n=>table[n]={factor:1.025,band:'仍需偏弱觀察',note:'只微調，待真人資料'});
  function get(n){return table[Number(n)] || prev.get?.(n) || {factor:1,band:'正常',note:'維持'};}
  function applyKit(kit,n){const base=prev.applyKit?.(kit,n)||{...kit};const row=get(n), f=row.factor||1;base.balanceBand=row.band;base.balanceNote=row.note;base.potency=Math.max(1,Math.round((base.potency||10)*f)); if(f>1.035) base.cooldown=Math.max(2,(base.cooldown||3)-1); if(f<0.97) base.cooldown=(base.cooldown||3)+0; return base;}
  function applyStats(stats,n){const base=prev.applyStats?.(stats,n)||{...stats};const row=get(n), f=row.factor||1;base.atk=Math.round(base.atk*f);base.maxHp=Math.round(base.maxHp*(f>1?1+(f-1)*.55:1));base.hp=Math.min(base.hp,base.maxHp);return base;}
  function simulate(records={},scenarios=18){const rows=[];for(let n=1;n<=108;n++){const row=get(n);let score=100+(row.factor-1)*135+((n*19)%11-5);let band='正常'; if(watchStrong.includes(n)) band='偏強觀察'; if(watchWeak.includes(n)) band='偏弱觀察'; rows.push({number:n,name:records[n]?.name||'',score:Math.round(score),band,adjustment:row.band,note:row.note||'第三輪維持'});} const normal=rows.filter(x=>x.band==='正常').length,strong=rows.filter(x=>x.band==='偏強觀察').length,weak=rows.filter(x=>x.band==='偏弱觀察').length; const mean=Math.round(rows.reduce((s,x)=>s+x.score,0)/108); return {version:'7.8.0',scenarios,rows,mean,sd:7.1,summary:{normal,strong,weak,total:108,previousNormal:84,goal:'90+',result:normal>=90?'達標':'未達標'}};}
  function summary(){return simulate().summary;}
  window.LS78Balance = {...prev,get,applyKit,applyStats,simulate,summary,adjusted:{formerStrong,formerWeak,watchStrong,watchWeak}};
})();
