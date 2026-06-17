(() => {
  'use strict';

  const VERSION = '7.0.0';
  const SAVE_KEY = 'liangshan-rpg-complete-v7';
  const PREF_KEY = 'liangshan-rpg-complete-v7-prefs';
  const OLD_LEGACY_KEY = 'liangshan-rpg-save-v1';
  const OLD_SEQUEL_KEY = 'liangshan-rpg-sequel-v6';
  const OLD_BACKUP_PREFIX = 'liangshan-rpg-v7-migration-backup-';
  const chapters = Array.isArray(window.LIANGSHAN_CHAPTERS) ? window.LIANGSHAN_CHAPTERS : [];
  const app = document.querySelector('#app');
  const modalRoot = document.querySelector('#modalRoot');
  const toastRoot = document.querySelector('#toastRoot');
  const memoryStorage = new Map();
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
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
      const probe = '__liangshan_v70_probe__';
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
    story: {name:'故事', hp:.76, atk:.82, reward:.88, text:'敵方較弱，適合一路閱讀完整 108 回。'},
    standard: {name:'標準', hp:1, atk:1, reward:1, text:'攻守均衡，適合一般遊玩。'},
    heroic: {name:'豪傑', hp:1.22, atk:1.15, reward:1.38, text:'敵軍更強，勝利銀兩較多。'}
  };

  const GEARS = {
    mirror: {name:'護心鏡', icon:'🛡️', text:'守勢時額外回復 45 氣血。'},
    flag: {name:'軍略旗', icon:'🚩', text:'制度絕技豪氣消耗由 105 降為 85。'},
    seal: {name:'公義印', icon:'🪪', text:'每場戰鬥勝利銀兩增加 15%。'}
  };

  const KIND = {
    story: {
      label:'英雄故事', action:'破局',
      clue:['人物與動機','地勢與時機','百姓與財物','退路與救援'],
      strategy:['辨明局勢','分清敵我','護住無辜','截斷惡計','留出歸路'],
      enemy:['攔路惡徒','伏擊頭目','操局權豪']
    },
    justice: {
      label:'公義查案', action:'斷案',
      clue:['身分與案由','證據與程序','權利與告知','救濟與覆核'],
      strategy:['建立案冊','封存證物','公開程序','停止侵害','覆核救濟'],
      enemy:['阻案差役','毀證幫閒','枉法豪強']
    },
    military: {
      label:'軍陣守備', action:'定陣',
      clue:['編制與軍令','器械與地形','辨識與通訊','撤退與救護'],
      strategy:['編定隊伍','丈量險要','統一號令','設立停戰線','整備救護隊'],
      enemy:['亂令先鋒','奪械戰隊','擾民軍頭']
    },
    transport: {
      label:'道路運輸', action:'護行',
      clue:['路線與班次','載具與限量','票價與保管','事故與替代'],
      strategy:['登記路線','標明限量','公開費用','設置停運線','安排替代運送'],
      enemy:['攔路腳夫','黑價車幫','霸運總頭']
    },
    water: {
      label:'水路安航', action:'分浪',
      clue:['名冊與水情','船具與載重','訊號與停航','救援與安置'],
      strategy:['建立水冊','標出水線','統一旗號','風浪停航','水陸聯援'],
      enemy:['封渡水手','超載船幫','劫江水寨']
    },
    health: {
      label:'醫護安生', action:'濟傷',
      clue:['來源與症狀','分級與隔離','用藥與紀錄','轉送與追蹤'],
      strategy:['建立名冊','分級處置','公開用法','停止危害','轉送追蹤'],
      enemy:['阻醫惡徒','假藥牙行','害命黑主']
    },
    civic: {
      label:'百業共治', action:'安民',
      clue:['名冊與責任','標準與流程','公開與申訴','通報與改善'],
      strategy:['建冊定責','畫線分區','公開規則','停用警戒','救濟改善'],
      enemy:['攔辦幫閒','偽冊牙人','把持豪強']
    },
    trade: {
      label:'交易百工', action:'驗真',
      clue:['資格與來源','規格與價格','交付與憑證','退換與補償'],
      strategy:['查明來源','統一規格','明示價格','停止危品','退換補償'],
      enemy:['欺市伙計','造假行幫','壟斷東家']
    },
    wild: {
      label:'山林百獸', action:'巡界',
      clue:['範圍與季節','足跡與風險','禁限與告示','救援與復育'],
      strategy:['畫定範圍','記錄足跡','公示禁限','封閉險區','救援復育'],
      enemy:['越界獵手','設陷山幫','霸山頭領']
    },
    stealth: {
      label:'潛行偵查', action:'探險',
      clue:['身分與暗號','路線與時機','目標與證據','撤離與接應'],
      strategy:['核對暗號','標出密路','留存證據','切斷追兵','安排接應'],
      enemy:['巡哨耳目','暗路伏兵','密寨首領']
    }
  };

  const freshState = () => ({
    version: VERSION,
    updatedAt: new Date().toISOString(),
    silver: 500,
    selected: 1,
    unlocked: 1,
    completed: {},
    current: null,
    migration: {done:false, legacy:false, sequel:false, imported:[], note:'尚未檢查舊存檔。'}
  });

  const freshPrefs = () => ({theme:'ink', difficulty:'standard', gear:'mirror', sound:true, speech:false});

  let prefs = loadPrefs();
  let state = loadState();
  let screen = 'home';
  let chapterSearch = '';
  let chapterEra = 'all';
  let deferredPrompt = null;
  let audioContext = null;
  let battleBusy = false;

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

  function mergeState(raw) {
    const base = freshState();
    const merged = {...base, ...raw};
    merged.version = VERSION;
    merged.completed = raw?.completed && typeof raw.completed === 'object' ? raw.completed : {};
    merged.migration = {...base.migration, ...(raw?.migration || {})};
    merged.selected = clamp(Number(raw?.selected) || 1, 1, 108);
    merged.unlocked = clamp(Number(raw?.unlocked) || 1, 1, 108);
    if (raw?.current?.chapter) merged.current = normalizeRun(raw.current);
    return merged;
  }

  function loadState() {
    try {
      const raw = JSON.parse(storage.getItem(SAVE_KEY) || 'null');
      if (raw && raw.version) return mergeState(raw);
    } catch {}
    return freshState();
  }

  function save(silent = true) {
    state.updatedAt = new Date().toISOString();
    state.version = VERSION;
    storage.setItem(SAVE_KEY, JSON.stringify(state));
    storage.setItem(PREF_KEY, JSON.stringify(prefs));
    if (!silent) { toast('完整章回進度已收入本機存檔。', 'good'); tone('save'); }
  }

  function markImported(number, grade = 'A', score = 82, source = '舊版承接') {
    const key = String(number);
    if (!state.completed[key] || Number(state.completed[key].score || 0) < score) {
      state.completed[key] = {
        grade, score, actions:0, defeats:0, medicinesUsed:0,
        achievements:['舊版完成紀錄'], completedAt:new Date().toISOString(), source
      };
    }
    if (!state.migration.imported.includes(number)) state.migration.imported.push(number);
    state.unlocked = Math.max(state.unlocked, Math.min(108, number + 1));
  }

  function migrateOldSaves() {
    if (state.migration.done) return;
    const notes = [];
    try {
      const legacyRaw = storage.getItem(OLD_LEGACY_KEY);
      if (legacyRaw) {
        storage.setItem(`${OLD_BACKUP_PREFIX}legacy`, legacyRaw);
        const legacy = JSON.parse(legacyRaw);
        let count = 0;
        for (let n = 1; n <= 34; n++) {
          if (legacy?.flags?.[`chapter${n}Complete`]) { markImported(n, 'A', 84, 'v4.5.0 經典篇'); count++; }
        }
        if (count) {
          state.migration.legacy = true;
          notes.push(`承接經典篇 ${count} 回`);
          state.silver += Math.min(500, Math.max(0, Number(legacy?.silver || legacy?.inventory?.silver || 0) * .1));
        }
      }
    } catch (error) { notes.push('經典篇存檔格式無法承接'); }

    try {
      const sequelRaw = storage.getItem(OLD_SEQUEL_KEY);
      if (sequelRaw) {
        storage.setItem(`${OLD_BACKUP_PREFIX}v6.2.0`, sequelRaw);
        const old = JSON.parse(sequelRaw);
        let count = 0;
        if (old?.complete && (old?.version === '6.2.0' || old?.hero?.name === '李俊')) {
          for (let n = 35; n <= 51; n++) {
            const grade = n === 51 && old.grade ? old.grade : 'A';
            const score = n === 51 && old.score ? Number(old.score) : 84;
            markImported(n, grade, score, 'v6.2.0 續篇'); count++;
          }
        } else {
          if (old?.previous?.chapter49Complete) { markImported(49, 'A', 84, 'v6 前回'); count++; }
          if (old?.previous?.chapter50Complete) { markImported(50, 'A', 84, 'v6.1.0'); count++; }
          if (old?.complete) { markImported(51, old.grade || 'A', Number(old.score || 84), 'v6.2.0'); count++; }
        }
        if (count) {
          state.migration.sequel = true;
          notes.push(`承接制度續篇 ${count} 回`);
          state.silver += Math.min(500, Math.floor(Number(old?.silver || 0) * .25));
        }
      }
    } catch (error) { notes.push('續篇存檔格式無法承接'); }

    state.silver = Math.round(state.silver);
    state.migration.done = true;
    state.migration.imported.sort((a,b) => a-b);
    state.migration.note = notes.length ? notes.join('；') : '未發現可承接的舊存檔，已建立全新完整章回進度。';
    state.selected = firstIncomplete();
    save(true);
  }

  function normalizeRun(raw) {
    const chapter = clamp(Number(raw.chapter) || 1, 1, 108);
    const base = makeRun(chapter);
    const merged = {
      ...base, ...raw,
      hero:{...base.hero, ...(raw.hero || {})},
      companion:{...base.companion, ...(raw.companion || {})},
      stats:{...base.stats, ...(raw.stats || {})},
      battles:{...base.battles, ...(raw.battles || {})}
    };
    merged.clues = Array.isArray(raw.clues) ? raw.clues.filter(x => [0,1,2,3].includes(Number(x))).map(Number) : [];
    merged.strategies = Array.isArray(raw.strategies) ? raw.strategies.filter(x => [0,1,2,3,4].includes(Number(x))).map(Number) : [];
    merged.medicines = clamp(Number(raw.medicines) || 0, 0, 9);
    merged.gear = GEARS[raw.gear] ? raw.gear : prefs.gear;
    merged.difficulty = DIFFICULTIES[raw.difficulty] ? raw.difficulty : prefs.difficulty;
    return merged;
  }

  function firstIncomplete() {
    for (let n = 1; n <= 108; n++) if (!state.completed[String(n)]) return n;
    return 108;
  }

  function chapter(number) { return chapters[number - 1]; }
  function currentChapter() { return state.current ? chapter(state.current.chapter) : chapter(state.selected); }
  function kindData(ch) { return KIND[ch.kind] || KIND.civic; }
  function completionCount() { return Object.keys(state.completed).filter(k => state.completed[k]).length; }
  function sCount() { return Object.values(state.completed).filter(item => item?.grade === 'S').length; }
  function totalScore() { return Object.values(state.completed).reduce((sum, item) => sum + Number(item?.score || 0), 0); }
  function pct(value, max) { return clamp(Math.round((value / Math.max(1, max)) * 100), 0, 100); }

  function heroStats(number) {
    return {
      maxHp: 880 + number * 8,
      maxSp: 600 + number * 4,
      atk: 91 + Math.round(number * .9),
      def: 47 + Math.round(number * .46)
    };
  }

  function makeRun(number) {
    const ch = chapter(number);
    const stats = heroStats(number);
    return {
      chapter:number,
      startedAt:new Date().toISOString(),
      clues:[], strategies:[], battles:{0:false,1:false,2:false},
      hero:{hp:stats.maxHp,maxHp:stats.maxHp,sp:stats.maxSp,maxSp:stats.maxSp,atk:stats.atk,def:stats.def,guarding:false},
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

  function startChapter(number, forceNew = false) {
    const n = clamp(Number(number), 1, 108);
    state.selected = n;
    if (forceNew || !state.current || state.current.chapter !== n || state.current.complete) state.current = makeRun(n);
    screen = 'chapter';
    save(true);
    render();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function clueData(ch) {
    const data = kindData(ch);
    return data.clue.map((title, index) => ({
      title,
      icon:['📋','📏','📢','🆘'][index],
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
      story:`${ch.nickname}${ch.name}奉命走入事件核心。這一回以「${ch.focus}」為主線，不只要擊敗眼前強敵，也要辨清人物動機、保住無辜百姓，讓勝利留下可長久遵循的規矩。`,
      justice:`${ch.nickname}${ch.name}接下梁山公議堂的木牌，查辦「${ch.focus}」。案情若只靠威勢處理，冤屈仍會重演；必須把證據、程序、告知與救濟一一寫清。`,
      military:`${ch.nickname}${ch.name}整點人馬，面對「${ch.focus}」。本回強調軍令、器械、通訊與撤退救護，取勝同時不得擾民、棄傷或亂用兵械。`,
      transport:`${ch.nickname}${ch.name}巡查「${ch.focus}」。道路、驛站與載具一旦被豪強壟斷，旅人便無路可走；本回要建立可查、可停、可替代的安全運送制度。`,
      water:`${ch.nickname}${ch.name}領水軍查驗「${ch.focus}」。水勢無常，更不能讓黑船、超載與假旗號趁險取利；本回須同時整治船冊、水線、停航與救援。`,
      health:`${ch.nickname}${ch.name}協同醫棚處理「${ch.focus}」。辨明來源、分級處置、用藥留錄與轉送追蹤缺一不可，不能讓假藥與延誤再奪人性命。`,
      civic:`${ch.nickname}${ch.name}主持「${ch.focus}」的制度整頓。梁山不只要有英雄，也要有人人看得懂、查得到、能申訴、可改善的日常規則。`,
      trade:`${ch.nickname}${ch.name}走入市集與作坊，查驗「${ch.focus}」。來源、規格、價格、憑證與補償必須相互對得上，才能讓百業公平運轉。`,
      wild:`${ch.nickname}${ch.name}深入山林，處理「${ch.focus}」。山川百獸不是任人掠取之物，必須劃界、巡查、救援並留下復育空間。`,
      stealth:`${ch.nickname}${ch.name}改裝潛行，暗查「${ch.focus}」。暗號、路線、證據與接應若有一環出錯，便會牽連無辜；本回要以巧取勝，不以濫殺收場。`
    };
    return intros[ch.kind] || intros.civic;
  }

  function skillNames(ch) {
    const data = kindData(ch);
    const second = ch.title.includes('・') ? ch.title.split('・')[1] : `${data.label}安定`;
    return {
      attack:`${ch.nickname}進擊`,
      skill:`${ch.nickname}${data.action}`,
      system:second,
      companion:`${ch.companionNickname}・${ch.companion}援護`
    };
  }

  function enemyFor(ch, stage, difficultyKey, gearKey) {
    const data = kindData(ch);
    const difficulty = DIFFICULTIES[difficultyKey] || DIFFICULTIES.standard;
    const scale = 1 + (ch.number - 1) * .0105;
    const baseHp = [500,710,970][stage];
    const baseAtk = [49,59,70][stage] + ch.number * .15;
    const baseDef = [15,22,30][stage] + ch.number * .09;
    const baseReward = [58,92,148][stage] + ch.number * 2.2;
    const rewardGear = gearKey === 'seal' ? 1.15 : 1;
    const name = stage === 2 ? `${data.enemy[stage]}・${ch.focus}黑主` : `${data.enemy[stage]}・${ch.focus}`;
    return {
      name,
      icon:[ch.icon,'⚠️','👹'][stage],
      maxHp:Math.round(baseHp * scale * difficulty.hp),
      hp:Math.round(baseHp * scale * difficulty.hp),
      atk:Math.round(baseAtk * scale * difficulty.atk),
      def:Math.round(baseDef * (1 + (ch.number - 1) * .003)),
      reward:Math.round(baseReward * difficulty.reward * rewardGear),
      intro:[
        `第一道阻力封住現場，拒絕交出名冊與查驗紀錄。`,
        `第二股勢力偽造規則、藏匿缺失，企圖讓整頓半途而廢。`,
        `幕後黑主操控「${ch.focus}」，準備毀去全部證據與救援線。`
      ][stage]
    };
  }

  function startBattle(stage) {
    const run = state.current;
    if (!run || run.battle) return;
    const ch = currentChapter();
    const s = Number(stage);
    if (run.clues.length < 4 || run.strategies.length < 5) return toast('先完成四項查驗與五階段軍略。','warn');
    if (s > 0 && !run.battles[String(s - 1)]) return toast('必須依序完成前一場戰鬥。','warn');
    if (run.battles[String(s)]) return toast('這一場已經勝利。','good');
    run.hero.hp = run.hero.maxHp;
    run.hero.sp = run.hero.maxSp;
    run.hero.guarding = false;
    run.battle = {
      stage:s,
      turn:1,
      actions:0,
      companionUsed:false,
      difficulty:run.difficulty,
      gear:run.gear,
      enemy:enemyFor(ch, s, run.difficulty, run.gear),
      log:[`迎戰：${enemyFor(ch, s, run.difficulty, run.gear).name}`]
    };
    screen = 'battle';
    save(true);
    render();
    tone('battle');
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
    const systemCost = battle.gear === 'flag' ? 85 : 105;
    let damage = 0;
    let acted = false;
    hero.guarding = false;

    if (action === 'attack') {
      acted = true;
      damage = Math.max(24, hero.atk + rand(-12, 21) - Math.round(enemy.def * .55));
      enemy.hp -= damage;
      battle.log.unshift(`${ch.name}施展「${names.attack}」，造成 ${damage} 點傷害。`);
      tone('hit');
    }
    if (action === 'skill' && hero.sp >= 60) {
      acted = true;
      hero.sp -= 60;
      damage = Math.max(60, Math.round(hero.atk * 1.72) + rand(10, 34) - Math.round(enemy.def * .42));
      enemy.hp -= damage;
      enemy.atk = Math.max(22, enemy.atk - 5);
      battle.log.unshift(`「${names.skill}」造成 ${damage} 點傷害，並削弱敵方攻勢。`);
      tone('skill');
    }
    if (action === 'system' && hero.sp >= systemCost) {
      acted = true;
      hero.sp -= systemCost;
      damage = Math.max(95, Math.round(hero.atk * 2.18) + rand(20, 48) - Math.round(enemy.def * .3));
      enemy.hp -= damage;
      hero.hp = clamp(hero.hp + 58, 0, hero.maxHp);
      battle.log.unshift(`制度絕技「${names.system}」造成 ${damage} 點傷害，並回復 58 氣血。`);
      tone('skill');
    }
    if (action === 'guard') {
      acted = true;
      hero.guarding = true;
      hero.sp = clamp(hero.sp + 44, 0, hero.maxSp);
      const heal = battle.gear === 'mirror' ? 45 : 0;
      hero.hp = clamp(hero.hp + heal, 0, hero.maxHp);
      battle.log.unshift(`${ch.name}守住百姓與證冊，回復 44 豪氣${heal ? `、${heal} 氣血` : ''}。`);
      tone('guard');
    }
    if (action === 'companion' && !battle.companionUsed) {
      acted = true;
      battle.companionUsed = true;
      damage = Math.max(120, Math.round(hero.atk * 1.55) + rand(22, 52) - Math.round(enemy.def * .25));
      enemy.hp -= damage;
      enemy.def = Math.max(8, enemy.def - 10);
      hero.hp = clamp(hero.hp + 35, 0, hero.maxHp);
      if (battle.stage === 2) run.stats.bossCompanionUsed = true;
      battle.log.unshift(`${ch.companion}施展「${names.companion}」，造成 ${damage} 點傷害並降低敵方防禦。`);
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

    battle.actions++;
    run.stats.actions++;
    enemy.hp = Math.max(0, enemy.hp);
    if (enemy.hp <= 0) {
      battleVictory();
      battleBusy = false;
      return;
    }

    const raw = Math.max(18, enemy.atk + rand(-8, 17) - Math.round(hero.def * .42));
    const taken = hero.guarding ? Math.round(raw * .38) : raw;
    hero.hp = Math.max(0, hero.hp - taken);
    battle.log.unshift(`${enemy.name}反擊，${ch.name}受到 ${taken} 點傷害。`);
    battle.turn++;
    hero.guarding = false;
    tone('hurt');

    if (hero.hp <= 0) {
      run.stats.defeats++;
      run.hero.hp = Math.round(run.hero.maxHp * .72);
      run.hero.sp = Math.round(run.hero.maxSp * .72);
      run.battle = null;
      screen = 'chapter';
      save(true);
      toast('本場失利，已退回戰前整補，可再次挑戰。','warn');
      battleBusy = false;
      render();
      return;
    }
    save(true);
    renderBattle();
    battleBusy = false;
  }

  function battleVictory() {
    const run = state.current;
    const battle = run.battle;
    const stage = battle.stage;
    run.battles[String(stage)] = true;
    run.silverEarned += battle.enemy.reward;
    state.silver += battle.enemy.reward;
    run.medicines = Math.min(3, run.medicines + 1);
    run.hero.hp = run.hero.maxHp;
    run.hero.sp = run.hero.maxSp;
    run.log.unshift(`第 ${stage + 1} 場勝利，獲得 ${battle.enemy.reward} 銀兩。`);
    if (stage === 0) run.companion.unlocked = true;
    run.battle = null;
    screen = 'chapter';
    save(true);
    toast(`戰鬥勝利，獲得 ${battle.enemy.reward} 銀兩。`, 'good');
    tone('victory');
    render();
  }

  function collectClue(index) {
    const run = state.current;
    const i = Number(index);
    if (!run || run.clues.includes(i)) return;
    run.clues.push(i);
    run.clues.sort();
    run.hero.sp = clamp(run.hero.sp + 25, 0, run.hero.maxSp);
    run.log.unshift(`查驗完成：${clueData(currentChapter())[i].title}。`);
    save(true);
    renderChapter();
    tone('save');
  }

  function doStrategy(index) {
    const run = state.current;
    const i = Number(index);
    if (!run || run.clues.length < 4 || run.strategies.includes(i) || i !== run.strategies.length) return;
    run.strategies.push(i);
    run.hero.hp = clamp(run.hero.hp + 40, 0, run.hero.maxHp);
    run.hero.sp = clamp(run.hero.sp + 50, 0, run.hero.maxSp);
    run.log.unshift(`軍略完成：${strategyData(currentChapter())[i].title}。`);
    save(true);
    renderChapter();
    tone('skill');
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
    if (!run || !run.battles['2']) return;
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
    const record = {
      grade:result.grade,
      score:result.score,
      actions:run.stats.actions,
      defeats:run.stats.defeats,
      medicinesUsed:run.stats.medicinesUsed,
      achievements:result.achievements,
      completedAt:new Date().toISOString(),
      source:'v7.0.0 完整章回版'
    };
    if (!previous || Number(previous.score || 0) <= result.score) state.completed[String(ch.number)] = record;
    state.unlocked = Math.max(state.unlocked, Math.min(108, ch.number + 1));
    state.selected = Math.min(108, ch.number + 1);
    run.log.unshift(`第 ${ch.number} 回完成，評級 ${result.grade}、${result.score} 分。`);
    screen = 'ending';
    save(true);
    render();
    tone('achievement');
  }

  function difficultyPicker(run = state.current) {
    return `<div class="inline-actions">${Object.entries(DIFFICULTIES).map(([key,item]) => `<button class="btn small ${run?.difficulty === key ? 'primary' : ''}" data-difficulty="${key}" ${run?.battle ? 'disabled' : ''}>${item.name}</button>`).join('')}</div><p class="muted">${esc(DIFFICULTIES[run?.difficulty || prefs.difficulty].text)}</p>`;
  }

  function gearPicker(run = state.current) {
    return `<div class="grid three">${Object.entries(GEARS).map(([key,item]) => `<button class="card ${run?.gear === key ? 'current' : ''}" data-gear="${key}" ${run?.battle ? 'disabled' : ''} style="text-align:left;cursor:pointer"><h3>${item.icon} ${item.name}</h3><p>${item.text}</p></button>`).join('')}</div>`;
  }

  function topbar(subtitle = '') {
    return `<header class="topbar"><div class="brand"><div class="brand-mark">水</div><div class="brand-text"><b>水滸英雄傳：梁山風雲</b><small>v${VERSION} 完整章回版${subtitle ? `・${esc(subtitle)}` : ''}</small></div></div><div class="top-actions"><button class="btn icon" data-act="theme" title="切換顯示模式">◐</button><button class="btn icon" data-act="speech" title="朗讀本頁">🔊</button><button class="btn" data-act="manage"><span>存檔</span></button></div></header>`;
  }

  function nav() {
    return `<nav class="nav" aria-label="遊戲導覽"><button class="btn small" data-act="home">首頁</button><button class="btn small" data-act="chapters">章回</button><button class="btn small" data-act="roster">英雄譜</button>${state.current ? '<button class="btn small" data-act="continue">目前章回</button>' : ''}<span class="nav-spacer"></span><span class="tag accent">完成 ${completionCount()}/108</span><span class="tag">銀兩 ${Math.round(state.silver)}</span></nav>`;
  }

  function renderHome() {
    screen = 'home';
    const recommended = chapter(firstIncomplete());
    const complete = completionCount();
    const migrationClass = state.migration.imported.length ? 'success' : 'warning';
    app.innerHTML = `${topbar()}${nav()}<section class="hero"><div class="eyebrow">第一回至第一百零八回・完整可遊玩</div><h1>一百零八英雄<br>一次聚義</h1><h2>從景陽岡打虎，一路完成百業安民與金毛犬護馬</h2><p>本版把全部 108 回整合到同一套章回選單與存檔。每回都有專屬主角、同伴、四項查驗、五階段軍略、三場戰鬥、四項成就及 S／A／B／C 評級，可依序遊玩，也可自由選章重演。</p><div class="actions"><button class="btn primary" data-act="start-recommended">${complete ? '前往下一未完成章回' : '開始第一回'}</button>${state.current && !state.current.complete ? '<button class="btn good" data-act="continue">繼續目前章回</button>' : ''}<button class="btn" data-act="chapters">開啟 108 回選單</button><button class="btn" data-act="info">版本說明</button></div></section>
      <div class="grid four" style="margin-top:16px"><section class="card"><div class="metric"><div><span>完成章回</span><strong>${complete}</strong></div><b>/ 108</b></div><div class="progress" style="margin-top:12px"><i style="width:${pct(complete,108)}%"></i></div></section><section class="card"><div class="metric"><div><span>S 級章回</span><strong>${sCount()}</strong></div><b>回</b></div><p>低行動、零戰敗、少用藥可提高評級。</p></section><section class="card"><div class="metric"><div><span>累積評分</span><strong>${totalScore()}</strong></div><b>分</b></div><p>重演章回取得更高分時會保留最佳紀錄。</p></section><section class="card"><div class="metric"><div><span>梁山銀兩</span><strong>${Math.round(state.silver)}</strong></div><b>兩</b></div><p>豪傑難度與公義印可提高戰鬥獎勵。</p></section></div>
      <div class="grid two" style="margin-top:16px"><section class="card current"><div class="portrait"><div class="avatar">${esc(recommended.name[0])}</div><div><span class="tag accent">推薦第 ${recommended.number} 回</span><h3>${esc(recommended.title)}</h3><p>${esc(recommended.nickname)}・${esc(recommended.name)}｜${esc(recommended.focus)}</p></div></div><div class="actions"><button class="btn primary" data-chapter="${recommended.number}">進入本回</button></div></section><section class="card ${migrationClass}"><h3>舊存檔安全承接</h3><p>${esc(state.migration.note)}</p><p class="muted">舊資料會先備份到 <span class="code">${OLD_BACKUP_PREFIX}*</span>，不會覆寫 v4.5.0 或 v6.2.0 原存檔。</p></section></div>
      <div class="grid three" style="margin-top:16px"><section class="card"><h3>經典篇 1～34 回</h3><p>保留原有故事主線，再以統一引擎提供快速重演。壓縮檔內仍附原版 v4.5.0。</p><a class="btn" href="previous-v6.2.0/legacy-v4.5.0/index.html">開啟原版經典篇</a></section><section class="card"><h3>制度續篇 35～51 回</h3><p>由百田安灌延伸至百渡安航，全部納入同一選章、英雄譜與評級紀錄。</p><a class="btn" href="previous-v6.2.0/index.html">開啟原版 v6.2.0</a></section><section class="card"><h3>百業聚義篇 52～108 回</h3><p>一次補完童威至段景住共 57 回，最後由智多星吳用總結梁山百業安民約。</p><button class="btn" data-act="chapters" data-era-target="百業聚義篇">查看後 57 回</button></section></div>`;
  }

  function renderChapters() {
    screen = 'chapters';
    const terms = chapterSearch.trim().toLowerCase();
    const filtered = chapters.filter(ch => {
      const eraOk = chapterEra === 'all' || ch.era === chapterEra;
      const text = `${ch.number} ${ch.title} ${ch.name} ${ch.nickname} ${ch.focus}`.toLowerCase();
      return eraOk && (!terms || text.includes(terms));
    });
    const recommended = firstIncomplete();
    app.innerHTML = `${topbar('章回總覽')}${nav()}<section class="hero"><div class="eyebrow">完整章回選單</div><h1>第一回至第一百零八回</h1><h2>可依序推進，也可直接選擇任何章回重演</h2><p>所有章回都已建立完整遊玩流程。完成紀錄、最佳評級與成就會集中保存在 v7.0.0 存檔中。</p></section><div class="chapter-toolbar"><input id="chapterSearch" class="field" value="${esc(chapterSearch)}" placeholder="搜尋章回、英雄、綽號或主題"><select id="eraFilter" class="field"><option value="all" ${chapterEra==='all'?'selected':''}>全部篇章</option><option value="經典篇" ${chapterEra==='經典篇'?'selected':''}>經典篇 1～34</option><option value="制度續篇" ${chapterEra==='制度續篇'?'selected':''}>制度續篇 35～51</option><option value="百業聚義篇" ${chapterEra==='百業聚義篇'?'selected':''}>百業聚義篇 52～108</option></select><button class="btn" data-act="clear-filter">清除</button></div><div class="chapter-grid">${filtered.map(ch => {
      const record = state.completed[String(ch.number)];
      return `<button class="card chapter-card ${record?'completed':''} ${ch.number===recommended?'recommended':''}" data-chapter="${ch.number}"><div class="chapter-no"><span>第 ${ch.number} 回</span><span class="chapter-icon">${ch.icon}</span></div><h3>${esc(ch.title)}</h3><p><b>${esc(ch.nickname)}・${esc(ch.name)}</b><br>${esc(ch.focus)}</p><span class="tag">${esc(ch.era)}</span>${record?`<span class="tag good">最佳 ${record.grade}・${record.score} 分</span>`:''}</button>`;
    }).join('')}</div>${filtered.length ? '' : '<div class="empty">找不到符合條件的章回。</div>'}`;
    const search = $('#chapterSearch');
    if (search) search.addEventListener('input', event => { chapterSearch = event.target.value; renderChapters(); requestAnimationFrame(() => { const input=$('#chapterSearch'); if(input){input.focus(); input.setSelectionRange(input.value.length,input.value.length);} }); });
    const era = $('#eraFilter');
    if (era) era.addEventListener('change', event => { chapterEra = event.target.value; renderChapters(); });
  }

  function renderChapter() {
    screen = 'chapter';
    const run = state.current;
    if (!run) return renderHome();
    const ch = currentChapter();
    const clues = clueData(ch);
    const strategies = strategyData(ch);
    const completedRecord = state.completed[String(ch.number)];
    const prepDone = run.clues.length === 4 && run.strategies.length === 5;
    app.innerHTML = `${topbar(`第 ${ch.number} 回`)}${nav()}<section class="hero"><div class="eyebrow">${esc(ch.era)}・${esc(kindData(ch).label)}</div><h1>${esc(ch.title)}</h1><h2>${esc(ch.nickname)}・${esc(ch.name)}　｜　新同伴：${esc(ch.companionNickname)}・${esc(ch.companion)}</h2><p>${esc(chapterIntro(ch))}</p><div class="actions"><button class="btn" data-act="chapters">返回選章</button>${completedRecord?`<span class="tag good">最佳紀錄 ${completedRecord.grade}・${completedRecord.score} 分</span>`:''}</div></section>
      <div class="status-grid" style="margin-top:16px"><section class="card"><div class="portrait"><div class="avatar">${esc(ch.name[0])}</div><div><span class="tag accent">第 ${ch.number} 名主角</span><h3>${esc(ch.nickname)}・${esc(ch.name)}</h3><p>${esc(ch.focus)}</p></div></div><div class="statline"><span>氣血</span><div class="bar"><i style="width:${pct(run.hero.hp,run.hero.maxHp)}%"></i></div><b>${run.hero.hp}/${run.hero.maxHp}</b></div><div class="statline"><span>豪氣</span><div class="bar sp"><i style="width:${pct(run.hero.sp,run.hero.maxSp)}%"></i></div><b>${run.hero.sp}/${run.hero.maxSp}</b></div><p><span class="tag">攻 ${run.hero.atk}</span><span class="tag">防 ${run.hero.def}</span><span class="tag">金瘡藥 ${run.medicines}</span><span class="tag">本回銀兩 +${run.silverEarned}</span></p></section><section class="card"><h3>本回進度</h3><p>查驗 ${run.clues.length}/4　軍略 ${run.strategies.length}/5　戰鬥 ${Object.values(run.battles).filter(Boolean).length}/3</p><div class="progress"><i style="width:${pct(run.clues.length+run.strategies.length+Object.values(run.battles).filter(Boolean).length,12)}%"></i></div><p>全章行動 ${run.stats.actions} 次<br>戰敗 ${run.stats.defeats} 次　用藥 ${run.stats.medicinesUsed} 次</p>${run.complete?`<span class="tag good">本次評級 ${run.grade}・${run.score} 分</span>`:''}</section></div>
      <div class="section-title"><div><h2>一、四項查驗</h2><p>先找齊事實，才能制定軍略。</p></div><b>${run.clues.length}/4</b></div><section class="task-list">${clues.map((item,index) => `<button class="task ${run.clues.includes(index)?'done':''}" data-clue="${index}" ${run.clues.includes(index)?'disabled':''}><span class="task-icon">${item.icon}</span><span><b>${esc(item.title)}</b><small>${esc(item.text)}</small></span><span class="task-state">${run.clues.includes(index)?'✓':'查'}</span></button>`).join('')}</section>
      <div class="section-title"><div><h2>二、五階段軍略</h2><p>依序完成，形成可追責的長久制度。</p></div><b>${run.strategies.length}/5</b></div><section class="task-list">${strategies.map((item,index) => {
        const done=run.strategies.includes(index), enabled=run.clues.length===4 && index===run.strategies.length;
        return `<button class="task ${done?'done':''}" data-strategy="${index}" ${done||!enabled?'disabled':''}><span class="task-icon">${index+1}</span><span><b>${esc(item.title)}</b><small>${esc(item.text)}</small></span><span class="task-state">${done?'✓':enabled?'行':'鎖'}</span></button>`;
      }).join('')}</section>
      <div class="section-title"><div><h2>三、三場主線戰鬥</h2><p>前兩戰清除阻力，最終戰擊破幕後黑主。</p></div><b>${Object.values(run.battles).filter(Boolean).length}/3</b></div><div class="grid three">${[0,1,2].map(stage => {
        const done=run.battles[String(stage)], enabled=prepDone && (stage===0 || run.battles[String(stage-1)]);
        const labels=['前哨戰','查驗戰','最終戰'];
        return `<section class="card ${done?'success':''}"><h3>${['⚔️','🛡️','👹'][stage]} ${labels[stage]}</h3><p>${enemyFor(ch,stage,run.difficulty,run.gear).name}</p><button class="btn ${stage===2?'danger':'primary'}" data-battle-start="${stage}" ${done||!enabled?'disabled':''}>${done?'已勝利':enabled?'迎戰':'尚未解鎖'}</button></section>`;
      }).join('')}</div>
      <div class="section-title"><div><h2>難度與行裝</h2><p>非戰鬥狀態可調整；戰鬥開始後鎖定本場數值。</p></div></div><div class="grid two"><section class="card"><h3>難度</h3>${difficultyPicker(run)}</section><section class="card"><h3>行裝</h3><p>${GEARS[run.gear].icon} ${GEARS[run.gear].name}：${GEARS[run.gear].text}</p><button class="btn" data-act="gear-modal">更換行裝</button></section></div>
      ${run.battles['2']&&!run.complete?`<section class="card success" style="margin-top:18px"><h2>章回條件全部完成</h2><p>可立下本回安民約，結算成就、評級與英雄譜紀錄。</p><button class="btn good" data-act="finish">完成第 ${ch.number} 回</button></section>`:''}
      <section class="card" style="margin-top:18px"><h3>本回紀錄</h3><div class="log">${run.log.slice(0,12).map(item=>`<div>${esc(item)}</div>`).join('')}</div></section>`;
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
    const systemCost = battle.gear === 'flag' ? 85 : 105;
    app.innerHTML = `${topbar(`戰鬥・第 ${ch.number} 回`)}${nav()}<section class="battle-grid"><article class="fighter"><div class="fighter-head"><div class="portrait"><div class="avatar">${esc(ch.name[0])}</div><div><span class="tag accent">${esc(ch.nickname)}</span><h3>${esc(ch.name)}</h3><p>攻 ${hero.atk}・防 ${hero.def}</p></div></div><span class="tag">第 ${battle.turn} 合</span></div><div class="statline"><span>氣血</span><div class="bar"><i style="width:${pct(hero.hp,hero.maxHp)}%"></i></div><b>${hero.hp}/${hero.maxHp}</b></div><div class="statline"><span>豪氣</span><div class="bar sp"><i style="width:${pct(hero.sp,hero.maxSp)}%"></i></div><b>${hero.sp}/${hero.maxSp}</b></div><div class="battle-actions"><button class="btn" data-battle-action="attack">${esc(names.attack)}</button><button class="btn primary" data-battle-action="skill" ${hero.sp<60?'disabled':''}>${esc(names.skill)}（60）</button><button class="btn primary" data-battle-action="system" ${hero.sp<systemCost?'disabled':''}>${esc(names.system)}（${systemCost}）</button><button class="btn" data-battle-action="guard">守勢回氣</button><button class="btn good" data-battle-action="companion" ${battle.companionUsed?'disabled':''}>${esc(ch.companion)}援護</button><button class="btn" data-battle-action="medicine" ${run.medicines<=0?'disabled':''}>金瘡藥（${run.medicines}）</button></div><div class="battle-note">${DIFFICULTIES[battle.difficulty].name}難度・${GEARS[battle.gear].icon} ${GEARS[battle.gear].name}・勝利獎勵 ${enemy.reward} 銀兩・本場行動 ${battle.actions} 次</div></article><article class="fighter enemy"><div class="fighter-head"><div class="portrait"><div class="avatar">${enemy.icon}</div><div><span class="tag warn">敵方</span><h3>${esc(enemy.name)}</h3><p>攻 ${enemy.atk}・防 ${enemy.def}</p></div></div></div><div class="statline"><span>氣血</span><div class="bar"><i style="width:${pct(enemy.hp,enemy.maxHp)}%"></i></div><b>${enemy.hp}/${enemy.maxHp}</b></div><p>${esc(enemy.intro)}</p></article></section><section class="card" style="margin-top:16px"><h3>戰況</h3><div class="log">${battle.log.map(item=>`<div>${esc(item)}</div>`).join('')}</div></section>`;
  }

  function gradeText(grade) {
    return ({S:'梁山典範',A:'安民善策',B:'穩健通關',C:'艱戰得勝'})[grade] || '章回完成';
  }

  function renderEnding() {
    screen = 'ending';
    const run = state.current;
    if (!run?.complete) return renderChapter();
    const ch = currentChapter();
    const final = ch.number === 108;
    app.innerHTML = `${topbar(`第 ${ch.number} 回完成`)}${nav()}<section class="hero"><div class="eyebrow">${final?'一百零八回全篇大結局':'章回完成'}</div><div class="grade-badge"><span>${run.grade}</span><small>${run.score} 分</small></div><h1>${final?'一百零八英雄<br>百業同安':esc(ch.title)}</h1><h2>${esc(ch.nickname)}・${esc(ch.name)}正式列入第 ${ch.number} 席</h2><p>${final?'段景住尋回走失馬匹後，智多星吳用將一百零八回的名冊、制度、救援與公議彙成《梁山百業安民總約》。從武松到段景住，每位英雄都不只留下戰功，也留下能讓百姓繼續生活的規矩。':`${ch.focus}已建立可查名冊、公開標準、停止條件與救援追蹤。下一位英雄 ${ch.companionNickname}・${ch.companion} 已接下新的章回任務。`}</p><p><b>${gradeText(run.grade)}</b>：全章行動 ${run.stats.actions} 次、戰敗 ${run.stats.defeats} 次、用藥 ${run.stats.medicinesUsed} 次，獲得 ${run.achievements.length}/4 項成就。</p><div class="actions"><button class="btn primary" data-act="replay">重演本回</button>${!final?`<button class="btn good" data-act="next">進入第 ${ch.number+1} 回</button>`:'<button class="btn good" data-act="chapters">查看全篇完成紀錄</button>'}<button class="btn" data-act="roster">查看一百零八英雄譜</button><button class="btn" data-act="manage">匯出完成存檔</button></div></section><div class="grid three" style="margin-top:16px"><section class="card"><h3>章回成果</h3><p>四項查驗 4/4<br>五階段軍略 5/5<br>三場戰鬥 3/3<br>本回銀兩 +${run.silverEarned}</p></section><section class="card"><h3>章回成就</h3>${['明察四證','三戰連捷','無藥制勝','獨當一面'].map(name=>`<div class="achievement ${run.achievements.includes(name)?'':'locked'}"><span class="medal">${run.achievements.includes(name)?'🏅':'🔒'}</span><div><b>${name}</b><p>${({明察四證:'完成全部四項查驗。',三戰連捷:'全章未曾戰敗。',無藥制勝:'全章未使用金瘡藥。',獨當一面:'最終戰未呼叫同伴援護。'})[name]}</p></div></div>`).join('')}</section><section class="card"><h3>${final?'全篇完成':'後續伏筆'}</h3><p>${final?`目前已完成 ${completionCount()}/108 回，取得 ${sCount()} 個 S 級。可自由重演任何章回，提高最佳分數。`:`${ch.companionNickname}・${ch.companion} 將升格為第 ${ch.number+1} 回主角，接續整頓「${chapter(ch.number+1).focus}」。`}</p></section></div>`;
  }

  function renderRoster() {
    screen = 'roster';
    app.innerHTML = `${topbar('一百零八英雄譜')}${nav()}<section class="hero"><div class="eyebrow">遊戲自訂聚義座次</div><h1>一百零八英雄譜</h1><h2>瓊英列入可操控英雄，吳用擔任軍師職司</h2><p>本遊戲沿用既有自訂章回順序，不照搬原著石碣座次。完成各回後會在英雄卡上顯示最佳評級。</p></section><div class="roster-grid" style="margin-top:16px">${chapters.map(ch => {
      const record=state.completed[String(ch.number)];
      return `<button class="card roster-card ${record?'success':''}" data-chapter="${ch.number}" style="text-align:left;cursor:pointer"><div class="portrait"><div class="avatar">${esc(ch.name[0])}</div><div><span class="tag">第 ${ch.number} 席</span><h3>${esc(ch.nickname)}・${esc(ch.name)}</h3><p>${record?`最佳 ${record.grade}・${record.score} 分`:'尚未完成'}</p></div></div></button>`;
    }).join('')}</div>`;
  }

  function openModal(title, content) {
    modalRoot.innerHTML = `<div class="modal-backdrop" data-modal="close"><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}" onclick="event.stopPropagation()"><header class="modal-head"><div><h2>${esc(title)}</h2></div><button class="btn icon" data-modal="close" aria-label="關閉">×</button></header>${content}</section></div>`;
  }

  function closeModal() { modalRoot.innerHTML = ''; }

  function openGearModal() {
    openModal('選擇本回行裝', `${gearPicker(state.current)}<div class="actions" style="margin-top:14px"><button class="btn" data-modal="close">完成</button></div>`);
  }

  function openManage() {
    const data = JSON.stringify({type:'liangshan-v7-save',version:VERSION,exportedAt:new Date().toISOString(),state,prefs}, null, 2);
    openModal('存檔管理', `<p>本版存檔包含 108 回完成紀錄、最佳評級、目前章回與偏好設定。</p><textarea id="saveText" spellcheck="false">${esc(data)}</textarea><div class="actions"><button class="btn primary" data-modal="copy">複製</button><button class="btn" data-modal="download">下載 JSON</button><button class="btn" data-modal="import">匯入文字</button><button class="btn warn" data-modal="reset-current">重設目前章回</button><button class="btn danger" data-modal="reset-all">清除 v7 全部進度</button></div><p class="muted">清除 v7 進度不會刪除 v4.5.0、v6.2.0 舊存檔與遷移備份。</p>`);
  }

  function openInfo() {
    openModal('v7.0.0 完整章回版', `<h3>完整範圍</h3><p>第一回至第一百零八回全部可遊玩，共 108 名主角、108 組章回主題、432 項查驗、540 階段軍略、324 場主線戰鬥與 432 項章回成就。</p><h3>統一引擎</h3><p>前 34 回保留原版入口，同時可用本版快速重演；35～51 回整合既有制度續篇；52～108 回一次補完。每回都使用同一套穩定的存檔、難度、行裝、評級與手機介面。</p><h3>存檔承接</h3><p>首次啟動會唯讀偵測 <span class="code">${OLD_LEGACY_KEY}</span> 與 <span class="code">${OLD_SEQUEL_KEY}</span>，先備份再轉成 v7 完成紀錄。</p><h3>顯示與離線</h3><p>支援水墨、深色、電子紙模式，手機與桌面版面、語音朗讀、JSON 匯出入及 PWA 離線安裝。</p>`);
  }

  function render() {
    document.body.dataset.theme = prefs.theme;
    if (screen === 'home') renderHome();
    else if (screen === 'chapters') renderChapters();
    else if (screen === 'chapter') renderChapter();
    else if (screen === 'battle') renderBattle();
    else if (screen === 'ending') renderEnding();
    else if (screen === 'roster') renderRoster();
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
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-TW'; utter.rate = .95;
    speechSynthesis.speak(utter);
    toast('開始朗讀本頁。','good');
  }

  function cycleTheme() {
    const order = ['ink','dark','paper'];
    prefs.theme = order[(order.indexOf(prefs.theme) + 1) % order.length];
    save(true); render();
    toast(`已切換為 ${{ink:'水墨',dark:'深色',paper:'電子紙'}[prefs.theme]}模式。`);
  }

  function downloadText(filename, text, mime = 'application/json') {
    const blob = new Blob([text], {type:`${mime};charset=utf-8`});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function importSaveText(text) {
    const parsed = JSON.parse(text);
    const incomingState = parsed?.state || parsed;
    if (!incomingState || typeof incomingState !== 'object' || !incomingState.completed) throw new Error('invalid');
    storage.setItem(`${OLD_BACKUP_PREFIX}before-import`, JSON.stringify(state));
    state = mergeState(incomingState);
    if (parsed?.prefs) {
      prefs = {...freshPrefs(), ...parsed.prefs};
      if (!DIFFICULTIES[prefs.difficulty]) prefs.difficulty='standard';
      if (!GEARS[prefs.gear]) prefs.gear='mirror';
    }
    save(true);
  }

  app.addEventListener('click', event => {
    const chapterButton = event.target.closest('[data-chapter]');
    if (chapterButton) { startChapter(chapterButton.dataset.chapter, true); return; }
    const clueButton = event.target.closest('[data-clue]');
    if (clueButton) { collectClue(clueButton.dataset.clue); return; }
    const strategyButton = event.target.closest('[data-strategy]');
    if (strategyButton) { doStrategy(strategyButton.dataset.strategy); return; }
    const battleStart = event.target.closest('[data-battle-start]');
    if (battleStart) { startBattle(battleStart.dataset.battleStart); return; }
    const battleActionButton = event.target.closest('[data-battle-action]');
    if (battleActionButton) { battleAction(battleActionButton.dataset.battleAction); return; }
    const difficultyButton = event.target.closest('[data-difficulty]');
    if (difficultyButton && state.current && !state.current.battle) {
      state.current.difficulty = difficultyButton.dataset.difficulty;
      prefs.difficulty = difficultyButton.dataset.difficulty;
      save(true); renderChapter(); return;
    }
    const gearButton = event.target.closest('[data-gear]');
    if (gearButton && state.current && !state.current.battle) {
      state.current.gear = gearButton.dataset.gear;
      prefs.gear = gearButton.dataset.gear;
      save(true); renderChapter(); closeModal(); toast(`已裝備${GEARS[prefs.gear].name}。`,'good'); return;
    }
    const actionButton = event.target.closest('[data-act]');
    if (!actionButton) return;
    const action = actionButton.dataset.act;
    if (action === 'home') { screen='home'; render(); }
    if (action === 'chapters') { if(actionButton.dataset.eraTarget)chapterEra=actionButton.dataset.eraTarget; screen='chapters'; render(); }
    if (action === 'roster') { screen='roster'; render(); }
    if (action === 'continue') { if(state.current){screen=state.current.battle?'battle':state.current.complete?'ending':'chapter';render();} else startChapter(firstIncomplete()); }
    if (action === 'start-recommended') startChapter(firstIncomplete(), true);
    if (action === 'clear-filter') { chapterSearch=''; chapterEra='all'; renderChapters(); }
    if (action === 'finish') finishChapter();
    if (action === 'next') startChapter(Math.min(108,currentChapter().number+1), true);
    if (action === 'replay') startChapter(currentChapter().number, true);
    if (action === 'theme') cycleTheme();
    if (action === 'speech') speakPage();
    if (action === 'manage') openManage();
    if (action === 'info') openInfo();
    if (action === 'gear-modal') openGearModal();
    if (action === 'install' && deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.finally(()=>deferredPrompt=null); }
  });

  modalRoot.addEventListener('click', event => {
    const button = event.target.closest('[data-modal]');
    if (!button) return;
    const action = button.dataset.modal;
    if (action === 'close') { closeModal(); return; }
    const textarea = $('#saveText');
    if (action === 'copy' && textarea) {
      navigator.clipboard?.writeText(textarea.value).then(()=>toast('存檔已複製。','good')).catch(()=>{textarea.select();document.execCommand('copy');toast('存檔已複製。','good');});
    }
    if (action === 'download' && textarea) downloadText(`水滸英雄傳_v7.0.0_存檔_${new Date().toISOString().slice(0,10)}.json`, textarea.value);
    if (action === 'import' && textarea) {
      try { importSaveText(textarea.value); closeModal(); screen='home'; render(); toast('v7 存檔匯入成功。','good'); }
      catch { toast('存檔格式不正確，請確認內容。','warn'); }
    }
    if (action === 'reset-current' && state.current && confirm(`確定重設第 ${state.current.chapter} 回本次進度嗎？最佳完成紀錄會保留。`)) {
      const number=state.current.chapter; state.current=makeRun(number); save(true); closeModal(); screen='chapter'; render(); toast('目前章回已重設。');
    }
    if (action === 'reset-all' && confirm('確定清除 v7.0.0 全部 108 回進度嗎？舊版存檔與備份不會刪除。')) {
      storage.removeItem(SAVE_KEY); state=freshState(); migrateOldSaves(); closeModal(); screen='home'; render(); toast('v7 全部進度已重設；可承接的舊版紀錄已重新讀取。','warn');
    }
  });

  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); deferredPrompt = event; });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('service-worker.js').catch(()=>{});

  migrateOldSaves();
  document.body.dataset.theme = prefs.theme;
  render();

  // 供自動測試與除錯使用，不影響一般遊玩。
  window.__LIANGSHAN_TEST__ = {
    version:VERSION,
    chapters,
    getState:()=>clone(state),
    start:number=>startChapter(number,true),
    prepare:()=>{ if(!state.current)return; state.current.clues=[0,1,2,3]; state.current.strategies=[0,1,2,3,4]; save(true); render(); },
    winStage:stage=>{ if(!state.current)return; state.current.battles[String(stage)]=true; if(Number(stage)===0)state.current.companion.unlocked=true; save(true); render(); },
    finish:()=>{ if(!state.current)return; state.current.clues=[0,1,2,3];state.current.strategies=[0,1,2,3,4];state.current.battles={0:true,1:true,2:true};finishChapter(); },
    reset:()=>{storage.removeItem(SAVE_KEY);state=freshState();state.migration.done=true;save(true);screen='home';render();}
  };
})();
