(() => {
  'use strict';

  const VERSION = '7.9.2';
  const EDITION = '資料驗證與回歸測試強化版';
  const SAVE_KEY = 'liangshan-rpg-complete-v7';
  const PREF_KEY = 'liangshan-rpg-complete-v7-prefs';
  const DB_NAME = 'LiangshanRPG';
  const DB_VERSION = 2;
  const MAX_BACKUPS = 12;
  const BACKUP_PREFIX = 'liangshan-rpg-v7-migration-backup-';
  const chapters = Array.isArray(window.LIANGSHAN_CHAPTERS) ? window.LIANGSHAN_CHAPTERS : [];
  const Tiangang = window.LS74Tiangang || {get:()=>null,execute:()=>'',count:0};
  const Dizha = window.LS75Dizha || {get:()=>null,execute:()=>'',count:0,signatures:[]};
  const SaveSchema = window.LS75SaveSchema || null;
  const Cloud = window.LS75Cloud || null;
  const EndgameData = window.LS74Endgame || {towerFloor:n=>({floor:n,chapter:1,modifier:{},scale:1,reward:{silver:0,essence:0}}),routes:[],dispatchMissions:[]};
  const Content74 = window.LS74Content || null;
  const Epic = window.LS78Epic || window.LS77Epic || window.LS76Epic || window.LS75Epic || {storyForChapter:()=>null,trialForChapter:()=>null,branchEnding:()=>null,introForChapter:()=>'',isEpic:()=>false,count:0};
  const Rogue = window.LS78Rogue || window.LS77Rogue || window.LS76Rogue || window.LS75Rogue || null;
  const Telemetry = window.LS75Telemetry || {fresh:()=>({}),recordBattle:x=>x,simulate:()=>({rows:[]})};
  const A11y = window.LS75Accessibility || window.LS74Accessibility || {apply:()=>{},focusFirst:()=>{},trapModal:()=>{}};
  const Balance = window.LS78Balance || window.LS77Balance || window.LS76Balance || {get:()=>({factor:1,band:'正常'}),applyKit:x=>x,applyStats:x=>x,simulate:null};
  const Ops = window.LS78Operations || window.LS77Operations || window.LS76Operations || {unlocked:()=>true,portrait:()=>'',background:()=>'',freshTutorial:()=>({completed:true,step:0,seen:[]}),freshLoadouts:()=>[],economyCap:()=>24,fatigueRecover:()=>0};
  const Stability79 = window.LS79Stability || null;
  const Chain79 = window.LS79Chain || null;
  const Season79 = window.LS79Season || null;
  const Validation792 = window.LS792Validation || null;
  const Audio76 = window.LS76Audio || {toggle:()=>false,setTheme:()=>{},sfx:()=>{},status:()=>({playing:false})};
  const app = document.querySelector('#app');
  const modalRoot = document.querySelector('#modalRoot');
  const toastRoot = document.querySelector('#toastRoot');
  const updateRoot = document.querySelector('#updateRoot');
  const memoryStorage = new Map();
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = value => JSON.parse(JSON.stringify(value));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const now = () => new Date().toISOString();

  if (chapters.length !== 108) {
    app.innerHTML = '<div class="empty"><h1>章回資料載入失敗</h1><p>請確認 chapters.js 與 game.js 位於同一資料夾。</p></div>';
    return;
  }

  const storage = (() => {
    try {
      const probe = '__liangshan_v76_probe__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      return localStorage;
    } catch {
      return {
        getItem: key => memoryStorage.has(key) ? memoryStorage.get(key) : null,
        setItem: (key, value) => memoryStorage.set(key, String(value)),
        removeItem: key => memoryStorage.delete(key)
      };
    }
  })();

  const DIFFICULTIES = {
    story: {name:'故事', hp:.78, atk:.80, reward:.88, xp:.9, speed:.94, text:'敵方較弱，適合閱讀劇情與培養新英雄。'},
    standard: {name:'標準', hp:1, atk:1, reward:1, xp:1, speed:1, text:'完整體驗速度回合、角色覺醒與首領換階。'},
    heroic: {name:'豪傑', hp:1.30, atk:1.20, reward:1.52, xp:1.38, speed:1.08, text:'敵方招式更強、速度更快，素材與經驗較多。'}
  };

  const KIND = {
    story:{label:'猛將',action:'破陣',clue:['追蹤異常足跡','辨明敵我動機','守住百姓退路','確認決戰時機'],strategy:['探明地勢','誘敵離民','整備前鋒','封住退路','決戰收束']},
    justice:{label:'斷案',action:'公斷',clue:['比對證詞','封存證物','核對程序','找出幕後主使'],strategy:['建立案冊','隔離證人','公開規則','設置覆核','依法收網']},
    military:{label:'守將',action:'定陣',clue:['查明兵力','丈量地勢','校驗軍令','找出陣眼'],strategy:['布置前軍','穩住中軍','保護後軍','預留撤線','合圍破陣']},
    transport:{label:'疾行',action:'護行',clue:['檢查路線','確認載具','核對時刻','找出伏擊點'],strategy:['規劃主路','安排備援','分配護衛','設置驛站','安全抵達']},
    water:{label:'水軍',action:'分浪',clue:['觀測潮勢','檢查船具','確認旗號','找出暗流'],strategy:['分配舟隊','順風列陣','架設救生纜','封鎖危航線','乘潮反攻']},
    health:{label:'醫護',action:'濟傷',clue:['辨別症狀','追查來源','分級傷患','確認轉送'],strategy:['建立分診','隔離危害','配置藥材','安排救護','追蹤復原']},
    civic:{label:'軍師',action:'安民',clue:['建立名冊','辨明責任','公開規則','蒐集民意'],strategy:['分區定責','設置窗口','調度資源','停止危害','長期改善']},
    trade:{label:'巧匠',action:'驗真',clue:['查驗來源','核對規格','比對價格','確認退換'],strategy:['清點物資','制定標準','公開交易','封存危品','補償善後']},
    wild:{label:'獵蹤',action:'巡界',clue:['辨認足跡','判斷風向','確認獸徑','找出安全區'],strategy:['畫定邊界','設置警示','引導避讓','封閉險區','復育山林']},
    stealth:{label:'奇襲',action:'探險',clue:['核對暗號','觀察守備','找出密道','確認撤離'],strategy:['換裝潛入','切斷警報','取得證據','安排接應','無聲撤退']}
  };

  const STORY_MODES = {
    story:{name:'英雄決斷',icon:'⚔️',choices:[
      {key:'bold',title:'正面破陣',text:'敵方攻擊提高 8%，戰鬥獎勵提高 18%，主角客將獲得先制。',enemyAtk:1.08,reward:1.18,guestSpeed:18},
      {key:'protect',title:'先護百姓',text:'全隊開戰獲得護盾，獎勵略降，但更容易取得無傷成就。',reward:.94,shield:120}
    ]},
    justice:{name:'公斷抉擇',icon:'⚖️',choices:[
      {key:'evidence',title:'證據優先',text:'敵方防禦降低，狀態命中提高。',enemyDef:.90,status:0.08},
      {key:'rescue',title:'先救受害者',text:'全隊開戰回復豪氣，章回藥品額外增加一份。',sp:45,medicine:1}
    ]},
    military:{name:'軍陣抉擇',icon:'🛡️',choices:[
      {key:'front',title:'前軍強攻',text:'前排攻擊提高、承傷也提高。',frontAtk:1.15,frontTaken:1.08},
      {key:'fortify',title:'穩守待機',text:'前排防禦與護盾提高，敵方速度略降。',frontDef:1.15,enemySpeed:.94,shield:70}
    ]},
    transport:{name:'護送路線',icon:'🐎',choices:[
      {key:'fast',title:'走近路疾行',text:'全隊速度提高，伏兵數量可能增加。',speed:1.10,extraEnemy:1,reward:1.12},
      {key:'safe',title:'繞道護送',text:'敵方數量減少一名，獎勵略降。',extraEnemy:-1,reward:.92}
    ]},
    water:{name:'潮勢抉擇',icon:'🌊',choices:[
      {key:'tide',title:'乘潮突擊',text:'水軍與後排傷害提高，敵方也會更快。',backAtk:1.14,enemySpeed:1.07},
      {key:'anchor',title:'下錨穩舟',text:'全隊受到的持續傷害降低，開戰獲得護盾。',dotTaken:.65,shield:95}
    ]},
    health:{name:'救護優先',icon:'🩺',choices:[
      {key:'triage',title:'先做分診',text:'治療量提高，藥品可解除全部負面狀態。',heal:1.22,cleanse:true},
      {key:'source',title:'追查源頭',text:'對有負面狀態的敵人傷害提高。',debuffDamage:1.20,status:0.05}
    ]},
    civic:{name:'安民方案',icon:'📜',choices:[
      {key:'open',title:'公開議決',text:'合擊累積提高，銀兩獎勵提高。',combo:1.22,reward:1.10},
      {key:'relief',title:'先行救濟',text:'全隊最大生命提高，章回藥品增加一份。',hp:1.10,medicine:1}
    ]},
    trade:{name:'交易處置',icon:'🔨',choices:[
      {key:'seal',title:'封存查驗',text:'敵方首領開戰失去護盾，素材獎勵提高。',removeBossShield:true,material:1.35},
      {key:'compensate',title:'先行賠付',text:'銀兩獎勵提高，隊伍攻擊略降。',reward:1.22,allyAtk:.95}
    ]},
    wild:{name:'山野路線',icon:'🏹',choices:[
      {key:'track',title:'循跡追蹤',text:'首輪暴擊與速度提高。',crit:0.10,speed:1.08},
      {key:'contain',title:'封界圍護',text:'敵人開戰受到流血，前排防禦提高。',enemyBleed:22,frontDef:1.12}
    ]},
    stealth:{name:'潛行方案',icon:'🌙',choices:[
      {key:'silent',title:'無聲潛入',text:'首輪技能有高機率暈眩，敵人速度降低。',firstStun:0.55,enemySpeed:.90},
      {key:'decoy',title:'聲東擊西',text:'追加一名敵兵，但獎勵與合擊值提高。',extraEnemy:1,reward:1.18,combo:1.25}
    ]}
  };

  const ROLE_PASSIVES = {
    story:{icon:'⚔️',base:'烈膽',text:'氣血越低，造成的傷害越高。'},
    justice:{icon:'⚖️',base:'公斷',text:'技能穿透防禦並延長破甲。'},
    military:{icon:'🛡️',base:'鐵壁',text:'前排減傷，守勢可保護隊友。'},
    transport:{icon:'🐎',base:'疾行',text:'速度與豪氣循環較高。'},
    water:{icon:'🌊',base:'乘浪',text:'後排與連續攻擊能力較強。'},
    health:{icon:'🩺',base:'回春',text:'技能可治療與解除持續傷害。'},
    civic:{icon:'📜',base:'定策',text:'絕技消耗較低並強化合擊。'},
    trade:{icon:'🔨',base:'精算',text:'暴擊與戰利品收益較高。'},
    wild:{icon:'🏹',base:'獵蹤',text:'對有負面狀態的敵人增傷。'},
    stealth:{icon:'🌙',base:'奇襲',text:'首輪傷害與控制能力較高。'}
  };

  const HERO_EFFECTS = [
    {key:'execute',label:'斬將',text:'目標氣血低於 35% 時，專屬技傷害提高。'},
    {key:'chain',label:'連環',text:'專屬技會追加一次較弱攻擊。'},
    {key:'sunder',label:'破甲',text:'專屬技造成長效破甲。'},
    {key:'heal',label:'濟護',text:'專屬技同時治療氣血最低的隊友。'},
    {key:'sweep',label:'橫掃',text:'專屬技對所有敵人造成傷害。'},
    {key:'stun',label:'震懾',text:'專屬技有機率暈眩目標。'},
    {key:'bleed',label:'追創',text:'專屬技附加流血。'},
    {key:'focus',label:'聚氣',text:'專屬技回復豪氣與合擊值。'},
    {key:'shield',label:'護陣',text:'專屬技給全隊護盾。'},
    {key:'counter',label:'反制',text:'專屬技使自身進入反擊姿態。'},
    {key:'haste',label:'神行',text:'專屬技提高全隊速度。'},
    {key:'cleanse',label:'清障',text:'專屬技解除全隊負面狀態。'}
  ];

  const SIGNATURE_MODIFIERS = [
    {key:'ember',label:'焚勢',text:'命中後附加燃燒。'},
    {key:'venom',label:'蝕毒',text:'命中後附加中毒。'},
    {key:'bulwark',label:'護身',text:'施展後為自己建立護盾。'},
    {key:'rally',label:'振軍',text:'施展後為全隊回復豪氣。'},
    {key:'swift',label:'迅影',text:'施展後提高自身速度。'},
    {key:'weaken',label:'挫銳',text:'降低目標攻擊。'},
    {key:'drain',label:'回元',text:'依造成傷害回復自身氣血。'},
    {key:'unity',label:'聚義',text:'額外累積合擊值。'},
    {key:'precision',label:'透陣',text:'降低目標防禦並強化下一次攻擊。'}
  ];

  const TREE_OPTIONS = {
    power:{name:'武勇',options:[
      {key:'fury',name:'怒勢',text:'暴擊與低血量增傷。'},
      {key:'combo',name:'連戰',text:'普通攻擊與合擊累積。'}
    ]},
    guard:{name:'守備',options:[
      {key:'fortress',name:'鐵壘',text:'生命、護盾與減傷。'},
      {key:'riposte',name:'反守',text:'格擋後反擊與嘲諷。'}
    ]},
    tactics:{name:'謀略',options:[
      {key:'control',name:'控局',text:'狀態命中與持續時間。'},
      {key:'flow',name:'行氣',text:'降低豪氣消耗並加速回復。'}
    ]}
  };

  const BONDS = [
    {name:'步戰雙雄', members:['武松','魯達'], text:'全體重擊並附加燃燒。', status:'burn'},
    {name:'梁山軍略', members:['宋江','朱武'], text:'全隊回復豪氣並獲得護盾。', status:'shield'},
    {name:'揭陽水師', members:['李俊','童威','童猛'], text:'浪擊全部敵人並降低攻擊。', status:'slow'},
    {name:'阮氏三雄', members:['阮小二','阮小五','阮小七'], text:'三連水攻並附加破甲。', status:'armorBreak'},
    {name:'登州獵戶', members:['解珍','解寶'], text:'獵弓齊射並附加流血。', status:'bleed'},
    {name:'揭陽兄弟', members:['穆弘','穆春'], text:'兄弟合擊並提高全隊攻擊。', status:'power'},
    {name:'青州雙傑', members:['呂方','郭盛'], text:'雙戟交擊，對首領傷害提高。', status:'boss'},
    {name:'飛天雙煞', members:['項充','李袞'], text:'盾牌飛刀齊出，暈眩小兵。', status:'stun'},
    {name:'神箭雙星', members:['張清','瓊英'], text:'飛石連射，必定暴擊。', status:'crit'},
    {name:'病關索拚命', members:['楊雄','石秀'], text:'低血量時合擊威力大幅提高。', status:'desperate'},
    {name:'登州夫妻', members:['顧大嫂','孫新'], text:'全隊治療並補充一份藥品。', status:'heal'},
    {name:'孔氏兄弟', members:['孔明','孔亮'], text:'雙拳連擊並降低敵方防禦。', status:'armorBreak'},
    {name:'兩院節級', members:['蔡福','蔡慶'], text:'封鎖敵人行動並提高防禦。', status:'stun'},
    {name:'水火雙將', members:['單廷珪','魏定國'], text:'水火交攻，附加燃燒與弱化。', status:'burn'},
    {name:'青州虎將', members:['秦明','黃信'], text:'前排攻擊提高並震懾敵軍。', status:'power'},
    {name:'朱氏兄弟', members:['朱貴','朱富'], text:'情報共享，提高暴擊與閃避。', status:'crit'},
    {name:'蔡氏兄弟', members:['蔡福','蔡慶'], text:'刑獄封鎖，使首領行動延後。', status:'stun'},
    {name:'二童翻江', members:['童威','童猛'], text:'雙舟夾擊並回復全隊豪氣。', status:'shield'}
  ];

  const BUILDINGS = {
    hall:{name:'聚義廳',icon:'🏯',text:'提高章回經驗與全隊生命。',material:'wood'},
    smithy:{name:'軍械庫',icon:'⚒️',text:'提高鍛造稀有度與裝備能力。',material:'iron'},
    infirmary:{name:'醫館',icon:'🏥',text:'提高藥品治療量與戰後恢復。',material:'cloth'},
    stable:{name:'馬廄',icon:'🐎',text:'提高速度、初始豪氣與自動戰鬥效率。',material:'wood'},
    waterCamp:{name:'水寨',icon:'⛵',text:'提高水軍與後排英雄傷害。',material:'wood'},
    intelligence:{name:'情報所',icon:'🕵️',text:'提高暴擊率並揭示敵情與首領招式。',material:'cloth'}
  };

  const SETS = {
    tiger:{name:'伏虎套裝',two:'暴擊＋8%，專屬技傷害＋10%',four:'擊倒敵人後回復 30 豪氣',bonus:{crit:.08,skill:1.10},fourBonus:{killSp:30}},
    cloud:{name:'雲龍套裝',two:'速度＋14，豪氣上限＋45',four:'每回合首次行動提前',bonus:{speed:14,sp:45},fourBonus:{initiative:20}},
    river:{name:'混江套裝',two:'後排傷害＋12%，持續傷害減免 25%',four:'水軍技能附加遲緩',bonus:{back:1.12,dot:.75},fourBonus:{waterSlow:18}},
    healer:{name:'回春套裝',two:'治療量＋22%，每回合回復 12 豪氣',four:'治療同時清除一項負面狀態',bonus:{heal:1.22,spRegen:12},fourBonus:{cleanseHeal:true}},
    iron:{name:'鐵壁套裝',two:'生命＋12%，防禦＋10%',four:'受到致命傷時每戰保留 1 點氣血一次',bonus:{hp:1.12,def:1.10},fourBonus:{surviveOnce:true}}
  };

  const ITEM_TEMPLATES = {
    weapon:[
      {name:'伏虎朴刀',icon:'🗡️',setKey:'tiger',atk:20,crit:.02},
      {name:'雲龍點鋼槍',icon:'🔱',setKey:'cloud',atk:24,speed:5},
      {name:'混江水火棍',icon:'🥢',setKey:'river',atk:21,status:6},
      {name:'回春藥杖',icon:'🪄',setKey:'healer',atk:17,heal:12},
      {name:'鐵壁雁翎刀',icon:'⚔️',setKey:'iron',atk:27,def:4}
    ],
    armor:[
      {name:'伏虎戰衣',icon:'🥋',setKey:'tiger',hp:95,def:10,crit:.02},
      {name:'雲龍輕甲',icon:'🦺',setKey:'cloud',hp:105,def:13,speed:7},
      {name:'混江水軍甲',icon:'🌊',setKey:'river',hp:120,def:14,sp:35},
      {name:'回春法袍',icon:'👘',setKey:'healer',hp:110,def:11,heal:14},
      {name:'鐵壁山紋甲',icon:'🛡️',setKey:'iron',hp:175,def:23}
    ],
    helmet:[
      {name:'伏虎額甲',icon:'⛑️',setKey:'tiger',hp:70,crit:.015},
      {name:'雲龍羽冠',icon:'🎩',setKey:'cloud',sp:28,speed:5},
      {name:'混江水盔',icon:'🪖',setKey:'river',hp:82,def:8},
      {name:'回春巾',icon:'🧢',setKey:'healer',heal:10,status:5},
      {name:'鐵壁兜鍪',icon:'🪖',setKey:'iron',hp:115,def:13}
    ],
    boots:[
      {name:'伏虎戰靴',icon:'🥾',setKey:'tiger',speed:4,crit:.015},
      {name:'雲龍疾履',icon:'👢',setKey:'cloud',speed:10},
      {name:'混江踏浪靴',icon:'🥾',setKey:'river',speed:6,sp:18},
      {name:'回春布履',icon:'👞',setKey:'healer',heal:8,hp:48},
      {name:'鐵壁重靴',icon:'🥾',setKey:'iron',def:11,hp:72}
    ],
    talisman:[
      {name:'伏虎牙符',icon:'📿',setKey:'tiger',crit:.025,atk:8},
      {name:'雲龍風符',icon:'🧿',setKey:'cloud',speed:7,sp:22},
      {name:'混江潮符',icon:'🔹',setKey:'river',status:8,sp:20},
      {name:'回春玉符',icon:'💠',setKey:'healer',heal:15,hp:55},
      {name:'鐵壁玄符',icon:'🔰',setKey:'iron',def:12,hp:80}
    ],
    mount:[
      {name:'伏虎赤驥',icon:'🐎',setKey:'tiger',atk:10,speed:5},
      {name:'雲龍青驄',icon:'🐴',setKey:'cloud',speed:13},
      {name:'混江烏騅',icon:'🐎',setKey:'river',speed:8,hp:65},
      {name:'回春白鹿',icon:'🦌',setKey:'healer',heal:10,sp:28},
      {name:'鐵壁駝龍',icon:'🐫',setKey:'iron',def:10,hp:105}
    ]
  };

  const EQUIPMENT_TYPES = ['weapon','armor','helmet','boots','talisman','mount'];
  const EQUIPMENT_LABELS = {weapon:'武器',armor:'防具',helmet:'頭盔',boots:'鞋履',talisman:'護符',mount:'坐騎'};
  const AFFIX_POOL = [
    {key:'atk',name:'猛攻',min:4,max:12},{key:'def',name:'堅守',min:3,max:10},{key:'hp',name:'強身',min:35,max:95},
    {key:'speed',name:'迅捷',min:2,max:8},{key:'sp',name:'聚氣',min:12,max:35},{key:'crit',name:'會心',min:.01,max:.035},
    {key:'status',name:'精準',min:2,max:8},{key:'heal',name:'回春',min:3,max:11}
  ];

  const RARITIES = {
    common:{name:'凡品',mult:1,color:'',weight:62},
    rare:{name:'精良',mult:1.35,color:'good',weight:28},
    epic:{name:'傳說',mult:1.75,color:'accent',weight:10}
  };

  const BOSS_MECHANICS = [
    {key:'armor',name:'鐵甲護身',text:'第一階段護甲；第二階段反擊；第三階段盾擊全隊。'},
    {key:'enrage',name:'困獸暴怒',text:'第二階段攻擊提高；第三階段每次可連續攻擊。'},
    {key:'regen',name:'邪陣回生',text:'第二階段回復氣血；第三階段驅散負面並持續回生。'},
    {key:'reinforce',name:'召集援兵',text:'每次換階都召來不同援兵。'},
    {key:'poison',name:'毒霧侵體',text:'第二階段施放毒霧；第三階段毒傷與範圍擴大。'},
    {key:'counter',name:'借力反震',text:'第二階段反震技能；第三階段反震比例提高。'}
  ];

  const FLOW_PATTERNS = [
    [ ['clue',0],['choiceEvent',0],['strategy',0],['battle',0],['clue',1],['strategy',1],['clue',2],['battle',1],['strategy',2],['clue',3],['strategy',3],['strategy',4],['battle',2],['finish',0] ],
    [ ['clue',0],['strategy',0],['battle',0],['choiceEvent',0],['clue',1],['clue',2],['strategy',1],['battle',1],['strategy',2],['strategy',3],['clue',3],['strategy',4],['battle',2],['finish',0] ],
    [ ['strategy',0],['clue',0],['choiceEvent',0],['clue',1],['battle',0],['strategy',1],['strategy',2],['battle',1],['clue',2],['strategy',3],['clue',3],['strategy',4],['battle',2],['finish',0] ],
    [ ['clue',0],['clue',1],['strategy',0],['choiceEvent',0],['battle',0],['strategy',1],['clue',2],['strategy',2],['battle',1],['clue',3],['strategy',3],['strategy',4],['battle',2],['finish',0] ]
  ];

  const freshPrefs = () => ({theme:'ink',difficulty:'standard',sound:true,speech:false,battleSpeed:1,autoBattle:false,autoStrategy:'balanced',targetPriority:'dangerous',medicineThreshold:.32,reserveUltimate:false,useMedicine:true,highContrast:false,fontScale:1,reducedMotion:false,keyboardHints:true,lowPower:false,screenReaderMode:false,music:false});
  const starterItems = () => ([
    makeFixedItem('starter-w1','weapon','伏虎朴刀','common',{atk:18,crit:.02},'tiger'),
    makeFixedItem('starter-w2','weapon','雲龍點鋼槍','common',{atk:22,speed:5},'cloud'),
    makeFixedItem('starter-a1','armor','伏虎戰衣','common',{hp:90,def:10,crit:.02},'tiger'),
    makeFixedItem('starter-a2','armor','雲龍輕甲','common',{hp:110,def:14,speed:6},'cloud')
  ]);
  function makeFixedItem(id,type,name,rarity,stats,setKey='',affixes=[]){return{id,type,name,rarity,level:1,stats,setKey,affixes,locked:false,reforges:0,createdAt:now(),equippedBy:null};}
  const defaultPlans = () => ([
    {name:'第一隊',front:[1,2],back:[3,4]},
    {name:'水陸隊',front:[1,3],back:[4,2]},
    {name:'奇襲隊',front:[2,1],back:[4,3]}
  ]);
  const freshState = () => ({
    version:VERSION,schemaVersion:SaveSchema?.SCHEMA_VERSION||6,updatedAt:now(),silver:2200,selected:1,unlocked:4,
    completed:{},runs:{},current:null,recent:[],
    inventory:{medicines:3,materials:{iron:30,wood:30,cloth:24,essence:8},items:starterItems(),nextItemId:1,pity:{weapon:0,armor:0,helmet:0,boots:0,talisman:0,mount:0}},
    heroes:{},formations:defaultPlans(),activeFormation:0,
    aiPolicy:{mode:'balanced',targetPriority:'dangerous',medicineThreshold:.32,reserveUltimate:false,useMedicine:true},
    base:{hall:1,smithy:1,infirmary:1,stable:1,waterCamp:1,intelligence:1,lastProductionAt:now(),unclaimed:{silver:0,iron:0,wood:0,cloth:0},fatigue:{},dispatchLog:[]},
    dispatches:[],
    tutorial:Ops.freshTutorial?.()||{completed:false,step:0,seen:[]},equipmentPlans:Ops.freshLoadouts?.()||[],operations:{deployment:null,lastBalanceAt:'',v79Reports:{},issueReports:[],economy:{lastFatigueAt:now()}},
    chain:{version:'7.9.2',flags:{},log:[],perfect:0,renown:0,lastApplied:{}},
    endgame:{towerFloor:1,towerBest:0,expedition:null,rogue:null,weekly:{},bossRecords:{},suspendedRun:null,seasons:{records:{},personalBest:[],lastReport:null}},
    telemetry:Telemetry.fresh?.()||{},
    cloud:{lastSyncAt:'',lastDirection:'',lastChecksum:'',conflict:null,history:[],lastDiagnostics:null},
    saveMeta:{backend:'localStorage',backupCount:0,lastBackupAt:'',warning:'',checksum:''},
    migration:{done:false,from:'',note:'新存檔'}
  });

  let prefs = loadPrefs();
  let state = loadStateSync();
  let screen = 'home';
  let chapterSearch = '';
  let chapterEra = 'all';
  let chapterStatus = 'all';
  let heroSearch = '';
  let selectedHero = 1;
  let forgeFilter = 'all';
  let forgeRarity = 'all';
  let forgePage = 1;
  let heroPage = 1;
  const selectedForgeItems = new Set();
  let deferredPrompt = null;
  let swRegistration = null;
  let refreshing = false;
  let audioContext = null;
  let battleBusy = false;
  let autoTimer = null;
  let dbPromise = null;
  let saveSerial = 0;
  let idbHydrated = false;

  function chapter(number){return chapters[clamp(Number(number)||1,1,108)-1];}
  function currentChapter(){return chapter(state.current?.chapter||state.selected||1);}
  function kindData(ch){return KIND[ch.kind]||KIND.civic;}
  function completionCount(){return Object.keys(state.completed).filter(k=>state.completed[k]).length;}
  function sCount(){return Object.values(state.completed).filter(v=>v?.grade==='S').length;}
  function pct(value,max){return clamp(Math.round((Number(value)||0)/Math.max(1,Number(max)||1)*100),0,100);}
  function firstIncomplete(){for(let n=1;n<=108;n++)if(!state.completed[String(n)])return n;return 108;}
  function buildingLevel(key){return clamp(Number(state.base?.[key])||1,1,5);}
  function heroUnlocked(number){return Number(number)<=Math.max(4,state.unlocked||1)||Boolean(state.completed[String(number)]);}
  function featureUnlocked(name){return Ops.unlocked?.(name,completionCount())!==false;}
  function requireFeature(name){if(featureUnlocked(name))return true;const need=Ops.featureRules?.[name]||1;toast(`此功能將在完成 ${need} 回後開放。`,'warn');return false;}
  function currentTutorial(){state.tutorial=state.tutorial||Ops.freshTutorial?.()||{completed:true,step:0,seen:[]};return state.tutorial;}
  function heroUnlockedForState(target,number){return Number(number)<=Math.max(4,target.unlocked||1)||Boolean(target.completed?.[String(number)]);}
  function xpNeeded(level){return 100+Number(level)*48;}
  function storyMode(ch){return Epic.storyForChapter?.(ch)||STORY_MODES[ch.kind]||STORY_MODES.civic;}
  function chosenStory(run=state.current){return storyMode(chapter(run?.chapter||1)).choices.find(x=>x.key===run?.choice)||null;}
  function flowForChapter(ch=currentChapter()){const pattern=FLOW_PATTERNS[(ch.number+Object.keys(KIND).indexOf(ch.kind))%FLOW_PATTERNS.length];return pattern.map(([type,index])=>({type,index,phase:type==='battle'?['前哨戰','轉折戰','首領戰'][index]:type==='clue'?'查驗':type==='strategy'?'軍略':type==='choiceEvent'?'故事抉擇':'結算'}));}

  function loadPrefs(){
    try{
      const raw=JSON.parse(storage.getItem(PREF_KEY)||'null')||{};const merged={...freshPrefs(),...raw};
      if(!DIFFICULTIES[merged.difficulty])merged.difficulty='standard';if(!['ink','dark','paper'].includes(merged.theme))merged.theme='ink';if(![1,2,3].includes(Number(merged.battleSpeed)))merged.battleSpeed=1;if(!['balanced','aggressive','safe','control','boss','economy'].includes(merged.autoStrategy))merged.autoStrategy='balanced';if(!['dangerous','lowest','boss','caster'].includes(merged.targetPriority))merged.targetPriority='dangerous';merged.medicineThreshold=clamp(Number(merged.medicineThreshold)||.32,.1,.8);merged.fontScale=clamp(Number(merged.fontScale)||1,.85,1.35);merged.autoBattle=Boolean(merged.autoBattle);merged.reserveUltimate=Boolean(merged.reserveUltimate);merged.useMedicine=merged.useMedicine!==false;merged.highContrast=Boolean(merged.highContrast);merged.reducedMotion=Boolean(merged.reducedMotion);merged.keyboardHints=merged.keyboardHints!==false;merged.lowPower=Boolean(merged.lowPower);merged.screenReaderMode=Boolean(merged.screenReaderMode);return merged;
    }catch{return freshPrefs();}
  }

  function defaultHeroRecord(number){return{number,level:1,xp:0,skillPoints:0,tree:{power:{branch:null,rank:0},guard:{branch:null,rank:0},tactics:{branch:null,rank:0}},awakened:false,equipment:{weapon:null,armor:null,helmet:null,boots:null,talisman:null,mount:null},battles:0,wins:0};}
  function normalizeTree(raw){
    const out={power:{branch:null,rank:0},guard:{branch:null,rank:0},tactics:{branch:null,rank:0}};
    for(const key of Object.keys(out)){
      if(typeof raw?.[key]==='number'){out[key]={branch:TREE_OPTIONS[key].options[0].key,rank:clamp(Number(raw[key])||0,0,3)};continue;}
      const branch=raw?.[key]?.branch;out[key]={branch:TREE_OPTIONS[key].options.some(x=>x.key===branch)?branch:null,rank:clamp(Number(raw?.[key]?.rank)||0,0,3)};
    }
    return out;
  }
  function normalizeHero(number,raw){const h={...defaultHeroRecord(number),...(raw||{})};h.number=number;h.level=clamp(Number(h.level)||1,1,60);h.xp=Math.max(0,Number(h.xp)||0);h.skillPoints=Math.max(0,Number(h.skillPoints)||0);h.tree=normalizeTree(raw?.tree);h.awakened=Boolean(raw?.awakened);h.equipment={weapon:h.equipment?.weapon||null,armor:h.equipment?.armor||null,helmet:h.equipment?.helmet||null,boots:h.equipment?.boots||null,talisman:h.equipment?.talisman||null,mount:h.equipment?.mount||null};h.battles=Math.max(0,Number(h.battles)||0);h.wins=Math.max(0,Number(h.wins)||0);return h;}
  function normalizeItem(raw,index){if(!raw||!EQUIPMENT_TYPES.includes(raw.type))return null;return{id:String(raw.id||`migrated-${index}`),type:raw.type,name:String(raw.name||'無名裝備'),icon:raw.icon||'',rarity:RARITIES[raw.rarity]?raw.rarity:'common',level:clamp(Number(raw.level)||1,1,5),stats:{...(raw.stats||{})},affixes:Array.isArray(raw.affixes)?raw.affixes.slice(0,3):[],locked:Boolean(raw.locked),reforges:Math.max(0,Number(raw.reforges)||0),setKey:SETS[raw.setKey]?raw.setKey:'',exclusiveHero:raw.exclusiveHero?Number(raw.exclusiveHero):null,createdAt:raw.createdAt||now(),equippedBy:raw.equippedBy?Number(raw.equippedBy):null};}
  function makeRun(number){return{chapter:number,startedAt:now(),lastPlayedAt:now(),choice:null,choiceEventDone:false,trialChoice:null,trialSuccess:false,trialResult:'',branchEnding:null,clues:[],strategies:[],battles:{0:false,1:false,2:false},medicines:2,difficulty:prefs.difficulty,battle:null,special:null,stats:{actions:0,rounds:0,defeats:0,medicinesUsed:0,combos:0,guestSurvived:false},complete:false,grade:'',score:0,achievements:[],silverEarned:0,log:[`第 ${number} 回開始。`]};}
  function normalizeRun(raw){const n=clamp(Number(raw?.chapter)||1,1,108);const base=makeRun(n);const r={...base,...(raw||{})};r.choice=storyMode(chapter(n)).choices.some(x=>x.key===raw?.choice)?raw.choice:null;r.choiceEventDone=Boolean(raw?.choiceEventDone);r.trialChoice=raw?.trialChoice??null;r.trialSuccess=Boolean(raw?.trialSuccess);r.trialResult=String(raw?.trialResult||'');r.branchEnding=raw?.branchEnding||null;r.special=raw?.special||null;r.clues=Array.isArray(raw?.clues)?[...new Set(raw.clues.map(Number).filter(x=>x>=0&&x<4))]:[];r.strategies=Array.isArray(raw?.strategies)?[...new Set(raw.strategies.map(Number).filter(x=>x>=0&&x<5))]:[];r.battles={0:Boolean(raw?.battles?.[0]||raw?.battles?.['0']),1:Boolean(raw?.battles?.[1]||raw?.battles?.['1']),2:Boolean(raw?.battles?.[2]||raw?.battles?.['2'])};r.medicines=clamp(Number(raw?.medicines)||2,0,9);r.difficulty=DIFFICULTIES[raw?.difficulty]?raw.difficulty:prefs.difficulty;r.stats={...base.stats,...(raw?.stats||{})};if(raw?.battle&&Array.isArray(raw.battle.allies)&&Array.isArray(raw.battle.enemies))r.battle=raw.battle;else r.battle=null;if(r.complete)r.battle=null;return r;}
  function normalizePlan(raw,index){const base=defaultPlans()[index]||{name:`第 ${index+1} 隊`,front:[1,2],back:[3,4]};return{name:String(raw?.name||base.name).slice(0,12),front:Array.isArray(raw?.front)?raw.front.map(Number).filter(n=>n>=1&&n<=108).slice(0,2):base.front,back:Array.isArray(raw?.back)?raw.back.map(Number).filter(n=>n>=1&&n<=108).slice(0,2):base.back};}
  function repairPlan(plan,target=state){const seen=new Set();const pool=[];[...(plan.front||[]),...(plan.back||[])].forEach(n=>{if(heroUnlockedForState(target,n)&&!seen.has(n)){seen.add(n);pool.push(n);}});for(let n=1;n<=108&&pool.length<4;n++)if(heroUnlockedForState(target,n)&&!seen.has(n)){seen.add(n);pool.push(n);}while(pool.length<4)pool.push(pool.length+1);plan.front=pool.slice(0,2);plan.back=pool.slice(2,4);return plan;}
  function mergeState(raw){
    const base=freshState();const s={...base,...(raw||{})};s.version=VERSION;s.silver=Math.max(0,Math.round(raw?.silver==null?base.silver:Number(raw.silver)));s.completed=raw?.completed&&typeof raw.completed==='object'?raw.completed:{};s.runs=raw?.runs&&typeof raw.runs==='object'?raw.runs:{};Object.keys(s.runs).forEach(k=>s.runs[k]=normalizeRun(s.runs[k]));s.current=raw?.current?.chapter?normalizeRun(raw.current):null;
    if(s.current){s.runs[String(s.current.chapter)]=s.current;if(raw?.version!==VERSION&&raw.current?.battle){s.current.battle=null;s.migration={done:true,from:raw.version||'舊版',note:'舊版戰鬥格式已安全退回戰前。'};}}
    s.recent=Array.isArray(raw?.recent)?[...new Set(raw.recent.map(Number).filter(n=>n>=1&&n<=108))].slice(0,16):[];s.unlocked=clamp(Math.max(4,Number(raw?.unlocked)||1),4,108);s.selected=clamp(Number(raw?.selected)||1,1,108);
    s.inventory={medicines:clamp(raw?.inventory?.medicines==null?base.inventory.medicines:Number(raw.inventory.medicines),0,99),materials:{iron:Math.max(0,raw?.inventory?.materials?.iron==null?base.inventory.materials.iron:Number(raw.inventory.materials.iron)),wood:Math.max(0,raw?.inventory?.materials?.wood==null?base.inventory.materials.wood:Number(raw.inventory.materials.wood)),cloth:Math.max(0,raw?.inventory?.materials?.cloth==null?base.inventory.materials.cloth:Number(raw.inventory.materials.cloth)),essence:Math.max(0,raw?.inventory?.materials?.essence==null?base.inventory.materials.essence:Number(raw.inventory.materials.essence))},items:Array.isArray(raw?.inventory?.items)?raw.inventory.items.map(normalizeItem).filter(Boolean):base.inventory.items,nextItemId:Math.max(1,Number(raw?.inventory?.nextItemId)||1),pity:{...base.inventory.pity,...(raw?.inventory?.pity||{})}};EQUIPMENT_TYPES.forEach(k=>s.inventory.pity[k]=clamp(Number(s.inventory.pity[k])||0,0,10));
    s.heroes={};const oldHeroes=raw?.heroes&&typeof raw.heroes==='object'?raw.heroes:{};for(let n=1;n<=108;n++)s.heroes[String(n)]=normalizeHero(n,oldHeroes[String(n)]);
    s.base={...base.base,...(raw?.base||{})};Object.keys(BUILDINGS).forEach(k=>s.base[k]=clamp(Number(s.base[k])||1,1,5));s.base.lastProductionAt=s.base.lastProductionAt||now();s.base.unclaimed={...base.base.unclaimed,...(raw?.base?.unclaimed||{})};s.base.fatigue=raw?.base?.fatigue&&typeof raw.base.fatigue==='object'?raw.base.fatigue:{};s.base.dispatchLog=Array.isArray(raw?.base?.dispatchLog)?raw.base.dispatchLog.slice(0,30):[];
    const oldPlans=Array.isArray(raw?.formations)?raw.formations:(raw?.formation?[{name:'第一隊',...raw.formation}]:base.formations);s.formations=[0,1,2].map(i=>repairPlan(normalizePlan(oldPlans[i],i),s));s.activeFormation=clamp(Number(raw?.activeFormation)||0,0,2);s.aiPolicy={...base.aiPolicy,...(raw?.aiPolicy||{})};s.dispatches=Array.isArray(raw?.dispatches)?raw.dispatches.slice(0,4):[];s.tutorial={...(Ops.freshTutorial?.()||base.tutorial),...(raw?.tutorial||{})};s.tutorial.seen=Array.isArray(s.tutorial.seen)?s.tutorial.seen:[];s.equipmentPlans=Array.isArray(raw?.equipmentPlans)&&raw.equipmentPlans.length?raw.equipmentPlans.slice(0,3):(Ops.freshLoadouts?.()||[]);s.operations={...base.operations,...(raw?.operations||{}),v79Reports:{...(raw?.operations?.v79Reports||{})},issueReports:Array.isArray(raw?.operations?.issueReports)?raw.operations.issueReports.slice(0,20):[],economy:{...base.operations.economy,...(raw?.operations?.economy||{})}};s.chain={...base.chain,...(raw?.chain||{}),flags:{...(raw?.chain?.flags||{})},log:Array.isArray(raw?.chain?.log)?raw.chain.log.slice(0,80):[],lastApplied:{...(raw?.chain?.lastApplied||{})}};s.endgame={...base.endgame,...(raw?.endgame||{})};s.endgame.bossRecords=raw?.endgame?.bossRecords&&typeof raw.endgame.bossRecords==='object'?raw.endgame.bossRecords:{};s.endgame.rogue=raw?.endgame?.rogue||null;s.endgame.weekly=raw?.endgame?.weekly&&typeof raw.endgame.weekly==='object'?raw.endgame.weekly:{};s.endgame.seasons={...base.endgame.seasons,...(raw?.endgame?.seasons||{}),records:{...(raw?.endgame?.seasons?.records||{})},personalBest:Array.isArray(raw?.endgame?.seasons?.personalBest)?raw.endgame.seasons.personalBest.slice(0,30):[]};s.telemetry={...(Telemetry.fresh?.()||{}),...(raw?.telemetry||{})};s.cloud={...base.cloud,...(raw?.cloud||{})};s.cloud.history=Array.isArray(raw?.cloud?.history)?raw.cloud.history.slice(0,20):[];s.schemaVersion=SaveSchema?.SCHEMA_VERSION||6;s.saveMeta={...base.saveMeta,...(raw?.saveMeta||{})};s.migration={...base.migration,...(raw?.migration||{})};if(raw?.version&&raw.version!==VERSION)s.migration={done:true,from:raw.version,note:`已從 v${raw.version} 升級；章回、銀兩、英雄、裝備、建設與編隊均已保留。`};return s;
  }
  function loadStateSync(){try{const text=storage.getItem(SAVE_KEY);const raw=JSON.parse(text||'null');if(raw){if(raw.version&&raw.version!==VERSION&&!storage.getItem(`${BACKUP_PREFIX}v${raw.version}`))storage.setItem(`${BACKUP_PREFIX}v${raw.version}`,text);return mergeState(raw);}}catch{}return mergeState(freshState());}

  function openDb(){
    if(!('indexedDB'in window))return Promise.reject(new Error('IndexedDB unavailable'));
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('saves'))db.createObjectStore('saves',{keyPath:'id'});if(!db.objectStoreNames.contains('backups')){const store=db.createObjectStore('backups',{keyPath:'id'});store.createIndex('createdAt','createdAt');}};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});return dbPromise;
  }
  async function idbGet(storeName,key){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(storeName,'readonly');const req=tx.objectStore(storeName).get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
  async function idbPut(storeName,value){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(storeName,'readwrite');tx.objectStore(storeName).put(value);tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);});}
  async function idbAll(storeName){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(storeName,'readonly');const req=tx.objectStore(storeName).getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);});}
  async function idbDelete(storeName,key){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(storeName,'readwrite');tx.objectStore(storeName).delete(key);tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);});}
  async function hydrateFromIndexedDb(){
    try{const row=await idbGet('saves','main');if(row?.state&&new Date(row.state.updatedAt||0)>new Date(state.updatedAt||0)){state=mergeState(row.state);prefs={...freshPrefs(),...(row.prefs||prefs)};screen='home';render();}state.saveMeta.backend='IndexedDB＋localStorage';idbHydrated=true;await refreshBackupMeta();save(true,false);}catch{state.saveMeta.warning='此瀏覽器無法使用 IndexedDB，目前改用 localStorage；請定期匯出存檔。';state.saveMeta.backend='localStorage';idbHydrated=true;save(true,false);render();}
  }
  async function persistIndexedDb(){try{const checksum=SaveSchema?await SaveSchema.checksum(state):'';state.saveMeta.checksum=checksum;await idbPut('saves',{id:'main',state:clone(state),prefs:clone(prefs),checksum,updatedAt:state.updatedAt});state.saveMeta.backend='IndexedDB＋localStorage';}catch{state.saveMeta.warning='IndexedDB 寫入失敗，已保留 localStorage 鏡像。';}}
  async function createBackup(reason='自動備份'){
    try{const id=`${Date.now()}-${Math.random().toString(36).slice(2,7)}`;const checksum=SaveSchema?await SaveSchema.checksum(state):'';await idbPut('backups',{id,createdAt:now(),reason,state:clone(state),prefs:clone(prefs),checksum});let all=(await idbAll('backups')).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));for(const row of all.slice(MAX_BACKUPS))await idbDelete('backups',row.id);await refreshBackupMeta();}catch{}
  }
  async function refreshBackupMeta(){try{const all=(await idbAll('backups')).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));state.saveMeta.backupCount=all.length;state.saveMeta.lastBackupAt=all[0]?.createdAt||'';}catch{}}
  async function restoreBackup(id){try{const row=await idbGet('backups',id);if(!row?.state)return toast('找不到備份。','warn');await createBackup('還原前備份');state=mergeState(row.state);prefs={...freshPrefs(),...(row.prefs||{})};save(true,false);screen='home';closeModal();render();toast('備份已還原。','good');}catch{toast('備份還原失敗。','warn');}}
  function save(silent=true,allowBackup=true){if(state.current?.chapter&&!state.current.special)state.runs[String(state.current.chapter)]=state.current;state.version=VERSION;state.schemaVersion=SaveSchema?.SCHEMA_VERSION||6;state.updatedAt=now();A11y.apply(prefs);try{storage.setItem(SAVE_KEY,JSON.stringify(state));storage.setItem(PREF_KEY,JSON.stringify(prefs));}catch{state.saveMeta.warning='瀏覽器儲存空間不足，請立即匯出存檔。';}persistIndexedDb();saveSerial++;if(allowBackup&&saveSerial%20===0)createBackup('輪替自動備份');if(!silent)toast('進度已收入 IndexedDB、校驗鏡像與本機備份。','good');}

  function addRecent(number){state.recent=[Number(number),...state.recent.filter(n=>Number(n)!==Number(number))].slice(0,16);}
  function getHero(number){const key=String(number);if(!state.heroes[key])state.heroes[key]=defaultHeroRecord(number);return state.heroes[key];}
  function getItem(id){return state.inventory.items.find(item=>item.id===id)||null;}
  function currentPlan(){return state.formations[state.activeFormation]||state.formations[0];}
  function formationNumbers(plan=currentPlan()){return [...plan.front,...plan.back];}
  function formationRows(plan=currentPlan()){return plan.front.map(n=>({number:n,row:'front'})).concat(plan.back.map(n=>({number:n,row:'back'})));}
  function portraitMarkup(number,size='normal'){const ch=chapter(number),src=Ops.portrait?.(number)||'';return src?`<img class="hero-portrait ${size}" src="${src}" alt="${esc(ch.nickname)}・${esc(ch.name)}水墨立繪" loading="lazy">`:`<span class="avatar ${size==='small'?'small-avatar':''}">${esc(ch.name[0])}</span>`;}
  function chapterBackgroundStyle(ch){const src=Ops.background?.(ch.number,ch.kind);return src?` style="--chapter-bg:url('${src}')"`:'';}
  function activeBonds(numbers=formationNumbers()){const names=numbers.map(n=>chapter(n).name);return BONDS.filter(b=>b.members.every(name=>names.includes(name)));}
  function itemStats(item){
    if(!item)return{};const rarity=RARITIES[item.rarity]?.mult||1;const level=1+(Number(item.level||1)-1)*.16;const out={};
    Object.entries(item.stats||{}).forEach(([k,v])=>out[k]=typeof v==='number'?v*rarity*level:v);
    for(const affix of item.affixes||[])if(typeof affix?.value==='number')out[affix.key]=(out[affix.key]||0)+affix.value*rarity;
    return out;
  }
  function equippedItems(number){const h=getHero(number);return EQUIPMENT_TYPES.map(type=>getItem(h.equipment[type])).filter(Boolean);}
  function equipmentTotalStats(number){const out={};for(const item of equippedItems(number))for(const[k,v]of Object.entries(itemStats(item)))if(typeof v==='number')out[k]=(out[k]||0)+v;return out;}
  function equipmentSetBonuses(number){
    const counts={};equippedItems(number).forEach(i=>{if(i.setKey)counts[i.setKey]=(counts[i.setKey]||0)+1;});
    const total={};const active=[];
    for(const[key,count]of Object.entries(counts)){const set=SETS[key];if(!set||count<2)continue;active.push({key,count,name:set.name,two:set.two,four:set.four||''});for(const[k,v]of Object.entries(set.bonus||{}))total[k]=typeof v==='number'?(total[k]||0)+v:v;if(count>=4)for(const[k,v]of Object.entries(set.fourBonus||{}))total[k]=typeof v==='number'?(total[k]||0)+v:v;}
    return{active,total};
  }
  function equipmentSetBonus(number){const x=equipmentSetBonuses(number);return x.active.length?{key:x.active[0].key,name:x.active.map(a=>`${a.name}${a.count}件`).join('、'),bonus:x.total,active:x.active}:null;}
  function itemPower(item){const s=itemStats(item);return(s.atk||0)*2+(s.def||0)*2+(s.hp||0)/10+(s.sp||0)/5+(s.crit||0)*250+(s.status||0)*3+(s.speed||0)*4+(s.heal||0)*2;}

  function heroKit(number){
    const ch=chapter(number);const special=Tiangang.get?.(number)||Dizha.get?.(number);
    if(special){const isT=number<=36;const kit={icon:isT?'⭐':'✦',passiveName:special.passiveName,passiveText:special.passiveText,skillName:special.activeName,skillText:special.activeText,effect:isT?'tiangang':'dizha',modifier:special.mechanic,signatureCode:`${isT?'tiangang':'dizha'}:${number}:${special.mechanic}`,potency:20+number%7,cooldown:special.cooldown||3,awakeningName:special.awakeningName||`${ch.nickname}覺醒・${special.activeName}`,awakeningText:`覺醒後「${special.activeName}」威力與專屬機制全面強化。`,tiangang:isT,dizha:!isT,specialSource:isT?'tiangang':'dizha'};return Balance.applyKit?.(kit,number)||kit;}
    const role=ROLE_PASSIVES[ch.kind]||ROLE_PASSIVES.civic;const effect=HERO_EFFECTS[(number-1)%HERO_EFFECTS.length];const potency=8+(number%9);const titleRoot=(ch.title.split('・')[0]||ch.title).replace(ch.name,'').slice(0,8)||ch.nickname;const modifier=SIGNATURE_MODIFIERS[Math.floor((number-1)/HERO_EFFECTS.length)%SIGNATURE_MODIFIERS.length];const kit={icon:role.icon,passiveName:`${ch.nickname}・${role.base}真意`,passiveText:`${role.text} ${effect.text}`,skillName:`${titleRoot}・${effect.label}${modifier.label}`,skillText:`${effect.text} ${modifier.text}`,effect:effect.key,modifier:modifier.key,signatureCode:`fallback:${number}`,potency,cooldown:3,awakeningName:`${ch.nickname}覺醒`,awakeningText:'覺醒後技能威力提升。'};return Balance.applyKit?.(kit,number)||kit;
  }
  function treeRank(h,key){return h.tree?.[key]?.rank||0;}
  function treeBranch(h,key){return h.tree?.[key]?.branch||null;}
  function heroCombatStats(number,row='front',guest=false){
    const ch=chapter(number);const h=getHero(number);const gear=equipmentTotalStats(number);const set=equipmentSetBonus(number);const hall=buildingLevel('hall');const smithy=buildingLevel('smithy');const intel=buildingLevel('intelligence');const level=h.level;const power=treeRank(h,'power');const guard=treeRank(h,'guard');const tactics=treeRank(h,'tactics');const pBranch=treeBranch(h,'power');const gBranch=treeBranch(h,'guard');const tBranch=treeBranch(h,'tactics');const tg=Tiangang.get?.(number)||Dizha.get?.(number);const tgs=tg?.stats||{};
    let baseHp=620+level*70+number*2;let baseSp=270+level*18;let atk=72+level*11+number*.35+(gear.atk||0)+smithy*2;let def=35+level*5+number*.15+(gear.def||0)+guard*4;let hp=(baseHp+(gear.hp||0))*(1+guard*.045+hall*.025);let sp=baseSp+(gear.sp||0)+tactics*12+buildingLevel('stable')*4;let speed=78+level*1.7+(gear.speed||0)+buildingLevel('stable')*3+(ch.kind==='transport'?14:0)+(ch.kind==='stealth'?10:0);
    let crit=.05+(gear.crit||0)+intel*.01;let statusChance=.10+tactics*.035+(gear.status||0)/100;let healBonus=1+(gear.heal||0)/100;
    if(pBranch==='fury')crit+=power*.035;if(pBranch==='combo')speed+=power*4;if(gBranch==='fortress')hp*=1+guard*.04;if(gBranch==='riposte')def*=1+guard*.035;if(tBranch==='control')statusChance+=tactics*.05;if(tBranch==='flow')sp+=tactics*18;
    if(set){const b=set.bonus;if(b.hp)hp*=b.hp;if(b.def)def*=b.def;if(b.sp)sp+=b.sp;if(b.speed)speed+=b.speed;if(b.crit)crit+=b.crit;if(b.heal)healBonus*=b.heal;}
    if(tgs.hp)hp*=tgs.hp;if(tgs.def)def*=tgs.def;if(tgs.speed)speed+=tgs.speed;if(tgs.crit)crit+=tgs.crit;if(tgs.heal)healBonus*=tgs.heal;if(tgs.status)statusChance+=tgs.status;if(tgs.baseScale){const lv=Object.keys(BUILDINGS).reduce((sum,k)=>sum+buildingLevel(k),0);hp*=1+lv*tgs.baseScale;atk*=1+lv*tgs.baseScale*.6;}
    const awakened=h.awakened;const guestScale=guest ? .88 : 1;const stats={id:`a-${number}${guest?'-guest':''}`,team:'ally',number,level,name:ch.name,nickname:ch.nickname,kind:ch.kind,role:kindData(ch).label,row,guest,awakened,kit:heroKit(number),maxHp:Math.round(hp*guestScale),hp:Math.round(hp*guestScale),maxSp:Math.round(sp),sp:Math.round(sp*.55),atk:Math.round(atk*(1+power*.05)*(awakened?1.08:1)*guestScale),def:Math.round(def),speed:Math.round(speed+(guest?8:0)),crit,statusChance,healBonus,statuses:{},shield:0,guarding:false,alive:true,cooldowns:{skill:0,system:0},counterRate:(gBranch==='riposte' ? .12+guard*.06 : 0)+(tgs.counter||0),evadeRate:tgs.evade||0,tiangangStats:tgs,dotTaken:set?.bonus?.dot||1,skillBonus:set?.bonus?.skill||1,backBonus:set?.bonus?.back||1,spRegen:set?.bonus?.spRegen||0,setFour:set?.bonus||{}};return Balance.applyStats?.(stats,number)||stats;
  }

  function selectTalent(number,category,branch){const h=getHero(number);const opts=TREE_OPTIONS[category]?.options||[];if(!opts.some(x=>x.key===branch))return;if(h.skillPoints<=0)return toast('沒有可用技能點。','warn');const node=h.tree[category];if(node.branch&&node.branch!==branch&&node.rank>0)return toast('此路線已選定；請先重置技能樹。','warn');if(node.rank>=3)return toast('此分支已達最高 3 級。','warn');node.branch=branch;node.rank++;h.skillPoints--;save(true);renderHeroes();tone('achievement');}
  function resetTalents(number){const h=getHero(number);const spent=Object.values(h.tree).reduce((s,x)=>s+(x.rank||0),0);if(!spent)return toast('沒有已配置的技能點。','warn');const cost=280+h.level*12;if(state.silver<cost)return toast(`重置需要 ${cost} 銀兩。`,'warn');state.silver-=cost;h.skillPoints+=spent;h.tree=defaultHeroRecord(number).tree;save(true);renderHeroes();toast(`${chapter(number).name}的技能樹已重置。`,'good');}
  function awakenHero(number){const h=getHero(number);if(h.awakened)return toast('此英雄已覺醒。','good');if(h.level<20)return toast('英雄需達 20 級。','warn');if(!state.completed[String(number)])return toast('需先完成該英雄的主角章回。','warn');if(state.inventory.materials.essence<8)return toast('覺醒需要 8 份精華。','warn');state.inventory.materials.essence-=8;h.awakened=true;save(true);renderHeroes();toast(`${chapter(number).nickname}・${chapter(number).name}完成覺醒！`,'good');tone('achievement');}
  function grantXp(number,amount){const h=getHero(number);h.xp+=Math.max(0,Math.round(amount));const levels=[];while(h.level<60&&h.xp>=xpNeeded(h.level)){h.xp-=xpNeeded(h.level);h.level++;h.skillPoints++;levels.push(h.level);}return levels;}

  function equipItem(number,itemId){const item=getItem(itemId);const h=getHero(number);if(!item)return;if(item.exclusiveHero&&item.exclusiveHero!==Number(number))return toast('此為其他英雄的專屬裝備。','warn');const type=item.type;const old=getItem(h.equipment[type]);if(old)old.equippedBy=null;if(item.equippedBy&&item.equippedBy!==number){const other=getHero(item.equippedBy);if(other.equipment[type]===item.id)other.equipment[type]=null;}item.equippedBy=number;h.equipment[type]=item.id;save(true);closeModal();renderHeroes();toast(`${chapter(number).name}已裝備${item.name}。`,'good');}
  function equipBest(number){const h=getHero(number);for(const type of EQUIPMENT_TYPES){const candidates=state.inventory.items.filter(item=>item.type===type&&(!item.equippedBy||item.equippedBy===number)).sort((a,b)=>itemPower(b)-itemPower(a));const best=candidates[0];if(!best)continue;const old=getItem(h.equipment[type]);if(old)old.equippedBy=null;h.equipment[type]=best.id;best.equippedBy=number;}save(true);renderHeroes();toast(`${chapter(number).name}已裝備目前最佳六部位裝備。`,'good');}
  function openEquipmentModal(number,type){const h=getHero(number);const current=getItem(h.equipment[type]);const candidates=state.inventory.items.filter(x=>x.type===type&&(!x.exclusiveHero||x.exclusiveHero===Number(number))).sort((a,b)=>itemPower(b)-itemPower(a));const currentPower=current?itemPower(current):0;openModal(`${chapter(number).name}・手動裝備${EQUIPMENT_LABELS[type]||type}`,`<div class="equipment-picker">${candidates.map(item=>{const p=itemPower(item);const diff=Math.round(p-currentPower);const set=item.setKey?SETS[item.setKey]:null;return`<button class="pick-item ${item.id===current?.id?'selected':''}" data-modal="equip-item" data-hero="${number}" data-item="${item.id}"><b>${item.icon||''} ${esc(item.name)} +${item.level}</b><small>${RARITIES[item.rarity].name}${set?`・${set.name}`:''}・戰力 ${Math.round(p)}・${diff>=0?'+':''}${diff}</small>${item.equippedBy&&item.equippedBy!==number?`<em>目前：${esc(chapter(item.equippedBy).name)}</em>`:''}</button>`;}).join('')||'<p>沒有可用裝備。</p>'}</div><div class="actions"><button class="btn" data-modal="close">關閉</button></div>`);}

  function setActiveFormation(index){state.activeFormation=clamp(Number(index)||0,0,2);save(true);renderTeam();}
  function setFormation(slot,number){const n=Number(number);if(!heroUnlocked(n))return toast('這名英雄尚未解鎖。','warn');const [row,indexText]=slot.split('-');const index=Number(indexText);const plan=currentPlan();if(!['front','back'].includes(row)||![0,1].includes(index))return;const old=plan[row][index];for(const r of ['front','back'])for(let i=0;i<2;i++)if(plan[r][i]===n)plan[r][i]=old;plan[row][index]=n;repairPlan(plan);save(true);renderTeam();tone('save');}
  function renameFormation(index,name){const plan=state.formations[clamp(Number(index),0,2)];if(!plan)return;plan.name=String(name||`第 ${Number(index)+1} 隊`).slice(0,12);save(true);}

  function openChapterChoice(number){const n=clamp(Number(number),1,108);const ch=chapter(n);const draft=state.runs[String(n)];if(draft&&!draft.complete){openModal(`第 ${n} 回已有進度`,`<p>「${esc(ch.title)}」已有進行中紀錄。</p><div class="actions"><button class="btn good" data-modal="chapter-resume" data-number="${n}">繼續本回</button><button class="btn danger" data-modal="chapter-restart" data-number="${n}">重新挑戰</button><button class="btn" data-modal="close">取消</button></div>`);return;}if(state.current&&!state.current.complete&&state.current.chapter!==n){openModal('切換章回',`<p>目前第 ${state.current.chapter} 回仍在進行中，切換後會完整保留。</p><div class="actions"><button class="btn primary" data-modal="chapter-switch" data-number="${n}">保留進度並切換</button><button class="btn" data-modal="close">取消</button></div>`);return;}if(state.completed[String(n)]){const r=state.completed[String(n)];openModal(`第 ${n} 回已完成`,`<p>最佳紀錄：<b>${r.grade}・${r.score} 分</b>。</p><div class="actions"><button class="btn primary" data-modal="chapter-restart" data-number="${n}">重新挑戰</button><button class="btn" data-modal="close">取消</button></div>`);return;}startChapter(n,false);}
  function startChapter(number,forceNew=false){clearAutoTimer();const n=clamp(Number(number),1,108);if(state.current?.chapter)state.runs[String(state.current.chapter)]=state.current;let run=state.runs[String(n)];if(forceNew||!run||run.complete)run=makeRun(n);run=normalizeRun(run);run.lastPlayedAt=now();state.current=run;state.runs[String(n)]=run;state.selected=n;addRecent(n);screen=run.battle?'battle':run.complete?'ending':'chapter';save(true);render();window.scrollTo({top:0,behavior:'smooth'});}
  function chooseStory(key){const run=state.current;const mode=storyMode(currentChapter());const choice=mode.choices.find(x=>x.key===key);if(!run||!choice)return;run.choice=choice.key;run.log.unshift(`採用「${choice.title}」方案。`);if(choice.medicine)run.medicines=Math.min(5,run.medicines+choice.medicine);save(true);renderChapter();tone('save');}
  function trialEffect(key,success){
    const good={evidence:{enemyDef:.90},route:{allySpeed:1.10},formation:{frontDef:1.14},tide:{shield:90},triage:{medicine:1},debate:{reward:1.12},forge:{iron:5},track:{extraEnemy:-1},stealth:{firstStun:.45},rescue:{scoreBonus:5},defense:{allyDef:1.10},supply:{spRegen:10},tiger_sign:{bossShield:-.12},forest_route:{allySpeed:1.10},snow_trace:{enemyAtk:.92},oath_words:{comboStart:25},duel_read:{enemyAtk:.94},array_eye:{statusResist:.15},guest_list:{extraEnemy:-1},tide_turn:{shield:90},message_seal:{extraEnemy:-1},seal_mark:{enemyDef:.9},wine_scent:{poisonWard:true},final_order:{extraEnemy:-1,scoreBonus:6}};
    const bad={evidence:{enemyDef:1.08},route:{enemySpeed:1.08},formation:{frontDamage:70},tide:{allySlow:14},triage:{medicine:-1},debate:{enemyAtk:1.08},forge:{bossShield:.10},track:{extraEnemy:1},stealth:{enemySpeed:1.10},rescue:{scoreBonus:-5},defense:{allyDef:.94},supply:{spRegen:-6},tiger_sign:{frontDamage:50},forest_route:{enemySpeed:1.08},snow_trace:{enemyAtk:1.08},oath_words:{spRegen:-6},duel_read:{enemyAtk:1.10},array_eye:{allySlow:14},guest_list:{extraEnemy:1},tide_turn:{allySlow:16},message_seal:{enemySpeed:1.08},seal_mark:{bossShield:.12},wine_scent:{frontDamage:35},final_order:{enemyAtk:1.08,scoreBonus:-4}};
    return{...(success?good[key]:bad[key])};
  }
  function trialDisplay(trial){
    const rawOptions=Array.isArray(trial?.options)?trial.options:(Array.isArray(trial?.choices)?trial.choices:[]);
    const options=rawOptions.map((raw,index)=>{
      if(raw&&typeof raw==='object'){
        const text=raw.text??raw.label??raw.title??raw.name??`選項 ${String.fromCharCode(65+index)}`;
        const effect=(raw.effect&&typeof raw.effect==='object')?clone(raw.effect):{};
        const success=typeof raw.success==='boolean'?raw.success:null;
        const result=raw.result??raw.message??raw.textResult??'';
        return{raw,text:String(text),success,result:String(result||''),effect,key:raw.key??String(index)};
      }
      return{raw,text:String(raw??`選項 ${String.fromCharCode(65+index)}`),success:null,result:'',effect:{},key:String(index)};
    });
    const bestNumber=Number(trial?.best);
    const explicit=options.findIndex(o=>o.success===true);
    const best=Number.isFinite(bestNumber)?clamp(bestNumber,0,Math.max(0,options.length-1)):(explicit>=0?explicit:0);
    const failRaw=trial?.fail;
    const failEffect=(failRaw&&typeof failRaw==='object')?Object.fromEntries(Object.entries(failRaw).filter(([k])=>!['result','text','message','title','label'].includes(k))):{};
    const failResult=typeof failRaw==='string'?failRaw:String(failRaw?.result??failRaw?.message??'判斷仍有缺口，只能以補救行動降低損害。');
    const successResult=typeof trial?.success==='string'?trial.success:'判斷正確，取得戰術優勢。';
    return{
      icon:trial?.icon||'',
      name:String(trial?.name??trial?.title??'章回判斷'),
      prompt:String(trial?.prompt??trial?.question??'請選擇最能守住梁山義理的處置方式。'),
      key:trial?.key||`chapter-${currentChapter().number}-trial`,
      options,best,failEffect,failResult,successResult
    };
  }
  function resolveChoiceEvent(){
    const run=state.current;if(!run||run.choiceEventDone||!canPerform(run,'choiceEvent',0))return;
    const trial=Epic.trialForChapter?.(currentChapter())||Content74?.trialForChapter?.(currentChapter());if(!trial){run.choiceEventDone=true;save(true);renderChapter();return;}
    const display=trialDisplay(trial);
    const title=`${display.icon?display.icon+' ':''}${display.name}`;
    openModal(title,`<p>${esc(display.prompt)}</p><div class="choice-grid">${display.options.map((o,i)=>`<button class="choice-card" data-modal="trial-choice" data-trial-index="${i}"><b>${String.fromCharCode(65+i)}．${esc(o.text)}</b></button>`).join('')}</div><p class="muted">此判斷會改變後續敵情、獎勵或章回評分。</p>`);
  }
  function resolveTrial(index){
    const run=state.current;if(!run||run.choiceEventDone)return;const trial=Epic.trialForChapter?.(currentChapter())||Content74?.trialForChapter?.(currentChapter());if(!trial)return;
    const display=trialDisplay(trial);if(!display.options.length){run.choiceEventDone=true;save(true);renderChapter();return;}
    const i=clamp(Number(index)||0,0,display.options.length-1),picked=display.options[i];
    const success=picked.success===null?i===display.best:picked.success===true;
    run.trialKey=display.key;run.trialChoice=i;run.trialChoiceText=picked.text;run.trialSuccess=success;
    run.trialResult=success?(picked.result||display.successResult):(display.failResult||picked.result||'判斷仍有缺口，只能以補救行動降低損害。');
    run.trialEffect={...trialEffect(trial?.key,success),...(success?picked.effect:display.failEffect)};run.choiceEventDone=true;
    if(run.trialEffect.medicine)run.medicines=clamp(run.medicines+run.trialEffect.medicine,0,5);if(run.trialEffect.iron)state.inventory.materials.iron+=run.trialEffect.iron;
    run.log.unshift(`${display.name}：選擇「${picked.text}」。${run.trialResult}`);closeModal();save(true);renderChapter();toast(success?'判斷正確，獲得戰術優勢。':'判斷失誤，仍可在戰鬥中挽回。',success?'good':'warn');tone('skill');
  }

  function clueData(ch){const mode=storyMode(ch);return kindData(ch).clue.map((title,index)=>({title,icon:['🔎','📜','🧭','🆘'][index],text:[`在「${ch.focus}」中${['找出第一個關鍵矛盾','核對人物、時機與物證','依方案重新判斷風險','確認最終決戰與救援條件'][index]}。`,`本回屬於「${mode.name}」玩法，查驗結果會影響戰前情報。`].join('')}));}
  function strategyData(ch){return kindData(ch).strategy.map((title,index)=>({title,text:[`依「${ch.focus}」配置第一線人手與資源。`,`根據敵情調整前後排、速度與救援路線。`,`將蒐集到的線索轉為可執行軍令。`,`為首領換階預留反制手段。`,`整合主角客將、羈絆與梁山建設完成收束。`][index]}));}
  function chapterIntro(ch){const handcrafted=Epic.introForChapter?.(ch);return handcrafted||`${ch.nickname}${ch.name}奉命處理「${ch.focus}」。本回採「${storyMode(ch).name}」玩法，玩家需先作出方案選擇，再依不同流程查驗、定策與迎戰。章回主角會以客將身分加入每一場戰鬥。`;}
  function stepDone(run,step){if(step.type==='clue')return run.clues.includes(step.index);if(step.type==='strategy')return run.strategies.includes(step.index);if(step.type==='battle')return Boolean(run.battles[String(step.index)]);if(step.type==='choiceEvent')return Boolean(run.choiceEventDone);if(step.type==='finish')return Boolean(run.complete);return false;}
  function currentStepIndex(run){const flow=flowForChapter(chapter(run.chapter));const i=flow.findIndex(step=>!stepDone(run,step));return i<0?flow.length-1:i;}
  function canPerform(run,type,index=0){if(!run.choice&&type!=='finish')return false;const flow=flowForChapter(chapter(run.chapter));const s=flow[currentStepIndex(run)];return s?.type===type&&Number(s.index)===Number(index);}
  function collectClue(index){const run=state.current;const i=Number(index);if(!run||run.clues.includes(i))return;if(!canPerform(run,'clue',i))return toast('請依故事進程完成目前步驟。','warn');run.clues.push(i);run.clues.sort();run.log.unshift(`查驗完成：${clueData(currentChapter())[i].title}。`);save(true);renderChapter();tone('save');}
  function doStrategy(index){const run=state.current;const i=Number(index);if(!run||run.strategies.includes(i))return;if(!canPerform(run,'strategy',i))return toast('請依故事進程完成目前步驟。','warn');run.strategies.push(i);run.strategies.sort();run.log.unshift(`軍略完成：${strategyData(currentChapter())[i].title}。`);save(true);renderChapter();tone('skill');}

  function bossProfile(ch){return BOSS_MECHANICS[(ch.number-1)%BOSS_MECHANICS.length];}
  function enemyName(ch,stage,index){const names=[['攔路惡徒','巡哨弓手','伏路斥候'],['偽冊頭目','護衛刀手','暗哨術士','追擊騎手'],['幕後黑主','親兵頭目','邪陣軍師','精銳護衛']][stage];return`${names[index]||'敵兵'}・${ch.focus}`;}
  function makeEnemy(ch,stage,index,difficulty){const d=DIFFICULTIES[difficulty]||DIFFICULTIES.standard;const choice=chosenStory();const scale=1+(ch.number-1)*.006;const isBoss=stage===2&&index===0;const hpBase=isBoss?1540:(stage===1?570:450);const atkBase=isBoss?80:(stage===1?52:44);const defBase=isBoss?35:(stage===1?22:16);let hp=Math.round(hpBase*scale*d.hp*(index===0?1:.72));let atk=Math.round(atkBase*scale*d.atk*(index===0?1:.88)*(choice?.enemyAtk||1));let def=Math.round(defBase*scale*(choice?.enemyDef||1));let speed=Math.round((isBoss?73:68+index*5)*d.speed*(choice?.enemySpeed||1));return{id:`e-${stage}-${index}-${Date.now()}`,team:'enemy',name:enemyName(ch,stage,index),icon:isBoss?'👹':index%3===1?'🏹':index%3===2?'🧙':'⚔️',type:isBoss?'boss':(index%3===2?'caster':index%3===1?'ranged':'minion'),maxHp:hp,hp,atk,def,speed,alive:true,statuses:{},shield:isBoss&&bossProfile(ch).key==='armor'?Math.round(hp*.24):0,phase:1,pendingPhase:0,mechanic:isBoss?bossProfile(ch):null,bonusSilver:0,actionsTaken:0};}
  function battleIntel(ch,stage=0){const count=clamp((stage===0?2:3)+(chosenStory()?.extraEnemy||0),1,4);const boss=stage===2?bossProfile(ch):null;const recommend=[ch.kind,ch.kind==='military'?'health':ch.kind==='water'?'transport':ch.kind==='justice'?'stealth':'military'];return{count,boss,recommend:recommend.map(k=>KIND[k]?.label||'守將'),text:boss?`首領「${boss.name}」會在 70% 與 35% 氣血強制換階。`:`預估 ${count} 名敵人，速度與站位將決定行動順序。`};}

  function applyChoiceToParty(party,choice){for(const a of party){if(choice?.shield)a.shield+=choice.shield;if(choice?.sp)a.sp=clamp(a.sp+choice.sp,0,a.maxSp);if(choice?.hp){a.maxHp=Math.round(a.maxHp*choice.hp);a.hp=a.maxHp;}if(choice?.speed)a.speed=Math.round(a.speed*choice.speed);if(choice?.crit)a.crit+=choice.crit;if(choice?.frontAtk&&a.row==='front')a.atk=Math.round(a.atk*choice.frontAtk);if(choice?.frontDef&&a.row==='front')a.def=Math.round(a.def*choice.frontDef);if(choice?.backAtk&&a.row==='back')a.atk=Math.round(a.atk*choice.backAtk);if(choice?.allyAtk)a.atk=Math.round(a.atk*choice.allyAtk);if(a.guest&&choice?.guestSpeed)a.speed+=choice.guestSpeed;}}
  function buildInitiative(b){const units=[...b.allies,...b.enemies].filter(x=>x.alive&&x.hp>0);b.queue=units.map(u=>{const haste=u.statuses?.haste?.duration>0?(u.statuses.haste.power||0):0;const slow=u.statuses?.slow?.duration>0?(u.statuses.slow.power||0):0;return{id:u.id,team:u.team,score:u.speed+haste-slow+rand(0,12)};}).sort((a,c)=>c.score-a.score);b.cursor=0;b.roundStartAt=now();}
  function findUnit(b,token){return token.team==='ally'?b.allies.find(x=>x.id===token.id):b.enemies.find(x=>x.id===token.id);}
  function currentActor(b=state.current?.battle){if(!b?.queue?.length)return null;while(b.cursor<b.queue.length){const unit=findUnit(b,b.queue[b.cursor]);if(unit?.alive&&unit.hp>0)return unit;b.cursor++;}return null;}
  function applyTrialToBattle(party,enemies,run){
    const e=run.trialEffect||{};
    party.forEach(a=>{if(e.allySpeed)a.speed=Math.round(a.speed*e.allySpeed);if(e.frontDef&&a.row==='front')a.def=Math.round(a.def*e.frontDef);if(e.allyDef)a.def=Math.round(a.def*e.allyDef);if(e.shield)a.shield+=e.shield;if(e.allySlow)addStatus(a,'slow',2,e.allySlow);if(e.frontDamage&&a.row==='front')a.hp=Math.max(1,a.hp-e.frontDamage);if(e.spRegen)a.spRegen=Math.max(0,(a.spRegen||0)+e.spRegen);if(e.statusResist)a.statusResist=(a.statusResist||0)+e.statusResist;if(e.poisonWard)a.statuses.poisonWard={duration:99,power:1};});
    enemies.forEach(x=>{if(e.enemyDef)x.def=Math.round(x.def*e.enemyDef);if(e.enemySpeed)x.speed=Math.round(x.speed*e.enemySpeed);if(e.enemyAtk)x.atk=Math.round(x.atk*e.enemyAtk);if(e.firstStun&&Math.random()<e.firstStun)addStatus(x,'stun',1,1);});
    const boss=enemies.find(x=>x.type==='boss');if(boss&&e.bossShield)boss.shield+=Math.round(boss.maxHp*e.bossShield);
  }
  function applyTiangangOpenings(party,enemies){
    for(const a of party){const st=a.tiangangStats||{};if(st.teamSpeed)party.forEach(x=>x.speed+=st.teamSpeed);if(a.number===8)party.filter(x=>x.row==='front').forEach(x=>x.shield+=95+a.level*3);if(a.number===28&&Math.random()<(st.firstStun||0))enemies.forEach(x=>addStatus(x,'stun',1,1));if(a.number===35)a.statuses.stunWard={duration:99,power:1};}
  }
  function applySpecialScale(run,enemies){
    if(!run.special)return;
    if(run.special.mode==='tower'){
      const f=EndgameData.towerFloor(run.special.floor);for(const e of enemies){e.maxHp=Math.round(e.maxHp*f.scale*(f.modifier.enemyHp||1));e.hp=e.maxHp;e.atk=Math.round(e.atk*f.scale*(f.modifier.enemyAtk||1));e.def=Math.round(e.def*(1+(f.scale-1)*.55)*(f.modifier.enemyDef||1));e.speed=Math.round(e.speed*(1+(f.scale-1)*.12)*(f.modifier.enemySpeed||1));}run.special.modifier=f.modifier;
    }
    if(run.special.mode==='expedition'){const scale=1+(run.special.progress||0)*.12;enemies.forEach(e=>{e.maxHp=Math.round(e.maxHp*scale);e.hp=e.maxHp;e.atk=Math.round(e.atk*scale);});}
    if(run.special.mode==='rematch')enemies.forEach(e=>{e.maxHp=Math.round(e.maxHp*1.28);e.hp=e.maxHp;e.atk=Math.round(e.atk*1.18);e.speed=Math.round(e.speed*1.08);});
    if(run.special.mode==='rogue'){const scale=1+(run.special.nodeIndex||0)*.10+(run.special.nodeType==='elite'?.20:run.special.nodeType==='boss'?.35:0);enemies.forEach(e=>{e.maxHp=Math.round(e.maxHp*scale);e.hp=e.maxHp;e.atk=Math.round(e.atk*(1+(scale-1)*.75));e.speed=Math.round(e.speed*(1+(scale-1)*.18));});}
    if(run.special.mode==='weekly'){const mod=run.special.modifier||{};enemies.forEach(e=>{if(mod.key==='speed_storm')e.speed=Math.round(e.speed*1.18);if(mod.key==='boss_chain'){e.maxHp=Math.round(e.maxHp*1.22);e.hp=e.maxHp;e.atk=Math.round(e.atk*1.12);}if(mod.key==='low_sp')e.def=Math.round(e.def*.92);});}
  }
  function startBattle(stage){
    const run=state.current;if(!run||run.battle)return;const s=Number(stage);if(!run.special&&!canPerform(run,'battle',s))return toast('請依故事流程完成前一個步驟。','warn');const ch=currentChapter();const planRows=formationRows();const party=planRows.map(x=>heroCombatStats(x.number,x.row,false));const hasProtagonist=party.some(x=>x.number===ch.number);if(!run.special){if(!hasProtagonist)party.push(heroCombatStats(ch.number,'back',true));else party.find(x=>x.number===ch.number).guest=true;}
    const choice=chosenStory(run);applyChoiceToParty(party,choice);if(run.special?.mode==='rogue'&&state.endgame.rogue){const bonuses=(state.endgame.rogue.relics||[]).map(k=>Rogue?.relics?.find(x=>x.key===k)?.bonus||{});for(const a of party)for(const b of bonuses){if(b.crit)a.crit+=b.crit;if(b.speed)a.speed+=b.speed;if(b.def)a.def=Math.round(a.def*b.def);if(b.heal)a.healBonus*=b.heal;if(b.shield)a.shield+=b.shield;if(b.spRegen)a.spRegen=(a.spRegen||0)+b.spRegen;if(b.cooldown){a.cooldowns.skill=Math.max(0,(a.cooldowns.skill||0)-b.cooldown);a.cooldowns.system=Math.max(0,(a.cooldowns.system||0)-b.cooldown);}}}if(run.special?.mode==='weekly'&&run.special.modifier?.key==='low_sp')party.forEach(a=>a.sp=Math.round(a.sp*.5));let count=clamp((s===0?2:3)+(choice?.extraEnemy||0)+(run.trialEffect?.extraEnemy||0),1,5);if(run.special?.mode==='tower')count=clamp(2+Math.floor((run.special.floor-1)/8)+(run.special.modifier?.extraEnemy||0),2,5);const enemies=Array.from({length:count},(_,i)=>makeEnemy(ch,s,i,run.difficulty));applySpecialScale(run,enemies);applyTrialToBattle(party,enemies,run);if(s===2&&enemies[0]&&run.trialEffect?.bossShield){enemies[0].shield=Math.max(0,enemies[0].shield+Math.round(enemies[0].maxHp*run.trialEffect.bossShield));}applyTiangangOpenings(party,enemies);if(choice?.removeBossShield&&s===2&&enemies[0])enemies[0].shield=0;if(choice?.enemyBleed)enemies.forEach(e=>addStatus(e,'bleed',2,choice.enemyBleed));const bonds=activeBonds();run.battle={stage:s,round:1,queue:[],cursor:0,targetIndex:0,allies:party,enemies,comboGauge:clamp((bonds.length?35:0)+(run.trialEffect?.comboStart||0),0,100),activeBond:bonds[0]?.name||'',difficulty:run.difficulty,log:[`第 1 回合開始：依速度決定行動順序。`],speed:prefs.battleSpeed,auto:prefs.autoBattle,phaseNotice:'',choice:choice?.key||'',special:run.special?clone(run.special):null};buildInitiative(run.battle);if(s===2)run.battle.log.unshift(`首領機制「${enemies[0].mechanic.name}」：${enemies[0].mechanic.text}`);if(run.special?.mode==='tower'&&run.special.modifier)run.battle.log.unshift(`無盡塔環境「${run.special.modifier.name}」：${run.special.modifier.text}`);party.forEach(a=>getHero(a.number).battles++);screen='battle';save(true);renderBattle();tone('battle');advanceToPlayable();
  }

  function aliveAllies(b=state.current?.battle){return b?b.allies.filter(x=>x.alive&&x.hp>0):[];}
  function aliveEnemies(b=state.current?.battle){return b?b.enemies.filter(x=>x.alive&&x.hp>0):[];}
  function selectedEnemy(b=state.current?.battle){if(!b)return null;const direct=b.enemies[b.targetIndex];if(direct?.alive&&direct.hp>0)return direct;const i=b.enemies.findIndex(e=>e.alive&&e.hp>0);b.targetIndex=Math.max(0,i);return b.enemies[i]||null;}
  function addStatus(entity,key,duration=2,power=1){entity.statuses=entity.statuses||{};const old=entity.statuses[key]||{duration:0,power:0};entity.statuses[key]={duration:Math.max(old.duration,duration),power:Math.max(old.power,power)};}
  function statusLabel(key){return({poison:'中毒',burn:'燃燒',bleed:'流血',actionPoison:'劇毒',stun:'暈眩',silence:'封技',armorBreak:'破甲',power:'鼓舞',slow:'遲緩',haste:'神行',taunt:'嘲諷',counter:'反擊',weaken:'挫銳',precision:'透陣',regen:'回生',fortify:'固守',savingSeal:'保命金印',evade:'閃避'})[key]||key;}
  function effectiveDef(target){return Math.max(0,target.def*(target.statuses?.armorBreak?.duration>0 ? .70 : 1));}
  function nextBossThreshold(boss){if(boss.phase===1)return .70;if(boss.phase===2)return .35;return 0;}
  function applyHit(target,amount,{pierce=false,crit=false,source='攻擊',skill=false,attacker=null}={}){
    if(target.team==='ally'&&Math.random()<((target.evadeRate||0)+(target.statuses?.evade?.power||0))){state.current.battle.log.unshift(`${target.name}閃避了${source}。`);return 0;}
    let raw=Math.max(0,Number(amount)||0);if(!pierce)raw=Math.max(1,raw-effectiveDef(target)*.25);const shieldBefore=target.shield||0;if(target.shield>0){const absorbed=Math.min(target.shield,Math.round(raw));target.shield-=absorbed;raw-=absorbed;if(absorbed)state.current.battle.log.unshift(`${target.name}護盾吸收 ${absorbed} 傷害。`);}let damage=Math.max(0,Math.round(raw));
    if(target.type==='boss'&&target.phase<3){const threshold=Math.ceil(target.maxHp*nextBossThreshold(target));if(target.hp-damage<threshold){damage=Math.max(0,target.hp-threshold);target.pendingPhase=target.phase+1;}}
    let nextHp=Math.max(0,target.hp-damage);if(nextHp<=0&&target.statuses?.savingSeal?.duration>0){nextHp=1;delete target.statuses.savingSeal;state.current.battle.log.unshift(`${target.name}的保命金印發動，保留 1 點氣血。`);}else if(nextHp<=0&&target.setFour?.surviveOnce&&!target.surviveUsed){nextHp=1;target.surviveUsed=true;state.current.battle.log.unshift(`${target.name}的鐵壁四件套發動，抵擋致命傷。`);}target.hp=nextHp;
    if(target.team==='ally'&&target.number===2&&shieldBefore>0&&target.shield<=0){aliveEnemies().forEach(e=>{const q=Math.round(target.atk*.24);e.hp=Math.max(0,e.hp-q);if(e.hp<=0)e.alive=false;});state.current.battle.log.unshift(`${target.name}護盾破裂，禪杖震傷全敵。`);}
    if(target.hp<=0){target.alive=false;state.current.battle.log.unshift(`${target.name}被${source}擊倒。`);if(attacker?.setFour?.killSp)attacker.sp=clamp(attacker.sp+attacker.setFour.killSp,0,attacker.maxSp);}
    if(target.pendingPhase)triggerBossPhase(target,target.pendingPhase);return damage;
  }

  function triggerBossPhase(boss,next){if(!boss.alive||next<=boss.phase)return;boss.phase=next;boss.pendingPhase=0;const b=state.current.battle;b.phaseNotice=`${boss.name}進入第 ${next} 階段：${boss.mechanic.name}`;b.log.unshift(b.phaseNotice);if(next===2){if(boss.mechanic.key==='armor'){boss.statuses.counter={duration:99,power:.18};boss.shield+=Math.round(boss.maxHp*.14);}if(boss.mechanic.key==='enrage'){boss.atk=Math.round(boss.atk*1.25);boss.speed+=12;}if(boss.mechanic.key==='regen'){const heal=Math.round(boss.maxHp*.12);boss.hp=Math.min(boss.maxHp,boss.hp+heal);boss.statuses={};}if(boss.mechanic.key==='reinforce')b.enemies.push(makeEnemy(currentChapter(),2,b.enemies.length,b.difficulty));if(boss.mechanic.key==='poison')aliveAllies(b).forEach(a=>addStatus(a,'poison',3,26));if(boss.mechanic.key==='counter')boss.statuses.counter={duration:99,power:.24};}
    if(next===3){boss.atk=Math.round(boss.atk*1.22);boss.speed+=18;if(boss.mechanic.key==='armor'){boss.shield+=Math.round(boss.maxHp*.20);aliveAllies(b).forEach(a=>{const d=Math.round(boss.atk*.55);a.hp=Math.max(0,a.hp-d);if(a.hp<=0)a.alive=false;});}if(boss.mechanic.key==='enrage')boss.statuses.haste={duration:99,power:1};if(boss.mechanic.key==='regen'){boss.hp=Math.min(boss.maxHp,boss.hp+Math.round(boss.maxHp*.15));boss.statuses={};}if(boss.mechanic.key==='reinforce'){b.enemies.push(makeEnemy(currentChapter(),2,b.enemies.length,b.difficulty));b.enemies.push(makeEnemy(currentChapter(),2,b.enemies.length,b.difficulty));}if(boss.mechanic.key==='poison')aliveAllies(b).forEach(a=>addStatus(a,'poison',4,38));if(boss.mechanic.key==='counter')boss.statuses.counter={duration:99,power:.38};}
    tone('battle');
  }
  function skillCost(ally,type){const h=getHero(ally.number);const rank=treeRank(h,'tactics');const flow=treeBranch(h,'tactics')==='flow';const civic=ally.kind==='civic'?8:0;return type==='skill'?Math.max(34,62-rank*4-(flow?rank*4:0)-civic):Math.max(68,104-rank*5-(flow?rank*5:0)-civic);}
  function damageFormula(ally,target,mult=1,skill=false){const h=getHero(ally.number);const choice=chosenStory();let bonus=1;if(ally.row==='back')bonus*=ally.backBonus||1;if(ally.kind==='story')bonus*=1+(1-ally.hp/ally.maxHp)*.35;if(ally.kind==='wild'&&Object.values(target.statuses||{}).some(x=>x?.duration>0))bonus*=1.20*(choice?.debuffDamage||1);if(ally.kind==='stealth'&&state.current.battle.round===1)bonus*=1.25;if(ally.kind==='water')bonus*=1+buildingLevel('waterCamp')*.025;if(ally.statuses?.power?.duration>0)bonus*=1+(ally.statuses.power.power||18)/100;if(ally.statuses?.precision?.duration>0)bonus*=1+(ally.statuses.precision.power||14)/100;if(treeBranch(h,'power')==='fury'&&ally.hp<ally.maxHp*.5)bonus*=1+treeRank(h,'power')*.08;if(skill)bonus*=ally.skillBonus||1;return Math.max(18,ally.atk*mult*bonus+rand(-7,17)-effectiveDef(target)*.20);}
  function healLowest(party,amount){const target=party.filter(x=>x.alive).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(target)target.hp=clamp(target.hp+Math.round(amount),0,target.maxHp);return target;}
  function cleanse(entity){for(const key of ['poison','burn','bleed','stun','armorBreak','slow'])delete entity.statuses?.[key];}
  function applySignatureModifier(ally,target){
    const b=state.current.battle;const m=ally.kit.modifier;const scale=ally.awakened?1.65:1;let note='';
    if(m==='ember'){addStatus(target,'burn',ally.awakened?4:3,Math.round((18+ally.kit.potency)*scale));note='焚勢燃燒';}
    if(m==='venom'){addStatus(target,'poison',ally.awakened?4:3,Math.round((16+ally.kit.potency)*scale));note='蝕毒侵體';}
    if(m==='bulwark'){const shield=Math.round((70+ally.kit.potency*3)*scale);ally.shield+=shield;note=`護身 ${shield}`;}
    if(m==='rally'){const gain=Math.round((18+ally.kit.potency)*scale);aliveAllies(b).forEach(a=>a.sp=clamp(a.sp+gain,0,a.maxSp));note=`全隊豪氣 +${gain}`;}
    if(m==='swift'){addStatus(ally,'haste',ally.awakened?4:3,Math.round((10+ally.kit.potency)*scale));note='迅影提速';}
    if(m==='weaken'){addStatus(target,'weaken',ally.awakened?4:3,Math.round((12+ally.kit.potency)*scale));note='挫銳降攻';}
    if(m==='drain'){const heal=Math.round(ally.atk*(ally.awakened ? .55 : .32));ally.hp=clamp(ally.hp+heal,0,ally.maxHp);note=`回元 ${heal}`;}
    if(m==='unity'){const gain=Math.round((18+ally.kit.potency)*scale);b.comboGauge=clamp(b.comboGauge+gain,0,100);note=`聚義 +${gain}%`;}
    if(m==='precision'){addStatus(target,'armorBreak',ally.awakened?5:3,Math.round((24+ally.kit.potency)*scale));addStatus(ally,'precision',2,ally.awakened?24:14);note='透陣蓄勢';}
    return note;
  }
  function tiangangContext(ally,target,b){
    const requeue=(id,score)=>{const current=b.queue[b.cursor];if(current?.id===id&&score>0){b.queue.splice(b.cursor+1,0,{id,team:ally.team,score,repeat:true});return;}const idx=b.queue.findIndex((x,i)=>i>b.cursor&&x.id===id);if(idx>=0){const[token]=b.queue.splice(idx,1);token.score=score;if(score<0)b.queue.push(token);else b.queue.splice(b.cursor+1,0,token);}};
    return{actor:ally,target,battle:b,random:Math.random,enemies:()=>aliveEnemies(b),allies:()=>aliveAllies(b),status:addStatus,heal:(x,n)=>{if(x)x.hp=clamp(x.hp+Math.round(n),0,x.maxHp);},shield:(x,n)=>{if(x)x.shield=(x.shield||0)+Math.round(n);},hit:(x,mult,opts={})=>applyHit(x,damageFormula(ally,x,mult,true),{...opts,source:ally.kit.skillName,skill:true,attacker:ally}),teamSp:n=>aliveAllies(b).forEach(x=>x.sp=clamp(x.sp+n,0,x.maxSp)),combo:n=>b.comboGauge=clamp(b.comboGauge+n,0,100),requeue,addMedicine:n=>state.current.medicines=clamp(state.current.medicines+n,0,5),addSilver:n=>{state.silver+=Math.max(0,Math.round(n||0));}};
  }
  function applyHeroSkill(ally,target,system=false){const b=state.current.battle;const kit=ally.kit;const potency=kit.potency+(ally.awakened?8:0);let note='';switch(kit.effect){case'execute':if(target.hp/target.maxHp<.35){const d=applyHit(target,damageFormula(ally,target,.70,true),{pierce:true,source:kit.skillName,skill:true,attacker:ally});note=`追斬 ${d}`;}break;case'chain':{const d=applyHit(target,damageFormula(ally,target,.48,true),{source:kit.skillName,skill:true,attacker:ally});note=`追加 ${d}`;}break;case'sunder':addStatus(target,'armorBreak',ally.awakened?4:3,30+potency);note='造成破甲';break;case'heal':{const t=healLowest(aliveAllies(b),ally.atk*(.8+potency/100)*ally.healBonus);note=`治療 ${t?.name||'隊友'}`;}break;case'sweep':aliveEnemies(b).filter(e=>e!==target).forEach(e=>applyHit(e,damageFormula(ally,e,.58,true),{source:kit.skillName,skill:true,attacker:ally}));note='橫掃全敵';break;case'stun':if(Math.random()<ally.statusChance+.28+(ally.awakened ? .12 : 0))addStatus(target,'stun',1,1);note='嘗試震懾';break;case'bleed':addStatus(target,'bleed',ally.awakened?4:3,22+potency);note='附加流血';break;case'focus':ally.sp=clamp(ally.sp+55+potency,0,ally.maxSp);b.comboGauge=clamp(b.comboGauge+28,0,100);note='回復豪氣與合擊';break;case'shield':aliveAllies(b).forEach(a=>a.shield+=80+potency*3);note='全隊護盾';break;case'counter':ally.statuses.counter={duration:2,power:.45+(ally.awakened ? .15 : 0)};note='進入反擊';break;case'haste':aliveAllies(b).forEach(a=>addStatus(a,'haste',2,12+potency));note='全隊神行';break;case'cleanse':aliveAllies(b).forEach(cleanse);note='解除全隊負面狀態';break;}const signature=applySignatureModifier(ally,target);if(signature)note+=`${note?'，':''}${signature}`;if(ally.kind==='health'){const t=healLowest(aliveAllies(b),ally.atk*.50*ally.healBonus);if(t)note+=`，濟護 ${t.name}`;}if(ally.kind==='justice')addStatus(target,'armorBreak',3,32);return note;}

  function performCombo(){const b=state.current.battle;const bond=activeBonds().find(x=>x.name===b.activeBond)||activeBonds()[0];if(!bond||b.comboGauge<100)return false;b.comboGauge=0;const party=aliveAllies(b);const avgAtk=party.reduce((s,a)=>s+a.atk,0)/Math.max(1,party.length);let mult=1.25;if(bond.status==='boss'&&aliveEnemies(b).some(e=>e.type==='boss'))mult=1.65;if(bond.status==='desperate'&&party.some(a=>a.hp<a.maxHp*.45))mult=1.85;aliveEnemies(b).forEach(e=>{applyHit(e,avgAtk*mult,{pierce:true,crit:bond.status==='crit',source:bond.name,skill:true});if(['burn','bleed','armorBreak','stun'].includes(bond.status))addStatus(e,bond.status,bond.status==='stun'?1:3,28);if(bond.status==='slow')addStatus(e,'slow',2,15);});if(bond.status==='shield')party.forEach(a=>{a.shield+=180;a.sp=clamp(a.sp+80,0,a.maxSp);});if(bond.status==='power')party.forEach(a=>addStatus(a,'power',3,18));if(bond.status==='heal'){party.forEach(a=>a.hp=clamp(a.hp+220,0,a.maxHp));state.current.medicines=Math.min(5,state.current.medicines+1);}state.current.stats.combos++;b.log.unshift(`發動羈絆合擊「${bond.name}」：${bond.text}`);tone('achievement');return true;}

  function endRound(){
    const b=state.current.battle;
    for(const entity of [...b.allies,...b.enemies]){
      if(!entity.alive)continue;
      for(const key of ['poison','burn','bleed']){const st=entity.statuses?.[key];if(st?.duration>0){const dmg=Math.round(st.power*(entity.dotTaken||1)*(chosenStory()?.dotTaken||1));entity.hp=Math.max(0,entity.hp-dmg);b.log.unshift(`${entity.name}受到${statusLabel(key)} ${dmg} 點傷害。`);if(entity.hp<=0){entity.alive=false;b.log.unshift(`${entity.name}因持續傷害倒下。`);}}}
      const regen=entity.statuses?.regen;if(regen?.duration>0){const heal=Math.round(regen.power||0);entity.hp=clamp(entity.hp+heal,0,entity.maxHp);b.log.unshift(`${entity.name}回生 ${heal} 點氣血。`);}
      for(const [key,st] of Object.entries(entity.statuses||{})){if(['counter','taunt','stunWard'].includes(key)&&st.duration>=90)continue;st.duration--;if(st.duration<=0)delete entity.statuses[key];}
      if(entity.team==='ally'){
        entity.cooldowns=entity.cooldowns||{skill:0,system:0};entity.cooldowns.skill=Math.max(0,entity.cooldowns.skill-1);entity.cooldowns.system=Math.max(0,entity.cooldowns.system-1);
        if(entity.spRegen)entity.sp=clamp(entity.sp+entity.spRegen,0,entity.maxSp);
      }
      entity.guarding=false;
    }
    const song=aliveAllies(b).find(a=>a.number===5);if(song){const x=healLowest(aliveAllies(b),song.atk*.16*song.healBonus);if(x)b.log.unshift(`宋江「及時雨」回合濟護 ${x.name}。`);}
    if(aliveEnemies(b).length===0)return battleVictory();if(aliveAllies(b).length===0)return handleDefeat();b.round++;state.current.stats.rounds++;b.log.unshift(`第 ${b.round} 回合開始。`);buildInitiative(b);
  }

  function moveCursor(){const b=state.current.battle;b.cursor++;if(b.cursor>=b.queue.length)endRound();}
  function chooseEnemyTarget(enemy,b){const alive=aliveAllies(b);const taunter=alive.find(a=>a.statuses?.taunt?.duration>0);if(taunter)return taunter;const front=alive.filter(a=>a.row==='front');if(front.length&&Math.random()<.72)return front[rand(0,front.length-1)];return alive[rand(0,alive.length-1)];}
  function bossSpecial(enemy,b){if(enemy.type!=='boss')return false;const key=enemy.mechanic?.key;if(key==='armor'&&enemy.phase>=3&&b.round%2===0){aliveAllies(b).forEach(a=>{const d=Math.max(12,Math.round(enemy.atk*.48-a.def*.15));a.hp=Math.max(0,a.hp-d);if(a.hp<=0)a.alive=false;});b.log.unshift(`${enemy.name}施展鐵甲震地，衝擊全隊。`);return true;}if(key==='enrage'&&enemy.phase>=3){return false;}if(key==='regen'&&b.round%3===0){const heal=Math.round(enemy.maxHp*(enemy.phase===3 ? .10 : .06));enemy.hp=clamp(enemy.hp+heal,0,enemy.maxHp);if(enemy.phase===3)cleanse(enemy);b.log.unshift(`${enemy.name}施展邪陣回生，回復 ${heal} 氣血。`);return true;}if(key==='poison'&&enemy.phase>=2&&b.round%2===0){aliveAllies(b).forEach(a=>addStatus(a,'poison',enemy.phase===3?4:3,enemy.phase===3?38:26));b.log.unshift(`${enemy.name}釋放毒霧侵體。`);return true;}return false;}
  function enemyAct(enemy){const b=state.current.battle;if(!enemy?.alive)return;const stun=enemy.statuses?.stun;if(stun?.duration>0){b.log.unshift(`${enemy.name}暈眩，無法行動。`);return;}if(bossSpecial(enemy,b))return;const attacks=enemy.type==='boss'&&enemy.mechanic?.key==='enrage'&&enemy.phase===3?2:1;for(let k=0;k<attacks;k++){const target=chooseEnemyTarget(enemy,b);if(!target)break;let mult=1;if(target.row==='front')mult*=.82;if(target.guarding)mult*=.45;if(enemy.type==='caster'&&target.row==='back')mult*=1.18;if(enemy.type==='boss'&&enemy.phase===3)mult*=1.12;let damage=Math.max(10,enemy.atk*mult*(enemy.statuses?.weaken?.duration>0?Math.max(.55,1-(enemy.statuses.weaken.power||15)/100):1)+rand(-7,14)-target.def*.35);if(target.statuses?.power?.duration>0)damage*=.92;if(chosenStory()?.frontTaken&&target.row==='front')damage*=chosenStory().frontTaken;if(target.shield>0){const absorbed=Math.min(target.shield,Math.round(damage));target.shield-=absorbed;damage-=absorbed;if(absorbed)b.log.unshift(`${target.name}護盾吸收 ${absorbed} 傷害。`);}damage=Math.max(0,Math.round(damage));target.hp=Math.max(0,target.hp-damage);b.log.unshift(`${enemy.name}攻擊${target.name}，造成 ${damage} 傷害。`);if(enemy.type==='boss'&&enemy.mechanic?.key==='poison')addStatus(target,'poison',3,enemy.phase===3?34:22);if(enemy.type==='caster'&&Math.random()<.30)addStatus(target,'burn',2,18);if(target.statuses?.counter?.duration>0&&target.alive){const reflected=Math.round(target.atk*target.statuses.counter.power);enemy.hp=Math.max(0,enemy.hp-reflected);b.log.unshift(`${target.name}反擊 ${reflected} 傷害。`);if(enemy.hp<=0)enemy.alive=false;}if(target.hp<=0){target.alive=false;b.log.unshift(`${target.name}重傷退陣。`);}}
  }
  function applyActionPoison(actor,b){const st=actor.statuses?.actionPoison;if(!st?.duration)return false;const dmg=Math.round(st.power||0);actor.hp=Math.max(0,actor.hp-dmg);b.log.unshift(`${actor.name}因劇毒發作受到 ${dmg} 傷害。`);if(actor.hp<=0){actor.alive=false;b.log.unshift(`${actor.name}毒發倒下。`);return true;}return false;}
  function advanceToPlayable(){clearAutoTimer();const b=state.current?.battle;if(!b)return;if(aliveEnemies(b).length===0)return battleVictory();if(aliveAllies(b).length===0)return handleDefeat();let actor=currentActor(b);if(!actor){endRound();actor=currentActor(b);if(!actor)return;}if(applyActionPoison(actor,b)){moveCursor();save(true);renderBattle();return advanceToPlayable();}if(actor.team==='enemy'){battleBusy=true;const delay=Math.round(520/Math.max(1,b.speed||1));autoTimer=setTimeout(()=>{enemyAct(actor);moveCursor();battleBusy=false;save(true);renderBattle();advanceToPlayable();},delay);return;}if(actor.statuses?.stun?.duration>0){if(actor.statuses?.stunWard?.duration>0){delete actor.statuses.stun;delete actor.statuses.stunWard;b.log.unshift(`${actor.name}的獨角硬闖免疫了暈眩。`);}else{b.log.unshift(`${actor.name}暈眩，跳過行動。`);moveCursor();save(true);renderBattle();advanceToPlayable();return;}}if(b.auto)queueAuto();}

  function chooseAutoEnemy(b){
    const alive=aliveEnemies(b);if(!alive.length)return null;const policy=state.aiPolicy||prefs;let target;
    if(policy.targetPriority==='boss')target=alive.find(e=>e.type==='boss');
    if(policy.targetPriority==='caster')target=alive.find(e=>e.type==='caster'||e.type==='ranged');
    if(policy.targetPriority==='lowest')target=[...alive].sort((a,c)=>a.hp-c.hp)[0];
    if(!target)target=[...alive].sort((a,c)=>(c.atk+c.speed*.7)-(a.atk+a.speed*.7))[0];
    b.targetIndex=b.enemies.indexOf(target);return target;
  }
  function battleAction(action){
    if(battleBusy||!state.current?.battle)return;clearAutoTimer();const run=state.current;const b=run.battle;const ally=currentActor(b);const target=selectedEnemy(b);if(!ally||ally.team!=='ally'||!target)return;battleBusy=true;let acted=false;let damage=0;let label='';let note='';const skill=skillCost(ally,'skill'),system=skillCost(ally,'system');ally.guarding=false;ally.cooldowns=ally.cooldowns||{skill:0,system:0};const silenced=ally.statuses?.silence?.duration>0;
    if(action==='attack'){acted=true;label=`${ally.nickname}進擊`;damage=damageFormula(ally,target,1,false);}
    if(action==='skill'&&ally.sp>=skill&&ally.cooldowns.skill<=0&&!silenced){acted=true;ally.sp-=skill;label=ally.kit.skillName;if(ally.kit.tiangang||ally.kit.dizha){note=(ally.kit.tiangang?Tiangang:Dizha).execute(ally.number,tiangangContext(ally,target,b));damage=0;}else{damage=damageFormula(ally,target,1.62,true);note=applyHeroSkill(ally,target,false);}ally.cooldowns.skill=ally.kit.cooldown||3;if(ally.tiangangStats?.cooldownRefund&&Math.random()<ally.tiangangStats.cooldownRefund){ally.cooldowns.skill=0;note+=`${note?'，':''}御風返法`;}}
    if(action==='system'&&ally.sp>=system&&ally.cooldowns.system<=0&&!silenced){acted=true;ally.sp-=system;label=ally.kit.awakeningName;const targets=aliveEnemies(b);targets.forEach(e=>applyHit(e,damageFormula(ally,e,1.22+(ally.awakened ? .18 : 0),true),{pierce:ally.kind==='justice',source:label,skill:true,attacker:ally}));note=(ally.kit.tiangang||ally.kit.dizha)?(ally.kit.tiangang?Tiangang:Dizha).execute(ally.number,tiangangContext(ally,target,b)):applyHeroSkill(ally,target,true);damage=0;ally.cooldowns.system=4;}
    if(action==='guard'){acted=true;ally.guarding=true;ally.sp=clamp(ally.sp+50,0,ally.maxSp);ally.shield+=65+buildingLevel('infirmary')*8;if(ally.kind==='military'||treeBranch(getHero(ally.number),'guard')==='riposte')ally.statuses.taunt={duration:1,power:1};label='守勢回氣';note='回復豪氣並提高防禦';}
    if(action==='medicine'&&run.medicines>0){acted=true;run.medicines--;run.stats.medicinesUsed++;const heal=Math.round((270+buildingLevel('infirmary')*45)*(chosenStory()?.heal||1)*ally.healBonus);ally.hp=clamp(ally.hp+heal,0,ally.maxHp);if(chosenStory()?.cleanse)cleanse(ally);else{delete ally.statuses.poison;delete ally.statuses.burn;}label='使用金瘡藥';note=`回復 ${heal} 氣血`;}
    if(action==='combo'){acted=performCombo();label='聚義合擊';}
    if(!acted){battleBusy=false;toast(silenced?'目前遭到封技。':'豪氣不足或技能仍在冷卻。','warn');advanceToPlayable();return;}
    if(damage>0){const crit=Math.random()<ally.crit;let final=crit?damage*1.55:damage;const dealt=applyHit(target,final,{pierce:ally.kind==='justice',crit,source:label,skill:action!=='attack',attacker:ally});b.log.unshift(`${ally.name}施展「${label}」，對${target.name}造成 ${dealt} 傷害${note?`，${note}`:''}。`);}else if(action!=='combo')b.log.unshift(`${ally.name}施展「${label}」${note?`，${note}`:''}。`);
    const boss=b.enemies.find(e=>e.type==='boss'&&e.alive&&e.statuses?.counter?.duration>0);if(boss&&['skill','system'].includes(action)){const reflected=Math.round(Math.max(18,damage||ally.atk)*boss.statuses.counter.power);ally.hp=Math.max(0,ally.hp-reflected);b.log.unshift(`${boss.name}發動反震，${ally.name}受到 ${reflected} 傷害。`);if(ally.hp<=0)ally.alive=false;}
    const comboMult=chosenStory()?.combo||1;b.comboGauge=clamp(b.comboGauge+Math.round((ally.kind==='transport'?28:18)*comboMult),0,100);run.stats.actions++;if(aliveEnemies(b).length===0){battleBusy=false;return battleVictory();}if(aliveAllies(b).length===0){battleBusy=false;return handleDefeat();}moveCursor();save(true);renderBattle();battleBusy=false;advanceToPlayable();
  }
  function smartAction(){
    const b=state.current?.battle;if(!b)return;const ally=currentActor(b);if(!ally||ally.team!=='ally')return;chooseAutoEnemy(b);const policy=state.aiPolicy||{};const strategy=policy.mode||prefs.autoStrategy;const cooldown=ally.cooldowns||{skill:0,system:0};
    if(b.comboGauge>=100&&b.activeBond&&(strategy!=='safe'||aliveAllies(b).some(a=>a.hp<a.maxHp*.75)))return battleAction('combo');
    if(policy.useMedicine!==false&&ally.hp<ally.maxHp*(Number(policy.medicineThreshold)||.32)&&state.current.medicines>0)return battleAction('medicine');
    const sys=skillCost(ally,'system'),sk=skillCost(ally,'skill');const canUltimate=ally.sp>=sys&&cooldown.system<=0&&!ally.statuses?.silence;
    if(strategy==='control'&&ally.sp>=sk&&cooldown.skill<=0)return battleAction('skill');
    if(strategy==='boss'&&canUltimate&&aliveEnemies(b).some(e=>e.type==='boss'&&e.phase>=2))return battleAction('system');
    if(canUltimate&&!policy.reserveUltimate&&(aliveEnemies(b).length>1||strategy==='aggressive'))return battleAction('system');
    if(ally.sp>=sk&&cooldown.skill<=0)return battleAction('skill');
    if(ally.hp<ally.maxHp*(strategy==='safe' ? .65 : .45))return battleAction('guard');return battleAction('attack');
  }

  function clearAutoTimer(){if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}}
  function queueAuto(){clearAutoTimer();const b=state.current?.battle;if(!b||!b.auto)return;const actor=currentActor(b);if(!actor)return;const stableBoost=1+(buildingLevel('stable')-1)*.08;const delay=Math.round(850/(Math.max(1,b.speed||1)*stableBoost));autoTimer=setTimeout(()=>{if(state.current?.battle?.auto)smartAction();},delay);}
  function setBattleSpeed(speed){const s=clamp(Number(speed)||1,1,3);prefs.battleSpeed=s;if(state.current?.battle)state.current.battle.speed=s;save(true);renderBattle();advanceToPlayable();}
  function toggleAuto(){prefs.autoBattle=!prefs.autoBattle;if(state.current?.battle)state.current.battle.auto=prefs.autoBattle;save(true);renderBattle();advanceToPlayable();}

  function suspendCurrentForSpecial(){if(state.current?.battle)return false;state.endgame.suspendedRun=state.current?clone(state.current):null;return true;}
  function restoreAfterSpecial(){state.current=state.endgame.suspendedRun?normalizeRun(state.endgame.suspendedRun):null;state.endgame.suspendedRun=null;}
  function startSpecialBattle(mode,key){
    if(!suspendCurrentForSpecial())return toast('請先完成目前戰鬥。','warn');let special,chapterNumber=1;
    if(mode==='tower'){const floor=Math.max(1,Number(key)||state.endgame.towerFloor||1);const data=EndgameData.towerFloor(floor);chapterNumber=data.chapter;special={mode:'tower',floor,modifier:data.modifier};}
    if(mode==='expedition'){const route=EndgameData.routes.find(x=>x.key===key);if(!route)return;const progress=state.endgame.expedition?.route===route.key?state.endgame.expedition.progress:0;state.endgame.expedition={route:route.key,progress,startedAt:state.endgame.expedition?.startedAt||now()};chapterNumber=((route.chapter+progress*7-1)%108)+1;special={mode:'expedition',route:route.key,progress};}
    if(mode==='rematch'){chapterNumber=clamp(Number(key)||1,1,108);if(!state.completed[String(chapterNumber)])return toast('需先完成該章回，才能首領再戰。','warn');special={mode:'rematch',chapter:chapterNumber};}
    if(mode==='rogue'){const rr=state.endgame.rogue,node=Rogue?.currentNode?.(rr);if(!rr||!node||!['battle','elite','boss'].includes(node.type))return toast('目前遠征節點不是戰鬥。','warn');chapterNumber=node.chapter;special={mode:'rogue',nodeIndex:rr.nodeIndex,nodeType:node.type,nodeId:node.id};}
    if(mode==='weekly'){const wk=Rogue?.weekly?.();if(!wk)return;if(state.endgame.weekly?.[wk.key]?.completed)return toast('本週挑戰已完成。','good');if(wk.modifier.key==='earthly_only'&&formationRows().some(x=>x.number<=36))return toast('本週為地煞試煉，請改用 37～108 號英雄。','warn');chapterNumber=wk.chapter;special={mode:'weekly',weekKey:wk.key,modifier:wk.modifier,reward:wk.reward};}
    const run=makeRun(chapterNumber);run.choice=storyMode(chapter(chapterNumber)).choices[0].key;run.choiceEventDone=true;run.trialSuccess=true;run.trialEffect={};run.clues=[0,1,2,3];run.strategies=[0,1,2,3,4];run.difficulty=mode==='rematch'||mode==='weekly'?'heroic':'standard';run.special=special;if(mode==='weekly'&&special.modifier.key==='no_medicine')run.medicines=0;state.current=run;startBattle(2);
  }
  function startRogueRun(){if(state.endgame.rogue&&!state.endgame.rogue.completed)return toast('已有進行中的隨機遠征。','warn');const wk=Rogue.weekly?.();state.endgame.rogue=Rogue.createRun(wk?.challengeCode||'weekly-seed',new Date(),wk?.challengeCode||'');save(true);renderEndgame();toast(`新的分岔遠征已生成：${state.endgame.rogue.challengeCode}`,'good');}

  function abandonRogue(){if(!state.endgame.rogue)return;state.endgame.rogue=null;save(true);renderEndgame();toast('已放棄目前隨機遠征。','warn');}
  function resolveRogueNode(){
    const rr=state.endgame.rogue;if(!rr)return;let node=Rogue?.currentNode?.(rr);
    if(!node){const choices=Rogue.pathChoices?.(rr)||[];if(!choices.length)return;openModal(`第 ${rr.nodeIndex+1} 層・選擇路線`,`<div class="choice-grid">${choices.map((x,i)=>`<button class="choice-card" data-modal="rogue-path" data-index="${i}"><b>${({battle:'戰鬥',elite:'精英',boss:'首領',event:'事件',rest:'休息',shop:'商店'})[x.type]||x.type}・${esc(x.risk)}</b><p>章回 ${x.chapter}・預估獎勵 ${x.reward}</p></button>`).join('')}</div>${rr.rerolls?'<div class="actions"><button class="btn" data-modal="rogue-reroll">重抽本層（剩 1 次）</button></div>':''}`);return;}
    if(['battle','elite','boss'].includes(node.type))return startSpecialBattle('rogue',node.id);
    const floor=rr.nodes[rr.nodeIndex];
    if(node.type==='rest'){rr.hpReserve=Math.min(5,(rr.hpReserve||0)+1);floor.cleared=true;rr.nodeIndex++;save(true);renderEndgame();toast('隊伍休整完成，遠征容錯增加。','good');return;}
    if(node.type==='shop'){const discount=(rr.relics||[]).includes('merchant_abacus')?.25:0,cost=Math.round(250*(1-discount));if(state.silver<cost)return toast(`遠征商店需要 ${cost} 銀兩。`,'warn');state.silver-=cost;const choices=Rogue.relicChoices(rr);openModal('遠征商店・選擇遺物',`<div class="choice-grid">${choices.map(x=>`<button class="choice-card" data-modal="rogue-relic" data-relic="${x.key}" data-advance="1"><b>${esc(x.name)}</b><p>${esc(x.text)}</p></button>`).join('')}</div>`);return;}
    const choices=Rogue.eventChoices(node);openModal('遠征事件',`<p>路途中出現新的抉擇。</p><div class="choice-grid">${choices.map(x=>`<button class="choice-card" data-modal="rogue-event" data-event="${x.key}"><b>${esc(x.title)}</b><p>${esc(x.text)}</p></button>`).join('')}</div>`);
  }

  function chooseRogueRelic(key,advance=false){const rr=state.endgame.rogue,r=Rogue.relics.find(x=>x.key===key);if(!rr||!r)return;rr.relics=rr.relics||[];if(!rr.relics.includes(r.key))rr.relics.push(r.key);if(advance){const floor=rr.nodes?.[rr.nodeIndex];if(floor)floor.cleared=true;rr.nodeIndex++;}closeModal();save(true);renderEndgame();toast(`取得遺物「${r.name}」。`,'good');}
  function chooseRogueEvent(key){const rr=state.endgame.rogue,node=Rogue.currentNode(rr);if(!rr||!node)return;const ev=Rogue.eventChoices(node).find(x=>x.key===key);if(!ev)return;if(ev.cost&&state.silver<ev.cost)return toast('銀兩不足。','warn');if(ev.cost)state.silver-=ev.cost;if(ev.reward)state.silver+=ev.reward;if(ev.material)state.inventory.materials[ev.material]+=5;if(ev.medicine&&state.inventory.medicines>0)state.inventory.medicines--;if(ev.hpReserve)rr.hpReserve=Math.min(5,(rr.hpReserve||0)+ev.hpReserve);rr.nextBonus={shield:ev.shield||0,extraEnemy:ev.extraEnemy||0,def:ev.def||1,enemyAtk:ev.penalty==='enemyAtk'?1.10:1};node.choice=key;const floor=rr.nodes?.[rr.nodeIndex];if(floor)floor.cleared=true;rr.nodeIndex++;closeModal();if(ev.relic){const choices=Rogue.relicChoices(rr);openModal('奇遇遺物',`<div class="choice-grid">${choices.map(x=>`<button class="choice-card" data-modal="rogue-relic" data-relic="${x.key}"><b>${esc(x.name)}</b><p>${esc(x.text)}</p></button>`).join('')}</div>`);}save(true);renderEndgame();}
  function grantRewardObject(reward={}){for(const[k,v]of Object.entries(reward)){if(k==='silver')state.silver+=v;else if(k in state.inventory.materials)state.inventory.materials[k]+=v;}}
  function specialBattleVictory(){
    clearAutoTimer();const run=state.current;const b=run.battle;const sp=run.special;const xp=180+(sp.floor||sp.progress||sp.nodeIndex||1)*12;b.allies.forEach(a=>{getHero(a.number).wins++;grantXp(a.number,xp);});state.telemetry=Telemetry.recordBattle(state.telemetry,{win:true,rounds:run.stats.rounds||b.round,heroes:b.allies.map(a=>a.number),boss:currentChapter().number});let message='特殊挑戰完成。',relicChoices=null;
    if(sp.mode==='tower'){const data=EndgameData.towerFloor(sp.floor);grantRewardObject(data.reward);state.endgame.towerBest=Math.max(state.endgame.towerBest,sp.floor);state.endgame.towerFloor=Math.max(state.endgame.towerFloor,sp.floor+1);message=`無盡塔第 ${sp.floor} 層突破，獲得 ${data.reward.silver} 銀兩。`;}
    if(sp.mode==='expedition'){const route=EndgameData.routes.find(x=>x.key===sp.route);const next=(sp.progress||0)+1;if(next>=route.battles){grantRewardObject(route.reward);state.endgame.expedition=null;message=`遠征「${route.name}」完成，全部獎勵已入庫。`;}else{state.endgame.expedition={route:route.key,progress:next,startedAt:state.endgame.expedition?.startedAt||now()};message=`遠征「${route.name}」完成第 ${next}/${route.battles} 戰。`;}}
    if(sp.mode==='rematch'){const n=sp.chapter;const old=state.endgame.bossRecords[String(n)];const rounds=run.stats.rounds||b.round;state.endgame.bossRecords[String(n)]={bestRounds:old?Math.min(old.bestRounds,rounds):rounds,wins:(old?.wins||0)+1,lastAt:now()};grantRewardObject({silver:500+n*4,essence:3});message=`第 ${n} 回首領再戰勝利，最佳 ${state.endgame.bossRecords[String(n)].bestRounds} 回合。`;}
    if(sp.mode==='weekly'){const wk=Rogue.weekly();grantRewardObject(wk.reward);state.endgame.weekly[wk.key]={completed:true,rounds:run.stats.rounds||b.round,completedAt:now()};message=`每週挑戰「${wk.modifier.name}」完成。`;}
    if(sp.mode==='rogue'){const rr=state.endgame.rogue,floor=rr?.nodes?.[sp.nodeIndex],node=floor?Rogue.currentNode({...rr,nodeIndex:sp.nodeIndex}):null;if(rr&&floor&&node){floor.cleared=true;rr.score=(rr.score||0)+(node.reward||0);state.silver+=node.reward||0;rr.nodeIndex=sp.nodeIndex+1;if(node.type==='boss'||rr.nodeIndex>=rr.nodes.length){grantRewardObject({silver:1800,essence:8,iron:15,wood:15,cloth:15});rr.completed=true;state.endgame.rogue=null;message='Rogue-like 遠征全線完成，取得終局獎勵。';}else{relicChoices=Rogue.relicChoices(rr);message=`遠征第 ${sp.nodeIndex+1} 層勝利，可選擇一件遺物。`;}}}
    restoreAfterSpecial();screen='endgame';save(true);createBackup(message);renderEndgame();if(relicChoices)openModal('選擇遠征遺物',`<div class="choice-grid">${relicChoices.map(x=>`<button class="choice-card" data-modal="rogue-relic" data-relic="${x.key}"><b>${esc(x.name)}</b><p>${esc(x.text)}</p></button>`).join('')}</div>`);toast(message,'good');tone('victory');
  }
  function specialBattleDefeat(){const sp=state.current?.special,b=state.current?.battle;if(b)state.telemetry=Telemetry.recordBattle(state.telemetry,{win:false,rounds:state.current.stats.rounds||b.round,heroes:b.allies.map(a=>a.number),boss:currentChapter().number});let message='特殊挑戰失利，主線進度未受影響。';if(sp?.mode==='rogue'&&state.endgame.rogue){state.endgame.rogue.hpReserve=Math.max(0,(state.endgame.rogue.hpReserve||0)-1);if(state.endgame.rogue.hpReserve<=0){state.endgame.rogue=null;message='隨機遠征容錯耗盡，本次遠征結束。';}else message=`遠征失利，尚餘 ${state.endgame.rogue.hpReserve} 次容錯，可再次挑戰目前節點。`;}restoreAfterSpecial();screen='endgame';save(true);renderEndgame();toast(message,'warn');}
  function battleVictory(){clearAutoTimer();const run=state.current;if(run?.special)return specialBattleVictory();const b=run.battle;state.telemetry=Telemetry.recordBattle(state.telemetry,{win:true,rounds:run.stats.rounds||b.round,heroes:b.allies.map(a=>a.number),boss:currentChapter().number});const stage=b.stage;const ch=currentChapter();const d=DIFFICULTIES[b.difficulty];const choice=chosenStory(run);const base=[125,200,335][stage]+ch.number*3;const tradeBonus=b.allies.filter(a=>a.kind==='trade').length*20;const bonus=b.enemies.reduce((s,e)=>s+Number(e.bonusSilver||0),0);const reward=Math.round((base+tradeBonus+bonus)*d.reward*(choice?.reward||1));const xp=Math.round(([75,120,195][stage]+ch.number)*d.xp*(1+buildingLevel('hall')*.04));const matMult=choice?.material||1;const materialReward={iron:Math.round((stage===2?5:2)*matMult),wood:Math.round((stage===1?4:2)*matMult),cloth:Math.round((stage===0?3:2)*matMult),essence:stage===2?2:0};run.battles[String(stage)]=true;run.silverEarned+=reward;state.silver+=reward;Object.entries(materialReward).forEach(([k,v])=>state.inventory.materials[k]+=v);b.allies.forEach(a=>{const h=getHero(a.number);h.wins++;const levels=grantXp(a.number,a.guest?Math.round(xp*.8):xp);if(levels.length)run.log.unshift(`${a.name}升至 ${levels.at(-1)} 級，獲得技能點。`);});if(stage===2){const protagonist=b.allies.find(a=>a.number===ch.number);run.stats.guestSurvived=Boolean(protagonist?.alive&&protagonist.hp>0);}run.medicines=Math.min(5,run.medicines+1);run.log.unshift(`第 ${stage+1} 場勝利：獲得 ${reward} 銀兩、英雄經驗與素材。`);run.battle=null;screen='chapter';save(true);if(stage===2)createBackup(`完成第 ${ch.number} 回首領戰`);toast(`戰鬥勝利，獲得 ${reward} 銀兩與養成素材。`,'good');tone('victory');render();}
  function handleDefeat(){clearAutoTimer();const run=state.current;if(run?.special)return specialBattleDefeat();const b=run.battle;if(b)state.telemetry=Telemetry.recordBattle(state.telemetry,{win:false,rounds:run.stats.rounds||b.round,heroes:b.allies.map(a=>a.number),boss:currentChapter().number});run.stats.defeats++;run.battle=null;screen='chapter';save(true);toast('隊伍失利，已退回戰前；章回進度完整保留。','warn');render();}
  function computeResult(run){
    let score=100;
    score-=Math.max(0,run.stats.actions-30);
    score-=run.stats.defeats*12;
    score-=run.stats.medicinesUsed*4;
    score+=Math.min(6,run.stats.combos*2);
    score+=run.stats.guestSurvived?4:0;
    score+=run.trialSuccess?5:-3;
    score+=Number(run.trialEffect?.scoreBonus||0);
    if(run.trialEffect?.scoreCap)score=Math.min(score,run.trialEffect.scoreCap);
    score=clamp(Math.round(score),40,100);
    const grade=score>=90?'S':score>=78?'A':score>=65?'B':'C';
    const achievements=[];
    if(run.clues.length===4)achievements.push('明察四證');
    if(run.stats.defeats===0)achievements.push('三戰連捷');
    if(run.stats.medicinesUsed===0)achievements.push('無藥制勝');
    if(run.stats.combos>0)achievements.push('聚義合擊');
    if(run.stats.guestSurvived)achievements.push(`${currentChapter().nickname}主角無傷歸陣`);
    if(run.choiceEventDone)achievements.push(`${storyMode(currentChapter()).name}決斷`);
    if(run.trialSuccess)achievements.push(`${(Epic.trialForChapter?.(currentChapter())||Content74?.trialForChapter?.(currentChapter()))?.name||'章回考驗'}善策`);
    return{score,grade,achievements};
  }
  function finishChapter(){
    const run=state.current;
    if(!run||!canPerform(run,'finish',0)||!run.battles['2'])return;
    const result=computeResult(run);
    const ch=currentChapter();
    run.complete=true;run.score=result.score;run.grade=result.grade;run.achievements=result.achievements;
    run.branchEnding=Epic.branchEnding?.(ch,run)||Content74?.branchEnding?.(ch,run)||{title:'聚義功成',text:'眾英雄平定本回風波。',key:'default'};
    const reward=230+ch.number*4+(run.trialSuccess?80:0);
    state.silver+=reward;run.silverEarned+=reward;
    state.inventory.materials.essence+=result.grade==='S'?3:1;
    const previous=state.completed[String(ch.number)];
    const record={grade:result.grade,score:result.score,actions:run.stats.actions,rounds:run.stats.rounds,defeats:run.stats.defeats,medicinesUsed:run.stats.medicinesUsed,combos:run.stats.combos,guestSurvived:run.stats.guestSurvived,choice:run.choice,trialSuccess:run.trialSuccess,trialKey:run.trialKey,branchEnding:run.branchEnding,achievements:result.achievements,completedAt:now(),source:`v${VERSION} ${EDITION}`};
    if(Chain79?.apply){const chainResult=Chain79.apply(state,ch,run,record);if(chainResult?.applied){record.chain=chainResult.entry;run.log.unshift(`章回連鎖：${chainResult.message}`);}}
    if(!previous||Number(previous.score||0)<=result.score)state.completed[String(ch.number)]=record;
    state.unlocked=Math.max(state.unlocked,Math.min(108,ch.number+1));state.selected=Math.min(108,ch.number+1);
    state.formations.forEach(p=>repairPlan(p));state.runs[String(ch.number)]=run;screen='ending';
    save(true);createBackup(`完成第 ${ch.number} 回`);render();tone('achievement');
  }
  function craftCost(type){const lv=buildingLevel('smithy');const base={weapon:{silver:285,iron:10,wood:3},armor:{silver:270,iron:7,cloth:9},helmet:{silver:220,iron:6,cloth:5},boots:{silver:205,wood:5,cloth:6},talisman:{silver:240,wood:5,cloth:7,essence:1},mount:{silver:320,wood:9,cloth:4}}[type]||{silver:240,iron:5,cloth:5};const out={};for(const[k,v]of Object.entries(base))out[k]=k==='silver'?v+lv*45:v+Math.floor(lv/2);return out;}
  function rollRarity(type){const pity=state.inventory.pity[type]||0;if(pity>=9){state.inventory.pity[type]=0;return'epic';}const smithy=buildingLevel('smithy');const r=Math.random()*100;const epic=RARITIES.epic.weight+smithy*2;const rare=RARITIES.rare.weight+smithy*3;const rarity=r<epic?'epic':r<epic+rare?'rare':'common';state.inventory.pity[type]=rarity==='epic'?0:pity+1;return rarity;}
  function rollAffix(){const a=AFFIX_POOL[rand(0,AFFIX_POOL.length-1)];const value=typeof a.min==='number'&&a.min<1?Math.round((a.min+Math.random()*(a.max-a.min))*1000)/1000:rand(Math.round(a.min),Math.round(a.max));return{key:a.key,name:a.name,value};}
  function craftItem(type){if(!ITEM_TEMPLATES[type])return;const cost=craftCost(type);if(state.silver<cost.silver)return toast('銀兩不足。','warn');for(const[k,v]of Object.entries(cost))if(k!=='silver'&&(state.inventory.materials[k]||0)<v)return toast(`${k==='iron'?'鐵礦':k==='wood'?'木材':k==='cloth'?'布料':'精華'}不足。`,'warn');state.silver-=cost.silver;Object.entries(cost).forEach(([k,v])=>{if(k!=='silver')state.inventory.materials[k]-=v;});const template=ITEM_TEMPLATES[type][rand(0,ITEM_TEMPLATES[type].length-1)];const rarity=rollRarity(type);const id=`v75-${Date.now()}-${state.inventory.nextItemId++}`;const stats={};Object.entries(template).forEach(([k,v])=>{if(['name','icon','setKey'].includes(k))return;if(typeof v==='number')stats[k]=v;});const affixCount=rarity==='epic'?2:rarity==='rare'?1:0;const affixes=Array.from({length:affixCount},rollAffix);state.inventory.items.push({id,type,name:template.name,icon:template.icon,setKey:template.setKey,rarity,level:1,stats,affixes,locked:false,reforges:0,createdAt:now(),equippedBy:null});save(true);renderForge();toast(`鍛造完成：${RARITIES[rarity].name}${template.name}${rarity==='epic'?'（保底重置）':''}。`,'good');tone('achievement');}
  function upgradeItem(id){const item=getItem(id);if(!item)return;if(item.level>=5)return toast('裝備已達 5 級。','warn');const cost=170*item.level;const essence=item.level>=3?1:0;if(state.silver<cost||state.inventory.materials.essence<essence)return toast('銀兩或精華不足。','warn');state.silver-=cost;state.inventory.materials.essence-=essence;item.level++;save(true);renderForge();toast(`${item.name}已強化至 +${item.level}。`,'good');}
  function reforgeItem(id){const item=getItem(id);if(!item)return;if(item.rarity==='common')return toast('凡品裝備無法重鑄；請先鍛造精良或傳說裝備。','warn');const cost=220+item.reforges*60;if(state.silver<cost||state.inventory.materials.essence<1)return toast('重鑄需要銀兩與 1 份精華。','warn');state.silver-=cost;state.inventory.materials.essence--;const count=item.rarity==='epic'?2:1;item.affixes=Array.from({length:count},rollAffix);item.reforges=(item.reforges||0)+1;save(true);renderForge();toast(`${item.name}已完成第 ${item.reforges} 次重鑄。`,'good');}
  function toggleItemLock(id){const item=getItem(id);if(!item)return;item.locked=!item.locked;save(true);renderForge();toast(item.locked?'裝備已鎖定。':'裝備已解除鎖定。','good');}
  function dismantleItem(id){const item=getItem(id);if(!item)return;if(item.equippedBy)return toast('已裝備的物品無法分解。','warn');if(item.locked)return toast('已鎖定的物品無法分解。','warn');if(state.inventory.items.length<=2)return toast('至少保留兩件裝備。','warn');const mult=item.rarity==='epic'?3:item.rarity==='rare'?2:1;const material=item.type==='weapon'||item.type==='helmet'?'iron':item.type==='mount'||item.type==='boots'?'wood':'cloth';state.inventory.materials[material]+=3*mult+item.level;state.inventory.materials.essence+=item.rarity==='epic'?2:item.rarity==='rare'?1:0;state.inventory.items=state.inventory.items.filter(x=>x.id!==id);save(true);renderForge();toast(`${item.name}已分解為素材。`,'good');}

  function craftExclusive(number){
    const n=Number(number),ch=chapter(n),h=getHero(n);if(!heroUnlocked(n))return;
    const existing=state.inventory.items.find(x=>x.exclusiveHero===n);if(existing)return toast(`${ch.name}的專屬裝備已存在。`,'good');
    const cost={silver:1200,iron:14,wood:10,cloth:10,essence:8};
    if(state.silver<cost.silver||state.inventory.materials.iron<cost.iron||state.inventory.materials.wood<cost.wood||state.inventory.materials.cloth<cost.cloth||state.inventory.materials.essence<cost.essence)return toast('鍛造專屬裝備需要 1200 銀兩、鐵礦 14、木材 10、布料 10、精華 8。','warn');
    state.silver-=cost.silver;for(const k of ['iron','wood','cloth','essence'])state.inventory.materials[k]-=cost[k];
    const type=['health','civic','justice'].includes(ch.kind)?'talisman':['transport','water'].includes(ch.kind)?'mount':'weapon';
    const sets={story:'tiger',justice:'cloud',military:'iron',transport:'cloud',water:'river',health:'healer',civic:'cloud',trade:'iron',wild:'tiger',stealth:'cloud'};
    const stats=type==='weapon'?{atk:38+h.level,speed:6,crit:.035}:type==='mount'?{speed:18,hp:95,sp:30}:{sp:48,heal:18,status:10,hp:75};
    const item={id:`exclusive-${n}`,type,name:`${ch.nickname}・${ch.name}真傳${EQUIPMENT_LABELS[type]}`,icon:type==='weapon'?'🗡️':type==='mount'?'🐎':'🔱',rarity:'epic',level:1,stats,affixes:[{key:'atk',name:'真傳',value:8+n%7},{key:'speed',name:'靈應',value:3+n%6}],locked:true,reforges:0,setKey:sets[ch.kind]||'cloud',exclusiveHero:n,createdAt:now(),equippedBy:null};
    state.inventory.items.push(item);save(true);renderHeroes();toast(`${ch.nickname}專屬裝備鍛造完成。`,'good');tone('achievement');
  }
  function batchSelectVisible(){const visible=state.inventory.items.filter(x=>(forgeFilter==='all'||x.type===forgeFilter)&&(forgeRarity==='all'||x.rarity===forgeRarity)&&!x.equippedBy&&!x.locked);const pageSize=prefs.lowPower?16:30;const page=visible.slice((forgePage-1)*pageSize,forgePage*pageSize);page.forEach(x=>selectedForgeItems.add(x.id));renderForge();}
  function batchDismantle(){const ids=[...selectedForgeItems];let done=0;for(const id of ids){const item=getItem(id);if(!item||item.equippedBy||item.locked||item.exclusiveHero)continue;const mult=item.rarity==='epic'?3:item.rarity==='rare'?2:1;const material=item.type==='weapon'||item.type==='helmet'?'iron':item.type==='mount'||item.type==='boots'?'wood':'cloth';state.inventory.materials[material]+=3*mult+item.level;state.inventory.materials.essence+=item.rarity==='epic'?2:item.rarity==='rare'?1:0;state.inventory.items=state.inventory.items.filter(x=>x.id!==id);selectedForgeItems.delete(id);done++;}save(true);renderForge();toast(`已批次分解 ${done} 件裝備。`,done?'good':'warn');}

  function batchLockSelected(locked=true){let done=0;for(const id of selectedForgeItems){const item=getItem(id);if(!item||item.equippedBy)continue;item.locked=Boolean(locked);done++;}save(true);renderForge();toast(`已${locked?'鎖定':'解除鎖定'} ${done} 件裝備。`,done?'good':'warn');}
  function selectCommonUnlocked(){for(const item of state.inventory.items){if(item.rarity==='common'&&!item.equippedBy&&!item.locked&&!item.exclusiveHero)selectedForgeItems.add(item.id);}renderForge();}
  function saveEquipmentPlan(index){const plan=Ops.saveLoadout(state,index,formationNumbers());save(true);renderForge();toast(`${plan.name}已保存目前四名英雄的六部位裝備。`,'good');}
  function applyEquipmentPlan(index){const plan=state.equipmentPlans?.[Number(index)];if(!plan)return toast('找不到裝備方案。','warn');for(const item of state.inventory.items)if(item.equippedBy&&formationNumbers().includes(Number(item.equippedBy)))item.equippedBy=null;for(const n of formationNumbers()){const h=getHero(n);for(const type of EQUIPMENT_TYPES)h.equipment[type]=null;}const used=new Set();let applied=0,missing=0;for(const [num,equipment] of Object.entries(plan.heroes||{})){const n=Number(num);if(!formationNumbers().includes(n))continue;const h=getHero(n);for(const [type,id] of Object.entries(equipment||{})){const item=getItem(id);if(!item||used.has(id)||(item.exclusiveHero&&Number(item.exclusiveHero)!==n)){missing++;continue;}h.equipment[type]=id;item.equippedBy=n;used.add(id);applied++;}}save(true);renderForge();toast(`已套用 ${plan.name}：${applied} 件${missing?`，${missing} 件已不存在或不相容`:''}。`,missing?'warn':'good');}

  function buildingCost(key){const level=buildingLevel(key);const material=BUILDINGS[key].material;return{silver:400+level*320,material,amount:10+level*7,essence:level>=3?level-2:0};}
  function upgradeBuilding(key){const b=BUILDINGS[key];if(!b)return;const level=buildingLevel(key);if(level>=5)return toast('建築已達最高 5 級。','good');const c=buildingCost(key);if(state.silver<c.silver||(state.inventory.materials[c.material]||0)<c.amount||state.inventory.materials.essence<c.essence)return toast('升級資源不足。','warn');state.silver-=c.silver;state.inventory.materials[c.material]-=c.amount;state.inventory.materials.essence-=c.essence;state.base[key]=level+1;save(true);renderBase();toast(`${b.name}升至 ${level+1} 級。`,'good');tone('achievement');}
  function accrueProduction(){
    const last=new Date(state.base.lastProductionAt||now()).getTime(),current=Date.now();
    if(current<last){state.base.lastProductionAt=now();state.saveMeta.warning='偵測到裝置時間倒退，本次不計離線收益。';return state.base.unclaimed;}
    const cap=Ops?.economyCap?.(state.base)||24,hours=clamp((current-last)/3600000,0,cap);
    if(hours>=.02){const gain={silver:Math.floor(hours*(40+buildingLevel('hall')*15)),iron:Math.floor(hours*(.8+buildingLevel('smithy')*.55)),wood:Math.floor(hours*(.8+buildingLevel('stable')*.5)),cloth:Math.floor(hours*(.8+buildingLevel('infirmary')*.55))};for(const[k,v]of Object.entries(gain))state.base.unclaimed[k]=(state.base.unclaimed[k]||0)+v;state.base.lastProductionAt=now();}
    const fatigue=state.base.fatigue||(state.base.fatigue={}),lastFatigue=new Date(state.operations?.lastFatigueAt||state.base.lastProductionAt||now()).getTime(),recover=Ops?.fatigueRecover?.(Math.max(0,(current-lastFatigue)/3600000))||0;
    if(recover>0){for(const k of Object.keys(fatigue))fatigue[k]=Math.max(0,Number(fatigue[k]||0)-recover);state.operations.lastFatigueAt=now();}
    return state.base.unclaimed;
  }

  function claimProduction(){accrueProduction();const u=state.base.unclaimed;state.silver+=u.silver||0;for(const k of ['iron','wood','cloth'])state.inventory.materials[k]+=u[k]||0;state.base.unclaimed={silver:0,iron:0,wood:0,cloth:0};save(true);renderBase();toast('山寨生產資源已入庫。','good');}
  function dispatchSlots(){return 1+Math.floor(buildingLevel('hall')/2);}
  function dispatchAptitude(heroNumber,missionKey){const kind=chapter(heroNumber).kind;const preferred={patrol:['military','wild','stealth'],mine:['trade','military'],weave:['trade','health'],escort:['transport','military','water'],secret:['stealth','justice','transport']}[missionKey]||[];const excellent=preferred[0]===kind,good=preferred.includes(kind);return{label:excellent?'極佳':good?'良好':'普通',mult:excellent?1.35:good?1.18:1,adventure:excellent?.32:good?.22:.12};}
  function startDispatch(missionKey,heroNumber){
    const mission=EndgameData.dispatchMissions.find(x=>x.key===missionKey),n=Number(heroNumber);if(!mission||!heroUnlocked(n))return;
    if(state.dispatches.length>=dispatchSlots())return toast('派遣欄位已滿。','warn');if(state.dispatches.some(x=>x.hero===n))return toast('此英雄正在派遣中。','warn');
    const fatigue=Number(state.base.fatigue?.[String(n)]||0);if(fatigue>=80)return toast('此英雄疲勞過高，請先休息。','warn');
    const aptitude=dispatchAptitude(n,mission.key),duration=Math.round(mission.minutes*60000/(1+(aptitude.mult-1)*.35));state.base.fatigue[String(n)]=Math.min(100,fatigue+28);
    state.dispatches.push({id:`d-${Date.now()}-${n}`,hero:n,mission:mission.key,aptitude:aptitude.label,mult:aptitude.mult,adventureChance:aptitude.adventure,fatigueAtStart:fatigue,startedAt:now(),endsAt:new Date(Date.now()+duration).toISOString()});
    save(true);renderBase();toast(`${chapter(n).name}以「${aptitude.label}」適性前往「${mission.name}」，疲勞 ${state.base.fatigue[String(n)]}。`,'good');
  }

  function claimDispatch(id){
    const d=state.dispatches.find(x=>x.id===id);if(!d)return;if(Date.now()<new Date(d.endsAt).getTime())return toast('派遣尚未完成。','warn');
    const mission=EndgameData.dispatchMissions.find(x=>x.key===d.mission),aptitude=dispatchAptitude(d.hero,d.mission),fatigue=Number(d.fatigueAtStart||0),fatigueFactor=Math.max(.72,1-fatigue*.0035),levelBonus=1+getHero(d.hero).level*.01,reward={};
    for(const[k,v]of Object.entries(mission.reward))reward[k]=Math.round(v*levelBonus*(d.mult||aptitude.mult)*fatigueFactor);
    let adventure='';const greatSuccess=Math.random()<Math.max(.08,(d.adventureChance||aptitude.adventure)-fatigue*.0015);
    if(greatSuccess){const events=[['發現山賊暗庫',{silver:260,iron:3}],['救下迷路商旅',{silver:180,cloth:4}],['找到古舊兵書',{essence:2}],['協助村民修橋',{wood:7,silver:100}]], [text,bonus]=events[rand(0,events.length-1)];for(const[k,v]of Object.entries(bonus))reward[k]=(reward[k]||0)+v;adventure=`大成功奇遇：${text}。`;state.base.dispatchLog.unshift({at:now(),hero:d.hero,mission:d.mission,text,reward:bonus});state.base.dispatchLog=state.base.dispatchLog.slice(0,20);}
    grantRewardObject(reward);grantXp(d.hero,90+mission.minutes*3);state.dispatches=state.dispatches.filter(x=>x.id!==id);save(true);renderBase();toast(`${chapter(d.hero).name}完成派遣。${adventure}`,'good');
  }

  function cancelDispatch(id){const d=state.dispatches.find(x=>x.id===id);if(!d)return;state.dispatches=state.dispatches.filter(x=>x.id!==id);save(true);renderBase();toast('派遣已取消，未獲得獎勵。','warn');}
  function dispatchRemaining(d){return Math.max(0,new Date(d.endsAt).getTime()-Date.now());}
  function formatDuration(ms){const min=Math.ceil(ms/60000);return min<=0?'可領取':min<60?`${min} 分鐘`:`${Math.floor(min/60)} 小時 ${min%60} 分`;}
  function buyMedicine(){const cost=Math.max(70,130-buildingLevel('infirmary')*10);if(state.silver<cost)return toast('銀兩不足。','warn');if(state.inventory.medicines>=99)return toast('備用藥品已達上限。','warn');state.silver-=cost;state.inventory.medicines++;save(true);renderForge();toast('已購買一份備用金瘡藥。','good');}
  function claimMedicine(){const run=state.current;if(!run||run.medicines>=5)return toast('本回藥品已達上限。','warn');if(state.inventory.medicines<=0)return toast('倉庫沒有備用藥品。','warn');state.inventory.medicines--;run.medicines++;save(true);renderChapter();toast('已領用一份金瘡藥。','good');}

  function topbar(subtitle=''){return`<a class="skip-link" href="#mainContent">跳到主要內容</a><header class="topbar"><div class="brand"><div class="brand-mark" aria-hidden="true">梁</div><div class="brand-text"><b>水滸英雄傳：梁山風雲</b><small>v${VERSION} ${EDITION}${subtitle?`・${esc(subtitle)}`:''}</small></div></div><div class="top-actions"><button class="btn icon" data-act="theme" aria-label="切換顯示模式" title="切換顯示模式">◐</button><button class="btn icon" data-act="music" aria-label="切換背景音樂" title="切換背景音樂">樂</button><button class="btn icon" data-act="accessibility" aria-label="無障礙設定" title="無障礙設定">輔</button><button class="btn icon" data-act="speech" aria-label="朗讀本頁" title="朗讀本頁">朗</button><button class="btn icon" data-act="manage" aria-label="存檔管理" title="存檔管理">存</button></div></header>`;}
  function nav(){const items=[['home','首頁'],['chapters','章回'],['team','編隊'],['heroes','英雄'],['forge','裝備'],['base','山寨'],['endgame','遠征'],['cloud','雲端'],['ops','維護']];return`<nav class="nav" aria-label="主要導覽">${items.map(([key,label])=>{const ok=featureUnlocked(key);const need=Ops.featureRules?.[key]||0;return`<button class="btn small ${ok?'':'locked-nav'}" data-act="${key}" ${ok?'':`aria-disabled="true" title="完成 ${need} 回後開放"`}>${label}${ok?'':` 🔒`}</button>`;}).join('')}<span class="nav-spacer"></span><span class="tag">銀兩 ${state.silver}</span><span class="tag">完成 ${completionCount()}/108</span></nav>`;}
  function materialsBar(){const m=state.inventory.materials;return`<div class="materials-bar" aria-label="資源"><span>⛓️ 鐵礦 ${m.iron}</span><span>🪵 木材 ${m.wood}</span><span>🧵 布料 ${m.cloth}</span><span>✨ 精華 ${m.essence}</span><span>💊 藥品 ${state.inventory.medicines}</span><span>💾 ${esc(state.saveMeta.backend)}</span>${state.saveMeta.checksum?`<span title="存檔校驗碼">🔐 ${esc(state.saveMeta.checksum.slice(0,8))}</span>`:''}</div>`;}
  function renderHome(){screen='home';clearAutoTimer();accrueProduction();const recommended=firstIncomplete();const bonds=activeBonds();const cloudStatus=Cloud?.getStatus?.()||{};app.innerHTML=`<main id="mainContent">${topbar()}${nav()}${state.saveMeta.warning?`<div class="warning-banner">⚠️ ${esc(state.saveMeta.warning)}</div>`:''}<section class="hero"><span class="eyebrow">OPERATIONS-READY LONG RPG</span><h1>資料驗證與回歸測試強化版</h1><h2>108 回資料驗證・判斷題回歸測試・快取清除・存檔安全檢查</h2><p>v7.9.2 針對章回資料格式、判斷題顯示、畫面異常文字、存檔安全與 Service Worker 快取做完整檢查，避免再出現 undefined 與 [object Object]。</p><div class="actions"><button class="btn primary" data-act="continue">${state.current&&!state.current.complete?'繼續目前章回':'開始推薦章回'}</button><button class="btn" data-act="endgame">進入梁山遠征</button><button class="btn" data-act="cloud">${cloudStatus.signedIn?'雲端已登入':'設定雲端傳承'}</button><button class="btn" data-chapter="${recommended}">第 ${recommended} 回</button></div></section>${!currentTutorial().completed?`<section class="card tutorial-banner"><div><span class="eyebrow">NEW PLAYER GUIDE</span><h2>新手教學 ${Math.min((currentTutorial().step||0)+1,Ops.tutorialSteps?.length||7)}/${Ops.tutorialSteps?.length||7}</h2><p>${esc(Ops.tutorialSteps?.[currentTutorial().step||0]?.text||'依序認識章回、戰鬥、編隊與養成。')}</p></div><div class="actions"><button class="btn primary" data-act="tutorial">開始／繼續教學</button><button class="btn" data-act="tutorial-dismiss">暫時略過</button></div></section>`:''}${materialsBar()}<div class="grid four" style="margin-top:16px"><section class="card metric"><div><span>章回完成</span><strong>${completionCount()}</strong></div><b>/108</b></section><section class="card metric"><div><span>百八真傳</span><strong>${(Tiangang.count||0)+(Dizha.count||0)}</strong></div><b>/108</b></section><section class="card metric"><div><span>無盡塔最佳</span><strong>${state.endgame.towerBest||0}</strong></div><b>層</b></section><section class="card metric"><div><span>自動備份</span><strong>${state.saveMeta.backupCount||0}</strong></div><b>/${MAX_BACKUPS}</b></section></div><div class="grid two" style="margin-top:16px"><section class="card"><h2>${esc(currentPlan().name)}</h2>${formationRows().map(x=>heroMini(x.number,x.row)).join('')}<div class="actions"><button class="btn" data-act="team">編隊與 AI 指令</button><button class="btn" data-act="heroes">英雄覺醒</button></div></section><section class="card"><h2>長期進度</h2><p>無盡塔下一層：${state.endgame.towerFloor}；遠征：${state.endgame.expedition?`${esc(EndgameData.routes.find(x=>x.key===state.endgame.expedition.route)?.name||'進行中')} ${state.endgame.expedition.progress} 戰`:'尚未出發'}。</p><p>山寨待領生產：${state.base.unclaimed.silver||0} 銀兩、${state.base.unclaimed.iron||0} 鐵礦、${state.base.unclaimed.wood||0} 木材、${state.base.unclaimed.cloth||0} 布料。</p><div class="actions"><button class="btn" data-act="base">山寨派遣</button><button class="btn" data-act="endgame">遠征挑戰</button></div></section></div></main>`;}

  function heroMini(number,row){const ch=chapter(number);const h=getHero(number);return`<div class="team-mini">${portraitMarkup(number,'small')}<div><b>${esc(ch.nickname)}・${esc(ch.name)} ${h.awakened?'✦':''}</b><small>${row==='front'?'前排':'後排'}・Lv.${h.level}・${kindData(ch).label}</small></div></div>`;}

  function renderChapters(){screen='chapters';clearAutoTimer();const q=chapterSearch.trim().toLowerCase();const first=firstIncomplete();const recentSet=new Set(state.recent);const list=chapters.filter(ch=>{if(chapterEra!=='all'&&ch.era!==chapterEra)return false;if(chapterStatus==='unfinished'&&state.completed[String(ch.number)])return false;if(chapterStatus==='nonS'&&state.completed[String(ch.number)]?.grade==='S')return false;if(chapterStatus==='recent'&&!recentSet.has(ch.number))return false;if(q&&!`${ch.number}${ch.name}${ch.nickname}${ch.title}${ch.focus}`.toLowerCase().includes(q))return false;return true;});app.innerHTML=`${topbar('章回總覽')}${nav()}<section class="page-head"><div><span class="eyebrow">108 CHAPTERS</span><h1>完整章回</h1><p>搜尋英雄、綽號、章回或主題；每回的玩法類型、流程順序與故事抉擇不同。</p></div><button class="btn primary" data-chapter="${first}">前往第 ${first} 回</button></section><div class="chapter-toolbar"><input class="field" id="chapterSearch" placeholder="搜尋英雄、章回、主題" value="${esc(chapterSearch)}"><select class="field" id="chapterEra"><option value="all">全部篇章</option>${['經典篇','制度續篇','百業聚義篇'].map(x=>`<option ${chapterEra===x?'selected':''}>${x}</option>`).join('')}</select><select class="field" id="chapterStatus"><option value="all">全部狀態</option><option value="unfinished" ${chapterStatus==='unfinished'?'selected':''}>未完成</option><option value="nonS" ${chapterStatus==='nonS'?'selected':''}>非 S 級</option><option value="recent" ${chapterStatus==='recent'?'selected':''}>最近遊玩</option></select><button class="btn" data-act="clear-filter">清除</button></div><p class="filter-summary">顯示 ${list.length} 回</p><div class="chapter-grid">${list.map(ch=>chapterCard(ch,recentSet)).join('')}</div>`;}
  function chapterCard(ch,recentSet){const done=state.completed[String(ch.number)];const draft=state.runs[String(ch.number)]&&!state.runs[String(ch.number)].complete;return`<button class="chapter-card ${draft?'draft-mark':''}" data-chapter="${ch.number}"><span class="chapter-number">第 ${ch.number} 回${Epic.isEpic?.(ch.number)?'・手工章回':''}</span><span class="chapter-icon">${ch.icon}</span><h3>${esc(ch.title)}</h3><p>${esc(ch.nickname)}・${esc(ch.name)}｜${esc(storyMode(ch).name)}</p><small>${esc(ch.focus)}</small>${done?`<span class="grade ${done.grade}">${done.grade}</span>`:''}${recentSet.has(ch.number)?'<span class="recent-mark">最近遊玩</span>':''}</button>`;}

  function renderChapter(){const run=state.current;if(!run)return renderHome();screen='chapter';clearAutoTimer();const ch=currentChapter();const flow=flowForChapter(ch);const stepIndex=currentStepIndex(run);const choice=chosenStory(run);const nextBattle=flow.slice(stepIndex).find(x=>x.type==='battle');const intel=nextBattle?battleIntel(ch,nextBattle.index):null;app.innerHTML=`${topbar(`第 ${ch.number} 回`)}${nav()}<section class="chapter-hero chapter-art"${chapterBackgroundStyle(ch)}>${portraitMarkup(ch.number)}<div class="chapter-symbol">${ch.icon}</div><div><span class="eyebrow">${esc(ch.era)}・${esc(storyMode(ch).name)}</span><h1>${esc(ch.title)}</h1><h2>${esc(ch.nickname)}・${esc(ch.name)}</h2><p>${esc(chapterIntro(ch))}</p></div></section>${materialsBar()}${!run.choice?storyChoicePanel(ch):`<section class="card choice-summary"><b>${storyMode(ch).icon} 已選方案：${esc(choice.title)}</b><p>${esc(choice.text)}</p></section>`}${run.choiceEventDone?`<section class="card ${run.trialSuccess?'success':'warning'}"><b>${esc((Epic.trialForChapter?.(ch)||Content74?.trialForChapter(ch))?.name||'章回判斷')}：${run.trialSuccess?'判斷成功':'險中補救'}</b><p>${esc(run.trialResult||'抉擇已影響後續敵情。')}</p></section>`:''}${intel?renderIntel(ch,intel,nextBattle.index):''}<div class="grid two" style="margin-top:16px"><section class="card"><h2>章回流程</h2><div class="story-flow">${flow.map((step,i)=>renderFlowStep(run,step,i,stepIndex,ch)).join('')}</div></section><aside><section class="card"><h2>章回主角客將</h2>${heroMini(ch.number,'back')}<p>若主角未在目前四人隊伍，戰鬥時會以第五名客將加入；存活完成首領戰可取得專屬成就。</p><div class="actions"><button class="btn" data-act="team">調整編隊</button><button class="btn" data-act="claim-medicine">領用藥品（本回 ${run.medicines}/5）</button></div></section><section class="card" style="margin-top:14px"><h2>行動紀錄</h2><div class="log">${run.log.slice(0,10).map(x=>`<p>${esc(x)}</p>`).join('')}</div></section></aside></div>`;}
  function storyChoicePanel(ch){const mode=storyMode(ch);return`<section class="card story-choice"><span class="eyebrow">先作出本回關鍵選擇</span><h2>${mode.icon} ${esc(mode.name)}</h2><div class="choice-grid">${mode.choices.map(c=>`<button class="choice-card" data-story-choice="${c.key}"><b>${esc(c.title)}</b><p>${esc(c.text)}</p></button>`).join('')}</div></section>`;}
  function renderIntel(ch,intel,stage){return`<section class="card intel-panel"><div><span class="eyebrow">戰前敵情・第 ${stage+1} 場</span><h2>${intel.boss?'首領情報':'敵軍偵察'}</h2><p>${esc(intel.text)}</p></div><div class="intel-tags"><span class="tag">預估敵人 ${intel.count}</span>${intel.recommend.map(x=>`<span class="tag good">推薦 ${esc(x)}</span>`).join('')}${intel.boss?`<span class="tag danger">${esc(intel.boss.name)}</span>`:''}</div></section>`;}
  function renderFlowStep(run,step,index,current,ch){const done=stepDone(run,step);const isCurrent=index===current&&!done;let title='';let text='';let button='';if(step.type==='clue'){const d=clueData(ch)[step.index];title=d.title;text=d.text;button=`<button class="btn ${isCurrent?'primary':''}" data-clue="${step.index}" ${isCurrent?'':'disabled'}>${done?'已查驗':'查驗'}</button>`;}if(step.type==='strategy'){const d=strategyData(ch)[step.index];title=d.title;text=d.text;button=`<button class="btn ${isCurrent?'primary':''}" data-strategy="${step.index}" ${isCurrent?'':'disabled'}>${done?'已完成':'執行'}</button>`;}if(step.type==='choiceEvent'){title='故事轉折';text='讓先前的選擇正式改變後續敵情與獎勵。';button=`<button class="btn ${isCurrent?'primary':''}" data-act="resolve-choice" ${isCurrent?'':'disabled'}>${done?'已發生':'推進劇情'}</button>`;}if(step.type==='battle'){title=['前哨交鋒','局勢轉折戰','三階首領決戰'][step.index];text=step.index===2?`首領「${bossProfile(ch).name}」會在 70% 與 35% 強制換階。`:'依速度行動條與多敵人配置迎戰。';button=`<button class="btn ${isCurrent?'danger':''}" data-battle-start="${step.index}" ${isCurrent?'':'disabled'}>${done?'已勝利':'出戰'}</button>`;}if(step.type==='finish'){title='章回結算';text='計算評級、主角客將成就、故事決斷與養成獎勵。';button=`<button class="btn ${isCurrent?'good':''}" data-act="finish" ${isCurrent?'':'disabled'}>${done?'已結算':'完成本回'}</button>`;}return`<div class="flow-step ${done?'done':isCurrent?'current':'locked'}"><span class="flow-index">${done?'✓':index+1}</span><div><h3>${esc(title)}</h3><p>${esc(text)}</p></div>${button}</div>`;}

  function renderBattle(){const run=state.current;const b=run?.battle;if(!b)return renderChapter();screen='battle';const actor=currentActor(b);const target=selectedEnemy(b);const bond=activeBonds().find(x=>x.name===b.activeBond);app.innerHTML=`${topbar(`第 ${currentChapter().number} 回・戰鬥`)}${nav()}<div class="battle-toolbar"><div><b>第 ${b.round} 回合・${actor?`${actor.team==='ally'?'我方':'敵方'} ${esc(actor.name)} 行動`:'整理行動條'}</b><small>全體依速度排序；所有單位行動完畢後才結算持續狀態。</small></div><div class="actions"><button class="btn ${b.speed===1?'primary':''}" data-speed="1">×1</button><button class="btn ${b.speed===2?'primary':''}" data-speed="2">×2</button><button class="btn ${b.speed===3?'primary':''}" data-speed="3">×3</button><button class="btn ${b.auto?'good':''}" data-act="toggle-auto">自動 ${b.auto?'開':'關'}</button></div></div>${b.phaseNotice?`<div class="boss-phase-alert">⚠️ ${esc(b.phaseNotice)}</div>`:''}<section class="initiative-strip">${b.queue.map((token,i)=>{const u=findUnit(b,token);return`<span class="initiative-token ${i===b.cursor?'current':''} ${u?.team||''} ${!u?.alive?'fallen':''}">${u?.team==='ally'?'🟢':'🔴'} ${esc(u?.name||'')}</span>`;}).join('')}</section><div class="combat-board"><section><h2>我方隊伍</h2><div class="combat-team">${b.allies.map(a=>unitCard(a,actor?.id===a.id,false)).join('')}</div></section><section><h2>敵方陣營</h2><div class="combat-team">${b.enemies.map((e,i)=>unitCard(e,false,i===b.targetIndex)).join('')}</div></section></div><section class="card active-panel"><div class="portrait"><div class="avatar">${actor?.team==='ally'?esc(actor.name[0]):'敵'}</div><div><span class="tag ${actor?.team==='ally'?'good':'danger'}">${actor?.team==='ally'?'我方行動':'敵方思考中'}</span><h2>${esc(actor?.name||'整理回合')}</h2><p>${actor?.team==='ally'?`${esc(actor.kit.skillName)}・速度 ${actor.speed}`:'敵人會依首領階段與角色類型選擇招式。'}</p></div></div>${actor?.team==='ally'?battleActions(actor,target,b,bond):'<p>敵方回合將自動執行，完成後輪到下一名速度序列角色。</p>'}</section><section class="card" style="margin-top:14px"><h2>戰鬥紀錄</h2><div class="log">${b.log.slice(0,18).map(x=>`<p>${esc(x)}</p>`).join('')}</div></section>`;}
  function unitCard(u,active,targeted){const status=Object.entries(u.statuses||{}).filter(([,v])=>v?.duration>0).map(([k,v])=>`<span class="status-effect ${['power','haste','counter'].includes(k)?'good':''}">${statusLabel(k)} ${v.duration>=90?'常駐':v.duration}</span>`).join('');const phase=u.type==='boss'?`・第 ${u.phase} 階段`:'';const set=u.team==='ally'?equipmentSetBonus(u.number):null;return`<button class="unit-card ${active?'active':''} ${targeted?'targeted':''} ${!u.alive?'fallen':''}" ${u.team==='enemy'?'data-target="'+state.current.battle.enemies.indexOf(u)+'"':''}><div class="unit-head"><span class="avatar small-avatar">${u.icon||u.name[0]}</span><div><b>${esc(u.nickname?`${u.nickname}・${u.name}`:u.name)}${u.guest?'（客將）':''}</b><small>${u.team==='ally'?`${u.row==='front'?'前排':'後排'}・速度 ${u.speed}${set?`・${set.name}`:''}`:`${u.type}${phase}・速度 ${u.speed}`}</small></div></div><div class="statline"><span>氣血</span><div class="bar hp"><i style="width:${pct(u.hp,u.maxHp)}%"></i></div><b>${Math.max(0,Math.round(u.hp))}/${u.maxHp}</b></div>${u.team==='ally'?`<div class="statline"><span>豪氣</span><div class="bar sp"><i style="width:${pct(u.sp,u.maxSp)}%"></i></div><b>${Math.round(u.sp)}/${u.maxSp}</b></div>`:''}${u.shield>0?`<small>護盾 ${Math.round(u.shield)}</small>`:''}<div>${status}</div>${u.type==='boss'?`<small class="mechanic-note">${esc(u.mechanic.name)}：${esc(u.mechanic.text)}</small>`:''}</button>`;}
  function battleActions(actor,target,b,bond){
    const skill=skillCost(actor,'skill'),system=skillCost(actor,'system');
    const sc=Number(actor.cooldowns?.skill||0),uc=Number(actor.cooldowns?.system||0);
    return`<div class="battle-actions" aria-label="戰鬥指令">
      <button class="btn primary" data-battle-action="attack" title="快捷鍵 1">普通攻擊 <kbd>1</kbd></button>
      <button class="btn" data-battle-action="skill" ${(actor.sp<skill||sc>0||actor.statuses?.silence?.duration>0)?'disabled':''} title="快捷鍵 2">${esc(actor.kit.skillName)}（${sc>0?`冷卻 ${sc}`:skill}） <kbd>2</kbd></button>
      <button class="btn accent" data-battle-action="system" ${(actor.sp<system||uc>0||actor.statuses?.silence?.duration>0)?'disabled':''} title="快捷鍵 3">${esc(actor.kit.awakeningName)}（${uc>0?`冷卻 ${uc}`:system}） <kbd>3</kbd></button>
      <button class="btn" data-battle-action="guard" title="快捷鍵 4">守勢回氣 <kbd>4</kbd></button>
      <button class="btn" data-battle-action="medicine" ${state.current.medicines<=0?'disabled':''} title="快捷鍵 5">金瘡藥 ${state.current.medicines} <kbd>5</kbd></button>
      <button class="btn good" data-battle-action="combo" ${!bond||b.comboGauge<100?'disabled':''} title="快捷鍵 0">${bond?esc(bond.name):'無羈絆'} ${b.comboGauge}% <kbd>0</kbd></button>
    </div><p class="muted">目前目標：${esc(target?.name||'無')}。技能冷卻會在完整回合結束後遞減。</p>`;
  }
  function renderEnding(){
    const run=state.current;const ch=currentChapter();screen='ending';
    const ending=run.branchEnding||Epic.branchEnding?.(ch,run)||Content74?.branchEnding?.(ch,run)||{title:'聚義功成',text:'本回風波已平。'};
    app.innerHTML=`${topbar('章回完成')}${nav()}<main id="mainContent"><section class="ending"><span class="eyebrow">CHAPTER COMPLETE</span><div class="grade huge ${run.grade}">${run.grade}</div><h1>第 ${ch.number} 回完成</h1><h2>${esc(ch.title)}</h2><p>分數 ${run.score}・行動 ${run.stats.actions}・完整回合 ${run.stats.rounds}・銀兩 ${run.silverEarned}</p><section class="card branch-ending"><span class="eyebrow">BRANCH ENDING</span><h2>${esc(ending.title)}</h2><p>${esc(ending.text)}</p></section>${Chain79?`<section class="card chain-summary"><span class="eyebrow">CHAIN IMPACT</span><h2>章回連鎖影響</h2><p>${esc(Chain79.endingHint?.(state)||'完成更多章回可累積長篇影響。')}</p></section>`:''}<div class="achievement-grid">${run.achievements.map(x=>`<div class="achievement"><span class="medal">🏅</span><div><b>${esc(x)}</b><p>本次章回已解鎖</p></div></div>`).join('')}</div><div class="actions"><button class="btn primary" data-act="next">下一回</button><button class="btn" data-act="replay">重新挑戰</button><button class="btn" data-act="heroes">培養主角</button><button class="btn" data-act="home">返回首頁</button></div></section></main>`;
  }
  function renderTeam(){
    screen='team';clearAutoTimer();const unlocked=chapters.filter(ch=>heroUnlocked(ch.number));const bonds=activeBonds();
    const stratOptions=[['balanced','均衡'],['aggressive','猛攻'],['safe','穩健'],['boss','首領戰'],['control','控場']];
    const targetOptions=[['dangerous','優先高威脅'],['lowest','優先殘血'],['boss','優先首領'],['caster','優先術士／遠程']];
    app.innerHTML=`${topbar('多套編隊')}${nav()}<main id="mainContent"><section class="page-head"><div><span class="eyebrow">FORMATION & TACTICAL AI</span><h1>三套戰略編隊</h1><p>保存三套前後排隊伍，並設定自動戰鬥的目標與資源使用原則。</p></div></section><div class="formation-tabs">${state.formations.map((p,i)=>`<button class="btn ${i===state.activeFormation?'primary':''}" data-plan="${i}">${esc(p.name)}</button>`).join('')}</div><section class="card formation-board"><label>隊伍名稱<input class="field" data-plan-name="${state.activeFormation}" value="${esc(currentPlan().name)}"></label><div class="formation-row"><b>前排</b>${[0,1].map(i=>formationSlot('front',i,unlocked)).join('')}</div><div class="formation-row"><b>後排</b>${[0,1].map(i=>formationSlot('back',i,unlocked)).join('')}</div></section><div class="grid two" style="margin-top:16px"><section class="card"><h2>戰術 AI 指令</h2><label>戰術風格<select class="field" id="aiStrategy">${stratOptions.map(([k,n])=>`<option value="${k}" ${prefs.autoStrategy===k?'selected':''}>${n}</option>`).join('')}</select></label><label>目標優先<select class="field" id="aiTarget">${targetOptions.map(([k,n])=>`<option value="${k}" ${prefs.targetPriority===k?'selected':''}>${n}</option>`).join('')}</select></label><label>低於多少氣血使用藥品 <input class="field" id="aiMedicineThreshold" type="number" min="10" max="80" value="${Math.round((prefs.medicineThreshold||.35)*100)}"></label><label class="check-row"><input id="aiReserveUltimate" type="checkbox" ${prefs.reserveUltimate?'checked':''}> 首領換階前保留覺醒技</label><label class="check-row"><input id="aiUseMedicine" type="checkbox" ${prefs.useMedicine?'checked':''}> 允許自動使用藥品</label></section><section class="card"><h2>啟動羈絆</h2>${bonds.length?bonds.map(b=>`<div class="achievement"><span class="medal">🤝</span><div><b>${esc(b.name)}</b><p>${esc(b.text)}</p></div></div>`).join(''):'<p>尚未啟動羈絆。</p>'}<div class="actions"><button class="btn" data-act="chapters">選擇章回</button><button class="btn" data-act="heroes">配置技能</button></div></section></div></main>`;
  }
  function formationSlot(row,index,unlocked){const n=currentPlan()[row][index];return`<label class="formation-slot"><span class="avatar">${esc(chapter(n).name[0])}</span><div><b>${row==='front'?'前排':'後排'} ${index+1}</b><select class="field" data-formation="${row}-${index}">${unlocked.map(c=>`<option value="${c.number}" ${c.number===n?'selected':''}>${c.number}. ${esc(c.nickname)}・${esc(c.name)}（Lv.${getHero(c.number).level}${getHero(c.number).awakened?'・覺醒':''}）</option>`).join('')}</select><small>${esc(heroKit(n).passiveName)}</small></div></label>`;}

  function renderHeroes(){screen='heroes';clearAutoTimer();const q=heroSearch.trim().toLowerCase();const all=chapters.filter(ch=>heroUnlocked(ch.number)&&(!q||`${ch.number}${ch.name}${ch.nickname}${ch.title}`.toLowerCase().includes(q)));const pageSize=prefs.lowPower?12:24;const pages=Math.max(1,Math.ceil(all.length/pageSize));heroPage=clamp(heroPage,1,pages);const list=all.slice((heroPage-1)*pageSize,heroPage*pageSize);app.innerHTML=`${topbar('英雄真傳')}${nav()}<section class="page-head"><div><span class="eyebrow">108 TRUE HEROES</span><h1>百八英雄專屬技能與真傳裝備</h1><p>36 天罡與 72 地煞皆具有獨立技能資料、被動與機制簽章；可鍛造英雄專屬裝備。</p></div><input class="field hero-search" id="heroSearch" placeholder="搜尋英雄" value="${esc(heroSearch)}"></section>${materialsBar()}<div class="pagination"><button class="btn small" data-hero-page="${heroPage-1}" ${heroPage<=1?'disabled':''}>上一頁</button><span>第 ${heroPage}/${pages} 頁・${all.length} 名</span><button class="btn small" data-hero-page="${heroPage+1}" ${heroPage>=pages?'disabled':''}>下一頁</button></div><div class="hero-growth-grid">${list.map(heroGrowthCard).join('')}</div>`;}
  function heroGrowthCard(ch){
    const h=getHero(ch.number);const kit=heroKit(ch.number);const set=equipmentSetBonus(ch.number);
    const slotLine=EQUIPMENT_TYPES.map(type=>{const item=getItem(h.equipment[type]);return`<div class="equip-slot"><span>${EQUIPMENT_LABELS[type]}</span><b>${item?`${item.icon||''} ${esc(item.name)} +${item.level}`:'未裝備'}</b><button class="btn tiny" data-equip-manual="${type}" data-hero="${ch.number}">選擇</button></div>`;}).join('');
    return`<article class="card growth-card"><div class="portrait">${portraitMarkup(ch.number)}<div><span class="tag accent">${esc(kindData(ch).label)}</span><h3>${esc(ch.nickname)}・${esc(ch.name)} ${h.awakened?'✦':''}</h3><p>Lv.${h.level}・技能點 ${h.skillPoints}</p></div></div><div class="statline"><span>經驗</span><div class="bar sp"><i style="width:${pct(h.xp,xpNeeded(h.level))}%"></i></div><b>${h.xp}/${xpNeeded(h.level)}</b></div><div class="passive-box"><b>${kit.icon} ${esc(kit.passiveName)}</b><small>${esc(kit.passiveText)}</small></div><div class="awakening-box ${h.awakened?'awakened':''}"><b>${h.awakened?'✦ 已覺醒':'◇ 尚未覺醒'}：${esc(kit.awakeningName)}</b><small>${esc(kit.awakeningText)}</small></div>${Object.entries(TREE_OPTIONS).map(([key,tree])=>skillBranchHtml(ch.number,h,key,tree)).join('')}<div class="six-slot-grid">${slotLine}</div><p class="muted">${set?`套裝：${esc(set.name)}；${set.active.map(x=>`${x.name} ${x.count} 件`).join('、')}`:'尚未啟動套裝效果'}</p><div class="actions"><button class="btn small" data-equip-best="${ch.number}">一鍵最佳</button><button class="btn small danger" data-reset-tree="${ch.number}">重置技能</button><button class="btn small accent" data-awaken="${ch.number}" ${h.awakened?'disabled':''}>覺醒</button><button class="btn small good" data-exclusive="${ch.number}" ${state.inventory.items.some(x=>x.exclusiveHero===ch.number)?'disabled':''}>鍛造專武</button></div></article>`;
  }
  function skillBranchHtml(number,h,key,tree){const node=h.tree[key];return`<div class="branch-row"><b>${tree.name} ${node.rank}/3</b>${tree.options.map(o=>`<button class="tree-node ${node.branch===o.key?'selected':''}" data-talent="${key}:${o.key}" data-hero="${number}" ${h.skillPoints<=0||node.rank>=3||(node.branch&&node.branch!==o.key)?'disabled':''}>${esc(o.name)}<small>${esc(o.text)}</small></button>`).join('')}</div>`;}

  function renderForge(){
    screen='forge';clearAutoTimer();const filtered=state.inventory.items.filter(x=>(forgeFilter==='all'||x.type===forgeFilter)&&(forgeRarity==='all'||x.rarity===forgeRarity)).sort((a,b)=>itemPower(b)-itemPower(a));const pageSize=prefs.lowPower?16:30,pages=Math.max(1,Math.ceil(filtered.length/pageSize));forgePage=clamp(forgePage,1,pages);const items=filtered.slice((forgePage-1)*pageSize,forgePage*pageSize);
    const plans=(state.equipmentPlans||Ops.freshLoadouts()).map((p,i)=>`<article class="loadout-card"><b>${esc(p.name)}</b><small>${p.savedAt?`保存 ${esc(p.savedAt.slice(0,16).replace('T',' '))}`:'尚未保存'}</small><div class="actions"><button class="btn small" data-loadout-save="${i}">保存目前隊伍</button><button class="btn small primary" data-loadout-apply="${i}" ${p.savedAt?'':'disabled'}>套用</button></div></article>`).join('');
    app.innerHTML=`${topbar('六部位裝備')}${nav()}<main id="mainContent"><section class="page-head"><div><span class="eyebrow">FORGE, LOADOUT & BATCH</span><h1>六部位鍛造、裝備方案與批次管理</h1><p>三套裝備方案可跟著隊伍快速切換；每部位第 10 次未出傳說時觸發保底。</p></div></section>${materialsBar()}<section class="card"><h2>裝備方案</h2><div class="loadout-grid">${plans}</div></section><div class="craft-grid">${EQUIPMENT_TYPES.map(type=>{const c=craftCost(type),pity=state.inventory.pity[type]||0;return`<button class="btn craft-btn" data-craft="${type}"><b>${EQUIPMENT_LABELS[type]}</b><small>${c.silver} 銀兩・保底 ${pity}/9</small></button>`;}).join('')}</div><div class="filter-summary"><button class="btn small ${forgeFilter==='all'?'primary':''}" data-forge-filter="all">全部</button>${EQUIPMENT_TYPES.map(type=>`<button class="btn small ${forgeFilter===type?'primary':''}" data-forge-filter="${type}">${EQUIPMENT_LABELS[type]}</button>`).join('')}<select class="field compact" id="forgeRarity"><option value="all">全部稀有度</option><option value="common" ${forgeRarity==='common'?'selected':''}>凡品</option><option value="rare" ${forgeRarity==='rare'?'selected':''}>精良</option><option value="epic" ${forgeRarity==='epic'?'selected':''}>傳說</option></select><button class="btn small" data-act="select-visible-items">選取本頁可分解</button><button class="btn small" data-act="select-common">選取全部未鎖凡品</button><button class="btn small" data-act="batch-lock" ${selectedForgeItems.size?'':'disabled'}>批次鎖定</button><button class="btn small" data-act="batch-unlock" ${selectedForgeItems.size?'':'disabled'}>批次解鎖</button><button class="btn small danger" data-act="batch-dismantle" ${selectedForgeItems.size?'':'disabled'}>批次分解 ${selectedForgeItems.size}</button><button class="btn small" data-act="buy-medicine">購買金瘡藥</button></div><div class="set-guide">${Object.values(SETS).map(s=>`<div class="tag"><b>${esc(s.name)}</b>：2 件 ${esc(s.two)}；4 件 ${esc(s.four)}</div>`).join('')}</div><div class="pagination"><button class="btn small" data-forge-page="${forgePage-1}" ${forgePage<=1?'disabled':''}>上一頁</button><span>第 ${forgePage}/${pages} 頁・${filtered.length} 件</span><button class="btn small" data-forge-page="${forgePage+1}" ${forgePage>=pages?'disabled':''}>下一頁</button></div><div class="equipment-grid">${items.map(itemCard).join('')||'<p class="empty">尚無此類裝備。</p>'}</div></main>`;
  }

  function itemCard(item){
    const stats=itemStats(item);const owner=item.equippedBy?chapter(item.equippedBy).name:'';const set=item.setKey?SETS[item.setKey]:null;const exclusive=item.exclusiveHero?chapter(item.exclusiveHero):null;
    const affixes=(item.affixes||[]).map(a=>`${esc(a.name)} ${Number(a.value)<1?Math.round(Number(a.value)*100)+'%':Math.round(Number(a.value))}`).join('・');
    return`<article class="equipment-card ${RARITIES[item.rarity].color} ${item.locked?'locked':''}"><label class="item-select"><input type="checkbox" data-select-item="${item.id}" ${selectedForgeItems.has(item.id)?'checked':''} ${(owner||item.locked||exclusive)?'disabled':''}><span class="sr-only">選取 ${esc(item.name)}</span></label><div class="equipment-icon">${item.icon||'🎒'}</div><div><span class="tag ${RARITIES[item.rarity].color}">${RARITIES[item.rarity].name}</span><span class="tag">${EQUIPMENT_LABELS[item.type]}</span>${set?`<span class="tag good">${esc(set.name)}</span>`:''}${exclusive?`<span class="tag accent">${esc(exclusive.name)}專屬</span>`:''}<h3>${esc(item.name)} +${item.level} ${item.locked?'🔒':''}</h3><p>${Object.entries(stats).map(([k,v])=>`${({atk:'攻擊',def:'防禦',hp:'生命',sp:'豪氣',crit:'暴擊',status:'狀態率',speed:'速度',heal:'治療',evade:'閃避',block:'格擋'})[k]||k} ${['crit','status','evade','block'].includes(k)?Math.round(v*100)+'%':Math.round(v)}`).join('・')}</p>${affixes?`<small>副屬性：${affixes}</small>`:''}<small>${owner?`已由 ${esc(owner)} 裝備`:'未裝備'}・戰力 ${Math.round(itemPower(item))}・重鑄 ${item.reforges||0} 次</small></div><div class="equipment-actions"><button class="btn tiny" data-lock-item="${item.id}">${item.locked?'解鎖':'鎖定'}</button><button class="btn tiny" data-reforge-item="${item.id}" ${item.rarity==='common'?'disabled':''}>重鑄</button><button class="btn tiny" data-upgrade-item="${item.id}" ${item.level>=5?'disabled':''}>強化</button><button class="btn tiny danger" data-dismantle="${item.id}" ${(owner||item.locked||exclusive)?'disabled':''}>分解</button></div></article>`;
  }

  function renderBase(){
    screen='base';clearAutoTimer();accrueProduction();const unclaimed=state.base.unclaimed,slots=dispatchSlots(),busy=new Set(state.dispatches.map(x=>x.hero)),heroes=chapters.filter(c=>heroUnlocked(c.number)&&!busy.has(c.number)),cap=Ops.economyCap(state.base);
    app.innerHTML=`${topbar('梁山寨')}${nav()}<main id="mainContent"><section class="page-head"><div><span class="eyebrow">BASE PRODUCTION & DISPATCH</span><h1>山寨建設、資源生產與英雄派遣</h1><p>離線收益上限依聚義廳等級為 ${cap} 小時；派遣會累積疲勞，疲勞會降低收益與奇遇率。</p></div><button class="btn primary" data-act="claim-production">領取生產資源</button></section>${materialsBar()}<section class="card production-card"><h2>待領生產</h2><div class="materials-bar"><span>銀兩 ${unclaimed.silver||0}</span><span>鐵礦 ${unclaimed.iron||0}</span><span>木材 ${unclaimed.wood||0}</span><span>布料 ${unclaimed.cloth||0}</span><span>上限 ${cap} 小時</span></div></section><div class="base-grid">${Object.entries(BUILDINGS).map(([k,b])=>buildingCard(k,b)).join('')}</div><section class="card" style="margin-top:16px"><h2>英雄派遣 ${state.dispatches.length}/${slots}</h2><div class="dispatch-grid">${state.dispatches.map(d=>{const m=EndgameData.dispatchMissions.find(x=>x.key===d.mission),ready=dispatchRemaining(d)<=0,fat=state.base.fatigue?.[String(d.hero)]||0;return`<article class="dispatch-card"><b>${esc(chapter(d.hero).name)}・${esc(m?.name||d.mission)}</b><p>${ready?'任務完成，可領取。':`剩餘 ${formatDuration(dispatchRemaining(d))}`}・適性 ${esc(d.aptitude||dispatchAptitude(d.hero,d.mission).label)}・疲勞 ${fat}</p><div class="actions"><button class="btn small ${ready?'good':''}" data-claim-dispatch="${d.id}" ${ready?'':'disabled'}>領取</button><button class="btn small danger" data-cancel-dispatch="${d.id}">取消</button></div></article>`;}).join('')||'<p>目前沒有派遣中的英雄。</p>'}</div>${state.dispatches.length<slots?`<div class="dispatch-form"><label>任務<select class="field" id="dispatchMission">${EndgameData.dispatchMissions.map(m=>`<option value="${m.key}">${esc(m.name)}・${m.minutes} 分鐘</option>`).join('')}</select></label><label>英雄<select class="field" id="dispatchHero">${heroes.map(c=>{const a=dispatchAptitude(c.number,EndgameData.dispatchMissions[0]?.key),fat=state.base.fatigue?.[String(c.number)]||0;return`<option value="${c.number}" ${fat>=80?'disabled':''}>${c.number}. ${esc(c.name)} Lv.${getHero(c.number).level}・${a.label}・疲勞 ${fat}</option>`;}).join('')}</select></label><button class="btn primary" data-act="start-dispatch" ${heroes.some(c=>(state.base.fatigue?.[String(c.number)]||0)<80)?'':'disabled'}>開始派遣</button></div>`:''}</section>${Array.isArray(state.base.dispatchLog)&&state.base.dispatchLog.length?`<section class="card" style="margin-top:16px"><h2>最近派遣奇遇</h2>${state.base.dispatchLog.slice(0,6).map(x=>`<p>${esc(chapter(x.hero).name)}：${esc(x.text)}</p>`).join('')}</section>`:''}</main>`;
  }

  function buildingCard(key,b){const lv=buildingLevel(key);const c=buildingCost(key);const mat=c.material==='iron'?'鐵礦':c.material==='wood'?'木材':'布料';return`<article class="card building-card"><div class="building-icon">${b.icon}</div><div><span class="tag accent">Lv.${lv}/5</span><h2>${esc(b.name)}</h2><p>${esc(b.text)}</p><div class="level-pips">${[1,2,3,4,5].map(n=>`<i class="${n<=lv?'on':''}"></i>`).join('')}</div><small>${buildingEffect(key,lv)}</small></div><button class="btn primary" data-building="${key}" ${lv>=5?'disabled':''}>${lv>=5?'已滿級':`升級：${c.silver} 銀兩＋${c.amount} ${mat}${c.essence?`＋${c.essence} 精華`:''}`}</button></article>`;}
  function buildingEffect(key,lv){return({hall:`全隊生命＋${lv*2.5}%，經驗＋${lv*4}%`,smithy:`裝備能力＋${lv*2}，高稀有率提升`,infirmary:`藥品治療＋${lv*45}`,stable:`速度＋${lv*3}、初始豪氣與自動戰鬥效率提升`,waterCamp:`水軍與後排傷害＋${lv*2.5}%`,intelligence:`暴擊＋${lv}%並顯示首領階段與推薦職業`})[key];}

  function runBalanceSimulation(){
    const records={...(Tiangang.records||{}),...(Dizha.records||{})};const report=Balance?.simulate?.(records,12)||Telemetry.simulate(records,500);state.telemetry.lastSimulation=report;state.operations.lastBalanceAt=now();save(true);renderEndgame();
    const strong=(report.rows||[]).filter(x=>x.band==='偏強').slice(0,8),weak=(report.rows||[]).filter(x=>x.band==='偏弱').slice(0,8);
    openModal('百八英雄正式平衡模擬',`<p>以 108 名英雄 × ${report.scenarios||12} 種戰鬥情境估算；平均 ${report.mean}，標準差 ${report.sd}。</p><div class="compare-grid"><section><h3>仍需觀察偏強</h3>${strong.map(x=>`<p>${x.number}. ${esc(x.name)}・${x.score}</p>`).join('')||'<p>無明顯偏強</p>'}</section><section><h3>仍需觀察偏弱</h3>${weak.map(x=>`<p>${x.number}. ${esc(x.name)}・${x.score}</p>`).join('')||'<p>無明顯偏弱</p>'}</section></div><p class="muted">已套用 v7.8.0 第三輪係數，但自動估算仍不取代真人長期遊玩。</p><div class="actions"><button class="btn" data-modal="close">關閉</button></div>`);
  }

  function renderEndgame(){
    screen='endgame';clearAutoTimer();const floor=state.endgame.towerFloor||1,td=EndgameData.towerFloor(floor),completed=Object.keys(state.completed).map(Number).sort((a,b)=>a-b),wk=Rogue?.weekly?.(),wkDone=Boolean(state.endgame.weekly?.[wk?.key]?.completed),rr=state.endgame.rogue,node=Rogue?.currentNode?.(rr),choices=rr&&!node?Rogue.pathChoices?.(rr)||[]:[],tel=state.telemetry||{};
    const typeName=x=>({battle:'戰鬥',elite:'精英',boss:'首領',event:'事件',rest:'休息',shop:'商店'})[x]||x;
    app.innerHTML=`${topbar('遠征挑戰')}${nav()}<main id="mainContent"><section class="page-head"><div><span class="eyebrow">BRANCHING ROGUE & WEEKLY</span><h1>分岔遠征、每週挑戰與戰鬥統計</h1><p>每層可在三條路線中選擇風險與獎勵；挑戰碼可用於重現本週路線。</p></div></section>${materialsBar()}<div class="grid three"><section class="card endgame-card"><span class="eyebrow">ROGUE-LIKE</span><h2>${rr?'進行中的分岔遠征':'建立隨機遠征'}</h2>${rr?`<p>挑戰碼 ${esc(rr.challengeCode||'')}・第 ${rr.nodeIndex+1}/${rr.nodes.length} 層・容錯 ${rr.hpReserve}・遺物 ${(rr.relics||[]).length}</p><div class="rogue-map">${rr.nodes.map((f,i)=>`<span class="rogue-node ${f.cleared?'done':i===rr.nodeIndex?'current':''}">${i+1}</span>`).join('')}</div>${node?`<p>目前：${typeName(node.type)}・${esc(node.risk||'')}・章回 ${node.chapter}</p><button class="btn primary" data-act="resolve-rogue-node">處理目前節點</button>`:`<div class="rogue-branches">${choices.map((x,i)=>`<button class="choice-card" data-rogue-path="${i}"><b>${typeName(x.type)}・${esc(x.risk)}</b><small>章回 ${x.chapter}・獎勵 ${x.reward}</small></button>`).join('')}</div>${rr.rerolls?'<button class="btn small" data-act="rogue-reroll">重抽本層</button>':''}`}<button class="btn danger" data-act="abandon-rogue">放棄</button>`:`<p>十層分岔路線包含戰鬥、精英、事件、休息、商店與終局首領。</p><button class="btn primary" data-act="start-rogue">生成本週路線</button>`}</section><section class="card endgame-card"><span class="eyebrow">WEEKLY CHALLENGE</span><h2>${esc(wk?.modifier?.name||'每週試煉')}</h2><p>${esc(wk?.modifier?.text||'')}</p><p>${wk?.key||''}・章回 ${wk?.chapter||1}・挑戰碼 ${esc(wk?.challengeCode||'')}・${wkDone?'本週已完成':'尚未完成'}</p><button class="btn ${wkDone?'good':'primary'}" data-special="weekly" data-key="${wk?.key||''}" ${wkDone?'disabled':''}>${wkDone?'已完成':'開始挑戰'}</button></section><section class="card endgame-card"><span class="eyebrow">BALANCE LAB</span><h2>戰鬥統計與正式平衡</h2><p>戰鬥 ${tel.battles||0}・勝利 ${tel.wins||0}・失敗 ${tel.losses||0}・平均回合 ${tel.battles?((tel.totalRounds||0)/tel.battles).toFixed(1):'—'}</p><p>上次模擬：${tel.lastSimulation?new Date(tel.lastSimulation.generatedAt).toLocaleString('zh-TW'):'尚未執行'}</p><button class="btn" data-act="run-balance">執行 108×12 情境模擬</button></section></div><div class="grid three" style="margin-top:16px"><section class="card endgame-card"><span class="eyebrow">ENDLESS TOWER</span><h2>無盡塔第 ${floor} 層</h2><p>${esc(td.modifier.name)}：${esc(td.modifier.text)}</p><p>最佳 ${state.endgame.towerBest||0} 層・獎勵 ${td.reward.silver} 銀兩、${td.reward.essence} 精華</p><button class="btn primary" data-special="tower" data-key="${floor}">挑戰本層</button></section><section class="card endgame-card"><span class="eyebrow">CLASSIC EXPEDITIONS</span><h2>固定路線遠征</h2>${state.endgame.expedition?`<p>進行中：${esc(EndgameData.routes.find(x=>x.key===state.endgame.expedition.route)?.name||'遠征')}，已完成 ${state.endgame.expedition.progress} 戰。</p><button class="btn primary" data-special="expedition" data-key="${state.endgame.expedition.route}">繼續遠征</button>`:'<p>保留六條可預期獎勵的固定遠征路線。</p>'}</section><section class="card endgame-card"><span class="eyebrow">BOSS REMATCH</span><h2>首領再戰</h2><select class="field" id="rematchChapter" aria-label="選擇首領再戰章回">${completed.map(n=>`<option value="${n}">第 ${n} 回・最佳 ${state.endgame.bossRecords[String(n)]?.bestRounds||'—'} 回合</option>`).join('')||'<option value="">尚無已完成章回</option>'}</select><button class="btn" data-act="start-rematch" ${completed.length?'':'disabled'}>開始再戰</button></section></div><section class="card" style="margin-top:16px"><h2>固定遠征路線</h2><div class="route-grid">${EndgameData.routes.map(r=>`<article class="route-card"><span class="route-icon">${r.icon}</span><h3>${esc(r.name)}</h3><p>${esc(r.text)}</p><small>${r.battles} 戰・獎勵 ${r.reward.silver} 銀兩</small><button class="btn" data-special="expedition" data-key="${r.key}" ${state.endgame.expedition&&state.endgame.expedition.route!==r.key?'disabled':''}>${state.endgame.expedition?.route===r.key?'繼續':'出發'}</button></article>`).join('')}</div></section></main>`;
  }

  function cloudExportPayload(){return{version:VERSION,schemaVersion:SaveSchema?.SCHEMA_VERSION||6,exportedAt:now(),state:clone(state),prefs:clone(prefs)};}
  async function cloudUpload(){try{const payload=cloudExportPayload();const sum=await SaveSchema.checksum(payload.state);await Cloud.upload(payload,sum,VERSION,`完成 ${completionCount()}/108・裝備 ${state.inventory.items.length}`);state.cloud.lastSyncAt=now();state.cloud.lastChecksum=sum;save(true);await cloudLoadHistory(false);renderCloud();toast('本機進度已上傳 Firebase，並建立雲端版本歷史。','good');}catch(error){toast(`雲端上傳失敗：${error.message}`,'warn');}}
  async function cloudDownloadPreview(){try{const remote=await Cloud.download();if(!remote)return toast('雲端尚無存檔。','warn');openCloudCompare(remote,'main');}catch(error){toast(`雲端下載失敗：${error.message}`,'warn');}}
  async function openCloudCompare(remote,source='main'){
    const checked=SaveSchema.validateExport(remote.payload);if(!checked.ok)throw new Error(checked.errors.join('、'));const sum=await SaveSchema.checksum(checked.state);if(remote.checksum&&sum!==remote.checksum)throw new Error('雲端校驗碼不一致。');
    const cmp=SaveSchema.compare(state,checked.state),diff=SaveSchema.diff?.(state,checked.state)||{},rows=Object.entries(cmp.fields||{}).map(([k,v])=>`<tr><th>${({completed:'完成章回',heroes:'英雄資料',items:'裝備數',silver:'銀兩',tower:'無盡塔'})[k]||k}</th><td>${v[0]}</td><td>${v[1]}</td></tr>`).join('');
    openModal(source==='main'?'雲端存檔合併預覽':'雲端歷史版本預覽',`<div class="compare-grid"><section><h3>本機</h3><p>完成 ${cmp.localCompleted}/108</p><p>${esc(cmp.localUpdatedAt||'無時間')}</p></section><section><h3>雲端</h3><p>完成 ${cmp.cloudCompleted}/108</p><p>${esc(cmp.cloudUpdatedAt||remote.updatedAt||'無時間')}</p></section></div><table class="data-table"><thead><tr><th>欄位</th><th>本機</th><th>雲端</th></tr></thead><tbody>${rows}</tbody></table><div class="merge-preview"><p><b>僅本機章回：</b>${(diff.localOnlyChapters||[]).slice(0,18).join('、')||'無'}</p><p><b>僅雲端章回：</b>${(diff.cloudOnlyChapters||[]).slice(0,18).join('、')||'無'}</p><p><b>裝備：</b>本機獨有 ${diff.localOnlyItems||0}、雲端獨有 ${diff.cloudOnlyItems||0}、同 ID 差異 ${diff.conflictingItems||0}</p><p><b>英雄等級差異：</b>${diff.heroLevelDiffs||0} 名</p></div><p>智慧合併會保留較高章回分數、較高英雄等級、裝備唯一 ID 聯集、較高建築與長期紀錄；套用前會建立本機備份。</p><textarea id="cloudPayload" hidden>${esc(JSON.stringify(remote.payload))}</textarea><div class="actions"><button class="btn primary" data-modal="cloud-merge">智慧合併</button><button class="btn" data-modal="cloud-apply">完全使用雲端</button><button class="btn" data-modal="close">保留本機</button></div>`);
  }

  async function cloudLoadHistory(showToast=true){try{const list=await Cloud.listHistory(10);state.cloud.history=list.map(x=>({id:x.id,label:x.label,version:x.version,updatedAt:x.updatedAt,checksum:x.checksum}));save(true,false);if(showToast)toast(`已讀取 ${list.length} 份雲端歷史版本。`,'good');return list;}catch(error){if(showToast)toast(`讀取歷史失敗：${error.message}`,'warn');return[];}}
  async function cloudOpenHistory(id){try{const remote=await Cloud.downloadHistory(id);if(!remote)return toast('找不到此歷史版本。','warn');await openCloudCompare(remote,'history');}catch(error){toast(`歷史版本讀取失敗：${error.message}`,'warn');}}
  async function cloudRunDiagnostics(){const result=await Cloud.diagnostics();state.cloud.lastDiagnostics={...result,at:now()};save(true,false);renderCloud();toast(result.firestore?`Firebase 真實連線成功，延遲 ${result.latencyMs} ms。`:`Firebase 診斷未通過：${result.error||'尚未設定或登入'}`,result.firestore?'good':'warn');}
  function renderCloud(){
    screen='cloud';clearAutoTimer();const st=Cloud?.getStatus?.()||{},diag=state.cloud.lastDiagnostics,deploy=state.operations?.deployment;
    app.innerHTML=`${topbar('雲端傳承')}${nav()}<main id="mainContent"><section class="page-head"><div><span class="eyebrow">FIREBASE HISTORY & LIVE OPERATIONS</span><h1>跨裝置雲端存檔、版本歷史與營運診斷</h1><p>未設定 Firebase 時仍可完全離線遊玩。真正公開上線與三平台驗收必須在你的 GitHub、Firebase 與實機環境完成。</p></div></section><div class="grid two"><section class="card"><h2>Firebase 專案設定</h2><label>API Key<input class="field" id="firebaseApiKey" value="${esc(Cloud?.getConfig?.()?.apiKey||'')}" autocomplete="off"></label><label>Project ID<input class="field" id="firebaseProjectId" value="${esc(Cloud?.getConfig?.()?.projectId||'')}" autocomplete="off"></label><label>Auth Domain（選填）<input class="field" id="firebaseAuthDomain" value="${esc(Cloud?.getConfig?.()?.authDomain||'')}" autocomplete="off"></label><div class="actions"><button class="btn primary" data-act="cloud-configure">儲存設定</button><button class="btn" data-act="cloud-diagnostics" ${st.configured?'':'disabled'}>Firebase 真實連線診斷</button><button class="btn danger" data-act="cloud-clear">清除設定</button></div>${diag?`<p class="${diag.firestore?'success':'warning-banner'}">最近 Firebase 診斷：Auth ${diag.auth?'通過':'未通過'}・Firestore ${diag.firestore?'通過':'未通過'}${diag.latencyMs?`・${diag.latencyMs} ms`:''}${diag.error?`・${esc(diag.error)}`:''}</p>`:''}</section><section class="card"><h2>帳號與同步</h2>${st.signedIn?`<p>已登入：<b>${esc(st.email)}</b></p><p>上次同步：${esc(state.cloud.lastSyncAt||'尚未同步')}</p><div class="actions"><button class="btn primary" data-act="cloud-upload">上傳並建立版本</button><button class="btn" data-act="cloud-download">比較主存檔</button><button class="btn" data-act="cloud-history">讀取版本歷史</button><button class="btn danger" data-act="cloud-signout">登出</button></div>`:`<label>電子郵件<input class="field" id="cloudEmail" type="email" autocomplete="username"></label><label>密碼<input class="field" id="cloudPassword" type="password" minlength="6" autocomplete="current-password"></label><div class="actions"><button class="btn primary" data-act="cloud-signin" ${st.configured?'':'disabled'}>登入</button><button class="btn" data-act="cloud-signup" ${st.configured?'':'disabled'}>建立帳號</button></div>${st.configured?'':'<p class="warning-banner">請先填入 Firebase 專案設定。</p>'}`}</section></div><section class="card" style="margin-top:16px"><h2>雲端版本歷史</h2>${state.cloud.history?.length?`<div class="history-list">${state.cloud.history.map(x=>`<button class="history-item" data-cloud-history="${esc(x.id)}"><b>${esc(x.label||'雲端版本')}</b><small>v${esc(x.version||'')}・${esc(x.updatedAt||'')}</small></button>`).join('')}</div>`:'<p>登入後按「讀取版本歷史」，即可查看最近十份雲端存檔並預覽還原差異。</p>'}</section><section class="card" style="margin-top:16px"><h2>公開部署與三平台診斷</h2><div class="actions"><button class="btn primary" data-act="deployment-doctor">執行目前環境診斷</button><a class="btn" href="LIVE_DEPLOYMENT_CHECKLIST.md" target="_blank" rel="noopener">正式上線清單</a><a class="btn" href="SCREEN_READER_CHECKLIST.md" target="_blank" rel="noopener">真人無障礙清單</a></div>${deploy?`<p>最近診斷：${deploy.passed}/${deploy.total} 通過・${esc(deploy.at)}</p><div class="deployment-grid">${deploy.rows.map(x=>`<article class="diag-row ${x.ok?'ok':'bad'}"><b>${x.ok?'✓':'!'} ${esc(x.name)}</b><small>${esc(x.detail||'')}</small></article>`).join('')}</div>`:'<p class="muted">診斷會檢查 HTTPS、Service Worker、IndexedDB、Manifest、安裝模式、Firebase 設定與登入；不會假裝代替實機驗收。</p>'}</section></main>`;
  }

  function openAccessibility(){openModal('無障礙與顯示設定',`<label class="check-row"><input id="a11yContrast" type="checkbox" ${prefs.highContrast?'checked':''}> 高對比模式</label><label class="check-row"><input id="a11yMotion" type="checkbox" ${prefs.reducedMotion?'checked':''}> 減少動畫</label><label>文字大小<select class="field" id="a11yFont"><option value=".9" ${prefs.fontScale==.9?'selected':''}>較小</option><option value="1" ${prefs.fontScale==1?'selected':''}>標準</option><option value="1.15" ${prefs.fontScale==1.15?'selected':''}>較大</option><option value="1.3" ${prefs.fontScale==1.3?'selected':''}>最大</option></select></label><label class="check-row"><input id="a11yHints" type="checkbox" ${prefs.keyboardHints?'checked':''}> 顯示鍵盤快捷鍵</label><label class="check-row"><input id="a11yReader" type="checkbox" ${prefs.screenReaderMode?'checked':''}> 螢幕閱讀器精簡播報</label><label class="check-row"><input id="a11yLowPower" type="checkbox" ${prefs.lowPower?'checked':''}> 低效能手機模式</label><p>戰鬥快捷鍵：1 普攻、2 專屬技、3 覺醒技、4 守勢、5 藥品、0 合擊；H 首頁、C 章回、T 編隊、E 裝備、Esc 關閉視窗。</p><div class="actions"><button class="btn primary" data-modal="a11y-save">套用</button><button class="btn" data-modal="close">取消</button></div>`);}
  function openTutorial(){
    const t=currentTutorial(),steps=Ops.tutorialSteps||[],step=steps[Math.min(t.step||0,steps.length-1)];if(!step)return;
    openModal(`新手教學 ${Math.min((t.step||0)+1,steps.length)}/${steps.length}・${esc(step.title)}`,`<p>${esc(step.text)}</p><p class="muted">目前已完成 ${completionCount()} 回；功能會依進度自動解鎖。</p><div class="actions"><button class="btn primary" data-modal="tutorial-go" data-target="${step.target}">前往操作</button><button class="btn" data-modal="tutorial-next">我已了解</button><button class="btn" data-modal="tutorial-dismiss">暫時略過</button></div>`);
  }
  function tutorialNext(){const t=currentTutorial(),steps=Ops.tutorialSteps||[];t.seen=Array.from(new Set([...(t.seen||[]),steps[t.step]?.key].filter(Boolean)));t.step=Math.min(steps.length,(t.step||0)+1);t.dismissed=false;if(t.step>=steps.length)t.completed=true;save(true);closeModal();render();if(!t.completed)openTutorial();else toast('新手教學已完成，所有說明可從首頁重新查看。','good');}
  async function runDeploymentDoctor(){const result=await Ops.liveDiagnostics(Cloud);state.operations.deployment=result;save(true,false);renderCloud();toast(`營運診斷：${result.passed}/${result.total} 通過。`,result.passed===result.total?'good':'warn');}


  function reportRows(report){return report?.rows?.length?`<div class="deployment-grid">${report.rows.map(x=>`<article class="diag-row ${x.ok?'ok':'bad'}"><b>${x.ok?'✓':'!'} ${esc(x.name)}</b><small>${esc(x.detail||'')}</small></article>`).join('')}</div>`:'<p class="muted">尚未執行。</p>';}
  function renderOps(){
    screen='ops';clearAutoTimer();const reports=state.operations.v79Reports||{};const version=reports.version, sw=reports.sw, migration=reports.migration, deploy=reports.deployment, firebase=reports.firebase, data=reports.data, display=reports.display, visible=reports.visible, savecheck=reports.savecheck;
    const chain=Chain79?.summary?.(state);const season=Season79?.leaderboard?.(state);
    app.innerHTML=`${topbar('維護中心')}${nav()}<main id="mainContent"><section class="page-head"><div><span class="eyebrow">SAFE UPDATE & OPERATIONS</span><h1>v7.9.2 資料驗證與回歸測試強化版</h1><p>檢查版本相容、108 回章回資料、判斷題顯示、Service Worker 快取、存檔安全、玩家問題回報、章回連鎖結果與正式營運報告。</p></div><div class="actions"><a class="btn" href="update.html" target="_blank" rel="noopener">開啟一鍵更新檢查頁</a><button class="btn danger" data-act="clear-runtime-cache">清除梁山快取</button></div></section><div class="grid two"><section class="card"><h2>一鍵更新與版本相容</h2><div class="actions"><button class="btn primary" data-act="ops-version-check">版本相容性檢查</button><button class="btn" data-act="ops-data-check">108 回資料驗證</button><button class="btn" data-act="ops-display-test">判斷題顯示測試</button><button class="btn" data-act="ops-visible-scan">畫面錯誤掃描</button><button class="btn" data-act="ops-save-check">存檔安全檢查</button><button class="btn" data-act="ops-sw-check">Service Worker 快取診斷</button><button class="btn" data-act="ops-migration-report">存檔遷移報告</button></div>${version?`<h3>版本檢查 ${version.passed}/${version.total}</h3>${reportRows(version)}`:''}${sw?`<h3>快取診斷 ${sw.passed}/${sw.total}</h3>${reportRows(sw)}`:''}${migration?`<h3>遷移報告 ${migration.passed}/${migration.total}</h3>${reportRows(migration)}`:''}${data?`<h3>資料驗證 ${data.passed}/${data.total}</h3>${reportRows({rows:(data.failures||[]).slice(0,12).map(x=>({ok:false,name:`第 ${x.chapter} 回・${x.name}`,detail:x.detail}))}) || '<p class="success">108 回通過。</p>'}`:''}${display?`<h3>判斷題顯示 ${display.passed}/${display.total}</h3>${display.ok?'<p class="success">未偵測 undefined 或 [object Object]。</p>':reportRows({rows:display.rows.filter(x=>!x.ok).slice(0,12).map(x=>({ok:false,name:`第 ${x.chapter} 回`,detail:x.detail}))})}`:''}${visible?`<h3>目前畫面掃描 ${visible.passed}/${visible.total}</h3>${visible.ok?'<p class="success">目前畫面未偵測異常文字。</p>':reportRows({rows:visible.matches.map(x=>({ok:false,name:x.pattern,detail:x.sample}))})}`:''}${savecheck?`<h3>存檔安全 ${savecheck.passed}/${savecheck.total}</h3>${reportRows(savecheck)}`:''}</section><section class="card"><h2>正式營運報告匯出</h2><div class="actions"><button class="btn primary" data-act="ops-export-issue">匯出玩家問題回報</button><button class="btn" data-act="ops-export-github">匯出 GitHub Pages 實測報告</button><button class="btn" data-act="ops-export-firebase">匯出 Firebase 跨裝置報告</button></div>${deploy?`<h3>部署報告 ${deploy.passed}/${deploy.total}</h3>${reportRows(deploy)}`:''}${firebase?`<h3>Firebase 報告 ${firebase.passed}/${firebase.total}</h3>${reportRows(firebase)}`:''}</section></div><div class="grid two" style="margin-top:16px"><section class="card"><h2>章回連鎖影響與結果頁</h2><p>聲望 ${chain?.renown||0}・完美結局 ${chain?.perfect||0}・作用中的旗標 ${chain?.active?.length||0} 個。</p><div class="actions"><button class="btn" data-act="ops-chain-results">開啟章回連鎖結果頁</button></div>${chain?.effects?.map(x=>`<div class="chain-row ${x.active?'active':''}"><b>${esc(x.name)} Lv.${x.level||0}</b><small>${esc(x.text)}｜${esc(x.bonus)}｜累積 ${x.value||0}</small></div>`).join('')||'<p>完成章回後會自動累積。</p>'}</section><section class="card"><h2>遠征賽季與個人排行榜</h2><p>${esc(season?.current?.text||'本週遠征尚未建立。')}</p><p>挑戰碼：${esc(season?.current?.challengeCode||'')}</p>${season?.personalBest?.length?`<ol class="leaderboard">${season.personalBest.map(x=>`<li><b>${x.score}</b> 分・${esc(x.season)}・第 ${x.floor} 層・${esc(x.boss)}</li>`).join('')}</ol>`:'<p>尚無個人最佳紀錄。</p>'}<div class="actions"><button class="btn" data-act="record-season-demo">記錄目前賽季樣本</button><button class="btn" data-act="export-season-report">匯出排行榜</button></div></section></div><section class="card" style="margin-top:16px"><h2>回復包與注意事項</h2><p>若覆蓋更新後出現白畫面或版本混用，請使用 v7.9.0 附帶的 rollback 包，把檔案覆蓋回 v7.8.0，並在本頁清除梁山快取後重新開啟。</p><div class="actions"><a class="btn" href="ROLLBACK_README_v7.9.0.txt" target="_blank" rel="noopener">查看回復說明</a><a class="btn" href="LIVE_DEPLOYMENT_CHECKLIST.md" target="_blank" rel="noopener">正式上線清單</a></div></section></main>`;
  }
  function openChainResults(){
    const report=Validation792?.chainResult?.(state)||{completed:completionCount(),perfect:0,unlocked:[]};
    const unlocked=(report.unlocked||[]).map(x=>`<li>${esc(x)}</li>`).join('')||'<li>尚未觸發大型連鎖結果，完成更多章回後會顯示。</li>';
    openModal('章回連鎖結果頁',`<p>完成章回 ${report.completed||0} 回・完美結局 ${report.perfect||0} 回。</p><ul>${unlocked}</ul><p class="muted">此頁用來回顧前面章回選擇如何影響後續聲望、遠征與隱藏結局條件。</p><div class="actions"><button class="btn primary" data-modal="close">關閉</button></div>`);
  }
  async function runOpsReport(kind){
    state.operations.v79Reports=state.operations.v79Reports||{};let report=null;
    if(kind==='version')report=Stability79?.versionReport?.(state,prefs);
    if(kind==='sw')report=await Stability79?.swReport?.();
    if(kind==='migration')report=Stability79?.migrationReport?.(state,prefs);
    if(kind==='data')report=Validation792?.validateAll?.(chapters,Epic);
    if(kind==='display')report=Validation792?.displayTest?.(chapters,Epic);
    if(kind==='visible')report=Validation792?.scanText?.(document);
    if(kind==='savecheck')report=Validation792?.saveSafetyReport?.(state);
    if(report){state.operations.v79Reports[kind]=report;save(true,false);renderOps();toast(`${report.type}：${report.passed}/${report.total} 通過。`,report.passed===report.total?'good':'warn');}
  }
  function exportOpsReport(kind){
    let report=null;
    if(kind==='issue'){report=Stability79?.issueReport?.(state,prefs);report=Validation792?.issueReport?.(report||{},state,prefs)||report;state.operations.issueReports=state.operations.issueReports||[];state.operations.issueReports.unshift(report);state.operations.issueReports=state.operations.issueReports.slice(0,20);}
    if(kind==='github'){report=Stability79?.deploymentReport?.(state,prefs,state.operations.deployment);state.operations.v79Reports=state.operations.v79Reports||{};state.operations.v79Reports.deployment=report;}
    if(kind==='firebase'){report=Stability79?.firebaseReport?.(state,Cloud?.getStatus?.()||{},state.cloud.lastDiagnostics);state.operations.v79Reports=state.operations.v79Reports||{};state.operations.v79Reports.firebase=report;}
    if(kind==='season'){report={type:'season-leaderboard',version:VERSION,generatedAt:now(),data:Season79?.leaderboard?.(state)};}
    if(report){save(true,false);downloadText(`Liangshan_v${VERSION}_${kind}_report_${now().slice(0,10)}.json`,JSON.stringify(report,null,2));renderOps();toast('報告已匯出。','good');}
  }

  function render(){
    document.body.dataset.theme=prefs.theme;document.body.dataset.screen=screen;A11y.apply(prefs);
    if(screen==='home')renderHome();else if(screen==='chapters')renderChapters();else if(screen==='chapter')renderChapter();else if(screen==='battle')renderBattle();else if(screen==='ending')renderEnding();else if(screen==='team')renderTeam();else if(screen==='heroes')renderHeroes();else if(screen==='forge')renderForge();else if(screen==='base')renderBase();else if(screen==='endgame')renderEndgame();else if(screen==='cloud')renderCloud();else if(screen==='ops')renderOps();
    if(!$('#mainContent',app)){const main=app.querySelector('section,.battle-toolbar');if(main){main.id='mainContent';main.tabIndex=-1;}}
  }
  function openModal(title,content){
    modalRoot.innerHTML=`<div class="modal-backdrop" data-backdrop-close><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div class="modal-head"><h2 id="modalTitle">${esc(title)}</h2><button class="btn icon" data-modal="close" aria-label="關閉視窗">×</button></div>${content}</section></div>`;
    requestAnimationFrame(()=>A11y.focusFirst(modalRoot));
  }
  function closeModal(){modalRoot.innerHTML='';}
    function openReleaseNotes(){openModal('v7.9.2 修正內容',`<ul><li>新增 108 回章回資料格式驗證器</li><li>新增 108 回判斷題顯示自動測試</li><li>自動偵測畫面 undefined 與 [object Object]</li><li>更新頁加入快取清除、版本比對與檢查報告匯出</li><li>新增存檔安全檢查、強化玩家問題回報與章回連鎖結果頁</li></ul><div class="actions"><button class="btn" data-modal="close">關閉</button><button class="btn primary" data-act="ops">前往維護中心</button></div>`);}
  function srAnnounce(message){const node=document.querySelector('#srStatus');if(!node)return;node.textContent='';setTimeout(()=>node.textContent=String(message||''),20);}
  function toast(message,type=''){srAnnounce(message);const node=document.createElement('div');node.className=`toast ${type}`;node.textContent=message;toastRoot.appendChild(node);setTimeout(()=>node.remove(),2800);}
  function tone(type){if(!prefs.sound)return;if(Audio76?.sfx){Audio76.sfx(type);return;}try{audioContext=audioContext||new(window.AudioContext||window.webkitAudioContext)();const o=audioContext.createOscillator(),g=audioContext.createGain();o.frequency.value=({hit:180,hurt:105,skill:410,guard:280,save:340,battle:145,victory:600,achievement:760}[type]||300);g.gain.setValueAtTime(.035,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+.14);o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+.15);}catch{}}
  function speakPage(){if(!('speechSynthesis'in window))return toast('此瀏覽器不支援語音朗讀。','warn');speechSynthesis.cancel();const text=app.innerText.slice(0,5000);const u=new SpeechSynthesisUtterance(text);u.lang='zh-TW';u.rate=.95;speechSynthesis.speak(u);toast('開始朗讀本頁。','good');}
  function cycleTheme(){const order=['ink','dark','paper'];prefs.theme=order[(order.indexOf(prefs.theme)+1)%order.length];save(true);render();}
  function downloadText(filename,text,mime='application/json'){const blob=new Blob([text],{type:`${mime};charset=utf-8`});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function importSaveText(text){const parsed=JSON.parse(text);const checked=SaveSchema?SaveSchema.validateExport(parsed):{ok:true,state:parsed?.state||parsed,prefs:parsed?.prefs||{}};if(!checked.ok)throw new Error(checked.errors.join('、'));createBackup('匯入前備份');state=mergeState(checked.state);if(checked.prefs)prefs={...freshPrefs(),...checked.prefs};save(true);}
  function showUpdateAvailable(registration){swRegistration=registration;updateRoot.innerHTML=`<aside class="update-banner"><div><b>發現新版遊戲</b><small>更新前會建立 IndexedDB 備份並保存章回、覺醒、編隊與裝備。</small></div><div class="actions"><button class="btn small" data-act="release-notes">更新內容</button><button class="btn small primary" data-act="apply-update">立即更新</button><button class="btn small" data-act="dismiss-update">稍後</button></div></aside>`;}
  function registerServiceWorker(){if(!('serviceWorker'in navigator)||location.protocol==='file:')return;navigator.serviceWorker.register('./service-worker.js',{scope:'./'}).then(reg=>{swRegistration=reg;if(reg.waiting)showUpdateAvailable(reg);reg.addEventListener('updatefound',()=>{const w=reg.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)showUpdateAvailable(reg);});});reg.update().catch(()=>{});}).catch(()=>{});navigator.serviceWorker.addEventListener('controllerchange',()=>{if(refreshing)return;refreshing=true;location.reload();});}

  app.addEventListener('click',async event=>{
    const chapterButton=event.target.closest('[data-chapter]');if(chapterButton){openChapterChoice(chapterButton.dataset.chapter);return;}
    const storyChoice=event.target.closest('[data-story-choice]');if(storyChoice){chooseStory(storyChoice.dataset.storyChoice);return;}
    const clue=event.target.closest('[data-clue]');if(clue){collectClue(clue.dataset.clue);return;}
    const strategy=event.target.closest('[data-strategy]');if(strategy){doStrategy(strategy.dataset.strategy);return;}
    const start=event.target.closest('[data-battle-start]');if(start){startBattle(start.dataset.battleStart);return;}
    const special=event.target.closest('[data-special]');if(special){startSpecialBattle(special.dataset.special,special.dataset.key);return;}
    const action=event.target.closest('[data-battle-action]');if(action){battleAction(action.dataset.battleAction);return;}
    const target=event.target.closest('[data-target]');if(target&&state.current?.battle){state.current.battle.targetIndex=Number(target.dataset.target);save(true);renderBattle();return;}
    const speed=event.target.closest('[data-speed]');if(speed){setBattleSpeed(speed.dataset.speed);return;}
    const plan=event.target.closest('[data-plan]');if(plan){setActiveFormation(plan.dataset.plan);return;}
    const talent=event.target.closest('[data-talent]');if(talent){const[category,branch]=talent.dataset.talent.split(':');selectTalent(Number(talent.dataset.hero),category,branch);return;}
    const reset=event.target.closest('[data-reset-tree]');if(reset){resetTalents(Number(reset.dataset.resetTree));return;}
    const awaken=event.target.closest('[data-awaken]');if(awaken){awakenHero(Number(awaken.dataset.awaken));return;}
    const manual=event.target.closest('[data-equip-manual]');if(manual){openEquipmentModal(Number(manual.dataset.hero),manual.dataset.equipManual);return;}
    const best=event.target.closest('[data-equip-best]');if(best){equipBest(Number(best.dataset.equipBest));return;}
    const craft=event.target.closest('[data-craft]');if(craft){craftItem(craft.dataset.craft);return;}
    const upItem=event.target.closest('[data-upgrade-item]');if(upItem){upgradeItem(upItem.dataset.upgradeItem);return;}
    const reforge=event.target.closest('[data-reforge-item]');if(reforge){reforgeItem(reforge.dataset.reforgeItem);return;}
    const lock=event.target.closest('[data-lock-item]');if(lock){toggleItemLock(lock.dataset.lockItem);return;}
    const exclusive=event.target.closest('[data-exclusive]');if(exclusive){craftExclusive(exclusive.dataset.exclusive);return;}
    const heroPageBtn=event.target.closest('[data-hero-page]');if(heroPageBtn){heroPage=clamp(Number(heroPageBtn.dataset.heroPage)||1,1,99);renderHeroes();return;}
    const forgePageBtn=event.target.closest('[data-forge-page]');if(forgePageBtn){forgePage=clamp(Number(forgePageBtn.dataset.forgePage)||1,1,999);renderForge();return;}
    const historyBtn=event.target.closest('[data-cloud-history]');if(historyBtn){cloudOpenHistory(historyBtn.dataset.cloudHistory);return;}
    const roguePath=event.target.closest('[data-rogue-path]');if(roguePath){Rogue.choosePath(state.endgame.rogue,Number(roguePath.dataset.roguePath));save(true);renderEndgame();return;}
    const savePlan=event.target.closest('[data-loadout-save]');if(savePlan){saveEquipmentPlan(savePlan.dataset.loadoutSave);return;}
    const applyPlan=event.target.closest('[data-loadout-apply]');if(applyPlan){applyEquipmentPlan(applyPlan.dataset.loadoutApply);return;}
    const dismantle=event.target.closest('[data-dismantle]');if(dismantle){dismantleItem(dismantle.dataset.dismantle);return;}
    const filter=event.target.closest('[data-forge-filter]');if(filter){forgeFilter=filter.dataset.forgeFilter;forgePage=1;renderForge();return;}
    const building=event.target.closest('[data-building]');if(building){upgradeBuilding(building.dataset.building);return;}
    const claimD=event.target.closest('[data-claim-dispatch]');if(claimD){claimDispatch(claimD.dataset.claimDispatch);return;}
    const cancelD=event.target.closest('[data-cancel-dispatch]');if(cancelD){cancelDispatch(cancelD.dataset.cancelDispatch);return;}
    const diff=event.target.closest('[data-difficulty]');if(diff&&state.current&&!state.current.battle){state.current.difficulty=diff.dataset.difficulty;prefs.difficulty=diff.dataset.difficulty;save(true);renderChapter();return;}
    const btn=event.target.closest('[data-act]');if(!btn)return;const act=btn.dataset.act;
    if(act==='start-rogue'){startRogueRun();return;}if(act==='resolve-rogue-node'){resolveRogueNode();return;}if(act==='rogue-reroll'){if(Rogue.rerollFloor(state.endgame.rogue)){save(true);renderEndgame();toast('本層三條路線已重新生成。','good');}return;}if(act==='abandon-rogue'){abandonRogue();return;}if(act==='run-balance'){runBalanceSimulation();return;}if(act==='select-visible-items'){batchSelectVisible();return;}if(act==='select-common'){selectCommonUnlocked();return;}if(act==='batch-lock'){batchLockSelected(true);return;}if(act==='batch-unlock'){batchLockSelected(false);return;}if(act==='batch-dismantle'){batchDismantle();return;}if(act==='cloud-history'){await cloudLoadHistory();renderCloud();return;}if(act==='cloud-diagnostics'){await cloudRunDiagnostics();return;}if(act==='deployment-doctor'){await runDeploymentDoctor();return;}if(act==='ops-version-check'){await runOpsReport('version');return;}if(act==='ops-data-check'){await runOpsReport('data');return;}if(act==='ops-display-test'){await runOpsReport('display');return;}if(act==='ops-visible-scan'){await runOpsReport('visible');return;}if(act==='ops-save-check'){await runOpsReport('savecheck');return;}if(act==='ops-sw-check'){await runOpsReport('sw');return;}if(act==='ops-migration-report'){await runOpsReport('migration');return;}if(act==='ops-chain-results'){openChainResults();return;}if(act==='ops-export-issue'){exportOpsReport('issue');return;}if(act==='ops-export-github'){exportOpsReport('github');return;}if(act==='ops-export-firebase'){exportOpsReport('firebase');return;}if(act==='export-season-report'){exportOpsReport('season');return;}if(act==='clear-runtime-cache'){try{const n=await Stability79.clearRuntimeCaches();toast(`已清除 ${n} 個梁山快取，請重新整理。`,'good');}catch(error){toast(`清除快取失敗：${error.message}`,'warn');}return;}if(act==='record-season-demo'){const e=Season79?.record?.(state,{score:420+completionCount(),floor:state.endgame?.towerBest||1,relics:3,boss:Season79?.seasonInfo?.().boss});save(true,false);render();toast(`已記錄賽季分數 ${e?.score||0}。`,'good');return;}if(act==='tutorial'){openTutorial();return;}if(act==='tutorial-dismiss'){currentTutorial().dismissed=true;save(true);render();return;}
    if(['home','chapters','team','heroes','forge','base','endgame','cloud','ops'].includes(act)){if(!requireFeature(act))return;screen=act;render();return;}
    if(act==='continue'){if(state.current){screen=state.current.battle?'battle':state.current.complete?'ending':'chapter';render();if(screen==='battle')advanceToPlayable();}else openChapterChoice(firstIncomplete());return;}
    if(act==='clear-filter'){chapterSearch='';chapterEra='all';chapterStatus='all';renderChapters();return;}
    if(act==='resolve-choice'){resolveChoiceEvent();return;}if(act==='finish'){finishChapter();return;}if(act==='next'){startChapter(Math.min(108,currentChapter().number+1),false);return;}
    if(act==='replay'||act==='restart-current'){const n=currentChapter().number;openModal('重新挑戰確認',`<p>確定重新開始第 ${n} 回嗎？最佳完成紀錄、英雄等級、覺醒、裝備與建設均會保留。</p><div class="actions"><button class="btn danger" data-modal="chapter-restart" data-number="${n}">確定重新挑戰</button><button class="btn" data-modal="close">取消</button></div>`);return;}
    if(act==='claim-medicine'){claimMedicine();return;}if(act==='buy-medicine'){buyMedicine();return;}if(act==='toggle-auto'){toggleAuto();return;}if(act==='theme'){cycleTheme();return;}if(act==='music'){prefs.music=Audio76.toggle(state.current?.battle?'battle':screen==='chapter'?'hall':'hall');save(true,false);toast(prefs.music?'背景音樂已開啟。':'背景音樂已關閉。','good');return;}if(act==='accessibility'){openAccessibility();return;}if(act==='speech'){speakPage();return;}if(act==='manage'){openManage();return;}if(act==='release-notes'){openReleaseNotes();return;}
    if(act==='claim-production'){claimProduction();return;}
    if(act==='start-dispatch'){startDispatch($('#dispatchMission')?.value,$('#dispatchHero')?.value);return;}
    if(act==='start-rematch'){startSpecialBattle('rematch',$('#rematchChapter')?.value);return;}
    if(act==='cloud-configure'){try{Cloud.configure({apiKey:$('#firebaseApiKey')?.value,projectId:$('#firebaseProjectId')?.value,authDomain:$('#firebaseAuthDomain')?.value});renderCloud();toast('Firebase 設定已儲存。','good');}catch(error){toast(error.message,'warn');}return;}
    if(act==='cloud-clear'){Cloud.clearConfig();renderCloud();toast('Firebase 設定與登入狀態已清除。','warn');return;}
    if(act==='cloud-signin'||act==='cloud-signup'){try{const email=$('#cloudEmail')?.value,password=$('#cloudPassword')?.value;if(!email||!password)throw new Error('請輸入電子郵件與至少 6 碼密碼。');if(act==='cloud-signup')await Cloud.signUp(email,password);else await Cloud.signIn(email,password);renderCloud();toast(act==='cloud-signup'?'帳號建立並登入成功。':'登入成功。','good');}catch(error){toast(`Firebase：${error.message}`,'warn');}return;}
    if(act==='cloud-signout'){Cloud.signOut();renderCloud();toast('已登出雲端存檔。','good');return;}
    if(act==='cloud-upload'){await cloudUpload();return;}if(act==='cloud-download'){await cloudDownloadPreview();return;}
    if(act==='dismiss-update'){updateRoot.innerHTML='';return;}
    if(act==='apply-update'&&swRegistration?.waiting){createBackup('PWA 更新前備份').then(()=>{save(true);swRegistration.waiting.postMessage({type:'SKIP_WAITING'});});return;}
    if(act==='install'&&deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.finally(()=>deferredPrompt=null);return;}
  });
  app.addEventListener('input',event=>{
    if(event.target.id==='chapterSearch'){chapterSearch=event.target.value;renderChapters();}
    if(event.target.id==='heroSearch'){heroSearch=event.target.value;heroPage=1;renderHeroes();}
    if(event.target.matches('[data-plan-name]'))renameFormation(event.target.dataset.planName,event.target.value);
  });
  app.addEventListener('change',event=>{
    const select=event.target.closest('[data-formation]');if(select)setFormation(select.dataset.formation,select.value);
    if(event.target.id==='chapterEra'){chapterEra=event.target.value;renderChapters();}
    if(event.target.id==='chapterStatus'){chapterStatus=event.target.value;renderChapters();}
    if(event.target.id==='forgeRarity'){forgeRarity=event.target.value;forgePage=1;renderForge();}
    if(event.target.matches('[data-select-item]')){if(event.target.checked)selectedForgeItems.add(event.target.dataset.selectItem);else selectedForgeItems.delete(event.target.dataset.selectItem);renderForge();}
    if(event.target.id==='aiStrategy'){prefs.autoStrategy=event.target.value;state.aiPolicy.mode=event.target.value;save(true);}
    if(event.target.id==='aiTarget'){prefs.targetPriority=event.target.value;state.aiPolicy.targetPriority=event.target.value;save(true);}
    if(event.target.id==='aiMedicineThreshold'){prefs.medicineThreshold=clamp(Number(event.target.value)/100,.1,.8);state.aiPolicy.medicineThreshold=prefs.medicineThreshold;save(true);}
    if(event.target.id==='aiReserveUltimate'){prefs.reserveUltimate=event.target.checked;state.aiPolicy.reserveUltimate=event.target.checked;save(true);}
    if(event.target.id==='aiUseMedicine'){prefs.useMedicine=event.target.checked;state.aiPolicy.useMedicine=event.target.checked;save(true);}
  });
  modalRoot.addEventListener('click',async event=>{
    const backdrop=event.target.closest('[data-backdrop-close]');if(backdrop&&event.target===backdrop){closeModal();return;}
    const button=event.target.closest('[data-modal]');if(!button)return;const act=button.dataset.modal;
    if(act==='close'){closeModal();return;}
    if(['chapter-resume','chapter-restart','chapter-switch'].includes(act)){const n=Number(button.dataset.number);closeModal();startChapter(n,act==='chapter-restart');return;}
    if(act==='trial-choice'){resolveTrial(button.dataset.trialIndex);return;}
    if(act==='rogue-path'){Rogue.choosePath(state.endgame.rogue,Number(button.dataset.index));save(true);closeModal();renderEndgame();return;}
    if(act==='rogue-reroll'){if(Rogue.rerollFloor(state.endgame.rogue)){save(true);closeModal();renderEndgame();toast('本層路線已重抽。','good');}return;}
    if(act==='rogue-relic'){chooseRogueRelic(button.dataset.relic,button.dataset.advance==='1');return;}
    if(act==='rogue-event'){chooseRogueEvent(button.dataset.event);return;}
    if(act==='equip-item'){equipItem(Number(button.dataset.hero),button.dataset.item);return;}
    if(act==='restore-backup'){restoreBackup(button.dataset.backup);return;}
    if(act==='tutorial-next'){tutorialNext();return;}
    if(act==='tutorial-dismiss'){currentTutorial().dismissed=true;save(true);closeModal();render();return;}
    if(act==='tutorial-go'){const target=button.dataset.target;if(featureUnlocked(target)){screen=target;save(true);closeModal();render();}else{toast(`此功能需完成 ${Ops.featureRules[target]||0} 回後開放。`,'warn');}return;}
    if(act==='a11y-save'){prefs.highContrast=$('#a11yContrast')?.checked;prefs.reducedMotion=$('#a11yMotion')?.checked;prefs.fontScale=Number($('#a11yFont')?.value)||1;prefs.keyboardHints=$('#a11yHints')?.checked;prefs.screenReaderMode=$('#a11yReader')?.checked;prefs.lowPower=$('#a11yLowPower')?.checked;save(true);closeModal();render();toast('無障礙設定已套用。','good');return;}
    if(act==='cloud-merge'){try{const raw=JSON.parse($('#cloudPayload')?.value||'{}');const checked=SaveSchema.validateExport(raw);if(!checked.ok)throw new Error(checked.errors.join('、'));await createBackup('雲端智慧合併前備份');state=mergeState(SaveSchema.mergeStates(state,checked.state));if(checked.prefs)prefs={...prefs,...checked.prefs};state.cloud.lastSyncAt=now();state.cloud.lastDirection='merge';save(true);closeModal();screen='home';render();toast('本機與雲端欄位已智慧合併。','good');}catch(error){toast(`智慧合併失敗：${error.message}`,'warn');}return;}
    if(act==='cloud-apply'){try{const raw=JSON.parse($('#cloudPayload')?.value||'{}');const checked=SaveSchema.validateExport(raw);if(!checked.ok)throw new Error(checked.errors.join('、'));await createBackup('套用雲端前備份');state=mergeState(checked.state);if(checked.prefs)prefs={...freshPrefs(),...checked.prefs};state.cloud.lastSyncAt=now();state.cloud.lastDirection='download';save(true);closeModal();screen='home';render();toast('雲端進度已套用。','good');}catch(error){toast(`無法套用雲端：${error.message}`,'warn');}return;}
    const textarea=$('#saveText');
    if(act==='copy'&&textarea)navigator.clipboard?.writeText(textarea.value).then(()=>toast('存檔已複製。','good')).catch(()=>{});
    if(act==='download'&&textarea)downloadText(`Liangshan_v${VERSION}_save_${now().slice(0,10)}.json`,textarea.value);
    if(act==='backup-now'){createBackup('手動備份').then(()=>{closeModal();openManage();toast('已建立手動備份。','good');});}
    if(act==='import'&&textarea){try{importSaveText(textarea.value);closeModal();screen='home';render();toast('存檔匯入成功。','good');}catch(error){toast(`存檔格式不正確：${error.message}`,'warn');}}
    if(act==='reset-all'&&confirm('確定清除 v7 全部章回、英雄、裝備與建設進度嗎？')){createBackup('重設前備份');storage.removeItem(SAVE_KEY);state=mergeState(freshState());closeModal();screen='home';save(true);render();toast('全部進度已重設。','warn');}
  });
  document.addEventListener('keydown',event=>{
    if(modalRoot.firstElementChild){if(event.key==='Escape'){closeModal();event.preventDefault();return;}A11y.trapModal(event,modalRoot);}
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    const key=event.key.toLowerCase();
    if(screen==='battle'&&state.current?.battle&&currentActor()?.team==='ally'){
      const map={'1':'attack','2':'skill','3':'system','4':'guard','5':'medicine','0':'combo'};
      if(map[key]){battleAction(map[key]);event.preventDefault();return;}
    }
    const navMap={h:'home',c:'chapters',t:'team',e:'forge'};
    if(navMap[key]){if(requireFeature(navMap[key])){screen=navMap[key];render();}event.preventDefault();}
  });

  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredPrompt=event;});
  document.body.dataset.theme=prefs.theme;save(true,false);render();registerServiceWorker();hydrateFromIndexedDb();

  window.__LIANGSHAN_TEST__={
    version:VERSION,chapters,getState:()=>clone(state),getPrefs:()=>clone(prefs),flow:n=>clone(flowForChapter(chapter(n))),heroKit:n=>clone(heroKit(Number(n))),allHeroKits:()=>chapters.map(c=>heroKit(c.number)),storyMode:n=>clone(storyMode(chapter(n))),start:(n,force=true)=>startChapter(n,force),chooseStory,
    completeCurrentStep:()=>{const r=state.current;if(!r)return;if(!r.choice)chooseStory(storyMode(currentChapter()).choices[0].key);const step=flowForChapter(currentChapter())[currentStepIndex(r)];if(step.type==='clue')collectClue(step.index);else if(step.type==='strategy')doStrategy(step.index);else if(step.type==='choiceEvent')resolveChoiceEvent();else if(step.type==='battle'){r.battles[String(step.index)]=true;save(true);renderChapter();}else finishChapter();},
    autoComplete:n=>{startChapter(n,true);const r=state.current;r.choice=storyMode(currentChapter()).choices[0].key;r.choiceEventDone=true;r.clues=[0,1,2,3];r.strategies=[0,1,2,3,4];r.battles={0:true,1:true,2:true};r.stats.guestSurvived=true;finishChapter();},
    bulkAutoComplete:()=>{for(let n=1;n<=108;n++){const ch=chapter(n);const r=makeRun(n);r.choice=storyMode(ch).choices[0].key;r.choiceEventDone=true;r.clues=[0,1,2,3];r.strategies=[0,1,2,3,4];r.battles={0:true,1:true,2:true};r.stats.guestSurvived=true;state.current=r;const result=computeResult(r);r.complete=true;r.score=result.score;r.grade=result.grade;r.achievements=result.achievements;state.completed[String(n)]={grade:result.grade,score:result.score,actions:0,rounds:0,defeats:0,medicinesUsed:0,combos:0,guestSurvived:true,choice:r.choice,achievements:result.achievements,completedAt:now(),source:`v${VERSION} ${EDITION}`};state.runs[String(n)]=r;}state.unlocked=108;state.selected=108;save(true,false);screen='home';render();return Object.keys(state.completed).length;},
    setSilver:v=>{state.silver=Math.max(0,Number(v)||0);save(true);render();},setMaterials:v=>{state.inventory.materials={...state.inventory.materials,...v};save(true);render();},setPity:(type,v)=>{state.inventory.pity[type]=clamp(Number(v)||0,0,9);save(true,false);},finishDispatchNow:id=>{const d=state.dispatches.find(x=>x.id===id);if(d)d.endsAt=new Date(Date.now()-1000).toISOString();save(true,false);},formations:()=>clone(state.formations),setActiveFormation,setFormation,activeBonds:()=>clone(activeBonds()),heroStats:n=>clone(heroCombatStats(Number(n),'front')),mergePreview:raw=>clone(mergeState(raw)),selectTalent,resetTalents,awakenHero,grantXp,equipBest,equipItem,craftItem,upgradeItem,dismantleItem,upgradeBuilding,heroKit,sets:clone(SETS),bonds:clone(BONDS),buildings:clone(BUILDINGS),
    prepareBattle:(n,stage=2)=>{startChapter(n,true);const r=state.current;r.choice=storyMode(currentChapter()).choices[0].key;r.choiceEventDone=true;r.clues=[0,1,2,3];r.strategies=[0,1,2,3,4];r.battles={0:stage>0,1:stage>1,2:false};startBattle(stage);},
    startBattle,battleAction,smartAction,resolveTrial,startSpecialBattle,startRogueRun,resolveRogueNode,chooseRogueRelic,chooseRogueEvent,abandonRogue,runBalanceSimulation,craftExclusive,batchSelectVisible,batchDismantle,batchLockSelected,selectCommonUnlocked,saveEquipmentPlan,applyEquipmentPlan,reforgeItem,toggleItemLock,claimProduction,startDispatch,claimDispatch,cancelDispatch,renderEndgame,renderCloud,openTutorial,runDeploymentDoctor,currentActor:()=>clone(currentActor()),forceBossHit:damage=>{const b=state.current?.battle;const boss=b?.enemies.find(e=>e.type==='boss');if(!boss)return null;applyHit(boss,damage,{pierce:true,source:'測試'});save(true);renderBattle();return clone(boss);},forceWinBattle:()=>{const b=state.current?.battle;if(!b)return false;b.enemies.forEach(e=>{e.hp=0;e.alive=false;});battleVictory();return true;},simulateUpdate:()=>showUpdateAvailable({waiting:{postMessage:()=>{}}}),createBackup,backupCount:async()=>{try{return(await idbAll('backups')).length;}catch{return 0;}},idbStatus:()=>({hydrated:idbHydrated,backend:state.saveMeta.backend}),schema:()=>({version:SaveSchema?.SCHEMA_VERSION,valid:SaveSchema?.validateState(state)}),setPreference:(key,value)=>{prefs[key]=value;A11y.apply(prefs);save(true,false);render();return clone(prefs);},inflateInventory:(count=500)=>{const base=normalizeItem(state.inventory.items[0]||freshState().inventory.items[0],0);for(let i=0;i<Number(count);i++){const x=clone(base);x.id=`stress-${Date.now()}-${i}`;x.name=`壓力測試裝備 ${i+1}`;x.equippedBy=null;x.locked=false;state.inventory.items.push(x);}save(true,false);return state.inventory.items.length;},trial:n=>clone(Content74?.trialForChapter(chapter(n))),endgameData:()=>clone({routes:EndgameData.routes,missions:EndgameData.dispatchMissions}),reset:()=>{storage.removeItem(SAVE_KEY);state=mergeState(freshState());save(true);screen='home';render();},v78:()=>({epicCount:Epic.count||0,portrait108:Ops.portrait?.(108)||'',balance:Balance.summary?.(),rogue:Rogue?.describe?.(),ops:Ops?.releaseSummary?.()}),v79:()=>({chain:Chain79?.summary?.(state),season:Season79?.leaderboard?.(state),reports:state.operations?.v79Reports})
  };
})();
