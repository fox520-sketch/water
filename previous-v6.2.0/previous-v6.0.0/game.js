(() => {
  'use strict';
  const VERSION = '6.0.0';
  const SAVE_KEY = 'liangshan-rpg-sequel-v6.0-backup';
  const SOURCE_KEY = 'liangshan-rpg-sequel-v6';
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
      const probe = '__liangshan_v6_probe__';
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
    [49,'金眼彪巡肆・百肆安營','施恩','李立']
  ];
  const ROSTER = [
    '武松','魯達','林沖','楊志','宋江','李逵','扈三娘','呼延灼','盧俊義','公孫勝','張清','花榮','瓊英','燕青','張順','戴宗','朱武','蕭讓','裴宣','樂和','金大堅','孟康','侯健','湯隆','凌振','皇甫端','曹正','孫二娘','張青','顧大嫂','孫新','解珍','解寶','鄒淵','鄒潤','陶宗旺','杜遷','宋萬','朱貴','朱富','李雲','杜興','李應','朱仝','雷橫','穆春','穆弘','薛永','施恩'
  ];
  const CLUES = [
    {id:'registry', title:'店籍與租權', icon:'📜', text:'核對店主、出租人、承租人、代理權與店址四至，禁止冒名占店與重複出租。'},
    {id:'contract', title:'租契與抽成', icon:'🧾', text:'查驗租期、租金、押金、抽成、續租與退租條款，不准空白契、暗加費與強迫畫押。'},
    {id:'fees', title:'收費與帳冊', icon:'⚖️', text:'所有場地費、清潔費與公攤須明示、給據、登帳；不得私收保護錢或重複收款。'},
    {id:'safety', title:'安全與救濟', icon:'🧯', text:'保留消防、疏散、夜間照明與求援通道；遇傷害、封店或爭議須有停業安置與申訴救濟。'}
  ];
  const STRATEGY = [
    ['店籍立號','為每一商肆建立店址、店主、承租人與代理權資料。'],
    ['租契明示','契約逐條宣讀，租金、押金、抽成與期限不得留白。'],
    ['收費公示','費目、金額、收據與帳冊同步公開，杜絕私收。'],
    ['安全巡檢','逐店查驗消防、疏散、照明、容量與緊急通報。'],
    ['爭議救濟','建立申訴、暫停強制、返還超收、安置與復業流程。']
  ];
  const ENEMIES = {
    patrol:{name:'霸場收費惡卒', icon:'卒', maxHp:720, hp:720, atk:72, def:24, reward:90, intro:'惡卒拿著假榜文逐店收取「護場錢」，拒繳便砸攤封門。'},
    guard:{name:'奪店封門護院', icon:'護', maxHp:900, hp:900, atk:82, def:29, reward:130, intro:'護院持空白租契闖入店內，逼掌櫃畫押，並堵住後門與求援通道。'},
    boss:{name:'抽成豪強與霸肆掮客', icon:'霸', maxHp:1260, hp:1260, atk:94, def:35, reward:220, intro:'豪強以層層抽成、重複收費與暴力封店控制快活林商肆。'}
  };

  const fresh = () => ({
    version:VERSION, updatedAt:new Date().toISOString(), started:false, complete:false, scene:'home',
    hero:{name:'施恩', title:'金眼彪・快活林義士', level:49, hp:1180, maxHp:1180, sp:820, maxSp:820, atk:126, def:74, guarding:false},
    companion:{name:'李立', title:'催命判官・揭陽嶺酒店頭領', unlocked:false, used:false},
    clues:[], strategy:[], flags:{battle1:false,battle2:false,boss:false,system:false}, inventory:[], silver:260,
    log:['第四十九回待命：施恩將巡查快活林百肆。'], battle:null,
    legacy:{detected:false, version:'', chapter48Complete:false, chapter34Complete:false}
  });

  let state = loadState();
  let prefs = loadPrefs();
  let screen = 'home';
  let deferredPrompt = null;
  let audio = null;
  let speechOn = false;
  let battleBusy = false;

  function loadPrefs(){try{return {...{theme:'ink',sound:true},...JSON.parse(storage.getItem(PREF_KEY)||'{}')}}catch{return {theme:'ink',sound:true}}}
  function savePrefs(){storage.setItem(PREF_KEY,JSON.stringify(prefs))}
  function detectLegacy(target){
    try{
      const old = JSON.parse(storage.getItem(LEGACY_KEY)||'null');
      if(!old) return target;
      target.legacy = {detected:true,version:old.version||old.gameVersion||'舊版',chapter48Complete:!!old.flags?.chapter48Complete,chapter34Complete:!!old.flags?.chapter34Complete};
      return target;
    }catch{return target}
  }
  function loadState(){
    try{
      let raw = JSON.parse(storage.getItem(SAVE_KEY)||'null');
      if(!raw){ const source=JSON.parse(storage.getItem(SOURCE_KEY)||'null'); if(source?.version==='6.0.0'){ raw=source; storage.setItem(SAVE_KEY,JSON.stringify(source)); } }
      if(raw && raw.hero){
        const base=fresh(); const merged={...base,...raw,hero:{...base.hero,...raw.hero},companion:{...base.companion,...raw.companion},flags:{...base.flags,...raw.flags},legacy:{...base.legacy,...raw.legacy}};
        merged.version=VERSION; return detectLegacy(merged);
      }
    }catch{}
    return detectLegacy(fresh());
  }
  function save(silent=false){state.updatedAt=new Date().toISOString();state.version=VERSION;storage.setItem(SAVE_KEY,JSON.stringify(state));if(!silent){toast('續篇進度已收入本機存檔。');tone('save')}}
  function reset(){storage.removeItem(SAVE_KEY);state=detectLegacy(fresh());screen='home';render();toast('已重設 v6.0.0 續篇；原版存檔未受影響。')}

  function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function pct(a,b){return clamp(Math.round(a/b*100),0,100)}
  function toast(msg){const n=document.createElement('div');n.className='toast';n.textContent=msg;toastRoot.append(n);setTimeout(()=>n.remove(),3000)}
  function tone(kind){if(!prefs.sound)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime;const m={hit:[150,.08],hurt:[85,.11],skill:[430,.14],victory:[690,.24],save:[520,.09],guard:[280,.08],companion:[590,.16]};const [f,d]=m[kind]||[360,.08];o.frequency.setValueAtTime(f,now);if(kind==='victory')o.frequency.exponentialRampToValueAtTime(f*1.5,now+d);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.07,now+.01);g.gain.exponentialRampToValueAtTime(.0001,now+d);o.connect(g).connect(audio.destination);o.start();o.stop(now+d+.02)}catch{}}
  function log(msg){state.log.unshift(msg);state.log=state.log.slice(0,30)}
  function speak(text){if(!('speechSynthesis'in window))return toast('此瀏覽器不支援語音朗讀。');speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g,''));u.lang='zh-TW';u.rate=.9;speechSynthesis.speak(u)}
  function legacyText(){if(!state.legacy.detected)return '未偵測到舊版存檔；仍可直接體驗第四十九回。';const done=state.legacy.chapter48Complete?'已完成第四十八回':'尚未確認第四十八回完成';return `偵測到 ${state.legacy.version} 存檔（${done}）。本續篇只讀取完成狀態，不會覆寫原存檔。`}

  function header(title,sub=''){
    return `<div class="chapter-banner"><div class="eyebrow">第四十九回・續篇</div><h1>${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:''}</div>`;
  }
  function hud(){const h=state.hero;return `<div class="hud">
    <section class="card portrait"><div class="avatar">施</div><div><h3>${h.title}</h3><b>Lv.${h.level} ${h.name}</b><div class="statline"><span>氣血</span><div class="bar"><i style="width:${pct(h.hp,h.maxHp)}%"></i></div><b>${h.hp}/${h.maxHp}</b></div><div class="statline"><span>豪氣</span><div class="bar sp"><i style="width:${pct(h.sp,h.maxSp)}%"></i></div><b>${h.sp}/${h.maxSp}</b></div></div></section>
    <section class="card"><h3>章回進度</h3><p>查驗 ${state.clues.length}/4　軍略 ${state.strategy.length}/5</p><p>李立助陣：${state.companion.unlocked?'已加入':'尚未加入'}　百肆制度：${state.flags.system?'已建立':'待建立'}</p><div class="save-status"><span class="tag ${state.complete?'good':''}">${state.complete?'第四十九回完成':'進行中'}</span><span class="tag">銀兩 ${state.silver}</span></div></section>
  </div>`}
  function nav(){return `<div class="actions"><button class="btn small" data-act="home">首頁</button><button class="btn small" data-act="chapter">章回</button><button class="btn small" data-act="roster">英雄譜</button><button class="btn small" data-act="timeline">章回錄</button><button class="btn small" data-act="save">存檔</button><button class="btn small" data-act="manage">存檔管理</button></div>`}

  function renderHome(){
    screen='home';
    app.innerHTML=`<section class="hero"><div class="eyebrow">WATER MARGIN RPG · VERSION ${VERSION}</div><h1>水滸英雄傳</h1><h2>第四十九回「金眼彪巡肆・百肆安營」</h2><p>薛永整頓百藝演場後，快活林商肆又傳出霸場收費、空白租契、強奪店面與封堵逃生口。金眼彪施恩奉令巡肆，將以公開店籍、明示租契、收費公示、安全巡檢與爭議救濟，為水泊百業立下新規。</p><div class="actions"><button class="btn primary" data-act="${state.started?'continue':'start'}">${state.started?'繼續第四十九回':'開啟第四十九回'}</button>${state.complete?'<button class="btn good" data-act="replay">重演第四十九回</button>':''}<button class="btn" data-act="timeline">查看第三十五至四十九回</button><a class="btn" href="../legacy-v4.5.0/index.html">開啟經典篇 v4.5.0</a></div></section>
    <div class="grid two" style="margin-top:16px"><section class="card ${state.legacy.detected?'success':'warning'}"><h3>舊存檔銜接</h3><p>${esc(legacyText())}</p></section><section class="card"><h3>本版新增</h3><p><span class="tag">第 49 名主角：施恩</span><span class="tag">新同伴：李立</span><span class="tag">三場戰鬥</span><span class="tag">四項查驗</span><span class="tag">五階段軍略</span></p><p class="muted">支援桌面、手機、離線 PWA、深色模式、電子紙模式、語音朗讀與 JSON 存檔匯出入。</p></section></div>`;
    app.focus();
  }

  function startChapter(resetRun=false){
    if(resetRun){const legacy=clone(state.legacy);state=fresh();state.legacy=legacy;}
    state.started=true;state.scene='orders';screen='chapter';save(true);renderChapter();
  }
  function renderChapter(){
    screen='chapter';
    if(state.complete){return renderEnding()}
    if(state.battle){return renderBattle()}
    const scene=state.scene;
    let art='🏮', title='梁山聚義廳傳令', text='', choices=[];
    if(scene==='orders'){
      art='📜';title='宋江傳下百肆安營令';text=`<p>快活林原是商旅歇腳、百藝聚集之地。近日卻有人持假榜文逐店收取護場錢，又以空白租契逼商戶畫押。</p><p>宋江道：「百藝能安演，百肆也須安營。施恩熟悉快活林人情，便由你核清店籍、租契與收費。」</p>`;
      choices=[['前往快活林商肆踏勘','arrive']];
    } else if(scene==='arrive'){
      art='🏮';title='快活林口・惡卒攔路';text=`<p>林口懸著新榜：「凡在此營業，每日另納護場錢。」店家低頭不敢言，兩名惡卒正掀翻拒繳攤位。</p><p>施恩按住巡肆棍：「梁山公示費目裡，沒有這一條。」</p>`;
      choices=[[state.flags.battle1?'惡卒已退，開始逐店查驗':'喝止霸場收費，迎戰惡卒',state.flags.battle1?'investigate':'battle1']];
    } else if(scene==='investigate'){
      art='🔎';title='百肆四項查驗';text=`<p>霸場惡卒已退，但真正控制商肆的，是藏在租契、抽成、私費與封店手段後的豪強。請完成四項查驗。</p>`;
    } else if(scene==='guard'){
      art='🚪';title='空白租契・護院封門';text=`<p>四項證據拼成完整脈絡：豪強先冒名出租，再用空白契追加抽成；商戶若抗議，便以欠費為名封門。</p><p>護院已堵住後巷，準備焚毀帳冊。</p>`;
      choices=[[state.flags.battle2?'護院已敗，與李立會合':'破門護冊，迎戰封店護院',state.flags.battle2?'council':'battle2']];
    } else if(scene==='council'){
      art='🍶';title='催命判官李立入局';text=`<p>揭陽嶺酒店頭領李立帶著幾名受害掌櫃趕來，交出一疊重複收費回條：「同一個月，護院竟收了三次。」</p><p>李立願加入助陣，並協助建立五階段「水泊百肆安營」軍略。</p>`;
      choices=[['召開百肆安營軍議','strategy']];
    } else if(scene==='strategy'){
      art='🧭';title='五階段百肆安營軍略';text=`<p>依序完成店籍、租契、收費、安全與救濟，削弱豪強控制商肆的根基。</p>`;
    } else if(scene==='boss'){
      art='🔥';title='豪強焚冊・快活林決戰';text=`<p>五階段制度一立，霸肆掮客失去私下操作的空間。豪強率眾闖入公示場，企圖焚毀店籍與收費帳冊。</p><p>施恩與李立並肩守住總冊，最後一戰就在眼前。</p>`;
      choices=[[state.flags.boss?'豪強已敗，宣告百肆新規':'迎戰抽成豪強與霸肆掮客',state.flags.boss?'establish':'bossbattle']];
    } else if(scene==='establish'){
      art='⚖️';title='水泊百肆安營制度';text=`<p>店籍、租契、費目與安全巡檢榜在快活林口同時公開。被迫多繳的費用逐筆退還，遭封店者可暫停強制並申請復業。</p><p>百姓看得見規則，掌櫃拿得到副本，豪強再不能靠空白紙與私下抽成操控百肆。</p>`;
      choices=[['完成第四十九回，立下水泊百肆安營約','finish']];
    }
    app.innerHTML=`${header(title,'金眼彪施恩主理・催命判官李立助陣')}${nav()}${hud()}<section class="card scene"><div class="scene-art">${art}</div><div class="scene-text">${text}</div>${scene==='investigate'?renderClues():scene==='strategy'?renderStrategy():`<div class="scene-choices">${choices.map(([l,a])=>`<button class="btn primary" data-act="${a}">${l}</button>`).join('')}</div>`}</section><section class="card" style="margin-top:14px"><h3>行動紀錄</h3><div class="log">${state.log.map(x=>`<div>${esc(x)}</div>`).join('')}</div></section>`;
  }

  function renderClues(){return `<div class="investigation">${CLUES.map(c=>{const done=state.clues.includes(c.id);return `<button class="btn evidence ${done?'done':''}" data-clue="${c.id}" ${done?'disabled':''}><span class="check">${done?'✓':c.icon}</span><strong>${c.title}</strong><span>${c.text}</span></button>`}).join('')}</div><div class="scene-choices">${state.clues.length===4?'<button class="btn primary" data-act="guard">證據齊全，追查封店護院</button>':'<button class="btn" disabled>尚需完成四項查驗</button>'}</div>`}
  function inspect(id){if(state.clues.includes(id))return;const c=CLUES.find(x=>x.id===id);state.clues.push(id);state.silver+=12;log(`完成查驗：${c.title}。`);tone('save');save(true);renderChapter();toast(`取得線索：${c.title}（${state.clues.length}/4）`)}
  function renderStrategy(){return `<div class="strategy-track">${STRATEGY.map((s,i)=>{const done=state.strategy.includes(i);const enabled=i===0||state.strategy.includes(i-1);return `<article class="strategy-step ${done?'done':''}"><span class="step-no">${done?'✓':i+1}</span><div><b>${s[0]}</b><p class="muted">${s[1]}</p></div><button class="btn small" data-strategy="${i}" ${done||!enabled?'disabled':''}>${done?'完成':'執行'}</button></article>`}).join('')}</div><div class="scene-choices">${state.strategy.length===5?'<button class="btn primary" data-act="boss">軍略完成，守護公示總冊</button>':'<button class="btn" disabled>依序完成五階段軍略</button>'}</div>`}
  function doStrategy(i){if(state.strategy.includes(i)||(i>0&&!state.strategy.includes(i-1)))return;state.strategy.push(i);state.hero.hp=clamp(state.hero.hp+60,0,state.hero.maxHp);state.hero.sp=clamp(state.hero.sp+70,0,state.hero.maxSp);log(`百肆軍略完成：${STRATEGY[i][0]}。`);save(true);renderChapter();tone('skill')}

  function beginBattle(type){
    const e=clone(ENEMIES[type]);state.battle={type,enemy:e,turn:1,log:[e.intro],companionUsed:false};state.hero.guarding=false;screen='chapter';save(true);renderBattle();tone('hurt')
  }
  function renderBattle(){
    const b=state.battle,h=state.hero,e=b.enemy;app.innerHTML=`${header(`戰鬥：${e.name}`,e.intro)}${nav()}<div class="battle-grid"><section id="heroFighter" class="fighter"><div class="fighter-head"><div class="portrait"><div class="avatar">施</div><div><h3>${h.name}</h3><span class="tag">攻 ${h.atk}</span><span class="tag">防 ${h.def}</span></div></div><span>${h.guarding?'🛡️ 守勢':''}</span></div><div class="statline"><span>氣血</span><div class="bar"><i style="width:${pct(h.hp,h.maxHp)}%"></i></div><b>${h.hp}/${h.maxHp}</b></div><div class="statline"><span>豪氣</span><div class="bar sp"><i style="width:${pct(h.sp,h.maxSp)}%"></i></div><b>${h.sp}/${h.maxSp}</b></div><div class="battle-actions"><button class="btn" data-battle="attack">巡肆棍擊</button><button class="btn primary" data-battle="skill" ${h.sp<70?'disabled':''}>金眼彪巡肆（70）</button><button class="btn" data-battle="sweep" ${h.sp<120?'disabled':''}>四肆安營（120）</button><button class="btn" data-battle="guard">守住帳冊</button>${state.companion.unlocked?`<button class="btn good" data-battle="companion" ${b.companionUsed?'disabled':''}>李立援護</button>`:''}<button class="btn" data-battle="medicine" ${state.inventory.includes('medicine')?'':'disabled'}>使用金瘡藥</button></div></section><section id="enemyFighter" class="fighter enemy"><div class="fighter-head"><div class="portrait"><div class="avatar">${e.icon}</div><div><h3>${e.name}</h3><span class="tag">攻 ${e.atk}</span><span class="tag">防 ${e.def}</span></div></div><b>第 ${b.turn} 合</b></div><div class="statline"><span>氣血</span><div class="bar"><i style="width:${pct(e.hp,e.maxHp)}%"></i></div><b>${e.hp}/${e.maxHp}</b></div><p>${esc(e.intro)}</p></section></div><section class="card" style="margin-top:14px"><h3>戰況</h3><div class="log">${b.log.map(x=>`<div>${esc(x)}</div>`).join('')}</div></section>`;
  }
  async function battleAction(act){if(battleBusy||!state.battle)return;battleBusy=true;const b=state.battle,h=state.hero,e=b.enemy;h.guarding=false;let dmg=0;
    if(act==='attack'){dmg=Math.max(18,h.atk+rand(-12,18)-e.def);e.hp-=dmg;b.log.unshift(`施恩揮棍巡肆，造成 ${dmg} 點傷害。`);tone('hit')}
    if(act==='skill'&&h.sp>=70){h.sp-=70;dmg=Math.max(55,Math.round(h.atk*1.65)+rand(10,35)-e.def);e.hp-=dmg;e.atk=Math.max(40,e.atk-6);b.log.unshift(`「金眼彪巡肆」擊破私榜，造成 ${dmg} 點傷害，敵方攻勢下降。`);tone('skill')}
    if(act==='sweep'&&h.sp>=120){h.sp-=120;dmg=Math.max(90,Math.round(h.atk*2.05)+rand(20,48)-Math.round(e.def*.6));e.hp-=dmg;h.hp=clamp(h.hp+45,0,h.maxHp);b.log.unshift(`「四肆安營」連護四方，造成 ${dmg} 點傷害並回復 45 氣血。`);tone('skill')}
    if(act==='guard'){h.guarding=true;h.sp=clamp(h.sp+42,0,h.maxSp);b.log.unshift('施恩護住店籍總冊，進入守勢並回復 42 豪氣。');tone('guard')}
    if(act==='companion'&&state.companion.unlocked&&!b.companionUsed){b.companionUsed=true;dmg=185+rand(0,45);e.hp-=dmg;e.def=Math.max(10,e.def-10);b.log.unshift(`李立施展「催命判官斷霸」，造成 ${dmg} 點傷害，並揭破豪強假契。`);tone('companion')}
    if(act==='medicine'&&state.inventory.includes('medicine')){state.inventory=state.inventory.filter(x=>x!=='medicine');h.hp=clamp(h.hp+280,0,h.maxHp);b.log.unshift('施恩使用金瘡藥，回復 280 氣血。');tone('save')}
    e.hp=Math.max(0,e.hp);renderBattle();await new Promise(r=>setTimeout(r,180));
    if(e.hp<=0){battleWin();battleBusy=false;return}
    const raw=Math.max(22,e.atk+rand(-9,16)-Math.round(h.def*.45));const taken=h.guarding?Math.round(raw*.38):raw;h.hp=Math.max(0,h.hp-taken);b.log.unshift(`${e.name}反擊，施恩受到 ${taken} 點傷害。`);b.turn++;tone('hurt');
    if(h.hp<=0){h.hp=Math.round(h.maxHp*.72);h.sp=Math.round(h.maxSp*.75);b.log.unshift('施恩力竭後由梁山弟兄救回，整補後可重新挑戰。');state.battle=null;toast('本場失利，已返回戰前整補。');save(true);battleBusy=false;renderChapter();return}
    save(true);battleBusy=false;renderBattle();
  }
  function battleWin(){const type=state.battle.type,e=state.battle.enemy;state.silver+=e.reward;state.hero.hp=state.hero.maxHp;state.hero.sp=state.hero.maxSp;state.inventory.push('medicine');if(type==='patrol'){state.flags.battle1=true;state.scene='investigate';log('擊退霸場收費惡卒，取得假榜文。')}if(type==='guard'){state.flags.battle2=true;state.companion.unlocked=true;state.scene='council';log('擊敗封店護院，催命判官李立加入助陣。')}if(type==='boss'){state.flags.boss=true;state.scene='establish';log('擊敗抽成豪強與霸肆掮客，保住百肆總冊。')}state.battle=null;save(true);tone('victory');toast(`勝利！獲得銀兩 ${e.reward}，並補充一帖金瘡藥。`);renderChapter()}

  function finish(){state.complete=true;state.flags.system=true;state.scene='ending';for(const x of ['商肆租契總冊','收費安全巡檢簿','水泊百肆安營約'])if(!state.inventory.includes(x))state.inventory.push(x);state.silver+=300;log('第四十九回完成：水泊百肆安營制度正式建立。');save(true);renderEnding();tone('victory')}
  function renderEnding(){screen='ending';app.innerHTML=`${header('第四十九回完・百肆安營','施恩正式列入四十九英雄譜，李立加入梁山助陣')}${nav()}<section class="hero"><div class="eyebrow">制度章回完成</div><h1>百肆有籍，營業有安</h1><h2>金眼彪施恩・第四十九名主角</h2><p>快活林各店皆有店籍副本，租契不得留白，收費必須公示給據，消防與疏散通道不得封堵；遇到霸占、超收或暴力封店，商戶可立即申訴、暫停強制並取得復業救濟。</p><div class="actions"><button class="btn primary" data-act="replay">重演第四十九回</button><button class="btn" data-act="roster">查看四十九英雄譜</button><button class="btn" data-act="manage">匯出完成存檔</button></div></section><div class="grid three" style="margin-top:16px"><section class="card"><h3>章回成果</h3><p>四項查驗 ${state.clues.length}/4<br>五階段軍略 ${state.strategy.length}/5<br>三場主線戰鬥 3/3</p></section><section class="card"><h3>制度收藏</h3>${state.inventory.filter(x=>typeof x==='string'&&x!=='medicine').map(x=>`<p>✓ ${esc(x)}</p>`).join('')}</section><section class="card"><h3>後續伏筆</h3><p>催命判官李立已加入同伴編成。下一回可由李立升格主角，追查沿江黑店與旅商救濟。</p></section></div>`}

  function renderRoster(){screen='roster';app.innerHTML=`${header('四十九英雄譜','施恩完成百肆安營後正式列席')}${nav()}<div class="grid three" style="margin-top:16px">${ROSTER.map((n,i)=>`<article class="card ${i===48?'success':''}"><div class="portrait"><div class="avatar">${esc(n[0])}</div><div><span class="tag">第 ${i+1} 席</span><h3>${esc(n)}</h3><p>${i===48?'金眼彪・百肆安營主理':i>=34?'制度章回英雄':'梁山前篇英雄'}</p></div></div></article>`).join('')}</div>`}
  function renderTimeline(){screen='timeline';app.innerHTML=`${header('第三十五至四十九回章回錄','由百田安灌一路延伸至百肆安營')}${nav()}<section class="timeline" style="margin-top:16px">${CHAPTERS.map(c=>`<article class="${c[0]===49?'current':''}"><b>第${c[0]}回</b><div><h3>${c[1]}</h3><p>主角：${c[2]}　新同伴：${c[3]}</p>${c[0]===48?'<span class="tag good">v5.9.0 已有測試紀錄</span>':''}${c[0]===49?'<span class="tag good">v6.0.0 本版可遊玩</span>':''}</div></article>`).join('')}</section>`}

  function openManage(){const data=JSON.stringify(state,null,2);openModal('存檔管理',`<p>v6 續篇使用獨立存檔鍵，不會改寫經典篇資料。</p><textarea id="saveText" spellcheck="false">${esc(data)}</textarea><div class="actions"><button class="btn primary" data-modal="copy">複製存檔</button><button class="btn" data-modal="download">下載 JSON</button><button class="btn" data-modal="import">匯入文字</button><button class="btn danger" data-modal="reset">重設續篇</button></div>`)}
  function openAbout(){openModal('v6.0.0 版本說明',`<h3>第四十九回「金眼彪巡肆・百肆安營」</h3><p>新增施恩主角、李立同伴、三場戰鬥、四項商肆查驗、五階段軍略、四十九英雄譜與第三十五至四十九回章回錄。</p><h3>存檔安全</h3><p>本版會唯讀偵測 <span class="code">${LEGACY_KEY}</span>，實際續篇存檔寫入 <span class="code">${SAVE_KEY}</span>，不會覆蓋原遊戲。</p><h3>經典篇</h3><p>壓縮檔內完整保留你上傳的 v4.5.0 程式，位於 <span class="code">legacy-v4.5.0/</span>。</p>`)}
  function openModal(title,html){modalRoot.classList.remove('hidden');modalRoot.innerHTML=`<section class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>${esc(title)}</h2><button class="icon-btn" data-modal="close">✕</button></div>${html}</section>`}
  function closeModal(){modalRoot.classList.add('hidden');modalRoot.innerHTML=''}

  function render(){document.body.dataset.theme=prefs.theme;$('#soundBtn').textContent=prefs.sound?'🔊':'🔇';if(screen==='home')renderHome();else if(screen==='chapter')renderChapter();else if(screen==='ending')renderEnding();else if(screen==='roster')renderRoster();else if(screen==='timeline')renderTimeline()}

  document.addEventListener('click',async e=>{
    const act=e.target.closest('[data-act]')?.dataset.act;
    if(act){
      if(act==='home')renderHome(); if(act==='start')startChapter(false); if(act==='continue'){screen='chapter';renderChapter()} if(act==='replay')startChapter(true); if(act==='chapter'){screen='chapter';renderChapter()} if(act==='roster')renderRoster(); if(act==='timeline')renderTimeline(); if(act==='save')save(); if(act==='manage')openManage();
      if(act==='arrive'||act==='investigate'||act==='guard'||act==='council'||act==='strategy'||act==='boss'||act==='establish'){state.scene=act;save(true);renderChapter()}
      if(act==='battle1')beginBattle('patrol');if(act==='battle2')beginBattle('guard');if(act==='bossbattle')beginBattle('boss');if(act==='finish')finish();
    }
    const clue=e.target.closest('[data-clue]')?.dataset.clue;if(clue)inspect(clue);
    const st=e.target.closest('[data-strategy]')?.dataset.strategy;if(st!==undefined)doStrategy(Number(st));
    const ba=e.target.closest('[data-battle]')?.dataset.battle;if(ba)await battleAction(ba);
    const ma=e.target.closest('[data-modal]')?.dataset.modal;
    if(ma==='close')closeModal();
    if(ma==='copy'){await navigator.clipboard?.writeText($('#saveText').value);toast('存檔文字已複製。')}
    if(ma==='download'){const blob=new Blob([$('#saveText').value],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='水滸英雄傳_v6.0.0_存檔.json';a.click();URL.revokeObjectURL(a.href)}
    if(ma==='import'){try{const x=JSON.parse($('#saveText').value);if(!x.hero)throw 0;state={...fresh(),...x,version:VERSION};save(true);closeModal();renderHome();toast('存檔匯入成功。')}catch{toast('存檔 JSON 格式不正確。')}}
    if(ma==='reset'){if(confirm('只重設 v6.0.0 續篇進度，原版存檔不受影響。確定嗎？')){closeModal();reset()}}
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
