(() => {
  'use strict';

  const VERSION = '7.1.0';
  const EDITION = '百八英雄深度玩法版';
  const SAVE_KEY = 'liangshan-rpg-complete-v7';
  const PREF_KEY = 'liangshan-rpg-complete-v7-prefs';
  const OLD_LEGACY_KEY = 'liangshan-rpg-save-v1';
  const OLD_SEQUEL_KEY = 'liangshan-rpg-sequel-v6';
  const BACKUP_PREFIX = 'liangshan-rpg-v7-migration-backup-';
  const chapters = Array.isArray(window.LIANGSHAN_CHAPTERS) ? window.LIANGSHAN_CHAPTERS : [];
  const app = document.querySelector('#app');
  const modalRoot = document.querySelector('#modalRoot');
  const toastRoot = document.querySelector('#toastRoot');
  const updateRoot = document.querySelector('#updateRoot');
  const memoryStorage = new Map();
  const $ = (selector, root = document) => root.querySelector(selector);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const clone = value => JSON.parse(JSON.stringify(value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  if (chapters.length !== 108) {
    app.innerHTML = '<div class="empty"><h1>章回資料載入失敗</h1><p>請確認 chapters.js 與 game.js 位於同一資料夾。</p></div>';
    return;
  }

  const storage = (() => {
    try {
      const probe = '__liangshan_v71_probe__';
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
    story: {name:'故事', hp:.76, atk:.82, reward:.88, text:'敵方較弱，適合閱讀完整劇情。'},
    standard: {name:'標準', hp:1, atk:1, reward:1, text:'攻守均衡，首領機制完整。'},
    heroic: {name:'豪傑', hp:1.24, atk:1.17, reward:1.42, text:'敵方更強，首領機制加劇，銀兩較多。'}
  };

  const GEARS = {
    mirror: {name:'護心鏡', icon:'🛡️', base:'守勢額外回復氣血。'},
    flag: {name:'軍略旗', icon:'🚩', base:'降低制度絕技豪氣消耗。'},
    seal: {name:'公義印', icon:'🪪', base:'提高每場戰鬥銀兩獎勵。'}
  };

  const GEAR_COSTS = [250, 450, 700, 1000, 1400];

  const KIND = {
    story: {label:'英雄故事', action:'破局', clue:['人物與動機','地勢與時機','百姓與財物','退路與救援'], strategy:['辨明局勢','分清敵我','護住無辜','截斷惡計','留出歸路'], enemy:['攔路惡徒','伏擊頭目','操局權豪']},
    justice: {label:'公義查案', action:'斷案', clue:['身分與案由','證據與程序','權利與告知','救濟與覆核'], strategy:['建立案冊','封存證物','公開程序','停止侵害','覆核救濟'], enemy:['阻案差役','毀證幫閒','枉法豪強']},
    military: {label:'軍陣守備', action:'定陣', clue:['編制與軍令','器械與地形','辨識與通訊','撤退與救護'], strategy:['編定隊伍','丈量險要','統一號令','設立停戰線','整備救護隊'], enemy:['亂令先鋒','奪械戰隊','擾民軍頭']},
    transport: {label:'道路運輸', action:'護行', clue:['路線與班次','載具與限量','票價與保管','事故與替代'], strategy:['登記路線','標明限量','公開費用','設置停運線','安排替代運送'], enemy:['攔路腳夫','黑價車幫','霸運總頭']},
    water: {label:'水路安航', action:'分浪', clue:['名冊與水情','船具與載重','訊號與停航','救援與安置'], strategy:['建立水冊','標出水線','統一旗號','風浪停航','水陸聯援'], enemy:['封渡水手','超載船幫','劫江水寨']},
    health: {label:'醫護安生', action:'濟傷', clue:['來源與症狀','分級與隔離','用藥與紀錄','轉送與追蹤'], strategy:['建立名冊','分級處置','公開用法','停止危害','轉送追蹤'], enemy:['阻醫惡徒','假藥牙行','害命黑主']},
    civic: {label:'百業共治', action:'安民', clue:['名冊與責任','標準與流程','公開與申訴','通報與改善'], strategy:['建冊定責','畫線分區','公開規則','停用警戒','救濟改善'], enemy:['攔辦幫閒','偽冊牙人','把持豪強']},
    trade: {label:'交易百工', action:'驗真', clue:['資格與來源','規格與價格','交付與憑證','退換與補償'], strategy:['查明來源','統一規格','明示價格','停止危品','退換補償'], enemy:['欺市伙計','造假行幫','壟斷東家']},
    wild: {label:'山林百獸', action:'巡界', clue:['範圍與季節','足跡與風險','禁限與告示','救援與復育'], strategy:['畫定範圍','記錄足跡','公示禁限','封閉險區','救援復育'], enemy:['越界獵手','設陷山幫','霸山頭領']},
    stealth: {label:'潛行偵查', action:'探險', clue:['身分與暗號','路線與時機','目標與證據','撤離與接應'], strategy:['核對暗號','標出密路','留存證據','切斷追兵','安排接應'], enemy:['巡哨耳目','暗路伏兵','密寨首領']}
  };

  const HERO_ROLES = {
    story: {role:'猛將', suffix:['烈膽','破陣','無雙'], desc:'普攻有機會追擊，氣血越低攻勢越強。'},
    justice: {role:'斷案', suffix:['明鏡','鐵證','公斷'], desc:'專屬技可穿透防禦，並持續削弱首領。'},
    military: {role:'守將', suffix:['鐵壁','軍魂','反鋒'], desc:'守勢可獲得護盾，受擊時有機會反擊。'},
    transport: {role:'疾行', suffix:['飛馳','接力','先驅'], desc:'普通攻擊回復豪氣，連續行動更靈活。'},
    water: {role:'水軍', suffix:['乘浪','潮生','分江'], desc:'累積潮勢，第三次攻擊會追加浪擊。'},
    health: {role:'醫護', suffix:['回春','濟世','續命'], desc:'專屬技能同時治療自身並解除負面狀態。'},
    civic: {role:'軍師', suffix:['安民','定策','公議'], desc:'制度絕技消耗較低，並能穩定恢復氣血。'},
    trade: {role:'巧匠', suffix:['精算','百工','鑑真'], desc:'技能容易暴擊，勝利時有額外銀兩。'},
    wild: {role:'獵蹤', suffix:['追風','伏獸','山行'], desc:'高暴擊率，能識破首領護甲與反擊。'},
    stealth: {role:'奇襲', suffix:['無影','夜行','奪隙'], desc:'首擊大幅增傷，並有機會閃避敵方反擊。'}
  };

  const COMPANION_TYPES = [
    {key:'assault', title:'合擊破甲', text:'造成重擊並降低敵方防禦。'},
    {key:'healer', title:'護命回春', text:'造成傷害並大量回復主角氣血。'},
    {key:'tactician', title:'奇策回氣', text:'造成傷害並回復豪氣、削弱攻擊。'},
    {key:'guardian', title:'捨身護陣', text:'造成傷害並賦予護盾。'},
    {key:'disrupt', title:'斷勢封招', text:'造成傷害並使敵方下一次行動失效。'},
    {key:'fortune', title:'聚義得財', text:'造成傷害並提高本場勝利銀兩。'}
  ];

  const BOSS_MECHANICS = [
    {key:'armor', name:'鐵甲護身', text:'首領具有額外護甲，必須先擊破護甲才能傷及本體。'},
    {key:'enrage', name:'困獸暴怒', text:'氣血低於一半時攻擊大幅提高。'},
    {key:'regen', name:'邪陣回生', text:'每三回合恢復部分氣血。'},
    {key:'reinforce', name:'召集援兵', text:'每三回合提高攻擊與防禦。'},
    {key:'poison', name:'毒霧侵體', text:'每次反擊後附加持續毒傷。'},
    {key:'counter', name:'借力反震', text:'主角使用高階技能時，首領會追加反震傷害。'}
  ];

  const FLOW = [
    {type:'clue', index:0, phase:'查驗'},
    {type:'clue', index:1, phase:'查驗'},
    {type:'strategy', index:0, phase:'軍略'},
    {type:'battle', index:0, phase:'前哨戰'},
    {type:'clue', index:2, phase:'查驗'},
    {type:'strategy', index:1, phase:'軍略'},
    {type:'strategy', index:2, phase:'軍略'},
    {type:'battle', index:1, phase:'查驗戰'},
    {type:'clue', index:3, phase:'查驗'},
    {type:'strategy', index:3, phase:'軍略'},
    {type:'strategy', index:4, phase:'軍略'},
    {type:'battle', index:2, phase:'首領戰'},
    {type:'finish', index:0, phase:'結算'}
  ];

  const freshState = () => ({
    version: VERSION,
    updatedAt: new Date().toISOString(),
    silver: 500,
    selected: 1,
    unlocked: 1,
    completed: {},
    current: null,
    runs: {},
    recent: [],
    inventory: {medicines:0, gearLevels:{mirror:0, flag:0, seal:0}},
    migration: {done:false, legacy:false, sequel:false, v70:false, imported:[], note:'尚未檢查舊存檔。'}
  });

  const freshPrefs = () => ({theme:'ink', difficulty:'standard', gear:'mirror', sound:true, speech:false});

  let prefs = loadPrefs();
  let state = loadState();
  let screen = 'home';
  let chapterSearch = '';
  let chapterEra = 'all';
  let chapterStatus = 'all';
  let deferredPrompt = null;
  let audioContext = null;
  let battleBusy = false;
  let swRegistration = null;
  let refreshing = false;

  function loadPrefs() {
    try {
      const raw = JSON.parse(storage.getItem(PREF_KEY) || 'null');
      const merged = {...freshPrefs(), ...(raw || {})};
      if (!DIFFICULTIES[merged.difficulty]) merged.difficulty = 'standard';
      if (!GEARS[merged.gear]) merged.gear = 'mirror';
      if (!['ink','dark','paper'].includes(merged.theme)) merged.theme = 'ink';
      return merged;
    } catch { return freshPrefs(); }
  }

  function normalizeRun(raw) {
    const number = clamp(Number(raw?.chapter) || 1, 1, 108);
    const base = makeRun(number);
    const merged = {
      ...base, ...(raw || {}),
      hero:{...base.hero, ...(raw?.hero || {})},
      companion:{...base.companion, ...(raw?.companion || {})},
      stats:{...base.stats, ...(raw?.stats || {})},
      battles:{...base.battles, ...(raw?.battles || {})}
    };
    merged.clues = Array.isArray(raw?.clues) ? [...new Set(raw.clues.map(Number).filter(x => x >= 0 && x <= 3))] : [];
    merged.strategies = Array.isArray(raw?.strategies) ? [...new Set(raw.strategies.map(Number).filter(x => x >= 0 && x <= 4))] : [];
    merged.medicines = clamp(Number(raw?.medicines ?? 2), 0, 9);
    merged.gear = GEARS[raw?.gear] ? raw.gear : prefs.gear;
    merged.difficulty = DIFFICULTIES[raw?.difficulty] ? raw.difficulty : prefs.difficulty;
    merged.flowVersion = 2;
    if (merged.complete) merged.battle = null;
    return merged;
  }

  function mergeState(raw) {
    const base = freshState();
    const merged = {...base, ...(raw || {})};
    merged.version = VERSION;
    merged.completed = raw?.completed && typeof raw.completed === 'object' ? raw.completed : {};
    merged.runs = raw?.runs && typeof raw.runs === 'object' ? raw.runs : {};
    Object.keys(merged.runs).forEach(key => { merged.runs[key] = normalizeRun(merged.runs[key]); });
    if (raw?.current?.chapter) {
      const run = normalizeRun(raw.current);
      merged.current = run;
      merged.runs[String(run.chapter)] = run;
    } else merged.current = null;
    merged.recent = Array.isArray(raw?.recent) ? [...new Set(raw.recent.map(Number).filter(x => x >= 1 && x <= 108))].slice(0,12) : [];
    merged.inventory = {
      medicines:clamp(Number(raw?.inventory?.medicines) || 0, 0, 99),
      gearLevels:{
        mirror:clamp(Number(raw?.inventory?.gearLevels?.mirror) || 0, 0, 5),
        flag:clamp(Number(raw?.inventory?.gearLevels?.flag) || 0, 0, 5),
        seal:clamp(Number(raw?.inventory?.gearLevels?.seal) || 0, 0, 5)
      }
    };
    merged.migration = {...base.migration, ...(raw?.migration || {})};
    merged.selected = clamp(Number(raw?.selected) || 1, 1, 108);
    merged.unlocked = clamp(Number(raw?.unlocked) || 1, 1, 108);
    merged.silver = Math.max(0, Math.round(Number(raw?.silver) || 0));
    return merged;
  }

  function loadState() {
    try {
      const rawText = storage.getItem(SAVE_KEY);
      const raw = JSON.parse(rawText || 'null');
      if (raw && raw.version) {
        if (raw.version !== VERSION && !storage.getItem(`${BACKUP_PREFIX}v${raw.version}`)) {
          storage.setItem(`${BACKUP_PREFIX}v${raw.version}`, rawText);
        }
        const merged = mergeState(raw);
        if (raw.version === '7.0.0') {
          merged.migration.v70 = true;
          merged.migration.note = '已備份並升級 v7.0.0 完整章回存檔；進行中章回已轉為多章回暫存。';
        }
        return merged;
      }
    } catch {}
    return freshState();
  }

  function save(silent = true) {
    if (state.current?.chapter) state.runs[String(state.current.chapter)] = state.current;
    state.updatedAt = new Date().toISOString();
    state.version = VERSION;
    storage.setItem(SAVE_KEY, JSON.stringify(state));
    storage.setItem(PREF_KEY, JSON.stringify(prefs));
    if (!silent) { toast('進度已收入本機存檔。', 'good'); tone('save'); }
  }

  function markImported(number, grade = 'A', score = 82, source = '舊版承接') {
    const key = String(number);
    if (!state.completed[key] || Number(state.completed[key].score || 0) < score) {
      state.completed[key] = {grade, score, actions:0, defeats:0, medicinesUsed:0, achievements:['舊版完成紀錄'], completedAt:new Date().toISOString(), source};
    }
    if (!state.migration.imported.includes(number)) state.migration.imported.push(number);
    state.unlocked = Math.max(state.unlocked, Math.min(108, number + 1));
  }

  function migrateOldSaves() {
    if (state.migration.done) { save(true); return; }
    const notes = [];
    try {
      const legacyRaw = storage.getItem(OLD_LEGACY_KEY);
      if (legacyRaw) {
        storage.setItem(`${BACKUP_PREFIX}legacy`, legacyRaw);
        const legacy = JSON.parse(legacyRaw);
        let count = 0;
        for (let n = 1; n <= 34; n++) if (legacy?.flags?.[`chapter${n}Complete`]) { markImported(n, 'A', 84, 'v4.5.0 經典篇'); count++; }
        if (count) { state.migration.legacy = true; notes.push(`承接經典篇 ${count} 回`); state.silver += Math.min(500, Math.max(0, Number(legacy?.silver || legacy?.inventory?.silver || 0) * .1)); }
      }
    } catch { notes.push('經典篇存檔格式無法承接'); }
    try {
      const sequelRaw = storage.getItem(OLD_SEQUEL_KEY);
      if (sequelRaw) {
        storage.setItem(`${BACKUP_PREFIX}v6.2.0`, sequelRaw);
        const old = JSON.parse(sequelRaw);
        let count = 0;
        if (old?.complete && (old?.version === '6.2.0' || old?.hero?.name === '李俊')) {
          for (let n = 35; n <= 51; n++) { markImported(n, n === 51 && old.grade ? old.grade : 'A', n === 51 && old.score ? Number(old.score) : 84, 'v6.2.0 續篇'); count++; }
        }
        if (count) { state.migration.sequel = true; notes.push(`承接制度續篇 ${count} 回`); state.silver += Math.min(500, Math.floor(Number(old?.silver || 0) * .25)); }
      }
    } catch { notes.push('續篇存檔格式無法承接'); }
    state.silver = Math.round(state.silver);
    state.migration.done = true;
    state.migration.imported.sort((a,b) => a-b);
    if (notes.length) state.migration.note = notes.join('；');
    else if (!state.migration.v70) state.migration.note = '未發現可承接的舊存檔，已建立全新深度玩法進度。';
    state.selected = firstIncomplete();
    save(true);
  }

  function chapter(number) { return chapters[number - 1]; }
  function currentChapter() { return state.current ? chapter(state.current.chapter) : chapter(state.selected); }
  function kindData(ch) { return KIND[ch.kind] || KIND.civic; }
  function completionCount() { return Object.keys(state.completed).filter(k => state.completed[k]).length; }
  function sCount() { return Object.values(state.completed).filter(item => item?.grade === 'S').length; }
  function totalScore() { return Object.values(state.completed).reduce((sum, item) => sum + Number(item?.score || 0), 0); }
  function pct(value, max) { return clamp(Math.round((value / Math.max(1, max)) * 100), 0, 100); }
  function firstIncomplete() { for (let n = 1; n <= 108; n++) if (!state.completed[String(n)]) return n; return 108; }
  function gearLevel(key) { return clamp(Number(state.inventory.gearLevels[key]) || 0, 0, 5); }
  function mirrorHeal(key = 'mirror') { return 45 + gearLevel(key) * 18; }
  function flagCost(key = 'flag') { return Math.max(65, 85 - gearLevel(key) * 4); }
  function sealMultiplier(key = 'seal') { return 1.15 + gearLevel(key) * .05; }
  function gearText(key) {
    const level = gearLevel(key);
    if (key === 'mirror') return `守勢額外回復 ${mirrorHeal()} 氣血。`;
    if (key === 'flag') return `制度絕技豪氣消耗降為 ${flagCost()}。`;
    return `每場戰鬥勝利銀兩增加 ${Math.round((sealMultiplier()-1)*100)}%。`;
  }

  function heroStats(number) {
    return {maxHp:880 + number * 8, maxSp:600 + number * 4, atk:91 + Math.round(number * .9), def:47 + Math.round(number * .46)};
  }

  function heroProfile(ch) {
    const base = HERO_ROLES[ch.kind] || HERO_ROLES.civic;
    const variant = ch.number % 3;
    return {role:base.role, name:`${ch.nickname}・${base.suffix[variant]}`, description:base.desc, variant};
  }

  function companionProfile(ch) {
    const item = COMPANION_TYPES[(ch.number + ch.companion.length) % COMPANION_TYPES.length];
    return {...item, name:`${ch.companionNickname}・${item.title}`};
  }

  function bossProfile(ch) {
    return BOSS_MECHANICS[(ch.number - 1) % BOSS_MECHANICS.length];
  }

  function makeRun(number) {
    const ch = chapter(number);
    const stats = heroStats(number);
    return {
      chapter:number,
      startedAt:new Date().toISOString(),
      lastPlayedAt:new Date().toISOString(),
      flowVersion:2,
      clues:[], strategies:[], battles:{0:false,1:false,2:false},
      hero:{hp:stats.maxHp,maxHp:stats.maxHp,sp:stats.maxSp,maxSp:stats.maxSp,atk:stats.atk,def:stats.def,guarding:false,shield:0,tide:0},
      companion:{name:ch.companion,nickname:ch.companionNickname,unlocked:false},
      medicines:2,
      silverEarned:0,
      gear:prefs.gear,
      difficulty:prefs.difficulty,
      battle:null,
      stats:{actions:0,defeats:0,medicinesUsed:0,bossCompanionUsed:false},
      complete:false, grade:'', score:0, achievements:[], log:[`第 ${number} 回「${ch.title}」開始。`]
    };
  }

  function addRecent(number) {
    state.recent = [Number(number), ...state.recent.filter(n => Number(n) !== Number(number))].slice(0,12);
  }

  function openChapterChoice(number) {
    const n = clamp(Number(number), 1, 108);
    const ch = chapter(n);
    const draft = state.runs[String(n)];
    const currentOther = state.current && !state.current.complete && state.current.chapter !== n ? state.current.chapter : null;
    if (draft && !draft.complete) {
      openModal(`第 ${n} 回已有進度`, `<p>「${esc(ch.title)}」已有進行中紀錄。繼續遊玩不會重設查驗、軍略或戰鬥進度。</p><div class="actions"><button class="btn good" data-modal="chapter-resume" data-number="${n}">繼續本回</button><button class="btn danger" data-modal="chapter-restart" data-number="${n}">重新挑戰</button><button class="btn" data-modal="close">取消</button></div>`);
      return;
    }
    if (currentOther) {
      const currentName = chapter(currentOther).title;
      openModal('切換章回', `<p>第 ${currentOther} 回「${esc(currentName)}」仍在進行中。切換後會保留原進度，可隨時回來繼續。</p><p>確定前往第 ${n} 回「${esc(ch.title)}」嗎？</p><div class="actions"><button class="btn primary" data-modal="chapter-switch" data-number="${n}">保留進度並切換</button><button class="btn" data-modal="close">取消</button></div>`);
      return;
    }
    if (state.completed[String(n)]) {
      const record = state.completed[String(n)];
      openModal(`第 ${n} 回已完成`, `<p>最佳紀錄為 <b>${record.grade}・${record.score} 分</b>。重新挑戰會建立新的本次進度，但最佳紀錄仍會保留。</p><div class="actions"><button class="btn primary" data-modal="chapter-restart" data-number="${n}">重新挑戰</button><button class="btn" data-modal="close">取消</button></div>`);
      return;
    }
    startChapter(n, false);
  }

  function startChapter(number, forceNew = false) {
    const n = clamp(Number(number), 1, 108);
    if (state.current?.chapter) state.runs[String(state.current.chapter)] = state.current;
    let run = state.runs[String(n)];
    if (forceNew || !run || run.complete) run = makeRun(n);
    run = normalizeRun(run);
    run.lastPlayedAt = new Date().toISOString();
    state.current = run;
    state.runs[String(n)] = run;
    state.selected = n;
    addRecent(n);
    screen = run.battle ? 'battle' : run.complete ? 'ending' : 'chapter';
    save(true);
    render();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function clueData(ch) {
    const data = kindData(ch);
    return data.clue.map((title, index) => ({
      title, icon:['📋','📏','📢','🆘'][index],
      text:[
        `核對「${ch.focus}」涉及的人員、區域、時段與負責者，先把責任寫入可查名冊。`,
        `逐項檢查器具、環境、數量與界線，所有異常都要留下位置與證據。`,
        `把費用、限制、停止條件與申訴方式公開，不能只靠口頭傳令。`,
        `遇到受傷、失聯、財物受損或重大危險時，立即通報、安置並追蹤改善。`
      ][index]
    }));
  }

  function strategyData(ch) {
    const data = kindData(ch);
    return data.strategy.map((title, index) => ({
      title,
      text:[
        `為「${ch.focus}」建立統一名冊、編號與責任分工。`,
        `把安全範圍、數量上限、動線與危險區域清楚標示。`,
        `公開規則、費用、聯絡窗口與異常紀錄，讓眾人都能查驗。`,
        `達到危險標準時立即停止作業、封鎖現場並發出一致警號。`,
        `串聯梁山、村寨、醫棚與巡隊，完成救援、補償及後續改善。`
      ][index]
    }));
  }

  function chapterIntro(ch) {
    const intros = {
      story:`${ch.nickname}${ch.name}奉命走入事件核心。這一回以「${ch.focus}」為主線，要辨清人物動機、保住無辜百姓，並讓勝利留下可長久遵循的規矩。`,
      justice:`${ch.nickname}${ch.name}接下梁山公議堂的木牌，查辦「${ch.focus}」。證據、程序、告知與救濟必須一一寫清。`,
      military:`${ch.nickname}${ch.name}整點人馬，面對「${ch.focus}」。軍令、器械、通訊與撤退救護缺一不可。`,
      transport:`${ch.nickname}${ch.name}巡查「${ch.focus}」。本回要建立可查、可停、可替代的安全運送制度。`,
      water:`${ch.nickname}${ch.name}領水軍查驗「${ch.focus}」。船冊、水線、停航與救援必須同時整治。`,
      health:`${ch.nickname}${ch.name}協同醫棚處理「${ch.focus}」。辨明來源、分級處置、用藥留錄與轉送追蹤缺一不可。`,
      civic:`${ch.nickname}${ch.name}主持「${ch.focus}」的制度整頓，建立人人看得懂、查得到、能申訴、可改善的日常規則。`,
      trade:`${ch.nickname}${ch.name}走入市集與作坊，查驗「${ch.focus}」。來源、規格、價格、憑證與補償必須相互對得上。`,
      wild:`${ch.nickname}${ch.name}深入山林，處理「${ch.focus}」。必須劃界、巡查、救援並留下復育空間。`,
      stealth:`${ch.nickname}${ch.name}改裝潛行，暗查「${ch.focus}」。暗號、路線、證據與接應若有一環出錯，便會牽連無辜。`
    };
    return intros[ch.kind] || intros.civic;
  }

  function skillNames(ch) {
    const data = kindData(ch);
    const second = ch.title.includes('・') ? ch.title.split('・')[1] : `${data.label}安定`;
    const profile = heroProfile(ch);
    const support = companionProfile(ch);
    return {attack:`${ch.nickname}進擊`, skill:profile.name, system:second, companion:support.name};
  }

  function enemyFor(ch, stage, difficultyKey, gearKey) {
    const data = kindData(ch);
    const difficulty = DIFFICULTIES[difficultyKey] || DIFFICULTIES.standard;
    const scale = 1 + (ch.number - 1) * .0105;
    const baseHp = [500,710,970][stage];
    const baseAtk = [49,59,70][stage] + ch.number * .15;
    const baseDef = [15,22,30][stage] + ch.number * .09;
    const baseReward = [58,92,148][stage] + ch.number * 2.2;
    const rewardGear = gearKey === 'seal' ? sealMultiplier() : 1;
    const mechanic = stage === 2 ? bossProfile(ch) : null;
    const hp = Math.round(baseHp * scale * difficulty.hp);
    return {
      name:stage === 2 ? `${data.enemy[stage]}・${ch.focus}黑主` : `${data.enemy[stage]}・${ch.focus}`,
      icon:[ch.icon,'⚠️','👹'][stage],
      maxHp:hp, hp,
      atk:Math.round(baseAtk * scale * difficulty.atk),
      def:Math.round(baseDef * (1 + (ch.number - 1) * .003)),
      reward:Math.round(baseReward * difficulty.reward * rewardGear),
      intro:[`第一道阻力封住現場，拒絕交出名冊與查驗紀錄。`,`第二股勢力偽造規則、藏匿缺失，企圖讓整頓半途而廢。`,`幕後黑主操控「${ch.focus}」，準備毀去全部證據與救援線。`][stage],
      mechanic:mechanic ? {...mechanic} : null,
      shield:mechanic?.key === 'armor' ? Math.round(hp * .28) : 0,
      enraged:false,
      stunned:false,
      bonusSilver:0
    };
  }

  function stepDone(run, step) {
    if (step.type === 'clue') return run.clues.includes(step.index);
    if (step.type === 'strategy') return run.strategies.includes(step.index);
    if (step.type === 'battle') return Boolean(run.battles[String(step.index)]);
    if (step.type === 'finish') return Boolean(run.complete);
    return false;
  }

  function currentStepIndex(run) {
    const index = FLOW.findIndex(step => !stepDone(run, step));
    return index < 0 ? FLOW.length - 1 : index;
  }

  function canPerform(run, type, index = 0) {
    const step = FLOW[currentStepIndex(run)];
    return step?.type === type && Number(step.index) === Number(index);
  }

  function startBattle(stage) {
    const run = state.current;
    if (!run || run.battle) return;
    const ch = currentChapter();
    const s = Number(stage);
    if (!canPerform(run, 'battle', s)) return toast('請依故事流程完成前一個步驟。','warn');
    run.hero.hp = run.hero.maxHp;
    run.hero.sp = run.hero.maxSp;
    run.hero.guarding = false;
    run.hero.shield = 0;
    run.hero.tide = 0;
    const enemy = enemyFor(ch, s, run.difficulty, run.gear);
    run.battle = {stage:s, turn:1, actions:0, companionUsed:false, difficulty:run.difficulty, gear:run.gear, enemy, log:[`迎戰：${enemy.name}`]};
    if (enemy.mechanic) run.battle.log.unshift(`首領機制「${enemy.mechanic.name}」啟動：${enemy.mechanic.text}`);
    screen = 'battle';
    save(true);
    render();
    tone('battle');
  }

  function applyDamage(enemy, amount, pierce = false) {
    let damage = Math.max(0, Math.round(amount));
    if (enemy.shield > 0 && !pierce) {
      const absorbed = Math.min(enemy.shield, damage);
      enemy.shield -= absorbed;
      damage -= absorbed;
      if (absorbed) state.current.battle.log.unshift(`首領護甲吸收 ${absorbed} 點傷害。`);
    }
    enemy.hp = Math.max(0, enemy.hp - damage);
    return damage;
  }

  function applyHeroActionBonus(action, baseDamage) {
    const run = state.current;
    const ch = currentChapter();
    const battle = run.battle;
    const hero = run.hero;
    const profile = heroProfile(ch);
    let damage = baseDamage;
    let pierce = false;
    let note = '';

    if (ch.kind === 'story' && action === 'attack' && Math.random() < (.20 + profile.variant * .03)) { damage *= 1.65; note = '勇烈追擊'; }
    if (ch.kind === 'justice' && action === 'skill') { damage *= 1.12; pierce = true; battle.enemy.atk = Math.max(18, battle.enemy.atk - (7 + profile.variant * 2)); note = '鐵證穿防'; }
    if (ch.kind === 'military' && action === 'guard') { hero.shield += 95 + profile.variant * 25; note = '軍陣護盾'; }
    if (ch.kind === 'transport' && action === 'attack') { hero.sp = clamp(hero.sp + 22 + profile.variant * 6, 0, hero.maxSp); note = '疾行回氣'; }
    if (ch.kind === 'water' && action === 'attack') {
      hero.tide = (hero.tide || 0) + 1;
      if (hero.tide >= 3) { damage *= 1.75; hero.tide = 0; note = '潮勢浪擊'; }
    }
    if (ch.kind === 'health' && action === 'skill') { const heal = 85 + profile.variant * 25; hero.hp = clamp(hero.hp + heal, 0, hero.maxHp); note = `回春 ${heal}`; }
    if (ch.kind === 'civic' && action === 'system') { const heal = 70 + profile.variant * 20; hero.hp = clamp(hero.hp + heal, 0, hero.maxHp); note = `安民回復 ${heal}`; }
    if (ch.kind === 'trade' && (action === 'skill' || action === 'system') && Math.random() < .34) { damage *= 1.55; battle.enemy.bonusSilver += 18 + ch.number; note = '精算暴擊'; }
    if (ch.kind === 'wild' && action !== 'guard' && Math.random() < (.24 + profile.variant * .03)) { damage *= 1.5; pierce = true; note = '獵蹤暴擊'; }
    if (ch.kind === 'stealth' && battle.actions === 0 && action !== 'guard') { damage *= 1.9; pierce = true; note = '無影首擊'; }
    return {damage:Math.round(damage), pierce, note};
  }

  function companionAction(run, ch, battle, hero, enemy) {
    const profile = companionProfile(ch);
    let damage = Math.max(120, Math.round(hero.atk * 1.55) + rand(22, 52) - Math.round(enemy.def * .25));
    let note = '';
    if (profile.key === 'assault') { enemy.def = Math.max(8, enemy.def - 16); damage *= 1.18; note = '大破敵甲'; }
    if (profile.key === 'healer') { const heal = 170 + profile.title.length * 4; hero.hp = clamp(hero.hp + heal, 0, hero.maxHp); note = `回復 ${heal} 氣血`; }
    if (profile.key === 'tactician') { hero.sp = clamp(hero.sp + 120, 0, hero.maxSp); enemy.atk = Math.max(18, enemy.atk - 9); note = '回復豪氣並削攻'; }
    if (profile.key === 'guardian') { hero.shield += 180; note = '獲得 180 護盾'; }
    if (profile.key === 'disrupt') { enemy.stunned = true; note = '封住下一次反擊'; }
    if (profile.key === 'fortune') { enemy.bonusSilver += 65 + ch.number; note = '提高勝利銀兩'; }
    damage = applyDamage(enemy, damage, profile.key === 'assault');
    battle.log.unshift(`${ch.companion}施展「${profile.name}」，造成 ${damage} 點傷害，${note}。`);
  }

  function bossAfterHero(action) {
    const run = state.current;
    const battle = run.battle;
    const enemy = battle.enemy;
    if (!enemy.mechanic || enemy.hp <= 0) return 0;
    let extra = 0;
    if (enemy.mechanic.key === 'enrage' && !enemy.enraged && enemy.hp <= enemy.maxHp * .5) {
      enemy.enraged = true;
      enemy.atk = Math.round(enemy.atk * 1.38);
      battle.log.unshift(`首領「困獸暴怒」發作，攻擊提高！`);
    }
    if (enemy.mechanic.key === 'counter' && ['skill','system'].includes(action)) {
      extra = 28 + Math.round(enemy.atk * .38);
      battle.log.unshift(`首領發動反震，追加 ${extra} 點傷害。`);
    }
    return extra;
  }

  function bossBeforeEnemy() {
    const run = state.current;
    const battle = run.battle;
    const enemy = battle.enemy;
    if (!enemy.mechanic) return;
    if (enemy.mechanic.key === 'regen' && battle.turn % 3 === 0) {
      const heal = Math.round(enemy.maxHp * (battle.difficulty === 'heroic' ? .10 : .07));
      enemy.hp = clamp(enemy.hp + heal, 0, enemy.maxHp);
      battle.log.unshift(`首領邪陣回生，恢復 ${heal} 氣血。`);
    }
    if (enemy.mechanic.key === 'reinforce' && battle.turn % 3 === 0) {
      enemy.atk += battle.difficulty === 'heroic' ? 10 : 7;
      enemy.def += battle.difficulty === 'heroic' ? 6 : 4;
      battle.log.unshift('首領召來援兵，攻擊與防禦提高。');
    }
  }

  function battleAction(action) {
    if (battleBusy || !state.current?.battle) return;
    battleBusy = true;
    const run = state.current;
    const ch = currentChapter();
    const names = skillNames(ch);
    const battle = run.battle;
    const hero = run.hero;
    const enemy = battle.enemy;
    const systemCost = battle.gear === 'flag' ? flagCost() : (ch.kind === 'civic' ? 95 : 105);
    let damage = 0;
    let acted = false;
    hero.guarding = false;

    if (action === 'attack') {
      acted = true;
      damage = Math.max(24, hero.atk + rand(-12, 21) - Math.round(enemy.def * .55));
    }
    if (action === 'skill' && hero.sp >= 60) {
      acted = true;
      hero.sp -= 60;
      damage = Math.max(60, Math.round(hero.atk * 1.72) + rand(10, 34) - Math.round(enemy.def * .42));
      enemy.atk = Math.max(22, enemy.atk - 5);
    }
    if (action === 'system' && hero.sp >= systemCost) {
      acted = true;
      hero.sp -= systemCost;
      damage = Math.max(95, Math.round(hero.atk * 2.18) + rand(20, 48) - Math.round(enemy.def * .3));
      hero.hp = clamp(hero.hp + 58, 0, hero.maxHp);
    }
    if (action === 'guard') {
      acted = true;
      hero.guarding = true;
      hero.sp = clamp(hero.sp + 44, 0, hero.maxSp);
      const heal = battle.gear === 'mirror' ? mirrorHeal() : 0;
      hero.hp = clamp(hero.hp + heal, 0, hero.maxHp);
      const bonus = applyHeroActionBonus(action, 0);
      battle.log.unshift(`${ch.name}守住百姓與證冊，回復 44 豪氣${heal ? `、${heal} 氣血` : ''}${bonus.note ? `，觸發${bonus.note}` : ''}。`);
      tone('guard');
    }
    if (action === 'companion' && !battle.companionUsed) {
      acted = true;
      battle.companionUsed = true;
      companionAction(run, ch, battle, hero, enemy);
      if (battle.stage === 2) run.stats.bossCompanionUsed = true;
      tone('companion');
    }
    if (action === 'medicine' && run.medicines > 0) {
      acted = true;
      run.medicines--;
      run.stats.medicinesUsed++;
      hero.hp = clamp(hero.hp + 300, 0, hero.maxHp);
      battle.log.unshift(`${ch.name}使用金瘡藥，回復 300 氣血。`);
      tone('save');
    }
    if (!acted) { battleBusy = false; return; }

    if (damage > 0) {
      const bonus = applyHeroActionBonus(action, damage);
      damage = applyDamage(enemy, bonus.damage, bonus.pierce);
      const label = action === 'attack' ? names.attack : action === 'skill' ? names.skill : names.system;
      battle.log.unshift(`「${label}」造成 ${damage} 點傷害${bonus.note ? `，觸發${bonus.note}` : ''}。`);
      tone(action === 'attack' ? 'hit' : 'skill');
    }

    battle.actions++;
    run.stats.actions++;
    if (enemy.hp <= 0) { battleVictory(); battleBusy = false; return; }

    const counterDamage = bossAfterHero(action);
    if (counterDamage) hero.hp = Math.max(0, hero.hp - counterDamage);
    if (hero.hp <= 0) { handleDefeat(); battleBusy = false; return; }

    bossBeforeEnemy();
    if (enemy.stunned) {
      enemy.stunned = false;
      battle.log.unshift(`${enemy.name}被封住行動，本回合無法反擊。`);
    } else {
      let evaded = false;
      if (ch.kind === 'stealth' && Math.random() < .18) { evaded = true; battle.log.unshift(`${ch.name}施展夜行身法，閃過反擊。`); }
      if (!evaded) {
        const raw = Math.max(18, enemy.atk + rand(-8, 17) - Math.round(hero.def * .42));
        let taken = hero.guarding ? Math.round(raw * .38) : raw;
        if (hero.shield > 0) {
          const absorbed = Math.min(hero.shield, taken);
          hero.shield -= absorbed;
          taken -= absorbed;
          battle.log.unshift(`護盾吸收 ${absorbed} 點傷害。`);
        }
        hero.hp = Math.max(0, hero.hp - taken);
        battle.log.unshift(`${enemy.name}反擊，${ch.name}受到 ${taken} 點傷害。`);
        if (ch.kind === 'military' && taken > 0 && Math.random() < .22) {
          const counter = applyDamage(enemy, Math.round(hero.atk * .55), false);
          battle.log.unshift(`${ch.name}軍陣反鋒，反擊 ${counter} 點傷害。`);
        }
        if (enemy.mechanic?.key === 'poison') {
          const poison = battle.difficulty === 'heroic' ? 34 : 24;
          hero.hp = Math.max(0, hero.hp - poison);
          battle.log.unshift(`毒霧侵體，追加 ${poison} 點傷害。`);
        }
      }
    }

    battle.turn++;
    hero.guarding = false;
    tone('hurt');
    if (enemy.hp <= 0) { battleVictory(); battleBusy = false; return; }
    if (hero.hp <= 0) { handleDefeat(); battleBusy = false; return; }
    save(true);
    renderBattle();
    battleBusy = false;
  }

  function handleDefeat() {
    const run = state.current;
    run.stats.defeats++;
    run.hero.hp = Math.round(run.hero.maxHp * .72);
    run.hero.sp = Math.round(run.hero.maxSp * .72);
    run.hero.shield = 0;
    run.battle = null;
    screen = 'chapter';
    save(true);
    toast('本場失利，已退回戰前整補；故事進度仍完整保留。','warn');
    render();
  }

  function battleVictory() {
    const run = state.current;
    const battle = run.battle;
    const stage = battle.stage;
    const reward = battle.enemy.reward + Math.round(battle.enemy.bonusSilver || 0);
    run.battles[String(stage)] = true;
    run.silverEarned += reward;
    state.silver += reward;
    run.medicines = Math.min(5, run.medicines + 1);
    run.hero.hp = run.hero.maxHp;
    run.hero.sp = run.hero.maxSp;
    run.hero.shield = 0;
    run.log.unshift(`第 ${stage + 1} 場勝利，獲得 ${reward} 銀兩。`);
    if (stage === 0) run.companion.unlocked = true;
    run.battle = null;
    screen = 'chapter';
    save(true);
    toast(`戰鬥勝利，獲得 ${reward} 銀兩。`, 'good');
    tone('victory');
    render();
  }

  function collectClue(index) {
    const run = state.current;
    const i = Number(index);
    if (!run || run.clues.includes(i)) return;
    if (!canPerform(run, 'clue', i)) return toast('請依故事進程完成目前步驟。','warn');
    run.clues.push(i); run.clues.sort();
    run.hero.sp = clamp(run.hero.sp + 25, 0, run.hero.maxSp);
    run.log.unshift(`查驗完成：${clueData(currentChapter())[i].title}。`);
    save(true); renderChapter(); tone('save');
  }

  function doStrategy(index) {
    const run = state.current;
    const i = Number(index);
    if (!run || run.strategies.includes(i)) return;
    if (!canPerform(run, 'strategy', i)) return toast('請依故事進程完成目前步驟。','warn');
    run.strategies.push(i); run.strategies.sort();
    run.hero.hp = clamp(run.hero.hp + 40, 0, run.hero.maxHp);
    run.hero.sp = clamp(run.hero.sp + 50, 0, run.hero.maxSp);
    run.log.unshift(`軍略完成：${strategyData(currentChapter())[i].title}。`);
    save(true); renderChapter(); tone('skill');
  }

  function computeResult(run) {
    let score = 100;
    score -= Math.max(0, run.stats.actions - 12) * 2;
    score -= run.stats.defeats * 12;
    score -= run.stats.medicinesUsed * 5;
    score -= run.stats.bossCompanionUsed ? 4 : 0;
    score = clamp(Math.round(score), 40, 100);
    const grade = score >= 90 ? 'S' : score >= 78 ? 'A' : score >= 65 ? 'B' : 'C';
    const achievements = [];
    if (run.clues.length === 4) achievements.push('明察四證');
    if (run.stats.defeats === 0) achievements.push('三戰連捷');
    if (run.stats.medicinesUsed === 0) achievements.push('無藥制勝');
    if (!run.stats.bossCompanionUsed) achievements.push('獨當一面');
    return {score, grade, achievements};
  }

  function finishChapter() {
    const run = state.current;
    if (!run || !canPerform(run, 'finish', 0) || !run.battles['2']) return;
    const result = computeResult(run);
    run.complete = true;
    run.score = result.score;
    run.grade = result.grade;
    run.achievements = result.achievements;
    const ch = currentChapter();
    const reward = 180 + ch.number * 3;
    state.silver += reward;
    run.silverEarned += reward;
    const previous = state.completed[String(ch.number)];
    const record = {grade:result.grade,score:result.score,actions:run.stats.actions,defeats:run.stats.defeats,medicinesUsed:run.stats.medicinesUsed,achievements:result.achievements,completedAt:new Date().toISOString(),source:`v${VERSION} ${EDITION}`};
    if (!previous || Number(previous.score || 0) <= result.score) state.completed[String(ch.number)] = record;
    state.unlocked = Math.max(state.unlocked, Math.min(108, ch.number + 1));
    state.selected = Math.min(108, ch.number + 1);
    run.log.unshift(`第 ${ch.number} 回完成，評級 ${result.grade}、${result.score} 分。`);
    state.runs[String(ch.number)] = run;
    screen = 'ending';
    save(true); render(); tone('achievement');
  }

  function buyMedicine() {
    const cost = 120;
    if (state.silver < cost) return toast('銀兩不足，無法購買金瘡藥。','warn');
    if (state.inventory.medicines >= 99) return toast('備用金瘡藥已達上限。','warn');
    state.silver -= cost;
    state.inventory.medicines++;
    save(true); renderShop(); toast('已購買一份備用金瘡藥。','good'); tone('save');
  }

  function upgradeGear(key) {
    if (!GEARS[key]) return;
    const level = gearLevel(key);
    if (level >= 5) return toast('此行裝已升到最高 5 級。','good');
    const cost = GEAR_COSTS[level];
    if (state.silver < cost) return toast(`需要 ${cost} 銀兩才能升級。`,'warn');
    state.silver -= cost;
    state.inventory.gearLevels[key] = level + 1;
    save(true); renderShop(); toast(`${GEARS[key].name}已升至 ${level + 1} 級。`,'good'); tone('achievement');
  }

  function claimMedicine() {
    const run = state.current;
    if (!run || run.medicines >= 5) return toast('本回攜帶金瘡藥已達 5 份。','warn');
    if (state.inventory.medicines <= 0) return toast('商店備用金瘡藥不足。','warn');
    state.inventory.medicines--;
    run.medicines++;
    save(true); renderChapter(); toast('已從梁山倉庫領用一份金瘡藥。','good');
  }

  function difficultyPicker(run = state.current) {
    return `<div class="inline-actions">${Object.entries(DIFFICULTIES).map(([key,item]) => `<button class="btn small ${run?.difficulty === key ? 'primary' : ''}" data-difficulty="${key}" ${run?.battle ? 'disabled' : ''}>${item.name}</button>`).join('')}</div><p class="muted">${esc(DIFFICULTIES[run?.difficulty || prefs.difficulty].text)}</p>`;
  }

  function levelPips(level) { return `<div class="level-pips" aria-label="${level} 級">${[1,2,3,4,5].map(n=>`<i class="${n<=level?'on':''}"></i>`).join('')}</div>`; }

  function gearPicker(run = state.current) {
    return `<div class="grid three">${Object.entries(GEARS).map(([key,item]) => `<button class="card ${run?.gear === key ? 'current' : ''}" data-gear="${key}" ${run?.battle ? 'disabled' : ''} style="text-align:left;cursor:pointer"><h3>${item.icon} ${item.name}＋${gearLevel(key)}</h3>${levelPips(gearLevel(key))}<p>${gearText(key)}</p></button>`).join('')}</div>`;
  }

  function topbar(subtitle = '') {
    return `<header class="topbar"><div class="brand"><div class="brand-mark">水</div><div class="brand-text"><b>水滸英雄傳：梁山風雲</b><small>v${VERSION} ${EDITION}${subtitle ? `・${esc(subtitle)}` : ''}</small></div></div><div class="top-actions"><button class="btn icon" data-act="theme" title="切換顯示模式">◐</button><button class="btn icon" data-act="speech" title="朗讀本頁">🔊</button><button class="btn" data-act="manage">存檔</button></div></header>`;
  }

  function nav() {
    return `<nav class="nav" aria-label="遊戲導覽"><button class="btn small" data-act="home">首頁</button><button class="btn small" data-act="chapters">章回</button><button class="btn small" data-act="roster">英雄譜</button><button class="btn small" data-act="shop">商店</button>${state.current ? '<button class="btn small" data-act="continue">目前章回</button>' : ''}<span class="nav-spacer"></span><span class="tag accent">完成 ${completionCount()}/108</span><span class="tag">銀兩 ${Math.round(state.silver)}</span></nav>`;
  }

  function renderHome() {
    screen = 'home';
    const recommended = chapter(firstIncomplete());
    const complete = completionCount();
    const migrationClass = state.migration.imported.length || state.migration.v70 ? 'success' : 'warning';
    app.innerHTML = `${topbar()}${nav()}<section class="hero"><div class="eyebrow">v7.1.0・七項核心深度改造</div><h1>百八英雄<br>各展其能</h1><h2>章回不再誤重設，戰鬥、養成與首領機制全面深化</h2><p>每一回現在都有獨立暫存、英雄專屬戰法與同伴援護；查驗、軍略、戰鬥改為交錯推進。銀兩可用於商店補給與行裝升級，章回選單也新增未完成、非 S 級與最近遊玩篩選。</p><div class="actions"><button class="btn primary" data-act="start-recommended">${complete ? '前往下一未完成章回' : '開始第一回'}</button>${state.current && !state.current.complete ? '<button class="btn good" data-act="continue">繼續目前章回</button>' : ''}<button class="btn" data-act="chapters">開啟 108 回選單</button><button class="btn" data-act="shop">梁山商店</button><button class="btn" data-act="info">版本說明</button></div></section>
      <div class="grid four" style="margin-top:16px"><section class="card"><div class="metric"><div><span>完成章回</span><strong>${complete}</strong></div><b>/ 108</b></div><div class="progress" style="margin-top:12px"><i style="width:${pct(complete,108)}%"></i></div></section><section class="card"><div class="metric"><div><span>S 級章回</span><strong>${sCount()}</strong></div><b>回</b></div><p>未達 S 級的章回可在選單中一鍵篩選。</p></section><section class="card"><div class="metric"><div><span>備用藥品</span><strong>${state.inventory.medicines}</strong></div><b>份</b></div><p>可從商店購買，再於章回中領用。</p></section><section class="card"><div class="metric"><div><span>梁山銀兩</span><strong>${Math.round(state.silver)}</strong></div><b>兩</b></div><p>可升級護心鏡、軍略旗與公義印。</p></section></div>
      <div class="grid two" style="margin-top:16px"><section class="card current"><div class="portrait"><div class="avatar">${esc(recommended.name[0])}</div><div><span class="tag accent">推薦第 ${recommended.number} 回</span><h3>${esc(recommended.title)}</h3><p>${esc(recommended.nickname)}・${esc(recommended.name)}｜${esc(recommended.focus)}</p></div></div><div class="actions"><button class="btn primary" data-chapter="${recommended.number}">進入本回</button></div></section><section class="card ${migrationClass}"><h3>存檔安全升級</h3><p>${esc(state.migration.note)}</p><p class="muted">v7.0.0 舊存檔已先備份，進行中的每個章回都會獨立保存。</p></section></div>
      <div class="grid three" style="margin-top:16px"><section class="card"><h3>多章回暫存</h3><p>切換章回不會重設原進度，重新挑戰一定會先詢問。</p></section><section class="card"><h3>108 種專屬戰法</h3><p>每名英雄依角色定位獲得專屬名稱、被動與實際戰鬥效果。</p></section><section class="card"><h3>六種首領機制</h3><p>護甲、暴怒、回生、援軍、毒霧與反震，最終戰不再只是數值更高。</p></section></div>`;
  }

  function renderChapters() {
    screen = 'chapters';
    const terms = chapterSearch.trim().toLowerCase();
    let filtered = chapters.filter(ch => {
      const eraOk = chapterEra === 'all' || ch.era === chapterEra;
      const text = `${ch.number} ${ch.title} ${ch.name} ${ch.nickname} ${ch.focus}`.toLowerCase();
      const record = state.completed[String(ch.number)];
      const statusOk = chapterStatus === 'all' || (chapterStatus === 'incomplete' && !record) || (chapterStatus === 'nonS' && (!record || record.grade !== 'S')) || (chapterStatus === 'recent' && state.recent.includes(ch.number));
      return eraOk && statusOk && (!terms || text.includes(terms));
    });
    if (chapterStatus === 'recent') filtered.sort((a,b) => state.recent.indexOf(a.number) - state.recent.indexOf(b.number));
    const recommended = firstIncomplete();
    app.innerHTML = `${topbar('章回總覽')}${nav()}<section class="hero"><div class="eyebrow">安全選章・多進度暫存</div><h1>第一回至第一百零八回</h1><h2>點選章回只會開啟選擇，不會直接重設</h2><p>已有進度時可選擇繼續或重新挑戰；切換至其他章回時，原章回進度會完整保留。</p></section><div class="chapter-toolbar"><input id="chapterSearch" class="field" value="${esc(chapterSearch)}" placeholder="搜尋章回、英雄、綽號或主題"><select id="eraFilter" class="field"><option value="all" ${chapterEra==='all'?'selected':''}>全部篇章</option><option value="經典篇" ${chapterEra==='經典篇'?'selected':''}>經典篇 1～34</option><option value="制度續篇" ${chapterEra==='制度續篇'?'selected':''}>制度續篇 35～51</option><option value="百業聚義篇" ${chapterEra==='百業聚義篇'?'selected':''}>百業聚義篇 52～108</option></select><select id="statusFilter" class="field"><option value="all" ${chapterStatus==='all'?'selected':''}>全部狀態</option><option value="incomplete" ${chapterStatus==='incomplete'?'selected':''}>未完成</option><option value="nonS" ${chapterStatus==='nonS'?'selected':''}>非 S 級</option><option value="recent" ${chapterStatus==='recent'?'selected':''}>最近遊玩</option></select><button class="btn" data-act="clear-filter">清除</button></div><div class="filter-summary"><span class="tag">顯示 ${filtered.length} 回</span><span class="tag warn">進行中 ${Object.values(state.runs).filter(run=>run&&!run.complete).length} 回</span><span class="tag">最近記錄 ${state.recent.length} 回</span></div><div class="chapter-grid">${filtered.map(ch => {
      const record = state.completed[String(ch.number)];
      const draft = state.runs[String(ch.number)] && !state.runs[String(ch.number)].complete;
      const recentIndex = state.recent.indexOf(ch.number);
      return `<button class="card chapter-card ${record?'completed':''} ${ch.number===recommended?'recommended':''} ${draft?'draft-mark':''}" data-chapter="${ch.number}"><div class="chapter-no"><span>第 ${ch.number} 回</span><span class="chapter-icon">${ch.icon}</span></div><h3>${esc(ch.title)}</h3><p><b>${esc(ch.nickname)}・${esc(ch.name)}</b><br>${esc(ch.focus)}</p><span class="tag">${esc(ch.era)}</span>${record?`<span class="tag good">最佳 ${record.grade}・${record.score} 分</span>`:''}${recentIndex>=0?`<span class="recent-mark">最近第 ${recentIndex+1}</span>`:''}</button>`;
    }).join('')}</div>${filtered.length ? '' : '<div class="empty">找不到符合條件的章回。</div>'}`;
    const search = $('#chapterSearch');
    if (search) search.addEventListener('input', event => { chapterSearch = event.target.value; renderChapters(); requestAnimationFrame(() => { const input=$('#chapterSearch'); if(input){input.focus(); input.setSelectionRange(input.value.length,input.value.length);} }); });
    $('#eraFilter')?.addEventListener('change', event => { chapterEra = event.target.value; renderChapters(); });
    $('#statusFilter')?.addEventListener('change', event => { chapterStatus = event.target.value; renderChapters(); });
  }

  function flowItem(run, ch, step, position) {
    const done = stepDone(run, step);
    const current = currentStepIndex(run) === position;
    const clues = clueData(ch);
    const strategies = strategyData(ch);
    let title = '';
    let text = '';
    let button = '';
    let icon = position + 1;
    if (step.type === 'clue') {
      const item = clues[step.index]; title = `${step.phase}：${item.title}`; text = item.text; icon = item.icon;
      button = `<button class="btn ${current?'primary':''}" data-clue="${step.index}" ${!current||done?'disabled':''}>${done?'已完成':'進行查驗'}</button>`;
    }
    if (step.type === 'strategy') {
      const item = strategies[step.index]; title = `${step.phase}：${item.title}`; text = item.text; icon = `策${step.index+1}`;
      button = `<button class="btn ${current?'primary':''}" data-strategy="${step.index}" ${!current||done?'disabled':''}>${done?'已完成':'制定軍略'}</button>`;
    }
    if (step.type === 'battle') {
      const enemy = enemyFor(ch, step.index, run.difficulty, run.gear); title = `${step.phase}：${enemy.name}`; text = step.index===2 ? `最終首領機制：${enemy.mechanic.name}。${enemy.mechanic.text}` : enemy.intro; icon = ['⚔️','🛡️','👹'][step.index];
      button = `<button class="btn ${step.index===2?'danger':'primary'}" data-battle-start="${step.index}" ${!current||done?'disabled':''}>${done?'已勝利':'迎戰'}</button>`;
    }
    if (step.type === 'finish') {
      title = '立下本回安民約'; text = '結算 S／A／B／C 評級、成就、銀兩與英雄譜最佳紀錄。'; icon = '🏁';
      button = `<button class="btn good" data-act="finish" ${!current||done?'disabled':''}>${done?'已結算':'完成章回'}</button>`;
    }
    return `<article class="flow-step ${done?'done':current?'current':'locked'}"><div class="flow-index">${icon}</div><div><h3>${esc(title)}</h3><p>${esc(text)}</p></div>${button}</article>`;
  }

  function renderChapter() {
    screen = 'chapter';
    const run = state.current;
    if (!run) return renderHome();
    const ch = currentChapter();
    const record = state.completed[String(ch.number)];
    const hero = heroProfile(ch);
    const support = companionProfile(ch);
    const boss = bossProfile(ch);
    const step = currentStepIndex(run);
    app.innerHTML = `${topbar(`第 ${ch.number} 回`)}${nav()}<section class="hero"><div class="eyebrow">${esc(ch.era)}・${esc(kindData(ch).label)}</div><h1>${esc(ch.title)}</h1><h2>${esc(ch.nickname)}・${esc(ch.name)}　｜　同伴：${esc(ch.companionNickname)}・${esc(ch.companion)}</h2><p>${esc(chapterIntro(ch))}</p><div class="actions"><button class="btn" data-act="chapters">返回選章</button><button class="btn warn" data-act="restart-current">重新挑戰本回</button>${record?`<span class="tag good">最佳 ${record.grade}・${record.score} 分</span>`:''}</div></section>
      <div class="status-grid" style="margin-top:16px"><section class="card"><div class="portrait"><div class="avatar">${esc(ch.name[0])}</div><div><span class="tag accent">${esc(hero.role)}</span><h3>${esc(hero.name)}</h3><p>${esc(hero.description)}</p></div></div><div class="statline"><span>氣血</span><div class="bar"><i style="width:${pct(run.hero.hp,run.hero.maxHp)}%"></i></div><b>${run.hero.hp}/${run.hero.maxHp}</b></div><div class="statline"><span>豪氣</span><div class="bar sp"><i style="width:${pct(run.hero.sp,run.hero.maxSp)}%"></i></div><b>${run.hero.sp}/${run.hero.maxSp}</b></div><div class="inventory-line"><span class="tag">攻 ${run.hero.atk}</span><span class="tag">防 ${run.hero.def}</span><span class="tag">攜帶藥 ${run.medicines}</span><span class="tag">倉庫藥 ${state.inventory.medicines}</span><button class="btn small" data-act="claim-medicine" ${run.medicines>=5||state.inventory.medicines<=0?'disabled':''}>領用一份</button></div><div class="skill-panel"><div class="skill-card"><b>主角專屬戰法</b><small>${esc(hero.name)}：${esc(hero.description)}</small></div><div class="skill-card"><b>同伴專屬援護</b><small>${esc(support.name)}：${esc(support.text)}</small></div></div></section><section class="card"><h3>交錯故事進程</h3><p>目前第 ${step+1}/${FLOW.length} 步：<b>${esc(FLOW[step].phase)}</b></p><div class="progress"><i style="width:${pct(step,FLOW.length-1)}%"></i></div><p>查驗 ${run.clues.length}/4　軍略 ${run.strategies.length}/5　戰鬥 ${Object.values(run.battles).filter(Boolean).length}/3</p><p>行動 ${run.stats.actions} 次　戰敗 ${run.stats.defeats} 次　用藥 ${run.stats.medicinesUsed} 次</p><div class="boss-mechanic"><b>👹 本回首領：${esc(boss.name)}</b><p>${esc(boss.text)}</p></div></section></div>
      <div class="section-title"><div><h2>故事進程</h2><p>查驗、軍略與戰鬥交錯展開；一次只解鎖目前步驟。</p></div><b>${step}/${FLOW.length-1}</b></div><section class="flow-list">${FLOW.map((item,index)=>flowItem(run,ch,item,index)).join('')}</section>
      <div class="section-title"><div><h2>難度與行裝</h2><p>非戰鬥狀態可調整；升級效果由梁山商店提供。</p></div></div><div class="grid two"><section class="card"><h3>難度</h3>${difficultyPicker(run)}</section><section class="card"><h3>行裝</h3><p>${GEARS[run.gear].icon} ${GEARS[run.gear].name}＋${gearLevel(run.gear)}：${gearText(run.gear)}</p><div class="actions"><button class="btn" data-act="gear-modal">更換行裝</button><button class="btn" data-act="shop">前往升級</button></div></section></div>
      <section class="card" style="margin-top:18px"><h3>本回紀錄</h3><div class="log">${run.log.slice(0,14).map(item=>`<div>${esc(item)}</div>`).join('')}</div></section>`;
  }

  function renderBattle() {
    screen = 'battle';
    const run = state.current;
    if (!run?.battle) return renderChapter();
    const ch = currentChapter();
    const names = skillNames(ch);
    const battle = run.battle;
    const hero = run.hero;
    const enemy = battle.enemy;
    const systemCost = battle.gear === 'flag' ? flagCost() : (ch.kind === 'civic' ? 95 : 105);
    const profile = heroProfile(ch);
    const support = companionProfile(ch);
    app.innerHTML = `${topbar(`戰鬥・第 ${ch.number} 回`)}${nav()}<section class="battle-grid"><article class="fighter"><div class="fighter-head"><div class="portrait"><div class="avatar">${esc(ch.name[0])}</div><div><span class="tag accent">${esc(profile.role)}</span><h3>${esc(ch.name)}</h3><p>攻 ${hero.atk}・防 ${hero.def}</p></div></div><span class="tag">第 ${battle.turn} 合</span></div><div class="statline"><span>氣血</span><div class="bar"><i style="width:${pct(hero.hp,hero.maxHp)}%"></i></div><b>${hero.hp}/${hero.maxHp}</b></div><div class="statline"><span>豪氣</span><div class="bar sp"><i style="width:${pct(hero.sp,hero.maxSp)}%"></i></div><b>${hero.sp}/${hero.maxSp}</b></div><div>${hero.shield?`<span class="status-effect good">護盾 ${hero.shield}</span>`:''}${hero.tide?`<span class="status-effect good">潮勢 ${hero.tide}/3</span>`:''}</div><div class="battle-actions"><button class="btn" data-battle-action="attack">${esc(names.attack)}</button><button class="btn primary" data-battle-action="skill" ${hero.sp<60?'disabled':''}>${esc(names.skill)}（60）</button><button class="btn primary" data-battle-action="system" ${hero.sp<systemCost?'disabled':''}>${esc(names.system)}（${systemCost}）</button><button class="btn" data-battle-action="guard">守勢回氣</button><button class="btn good" data-battle-action="companion" ${battle.companionUsed?'disabled':''}>${esc(support.name)}</button><button class="btn" data-battle-action="medicine" ${run.medicines<=0?'disabled':''}>金瘡藥（${run.medicines}）</button></div><div class="battle-note">${DIFFICULTIES[battle.difficulty].name}難度・${GEARS[battle.gear].icon} ${GEARS[battle.gear].name}＋${gearLevel(battle.gear)}・勝利獎勵 ${enemy.reward}+${enemy.bonusSilver || 0} 銀兩・本場行動 ${battle.actions} 次</div></article><article class="fighter enemy"><div class="fighter-head"><div class="portrait"><div class="avatar">${enemy.icon}</div><div><span class="tag warn">${battle.stage===2?'首領':'敵方'}</span><h3>${esc(enemy.name)}</h3><p>攻 ${enemy.atk}・防 ${enemy.def}</p></div></div></div><div class="statline"><span>氣血</span><div class="bar"><i style="width:${pct(enemy.hp,enemy.maxHp)}%"></i></div><b>${enemy.hp}/${enemy.maxHp}</b></div>${enemy.shield?`<div class="statline"><span>護甲</span><div class="bar sp"><i style="width:${pct(enemy.shield,Math.round(enemy.maxHp*.28))}%"></i></div><b>${enemy.shield}</b></div>`:''}<p>${esc(enemy.intro)}</p>${enemy.mechanic?`<div class="boss-mechanic"><b>${esc(enemy.mechanic.name)}</b><p>${esc(enemy.mechanic.text)}</p></div>`:''}<div>${enemy.enraged?'<span class="status-effect">暴怒</span>':''}${enemy.stunned?'<span class="status-effect">封招</span>':''}</div></article></section><section class="card" style="margin-top:16px"><h3>戰況</h3><div class="log">${battle.log.map(item=>`<div>${esc(item)}</div>`).join('')}</div></section>`;
  }

  function gradeText(grade) { return ({S:'梁山典範',A:'安民善策',B:'穩健通關',C:'艱戰得勝'})[grade] || '章回完成'; }

  function renderEnding() {
    screen = 'ending';
    const run = state.current;
    if (!run?.complete) return renderChapter();
    const ch = currentChapter();
    const final = ch.number === 108;
    app.innerHTML = `${topbar(`第 ${ch.number} 回完成`)}${nav()}<section class="hero"><div class="eyebrow">${final?'一百零八回全篇大結局':'章回完成'}</div><div class="grade-badge"><span>${run.grade}</span><small>${run.score} 分</small></div><h1>${final?'一百零八英雄<br>百業同安':esc(ch.title)}</h1><h2>${esc(ch.nickname)}・${esc(ch.name)}正式列入第 ${ch.number} 席</h2><p>${final?'一百零八名英雄的專屬戰法、制度與救援經驗，最終彙成《梁山百業安民總約》。':`${ch.focus}已完成查驗、軍略與三場戰鬥的交錯推進。`}</p><p><b>${gradeText(run.grade)}</b>：行動 ${run.stats.actions} 次、戰敗 ${run.stats.defeats} 次、用藥 ${run.stats.medicinesUsed} 次，獲得 ${run.achievements.length}/4 項成就。</p><div class="actions"><button class="btn primary" data-act="replay">重演本回</button>${!final?`<button class="btn good" data-act="next">進入第 ${ch.number+1} 回</button>`:'<button class="btn good" data-act="chapters">查看全篇紀錄</button>'}<button class="btn" data-act="shop">使用銀兩升級</button><button class="btn" data-act="roster">英雄譜</button></div></section><div class="grid three" style="margin-top:16px"><section class="card"><h3>章回成果</h3><p>四項查驗 4/4<br>五階段軍略 5/5<br>三場戰鬥 3/3<br>本回銀兩 +${run.silverEarned}</p></section><section class="card"><h3>章回成就</h3>${['明察四證','三戰連捷','無藥制勝','獨當一面'].map(name=>`<div class="achievement ${run.achievements.includes(name)?'':'locked'}"><span class="medal">${run.achievements.includes(name)?'🏅':'🔒'}</span><div><b>${name}</b></div></div>`).join('')}</section><section class="card"><h3>${final?'全篇完成':'下一步'}</h3><p>${final?`目前已完成 ${completionCount()}/108 回，取得 ${sCount()} 個 S 級。`:`下一回由 ${ch.companionNickname}・${ch.companion} 接續主線。`}</p></section></div>`;
  }

  function renderRoster() {
    screen = 'roster';
    app.innerHTML = `${topbar('一百零八英雄譜')}${nav()}<section class="hero"><div class="eyebrow">專屬角色定位與戰法</div><h1>一百零八英雄譜</h1><h2>每名英雄都有獨立名稱、角色定位與實際戰鬥效果</h2><p>猛將、斷案、守將、疾行、水軍、醫護、軍師、巧匠、獵蹤與奇襲等定位，會直接改變技能、回氣、治療、護盾、暴擊或閃避表現。</p></section><div class="roster-grid" style="margin-top:16px">${chapters.map(ch => {
      const record=state.completed[String(ch.number)]; const profile=heroProfile(ch);
      return `<button class="card roster-card ${record?'success':''}" data-chapter="${ch.number}" style="text-align:left;cursor:pointer"><div class="portrait"><div class="avatar">${esc(ch.name[0])}</div><div><span class="tag">第 ${ch.number} 席・${esc(profile.role)}</span><h3>${esc(profile.name)}</h3><p>${record?`最佳 ${record.grade}・${record.score} 分`:profile.description}</p></div></div></button>`;
    }).join('')}</div>`;
  }

  function renderShop() {
    screen = 'shop';
    app.innerHTML = `${topbar('梁山銀兩商店')}${nav()}<section class="hero"><div class="eyebrow">銀兩有用・行裝可養成</div><h1>梁山商店</h1><h2>補給藥品，升級三件核心行裝</h2><p>行裝升級永久保存在 v7.1.0 存檔中，所有章回共用。每件行裝最高 5 級。</p><div class="actions"><span class="tag accent">目前銀兩 ${Math.round(state.silver)}</span><span class="tag">備用金瘡藥 ${state.inventory.medicines}</span></div></section><div class="shop-grid" style="margin-top:16px"><section class="card shop-card"><div class="shop-icon">🧴</div><h3>金瘡藥補給</h3><p>購入後存入梁山倉庫，可在章回中領用。每回最多攜帶 5 份。</p><p class="price">120 銀兩</p><button class="btn primary" data-shop="medicine" ${state.silver<120?'disabled':''}>購買一份</button></section>${Object.entries(GEARS).map(([key,item]) => {
      const level=gearLevel(key), max=level>=5, cost=max?0:GEAR_COSTS[level];
      return `<section class="card shop-card"><div class="shop-icon">${item.icon}</div><h3>${item.name}</h3><div class="shop-level">＋${level} 級</div>${levelPips(level)}<p>${gearText(key)}</p><p class="price">${max?'已達最高級':`${cost} 銀兩`}</p><button class="btn ${max?'good':'primary'}" data-shop="${key}" ${max||state.silver<cost?'disabled':''}>${max?'升級完成':`升至 ${level+1} 級`}</button></section>`;
    }).join('')}</div><section class="card" style="margin-top:16px"><h3>升級預覽</h3><p>護心鏡：每級增加守勢回血。軍略旗：每級降低制度絕技消耗。公義印：每級提高戰鬥銀兩倍率。</p></section>`;
  }

  function openModal(title, content) {
    modalRoot.innerHTML = `<div class="modal-backdrop" data-backdrop-close><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="modal-head"><div><h2>${esc(title)}</h2></div><button class="btn icon" data-modal="close" aria-label="關閉">×</button></header>${content}</section></div>`;
  }
  function closeModal() { modalRoot.innerHTML = ''; }

  function openGearModal() { openModal('選擇本回行裝', `${gearPicker(state.current)}<div class="actions" style="margin-top:14px"><button class="btn" data-modal="close">完成</button></div>`); }

  function openManage() {
    const data = JSON.stringify({type:'liangshan-v7-save',version:VERSION,exportedAt:new Date().toISOString(),state,prefs}, null, 2);
    openModal('存檔管理', `<p>存檔包含 108 回最佳紀錄、各章回暫存、商店升級、備用藥品與偏好設定。</p><textarea id="saveText" spellcheck="false">${esc(data)}</textarea><div class="actions"><button class="btn primary" data-modal="copy">複製</button><button class="btn" data-modal="download">下載 JSON</button><button class="btn" data-modal="import">匯入文字</button><button class="btn warn" data-modal="reset-current">重設目前章回</button><button class="btn danger" data-modal="reset-all">清除 v7 全部進度</button></div><p class="muted">清除 v7 進度不會刪除舊版存檔與遷移備份。</p>`);
  }

  function openInfo() {
    openModal(`v${VERSION} ${EDITION}`, `<h3>本版七項核心更新</h3><ol><li>多章回獨立暫存與重新挑戰確認。</li><li>銀兩商店、金瘡藥補給與三件行裝各 5 級升級。</li><li>108 名英雄專屬戰法與同伴援護。</li><li>六種最終首領機制。</li><li>查驗、軍略與戰鬥交錯推進。</li><li>未完成、非 S 級與最近遊玩篩選。</li><li>PWA 新版本提示、更新內容與立即更新。</li></ol><h3>存檔承接</h3><p>v7.0.0 存檔會先備份，再升級為可保存多個進行中章回的新格式。</p>`);
  }

  function openReleaseNotes() {
    openModal('v7.1.0 更新內容', `<h3>百八英雄深度玩法版</h3><p>本次更新加入多章回暫存、銀兩商店、裝備升級、專屬技能、六種首領機制、交錯故事流程、三種章回篩選及 PWA 更新提示。</p><p>更新前會保留現有本機存檔；Service Worker 更新完成後頁面會重新載入。</p><div class="actions"><button class="btn" data-modal="close">關閉</button></div>`);
  }

  function render() {
    document.body.dataset.theme = prefs.theme;
    if (screen === 'home') renderHome();
    else if (screen === 'chapters') renderChapters();
    else if (screen === 'chapter') renderChapter();
    else if (screen === 'battle') renderBattle();
    else if (screen === 'ending') renderEnding();
    else if (screen === 'roster') renderRoster();
    else if (screen === 'shop') renderShop();
  }

  function toast(message, type = '') {
    const node = document.createElement('div');
    node.className = `toast ${type}`;
    node.textContent = message;
    toastRoot.appendChild(node);
    setTimeout(() => node.remove(), 3200);
  }

  function tone(type) {
    if (!prefs.sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const freq = {hit:180,hurt:105,skill:410,guard:280,companion:520,save:340,battle:145,victory:600,achievement:760}[type] || 300;
      osc.frequency.value = freq;
      osc.type = type === 'hurt' ? 'sawtooth' : 'sine';
      gain.gain.setValueAtTime(.04, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .16);
      osc.connect(gain).connect(audioContext.destination);
      osc.start(); osc.stop(audioContext.currentTime + .17);
    } catch {}
  }

  function speakPage() {
    if (!('speechSynthesis' in window)) return toast('此瀏覽器不支援語音朗讀。','warn');
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); toast('已停止朗讀。'); return; }
    const text = [...app.querySelectorAll('h1,h2,h3,.hero p')].slice(0,14).map(node => node.textContent.trim()).join('。');
    const utter = new SpeechSynthesisUtterance(text); utter.lang = 'zh-TW'; utter.rate = .95; speechSynthesis.speak(utter); toast('開始朗讀本頁。','good');
  }

  function cycleTheme() {
    const order = ['ink','dark','paper'];
    prefs.theme = order[(order.indexOf(prefs.theme) + 1) % order.length];
    save(true); render(); toast(`已切換為 ${{ink:'水墨',dark:'深色',paper:'電子紙'}[prefs.theme]}模式。`);
  }

  function downloadText(filename, text, mime = 'application/json') {
    const blob = new Blob([text], {type:`${mime};charset=utf-8`});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function importSaveText(text) {
    const parsed = JSON.parse(text);
    const incomingState = parsed?.state || parsed;
    if (!incomingState || typeof incomingState !== 'object' || !incomingState.completed) throw new Error('invalid');
    storage.setItem(`${BACKUP_PREFIX}before-import`, JSON.stringify(state));
    state = mergeState(incomingState);
    if (parsed?.prefs) {
      prefs = {...freshPrefs(), ...parsed.prefs};
      if (!DIFFICULTIES[prefs.difficulty]) prefs.difficulty='standard';
      if (!GEARS[prefs.gear]) prefs.gear='mirror';
    }
    save(true);
  }

  function showUpdateAvailable(registration) {
    swRegistration = registration;
    updateRoot.innerHTML = `<aside class="update-banner"><div><b>發現新版遊戲</b><small>可先查看更新內容，再立即套用。現有進度會保留。</small></div><div class="actions"><button class="btn small" data-act="release-notes">更新內容</button><button class="btn small primary" data-act="apply-update">立即更新</button><button class="btn small" data-act="dismiss-update">稍後</button></div></aside>`;
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    navigator.serviceWorker.register('service-worker.js').then(registration => {
      swRegistration = registration;
      if (registration.waiting) showUpdateAvailable(registration);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdateAvailable(registration);
        });
      });
      registration.update().catch(()=>{});
    }).catch(()=>{});
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });
  }

  app.addEventListener('click', event => {
    const chapterButton = event.target.closest('[data-chapter]');
    if (chapterButton) { openChapterChoice(chapterButton.dataset.chapter); return; }
    const clueButton = event.target.closest('[data-clue]');
    if (clueButton) { collectClue(clueButton.dataset.clue); return; }
    const strategyButton = event.target.closest('[data-strategy]');
    if (strategyButton) { doStrategy(strategyButton.dataset.strategy); return; }
    const battleStart = event.target.closest('[data-battle-start]');
    if (battleStart) { startBattle(battleStart.dataset.battleStart); return; }
    const battleActionButton = event.target.closest('[data-battle-action]');
    if (battleActionButton) { battleAction(battleActionButton.dataset.battleAction); return; }
    const shopButton = event.target.closest('[data-shop]');
    if (shopButton) { shopButton.dataset.shop === 'medicine' ? buyMedicine() : upgradeGear(shopButton.dataset.shop); return; }
    const difficultyButton = event.target.closest('[data-difficulty]');
    if (difficultyButton && state.current && !state.current.battle) { state.current.difficulty = difficultyButton.dataset.difficulty; prefs.difficulty = difficultyButton.dataset.difficulty; save(true); renderChapter(); return; }
    const gearButton = event.target.closest('[data-gear]');
    if (gearButton && state.current && !state.current.battle) { state.current.gear = gearButton.dataset.gear; prefs.gear = gearButton.dataset.gear; save(true); renderChapter(); closeModal(); toast(`已裝備${GEARS[prefs.gear].name}＋${gearLevel(prefs.gear)}。`,'good'); return; }
    const actionButton = event.target.closest('[data-act]');
    if (!actionButton) return;
    const action = actionButton.dataset.act;
    if (action === 'home') { screen='home'; render(); }
    if (action === 'chapters') { if(actionButton.dataset.eraTarget)chapterEra=actionButton.dataset.eraTarget; screen='chapters'; render(); }
    if (action === 'roster') { screen='roster'; render(); }
    if (action === 'shop') { screen='shop'; render(); }
    if (action === 'continue') { if(state.current){screen=state.current.battle?'battle':state.current.complete?'ending':'chapter';render();} else openChapterChoice(firstIncomplete()); }
    if (action === 'start-recommended') openChapterChoice(firstIncomplete());
    if (action === 'clear-filter') { chapterSearch=''; chapterEra='all'; chapterStatus='all'; renderChapters(); }
    if (action === 'finish') finishChapter();
    if (action === 'next') startChapter(Math.min(108,currentChapter().number+1), false);
    if (action === 'replay' || action === 'restart-current') {
      const n=currentChapter().number;
      openModal('重新挑戰確認', `<p>確定重新開始第 ${n} 回嗎？目前本次進度會被重設，但最佳完成紀錄會保留。</p><div class="actions"><button class="btn danger" data-modal="chapter-restart" data-number="${n}">確定重新挑戰</button><button class="btn" data-modal="close">取消</button></div>`);
    }
    if (action === 'claim-medicine') claimMedicine();
    if (action === 'theme') cycleTheme();
    if (action === 'speech') speakPage();
    if (action === 'manage') openManage();
    if (action === 'info') openInfo();
    if (action === 'gear-modal') openGearModal();
    if (action === 'release-notes') openReleaseNotes();
    if (action === 'dismiss-update') updateRoot.innerHTML='';
    if (action === 'apply-update' && swRegistration?.waiting) { save(true); swRegistration.waiting.postMessage({type:'SKIP_WAITING'}); }
    if (action === 'install' && deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.finally(()=>deferredPrompt=null); }
  });

  modalRoot.addEventListener('click', event => {
    const backdrop = event.target.closest('[data-backdrop-close]');
    if (backdrop && event.target === backdrop) { closeModal(); return; }
    const button = event.target.closest('[data-modal]');
    if (!button) return;
    const action = button.dataset.modal;
    if (action === 'close') { closeModal(); return; }
    if (['chapter-resume','chapter-restart','chapter-switch'].includes(action)) {
      const number = Number(button.dataset.number);
      closeModal();
      startChapter(number, action === 'chapter-restart');
      return;
    }
    const textarea = $('#saveText');
    if (action === 'copy' && textarea) navigator.clipboard?.writeText(textarea.value).then(()=>toast('存檔已複製。','good')).catch(()=>{textarea.select();document.execCommand('copy');toast('存檔已複製。','good');});
    if (action === 'download' && textarea) downloadText(`水滸英雄傳_v${VERSION}_存檔_${new Date().toISOString().slice(0,10)}.json`, textarea.value);
    if (action === 'import' && textarea) {
      try { importSaveText(textarea.value); closeModal(); screen='home'; render(); toast('v7.1.0 存檔匯入成功。','good'); }
      catch { toast('存檔格式不正確，請確認內容。','warn'); }
    }
    if (action === 'reset-current' && state.current && confirm(`確定重設第 ${state.current.chapter} 回本次進度嗎？最佳完成紀錄會保留。`)) {
      const number=state.current.chapter; state.current=makeRun(number); state.runs[String(number)]=state.current; save(true); closeModal(); screen='chapter'; render(); toast('目前章回已重設。');
    }
    if (action === 'reset-all' && confirm('確定清除 v7 全部 108 回進度、商店升級與章回暫存嗎？舊版備份不會刪除。')) {
      storage.removeItem(SAVE_KEY); state=freshState(); migrateOldSaves(); closeModal(); screen='home'; render(); toast('v7 全部進度已重設。','warn');
    }
  });

  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); deferredPrompt = event; });

  migrateOldSaves();
  document.body.dataset.theme = prefs.theme;
  render();
  registerServiceWorker();

  window.__LIANGSHAN_TEST__ = {
    version:VERSION,
    chapters,
    flow:FLOW,
    getState:()=>clone(state),
    heroProfile:number=>clone(heroProfile(chapter(Number(number)))),
    companionProfile:number=>clone(companionProfile(chapter(Number(number)))),
    bossProfile:number=>clone(bossProfile(chapter(Number(number)))),
    start:(number,force=true)=>startChapter(number,force),
    currentStep:()=>state.current ? currentStepIndex(state.current) : -1,
    completeCurrentStep:()=>{
      const run=state.current; if(!run)return;
      const step=FLOW[currentStepIndex(run)];
      if(step.type==='clue')collectClue(step.index);
      else if(step.type==='strategy')doStrategy(step.index);
      else if(step.type==='battle'){run.battles[String(step.index)]=true;if(step.index===0)run.companion.unlocked=true;save(true);renderChapter();}
      else if(step.type==='finish')finishChapter();
    },
    autoComplete:number=>{
      startChapter(number,true);
      const run=state.current;
      run.clues=[0,1,2,3]; run.strategies=[0,1,2,3,4]; run.battles={0:true,1:true,2:true}; run.battle=null;
      finishChapter();
    },
    setSilver:value=>{state.silver=Math.max(0,Number(value)||0);save(true);render();},
    buy:key=>key==='medicine'?buyMedicine():upgradeGear(key),
    mergePreview:raw=>clone(mergeState(raw)),
    gearEffects:()=>({mirrorHeal:mirrorHeal(),flagCost:flagCost(),sealBonus:Math.round((sealMultiplier()-1)*100)}),
    prepareBoss:number=>{startChapter(number,true);const run=state.current;run.clues=[0,1,2,3];run.strategies=[0,1,2,3,4];run.battles={0:true,1:true,2:false};run.battle=null;save(true);renderChapter();},
    simulateUpdate:()=>showUpdateAvailable({waiting:{postMessage:()=>{}}}),
    reset:()=>{storage.removeItem(SAVE_KEY);state=freshState();state.migration.done=true;save(true);screen='home';render();}
  };
})();
