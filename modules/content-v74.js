(() => {
  'use strict';
  const trialTypes = [
    {key:'evidence',name:'證詞比對',icon:'🔎',prompt:'三份證詞互相矛盾，先查哪一項最能確認真相？',options:['核對時間與地點','先處罰最可疑者','只聽官差說法'],best:0,success:'你找出關鍵時間差，敵方防禦下降。',fail:'線索不足，敵方有所準備。'},
    {key:'route',name:'路線推演',icon:'🗺️',prompt:'前方有近路、官道與山徑，如何安排？',options:['斥候先探再走官道','全軍搶走近路','分散走三條路'],best:0,success:'路線安全，隊伍首輪速度提高。',fail:'隊形被拉長，敵人獲得先機。'},
    {key:'formation',name:'軍陣配置',icon:'🛡️',prompt:'敵軍弓手居高臨下，應如何列陣？',options:['盾兵前列、快軍繞側','全軍密集正衝','後排先行'],best:0,success:'側翼成功壓制弓手。',fail:'前軍承受額外箭雨。'},
    {key:'tide',name:'潮勢判讀',icon:'🌊',prompt:'潮水將轉，船隊該如何行動？',options:['先下錨確認風向','立刻全速追擊','分船逆流而上'],best:0,success:'船隊穩住陣腳，獲得護盾。',fail:'船身搖晃，全隊受到遲緩。'},
    {key:'triage',name:'救護分診',icon:'🩺',prompt:'傷患同時送達，應優先處理誰？',options:['呼吸困難者','輕微擦傷者','先到者'],best:0,success:'分診正確，章回藥品增加。',fail:'醫療資源分配失衡。'},
    {key:'debate',name:'民議公斷',icon:'📜',prompt:'百姓與商戶各執一詞，如何處置？',options:['公開規則並逐項查證','先安撫有勢力者','暫時不處理'],best:0,success:'眾人信服，銀兩獎勵提高。',fail:'民怨未平，首領攻擊提高。'},
    {key:'forge',name:'工藝校驗',icon:'⚒️',prompt:'新鍛兵器出現裂紋，應先檢查？',options:['材料批次與火候紀錄','直接重新上漆','責怪使用者'],best:0,success:'找出材料問題，獲得額外鐵礦。',fail:'瑕疵未除，敵方護盾提高。'},
    {key:'track',name:'足跡追蹤',icon:'🏹',prompt:'林中出現多組足跡，哪一組值得追查？',options:['新鮮且刻意掩蓋者','最明顯的大腳印','離營地最近者'],best:0,success:'伏兵位置曝光，首戰敵人減少。',fail:'誤入支路，首戰增加伏兵。'},
    {key:'stealth',name:'潛行暗號',icon:'🌙',prompt:'守門人要求暗號，如何應對？',options:['觀察巡兵交接後模仿','立刻拔刀','隨便猜一個'],best:0,success:'無聲通過，首輪可震懾敵人。',fail:'警報響起，敵方速度提高。'},
    {key:'rescue',name:'限時救援',icon:'⏱️',prompt:'火勢蔓延，先救哪一處？',options:['被火路包圍的百姓','尚能自行撤離者','先搬運財物'],best:0,success:'救援順序正確，全隊士氣提高。',fail:'錯失時機，章回評分上限降低。'},
    {key:'defense',name:'守城調度',icon:'🏯',prompt:'敵軍集中攻擊東門，如何應變？',options:['預備隊增援並保留西門斥候','抽空所有城門兵力','直接棄城'],best:0,success:'守軍調度得當，全隊防禦提高。',fail:'其他城門出現漏洞。'},
    {key:'supply',name:'糧草分配',icon:'🌾',prompt:'糧草不足三日，應如何安排？',options:['依任務優先並公開配給','將好糧全給前軍','隱瞞短缺'],best:0,success:'軍心穩定，遠征獎勵提高。',fail:'軍心不穩，豪氣回復降低。'}
  ];
  function trialForChapter(ch){return trialTypes[(Number(ch.number)-1)%trialTypes.length];}
  function branchEnding(ch,run){const choice=run?.choice||'未選';const trial=trialForChapter(ch);const success=Boolean(run?.trialSuccess);const suffix=success?'善策定局':'險中補救';return{title:`${ch.nickname}${ch.name}・${suffix}`,text:success?`你在「${trial.name}」中判斷正確，並以「${choice}」方案完成${ch.focus}，百姓與梁山皆記下此功。`:`「${trial.name}」一度受挫，但眾英雄在決戰中挽回局勢；本回形成較艱難的分支結局。`,key:`${choice}:${trial.key}:${success?'success':'recovery'}`};}
  window.LS74Content = {trialTypes,trialForChapter,branchEnding};
})();
