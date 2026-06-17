(() => {
  'use strict';
  const VERSION = '6.1.0';
  const SAVE_KEY = 'liangshan-rpg-sequel-v6';
  const V60_BACKUP_KEY = 'liangshan-rpg-sequel-v6.0-backup';
  const LEGACY_KEY = 'liangshan-rpg-save-v1';
  const PREF_KEY = 'liangshan-rpg-sequel-prefs';
  const $ = (s, r = document) => r.querySelector(s);
  const app = $('#app');
  const modalRoot = $('#modalRoot');
  const toastRoot = $('#toastRoot');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const clone = v => JSON.parse(JSON.stringify(v));
  const memoryStorage = new Map();
  const storage = (() => {
    try {
      const probe = '__liangshan_v61_probe__';
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
    story: {name:'故事', hp:.78, atk:.84, reward:.9, text:'適合閱讀劇情，敵人氣血與攻勢較低。'},
    standard: {name:'標準', hp:1, atk:1, reward:1, text:'依本章設計數值進行，攻守最均衡。'},
    heroic: {name:'豪傑', hp:1.2, atk:1.14, reward:1.35, text:'敵軍更強，勝利可獲得較多銀兩。'}
  };
  const CHAPTERS = [
    [35,'獨角龍疏渠・百田安灌','鄒潤','陶宗旺'],
    [36,'九尾龜築路・百道安行','陶宗旺','杜遷'],
    [37,'摸著天量屋・百居安住','杜遷','宋萬'],
    [38,'雲裡金剛巡坊・百鄰安守','宋萬','朱貴'],
    [39,'旱地忽律辨訊・百信安傳','朱貴','朱富'],
    [40,'笑面虎聽訴・百訴安解','朱富','李雲'],
    [41,'青眼虎勘案・百案安查','李雲','杜興'],
    [42,'鬼臉兒核契・百契安信','杜興','李應'],
    [43,'撲天雕清產・百產安籍','李應','朱仝'],
    [44,'美髯公核戶・百戶安名','朱仝','雷橫'],
    [45,'插翅虎核役・百役安任','雷橫','穆春'],
    [46,'小遮攔核賦・百賦安徵','穆春','穆弘'],
    [47,'沒遮攔核債・百債安償','穆弘','薛永'],
    [48,'病大蟲核藝・百藝安演','薛永','施恩'],
    [49,'金眼彪巡肆・百肆安營','施恩','李立'],
    [50,'催命判官察店・百旅安宿','李立','李俊']
  ];
  const ROSTER = [
    '武松','魯達','林沖','楊志','宋江','李逵','扈三娘','呼延灼','盧俊義','公孫勝','張清','花榮','瓊英','燕青','張順','戴宗','朱武','蕭讓','裴宣','樂和','金大堅','孟康','侯健','湯隆','凌振','皇甫端','曹正','孫二娘','張青','顧大嫂','孫新','解珍','解寶','鄒淵','鄒潤','陶宗旺','杜遷','宋萬','朱貴','朱富','李雲','杜興','李應','朱仝','雷橫','穆春','穆弘','薛永','施恩','李立'
  ];
  const CLUES = [
    {id:'guestbook', title:'旅簿與去向', icon:'📖', text:'核對投宿姓名、同行人、來處去向與離店時間；失聯時依旅簿追查，不得任意塗改或扣留。'},
    {id:'food', title:'酒食與藥物', icon:'🍵', text:'酒食來源、製作人與送餐時刻須可追溯；禁用蒙汗藥、迷藥及不明粉末，疑似中毒立即留樣救治。'},
    {id:'deposit', title:'旅資與寄存', icon:'🧳', text:'行囊、貨物與銀錢寄存須雙方點驗、封記並給據；遺失、掉包或強扣財物，必須追償。'},
    {id:'rescue', title:'夜巡與救濟', icon:'🏮', text:'客房門栓、照明、逃生與求援通道不得封堵；遇失聯、傷病或劫掠，啟動夜巡、通報、安置與返鄉救濟。'}
  ];
  const STRATEGY = [
    ['旅簿留痕','建立投宿、同行、去向與離店時間紀錄，異常修改須留下記號。'],
    ['酒食分驗','廚房、酒窖與送餐分工留名，不明藥粉立即封存並通報。'],
    ['寄物給據','行囊與貨物雙人點驗、封條編號、交付副本，避免掉包與強扣。'],
    ['夜巡互保','客棧、碼頭與渡船設聯絡燈號，夜間定時巡查求援與逃生通道。'],
    ['失聯救濟','啟動尋人、醫治、暫住、旅費返還與返鄉護送，並追究黑店責任。']
  ];
  const ENEMIES = {
    patrol:{name:'攔客索財黑店伙計', icon:'伙', maxHp:760, hp:760, atk:76, def:25, reward:100, intro:'黑店伙計在渡口強拉旅客入住，拒絕者便被搜身扣貨，還偽稱是「巡江費」。'},
    guard:{name:'下藥劫貨店徒', icon:'藥', maxHp:950, hp:950, atk:87, def:31, reward:145, intro:'店徒正把不明藥粉倒入酒甕，後院堆著被拆封的旅商行囊與假寄存單。'},
    boss:{name:'沿江黑店盟主與水寨掮客', icon:'寨', maxHp:1340, hp:1340, atk:99, def:38, reward:245, intro:'黑店盟主勾結水寨掮客，以迷藥、假渡票和失聯名冊控制沿江旅路。'}
  };
  const ACHIEVEMENTS = [
    ['明察秋毫','完成四項旅店查驗。',s=>s.clues.length===4],
    ['三戰連捷','全章未曾戰敗。',s=>s.runStats.defeats===0],
    ['清醒到底','全章未使用金瘡藥。',s=>s.runStats.medicinesUsed===0],
    ['判官獨守','最終戰未呼叫李俊援護。',s=>!s.runStats.bossCompanionUsed]
  ];

  const fresh = () => ({
    version:VERSION, updatedAt:new Date().toISOString(), started:false, complete:false, scene:'home',
    hero:{name:'李立', title:'催命判官・揭陽嶺酒店頭領', level:50, hp:1220, maxHp:1220, sp:850, maxSp:850, atk:130, def:76, guarding:false},
    companion:{name:'李俊', title:'混江龍・揭陽江水寨頭領', unlocked:false, used:false},
    clues:[], strategy:[], flags:{battle1:false,battle2:false,boss:false,system:false}, inventory:[], silver:300,
    log:['第五十回待命：李立將察訪沿江客棧與旅商失聯案。'], battle:null,
    achievements:[], runStats:{actions:0,medicinesUsed:0,defeats:0,bossCompanionUsed:false},
    previous:{detected:false,version:'',chapter49Complete:false,carriedSilver:0},
    legacy:{detected:false,version:'',chapter48Complete:false,chapter34Complete:false}
  });

  let state = loadState();
  let prefs = loadPrefs();
  let screen = 'home';
  let deferredPrompt = null;
  let audio = null;
  let speechOn = false;
  let battleBusy = false;

  function loadPrefs(){
    try{
      const raw=JSON.parse(storage.getItem(PREF_KEY)||'{}');
      const merged={theme:'ink',sound:true,difficulty:'standard',...raw};
      if(!DIFFICULTIES[merged.difficulty])merged.difficulty='standard';
      return merged;
    }catch{return {theme:'ink',sound:true,difficulty:'standard'}}
  }
  function savePrefs(){storage.setItem(PREF_KEY,JSON.stringify(prefs))}
  function detectLegacy(target){
    try{
      const old=JSON.parse(storage.getItem(LEGACY_KEY)||'null');
      if(!old)return target;
      target.legacy={detected:true,version:old.version||old.gameVersion||'舊版',chapter48Complete:!!old.flags?.chapter48Complete,chapter34Complete:!!old.flags?.chapter34Complete};
    }catch{}
    return target;
  }
  function detectPreviousBackup(target){
    try{
      const old=JSON.parse(storage.getItem(V60_BACKUP_KEY)||'null');
      if(old){
        target.previous={detected:true,version:old.version||'6.0.0',chapter49Complete:!!old.complete,carriedSilver:Math.min(180,Math.max(0,Math.floor((old.silver||0)*.25)))};
      }
    }catch{}
    return target;
  }
  function migrateV60(raw){
    try{if(!storage.getItem(V60_BACKUP_KEY))storage.setItem(V60_BACKUP_KEY,JSON.stringify(raw))}catch{}
    const base=fresh();
    const carried=Math.min(180,Math.max(0,Math.floor((raw.silver||0)*.25)));
    base.previous={detected:true,version:raw.version||'6.0.0',chapter49Complete:!!raw.complete,carriedSilver:carried};
    if(raw.complete){
      base.silver+=carried;
      base.inventory.push('水泊百肆安營約（前回承接）');
      base.log.unshift(`承接第四十九回完成紀錄與銀兩 ${carried}。`);
    }
    return detectLegacy(base);
  }
  function mergeCurrent(raw){
    const base=fresh();
    const merged={
      ...base,...raw,
      hero:{...base.hero,...raw.hero}, companion:{...base.companion,...raw.companion},
      flags:{...base.flags,...raw.flags}, runStats:{...base.runStats,...raw.runStats},
      previous:{...base.previous,...raw.previous}, legacy:{...base.legacy,...raw.legacy}
    };
    merged.version=VERSION;
    if(!Array.isArray(merged.clues))merged.clues=[];
    if(!Array.isArray(merged.strategy))merged.strategy=[];
    if(!Array.isArray(merged.inventory))merged.inventory=[];
    if(!Array.isArray(merged.achievements))merged.achievements=[];
    return detectLegacy(detectPreviousBackup(merged));
  }
  function loadState(){
    try{
      const raw=JSON.parse(storage.getItem(SAVE_KEY)||'null');
      if(raw?.hero){
        if(raw.version==='6.0.0'||raw.hero.name==='施恩')return migrateV60(raw);
        return mergeCurrent(raw);
      }
    }catch{}
    return detectLegacy(detectPreviousBackup(fresh()));
  }
  function importState(raw){
    if(!raw?.hero)throw new Error('invalid');
    if(raw.version==='6.0.0'||raw.hero.name==='施恩')return migrateV60(raw);
    return mergeCurrent(raw);
  }
  function save(silent=false){state.updatedAt=new Date().toISOString();state.version=VERSION;storage.setItem(SAVE_KEY,JSON.stringify(state));if(!silent){toast('第五十回進度已收入本機存檔。');tone('save')}}
  function reset(){storage.removeItem(SAVE_KEY);state=detectLegacy(detectPreviousBackup(fresh()));screen='home';render();toast('已重設 v6.1.0 第五十回；前回備份與經典篇存檔未受影響。')}

  function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function pct(a,b){return clamp(Math.round(a/b*100),0,100)}
  function toast(msg){const n=document.createElement('div');n.className='toast';n.textContent=msg;toastRoot.append(n);setTimeout(()=>n.remove(),3200)}
  function tone(kind){if(!prefs.sound)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime;const m={hit:[150,.08],hurt:[85,.11],skill:[430,.14],victory:[690,.24],save:[520,.09],guard:[280,.08],companion:[590,.16],achievement:[770,.2]};const [f,d]=m[kind]||[360,.08];o.frequency.setValueAtTime(f,now);if(kind==='victory'||kind==='achievement')o.frequency.exponentialRampToValueAtTime(f*1.5,now+d);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.07,now+.01);g.gain.exponentialRampToValueAtTime(.0001,now+d);o.connect(g).connect(audio.destination);o.start();o.stop(now+d+.02)}catch{}}
  function log(msg){state.log.unshift(msg);state.log=state.log.slice(0,32)}
  function speak(text){if(!('speechSynthesis'in window))return toast('此瀏覽器不支援語音朗讀。');speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g,''));u.lang='zh-TW';u.rate=.9;speechSynthesis.speak(u)}
  function previousText(){
    if(!state.previous.detected)return '未偵測到 v6.0.0 紀錄；仍可直接遊玩第五十回。';
    const done=state.previous.chapter49Complete?'第四十九回已完成':'第四十九回尚未完成';
    const carry=state.previous.chapter49Complete?`，本回承接銀兩 ${state.previous.carriedSilver}`:'';
    return `偵測到 ${state.previous.version} 紀錄（${done}${carry}）。原進度另存於 v6.0.0 備份，不會遺失。`;
  }
  function legacyText(){if(!state.legacy.detected)return '未偵測到經典篇存檔。';return `另偵測到 ${state.legacy.version} 經典篇存檔；新版不會覆寫。`}
  function difficulty(){return DIFFICULTIES[prefs.difficulty]||DIFFICULTIES.standard}

  function header(title,sub=''){return `<div class="chapter-banner"><div class="eyebrow">第五十回・續篇</div><h1>${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:''}</div>`}
  function hud(){const h=state.hero;return `<div class="hud">
    <section class="card portrait"><div class="avatar">立</div><div><h3>${h.title}</h3><b>Lv.${h.level} ${h.name}</b><div class="statline"><span>氣血</span><div class="bar"><i style="width:${pct(h.hp,h.maxHp)}%"></i></div><b>${h.hp}/${h.maxHp}</b></div><div class="statline"><span>豪氣</span><div class="bar sp"><i style="width:${pct(h.sp,h.maxSp)}%"></i></div><b>${h.sp}/${h.maxSp}</b></div></div></section>
    <section class="card"><h3>章回進度</h3><p>查驗 ${state.clues.length}/4　軍略 ${state.strategy.length}/5</p><p>李俊助陣：${state.companion.unlocked?'已加入':'尚未加入'}　百旅制度：${state.flags.system?'已建立':'待建立'}</p><div class="save-status"><span class="tag ${state.complete?'good':''}">${state.complete?'第五十回完成':'進行中'}</span><span class="tag">${difficulty().name}難度</span><span class="tag">銀兩 ${state.silver}</span></div></section>
  </div>`}
  function nav(){return `<div class="actions"><button class="btn small" data-act="home">首頁</button><button class="btn small" data-act="chapter">章回</button><button class="btn small" data-act="roster">英雄譜</button><button class="btn small" data-act="timeline">章回錄</button><button class="btn small" data-act="save">存檔</button><button class="btn small" data-act="manage">存檔管理</button></div>`}
  function difficultyPicker(){return `<div class="difficulty-picker">${Object.entries(DIFFICULTIES).map(([id,d])=>`<button class="btn difficulty-option ${prefs.difficulty===id?'active':''}" data-difficulty="${id}">${prefs.difficulty===id?'<span class="checkmark">✓</span>':''}<strong>${d.name}難度</strong><span>${d.text}</span></button>`).join('')}</div>`}

  function renderHome(){
    screen='home';
    app.innerHTML=`<section class="hero"><div class="eyebrow">WATER MARGIN RPG · VERSION ${VERSION}</div><h1>水滸英雄傳</h1><h2>第五十回「催命判官察店・百旅安宿」</h2><p>施恩立下百肆安營約後，揭陽江沿岸接連發生旅商失聯、酒食下藥、寄存貨物掉包與假渡票劫財。熟知黑店手段的催命判官李立自請查店，以旅簿留痕、酒食分驗、寄物給據、夜巡互保與失聯救濟，斬斷沿江黑店聯盟。</p><div class="actions"><button class="btn primary" data-act="${state.started?'continue':'start'}">${state.started?'繼續第五十回':'開啟第五十回'}</button>${state.complete?'<button class="btn good" data-act="replay">重演第五十回</button>':''}<button class="btn" data-act="timeline">查看第三十五至五十回</button><a class="btn" href="previous-v6.0.0/index.html">重遊第四十九回 v6.0.0</a><a class="btn" href="legacy-v4.5.0/index.html">開啟經典篇 v4.5.0</a></div></section>
    <div class="grid two" style="margin-top:16px"><section class="card ${state.previous.detected?'success':'warning'}"><h3>前回安全承接</h3><p>${esc(previousText())}</p><p class="muted">${esc(legacyText())}</p></section><section class="card"><h3>v6.1.0 新增</h3><p><span class="tag">第 50 名主角：李立</span><span class="tag">新同伴：李俊</span><span class="tag">三種難度</span><span class="tag">四項成就</span><span class="tag">三場新戰鬥</span></p><p class="muted">第四十九回與經典篇均保留獨立入口；支援手機、離線 PWA、三種顯示模式、語音與 JSON 存檔。</p></section></div>
    <section class="card" style="margin-top:16px"><h3>選擇本章難度</h3><p class="muted">可在非戰鬥狀態隨時切換；已開始的戰鬥仍維持原數值。</p>${difficultyPicker()}</section>`;
    app.focus();
  }

  function startChapter(resetRun=false){
    if(resetRun){const previous=clone(state.previous),legacy=clone(state.legacy);state=fresh();state.previous=previous;state.legacy=legacy;if(previous.chapter49Complete){state.silver+=previous.carriedSilver;state.inventory.push('水泊百肆安營約（前回承接）')}}
    state.started=true;state.scene='orders';screen='chapter';save(true);renderChapter();
  }
  function renderChapter(){
    screen='chapter';
    if(state.complete)return renderEnding();
    if(state.battle)return renderBattle();
    const scene=state.scene;
    let art='🏮',title='梁山聚義廳傳令',text='',choices=[];
    if(scene==='orders'){
      art='📜';title='宋江傳下百旅安宿令';text=`<p>揭陽江沿岸三日之內失蹤七名旅商，留下的旅簿被撕、寄存單號重複，渡口還出現一批來路不明的行囊。</p><p>李立低頭道：「我昔日也開過黑店，最清楚他們如何下藥、扣貨、毀簿。今日便用這份舊知，替過路人立一條安全歸途。」</p>`;
      choices=[['前往揭陽江渡口察訪','arrive']];
    }else if(scene==='arrive'){
      art='⛵';title='揭陽渡口・強拉旅客';text=`<p>渡口幾名伙計高喊「官定客棧」，強拉旅客入住；有人不肯，行囊便被搶去充作巡江費。</p><p>李立抽出短刀，指著假渡牌道：「這印記顛倒，是黑店自己刻的。」</p>`;
      choices=[[state.flags.battle1?'伙計已退，進入客棧查驗':'截下假渡牌，迎戰黑店伙計',state.flags.battle1?'investigate':'battle1']];
    }else if(scene==='investigate'){
      art='🔎';title='沿江客棧四項查驗';text=`<p>黑店伙計只是外圍。真正的證據藏在被撕改的旅簿、混入酒食的藥粉、重複編號的寄存單與封死的後門。請完成四項查驗。</p>`;
    }else if(scene==='guard'){
      art='🍶';title='酒甕藏藥・後院劫貨';text=`<p>四項證據相互吻合：黑店先以假渡牌攬客，再於酒食下藥，趁昏睡掉包貨物，最後撕去旅簿紀錄。</p><p>店徒正準備焚毀藥包與失聯名冊，後院仍有旅客呼救。</p>`;
      choices=[[state.flags.battle2?'店徒已敗，迎接江上援軍':'破甕救人，迎戰下藥店徒',state.flags.battle2?'council':'battle2']];
    }else if(scene==='council'){
      art='🐉';title='混江龍李俊破浪而來';text=`<p>混江龍李俊率童家水手靠岸，帶來從水寨截獲的假渡票與黑店分贓簿。他道：「陸上客棧與水上掮客是一條線，須讓燈號、渡船與夜巡彼此照應。」</p><p>李俊加入助陣，與李立共擬五階段「水泊百旅安宿」軍略。</p>`;
      choices=[['召開百旅安宿軍議','strategy']];
    }else if(scene==='strategy'){
      art='🧭';title='五階段百旅安宿軍略';text=`<p>依序完成旅簿、酒食、寄物、夜巡與失聯救濟，讓每一名旅客都能留下可追查的安全足跡。</p>`;
    }else if(scene==='boss'){
      art='🔥';title='黑店焚簿・江岸決戰';text=`<p>五階段制度公布後，黑店聯盟失去藏匿旅客與轉賣貨物的空間。盟主勾結水寨掮客夜襲公示站，企圖燒掉旅簿與救濟名冊。</p><p>李立守陸門，李俊封水路，沿江黑店的最後一戰就在眼前。</p>`;
      choices=[[state.flags.boss?'黑店盟主已敗，公布百旅新規':'迎戰沿江黑店盟主與水寨掮客',state.flags.boss?'establish':'bossbattle']];
    }else if(scene==='establish'){
      art='🏮';title='水泊百旅安宿制度';text=`<p>沿江客棧掛上統一燈號，旅簿、酒食、寄物與夜巡都有雙份紀錄。失聯旅商獲得醫治、安置與返鄉護送，被掉包的貨物也逐件追還。</p><p>李立把昔日黑店招牌劈成兩半，重新寫上：「酒食清白，旅人平安。」</p>`;
      choices=[['完成第五十回，立下水泊百旅安宿約','finish']];
    }
    app.innerHTML=`${header(title,'催命判官李立主理・混江龍李俊助陣')}${nav()}${hud()}<section class="card scene"><div class="scene-art">${art}</div><div class="scene-text">${text}</div>${scene==='investigate'?renderClues():scene==='strategy'?renderStrategy():`<div class="scene-choices">${choices.map(([l,a])=>`<button class="btn primary" data-act="${a}">${l}</button>`).join('')}</div>`}</section><section class="card" style="margin-top:14px"><h3>行動紀錄</h3><div class="log">${state.log.map(x=>`<div>${esc(x)}</div>`).join('')}</div></section>`;
  }

  function renderClues(){return `<div class="investigation">${CLUES.map(c=>{const done=state.clues.includes(c.id);return `<button class="btn evidence ${done?'done':''}" data-clue="${c.id}" ${done?'disabled':''}><span class="check">${done?'✓':c.icon}</span><strong>${c.title}</strong><span>${c.text}</span></button>`}).join('')}</div><div class="scene-choices">${state.clues.length===4?'<button class="btn primary" data-act="guard">證據齊全，追查酒甕與後院</button>':'<button class="btn" disabled>尚需完成四項查驗</button>'}</div>`}
  function inspect(id){if(state.clues.includes(id))return;const c=CLUES.find(x=>x.id===id);if(!c)return;state.clues.push(id);state.silver+=14;log(`完成查驗：${c.title}。`);tone('save');save(true);renderChapter();toast(`取得線索：${c.title}（${state.clues.length}/4）`)}
  function renderStrategy(){return `<div class="strategy-track">${STRATEGY.map((s,i)=>{const done=state.strategy.includes(i);const enabled=i===0||state.strategy.includes(i-1);return `<article class="strategy-step ${done?'done':''}"><span class="step-no">${done?'✓':i+1}</span><div><b>${s[0]}</b><p class="muted">${s[1]}</p></div><button class="btn small" data-strategy="${i}" ${done||!enabled?'disabled':''}>${done?'完成':'執行'}</button></article>`}).join('')}</div><div class="scene-choices">${state.strategy.length===5?'<button class="btn primary" data-act="boss">軍略完成，守護旅簿公示站</button>':'<button class="btn" disabled>依序完成五階段軍略</button>'}</div>`}
  function doStrategy(i){if(state.strategy.includes(i)||(i>0&&!state.strategy.includes(i-1)))return;state.strategy.push(i);state.hero.hp=clamp(state.hero.hp+65,0,state.hero.maxHp);state.hero.sp=clamp(state.hero.sp+75,0,state.hero.maxSp);log(`百旅軍略完成：${STRATEGY[i][0]}。`);save(true);renderChapter();tone('skill')}

  function beginBattle(type){
    const base=clone(ENEMIES[type]),d=difficulty();
    base.maxHp=Math.round(base.maxHp*d.hp);base.hp=base.maxHp;base.atk=Math.round(base.atk*d.atk);base.reward=Math.round(base.reward*d.reward);
    state.battle={type,enemy:base,turn:1,actions:0,log:[base.intro],companionUsed:false,difficulty:prefs.difficulty};
    state.hero.guarding=false;screen='chapter';save(true);renderBattle();tone('hurt');
  }
  function renderBattle(){
    const b=state.battle,h=state.hero,e=b.enemy;const d=DIFFICULTIES[b.difficulty]||difficulty();
    app.innerHTML=`${header(`戰鬥：${e.name}`,e.intro)}${nav()}<div class="battle-grid"><section id="heroFighter" class="fighter"><div class="fighter-head"><div class="portrait"><div class="avatar">立</div><div><h3>${h.name}</h3><span class="tag">攻 ${h.atk}</span><span class="tag">防 ${h.def}</span></div></div><span>${h.guarding?'🛡️ 守勢':''}</span></div><div class="statline"><span>氣血</span><div class="bar"><i style="width:${pct(h.hp,h.maxHp)}%"></i></div><b>${h.hp}/${h.maxHp}</b></div><div class="statline"><span>豪氣</span><div class="bar sp"><i style="width:${pct(h.sp,h.maxSp)}%"></i></div><b>${h.sp}/${h.maxSp}</b></div><div class="battle-actions"><button class="btn" data-battle="attack">判官短刀</button><button class="btn primary" data-battle="skill" ${h.sp<70?'disabled':''}>催命判官斷黑（70）</button><button class="btn" data-battle="sweep" ${h.sp<125?'disabled':''}>百旅安宿（125）</button><button class="btn" data-battle="guard">護住旅簿</button>${state.companion.unlocked?`<button class="btn good" data-battle="companion" ${b.companionUsed?'disabled':''}>李俊混江援護</button>`:''}<button class="btn" data-battle="medicine" ${state.inventory.includes('medicine')?'':'disabled'}>使用金瘡藥</button></div><div class="battle-note">${d.name}難度・本場獎勵 ${e.reward} 銀兩・已行動 ${b.actions} 次</div></section><section id="enemyFighter" class="fighter enemy"><div class="fighter-head"><div class="portrait"><div class="avatar">${e.icon}</div><div><h3>${e.name}</h3><span class="tag">攻 ${e.atk}</span><span class="tag">防 ${e.def}</span></div></div><b>第 ${b.turn} 合</b></div><div class="statline"><span>氣血</span><div class="bar"><i style="width:${pct(e.hp,e.maxHp)}%"></i></div><b>${e.hp}/${e.maxHp}</b></div><p>${esc(e.intro)}</p></section></div><section class="card" style="margin-top:14px"><h3>戰況</h3><div class="log">${b.log.map(x=>`<div>${esc(x)}</div>`).join('')}</div></section>`;
  }
  async function battleAction(act){
    if(battleBusy||!state.battle)return;battleBusy=true;
    const b=state.battle,h=state.hero,e=b.enemy;h.guarding=false;let dmg=0,acted=false;
    if(act==='attack'){acted=true;dmg=Math.max(18,h.atk+rand(-12,19)-e.def);e.hp-=dmg;b.log.unshift(`李立揮動判官短刀，造成 ${dmg} 點傷害。`);tone('hit')}
    if(act==='skill'&&h.sp>=70){acted=true;h.sp-=70;dmg=Math.max(58,Math.round(h.atk*1.68)+rand(12,36)-e.def);e.hp-=dmg;e.atk=Math.max(42,e.atk-6);b.log.unshift(`「催命判官斷黑」斬破假渡牌，造成 ${dmg} 點傷害，敵方攻勢下降。`);tone('skill')}
    if(act==='sweep'&&h.sp>=125){acted=true;h.sp-=125;dmg=Math.max(94,Math.round(h.atk*2.08)+rand(22,50)-Math.round(e.def*.58));e.hp-=dmg;h.hp=clamp(h.hp+55,0,h.maxHp);b.log.unshift(`「百旅安宿」封住黑店退路，造成 ${dmg} 點傷害並回復 55 氣血。`);tone('skill')}
    if(act==='guard'){acted=true;h.guarding=true;h.sp=clamp(h.sp+45,0,h.maxSp);b.log.unshift('李立護住旅簿與藥物證物，進入守勢並回復 45 豪氣。');tone('guard')}
    if(act==='companion'&&state.companion.unlocked&&!b.companionUsed){acted=true;b.companionUsed=true;dmg=205+rand(0,48);e.hp-=dmg;e.def=Math.max(10,e.def-11);h.hp=clamp(h.hp+35,0,h.maxHp);if(b.type==='boss')state.runStats.bossCompanionUsed=true;b.log.unshift(`李俊施展「混江龍截浪」，造成 ${dmg} 點傷害、降低敵方防禦並回復李立 35 氣血。`);tone('companion')}
    if(act==='medicine'&&state.inventory.includes('medicine')){acted=true;const at=state.inventory.indexOf('medicine');state.inventory.splice(at,1);h.hp=clamp(h.hp+290,0,h.maxHp);state.runStats.medicinesUsed++;b.log.unshift('李立使用金瘡藥，回復 290 氣血。');tone('save')}
    if(!acted){battleBusy=false;return}
    b.actions++;state.runStats.actions++;e.hp=Math.max(0,e.hp);renderBattle();await new Promise(r=>setTimeout(r,180));
    if(e.hp<=0){battleWin();battleBusy=false;return}
    const raw=Math.max(23,e.atk+rand(-9,17)-Math.round(h.def*.45));const taken=h.guarding?Math.round(raw*.38):raw;h.hp=Math.max(0,h.hp-taken);b.log.unshift(`${e.name}反擊，李立受到 ${taken} 點傷害。`);b.turn++;tone('hurt');
    if(h.hp<=0){state.runStats.defeats++;h.hp=Math.round(h.maxHp*.72);h.sp=Math.round(h.maxSp*.75);b.log.unshift('李立力竭後由巡江弟兄救回，整補後可重新挑戰。');state.battle=null;toast('本場失利，已返回戰前整補。');save(true);battleBusy=false;renderChapter();return}
    save(true);battleBusy=false;renderBattle();
  }
  function battleWin(){
    const type=state.battle.type,e=state.battle.enemy;state.silver+=e.reward;state.hero.hp=state.hero.maxHp;state.hero.sp=state.hero.maxSp;state.inventory.push('medicine');
    if(type==='patrol'){state.flags.battle1=true;state.scene='investigate';log('擊退攔客索財伙計，取得顛倒印記的假渡牌。')}
    if(type==='guard'){state.flags.battle2=true;state.companion.unlocked=true;state.scene='council';log('擊敗下藥店徒，救出後院旅客；混江龍李俊加入助陣。')}
    if(type==='boss'){state.flags.boss=true;state.scene='establish';log('擊敗沿江黑店盟主與水寨掮客，保住旅簿與救濟名冊。')}
    state.battle=null;save(true);tone('victory');toast(`勝利！獲得銀兩 ${e.reward}，並補充一帖金瘡藥。`);renderChapter();
  }

  function computeAchievements(){state.achievements=ACHIEVEMENTS.filter(([, ,test])=>test(state)).map(([name])=>name)}
  function finish(){
    state.complete=true;state.flags.system=true;state.scene='ending';
    for(const x of ['沿江旅店安宿簿','酒食藥物驗看冊','水泊百旅安宿約'])if(!state.inventory.includes(x))state.inventory.push(x);
    state.silver+=340;computeAchievements();log(`第五十回完成：水泊百旅安宿制度正式建立，解鎖 ${state.achievements.length} 項成就。`);save(true);renderEnding();tone('achievement');
  }
  function renderAchievements(){return `<div class="achievement-grid">${ACHIEVEMENTS.map(([name,text])=>{const ok=state.achievements.includes(name);return `<article class="achievement ${ok?'':'locked'}"><b>${ok?'🏅':'🔒'} ${name}</b><span>${text}</span></article>`}).join('')}</div>`}
  function renderEnding(){
    screen='ending';
    app.innerHTML=`${header('第五十回完・百旅安宿','李立正式列入五十英雄譜，李俊加入梁山助陣')}${nav()}<section class="hero"><div class="eyebrow">制度章回完成</div><h1>酒食清白，旅人平安</h1><h2>催命判官李立・第五十名主角</h2><p>沿江客棧皆須保存旅簿、酒食來源、寄物封記與夜巡紀錄；旅客若失聯、受傷或財物遭扣，水陸燈號立即聯動，提供尋人、醫治、安置、追償與返鄉護送。</p><div class="actions"><button class="btn primary" data-act="replay">重演第五十回</button><button class="btn" data-act="roster">查看五十英雄譜</button><button class="btn" data-act="manage">匯出完成存檔</button><a class="btn" href="previous-v6.0.0/index.html">重遊第四十九回</a></div></section><div class="grid three" style="margin-top:16px"><section class="card"><h3>章回成果</h3><p>四項查驗 ${state.clues.length}/4<br>五階段軍略 ${state.strategy.length}/5<br>三場主線戰鬥 3/3<br>總行動 ${state.runStats.actions} 次</p></section><section class="card"><h3>制度收藏</h3>${state.inventory.filter(x=>typeof x==='string'&&x!=='medicine').map(x=>`<p>✓ ${esc(x)}</p>`).join('')}</section><section class="card"><h3>後續伏筆</h3><p>混江龍李俊已加入同伴編成。下一回可由李俊升格主角，整頓渡船、水寨與沿江航路安全。</p></section></div><section class="card" style="margin-top:16px"><h3>第五十回成就（${state.achievements.length}/4）</h3>${renderAchievements()}</section>`;
  }

  function renderRoster(){screen='roster';app.innerHTML=`${header('五十英雄譜','李立完成百旅安宿後正式列席')}${nav()}<div class="grid three" style="margin-top:16px">${ROSTER.map((n,i)=>`<article class="card ${i===49?'success':''}"><div class="portrait"><div class="avatar">${esc(n[0])}</div><div><span class="tag">第 ${i+1} 席</span><h3>${esc(n)}</h3><p>${i===49?'催命判官・百旅安宿主理':i>=34?'制度章回英雄':'梁山前篇英雄'}</p></div></div></article>`).join('')}</div>`}
  function renderTimeline(){screen='timeline';app.innerHTML=`${header('第三十五至五十回章回錄','由百田安灌一路延伸至百旅安宿')}${nav()}<section class="timeline" style="margin-top:16px">${CHAPTERS.map(c=>`<article class="${c[0]===50?'current':''}"><b>第${c[0]}回</b><div><h3>${c[1]}</h3><p>主角：${c[2]}　新同伴：${c[3]}</p>${c[0]===48?'<span class="tag good">v5.9.0 測試紀錄</span>':''}${c[0]===49?'<span class="tag good">v6.0.0 已保留</span>':''}${c[0]===50?'<span class="tag good">v6.1.0 本版可遊玩</span>':''}</div></article>`).join('')}</section>`}

  function openManage(){const data=JSON.stringify(state,null,2);openModal('存檔管理',`<p>v6.1.0 沿用續篇存檔鍵，首次讀取 v6.0.0 時會自動建立前回備份，再開啟第五十回。</p><textarea id="saveText" spellcheck="false">${esc(data)}</textarea><div class="actions"><button class="btn primary" data-modal="copy">複製存檔</button><button class="btn" data-modal="download">下載 JSON</button><button class="btn" data-modal="import">匯入文字</button><button class="btn danger" data-modal="reset">重設第五十回</button></div>`)}
  function openAbout(){openModal('v6.1.0 版本說明',`<h3>第五十回「催命判官察店・百旅安宿」</h3><p>新增李立主角、李俊同伴、三場戰鬥、四項沿江客棧查驗、五階段軍略、五十英雄譜與第三十五至五十回章回錄。</p><h3>難度與成就</h3><p>新增故事、標準、豪傑三種難度，以及明察秋毫、三戰連捷、清醒到底、判官獨守四項章回成就。</p><h3>存檔安全</h3><p>偵測到 v6.0.0 存檔時，會先備份到 <span class="code">${V60_BACKUP_KEY}</span>，再將完成狀態與部分銀兩承接至第五十回。經典篇存檔仍只讀不覆寫。</p><h3>前版與經典篇</h3><p>壓縮檔內保留 <span class="code">previous-v6.0.0/</span> 與 <span class="code">legacy-v4.5.0/</span>，可由首頁直接開啟。</p>`)}
  function openModal(title,html){modalRoot.classList.remove('hidden');modalRoot.innerHTML=`<section class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>${esc(title)}</h2><button class="icon-btn" data-modal="close">✕</button></div>${html}</section>`}
  function closeModal(){modalRoot.classList.add('hidden');modalRoot.innerHTML=''}

  function render(){document.body.dataset.theme=prefs.theme;$('#soundBtn').textContent=prefs.sound?'🔊':'🔇';if(screen==='home')renderHome();else if(screen==='chapter')renderChapter();else if(screen==='ending')renderEnding();else if(screen==='roster')renderRoster();else if(screen==='timeline')renderTimeline()}

  document.addEventListener('click',async e=>{
    const act=e.target.closest('[data-act]')?.dataset.act;
    if(act){
      if(act==='home')renderHome();if(act==='start')startChapter(false);if(act==='continue'){screen='chapter';renderChapter()}if(act==='replay')startChapter(true);if(act==='chapter'){screen='chapter';renderChapter()}if(act==='roster')renderRoster();if(act==='timeline')renderTimeline();if(act==='save')save();if(act==='manage')openManage();
      if(['arrive','investigate','guard','council','strategy','boss','establish'].includes(act)){state.scene=act;save(true);renderChapter()}
      if(act==='battle1')beginBattle('patrol');if(act==='battle2')beginBattle('guard');if(act==='bossbattle')beginBattle('boss');if(act==='finish')finish();
    }
    const diff=e.target.closest('[data-difficulty]')?.dataset.difficulty;
    if(diff&&DIFFICULTIES[diff]){if(state.battle)return toast('戰鬥進行中不能切換難度。');prefs.difficulty=diff;savePrefs();render();toast(`已切換為${DIFFICULTIES[diff].name}難度。`)}
    const clue=e.target.closest('[data-clue]')?.dataset.clue;if(clue)inspect(clue);
    const st=e.target.closest('[data-strategy]')?.dataset.strategy;if(st!==undefined)doStrategy(Number(st));
    const ba=e.target.closest('[data-battle]')?.dataset.battle;if(ba)await battleAction(ba);
    const ma=e.target.closest('[data-modal]')?.dataset.modal;
    if(ma==='close')closeModal();
    if(ma==='copy'){try{await navigator.clipboard?.writeText($('#saveText').value);toast('存檔文字已複製。')}catch{toast('無法直接複製，請手動全選文字。')}}
    if(ma==='download'){const blob=new Blob([$('#saveText').value],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='水滸英雄傳_v6.1.0_存檔.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
    if(ma==='import'){try{const x=JSON.parse($('#saveText').value);state=importState(x);save(true);closeModal();renderHome();toast(x.version==='6.0.0'||x.hero?.name==='施恩'?'v6.0.0 存檔已備份並承接至第五十回。':'存檔匯入成功。')}catch{toast('存檔 JSON 格式不正確。')}}
    if(ma==='reset'){if(confirm('只重設 v6.1.0 第五十回進度，前回備份與經典篇不受影響。確定嗎？')){closeModal();reset()}}
  });
  $('#brandBtn').addEventListener('click',renderHome);
  $('#aboutBtn').addEventListener('click',openAbout);
  $('#themeBtn').addEventListener('click',()=>{const arr=['ink','dark','paper'];prefs.theme=arr[(arr.indexOf(prefs.theme)+1)%arr.length];savePrefs();render();toast(`已切換為 ${prefs.theme==='ink'?'水墨':prefs.theme==='dark'?'深色':'電子紙'}模式。`)});
  $('#soundBtn').addEventListener('click',()=>{prefs.sound=!prefs.sound;savePrefs();render();if(prefs.sound)tone('save')});
  $('#narrateBtn').addEventListener('click',()=>{speechOn=!speechOn;$('#narrateBtn').textContent=speechOn?'停':'朗';if(speechOn)speak(app.innerText);else speechSynthesis?.cancel()});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden')});
  $('#installBtn').addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').classList.add('hidden')});
  window.addEventListener('beforeunload',()=>save(true));
  if('serviceWorker'in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(console.warn));
  render();
})();
