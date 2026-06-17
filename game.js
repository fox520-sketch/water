(() => {
  'use strict';

  const VERSION = '6.2.0';
  const SAVE_KEY = 'liangshan-rpg-sequel-v6';
  const V61_BACKUP_KEY = 'liangshan-rpg-sequel-v6.1-backup';
  const V60_BACKUP_KEY = 'liangshan-rpg-sequel-v6.0-backup';
  const LEGACY_KEY = 'liangshan-rpg-save-v1';
  const PREF_KEY = 'liangshan-rpg-sequel-prefs';
  const $ = (selector, root = document) => root.querySelector(selector);
  const app = $('#app');
  const modalRoot = $('#modalRoot');
  const toastRoot = $('#toastRoot');
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const clone = value => JSON.parse(JSON.stringify(value));
  const memoryStorage = new Map();

  const storage = (() => {
    try {
      const probe = '__liangshan_v62_probe__';
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

  const GEAR = {
    rope: {name:'救生纜', icon:'🪢', text:'進入守勢時額外回復 45 氣血。'},
    flag: {name:'風向旗', icon:'🚩', text:'「百渡安航」豪氣消耗由 125 降為 105。'},
    seal: {name:'公示印', icon:'🪪', text:'每場戰鬥勝利銀兩獎勵增加 15%。'}
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
    [50,'催命判官察店・百旅安宿','李立','李俊'],
    [51,'混江龍巡渡・百渡安航','李俊','童威']
  ];

  const ROSTER = [
    '武松','魯達','林沖','楊志','宋江','李逵','扈三娘','呼延灼','盧俊義','公孫勝','張清','花榮','瓊英','燕青','張順','戴宗','朱武','蕭讓','裴宣','樂和','金大堅','孟康','侯健','湯隆','凌振','皇甫端','曹正','孫二娘','張青','顧大嫂','孫新','解珍','解寶','鄒淵','鄒潤','陶宗旺','杜遷','宋萬','朱貴','朱富','李雲','杜興','李應','朱仝','雷橫','穆春','穆弘','薛永','施恩','李立','李俊'
  ];

  const CLUES = [
    {id:'registry', title:'船籍與掌舵', icon:'📜', text:'核對船名、船主、掌舵者、船工名冊與航線許可；冒名頂替、無照掌舵或私改航線均須停航查驗。'},
    {id:'hull', title:'船體與載重', icon:'⚓', text:'檢查船板、纜繩、艙口、吃水線與救生器具；不得暗設夾艙、超載貨客或遮掩破損。'},
    {id:'fare', title:'渡票與收費', icon:'🎫', text:'票價、貨資、保管費與退票規則須公開；禁收臨時加價、過江保護費與重複渡資。'},
    {id:'weather', title:'水情與救援', icon:'🌊', text:'每日記錄水位、風勢與禁航訊號；遇翻船、失聯或傷病，立即通報水陸救援與安置。'}
  ];

  const STRATEGY = [
    ['船籍掛牌','渡船掛出船名、掌舵者、核載人貨與准行航線，異動須重新驗看。'],
    ['載重畫線','船身標示安全吃水線，旅客、牲口與貨物分區計重，超載即停航。'],
    ['渡票明價','碼頭公示票價與退費，渡票一人一號，所有加收款項都須開據。'],
    ['風浪停航','統一旗號、燈號與鐘聲；水急、濃霧或強風達標時立即封渡。'],
    ['水陸救援','渡口、客棧、醫棚與巡船共用失聯名冊，啟動搜尋、救治、安置與追償。']
  ];

  const ENEMIES = {
    patrol:{name:'霸渡攔船水手', icon:'槳', maxHp:805, hp:805, atk:79, def:27, reward:108, intro:'水手封住公渡碼頭，逼旅客改搭私船，不肯者便被扣下渡票與行囊。'},
    guard:{name:'超載暗艙船幫', icon:'艙', maxHp:1015, hp:1015, atk:91, def:33, reward:154, intro:'船幫把旅客塞進暗艙，再以貨箱遮住吃水線；破舊纜繩旁竟沒有一件救生器具。'},
    boss:{name:'私渡盟主與劫江水寇', icon:'寇', maxHp:1425, hp:1425, atk:103, def:40, reward:258, intro:'私渡盟主勾結水寇，偽造停航旗號引船入伏，並焚毀船籍與失聯紀錄。'}
  };

  const ACHIEVEMENTS = [
    ['明辨舟契','完成四項渡航查驗。',s=>s.clues.length===4],
    ['三戰連捷','全章未曾戰敗。',s=>s.runStats.defeats===0],
    ['無藥破浪','全章未使用金瘡藥。',s=>s.runStats.medicinesUsed===0],
    ['混江獨航','最終戰未呼叫童威援護。',s=>!s.runStats.bossCompanionUsed]
  ];

  const fresh = () => ({
    version:VERSION,
    updatedAt:new Date().toISOString(),
    started:false,
    complete:false,
    scene:'home',
    gear:'rope',
    grade:'',
    score:0,
    hero:{name:'李俊', title:'混江龍・揭陽江水軍頭領', level:51, hp:1290, maxHp:1290, sp:890, maxSp:890, atk:136, def:79, guarding:false},
    companion:{name:'童威', title:'出洞蛟・揭陽江水軍頭領', unlocked:false, used:false},
    clues:[],
    strategy:[],
    flags:{battle1:false,battle2:false,boss:false,system:false},
    inventory:[],
    silver:330,
    log:['第五十一回待命：李俊將巡查渡船、私渡與沿江航路安全。'],
    battle:null,
    achievements:[],
    runStats:{actions:0,medicinesUsed:0,defeats:0,bossCompanionUsed:false},
    previous:{detected:false,version:'',chapter50Complete:false,chapter49Complete:false,carriedSilver:0,achievements:0},
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
      const old=JSON.parse(storage.getItem(V61_BACKUP_KEY)||'null');
      if(old){
        target.previous={
          detected:true,
          version:old.version||'6.1.0',
          chapter50Complete:!!old.complete,
          chapter49Complete:!!old.previous?.chapter49Complete,
          carriedSilver:Math.min(200,Math.max(0,Math.floor((old.silver||0)*.25))),
          achievements:Array.isArray(old.achievements)?old.achievements.length:0
        };
      }
    }catch{}
    return target;
  }

  function migratePrevious(raw){
    const isV61=raw.version==='6.1.0'||raw.hero?.name==='李立';
    const backupKey=isV61?V61_BACKUP_KEY:V60_BACKUP_KEY;
    try{if(!storage.getItem(backupKey))storage.setItem(backupKey,JSON.stringify(raw))}catch{}
    const base=fresh();
    const carried=Math.min(200,Math.max(0,Math.floor((raw.silver||0)*.25)));
    base.previous={
      detected:true,
      version:raw.version||'前版',
      chapter50Complete:isV61&&!!raw.complete,
      chapter49Complete:!!raw.previous?.chapter49Complete||(!isV61&&!!raw.complete),
      carriedSilver:carried,
      achievements:Array.isArray(raw.achievements)?raw.achievements.length:0
    };
    if(raw.complete){
      base.silver+=carried;
      base.inventory.push(isV61?'水泊百旅安宿約（前回承接）':'水泊百肆安營約（前回承接）');
      base.log.unshift(`承接 ${base.previous.version} 完成紀錄與銀兩 ${carried}。`);
    }
    return detectLegacy(base);
  }

  function mergeCurrent(raw){
    const base=fresh();
    const merged={
      ...base,...raw,
      hero:{...base.hero,...raw.hero},
      companion:{...base.companion,...raw.companion},
      flags:{...base.flags,...raw.flags},
      runStats:{...base.runStats,...raw.runStats},
      previous:{...base.previous,...raw.previous},
      legacy:{...base.legacy,...raw.legacy}
    };
    merged.version=VERSION;
    if(!GEAR[merged.gear])merged.gear='rope';
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
        if(raw.version==='6.1.0'||raw.version==='6.0.0'||raw.hero.name==='李立'||raw.hero.name==='施恩')return migratePrevious(raw);
        return mergeCurrent(raw);
      }
    }catch{}
    return detectLegacy(detectPreviousBackup(fresh()));
  }

  function importState(raw){
    if(!raw?.hero)throw new Error('invalid');
    if(raw.version==='6.1.0'||raw.version==='6.0.0'||raw.hero.name==='李立'||raw.hero.name==='施恩')return migratePrevious(raw);
    return mergeCurrent(raw);
  }

  function save(silent=false){
    state.updatedAt=new Date().toISOString();
    state.version=VERSION;
    storage.setItem(SAVE_KEY,JSON.stringify(state));
    if(!silent){toast('第五十一回進度已收入本機存檔。');tone('save')}
  }

  function reset(){
    storage.removeItem(SAVE_KEY);
    state=detectLegacy(detectPreviousBackup(fresh()));
    screen='home';
    render();
    toast('已重設 v6.2.0 第五十一回；前回備份與經典篇存檔未受影響。');
  }

  function esc(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
  function pct(a,b){return clamp(Math.round(a/b*100),0,100)}
  function toast(message){const node=document.createElement('div');node.className='toast';node.textContent=message;toastRoot.append(node);setTimeout(()=>node.remove(),3200)}
  function tone(kind){
    if(!prefs.sound)return;
    try{
      audio ||= new (window.AudioContext||window.webkitAudioContext)();
      const oscillator=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;
      const tones={hit:[150,.08],hurt:[85,.11],skill:[430,.14],victory:[690,.24],save:[520,.09],guard:[280,.08],companion:[590,.16],achievement:[770,.2],gear:[620,.1]};
      const [frequency,duration]=tones[kind]||[360,.08];
      oscillator.frequency.setValueAtTime(frequency,now);
      if(kind==='victory'||kind==='achievement')oscillator.frequency.exponentialRampToValueAtTime(frequency*1.5,now+duration);
      gain.gain.setValueAtTime(.0001,now);
      gain.gain.exponentialRampToValueAtTime(.07,now+.01);
      gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start();oscillator.stop(now+duration+.02);
    }catch{}
  }
  function log(message){state.log.unshift(message);state.log=state.log.slice(0,32)}
  function speak(text){if(!('speechSynthesis'in window))return toast('此瀏覽器不支援語音朗讀。');speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g,''));utterance.lang='zh-TW';utterance.rate=.9;speechSynthesis.speak(utterance)}
  function difficulty(){return DIFFICULTIES[prefs.difficulty]||DIFFICULTIES.standard}
  function activeGear(){return GEAR[state.gear]||GEAR.rope}

  function previousText(){
    if(!state.previous.detected)return '未偵測到 v6.1.0 紀錄；仍可直接遊玩第五十一回。';
    const done=state.previous.chapter50Complete?'第五十回已完成':'第五十回尚未完成';
    const carry=state.previous.chapter50Complete?`，本回承接銀兩 ${state.previous.carriedSilver} 與前回成就 ${state.previous.achievements} 項`:'，未承接完成獎勵';
    return `偵測到 ${state.previous.version}：${done}${carry}。`;
  }
  function legacyText(){if(!state.legacy.detected)return '未偵測到經典篇存檔。';return `另偵測到 ${state.legacy.version} 經典篇存檔；新版不會覆寫。`}

  function header(title,sub=''){return `<div class="chapter-banner"><div class="eyebrow">第五十一回・續篇</div><h1>${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:''}</div>`}
  function hud(){
    const hero=state.hero,gear=activeGear();
    return `<div class="hud"><section class="card"><div class="portrait"><div class="avatar">俊</div><div><span class="tag">第 51 名主角</span><h3>${esc(hero.name)}</h3><p>${esc(hero.title)}</p></div></div></section><section class="card"><div class="statline"><span>氣血</span><div class="bar"><i style="width:${pct(hero.hp,hero.maxHp)}%"></i></div><b>${hero.hp}/${hero.maxHp}</b></div><div class="statline"><span>豪氣</span><div class="bar sp"><i style="width:${pct(hero.sp,hero.maxSp)}%"></i></div><b>${hero.sp}/${hero.maxSp}</b></div></section><section class="card"><p><b>銀兩：</b>${state.silver}</p><p><b>同伴：</b>${state.companion.unlocked?'童威已加入':'尚未會合'}</p><p><b>行舟裝備：</b>${gear.icon} ${gear.name}</p></section></div>`;
  }
  function nav(){return `<div class="actions"><button class="btn small" data-act="home">首頁</button><button class="btn small" data-act="chapter">章回</button><button class="btn small" data-act="roster">英雄譜</button><button class="btn small" data-act="timeline">章回錄</button><button class="btn small" data-act="save">存檔</button><button class="btn small" data-act="manage">存檔管理</button></div>`}
  function difficultyPicker(){return `<div class="difficulty-picker">${Object.entries(DIFFICULTIES).map(([id,item])=>`<button class="btn difficulty-option ${prefs.difficulty===id?'active':''}" data-difficulty="${id}">${prefs.difficulty===id?'<span class="checkmark">✓</span>':''}<strong>${item.name}難度</strong><span>${item.text}</span></button>`).join('')}</div>`}
  function gearPicker(){return `<div class="gear-picker">${Object.entries(GEAR).map(([id,item])=>`<button class="btn gear-option ${state.gear===id?'active':''}" data-gear="${id}" ${state.battle?'disabled':''}>${state.gear===id?'<span class="checkmark">✓</span>':''}<span class="gear-icon">${item.icon}</span><strong>${item.name}</strong><span>${item.text}</span></button>`).join('')}</div>`}

  function renderHome(){
    screen='home';
    const action=state.complete?'<button class="btn primary" data-act="continue">查看第五十一回結算</button>':state.started?'<button class="btn primary" data-act="continue">繼續第五十一回</button>':'<button class="btn primary" data-act="start">開始第五十一回</button>';
    app.innerHTML=`${header('混江龍巡渡・百渡安航','李俊升格主角，出洞蛟童威破浪助陣')}<section class="hero"><div class="eyebrow">《水滸英雄傳：梁山風雲》v6.2.0</div><h1>船有籍、渡有價，風浪有禁，落水有援</h1><p>第五十回整頓沿江客棧後，李俊追查私渡、超載與劫江水寇。玩家將查驗船籍、船體、渡票與水情，建立水泊百渡安航制度。</p><div class="actions">${action}<button class="btn" data-act="roster">五十一英雄譜</button><button class="btn" data-act="timeline">章回錄</button><button class="btn" data-act="manage">存檔管理</button><a class="btn" href="previous-v6.1.0/index.html">重遊第五十回</a><a class="btn" href="legacy-v4.5.0/index.html">開啟經典篇</a></div></section><div class="grid two" style="margin-top:16px"><section class="card ${state.previous.detected?'success':'warning'}"><h3>前回安全承接</h3><p>${esc(previousText())}</p><p class="muted">${esc(legacyText())}</p></section><section class="card"><h3>v6.2.0 新增</h3><p><span class="tag">第 51 名主角：李俊</span><span class="tag">新同伴：童威</span><span class="tag">行舟裝備</span><span class="tag">章回評級</span><span class="tag">三場新戰鬥</span></p><p class="muted">第五十回、第四十九回與經典篇均保留獨立入口；支援手機、離線 PWA、三種顯示模式、語音與 JSON 存檔。</p></section></div><section class="card" style="margin-top:16px"><h3>選擇本章難度</h3><p class="muted">可在非戰鬥狀態切換；已開始的戰鬥維持原數值。</p>${difficultyPicker()}</section><section class="card" style="margin-top:16px"><h3>選擇行舟裝備</h3><p class="muted">三種裝備各有不同效果，章回進行中仍可在非戰鬥狀態調整。</p>${gearPicker()}</section>`;
    app.focus();
  }

  function startChapter(resetRun=false){
    if(resetRun){
      const previous=clone(state.previous),legacy=clone(state.legacy),gear=state.gear;
      state=fresh();state.previous=previous;state.legacy=legacy;state.gear=gear;
      if(previous.chapter50Complete){state.silver+=previous.carriedSilver;state.inventory.push('水泊百旅安宿約（前回承接）')}
    }
    state.started=true;state.scene='orders';screen='chapter';save(true);renderChapter();
  }

  function renderChapter(){
    screen='chapter';
    if(state.complete)return renderEnding();
    if(state.battle)return renderBattle();
    const scene=state.scene;
    let art='⛵',title='梁山水寨傳令',text='',choices=[];
    if(scene==='orders'){
      art='📜';title='宋江傳下百渡安航令';
      text=`<p>沿江客棧新規才上路，渡口便接連發生私船攬客、超載翻覆與旅貨失蹤。有人故意升起假停航旗，再逼旅客改搭高價私渡。</p><p>李俊望著江圖道：「水路若只靠膽大，便會拿百姓性命試浪。船要有籍、價要公開、風浪要知進退。」</p>`;
      choices=[['前往揭陽江公渡巡查','arrive']];
    }else if(scene==='arrive'){
      art='🚣';title='揭陽公渡・霸渡攔船';
      text=`<p>公渡碼頭被一群水手用長槳封住，牆上貼著偽造的停航告示。他們強迫旅客改搭無名私船，還把原渡票撕去。</p><p>李俊看一眼逆風飄動的旗號：「風從東來，旗卻向東倒。這停航令是假的。」</p>`;
      choices=[[state.flags.battle1?'霸渡水手已退，登船查驗':'拆下假旗，迎戰霸渡水手',state.flags.battle1?'investigate':'battle1']];
    }else if(scene==='investigate'){
      art='🔎';title='渡船四項安全查驗';
      text=`<p>霸渡只是外圍。私渡真正的漏洞藏在冒名船籍、暗艙超載、亂收渡資與偽造水情。請完成四項查驗。</p>`;
    }else if(scene==='guard'){
      art='⚓';title='暗艙超載・斷纜救人';
      text=`<p>四項證據相互吻合：船幫以假停航令趕走公渡，再把旅客塞進無名船暗艙，刻意遮住吃水線並重複收費。</p><p>一艘超載私船正要離岸，舊纜已被拉裂，艙內傳出孩童哭聲。</p>`;
      choices=[[state.flags.battle2?'船幫已敗，迎接童家水軍':'攔住超載私船，迎戰暗艙船幫',state.flags.battle2?'council':'battle2']];
    }else if(scene==='council'){
      art='🐉';title='出洞蛟童威潛水破艙';
      text=`<p>出洞蛟童威自水下割開封死的逃生艙口，救出最後幾名旅客。他帶來下游截獲的假船牌與水寇分贓冊。</p><p>童威道：「水上出事，光從岸邊喊不夠。每一渡都要知道誰能下水、哪艘船能救、失聯往哪裡找。」</p>`;
      choices=[['召開百渡安航軍議','strategy']];
    }else if(scene==='strategy'){
      art='🧭';title='五階段百渡安航軍略';
      text=`<p>依序完成船籍、載重、票價、停航與水陸救援，讓每一艘渡船都有可追查、可停航、可救援的安全制度。</p>`;
    }else if(scene==='boss'){
      art='🔥';title='水寇焚籍・江心決戰';
      text=`<p>安航制度公布後，私渡盟主失去冒名攬客與暗艙藏貨的空間。他勾結劫江水寇，趁夜焚毀船籍站，並用假燈號把巡船引向急流。</p><p>李俊分舟截江，童威潛水斷纜，百渡安航的最後一戰就在浪心。</p>`;
      choices=[[state.flags.boss?'私渡盟主已敗，公布百渡新規':'迎戰私渡盟主與劫江水寇',state.flags.boss?'establish':'bossbattle']];
    }else if(scene==='establish'){
      art='🏮';title='水泊百渡安航制度';
      text=`<p>沿江渡口掛上統一船牌、核載線、票價牌與風浪旗。巡船、客棧、醫棚與水寨共用失聯名冊，每日演練落水救援。</p><p>李俊把假停航旗沉入江中，換上新旗：「紅旗停渡，白燈求援；不拿性命賭風浪。」</p>`;
      choices=[['完成第五十一回，立下水泊百渡安航約','finish']];
    }
    app.innerHTML=`${header(title,'混江龍李俊主理・出洞蛟童威助陣')}${nav()}${hud()}<section class="card scene"><div class="scene-art">${art}</div><div class="scene-text">${text}</div>${scene==='investigate'?renderClues():scene==='strategy'?renderStrategy():`<div class="scene-choices">${choices.map(([label,action])=>`<button class="btn primary" data-act="${action}">${label}</button>`).join('')}</div>`}</section><section class="card" style="margin-top:14px"><h3>行動紀錄</h3><div class="log">${state.log.map(item=>`<div>${esc(item)}</div>`).join('')}</div></section>`;
  }

  function renderClues(){
    return `<div class="investigation">${CLUES.map(clue=>{const done=state.clues.includes(clue.id);return `<button class="btn evidence ${done?'done':''}" data-clue="${clue.id}" ${done?'disabled':''}><span class="check">${done?'✓':clue.icon}</span><strong>${clue.title}</strong><span>${clue.text}</span></button>`}).join('')}</div><div class="scene-choices">${state.clues.length===4?'<button class="btn primary" data-act="guard">證據齊全，攔截超載暗艙船</button>':'<button class="btn" disabled>尚需完成四項查驗</button>'}</div>`;
  }

  function inspect(id){
    if(state.clues.includes(id))return;
    const clue=CLUES.find(item=>item.id===id);if(!clue)return;
    state.clues.push(id);state.silver+=15;log(`完成查驗：${clue.title}。`);tone('save');save(true);renderChapter();toast(`取得線索：${clue.title}（${state.clues.length}/4）`);
  }

  function renderStrategy(){
    return `<div class="strategy-track">${STRATEGY.map((item,index)=>{const done=state.strategy.includes(index);const enabled=index===0||state.strategy.includes(index-1);return `<article class="strategy-step ${done?'done':''}"><span class="step-no">${done?'✓':index+1}</span><div><b>${item[0]}</b><p class="muted">${item[1]}</p></div><button class="btn small" data-strategy="${index}" ${done||!enabled?'disabled':''}>${done?'完成':'執行'}</button></article>`}).join('')}</div><div class="scene-choices">${state.strategy.length===5?'<button class="btn primary" data-act="boss">軍略完成，守護船籍公示站</button>':'<button class="btn" disabled>依序完成五階段軍略</button>'}</div>`;
  }

  function doStrategy(index){
    if(state.strategy.includes(index)||(index>0&&!state.strategy.includes(index-1)))return;
    state.strategy.push(index);state.hero.hp=clamp(state.hero.hp+70,0,state.hero.maxHp);state.hero.sp=clamp(state.hero.sp+80,0,state.hero.maxSp);log(`百渡軍略完成：${STRATEGY[index][0]}。`);save(true);renderChapter();tone('skill');
  }

  function beginBattle(type){
    const enemy=clone(ENEMIES[type]),currentDifficulty=difficulty();
    enemy.maxHp=Math.round(enemy.maxHp*currentDifficulty.hp);enemy.hp=enemy.maxHp;enemy.atk=Math.round(enemy.atk*currentDifficulty.atk);enemy.reward=Math.round(enemy.reward*currentDifficulty.reward);
    if(state.gear==='seal')enemy.reward=Math.round(enemy.reward*1.15);
    state.battle={type,enemy,turn:1,actions:0,log:[enemy.intro],companionUsed:false,difficulty:prefs.difficulty,gear:state.gear};
    state.hero.guarding=false;screen='chapter';save(true);renderBattle();tone('hurt');
  }

  function renderBattle(){
    const battle=state.battle,hero=state.hero,enemy=battle.enemy,currentDifficulty=DIFFICULTIES[battle.difficulty]||difficulty(),gear=GEAR[battle.gear]||activeGear();
    const sweepCost=battle.gear==='flag'?105:125;
    app.innerHTML=`${header(`戰鬥：${enemy.name}`,enemy.intro)}${nav()}<div class="battle-grid"><section id="heroFighter" class="fighter"><div class="fighter-head"><div class="portrait"><div class="avatar">俊</div><div><h3>${hero.name}</h3><span class="tag">攻 ${hero.atk}</span><span class="tag">防 ${hero.def}</span></div></div><span>${hero.guarding?'🛡️ 守勢':''}</span></div><div class="statline"><span>氣血</span><div class="bar"><i style="width:${pct(hero.hp,hero.maxHp)}%"></i></div><b>${hero.hp}/${hero.maxHp}</b></div><div class="statline"><span>豪氣</span><div class="bar sp"><i style="width:${pct(hero.sp,hero.maxSp)}%"></i></div><b>${hero.sp}/${hero.maxSp}</b></div><div class="battle-actions"><button class="btn" data-battle="attack">混江水戰</button><button class="btn primary" data-battle="skill" ${hero.sp<70?'disabled':''}>混江龍分浪（70）</button><button class="btn" data-battle="sweep" ${hero.sp<sweepCost?'disabled':''}>百渡安航（${sweepCost}）</button><button class="btn" data-battle="guard">護住船籍</button>${state.companion.unlocked?`<button class="btn good" data-battle="companion" ${battle.companionUsed?'disabled':''}>童威出洞援護</button>`:''}<button class="btn" data-battle="medicine" ${state.inventory.includes('medicine')?'':'disabled'}>使用金瘡藥</button></div><div class="battle-note">${currentDifficulty.name}難度・${gear.icon} ${gear.name}・本場獎勵 ${enemy.reward} 銀兩・已行動 ${battle.actions} 次</div></section><section id="enemyFighter" class="fighter enemy"><div class="fighter-head"><div class="portrait"><div class="avatar">${enemy.icon}</div><div><h3>${enemy.name}</h3><span class="tag">攻 ${enemy.atk}</span><span class="tag">防 ${enemy.def}</span></div></div><b>第 ${battle.turn} 合</b></div><div class="statline"><span>氣血</span><div class="bar"><i style="width:${pct(enemy.hp,enemy.maxHp)}%"></i></div><b>${enemy.hp}/${enemy.maxHp}</b></div><p>${esc(enemy.intro)}</p></section></div><section class="card" style="margin-top:14px"><h3>戰況</h3><div class="log">${battle.log.map(item=>`<div>${esc(item)}</div>`).join('')}</div></section>`;
  }

  async function battleAction(action){
    if(battleBusy||!state.battle)return;battleBusy=true;
    const battle=state.battle,hero=state.hero,enemy=battle.enemy;
    hero.guarding=false;let damage=0,acted=false;
    const sweepCost=battle.gear==='flag'?105:125;
    if(action==='attack'){acted=true;damage=Math.max(20,hero.atk+rand(-12,20)-enemy.def);enemy.hp-=damage;battle.log.unshift(`李俊順浪進擊，造成 ${damage} 點傷害。`);tone('hit')}
    if(action==='skill'&&hero.sp>=70){acted=true;hero.sp-=70;damage=Math.max(62,Math.round(hero.atk*1.7)+rand(13,38)-enemy.def);enemy.hp-=damage;enemy.atk=Math.max(44,enemy.atk-6);battle.log.unshift(`「混江龍分浪」截斷敵船攻勢，造成 ${damage} 點傷害，敵方攻勢下降。`);tone('skill')}
    if(action==='sweep'&&hero.sp>=sweepCost){acted=true;hero.sp-=sweepCost;damage=Math.max(100,Math.round(hero.atk*2.1)+rand(24,52)-Math.round(enemy.def*.58));enemy.hp-=damage;hero.hp=clamp(hero.hp+60,0,hero.maxHp);battle.log.unshift(`「百渡安航」封住私渡水路，造成 ${damage} 點傷害並回復 60 氣血。`);tone('skill')}
    if(action==='guard'){acted=true;hero.guarding=true;hero.sp=clamp(hero.sp+46,0,hero.maxSp);let healed=0;if(battle.gear==='rope'){healed=45;hero.hp=clamp(hero.hp+healed,0,hero.maxHp)}battle.log.unshift(`李俊護住船籍與救援纜，進入守勢並回復 46 豪氣${healed?`、${healed} 氣血`:''}。`);tone('guard')}
    if(action==='companion'&&state.companion.unlocked&&!battle.companionUsed){acted=true;battle.companionUsed=true;damage=218+rand(0,50);enemy.hp-=damage;enemy.def=Math.max(11,enemy.def-12);hero.hp=clamp(hero.hp+38,0,hero.maxHp);if(battle.type==='boss')state.runStats.bossCompanionUsed=true;battle.log.unshift(`童威施展「出洞蛟破纜」，造成 ${damage} 點傷害、降低敵方防禦並回復李俊 38 氣血。`);tone('companion')}
    if(action==='medicine'&&state.inventory.includes('medicine')){acted=true;const at=state.inventory.indexOf('medicine');state.inventory.splice(at,1);hero.hp=clamp(hero.hp+300,0,hero.maxHp);state.runStats.medicinesUsed++;battle.log.unshift('李俊使用金瘡藥，回復 300 氣血。');tone('save')}
    if(!acted){battleBusy=false;return}
    battle.actions++;state.runStats.actions++;enemy.hp=Math.max(0,enemy.hp);renderBattle();await new Promise(resolve=>setTimeout(resolve,180));
    if(enemy.hp<=0){battleWin();battleBusy=false;return}
    const raw=Math.max(24,enemy.atk+rand(-9,18)-Math.round(hero.def*.45));
    const taken=hero.guarding?Math.round(raw*.38):raw;
    hero.hp=Math.max(0,hero.hp-taken);battle.log.unshift(`${enemy.name}反擊，李俊受到 ${taken} 點傷害。`);battle.turn++;tone('hurt');
    if(hero.hp<=0){state.runStats.defeats++;hero.hp=Math.round(hero.maxHp*.72);hero.sp=Math.round(hero.maxSp*.75);battle.log.unshift('李俊力竭後由巡船弟兄救回，整補後可重新挑戰。');state.battle=null;toast('本場失利，已返回戰前整補。');save(true);battleBusy=false;renderChapter();return}
    save(true);battleBusy=false;renderBattle();
  }

  function battleWin(){
    const type=state.battle.type,enemy=state.battle.enemy;
    state.silver+=enemy.reward;state.hero.hp=state.hero.maxHp;state.hero.sp=state.hero.maxSp;state.inventory.push('medicine');
    if(type==='patrol'){state.flags.battle1=true;state.scene='investigate';log('擊退霸渡攔船水手，取得逆風假停航旗與撕毀渡票。')}
    if(type==='guard'){state.flags.battle2=true;state.companion.unlocked=true;state.scene='council';log('擊敗超載暗艙船幫，救出艙內旅客；出洞蛟童威加入助陣。')}
    if(type==='boss'){state.flags.boss=true;state.scene='establish';log('擊敗私渡盟主與劫江水寇，保住船籍、票價與失聯名冊。')}
    state.battle=null;save(true);tone('victory');toast(`勝利！獲得銀兩 ${enemy.reward}，並補充一帖金瘡藥。`);renderChapter();
  }

  function computeAchievements(){state.achievements=ACHIEVEMENTS.filter(([, ,test])=>test(state)).map(([name])=>name)}
  function computeGrade(){
    let score=100;
    score-=Math.max(0,state.runStats.actions-10)*2;
    score-=state.runStats.defeats*18;
    score-=state.runStats.medicinesUsed*12;
    if(state.runStats.bossCompanionUsed)score-=8;
    score=clamp(score,0,100);state.score=score;
    state.grade=score>=94?'S':score>=84?'A':score>=72?'B':'C';
  }

  function finish(){
    state.complete=true;state.flags.system=true;state.scene='ending';
    for(const item of ['沿江渡船船籍冊','風浪停航旗號表','水泊百渡安航約'])if(!state.inventory.includes(item))state.inventory.push(item);
    state.silver+=365;computeAchievements();computeGrade();log(`第五十一回完成：水泊百渡安航制度正式建立，章回評級 ${state.grade}，解鎖 ${state.achievements.length} 項成就。`);save(true);renderEnding();tone('achievement');
  }

  function renderAchievements(){return `<div class="achievement-grid">${ACHIEVEMENTS.map(([name,text])=>{const unlocked=state.achievements.includes(name);return `<article class="achievement ${unlocked?'':'locked'}"><b>${unlocked?'🏅':'🔒'} ${name}</b><span>${text}</span></article>`}).join('')}</div>`}
  function gradeText(){return state.grade==='S'?'浪定舟穩・完美安航':state.grade==='A'?'水陸協力・安航有成':state.grade==='B'?'制度已立・仍可精進':'風浪初定・再整舟師'}

  function renderEnding(){
    screen='ending';
    if(!state.grade)computeGrade();
    app.innerHTML=`${header('第五十一回完・百渡安航','李俊正式列入五十一英雄譜，童威加入梁山助陣')}${nav()}<section class="hero"><div class="eyebrow">制度章回完成</div><div class="grade-badge grade-${state.grade.toLowerCase()}"><span>${state.grade}</span><small>${state.score} 分</small></div><h1>船有籍，渡有價；風浪知止，落水有援</h1><h2>混江龍李俊・第五十一名主角</h2><p>沿江渡船皆須掛牌、標示核載、公開票價並遵守風浪停航；若有翻船、失聯或財物遭劫，水寨、巡船、客棧與醫棚立即聯動救援。</p><p class="grade-copy"><b>${gradeText()}</b>：全章行動 ${state.runStats.actions} 次、戰敗 ${state.runStats.defeats} 次、用藥 ${state.runStats.medicinesUsed} 次。</p><div class="actions"><button class="btn primary" data-act="replay">重演第五十一回</button><button class="btn" data-act="roster">查看五十一英雄譜</button><button class="btn" data-act="manage">匯出完成存檔</button><a class="btn" href="previous-v6.1.0/index.html">重遊第五十回</a></div></section><div class="grid three" style="margin-top:16px"><section class="card"><h3>章回成果</h3><p>四項查驗 ${state.clues.length}/4<br>五階段軍略 ${state.strategy.length}/5<br>三場主線戰鬥 3/3<br>章回評級 ${state.grade}（${state.score} 分）</p></section><section class="card"><h3>制度收藏</h3>${state.inventory.filter(item=>typeof item==='string'&&item!=='medicine').map(item=>`<p>✓ ${esc(item)}</p>`).join('')}</section><section class="card"><h3>後續伏筆</h3><p>出洞蛟童威已加入同伴編成。下一回可由童威升格主角，整頓潛水救援、沉船打撈與水下通道安全。</p></section></div><section class="card" style="margin-top:16px"><h3>第五十一回成就（${state.achievements.length}/4）</h3>${renderAchievements()}</section>`;
  }

  function renderRoster(){
    screen='roster';
    app.innerHTML=`${header('五十一英雄譜','李俊完成百渡安航後正式列席')}${nav()}<div class="grid three" style="margin-top:16px">${ROSTER.map((name,index)=>`<article class="card ${index===50?'success':''}"><div class="portrait"><div class="avatar">${esc(name[0])}</div><div><span class="tag">第 ${index+1} 席</span><h3>${esc(name)}</h3><p>${index===50?'混江龍・百渡安航主理':index>=34?'制度章回英雄':'梁山前篇英雄'}</p></div></div></article>`).join('')}</div>`;
  }

  function renderTimeline(){
    screen='timeline';
    app.innerHTML=`${header('第三十五至五十一回章回錄','由百田安灌一路延伸至百渡安航')}${nav()}<section class="timeline" style="margin-top:16px">${CHAPTERS.map(chapter=>`<article class="${chapter[0]===51?'current':''}"><b>第${chapter[0]}回</b><div><h3>${chapter[1]}</h3><p>主角：${chapter[2]}　新同伴：${chapter[3]}</p>${chapter[0]===48?'<span class="tag good">v5.9.0 測試紀錄</span>':''}${chapter[0]===49?'<span class="tag good">v6.0.0 已保留</span>':''}${chapter[0]===50?'<span class="tag good">v6.1.0 已保留</span>':''}${chapter[0]===51?'<span class="tag good">v6.2.0 本版可遊玩</span>':''}</div></article>`).join('')}</section>`;
  }

  function openManage(){
    const data=JSON.stringify(state,null,2);
    openModal('存檔管理',`<p>v6.2.0 沿用續篇存檔鍵，首次讀取 v6.1.0 時會自動建立前回備份，再開啟第五十一回。</p><textarea id="saveText" spellcheck="false">${esc(data)}</textarea><div class="actions"><button class="btn primary" data-modal="copy">複製存檔</button><button class="btn" data-modal="download">下載 JSON</button><button class="btn" data-modal="import">匯入文字</button><button class="btn danger" data-modal="reset">重設第五十一回</button></div>`);
  }

  function openAbout(){
    openModal('v6.2.0 版本說明',`<h3>第五十一回「混江龍巡渡・百渡安航」</h3><p>新增李俊主角、童威同伴、三場戰鬥、四項渡航查驗、五階段軍略、五十一英雄譜與第三十五至五十一回章回錄。</p><h3>行舟裝備與章回評級</h3><p>新增救生纜、風向旗、公示印三種裝備；結算依行動數、戰敗、用藥與最終戰援護計算 S／A／B／C 評級。</p><h3>存檔安全</h3><p>偵測到 v6.1.0 存檔時，會先備份到 <span class="code">${V61_BACKUP_KEY}</span>，再將完成狀態、前回成就與部分銀兩承接至第五十一回。經典篇存檔仍只讀不覆寫。</p><h3>前版與經典篇</h3><p>壓縮檔內保留 <span class="code">previous-v6.1.0/</span>、<span class="code">previous-v6.0.0/</span> 與 <span class="code">legacy-v4.5.0/</span>，可由首頁直接開啟。</p>`);
  }

  function openModal(title,html){modalRoot.classList.remove('hidden');modalRoot.innerHTML=`<section class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>${esc(title)}</h2><button class="icon-btn" data-modal="close">✕</button></div>${html}</section>`}
  function closeModal(){modalRoot.classList.add('hidden');modalRoot.innerHTML=''}

  function render(){
    document.body.dataset.theme=prefs.theme;$('#soundBtn').textContent=prefs.sound?'🔊':'🔇';
    if(screen==='home')renderHome();else if(screen==='chapter')renderChapter();else if(screen==='ending')renderEnding();else if(screen==='roster')renderRoster();else if(screen==='timeline')renderTimeline();
  }

  document.addEventListener('click',async event=>{
    const action=event.target.closest('[data-act]')?.dataset.act;
    if(action){
      if(action==='home')renderHome();
      if(action==='start')startChapter(false);
      if(action==='continue'){screen='chapter';renderChapter()}
      if(action==='replay')startChapter(true);
      if(action==='chapter'){screen='chapter';renderChapter()}
      if(action==='roster')renderRoster();
      if(action==='timeline')renderTimeline();
      if(action==='save')save();
      if(action==='manage')openManage();
      if(['arrive','investigate','guard','council','strategy','boss','establish'].includes(action)){state.scene=action;save(true);renderChapter()}
      if(action==='battle1')beginBattle('patrol');
      if(action==='battle2')beginBattle('guard');
      if(action==='bossbattle')beginBattle('boss');
      if(action==='finish')finish();
    }

    const diff=event.target.closest('[data-difficulty]')?.dataset.difficulty;
    if(diff&&DIFFICULTIES[diff]){if(state.battle)return toast('戰鬥進行中不能切換難度。');prefs.difficulty=diff;savePrefs();render();toast(`已切換為${DIFFICULTIES[diff].name}難度。`)}

    const gear=event.target.closest('[data-gear]')?.dataset.gear;
    if(gear&&GEAR[gear]){if(state.battle)return toast('戰鬥進行中不能更換裝備。');state.gear=gear;save(true);render();tone('gear');toast(`已裝備${GEAR[gear].name}。`)}

    const clue=event.target.closest('[data-clue]')?.dataset.clue;if(clue)inspect(clue);
    const strategy=event.target.closest('[data-strategy]')?.dataset.strategy;if(strategy!==undefined)doStrategy(Number(strategy));
    const battle=event.target.closest('[data-battle]')?.dataset.battle;if(battle)await battleAction(battle);
    const modalAction=event.target.closest('[data-modal]')?.dataset.modal;
    if(modalAction==='close')closeModal();
    if(modalAction==='copy'){try{await navigator.clipboard?.writeText($('#saveText').value);toast('存檔文字已複製。')}catch{toast('無法直接複製，請手動全選文字。')}}
    if(modalAction==='download'){const blob=new Blob([$('#saveText').value],{type:'application/json'}),link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='水滸英雄傳_v6.2.0_存檔.json';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000)}
    if(modalAction==='import'){
      try{
        const imported=JSON.parse($('#saveText').value);state=importState(imported);save(true);closeModal();renderHome();
        toast(imported.version==='6.1.0'||imported.hero?.name==='李立'?'v6.1.0 存檔已備份並承接至第五十一回。':'存檔匯入成功。');
      }catch{toast('存檔 JSON 格式不正確。')}
    }
    if(modalAction==='reset'){if(confirm('只重設 v6.2.0 第五十一回進度，前回備份與經典篇不受影響。確定嗎？')){closeModal();reset()}}
  });

  $('#brandBtn').addEventListener('click',renderHome);
  $('#aboutBtn').addEventListener('click',openAbout);
  $('#themeBtn').addEventListener('click',()=>{const themes=['ink','dark','paper'];prefs.theme=themes[(themes.indexOf(prefs.theme)+1)%themes.length];savePrefs();render();toast(`已切換為 ${prefs.theme==='ink'?'水墨':prefs.theme==='dark'?'深色':'電子紙'}模式。`)});
  $('#soundBtn').addEventListener('click',()=>{prefs.sound=!prefs.sound;savePrefs();render();if(prefs.sound)tone('save')});
  $('#narrateBtn').addEventListener('click',()=>{speechOn=!speechOn;$('#narrateBtn').textContent=speechOn?'停':'朗';if(speechOn)speak(app.innerText);else speechSynthesis?.cancel()});
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredPrompt=event;$('#installBtn').classList.remove('hidden')});
  $('#installBtn').addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').classList.add('hidden')});
  window.addEventListener('beforeunload',()=>save(true));
  if('serviceWorker'in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(console.warn));
  render();
})();
