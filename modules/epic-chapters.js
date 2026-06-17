(() => {
  'use strict';
  const epics = {
    1:{label:'景陽岡伏虎',intro:'暮色沉入景陽岡，酒旗、虎嘯與百姓勸阻同時逼近。武松必須在豪氣與謹慎之間做出決斷。',choices:[
      {key:'drink',title:'痛飲十八碗再上岡',text:'暴擊提高，但首戰氣血略降。',crit:.08,frontDamage:55,ending:'醉膽伏虎'},
      {key:'scout',title:'先查榜文與虎蹤',text:'敵方防禦降低，章回評分提高。',enemyDef:.88,scoreBonus:5,ending:'明察除害'},
      {key:'escort',title:'護送百姓繞過山岡',text:'全隊獲得護盾，獎勵略降。',shield:130,reward:.94,ending:'護民安岡'}],
      trial:{key:'tiger_sign',name:'虎蹤辨識',icon:'🐅',prompt:'林中三處痕跡，何者最可能是猛虎新近留下？',options:['樹皮高處新鮮抓痕與血腥味','路邊整齊馬蹄印','溪旁舊柴灰'],best:0,success:'你判明猛虎伏處，首領第一階段護盾降低。',fail:'猛虎突襲，全隊首輪受驚。'},
      endings:{drink:['醉拳伏虎','你以驚人氣勢正面擊倒猛虎，傳為豪烈佳話。'],scout:['明察伏虎','你憑足跡與風向先制猛虎，救下過岡百姓。'],escort:['護民伏虎','你先安置百姓，再回岡除害，留下仁勇之名。']}
    },
    2:{label:'野豬林救援',intro:'林深路險，暗哨正逼近受困之人。魯達必須在隱蔽救援與正面震懾間選擇。',choices:[
      {key:'ambush',title:'埋伏林間先制',text:'全隊速度提高，首輪可震懾。',speed:1.08,firstStun:.35,ending:'林間奇救'},
      {key:'roar',title:'現身喝退惡卒',text:'前排攻擊提高，敵方攻擊也提高。',frontAtk:1.16,enemyAtk:1.06,ending:'禪杖震林'},
      {key:'evidence',title:'留下證據再救人',text:'獎勵提高，首戰增加一名追兵。',reward:1.18,extraEnemy:1,ending:'救人留證'}],
      trial:{key:'forest_route',name:'林間伏線',icon:'🌲',prompt:'三條小徑中，哪條最適合無聲接近押送隊伍？',options:['逆風且有灌木遮掩的小徑','落葉最厚的坡道','溪水中央'],best:0,success:'你繞到敵後，先機在手。',fail:'枯枝作響，敵方提高警戒。'},
      endings:{ambush:['林間奇救','你以最少傷亡救出受困之人。'],roar:['禪杖震林','一聲怒喝震散惡卒，豪氣傳遍野豬林。'],evidence:['救人留證','你救人並保留罪證，後續追查有據。']}
    },
    3:{label:'風雪山神廟',intro:'風雪封路，草料場火光忽起。林沖面對背叛與追兵，必須決定守、退或反擊。',choices:[
      {key:'hold',title:'固守山神廟',text:'防禦與反擊提高。',frontDef:1.16,shield:90,ending:'風雪守關'},
      {key:'track',title:'循腳印追查縱火者',text:'敵方速度下降，獎勵提高。',enemySpeed:.92,reward:1.12,ending:'雪夜追兇'},
      {key:'rescue',title:'先救草料場役夫',text:'藥品增加，評分上限提高。',medicine:1,scoreBonus:4,ending:'義救雪原'}],
      trial:{key:'snow_trace',name:'雪痕推斷',icon:'❄️',prompt:'風雪中哪個跡象最能證明有人故意縱火？',options:['逆風處出現油跡與新鞋印','屋簷積雪較厚','遠處有犬吠'],best:0,success:'縱火者無法再隱藏，首領攻擊降低。',fail:'證據不足，敵方趁亂突襲。'},
      endings:{hold:['風雪守關','你守住山神廟，以槍勢逼退追兵。'],track:['雪夜追兇','你循雪痕反追主使，洗清冤屈。'],rescue:['義救雪原','你先救無辜役夫，再於風雪中反擊。']}
    },
    5:{label:'及時雨聚義',intro:'各路豪傑意見不一，宋江要在情義、法度與救急之間建立共同方向。',choices:[
      {key:'oath',title:'先立聚義盟誓',text:'合擊值提高，羈絆效果增強。',combo:1.18,sp:35,ending:'眾心歸一'},
      {key:'relief',title:'先開倉救急',text:'治療與獎勵提高。',heal:1.12,reward:1.10,ending:'及時濟民'},
      {key:'rules',title:'先立軍紀法度',text:'全隊防禦提高，敵方攻擊下降。',allyDef:1.08,enemyAtk:.94,ending:'義軍有序'}],
      trial:{key:'oath_words',name:'盟誓次序',icon:'🤝',prompt:'眾人爭執時，最先應確認什麼？',options:['共同要保護的人與不可逾越的底線','誰的武藝最高','誰先喝酒'],best:0,success:'眾人找到共同目標，合擊更易發動。',fail:'盟誓流於形式，士氣不穩。'},
      endings:{oath:['眾心歸一','你以盟誓凝聚眾心，梁山初具共同意志。'],relief:['及時濟民','你先救百姓，及時雨之名深入人心。'],rules:['義軍有序','你以軍紀守住聚義初心。']}
    },
    9:{label:'大名府無雙戰',intro:'盧俊義面對層層重圍與強敵挑戰，必須選擇單騎破陣、誘敵分兵或護送同伴。',choices:[
      {key:'duel',title:'單騎挑戰敵將',text:'對首領增傷，普通敵人攻擊提高。',bossDamage:1.18,enemyAtk:1.05,ending:'玉麒麟無雙'},
      {key:'divide',title:'誘敵分兵各破',text:'敵人數量減少，速度提高。',extraEnemy:-1,enemySpeed:1.06,ending:'分兵制勝'},
      {key:'escort',title:'護送同伴先撤',text:'護盾與治療提高，獎勵略降。',shield:100,heal:1.10,reward:.96,ending:'義護同袍'}],
      trial:{key:'duel_read',name:'敵將破綻',icon:'🦄',prompt:'敵將連出重招後，哪個時機最適合反擊？',options:['招式收勢、重心前傾時','對方起手時立刻硬碰','閉眼憑感覺'],best:0,success:'你抓住破綻，首領第二階段攻勢降低。',fail:'錯判節奏，首領獲得怒勢。'},
      endings:{duel:['玉麒麟無雙','你以正面決鬥擊潰敵將，河北無雙名震四方。'],divide:['分兵制勝','你將重圍拆解，各個擊破。'],escort:['義護同袍','你先保同袍平安，再回身破陣。']}
    },
    10:{label:'五雷破邪陣',intro:'公孫勝察覺敵陣以假象擾亂軍心，必須選擇雷法、破陣或護民。',choices:[
      {key:'thunder',title:'引雷直破陣眼',text:'狀態命中提高，技能冷卻略長。',status:.10,cooldown:1,ending:'五雷定邪'},
      {key:'dispel',title:'逐層拆解幻陣',text:'敵方防禦下降，戰鬥回合增加評分。',enemyDef:.9,scoreBonus:4,ending:'破幻明心'},
      {key:'ward',title:'先布護民法陣',text:'全隊護盾提高，獎勵略降。',shield:150,reward:.94,ending:'法護眾生'}],
      trial:{key:'array_eye',name:'陣眼辨位',icon:'⚡',prompt:'邪陣四方煙霧交纏，真正陣眼在哪裡？',options:['煙勢逆轉且地面符紋重疊處','聲音最大的鼓位','旗幟最高處'],best:0,success:'陣眼被識破，敵方控制效果減弱。',fail:'幻象擾心，全隊首輪遲緩。'},
      endings:{thunder:['五雷定邪','雷法直落陣眼，邪勢一舉瓦解。'],dispel:['破幻明心','你逐層拆陣，眾人不再受幻象所惑。'],ward:['法護眾生','你先護百姓，再以雷法收束邪陣。']}
    },
    14:{label:'浪子巧入敵營',intro:'燕青要以口才、身手與觀察力潛入敵營，取得關鍵名冊。',choices:[
      {key:'disguise',title:'易裝混入宴席',text:'敵方數量減少，失敗時速度提高。',extraEnemy:-1,enemySpeed:1.04,ending:'巧計取冊'},
      {key:'wrestle',title:'以相撲挑戰引開守衛',text:'暴擊提高，首戰敵人攻擊提高。',crit:.08,enemyAtk:1.05,ending:'擒拿奪路'},
      {key:'rooftop',title:'由屋頂夜行潛入',text:'全隊速度提高，評分受判斷影響較大。',speed:1.10,scoreBonus:2,ending:'月下無痕'}],
      trial:{key:'guest_list',name:'宴席名冊',icon:'🎭',prompt:'要確認假身份是否可信，最先核對哪項？',options:['座次、引薦人與到場時刻','衣服顏色','酒量大小'],best:0,success:'身份毫無破綻，敵軍未能集結。',fail:'守衛起疑，後續增加追兵。'},
      endings:{disguise:['巧計取冊','你以談笑掩護，無聲取走名冊。'],wrestle:['擒拿奪路','你用相撲巧勁吸引全場目光，趁亂得手。'],rooftop:['月下無痕','你踏瓦無聲，來去不留痕跡。']}
    },
    15:{label:'浪裡白條水戰',intro:'張順面對急流、暗礁與水賊，必須在乘潮、潛水與救船間抉擇。',choices:[
      {key:'tide',title:'乘潮正面衝舟',text:'後排與水軍傷害提高，敵方速度也提高。',backAtk:1.16,enemySpeed:1.05,ending:'乘潮破賊'},
      {key:'dive',title:'潛水鑿斷敵纜',text:'首領護盾降低，首輪豪氣較少。',bossShield:-.15,sp:-20,ending:'水底奇襲'},
      {key:'rescue',title:'先救傾覆民船',text:'藥品與評分提高，獎勵略降。',medicine:1,scoreBonus:5,reward:.95,ending:'白條濟舟'}],
      trial:{key:'tide_turn',name:'潮向判讀',icon:'🌊',prompt:'浪頭忽然變碎，代表什麼？',options:['暗礁與回流交會，應轉舵減速','水面安全可全速前進','立刻棄船'],best:0,success:'船隊避開暗礁，首戰獲得護盾。',fail:'船身受損，全隊首輪遲緩。'},
      endings:{tide:['乘潮破賊','你借潮勢直破敵舟。'],dive:['水底奇襲','你潛入水下斷纜，敵舟失去控制。'],rescue:['白條濟舟','你先救民船，再回頭擊潰水賊。']}
    },
    16:{label:'神行急遞',intro:'戴宗必須在限時內傳遞軍情，路上卻有封鎖、傷員與假情報。',choices:[
      {key:'speed',title:'甲馬神行直奔目的地',text:'全隊速度提高，敵人數量可能增加。',speed:1.14,extraEnemy:1,ending:'日行八百'},
      {key:'verify',title:'沿途核驗情報真偽',text:'敵方防禦下降，時間獎勵略減。',enemyDef:.9,reward:.98,ending:'真報抵營'},
      {key:'relay',title:'分段建立接力驛站',text:'豪氣回復提高，素材獎勵增加。',sp:45,material:1.2,ending:'驛路通明'}],
      trial:{key:'message_seal',name:'軍情真偽',icon:'📨',prompt:'兩封軍情內容相近，何者更可信？',options:['封泥、暗記與送達時序都吻合者','字跡較漂亮者','內容較誇張者'],best:0,success:'假情報被排除，首領援兵減少。',fail:'錯誤情報拖延行程，敵方先行布陣。'},
      endings:{speed:['日行八百','你以神行之速讓軍情及時抵達。'],verify:['真報抵營','你寧可慢一步，也不讓假情報誤軍。'],relay:['驛路通明','你建立接力驛路，後續軍情暢通。']}
    },
    21:{label:'玉臂金印護命',intro:'金大堅發現偽印流入軍中，必須辨印、護人並阻止假令擴散。',choices:[
      {key:'seal',title:'先驗印紋與材質',text:'敵方防禦下降，裝備素材增加。',enemyDef:.9,material:1.18,ending:'金石辨偽'},
      {key:'protect',title:'先為使者刻護命印',text:'最低血量英雄獲得救命效果。',shield:100,ending:'玉印護命'},
      {key:'bait',title:'用假印反誘幕後者',text:'獎勵提高，首領攻擊提高。',reward:1.18,enemyAtk:1.07,ending:'借印擒首'}],
      trial:{key:'seal_mark',name:'印紋鑑別',icon:'🪨',prompt:'真假印章最可靠的差異是？',options:['刀口轉折、石質與舊印磨損一致性','顏色越紅越真','尺寸越大越真'],best:0,success:'偽印來源被鎖定，首領增益被移除。',fail:'偽令擴散，敵方獲得護盾。'},
      endings:{seal:['金石辨偽','你從細微刀痕識破偽印。'],protect:['玉印護命','你以護命印救下關鍵使者。'],bait:['借印擒首','你反用偽印設局，引出幕後主使。']}
    },
    28:{label:'十字坡迷局',intro:'孫二娘察覺旅店遭人冒名行惡，必須在設局、救客與追查貨路之間抉擇。',choices:[
      {key:'trap',title:'設局誘出冒名者',text:'控制命中提高，首領毒抗提高。',status:.10,enemyDef:1.04,ending:'夜叉設局'},
      {key:'rescue',title:'先救被困旅客',text:'治療與評分提高。',heal:1.15,scoreBonus:5,ending:'十字坡救客'},
      {key:'trail',title:'追查贓貨去向',text:'銀兩與素材提高，敵人速度提高。',reward:1.16,material:1.15,enemySpeed:1.05,ending:'循贓破網'}],
      trial:{key:'wine_scent',name:'酒香辨毒',icon:'🍶',prompt:'三壇酒中，哪壇可能被動過手腳？',options:['封泥重封且香氣被辛味遮掩者','最清澈者','最昂貴者'],best:0,success:'迷藥被識破，隊伍免疫首輪中毒。',fail:'判斷稍遲，全隊受到輕微毒害。'},
      endings:{trap:['夜叉設局','你反設迷局，讓冒名者自投羅網。'],rescue:['十字坡救客','你先救旅客，洗清十字坡惡名。'],trail:['循贓破網','你沿贓貨路線搗破整個黑網。']}
    },
    108:{label:'百八聚義終章',intro:'百八英雄齊聚，最後的敵人不是單一豪強，而是讓百姓反覆受害的整套黑網。',choices:[
      {key:'unite',title:'百八英雄分路合圍',text:'合擊與速度提高，首領分階更強。',combo:1.25,speed:1.08,enemyAtk:1.06,ending:'百八同心'},
      {key:'people',title:'先護百姓再斷黑網',text:'全隊護盾與治療提高，獎勵略降。',shield:160,heal:1.15,reward:.95,ending:'聚義為民'},
      {key:'truth',title:'公開證據瓦解黑網',text:'首領防禦下降，分支評分提高。',enemyDef:.86,scoreBonus:6,ending:'真相昭世'}],
      trial:{key:'final_order',name:'終局次序',icon:'🏯',prompt:'黑網同時控制糧道、軍令與百姓，應先斷哪一環？',options:['先保民生與通訊，再公開證據合圍','只追最顯眼首領','各隊自行決定'],best:0,success:'百八英雄行動一致，終局首領失去援軍。',fail:'各路短暫失聯，但仍可在決戰中重整。'},
      endings:{unite:['百八同心','百八英雄分路合圍，最後在聚義旗下會師。'],people:['聚義為民','你以百姓安危為先，梁山聚義終得其義。'],truth:['真相昭世','證據公諸於世，黑網從根本瓦解。']}
    }
  };
  const get = n => epics[Number(n)] || null;
  function storyForChapter(ch){const e=get(ch?.number);if(!e)return null;return{name:e.label,icon:'📖',choices:e.choices};}
  function trialForChapter(ch){return get(ch?.number)?.trial||null;}
  function branchEnding(ch,run){const e=get(ch?.number);if(!e)return null;const c=e.choices.find(x=>x.key===run?.choice)||e.choices[0];const pair=e.endings[c.key]||[e.label,'本回完成。'];const suffix=run?.trialSuccess?'・完美':'・補救';return{title:pair[0]+suffix,text:pair[1]+(run?.trialSuccess?' 關鍵判斷也獲得成功，形成完美結局。':' 雖然中途判斷受挫，眾英雄仍在決戰中挽回局勢。'),key:`epic:${ch.number}:${c.key}:${run?.trialSuccess?'perfect':'recovery'}`,tier:run?.trialSuccess?'perfect':'normal'};}
  function introForChapter(ch){return get(ch?.number)?.intro||'';}
  function isEpic(n){return Boolean(get(n));}
  window.LS75Epic={epics,get,storyForChapter,trialForChapter,branchEnding,introForChapter,isEpic,count:Object.keys(epics).length};
})();
