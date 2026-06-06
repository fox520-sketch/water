(() => {
  'use strict';

  const SAVE_KEY = 'liangshan-rpg-save-v1';
  const PREF_KEY = 'liangshan-rpg-prefs-v1';
  const VERSION = '1.3.0';
  const THEMES = ['ink', 'dark', 'paper'];
  const THEME_NAMES = { ink: '水墨宣紙', dark: '夜行深色', paper: '黑白電子紙' };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const cloneData = value => JSON.parse(JSON.stringify(value));

  const HERO_BLUEPRINTS = {
    wusong: {
      id: 'wusong', name: '武松', avatar: '武', title: '清河縣壯士', level: 1, xp: 0, nextXp: 80,
      hp: 110, maxHp: 110, sp: 24, maxSp: 30,
      baseAttack: 16, baseDefense: 7, morality: 50, silver: 30, drunk: 0,
      guarding: false, unlocked: true
    },
    luzhishen: {
      id: 'luzhishen', name: '魯達', avatar: '魯', title: '渭州經略府提轄', level: 2, xp: 0, nextXp: 110,
      hp: 132, maxHp: 132, sp: 30, maxSp: 36,
      baseAttack: 19, baseDefense: 9, morality: 58, silver: 22, drunk: 0,
      guarding: false, unlocked: false
    }
  };

  const HERO_SKILLS = {
    wusong: [
      { id: 'kick', name: '鴛鴦連環腿', cost: 8, description: '快速連擊兩次。' },
      { id: 'drunken', name: '醉拳破勢', cost: 12, description: '酒意越濃，威力越高。' }
    ],
    luzhishen: [
      { id: 'staffSweep', name: '禪杖橫掃', cost: 8, description: '重擊敵手並削弱其武力。' },
      { id: 'vajraRoar', name: '金剛怒喝', cost: 12, description: '震懾敵手，有機會使其一回合無法行動。' }
    ]
  };

  const ITEMS = {
    herb: { name: '金瘡藥', type: 'consumable', description: '敷治刀傷與獸爪之創，恢復 45 點氣血。', price: 20 },
    bun: { name: '炊餅', type: 'consumable', description: '陽谷街頭常見乾糧，恢復 22 點氣血。', price: 8 },
    wine: { name: '村醪', type: 'consumable', description: '烈酒入喉，恢復 12 點豪氣並增加一分酒意。', price: 10 },
    staff: { name: '白蠟哨棒', type: 'weapon', hero: 'wusong', description: '旅人防身長棒，武力 +3。', attack: 3 },
    tigerStaff: { name: '折虎哨棒', type: 'weapon', hero: 'wusong', description: '景陽岡鏖戰留下的哨棒，武力 +6、筋骨 +1。', attack: 6, defense: 1 },
    robe: { name: '皂布直綴', type: 'armor', hero: 'wusong', description: '輕便耐磨的江湖衣裝，筋骨 +2。', defense: 2 },
    ironCudgel: { name: '渭州鐵棍', type: 'weapon', hero: 'luzhishen', description: '魯提轄慣用沉重鐵棍，武力 +5。', attack: 5 },
    officerCoat: { name: '提轄錦袍', type: 'armor', hero: 'luzhishen', description: '經略府提轄官衣，筋骨 +3。', defense: 3 },
    zenStaff: { name: '水磨禪杖', type: 'weapon', hero: 'luzhishen', description: '五臺山打造的沉重禪杖，武力 +8、筋骨 +2。', attack: 8, defense: 2 },
    monkRobe: { name: '皂布僧衣', type: 'armor', hero: 'luzhishen', description: '智真長老所賜僧衣，筋骨 +5。', defense: 5 },
    tigerToken: { name: '打虎英雄牌', type: 'key', description: '陽谷知縣所贈名牌，記錄景陽岡打虎之功。' },
    riceSeal: { name: '義米封條', type: 'key', description: '遭劫米袋上的封條，見證你為百姓奪回糧食。' },
    jinHairpin: { name: '金氏銀釵', type: 'key', description: '金翠蓮留下的信物，記錄魯提轄仗義救人的往事。' },
    monkCertificate: { name: '五臺度牒', type: 'key', description: '魯達於五臺山剃度後所得度牒，法名智深。' }
  };

  const COMPANIONS = {
    songjiang: {
      name: '宋江', title: '鄆城押司・及時雨', avatar: '宋', role: '仁義支援', skillName: '及時雨援護',
      description: '每場戰鬥可使用一次，恢復氣血與豪氣；羈絆越深，恢復量越高。',
      unlockHint: '在柴進莊與宋江真誠敘話。'
    },
    chaijin: {
      name: '柴進', title: '小旋風・柴大官人', avatar: '柴', role: '守勢支援', skillName: '丹書護援',
      description: '每場戰鬥可使用一次，使接下來兩次受到的傷害降低；羈絆越深，減傷越強。',
      unlockHint: '辭別柴進莊，踏上英雄路。'
    },
    shijin: {
      name: '史進', title: '九紋龍・史家莊少主', avatar: '史', role: '猛攻支援', skillName: '九紋龍突擊',
      description: '每場戰鬥可使用一次，直接重創敵人；羈絆越深，造成的傷害越高。',
      unlockHint: '在渭州潘家酒樓與史進相會。'
    }
  };

  const ENEMIES = {
    bandit: {
      name: '剪徑山賊', title: '劫奪義米的惡漢', avatar: '賊', maxHp: 72, attack: 14, defense: 4,
      xp: 32, silver: 18, canFlee: true,
      moves: ['揮刀直劈', '飛腳踢來', '抄起木棍橫掃']
    },
    tiger: {
      name: '吊睛白額虎', title: '景陽岡百獸之王', avatar: '虎', maxHp: 155, attack: 23, defense: 8,
      xp: 95, silver: 0, canFlee: false,
      moves: ['掀起腥風猛撲', '鐵尾如鞭橫掃', '咆哮著張口噬來']
    },
    arena: {
      name: '陽谷擂臺教頭', title: '縣衙演武高手', avatar: '擂', maxHp: 118, attack: 19, defense: 7,
      xp: 36, silver: 12, canFlee: true,
      moves: ['挺槍連刺', '旋身掃腿', '沉肩撞來']
    },
    innThugs: {
      name: '投店惡僕', title: '攔阻金氏父女的店家打手', avatar: '惡', maxHp: 96, attack: 18, defense: 5,
      xp: 40, silver: 14, canFlee: true,
      moves: ['舉凳砸來', '持棍包抄', '扯住衣襟揮拳']
    },
    zhengtu: {
      name: '鎮關西鄭屠', title: '渭州肉案惡霸', avatar: '鄭', maxHp: 188, attack: 27, defense: 9,
      xp: 115, silver: 28, canFlee: false,
      moves: ['掄起剔骨尖刀', '揮動秤鉤猛砸', '仗著蠻力撞來']
    },
    weizhouArena: {
      name: '渭州棒師', title: '經略府演武場好手', avatar: '棒', maxHp: 142, attack: 22, defense: 8,
      xp: 44, silver: 14, canFlee: true,
      moves: ['棍走連環', '掃堂逼近', '當胸直搗']
    }
  };

  const MAP_NODES = [
    { id: 'manor', name: '柴進莊', region: '滄州地界', x: 8, y: 78, unlock: () => true },
    { id: 'road', name: '陽谷驛道', region: '河北山道', x: 22, y: 62, unlock: s => s.flags.leftManor },
    { id: 'inn', name: '三碗不過岡', region: '景陽岡下', x: 36, y: 74, unlock: s => s.flags.reachedInn },
    { id: 'forest', name: '景陽岡', region: '亂樹深山', x: 49, y: 49, unlock: s => s.flags.enteredForest },
    { id: 'county', name: '陽谷縣', region: '山東地界', x: 62, y: 66, unlock: s => s.flags.tigerDefeated },
    { id: 'weizhou', name: '渭州城', region: '關西重鎮', x: 75, y: 40, unlock: s => s.flags.chapter2Started },
    { id: 'market', name: '狀元橋肉案', region: '渭州東市', x: 88, y: 55, unlock: s => s.flags.reachedButcherStall },
    { id: 'wutai', name: '五臺山', region: '清涼佛地', x: 94, y: 18, unlock: s => s.flags.wutaiReached }
  ];

  function createHero(id) {
    return cloneData(HERO_BLUEPRINTS[id]);
  }

  const defaultState = () => {
    const wusong = createHero('wusong');
    const luzhishen = createHero('luzhishen');
    return {
      version: VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sceneId: 'manor_start',
      location: 'manor',
      chapter: 1,
      activeHeroId: 'wusong',
      hero: cloneData(wusong),
      heroes: { wusong, luzhishen },
      inventory: { herb: 2, bun: 2, wine: 1, staff: 1, robe: 1, ironCudgel: 1, officerCoat: 1 },
      equipment: { weapon: 'staff', armor: 'robe' },
      equipments: {
        wusong: { weapon: 'staff', armor: 'robe' },
        luzhishen: { weapon: 'ironCudgel', armor: 'officerCoat' }
      },
      companions: {
        songjiang: { unlocked: false, bond: 1, wins: 0 },
        chaijin: { unlocked: false, bond: 1, wins: 0 },
        shijin: { unlocked: false, bond: 1, wins: 0 }
      },
      team: { active: null },
      quests: {
        main_jingyang: { title: '景陽岡打虎', description: '離開柴進莊，翻越景陽岡，返鄉尋兄。', status: 'active', progress: '向陽谷縣進發' },
        side_rice: { title: '被劫的義米', description: '替岡下酒家追回遭山賊劫去、原要施給窮戶的米糧。', status: 'hidden', progress: '尚未聽聞' },
        main_zhengguan: { title: '拳打鎮關西', description: '在渭州救助金氏父女，懲治欺壓良善的鄭屠。', status: 'hidden', progress: '尚未開篇' }
      },
      flags: {
        metSongJiang: false, leftManor: false, roadBanditCleared: false, reachedInn: false,
        riceQuestOffered: false, riceQuestDone: false, drankAtInn: 0, enteredForest: false,
        foundHerb: false, readNotice: false, restedTemple: false, tigerDefeated: false,
        reachedCounty: false, gameComplete: false, arenaWins: 0,
        chapter2Started: false, chapter2Complete: false, metShiJin: false, heardJinStory: false,
        jinFamilySaved: false, innThugsDefeated: false, reachedButcherStall: false,
        butcherOrders: 0, zhengDefeated: false, escapedWeizhou: false, wutaiReached: false,
        weizhouArenaWins: 0
      },
      log: ['第一回開篇：武松客居柴進莊。'],
      battle: null,
      playMinutes: 0,
      lastTickAt: Date.now()
    };
  };


  let state = null;
  let prefs = loadPrefs();
  let currentScreen = 'title';
  let deferredInstallPrompt = null;
  let audioContext = null;
  let tickTimer = null;
  let battleLocked = false;
  let availableVoices = [];
  let lastNarratedSceneId = '';
  let lastNarratedBattleKey = '';
  let speechToken = 0;

  const screenRoot = $('#screenRoot');
  const modalRoot = $('#modalRoot');
  const toastRoot = $('#toastRoot');

  function loadPrefs() {
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY));
      return {
        theme: saved?.theme || 'ink',
        sound: saved?.sound !== false,
        narration: saved?.narration === true,
        narrateScenes: saved?.narrateScenes !== false,
        narrateBattle: saved?.narrateBattle !== false,
        narrateChoices: saved?.narrateChoices === true,
        speechRate: Number.isFinite(Number(saved?.speechRate)) ? clamp(Number(saved.speechRate), 0.6, 1.5) : 0.9,
        speechVolume: Number.isFinite(Number(saved?.speechVolume)) ? clamp(Number(saved.speechVolume), 0, 1) : 1,
        speechVoice: typeof saved?.speechVoice === 'string' ? saved.speechVoice : ''
      };
    } catch {
      return { theme: 'ink', sound: true, narration: false, narrateScenes: true, narrateBattle: true, narrateChoices: false, speechRate: 0.9, speechVolume: 1, speechVoice: '' };
    }
  }

  function savePrefs() {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  }

  function hasSave() {
    return Boolean(localStorage.getItem(SAVE_KEY));
  }

  function syncActiveHero() {
    if (!state?.hero || !state?.activeHeroId) return;
    state.heroes ||= {};
    state.equipments ||= {};
    state.heroes[state.activeHeroId] = { ...(state.heroes[state.activeHeroId] || {}), ...cloneData(state.hero), unlocked: true };
    state.equipments[state.activeHeroId] = { ...(state.equipment || {}) };
  }

  function setActiveHero(id) {
    if (!state?.heroes?.[id]?.unlocked) return false;
    syncActiveHero();
    state.activeHeroId = id;
    state.hero = cloneData(state.heroes[id]);
    state.equipment = { ...(state.equipments?.[id] || {}) };
    return true;
  }

  function saveGame(showNotice = true) {
    if (!state) return;
    syncActiveHero();
    state.updatedAt = new Date().toISOString();
    state.lastTickAt = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    if (showNotice) {
      toast('篇章已收入本機存檔。');
      tone('save');
    }
    refreshTitleSaveHint();
  }

  function loadGame() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!parsed || !parsed.hero || !parsed.sceneId) throw new Error('invalid save');
      state = migrateState(parsed);
      return true;
    } catch (error) {
      console.warn(error);
      localStorage.removeItem(SAVE_KEY);
      toast('存檔格式異常，已無法讀取。');
      return false;
    }
  }

  function migrateState(saved) {
    const base = defaultState();
    const guessedActive = saved.activeHeroId || (/^魯/.test(saved.hero?.name || '') ? 'luzhishen' : 'wusong');
    const savedHeroes = saved.heroes || {};
    const savedEquipments = saved.equipments || {};
    const oldHeroTarget = guessedActive === 'luzhishen' ? 'luzhishen' : 'wusong';
    const heroes = {
      wusong: { ...base.heroes.wusong, ...(savedHeroes.wusong || (oldHeroTarget === 'wusong' ? saved.hero : {})) },
      luzhishen: { ...base.heroes.luzhishen, ...(savedHeroes.luzhishen || (oldHeroTarget === 'luzhishen' ? saved.hero : {})) }
    };
    const equipments = {
      wusong: { ...base.equipments.wusong, ...(savedEquipments.wusong || (oldHeroTarget === 'wusong' ? saved.equipment : {})) },
      luzhishen: { ...base.equipments.luzhishen, ...(savedEquipments.luzhishen || (oldHeroTarget === 'luzhishen' ? saved.equipment : {})) }
    };
    const merged = {
      ...base,
      ...saved,
      activeHeroId: guessedActive,
      heroes,
      equipments,
      inventory: { ...base.inventory, ...saved.inventory },
      companions: {
        songjiang: { ...base.companions.songjiang, ...(saved.companions?.songjiang || {}) },
        chaijin: { ...base.companions.chaijin, ...(saved.companions?.chaijin || {}) },
        shijin: { ...base.companions.shijin, ...(saved.companions?.shijin || {}) }
      },
      team: { ...base.team, ...(saved.team || {}) },
      quests: { ...base.quests, ...saved.quests },
      flags: { ...base.flags, ...saved.flags },
      version: VERSION,
      battle: null,
      lastTickAt: Date.now()
    };
    if (merged.flags.metSongJiang) merged.companions.songjiang.unlocked = true;
    if (merged.flags.leftManor) merged.companions.chaijin.unlocked = true;
    if (merged.flags.metShiJin) merged.companions.shijin.unlocked = true;
    if (merged.flags.chapter2Started || merged.flags.chapter2Complete || guessedActive === 'luzhishen') merged.heroes.luzhishen.unlocked = true;
    if (!merged.heroes[merged.activeHeroId]?.unlocked) merged.activeHeroId = 'wusong';
    merged.hero = cloneData(merged.heroes[merged.activeHeroId]);
    merged.equipment = { ...merged.equipments[merged.activeHeroId] };
    if (!merged.team.active || !merged.companions[merged.team.active]?.unlocked) {
      merged.team.active = merged.companions.songjiang.unlocked ? 'songjiang' : merged.companions.chaijin.unlocked ? 'chaijin' : merged.companions.shijin.unlocked ? 'shijin' : null;
    }
    return merged;
  }

  function startNewGame() {
    if (hasSave() && !window.confirm('開啟新篇章會覆蓋目前存檔，確定繼續？')) return;
    state = defaultState();
    saveGame(false);
    showGame();
    tone('start');
  }

  function continueGame() {
    if (!hasSave()) {
      toast('尚無存檔，請先開啟新篇章。');
      return;
    }
    if (loadGame()) showGame();
  }

  function startChapterTwo() {
    if (!state?.flags?.gameComplete) {
      toast('須先完成第一回「景陽岡打虎」。');
      return;
    }
    if (state.flags.chapter2Complete) {
      switchHero('luzhishen');
      return;
    }
    if (state.flags.chapter2Started) {
      setActiveHero('luzhishen');
      state.chapter = 2;
      const resumeScene = state.flags.wutaiReached ? 'wutai_gate'
        : state.flags.zhengDefeated ? 'weizhou_escape'
          : state.flags.reachedButcherStall ? 'butcher_stall'
            : state.flags.heardJinStory ? 'jin_plan' : 'weizhou_tavern';
      goScene(resumeScene);
      return;
    }
    state.flags.chapter2Started = true;
    state.heroes.luzhishen.unlocked = true;
    state.quests.main_zhengguan.status = 'active';
    state.quests.main_zhengguan.progress = '前往潘家酒樓與史進相會';
    setActiveHero('luzhishen');
    state.chapter = 2;
    addLog('第二回開篇：魯提轄在渭州城與史進相會。');
    goScene('weizhou_tavern');
    tone('start');
  }

  function switchHero(id) {
    if (!state?.flags?.chapter2Complete) {
      toast('完成第二回後，才可自由切換兩位主角。');
      return;
    }
    if (!setActiveHero(id)) return;
    state.chapter = id === 'wusong' ? 1 : 2;
    closeModal();
    addLog(`目前操控英雄切換為「${state.hero.name}」。`);
    goScene(id === 'wusong' ? 'county_free' : 'wutai_free');
  }

  function finishChapterTwo() {
    if (!state.flags.chapter2Complete) {
      state.flags.chapter2Complete = true;
      state.flags.wutaiReached = true;
      state.quests.main_zhengguan.status = 'completed';
      state.quests.main_zhengguan.progress = '三拳懲惡，五臺剃度，法名智深';
      state.hero.name = '魯智深';
      state.hero.title = '花和尚・五臺山僧';
      state.hero.avatar = '魯';
      addItem('zenStaff', 1);
      addItem('monkRobe', 1);
      addItem('monkCertificate', 1);
      state.equipment.weapon = 'zenStaff';
      state.equipment.armor = 'monkRobe';
      gainXp(55);
      syncActiveHero();
    }
    goScene('chapter2_end');
    saveGame(false);
  }

  function showTitle() {
    currentScreen = 'title';
    stopSpeaking();
    lastNarratedSceneId = '';
    lastNarratedBattleKey = '';
    closeModal();
    screenRoot.replaceChildren($('#titleTemplate').content.cloneNode(true));
    refreshTitleSaveHint();
  }

  function refreshTitleSaveHint() {
    const hint = $('[data-role="save-hint"]');
    const continueButton = $('[data-action="continue-game"]');
    if (!hint || !continueButton) return;
    if (!hasSave()) {
      hint.textContent = '尚無本機存檔。遊戲進度會自動保存在此瀏覽器。';
      continueButton.disabled = true;
      return;
    }
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      const date = new Date(saved.updatedAt).toLocaleString('zh-TW', { hour12: false });
      hint.textContent = `存檔：第 ${saved.chapter || 1} 回｜${saved.hero?.name || '武松'} Lv.${saved.hero?.level || 1}｜${date}`;
      continueButton.disabled = false;
    } catch {
      hint.textContent = '發現損壞的存檔。';
      continueButton.disabled = true;
    }
  }

  function showGame() {
    if (!state) state = defaultState();
    currentScreen = 'game';
    closeModal();
    screenRoot.replaceChildren($('#gameTemplate').content.cloneNode(true));
    renderGame();
    startTicking();
  }

  function startTicking() {
    clearInterval(tickTimer);
    tickTimer = setInterval(() => {
      if (!state || currentScreen !== 'game') return;
      const now = Date.now();
      const elapsed = Math.max(0, now - (state.lastTickAt || now));
      state.playMinutes += elapsed / 60000;
      state.lastTickAt = now;
      if (Math.floor(state.playMinutes) % 2 === 0) saveGame(false);
    }, 30000);
  }

  function addLog(text) {
    if (!state) return;
    state.log.unshift(text);
    state.log = state.log.slice(0, 35);
  }

  function getStats() {
    const weapon = ITEMS[state.equipment.weapon] || {};
    const armor = ITEMS[state.equipment.armor] || {};
    return {
      attack: state.hero.baseAttack + (weapon.attack || 0) + (armor.attack || 0),
      defense: state.hero.baseDefense + (weapon.defense || 0) + (armor.defense || 0)
    };
  }

  function getStatsForHero(id) {
    const hero = id === state.activeHeroId ? state.hero : state.heroes?.[id];
    const equipment = id === state.activeHeroId ? state.equipment : state.equipments?.[id];
    if (!hero) return { attack: 0, defense: 0 };
    const weapon = ITEMS[equipment?.weapon] || {};
    const armor = ITEMS[equipment?.armor] || {};
    return {
      attack: hero.baseAttack + (weapon.attack || 0) + (armor.attack || 0),
      defense: hero.baseDefense + (weapon.defense || 0) + (armor.defense || 0)
    };
  }

  function gainXp(amount) {
    state.hero.xp += amount;
    addLog(`獲得 ${amount} 點閱歷。`);
    while (state.hero.xp >= state.hero.nextXp) {
      state.hero.xp -= state.hero.nextXp;
      state.hero.level += 1;
      state.hero.nextXp = Math.floor(state.hero.nextXp * 1.35);
      state.hero.maxHp += 18;
      state.hero.hp = state.hero.maxHp;
      state.hero.maxSp += 5;
      state.hero.sp = state.hero.maxSp;
      state.hero.baseAttack += 3;
      state.hero.baseDefense += 2;
      toast(`${state.hero.name}升至第 ${state.hero.level} 級！氣血與豪氣盡復。`);
      tone('level');
    }
  }

  function changeMorality(amount, reason) {
    const old = state.hero.morality;
    state.hero.morality = clamp(old + amount, 0, 100);
    const label = amount >= 0 ? `義氣 +${amount}` : `義氣 ${amount}`;
    addLog(`${label}：${reason}`);
    toast(`${label}｜${reason}`);
  }

  function activeCompanion() {
    const id = state?.team?.active;
    if (!id || !COMPANIONS[id] || !state.companions?.[id]?.unlocked) return null;
    return { id, ...COMPANIONS[id], ...state.companions[id] };
  }

  function unlockCompanion(id, silent = false) {
    if (!state?.companions?.[id] || !COMPANIONS[id]) return;
    const entry = state.companions[id];
    const wasUnlocked = entry.unlocked;
    entry.unlocked = true;
    if (!state.team.active) state.team.active = id;
    if (!wasUnlocked && !silent) {
      addLog(`結識同伴「${COMPANIONS[id].name}」，可在同伴編成中選擇助陣。`);
      toast(`新同伴：${COMPANIONS[id].name}`);
      tone('level');
    }
  }

  function setActiveCompanion(id) {
    if (id === '') {
      state.team.active = null;
      addLog('目前未編成江湖同伴。');
    } else if (state.companions?.[id]?.unlocked && COMPANIONS[id]) {
      state.team.active = id;
      addLog(`已由「${COMPANIONS[id].name}」擔任助陣同伴。`);
      toast(`${COMPANIONS[id].name}已加入編成。`);
      tone('item');
    }
    renderHeroPanel();
    saveGame(false);
    openTeam();
  }

  function gainCompanionBond() {
    const companion = activeCompanion();
    if (!companion) return;
    const entry = state.companions[companion.id];
    entry.wins = (entry.wins || 0) + 1;
    const nextBond = Math.min(5, 1 + Math.floor(entry.wins / 2));
    if (nextBond > entry.bond) {
      entry.bond = nextBond;
      addLog(`與「${companion.name}」的羈絆提升至 ${nextBond} 級。`);
      toast(`羈絆提升：${companion.name} Lv.${nextBond}`);
    }
  }

  function addItem(itemId, quantity = 1) {
    state.inventory[itemId] = (state.inventory[itemId] || 0) + quantity;
    addLog(`取得「${ITEMS[itemId].name}」×${quantity}。`);
    toast(`取得：${ITEMS[itemId].name} ×${quantity}`);
    tone('item');
  }

  function consumeItem(itemId, inBattle = false) {
    if (!state.inventory[itemId]) {
      toast('行囊中沒有這項物品。');
      return false;
    }
    if (itemId === 'herb') {
      if (state.hero.hp >= state.hero.maxHp) { toast('目前氣血充盈，無須用藥。'); return false; }
      state.inventory[itemId] -= 1;
      state.hero.hp = clamp(state.hero.hp + 45, 0, state.hero.maxHp);
      addLog('使用金瘡藥，恢復 45 點氣血。');
    } else if (itemId === 'bun') {
      if (state.hero.hp >= state.hero.maxHp) { toast('目前並不飢餓。'); return false; }
      state.inventory[itemId] -= 1;
      state.hero.hp = clamp(state.hero.hp + 22, 0, state.hero.maxHp);
      addLog('吃下炊餅，恢復 22 點氣血。');
    } else if (itemId === 'wine') {
      state.inventory[itemId] -= 1;
      state.hero.sp = clamp(state.hero.sp + 12, 0, state.hero.maxSp);
      state.hero.drunk = clamp(state.hero.drunk + 1, 0, 5);
      addLog('飲下一壺村醪，豪氣上升，酒意漸濃。');
    } else {
      return false;
    }
    if (!inBattle) {
      renderGame();
      saveGame(false);
    }
    tone('item');
    return true;
  }

  function equipItem(itemId) {
    const item = ITEMS[itemId];
    if (!item || !state.inventory[itemId]) return;
    if (item.hero && item.hero !== state.activeHeroId) {
      toast(`這件裝備不適合${state.hero.name}使用。`);
      return;
    }
    if (item.type === 'weapon') state.equipment.weapon = itemId;
    if (item.type === 'armor') state.equipment.armor = itemId;
    addLog(`${state.hero.name}裝備「${item.name}」。`);
    tone('item');
    openInventory();
    renderHeroPanel();
    saveGame(false);
  }

  const SCENES = {
    manor_start: {
      location: 'manor', scene: 'manor', region: '滄州地界', name: '柴進莊', caption: '柴進莊・晨霧', speaker: '旁白',
      title: '異鄉客，將歸人',
      text: () => `武松因事離鄉，在小旋風柴進莊上盤桓多時。這日天光薄亮，庭中槐影搖動，你已收束行囊，決意回清河縣尋兄。<p>門外忽傳腳步，一位面帶風塵、目光沉著的漢子迎面而來。此人正是鄆城押司宋江。</p>`,
      choices: () => [
        { label: '上前施禮，與宋江敘話', action: () => goScene('manor_song') },
        { label: '先到演武場活動筋骨', action: () => { state.hero.sp = state.hero.maxSp; addLog('晨起練拳，豪氣已滿。'); goScene('manor_training'); } }
      ]
    },
    manor_training: {
      location: 'manor', scene: 'manor', region: '滄州地界', name: '柴進莊', caption: '莊前演武場', speaker: '武松',
      title: '拳腳未曾生疏',
      text: () => `你在青石場上走了幾趟拳路，拳風到處，塵葉旋飛。莊客們看得喝采。筋骨舒展後，方才那位鄆城押司仍在廊下等候。`,
      choices: () => [{ label: '收勢上前，與宋江相見', action: () => goScene('manor_song') }]
    },
    manor_song: {
      location: 'manor', scene: 'manor', region: '滄州地界', name: '柴進莊', caption: '柴進莊・廊下', speaker: '宋江',
      title: '一見如故',
      text: () => `宋江道：「久聞清河武二郎英雄了得，今日得見，果然氣宇不凡。江湖路遠，人心更險，兄弟此去還須珍重。」<p>兩人談及天下不平之事，竟如故交。臨別時，宋江取出一包金瘡藥，要你帶在身邊。</p>`,
      choices: () => [
        { label: '恭敬收下，銘記這番情義', action: () => { if (!state.flags.metSongJiang) { addItem('herb', 1); changeMorality(3, '敬重江湖情義'); } state.flags.metSongJiang = true; unlockCompanion('songjiang'); goScene('manor_depart'); } },
        { label: '婉謝藥物，只收下這份心意', action: () => { if (!state.flags.metSongJiang) changeMorality(5, '不貪朋友財物'); state.flags.metSongJiang = true; unlockCompanion('songjiang'); goScene('manor_depart'); } }
      ]
    },
    manor_depart: {
      location: 'manor', scene: 'manor', region: '滄州地界', name: '柴進莊', caption: '莊門古道', speaker: '旁白',
      title: '辭別莊院',
      text: () => `柴進與宋江送你到莊門。遠山沉在淡墨似的霧裡，通往陽谷的古道蜿蜒向南。你把哨棒往肩上一橫，踏出莊門。`,
      choices: () => [
        { label: '踏上陽谷驛道', action: () => { state.flags.leftManor = true; unlockCompanion('chaijin'); state.quests.main_jingyang.progress = '沿陽谷驛道南行'; goScene('road_first'); } },
        { label: '再查看一次人物與行囊', action: () => openCharacter() }
      ]
    },
    road_first: {
      location: 'road', scene: 'road', region: '河北山道', name: '陽谷驛道', caption: '古道・午時', speaker: '旁白',
      title: '山路上的呼救聲',
      text: () => `行至山坳，前方忽有車輪翻倒。一名老車夫跌坐路旁，三個剪徑小賊正拖走米袋。見你走近，其中兩人心虛逃入林中，只留一名惡漢提刀攔路。<p>老車夫急喊：「壯士，那是酒家施給窮戶的義米！」</p>`,
      choices: () => [
        { label: '挺身攔住山賊，奪回義米', action: () => { state.quests.side_rice.status = 'active'; state.quests.side_rice.progress = '擊退劫米山賊'; startBattle('bandit', 'bandit_win'); } },
        { label: '喝令山賊放下米袋，試以聲勢退敵', action: () => {
          const chance = 0.45 + state.hero.morality / 250;
          if (Math.random() < chance) {
            state.flags.roadBanditCleared = true;
            state.flags.riceQuestDone = true;
            state.quests.side_rice.status = 'completed';
            state.quests.side_rice.progress = '以威勢奪回義米';
            changeMorality(7, '不戰而救下老弱');
            addItem('riceSeal', 1);
            goScene('road_after_bandit');
          } else {
            toast('山賊惱羞成怒，拔刀撲來！');
            state.quests.side_rice.status = 'active';
            state.quests.side_rice.progress = '擊退劫米山賊';
            startBattle('bandit', 'bandit_win');
          }
        } },
        { label: '繞道而行，不涉此事（義氣下降）', action: () => { state.flags.roadBanditCleared = true; state.quests.side_rice.status = 'failed'; state.quests.side_rice.progress = '未能救回義米'; changeMorality(-8, '見弱者受欺而未出手'); goScene('road_after_bandit'); } }
      ]
    },
    road_after_bandit: {
      location: 'road', scene: 'road', region: '河北山道', name: '陽谷驛道', caption: '古道・斜陽', speaker: '老車夫',
      title: '路仍向南',
      text: () => state.flags.riceQuestDone
        ? `老車夫千恩萬謝，說這批義米原要送往岡下酒家，再分予附近窮戶。他送你兩個炊餅充飢。<p>夕陽斜照，遠處酒旗已在風中隱約可見。</p>`
        : `山路重新寂靜，只餘翻倒的車轍。你沒有回頭，遠處酒旗已在暮色裡隱約可見。`,
      choices: () => [{ label: '向岡下酒家趕路', action: () => { if (state.flags.riceQuestDone && !state.flags.reachedInn) addItem('bun', 2); state.flags.reachedInn = true; state.quests.main_jingyang.progress = '抵達「三碗不過岡」酒家'; goScene('inn_arrive'); } }]
    },
    inn_arrive: {
      location: 'inn', scene: 'inn', region: '景陽岡下', name: '三碗不過岡', caption: '酒旗・暮色', speaker: '酒家',
      title: '透瓶香，出門倒',
      text: () => `門前酒旗寫著五個大字：「三碗不過岡」。店家端上熟牛肉，又篩一碗烈酒，說道：「俺這酒喚作透瓶香，又叫出門倒。客官飲三碗便休，岡上近來有大蟲傷人。」<p>${state.flags.riceQuestDone ? '老車夫隨後送到義米，店家得知是你相救，感激不已。' : '店家眉間帶愁，似乎還在等一批遲遲未到的米糧。'}</p>`,
      choices: () => [
        { label: '先吃牛肉，飲第一碗酒', action: () => drinkAtInn(1) },
        { label: '詢問景陽岡大蟲之事', action: () => goScene('inn_warning') },
        { label: '滴酒不沾，趁天未黑立即上岡', action: () => { state.flags.enteredForest = true; goScene('forest_notice'); } }
      ]
    },
    inn_drink: {
      location: 'inn', scene: 'inn', region: '景陽岡下', name: '三碗不過岡', caption: '酒家・燈火', speaker: '武松',
      title: '好酒！',
      text: () => `烈酒落肚，如一團火直燒胸臆。你把空碗往桌上一放，笑道：「這酒倒有些力氣！」<p>目前已飲 <strong>${state.flags.drankAtInn}</strong> 碗。酒意能提高暴擊機會，卻也會稍減命中。</p>`,
      choices: () => {
        const choices = [];
        if (state.flags.drankAtInn < 3) choices.push({ label: `再飲一碗（第 ${state.flags.drankAtInn + 1} 碗）`, action: () => drinkAtInn(1) });
        if (state.flags.drankAtInn >= 3 && state.flags.drankAtInn < 5) choices.push({ label: '店家不肯再篩？拿銀子叫他再來一碗', disabled: state.hero.silver < 3, action: () => { state.hero.silver -= 3; drinkAtInn(1); } });
        choices.push({ label: '吃些牛肉，詢問岡上大蟲', action: () => goScene('inn_warning') });
        choices.push({ label: '酒足肉飽，提棒上岡', action: () => { state.flags.enteredForest = true; state.quests.main_jingyang.progress = '夜入景陽岡'; goScene('forest_notice'); } });
        return choices;
      }
    },
    inn_warning: {
      location: 'inn', scene: 'inn', region: '景陽岡下', name: '三碗不過岡', caption: '酒家・暮鼓', speaker: '酒家',
      title: '不是我留你歇宿',
      text: () => `店家指向牆上官府告示：「近來岡上一隻吊睛白額大蟲，已傷了二三十條性命。如今客商須結伴於巳、午、未三個時辰過岡。天色已晚，客官明日再走。」<p>你望向窗外，山色已沉，風穿過酒旗獵獵作響。</p>`,
      choices: () => [
        { label: '信他一回，在酒家歇到天明（氣血全復）', action: () => { state.hero.hp = state.hero.maxHp; state.hero.sp = state.hero.maxSp; state.hero.drunk = Math.max(0, state.hero.drunk - 1); addLog('在酒家歇宿一夜，氣血與豪氣盡復。'); state.flags.enteredForest = true; goScene('forest_notice'); } },
        { label: '莫把好心當歹意，我偏要今夜過岡', action: () => { state.flags.enteredForest = true; state.quests.main_jingyang.progress = '夜入景陽岡'; goScene('forest_notice'); } },
        { label: '再回桌邊飲酒壯膽', action: () => drinkAtInn(1) }
      ]
    },
    forest_notice: {
      location: 'forest', scene: 'forest', region: '亂樹深山', name: '景陽岡', caption: '岡口・古松', speaker: '旁白',
      title: '官司榜文',
      text: () => `走不到半里，枯樹上果真釘著陽谷縣告示，所言與酒家無異。山風捲著枯葉，林間已不見半個行人。<p>${state.flags.readNotice ? '榜文上的硃印在暮色中格外醒目。' : '此刻回頭尚不算遲；再往前，便只有一條山路。'}</p>`,
      choices: () => [
        { label: '細讀告示，記下猛虎出沒時辰', action: () => { if (!state.flags.readNotice) { state.flags.readNotice = true; state.hero.sp = clamp(state.hero.sp + 6, 0, state.hero.maxSp); addLog('讀過告示，了解猛虎習性，豪氣 +6。'); } goScene('forest_tracks'); } },
        { label: '大踏步上岡，不作回頭想', action: () => goScene('forest_tracks') },
        { label: '回酒家補給', action: () => goScene('inn_arrive') }
      ]
    },
    forest_tracks: {
      location: 'forest', scene: 'forest', region: '亂樹深山', name: '景陽岡', caption: '密林・獸徑', speaker: '旁白',
      title: '草叢裡的痕跡',
      text: () => `月色從樹梢漏下，泥地上赫然留著碗口大的獸爪印。前方草莖折伏，隱約有腥氣隨風而來。路旁石縫裡生著一叢止血草。`,
      choices: () => [
        { label: '採下止血草，製成簡易金瘡藥', action: () => { if (!state.flags.foundHerb) { state.flags.foundHerb = true; addItem('herb', 1); } goScene('temple_rest'); } },
        { label: '握緊哨棒，沿獸跡追查', action: () => { state.hero.sp = clamp(state.hero.sp + 4, 0, state.hero.maxSp); goScene('temple_rest'); } }
      ]
    },
    temple_rest: {
      location: 'forest', scene: 'temple', region: '景陽岡上', name: '破山神廟', caption: '山神廟・月下', speaker: '武松',
      title: '石上小歇',
      text: () => `前方一座破敗山神廟，廟前橫著青石。酒力與趕路的疲乏一齊湧上，你把哨棒靠在身側，抬頭看見樹影忽地一沉。<p>遠處傳來一聲低吼，山谷回音如雷。</p>`,
      choices: () => [
        { label: '坐下調息片刻（恢復 18 氣血與 8 豪氣）', action: () => { if (!state.flags.restedTemple) { state.flags.restedTemple = true; state.hero.hp = clamp(state.hero.hp + 18, 0, state.hero.maxHp); state.hero.sp = clamp(state.hero.sp + 8, 0, state.hero.maxSp); addLog('在山神廟前調息，恢復氣血與豪氣。'); } goScene('tiger_appears'); } },
        { label: '不敢鬆懈，持棒戒備', action: () => { state.hero.sp = clamp(state.hero.sp + 5, 0, state.hero.maxSp); goScene('tiger_appears'); } }
      ]
    },
    tiger_appears: {
      location: 'forest', scene: 'forest', region: '景陽岡上', name: '景陽岡', caption: '亂林・虎嘯', speaker: '旁白',
      title: '吊睛白額大蟲',
      text: () => `一陣狂風過處，亂樹背後躍出一隻斑斕猛虎！額上白紋如霜，兩眼似燈。那大蟲把前爪按地，長尾倒豎，震得枯葉四散。<p>你酒已化作膽，雙手握住哨棒，喝道：「畜生，來得正好！」</p>`,
      choices: () => [{ label: '迎戰景陽岡猛虎', action: () => startBattle('tiger', 'tiger_win') }]
    },
    tiger_fallen: {
      location: 'forest', scene: 'forest', region: '景陽岡上', name: '景陽岡', caption: '岡頂・月明', speaker: '旁白',
      title: '虎伏英雄在',
      text: () => `猛虎終於伏在亂葉之中，再不動彈。你的哨棒早已折斷，雙拳也染著血。四野寂靜片刻，旋即傳來獵戶們驚疑的呼喊。<p>眾人認出死虎，無不拜伏，簇擁你下岡往陽谷縣報功。</p>`,
      choices: () => [{ label: '隨獵戶前往陽谷縣', action: () => { state.flags.reachedCounty = true; state.quests.main_jingyang.progress = '到陽谷縣領受官府賞賜'; goScene('county_reward'); } }]
    },
    county_reward: {
      location: 'county', scene: 'county', region: '山東地界', name: '陽谷縣', caption: '縣衙・鼓樂', speaker: '陽谷知縣',
      title: '打虎英雄',
      text: () => `陽谷知縣驗過虎屍，當堂讚道：「一縣百姓苦此大蟲久矣，今日幸得壯士除害！」遂命人披紅掛彩，抬你遊街，百姓爭相觀看。<p>官府賞下五十兩銀子。那些被虎所害的人家立在衙外，你可以決定如何處置這筆賞銀。</p>`,
      choices: () => [
        { label: '把賞銀分給受害百姓（義氣大增）', action: () => { changeMorality(15, '將打虎賞銀周濟苦主'); state.hero.silver += 10; finishChapter('你只留下十兩盤纏，其餘盡數分予苦主。'); } },
        { label: '收下全部五十兩，作為日後行走江湖之資', action: () => { state.hero.silver += 50; changeMorality(2, '除去猛虎本已是救民之舉'); finishChapter('你收下官府賞銀，準備在陽谷縣尋訪兄長。'); } }
      ]
    },
    chapter_end: {
      location: 'county', scene: 'county', region: '山東地界', name: '陽谷縣', caption: '陽谷街市・新章將啟', speaker: '章回評語',
      title: '第一回完：景陽岡武松打虎',
      text: () => `${state.flags.endText || '英雄過岡除猛虎，豪傑入縣動人心。'}<p>第一回已完成。你可以整備同伴與裝備，或轉入平行章回，前往渭州操控魯提轄，親歷「拳打鎮關西」。</p>`,
      choices: () => [
        { label: state.flags.chapter2Started ? '續讀第二回：拳打鎮關西' : '開啟第二回：拳打鎮關西', action: () => startChapterTwo() },
        { label: '查看第一回成果', action: () => openSummary() },
        { label: '重遊陽谷縣街市', action: () => goScene('county_free') },
        { label: '回到遊戲標題', action: () => { saveGame(); showTitle(); } }
      ]
    },
    county_free: {
      location: 'county', scene: 'county', region: '山東地界', name: '陽谷縣', caption: '陽谷街市', speaker: '旁白',
      title: '英雄名滿陽谷',
      text: () => `街市上人人都識得打虎武松。賣炊餅的、打鐵的、跑堂的紛紛向你招呼。縣衙旁新設演武擂臺，正可帶上江湖同伴磨合招式。${state.flags.chapter2Complete ? '<p>另一邊，魯智深也已在五臺山落髮。兩位英雄的章回如今可自由切換。</p>' : '<p>說書人口中，渭州還有一位性烈如火的魯提轄，另一段不平事正待揭開。</p>'}`,
      choices: () => {
        const choices = [
          { label: '前往陽谷擂臺切磋（可重複挑戰）', action: () => startBattle('arena', 'arena_win') },
          { label: '調整江湖同伴編成', action: () => openTeam() },
          { label: '在市集買一個炊餅（8 兩）', disabled: state.hero.silver < 8, action: () => { state.hero.silver -= 8; addItem('bun', 1); renderGame(); } },
          { label: '到縣衙演武場調息', action: () => { state.hero.hp = state.hero.maxHp; state.hero.sp = state.hero.maxSp; addLog('在縣衙演武場調息，狀態全復。'); renderGame(); } }
        ];
        choices.push(state.flags.chapter2Complete
          ? { label: '切換英雄章回', action: () => openRoster() }
          : { label: state.flags.chapter2Started ? '返回第二回進度' : '開啟第二回：拳打鎮關西', action: () => startChapterTwo() });
        choices.push({ label: '查看第一回成果', action: () => openSummary() });
        return choices;
      }
    },
    weizhou_tavern: {
      location: 'weizhou', scene: 'tavern', region: '關西重鎮', name: '渭州城・潘家酒樓', caption: '潘家酒樓・午牌', speaker: '旁白',
      title: '九紋龍重逢魯提轄',
      text: () => `渭州經略府提轄魯達，生得面圓耳大、鼻直口方，性情如烈火。這日你在街上撞見九紋龍史進，又邀打虎將李忠同到潘家酒樓飲酒。<p>三人正說拳棒，隔壁忽傳來女子低泣，琵琶聲也戛然而止。你把酒盞往桌上一頓：「酒樓裡誰敢欺負良善？」</p>`,
      choices: () => [{ label: '喚唱曲女子前來問話', action: () => { state.flags.metShiJin = true; unlockCompanion('shijin'); state.quests.main_zhengguan.progress = '查問酒樓哭聲'; goScene('jin_story'); } }]
    },
    jin_story: {
      location: 'weizhou', scene: 'tavern', region: '關西重鎮', name: '渭州城・潘家酒樓', caption: '酒樓雅間・哭聲', speaker: '金翠蓮',
      title: '強媒硬保，身陷渭州',
      text: () => `女子自稱金翠蓮，與老父投親不遇，盤纏用盡。狀元橋下賣肉的鄭屠號稱「鎮關西」，強要她作妾；大娘妒恨，又把父女趕出門，仍追討所謂身價錢。<p>史進聽得咬牙，李忠也默然。你胸中無明業火早已直衝頂門。</p>`,
      choices: () => [
        { label: '取十五兩銀子相助，明早護送父女出城', disabled: state.hero.silver < 15, action: () => { state.hero.silver -= 15; state.flags.heardJinStory = true; changeMorality(10, '傾囊救助金氏父女'); state.quests.main_zhengguan.progress = '明早護送金氏父女離開投店'; goScene('jin_plan'); } },
        { label: '先承諾出手，再向史進湊足盤纏', action: () => { state.flags.heardJinStory = true; changeMorality(6, '為受欺者主持公道'); state.quests.main_zhengguan.progress = '明早護送金氏父女離開投店'; goScene('jin_plan'); } }
      ]
    },
    jin_plan: {
      location: 'weizhou', scene: 'street', region: '關西重鎮', name: '渭州城', caption: '長街・夜色', speaker: '魯達',
      title: '明日放人，後日算帳',
      text: () => `你把銀兩交給金老，喝道：「明日天一亮便走，洒家自會來擋住店家。鄭屠那廝，待你父女走遠後再與他理會！」<p>次日五更，你趕到金氏父女寄住的投店。店小二果然攔門索錢，幾名惡僕提棍圍了上來。</p>`,
      choices: () => [
        { label: '掀翻長凳，痛打攔路惡僕', action: () => startBattle('innThugs', 'inn_thugs_win') },
        { label: '怒喝店家放人，試以威勢壓服', action: () => {
          const chance = 0.42 + state.hero.morality / 220 + state.hero.level * 0.025;
          if (Math.random() < chance) {
            state.flags.innThugsDefeated = true;
            changeMorality(4, '不傷人而護送父女脫身');
            goScene('jin_departed');
          } else {
            toast('惡僕仗著人多，提棍撲來！');
            startBattle('innThugs', 'inn_thugs_win');
          }
        } }
      ]
    },
    jin_departed: {
      location: 'weizhou', scene: 'gate', region: '關西重鎮', name: '渭州城・東門', caption: '城門・曉霧', speaker: '金老',
      title: '父女出城',
      text: () => `金氏父女挑著簡單行李，趁曉霧出了城。金翠蓮把一支銀釵留作信物，含淚拜謝。你在店門口又坐了兩個時辰，直到確信追兵再也趕不上，才起身往狀元橋而去。`,
      choices: () => [{ label: '收下信物，前往狀元橋肉案', action: () => { if (!state.flags.jinFamilySaved) addItem('jinHairpin', 1); state.flags.jinFamilySaved = true; state.flags.reachedButcherStall = true; state.quests.main_zhengguan.progress = '到狀元橋尋鎮關西鄭屠'; goScene('butcher_stall'); } }]
    },
    butcher_stall: {
      location: 'market', scene: 'market', region: '渭州東市', name: '狀元橋肉案', caption: '肉案・人聲鼎沸', speaker: '旁白',
      title: '消遣鄭屠',
      text: () => {
        const stages = [
          '鄭屠見你穿著提轄官衣，連忙堆笑迎上。你不立即發作，只用手指敲著肉案。',
          '十斤精肉已細細切成臊子，不能見半點筋頭。鄭屠額上開始冒汗。',
          '又十斤肥肉切成臊子，不能帶半點精肉。圍觀百姓越聚越多。',
          '再來十斤軟骨，也要細細剁碎，不能見一點肉。鄭屠終於明白你是來消遣他的。'
        ];
        return `${stages[Math.min(3, state.flags.butcherOrders || 0)]}<p>每完成一道刁鑽肉單，都會消耗鄭屠的體力，使接下來的首領戰較為有利。</p>`;
      },
      choices: () => {
        const n = state.flags.butcherOrders || 0;
        if (n === 0) return [{ label: '要十斤精肉，細切作臊子，不許帶半點筋頭', action: () => { state.flags.butcherOrders = 1; addLog('鄭屠親自切了十斤精肉臊子。'); renderGame(); } }];
        if (n === 1) return [{ label: '再要十斤肥肉，不許夾帶半點精肉', action: () => { state.flags.butcherOrders = 2; addLog('鄭屠忍氣又切十斤肥肉臊子。'); renderGame(); } }, { label: '不再消遣，直接問罪', action: () => beginZhengBattle() }];
        if (n === 2) return [{ label: '再要十斤軟骨，不能見一點肉末', action: () => { state.flags.butcherOrders = 3; addLog('鄭屠剁骨至雙臂酸麻。'); renderGame(); } }, { label: '已足夠，拍案問罪', action: () => beginZhengBattle() }];
        return [{ label: '把兩包臊子劈面擲去，喝問金氏父女之事', action: () => beginZhengBattle() }];
      }
    },
    zheng_fallen: {
      location: 'market', scene: 'market', region: '渭州東市', name: '狀元橋肉案', caption: '長街・眾人屏息', speaker: '旁白',
      title: '三拳之後',
      text: () => `第一拳打得鮮血迸流，第二拳打得眼稜縫裂，第三拳落下，鄭屠倒在肉案旁再無聲息。你伸手一探，心知鬧出了人命。<p>街坊百姓既驚且快，官差的銅鑼聲卻已從遠處傳來。</p>`,
      choices: () => [
        { label: '故意喝罵「這廝詐死」，從容抽身', action: () => { changeMorality(3, '懲惡後不牽連無辜街坊'); goScene('weizhou_escape'); } },
        { label: '確認金氏父女已遠走，再由小巷離城', action: () => goScene('weizhou_escape') }
      ]
    },
    weizhou_escape: {
      location: 'weizhou', scene: 'gate', region: '關西重鎮', name: '渭州城・北門', caption: '北門・暮煙', speaker: '旁白',
      title: '提轄亡命',
      text: () => `你回住處匆匆捲了衣服盤纏，趁官府尚未封門，自北門大踏步出城。身後榜文遍貼，從此「魯提轄」三字成了官府追拿的名字。<p>輾轉多日，你遇見舊識趙員外。員外勸你上五臺山落髮，暫避風頭。</p>`,
      choices: () => [{ label: '隨趙員外上五臺山', action: () => { state.flags.escapedWeizhou = true; state.flags.wutaiReached = true; state.quests.main_zhengguan.progress = '前往五臺山剃度避禍'; goScene('wutai_gate'); } }]
    },
    wutai_gate: {
      location: 'wutai', scene: 'temple', region: '清涼佛地', name: '五臺山文殊院', caption: '山門・鐘聲', speaker: '智真長老',
      title: '靈光一點，價值千金',
      text: () => `五臺山雲氣繚繞，鐘聲穿林。智真長老端詳你良久，道：「此人上應天星，心地雖直，殺氣太重；若肯收束，日後正果可期。」<p>長老親自為你剃度，取法名「智深」，偈中有云：靈光一點，價值千金；佛法廣大，賜名智深。</p>`,
      choices: () => [{ label: '受戒領度牒，從此名為魯智深', action: () => finishChapterTwo() }]
    },
    chapter2_end: {
      location: 'wutai', scene: 'temple', region: '清涼佛地', name: '五臺山文殊院', caption: '禪房・新名初立', speaker: '章回評語',
      title: '第二回完：魯提轄拳打鎮關西',
      text: () => `提轄三拳伸正義，五臺落髮號智深。<p>第二回完成後，武松與魯智深均已列入英雄譜，可在「英雄」功能中自由切換。史進也已成為新的助陣同伴。</p>`,
      choices: () => [
        { label: '查看兩回總成果', action: () => openSummary() },
        { label: '留在五臺山整備', action: () => goScene('wutai_free') },
        { label: '開啟英雄譜切換主角', action: () => openRoster() },
        { label: '回到遊戲標題', action: () => { saveGame(); showTitle(); } }
      ]
    },
    wutai_free: {
      location: 'wutai', scene: 'temple', region: '清涼佛地', name: '五臺山文殊院', caption: '演武坪・松風', speaker: '旁白',
      title: '花和尚初習禪杖',
      text: () => `魯智深雖披僧衣，豪氣未減。寺後演武坪可重溫棍棒招式；山門外亦有來往香客傳遞各地消息。完成兩回後，你可隨時切換英雄，分別回到陽谷縣或五臺山。`,
      choices: () => [
        { label: '到演武坪與渭州棒師切磋', action: () => startBattle('weizhouArena', 'weizhou_arena_win') },
        { label: '調整江湖同伴編成', action: () => openTeam() },
        { label: '在禪房休息，恢復全部狀態', action: () => { state.hero.hp = state.hero.maxHp; state.hero.sp = state.hero.maxSp; state.hero.drunk = 0; addLog('在五臺山禪房休息，狀態全復。'); renderGame(); } },
        { label: '切換英雄章回', action: () => openRoster() },
        { label: '查看兩回總成果', action: () => openSummary() }
      ]
    },
    weizhou_free: {
      location: 'weizhou', scene: 'street', region: '關西重鎮', name: '渭州城', caption: '渭州舊事・章回追憶', speaker: '說書人',
      title: '狀元橋舊事',
      text: () => `說書人拍響醒木，講的正是魯提轄救金氏、三拳打死鎮關西的舊事。此處可重返演武場切磋，但已完成的鄭屠首領戰不會重置。`,
      choices: () => [
        { label: '到經略府演武場切磋', action: () => startBattle('weizhouArena', 'weizhou_arena_win') },
        { label: '返回五臺山', action: () => goScene('wutai_free') },
        { label: '切換英雄章回', action: () => openRoster() }
      ]
    }

  };

  function drinkAtInn(amount) {
    state.flags.drankAtInn += amount;
    state.hero.drunk = clamp(state.hero.drunk + amount, 0, 5);
    state.hero.sp = clamp(state.hero.sp + 5 * amount, 0, state.hero.maxSp);
    addLog(`在岡下酒家飲酒，酒意升至 ${state.hero.drunk}。`);
    tone('drink');
    goScene('inn_drink');
  }

  function beginZhengBattle() {
    startBattle('zhengtu', 'zheng_win');
    if (!state.battle) return;
    const fatigue = clamp(state.flags.butcherOrders || 0, 0, 3);
    state.battle.hp = Math.max(120, state.battle.hp - fatigue * 12);
    state.battle.attack = Math.max(20, state.battle.attack - fatigue * 2);
    state.battle.message = fatigue
      ? `鄭屠切肉剁骨已耗去不少力氣，但仍抄起尖刀撲來！（疲勞 ${fatigue} 層）`
      : '鄭屠怒吼一聲，抄起剔骨尖刀撲來！';
    renderBattle();
  }

  function finishChapter(endText) {
    state.flags.endText = endText;
    state.flags.gameComplete = true;
    state.quests.main_jingyang.status = 'completed';
    state.quests.main_jingyang.progress = '景陽岡打虎，名震陽谷';
    addItem('tigerToken', 1);
    if (!state.inventory.tigerStaff) addItem('tigerStaff', 1);
    gainXp(45);
    goScene('chapter_end');
    saveGame(false);
  }

  function goScene(sceneId) {
    if (!SCENES[sceneId]) return;
    state.sceneId = sceneId;
    const scene = SCENES[sceneId];
    state.location = scene.location;
    addLog(`抵達：${scene.name}｜${scene.title}`);
    renderGame();
    saveGame(false);
  }

  function renderGame() {
    if (currentScreen !== 'game' || !state) return;
    renderHeroPanel();
    renderScene();
    renderLog();
  }

  function renderHeroPanel() {
    if (!$('[data-role="hero-name"]')) return;
    const stats = getStats();
    const hpPercent = state.hero.maxHp ? (state.hero.hp / state.hero.maxHp) * 100 : 0;
    const spPercent = state.hero.maxSp ? (state.hero.sp / state.hero.maxSp) * 100 : 0;
    const xpPercent = state.hero.nextXp ? (state.hero.xp / state.hero.nextXp) * 100 : 0;
    $('[data-role="portrait"]').textContent = state.hero.avatar || (state.activeHeroId === 'luzhishen' ? '魯' : '武');
    $('[data-role="hero-name"]').textContent = state.hero.name;
    $('[data-role="hero-title"]').textContent = state.hero.title;
    $('[data-role="chapter-label"]').textContent = `第 ${state.chapter} 回`;
    $('[data-role="hp-text"]').textContent = `${Math.ceil(state.hero.hp)} / ${state.hero.maxHp}`;
    $('[data-role="sp-text"]').textContent = `${state.hero.sp} / ${state.hero.maxSp}`;
    $('[data-role="xp-text"]').textContent = `${state.hero.xp} / ${state.hero.nextXp}`;
    $('[data-role="hp-bar"]').style.width = `${hpPercent}%`;
    $('[data-role="sp-bar"]').style.width = `${spPercent}%`;
    $('[data-role="xp-bar"]').style.width = `${xpPercent}%`;
    $('[data-role="level"]').textContent = state.hero.level;
    $('[data-role="attack"]').textContent = stats.attack;
    $('[data-role="defense"]').textContent = stats.defense;
    $('[data-role="morality"]').textContent = state.hero.morality;
    $('[data-role="silver"]').textContent = `${state.hero.silver} 兩`;
    $('[data-role="drunk"]').textContent = `${state.hero.drunk} / 5`;
    const companion = activeCompanion();
    $('[data-role="companion-avatar"]').textContent = companion?.avatar || '義';
    $('[data-role="companion-name"]').textContent = companion ? companion.name : '尚未編成';
    $('[data-role="companion-bond"]').textContent = companion ? `羈絆 ${companion.bond}/5` : '羈絆－';
  }

  function renderScene() {
    const scene = SCENES[state.sceneId] || SCENES.manor_start;
    $('[data-role="location-region"]').textContent = scene.region;
    $('[data-role="location-name"]').textContent = scene.name;
    $('[data-role="scene-caption"]').textContent = scene.caption;
    $('[data-role="scene-visual"]').dataset.scene = scene.scene;
    $('[data-role="speaker"]').textContent = scene.speaker;
    $('[data-role="story-title"]').textContent = scene.title;
    $('[data-role="story-text"]').innerHTML = typeof scene.text === 'function' ? scene.text() : scene.text;
    const choicesRoot = $('[data-role="choices"]');
    choicesRoot.replaceChildren();
    const choices = typeof scene.choices === 'function' ? scene.choices() : scene.choices;
    choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = choice.label;
      button.disabled = Boolean(choice.disabled);
      button.dataset.choiceIndex = String(index);
      button.addEventListener('click', () => {
        if (button.disabled) return;
        choice.action();
      });
      choicesRoot.append(button);
    });
    const readButton = $('[data-action="read-current-scene"]');
    if (readButton) {
      readButton.disabled = !supportsSpeech();
      readButton.title = supportsSpeech() ? '朗讀目前章回內容' : '此瀏覽器不支援語音播報';
    }
    if (prefs.narration && prefs.narrateScenes && state.sceneId !== lastNarratedSceneId) {
      lastNarratedSceneId = state.sceneId;
      speakCurrentScene();
    }
  }

  function renderLog() {
    const root = $('[data-role="log"]');
    if (!root) return;
    root.replaceChildren();
    (state.log || []).slice(0, 14).forEach(entry => {
      const p = document.createElement('p');
      p.textContent = entry;
      root.append(p);
    });
  }

  function startBattle(enemyId, afterWin) {
    const source = ENEMIES[enemyId];
    if (!source) return;
    state.battle = {
      enemyId,
      name: source.name,
      title: source.title,
      avatar: source.avatar,
      hp: source.maxHp,
      maxHp: source.maxHp,
      attack: source.attack,
      defense: source.defense,
      xp: source.xp,
      silver: source.silver,
      canFlee: source.canFlee,
      moves: source.moves,
      afterWin,
      turn: 1,
      supportUsed: false,
      protectionTurns: 0,
      message: `${source.name}擋住去路！`
    };
    state.hero.guarding = false;
    battleLocked = false;
    lastNarratedBattleKey = '';
    renderBattle();
    tone('battle');
  }

  function renderBattle() {
    if (!state.battle) return;
    let overlay = $('.battle-overlay');
    if (!overlay) {
      document.body.append($('#battleTemplate').content.cloneNode(true));
      overlay = $('.battle-overlay');
    }
    const b = state.battle;
    $('[data-role="enemy-avatar"]', overlay).textContent = b.avatar;
    $('[data-role="enemy-name"]', overlay).textContent = b.name;
    $('[data-role="enemy-title"]', overlay).textContent = b.title;
    $('[data-role="enemy-hp-text"]', overlay).textContent = `${Math.max(0, Math.ceil(b.hp))} / ${b.maxHp}`;
    $('[data-role="enemy-hp-bar"]', overlay).style.width = `${clamp((b.hp / b.maxHp) * 100, 0, 100)}%`;
    $('[data-role="battle-hero-avatar"]', overlay).textContent = state.hero.avatar || (state.activeHeroId === 'luzhishen' ? '魯' : '武');
    $('[data-role="battle-hero-name"]', overlay).textContent = state.hero.name;
    $('[data-role="battle-hero-hp-text"]', overlay).textContent = `${Math.max(0, Math.ceil(state.hero.hp))} / ${state.hero.maxHp}`;
    $('[data-role="battle-hero-hp-bar"]', overlay).style.width = `${clamp((state.hero.hp / state.hero.maxHp) * 100, 0, 100)}%`;
    const companion = activeCompanion();
    const companionPanel = $('[data-role="battle-companion"]', overlay);
    if (companion) {
      companionPanel.classList.remove('hidden');
      $('[data-role="battle-companion-avatar"]', overlay).textContent = companion.avatar;
      $('[data-role="battle-companion-name"]', overlay).textContent = `${companion.name}｜羈絆 ${companion.bond}`;
    } else {
      companionPanel.classList.add('hidden');
    }
    $('[data-role="battle-message"]', overlay).innerHTML = `<strong>第 ${b.turn} 合</strong>｜${b.message}`;
    const battleNarrationKey = `${b.turn}|${b.message}`;
    if (prefs.narration && prefs.narrateBattle && battleNarrationKey !== lastNarratedBattleKey) {
      lastNarratedBattleKey = battleNarrationKey;
      speakText(`第 ${b.turn} 合。${b.message}`, { interrupt: true });
    }

    const actions = $('[data-role="battle-actions"]', overlay);
    actions.replaceChildren();
    const heroSkillButtons = state.activeHeroId === 'luzhishen'
      ? [
          { label: '禪杖橫掃－8 豪氣', disabled: state.hero.sp < 8, action: () => heroBattleAction('staffSweep') },
          { label: '金剛怒喝－12 豪氣', disabled: state.hero.sp < 12, action: () => heroBattleAction('vajraRoar') }
        ]
      : [
          { label: '鴛鴦連環腿－8 豪氣', disabled: state.hero.sp < 8, action: () => heroBattleAction('kick') },
          { label: '醉拳破勢－12 豪氣', disabled: state.hero.sp < 12 || state.hero.drunk < 1, action: () => heroBattleAction('drunken') }
        ];
    const buttons = [
      { label: '普通攻擊', action: () => heroBattleAction('attack') },
      ...heroSkillButtons,
      { label: '架勢防禦', action: () => heroBattleAction('guard') },
      { label: `金瘡藥 ×${state.inventory.herb || 0}`, disabled: !state.inventory.herb, action: () => heroBattleAction('item') },
      { label: companion ? `${companion.skillName}${b.supportUsed ? '（已用）' : ''}` : '同伴援護（未編成）', disabled: !companion || b.supportUsed, action: () => heroBattleAction('support') },
      { label: '退走', disabled: !b.canFlee, action: () => heroBattleAction('flee') }
    ];
    buttons.forEach(spec => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = spec.label;
      button.disabled = Boolean(spec.disabled) || battleLocked;
      button.addEventListener('click', spec.action);
      actions.append(button);
    });
  }

  function heroBattleAction(type) {
    if (battleLocked || !state.battle) return;
    const b = state.battle;
    battleLocked = true;
    state.hero.guarding = false;
    const stats = getStats();
    let message = '';

    if (type === 'attack') {
      const accuracy = clamp(0.94 - state.hero.drunk * 0.035, 0.72, 0.96);
      if (Math.random() > accuracy) {
        message = '你一棒掃空，敵手趁勢後退。';
        tone('miss');
      } else {
        const critChance = 0.1 + state.hero.drunk * 0.055;
        const crit = Math.random() < critChance;
        const raw = stats.attack + randomInt(2, 7) - b.defense * 0.48;
        const damage = Math.max(4, Math.round(raw * (crit ? 1.75 : 1)));
        b.hp -= damage;
        state.hero.sp = clamp(state.hero.sp + 4, 0, state.hero.maxSp);
        message = crit ? `酒壯拳威！你擊中要害，造成 ${damage} 點重創。` : `你沉肩進步，一擊造成 ${damage} 點傷害。`;
        tone(crit ? 'critical' : 'hit');
      }
    }

    if (type === 'kick') {
      state.hero.sp -= 8;
      let total = 0;
      for (let i = 0; i < 2; i += 1) {
        total += Math.max(3, Math.round(stats.attack * 0.62 + randomInt(1, 5) - b.defense * 0.32));
      }
      b.hp -= total;
      message = `鴛鴦腿左右連發，兩擊共造成 ${total} 點傷害。`;
      tone('skill');
    }

    if (type === 'drunken') {
      state.hero.sp -= 12;
      const multiplier = 1.35 + state.hero.drunk * 0.13;
      const damage = Math.max(8, Math.round((stats.attack + randomInt(5, 12)) * multiplier - b.defense * 0.35));
      b.hp -= damage;
      message = `你步似踉蹌、拳藏後著，「醉拳破勢」造成 ${damage} 點傷害！`;
      tone('critical');
    }

    if (type === 'staffSweep') {
      state.hero.sp -= 8;
      const damage = Math.max(8, Math.round((stats.attack + randomInt(5, 10)) * 1.28 - b.defense * 0.38));
      b.hp -= damage;
      b.attack = Math.max(8, b.attack - 2);
      message = `你掄動鐵棍橫掃肉案，造成 ${damage} 點傷害，並削弱敵手武力。`;
      tone('skill');
    }

    if (type === 'vajraRoar') {
      state.hero.sp -= 12;
      const damage = Math.max(10, Math.round((stats.attack + randomInt(7, 13)) * 1.12 - b.defense * 0.3));
      b.hp -= damage;
      const stunned = Math.random() < clamp(0.32 + state.hero.level * 0.025, 0.34, 0.55);
      if (stunned) b.stunned = 1;
      message = `你聲若霹靂，施展「金剛怒喝」造成 ${damage} 點傷害！${stunned ? '敵手心膽俱裂，下一回合無法行動。' : ''}`;
      tone(stunned ? 'critical' : 'skill');
    }

    if (type === 'guard') {
      state.hero.guarding = true;
      state.hero.sp = clamp(state.hero.sp + 7, 0, state.hero.maxSp);
      message = '你穩住下盤，橫棒護身；本回合所受傷害大幅降低。';
      tone('guard');
    }

    if (type === 'item') {
      const used = consumeItem('herb', true);
      if (!used) { battleLocked = false; renderBattle(); return; }
      message = '你迅速敷上金瘡藥，恢復 45 點氣血。';
    }

    if (type === 'support') {
      const companion = activeCompanion();
      if (!companion || b.supportUsed) { battleLocked = false; renderBattle(); return; }
      b.supportUsed = true;
      if (companion.id === 'songjiang') {
        const heal = 24 + companion.bond * 6;
        const spirit = 6 + companion.bond * 2;
        state.hero.hp = clamp(state.hero.hp + heal, 0, state.hero.maxHp);
        state.hero.sp = clamp(state.hero.sp + spirit, 0, state.hero.maxSp);
        message = `宋江送來及時援護，你恢復 ${heal} 點氣血與 ${spirit} 點豪氣。`;
      } else if (companion.id === 'chaijin') {
        b.protectionTurns = 2;
        message = `柴進以丹書人脈護持，接下來兩次所受傷害將大幅降低。`;
      } else if (companion.id === 'shijin') {
        const damage = 24 + companion.bond * 9 + randomInt(0, 8);
        b.hp -= damage;
        message = `史進挺起三尖兩刃刀突入戰圈，九紋龍突擊造成 ${damage} 點傷害。`;
      }
      tone('level');
    }

    if (type === 'flee') {
      const success = Math.random() < 0.55;
      if (success) {
        message = '你虛晃一招，帶著行囊退出戰圈。';
        b.message = message;
        renderBattle();
        setTimeout(() => endBattleFlee(), 550);
        return;
      }
      message = '退路被截斷，未能脫身！';
    }

    b.message = message;
    renderBattle();
    if (b.hp <= 0) {
      setTimeout(() => winBattle(), 550);
      return;
    }
    setTimeout(enemyTurn, 650);
  }

  function enemyTurn() {
    if (!state.battle) return;
    const b = state.battle;
    const stats = getStats();
    if (b.stunned > 0) {
      b.stunned -= 1;
      b.message = `${b.name}被金剛怒喝震住，這一回合未能出手！`;
      b.turn += 1;
      battleLocked = false;
      renderBattle();
      return;
    }
    const move = b.moves[randomInt(0, b.moves.length - 1)];
    const dodgeChance = state.flags.readNotice && b.enemyId === 'tiger' ? 0.13 : 0.06;
    if (Math.random() < dodgeChance) {
      b.message = `${b.name}${move}，你早有提防，側身避過！`;
      tone('miss');
    } else {
      let damage = Math.max(3, Math.round(b.attack + randomInt(-3, 5) - stats.defense * 0.55));
      if (state.hero.guarding) damage = Math.max(1, Math.floor(damage * 0.38));
      const protectedByCompanion = b.protectionTurns > 0;
      if (protectedByCompanion) {
        const companion = activeCompanion();
        const reduction = companion?.id === 'chaijin' ? clamp(0.62 - companion.bond * 0.035, 0.43, 0.59) : 0.62;
        damage = Math.max(1, Math.floor(damage * reduction));
        b.protectionTurns -= 1;
      }
      state.hero.hp -= damage;
      b.message = `${b.name}${move}，你受到 ${damage} 點傷害。${state.hero.guarding ? '防禦架勢減輕了衝擊。' : ''}${protectedByCompanion ? '柴進的護援再度削弱了攻勢。' : ''}`;
      tone('hurt');
    }
    state.hero.guarding = false;
    b.turn += 1;
    if (state.hero.hp <= 0) {
      state.hero.hp = 0;
      renderBattle();
      setTimeout(loseBattle, 650);
      return;
    }
    battleLocked = false;
    renderBattle();
  }

  function winBattle() {
    if (!state.battle) return;
    const result = { ...state.battle };
    gainXp(result.xp);
    state.hero.silver += result.silver;
    gainCompanionBond();
    addLog(`擊敗「${result.name}」，取得 ${result.silver} 兩銀子。`);
    closeBattleOverlay();
    state.battle = null;
    battleLocked = false;
    tone('victory');

    if (result.afterWin === 'bandit_win') {
      state.flags.roadBanditCleared = true;
      state.flags.riceQuestDone = true;
      state.quests.side_rice.status = 'completed';
      state.quests.side_rice.progress = '奪回義米，救下老車夫';
      changeMorality(8, '仗義擊退剪徑山賊');
      addItem('riceSeal', 1);
      goScene('road_after_bandit');
    }
    if (result.afterWin === 'tiger_win') {
      state.flags.tigerDefeated = true;
      state.hero.title = '景陽岡打虎英雄';
      state.quests.main_jingyang.progress = '猛虎已除，隨獵戶下岡';
      changeMorality(10, '為陽谷百姓除去猛虎');
      goScene('tiger_fallen');
    }
    if (result.afterWin === 'arena_win') {
      state.flags.arenaWins = (state.flags.arenaWins || 0) + 1;
      addLog(`完成第 ${state.flags.arenaWins} 次陽谷擂臺切磋。`);
      state.hero.hp = clamp(state.hero.hp + 12, 0, state.hero.maxHp);
      goScene('county_free');
    }
    if (result.afterWin === 'inn_thugs_win') {
      state.flags.innThugsDefeated = true;
      changeMorality(5, '護送金氏父女脫離惡店');
      state.quests.main_zhengguan.progress = '金氏父女已安全出城';
      goScene('jin_departed');
    }
    if (result.afterWin === 'zheng_win') {
      state.flags.zhengDefeated = true;
      state.quests.main_zhengguan.progress = '鎮關西已伏誅，設法離開渭州';
      changeMorality(9, '三拳懲治欺凌良善的惡霸');
      goScene('zheng_fallen');
    }
    if (result.afterWin === 'weizhou_arena_win') {
      state.flags.weizhouArenaWins = (state.flags.weizhouArenaWins || 0) + 1;
      addLog(`完成第 ${state.flags.weizhouArenaWins} 次五臺演武切磋。`);
      state.hero.hp = clamp(state.hero.hp + 14, 0, state.hero.maxHp);
      goScene('wutai_free');
    }
    saveGame(false);
  }

  function loseBattle() {
    const enemyId = state.battle?.enemyId;
    closeBattleOverlay();
    state.battle = null;
    battleLocked = false;
    const penalty = Math.min(10, state.hero.silver);
    state.hero.silver -= penalty;
    state.hero.hp = Math.max(35, Math.round(state.hero.maxHp * 0.42));
    state.hero.sp = Math.max(8, Math.round(state.hero.maxSp * 0.35));
    state.hero.drunk = Math.max(0, state.hero.drunk - 1);
    addLog(`力戰不支，被路人救回；遺失 ${penalty} 兩銀子。`);
    toast(`${state.hero.name}力盡昏厥，幸被人救回。整備後可再次挑戰。`);
    tone('defeat');
    const recoveryScenes = {
      tiger: 'temple_rest',
      bandit: 'road_first',
      arena: 'county_free',
      innThugs: 'jin_plan',
      zhengtu: 'butcher_stall',
      weizhouArena: 'wutai_free'
    };
    goScene(recoveryScenes[enemyId] || state.sceneId);
  }

  function endBattleFlee() {
    const enemyId = state.battle?.enemyId;
    closeBattleOverlay();
    state.battle = null;
    battleLocked = false;
    addLog('暫時退出戰鬥。');
    goScene(enemyId === 'bandit' ? 'road_first' : state.sceneId);
  }

  function closeBattleOverlay() {
    $('.battle-overlay')?.remove();
    lastNarratedBattleKey = '';
  }

  function openModal({ title, subtitle = '', content = '', wide = false }) {
    modalRoot.innerHTML = `
      <div class="modal-backdrop" data-action="close-modal">
        <section class="modal paper-panel ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
          <button class="modal-close" data-action="close-modal" type="button" aria-label="關閉">✕</button>
          <h2>${escapeHtml(title)}</h2>
          ${subtitle ? `<p class="modal-subtitle">${subtitle}</p>` : ''}
          <div class="modal-body">${content}</div>
        </section>
      </div>`;
    $('.modal', modalRoot).addEventListener('click', event => event.stopPropagation());
    $('.modal-close', modalRoot).addEventListener('click', closeModal);
  }

  function closeModal() {
    modalRoot.replaceChildren();
  }

  function openGuide() {
    openModal({
      title: '遊戲指南',
      subtitle: '不需安裝、不需登入，進度保存在目前瀏覽器。',
      content: `
        <div class="modal-grid">
          <article class="info-card"><h3>雙章回探索</h3><p>第一回操控武松打虎，第二回轉入渭州操控魯提轄。完成兩回後可自由切換英雄。</p></article>
          <article class="info-card"><h3>回合戰鬥</h3><p>普通攻擊可累積豪氣；技能傷害較高。防禦能大幅降低下一次受傷。</p></article>
          <article class="info-card"><h3>酒意</h3><p>酒意越高，普通攻擊暴擊率越高，但命中稍微下降；醉拳技能也會更強。</p></article>
          <article class="info-card"><h3>同伴編成</h3><p>可結識宋江、柴進與史進。每場戰鬥可使用一次助陣技能，共同取勝會提升羈絆。</p></article>
          <article class="info-card"><h3>陽谷擂臺</h3><p>完成第一回後可在陽谷縣重複挑戰，用來測試編成、累積閱歷及同伴羈絆。</p></article>
          <article class="info-card"><h3>本機存檔</h3><p>按「存檔」可立即保存。清除瀏覽器網站資料會一併移除進度。</p></article>
          <article class="info-card"><h3>顯示模式</h3><p>右上角「◐」可循環切換水墨宣紙、深色與黑白電子紙模式。</p></article>
          <article class="info-card"><h3>語音播報</h3><p>右上角「💬／🗣️」可開啟設定。語音與音效分開控制，並可調整語速、音量及朗讀範圍。</p></article>
          <article class="info-card"><h3>離線遊玩</h3><p>透過 GitHub Pages 等 HTTPS 網站開啟後，可安裝成 PWA 並在離線狀態遊玩。</p></article>
        </div>`
    });
  }

  function openAbout() {
    openModal({
      title: `梁山風雲 v${VERSION}`,
      subtitle: '雙章回版：景陽岡打虎＋拳打鎮關西',
      content: `
        <div class="modal-grid">
          <article class="info-card"><h3>已收錄</h3><p>兩回章回劇情、武松與魯智深雙主角、角色專屬技能、宋江／柴進／史進同伴編成、羈絆成長、兩處演武場、裝備、任務、義氣、三種顯示模式、語音播報、本機存檔與 PWA 離線功能。</p></article>
          <article class="info-card"><h3>文學改編</h3><p>以《水滸傳》景陽岡打虎與魯提轄拳打鎮關西情節為主軸，對章回銜接、支線與戰鬥進行遊戲化改編，並非原文逐字重現。</p></article>
          <article class="info-card"><h3>技術</h3><p>純 HTML、CSS、JavaScript 製作，不使用外部套件，也不需要伺服器或資料庫。</p></article>
          <article class="info-card"><h3>存檔位置</h3><p>使用瀏覽器 LocalStorage。版本更新通常不影響存檔，但更換裝置不會自動同步。</p></article>
        </div>`
    });
  }

  function openCharacter() {
    const stats = getStats();
    const moralTitle = state.hero.morality >= 80 ? '義薄雲天' : state.hero.morality >= 60 ? '急公好義' : state.hero.morality >= 40 ? '恩怨分明' : '獨行江湖';
    const skills = (HERO_SKILLS[state.activeHeroId] || []).map(skill => `<p><strong>${escapeHtml(skill.name)}</strong>：消耗 ${skill.cost} 豪氣，${escapeHtml(skill.description)}</p>`).join('');
    openModal({
      title: `人物志・${state.hero.name}`,
      subtitle: `${state.hero.title}｜江湖評語：${moralTitle}`,
      content: `
        <div class="modal-grid">
          <article class="info-card"><h3>人物數值</h3><p>等級：${state.hero.level}</p><p>氣血：${Math.ceil(state.hero.hp)} / ${state.hero.maxHp}</p><p>豪氣：${state.hero.sp} / ${state.hero.maxSp}</p><p>武力：${stats.attack}</p><p>筋骨：${stats.defense}</p></article>
          <article class="info-card"><h3>江湖資歷</h3><p>閱歷：${state.hero.xp} / ${state.hero.nextXp}</p><p>義氣：${state.hero.morality} / 100</p><p>銀兩：${state.hero.silver} 兩</p><p>遊玩時間：約 ${Math.floor(state.playMinutes)} 分鐘</p></article>
          <article class="info-card"><h3>專屬武藝</h3>${skills}</article>
          <article class="info-card"><h3>裝備</h3><p>兵器：${ITEMS[state.equipment.weapon]?.name || '無'}</p><p>衣甲：${ITEMS[state.equipment.armor]?.name || '無'}</p></article>
          <article class="info-card"><h3>同伴編成</h3><p>目前助陣：${activeCompanion()?.name || '無'}</p><p>已結識：${Object.values(state.companions).filter(entry => entry.unlocked).length} / ${Object.keys(COMPANIONS).length}</p></article>
        </div>`
    });
  }

  function openRoster() {
    syncActiveHero();
    const heroNames = { wusong: '武松', luzhishen: state.heroes.luzhishen.name || '魯智深' };
    const homeNames = { wusong: '陽谷縣', luzhishen: '五臺山' };
    const cards = Object.keys(HERO_BLUEPRINTS).map(id => {
      const hero = state.heroes[id];
      const unlocked = Boolean(hero?.unlocked);
      if (!unlocked) {
        return `<article class="hero-roster-card locked"><span class="hero-roster-avatar">？</span><div><h3>尚未開篇</h3><p>完成第一回後，開啟「魯提轄拳打鎮關西」。</p></div></article>`;
      }
      const stats = getStatsForHero(id);
      const active = id === state.activeHeroId;
      const switchDisabled = active || !state.flags.chapter2Complete;
      return `<article class="hero-roster-card ${active ? 'active' : ''}">
        <span class="hero-roster-avatar">${escapeHtml(hero.avatar || hero.name.slice(0, 1))}</span>
        <div class="hero-roster-copy"><h3>${escapeHtml(hero.name)}</h3><p>${escapeHtml(hero.title)}</p><p>Lv.${hero.level}｜武力 ${stats.attack}｜筋骨 ${stats.defense}｜義氣 ${hero.morality}</p><p>章回據點：${homeNames[id]}</p></div>
        <button type="button" data-switch-hero="${id}" ${switchDisabled ? 'disabled' : ''}>${active ? '目前主角' : state.flags.chapter2Complete ? `切換為${heroNames[id]}` : '完成第二回後開放'}</button>
      </article>`;
    }).join('');
    openModal({
      title: '梁山英雄譜',
      subtitle: state.flags.chapter2Complete ? '切換英雄時，會前往該人物目前的章回據點；數值、銀兩與裝備各自保存，行囊與同伴共用。' : '第二回進行期間依章回固定操控；完成後即可自由切換。',
      content: `<div class="hero-roster-grid">${cards}</div>`,
      wide: true
    });
    $$('[data-switch-hero]', modalRoot).forEach(button => button.addEventListener('click', () => switchHero(button.dataset.switchHero)));
  }

  function openTeam() {
    const activeId = state.team.active;
    const cards = Object.entries(COMPANIONS).map(([id, companion]) => {
      const entry = state.companions[id];
      if (!entry?.unlocked) {
        return `<article class="companion-card locked"><div class="companion-card-head"><span class="companion-card-avatar">？</span><div><h3>尚未結識</h3><p>${escapeHtml(companion.unlockHint)}</p></div></div><span class="status-pill">未解鎖</span></article>`;
      }
      const active = activeId === id;
      const nextAt = entry.bond >= 5 ? '羈絆已滿' : `再共同取勝 ${Math.max(1, entry.bond * 2 - (entry.wins || 0))} 場可提升`;
      return `<article class="companion-card ${active ? 'active' : ''}">
        <div class="companion-card-head"><span class="companion-card-avatar">${escapeHtml(companion.avatar)}</span><div><h3>${escapeHtml(companion.name)}</h3><p>${escapeHtml(companion.title)}｜${escapeHtml(companion.role)}</p></div></div>
        <p>${escapeHtml(companion.description)}</p>
        <div class="bond-row"><span>羈絆 ${entry.bond}/5</span><span>${escapeHtml(nextAt)}</span></div>
        <div class="bond-meter"><i style="width:${entry.bond * 20}%"></i></div>
        <footer><strong>${escapeHtml(companion.skillName)}</strong><button type="button" data-set-companion="${id}" ${active ? 'disabled' : ''}>${active ? '助陣中' : '設為助陣'}</button></footer>
      </article>`;
    }).join('');
    openModal({
      title: '江湖同伴編成',
      subtitle: '同伴技能每場戰鬥限用一次；羈絆會隨共同勝場提升。此為 RPG 化編成，不改變原著人物當下所在。',
      content: `<div class="team-toolbar"><span>目前助陣：<strong>${activeCompanion()?.name || '無'}</strong></span><button type="button" data-set-companion="" ${activeId ? '' : 'disabled'}>解除編成</button></div><div class="companion-grid">${cards}</div>`,
      wide: true
    });
    $$('[data-set-companion]', modalRoot).forEach(button => button.addEventListener('click', () => setActiveCompanion(button.dataset.setCompanion)));
  }

  function openInventory() {
    const cards = Object.entries(state.inventory)
      .filter(([, quantity]) => quantity > 0)
      .map(([id, quantity]) => {
        const item = ITEMS[id];
        const equipped = state.equipment.weapon === id || state.equipment.armor === id;
        const usable = item.type === 'consumable';
        const equippable = item.type === 'weapon' || item.type === 'armor';
        const incompatible = Boolean(item.hero && item.hero !== state.activeHeroId);
        const button = usable
          ? `<button type="button" data-use-item="${id}">使用</button>`
          : equippable
            ? `<button type="button" data-equip-item="${id}" ${equipped || incompatible ? 'disabled' : ''}>${equipped ? '已裝備' : incompatible ? '其他英雄專用' : '裝備'}</button>`
            : '<span class="status-pill">重要物品</span>';
        return `<article class="item-card"><h3>${escapeHtml(item.name)} ×${quantity}</h3><p>${escapeHtml(item.description)}</p><footer><span>${item.type === 'weapon' ? '兵器' : item.type === 'armor' ? '衣甲' : item.type === 'consumable' ? '消耗品' : '信物'}</span>${button}</footer></article>`;
      }).join('');
    openModal({ title: '行囊與裝備', subtitle: `目前攜有 ${state.hero.silver} 兩銀子。`, content: `<div class="modal-grid">${cards || '<p>行囊空空如也。</p>'}</div>`, wide: true });
    $$('[data-use-item]', modalRoot).forEach(button => button.addEventListener('click', () => { consumeItem(button.dataset.useItem); openInventory(); }));
    $$('[data-equip-item]', modalRoot).forEach(button => button.addEventListener('click', () => equipItem(button.dataset.equipItem)));
  }

  function openQuests() {
    const statusNames = { active: '進行中', completed: '已完成', failed: '未完成', hidden: '未觸發' };
    const cards = Object.values(state.quests).filter(q => q.status !== 'hidden').map(q => `
      <article class="quest-card">
        <h3>${escapeHtml(q.title)}</h3>
        <p>${escapeHtml(q.description)}</p>
        <p><strong>目前進度：</strong>${escapeHtml(q.progress)}</p>
        <footer><span class="status-pill">${statusNames[q.status] || q.status}</span></footer>
      </article>`).join('');
    openModal({ title: '任務簿', subtitle: '主線與支線會依選擇產生不同結果。', content: `<div class="modal-grid">${cards}</div>`, wide: true });
  }

  function openMap() {
    const positionsMobile = {
      manor: [20, 88], road: [70, 79], inn: [24, 66], forest: [72, 52],
      county: [26, 39], weizhou: [72, 29], market: [30, 17], wutai: [76, 7]
    };
    const nodes = MAP_NODES.map(node => {
      const unlocked = node.unlock(state);
      const isCurrent = state.location === node.id;
      return `<button class="map-node ${isCurrent ? 'current' : ''} ${unlocked ? '' : 'locked'}" data-map-node="${node.id}" style="left:${node.x}%;top:${node.y}%" ${unlocked ? '' : 'disabled'}>${escapeHtml(node.name)}<span>${escapeHtml(node.region)}</span></button>`;
    }).join('');
    openModal({
      title: '江湖輿圖',
      subtitle: '可返回已開放地點。進行中的關鍵劇情可能限制旅行。',
      content: `<div class="map-grid"><div class="map-road"></div>${nodes}</div>`, wide: true
    });
    if (window.matchMedia('(max-width: 620px)').matches) {
      $$('[data-map-node]', modalRoot).forEach(button => {
        const [x, y] = positionsMobile[button.dataset.mapNode];
        button.style.left = `${x}%`; button.style.top = `${y}%`;
      });
    }
    $$('[data-map-node]', modalRoot).forEach(button => button.addEventListener('click', () => travelTo(button.dataset.mapNode)));
  }

  function travelTo(locationId) {
    const node = MAP_NODES.find(n => n.id === locationId);
    if (!node || !node.unlock(state)) return;
    const secondChapterLocations = ['weizhou', 'market', 'wutai'];
    const requiredHero = secondChapterLocations.includes(locationId) ? 'luzhishen' : 'wusong';
    if (state.activeHeroId !== requiredHero) {
      if (!state.flags.chapter2Complete) {
        toast('目前正處於另一位英雄的關鍵章回，尚不能跨線旅行。');
        return;
      }
      setActiveHero(requiredHero);
      state.chapter = requiredHero === 'wusong' ? 1 : 2;
    }
    const destinations = {
      manor: 'manor_depart',
      road: state.flags.roadBanditCleared ? 'road_after_bandit' : 'road_first',
      inn: 'inn_arrive',
      forest: state.flags.tigerDefeated ? 'tiger_fallen' : 'forest_notice',
      county: state.flags.gameComplete ? 'county_free' : 'county_reward',
      weizhou: state.flags.chapter2Complete ? 'weizhou_free' : state.flags.reachedButcherStall ? 'butcher_stall' : state.flags.jinFamilySaved ? 'jin_departed' : 'weizhou_tavern',
      market: state.flags.zhengDefeated ? 'weizhou_free' : 'butcher_stall',
      wutai: state.flags.chapter2Complete ? 'wutai_free' : 'wutai_gate'
    };
    closeModal();
    goScene(destinations[locationId]);
  }

  function openSummary() {
    syncActiveHero();
    const completed = Object.values(state.quests).filter(q => q.status === 'completed').length;
    const wusong = state.heroes.wusong;
    const lu = state.heroes.luzhishen;
    const wusongStats = getStatsForHero('wusong');
    const luStats = getStatsForHero('luzhishen');
    const ending = (wusong.morality + (lu.unlocked ? lu.morality : 0)) / (lu.unlocked ? 2 : 1) >= 75 ? '義薄雲天' : '豪傑本色';
    openModal({
      title: state.flags.chapter2Complete ? '兩回章回成果' : '第一回成果',
      subtitle: `章回評等：${ending}`,
      content: `<div class="modal-grid">
        <article class="info-card"><h3>武松</h3><p>${escapeHtml(wusong.title)}</p><p>等級 ${wusong.level}</p><p>武力 ${wusongStats.attack}｜筋骨 ${wusongStats.defense}</p><p>義氣 ${wusong.morality}</p></article>
        <article class="info-card"><h3>${lu.unlocked ? escapeHtml(lu.name) : '魯提轄'}</h3><p>${lu.unlocked ? escapeHtml(lu.title) : '第二回尚未開篇'}</p><p>等級 ${lu.unlocked ? lu.level : '－'}</p><p>武力 ${lu.unlocked ? luStats.attack : '－'}｜筋骨 ${lu.unlocked ? luStats.defense : '－'}</p><p>義氣 ${lu.unlocked ? lu.morality : '－'}</p></article>
        <article class="info-card"><h3>歷程</h3><p>完成任務：${completed}</p><p>景陽岡猛虎：${state.flags.tigerDefeated ? '已擊破' : '未擊破'}</p><p>鎮關西鄭屠：${state.flags.zhengDefeated ? '已伏誅' : '尚未交鋒'}</p><p>演武勝場：${(state.flags.arenaWins || 0) + (state.flags.weizhouArenaWins || 0)}</p></article>
        <article class="info-card"><h3>同伴與收藏</h3><p>已結識同伴：${Object.values(state.companions).filter(entry => entry.unlocked).length} / ${Object.keys(COMPANIONS).length}</p><p>打虎英雄牌：${state.inventory.tigerToken ? '已取得' : '未取得'}</p><p>金氏銀釵：${state.inventory.jinHairpin ? '已取得' : '未取得'}</p><p>五臺度牒：${state.inventory.monkCertificate ? '已取得' : '未取得'}</p></article>
        <article class="info-card"><h3>後續預告</h3><p>${state.flags.chapter2Complete ? '下一版將進入花和尚大鬧五臺山，並擴充城鎮商店、技能成長與更多可招募好漢。' : '完成第一回後，可開啟魯提轄拳打鎮關西的第二回。'}</p></article>
      </div>`,
      wide: true
    });
  }

  function supportsSpeech() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  function refreshVoices() {
    if (!supportsSpeech()) {
      availableVoices = [];
      return availableVoices;
    }
    availableVoices = window.speechSynthesis.getVoices().slice().sort((a, b) => {
      const aZh = /^zh/i.test(a.lang) ? 0 : 1;
      const bZh = /^zh/i.test(b.lang) ? 0 : 1;
      return aZh - bZh || a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name);
    });
    return availableVoices;
  }

  function selectedVoice() {
    refreshVoices();
    if (prefs.speechVoice) {
      const exact = availableVoices.find(voice => voice.voiceURI === prefs.speechVoice || voice.name === prefs.speechVoice);
      if (exact) return exact;
    }
    return availableVoices.find(voice => /^zh-TW/i.test(voice.lang))
      || availableVoices.find(voice => /^zh-Hant/i.test(voice.lang))
      || availableVoices.find(voice => /^zh/i.test(voice.lang))
      || null;
  }

  function stripHtml(html) {
    const temp = document.createElement('div');
    temp.innerHTML = String(html || '');
    return (temp.textContent || temp.innerText || '')
      .replace(/\s+/g, ' ')
      .replace(/([。！？；：])(?=\S)/g, '$1 ')
      .trim();
  }

  function stopSpeaking() {
    speechToken += 1;
    if (supportsSpeech()) window.speechSynthesis.cancel();
    updateNarrationButton();
  }

  function speakText(text, { interrupt = true, onEnd = null } = {}) {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean || !supportsSpeech()) return false;
    if (interrupt) window.speechSynthesis.cancel();
    const token = ++speechToken;
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = selectedVoice()?.lang || 'zh-TW';
    utterance.rate = prefs.speechRate;
    utterance.volume = prefs.speechVolume;
    utterance.pitch = 1;
    const voice = selectedVoice();
    if (voice) utterance.voice = voice;
    utterance.onstart = updateNarrationButton;
    utterance.onend = () => {
      if (token === speechToken) updateNarrationButton();
      if (typeof onEnd === 'function') onEnd();
    };
    utterance.onerror = event => {
      if (event.error !== 'interrupted' && event.error !== 'canceled') console.debug('Speech unavailable', event.error);
      updateNarrationButton();
    };
    window.speechSynthesis.speak(utterance);
    updateNarrationButton();
    return true;
  }

  function currentSceneNarrationText() {
    if (!state) return '';
    const scene = SCENES[state.sceneId] || SCENES.manor_start;
    const storyHtml = typeof scene.text === 'function' ? scene.text() : scene.text;
    const choices = typeof scene.choices === 'function' ? scene.choices() : scene.choices;
    const choiceText = prefs.narrateChoices
      ? `可選行動。${choices.filter(choice => !choice.disabled).map((choice, index) => `選項 ${index + 1}，${choice.label}`).join('。')}`
      : '';
    return `第 ${state.chapter} 回。${scene.region}，${scene.name}。${scene.title}。${scene.speaker}。${stripHtml(storyHtml)}。${choiceText}`;
  }

  function speakCurrentScene() {
    if (!supportsSpeech()) {
      toast('此瀏覽器不支援語音播報。');
      return false;
    }
    return speakText(currentSceneNarrationText(), { interrupt: true });
  }

  function updateNarrationButton() {
    const button = $('#narrationButton');
    if (!button) return;
    const speaking = supportsSpeech() && window.speechSynthesis.speaking;
    button.textContent = prefs.narration ? (speaking ? '⏹️' : '🗣️') : '💬';
    button.setAttribute('aria-label', prefs.narration ? '語音播報已開啟，開啟設定' : '語音播報已關閉，開啟設定');
    button.title = !supportsSpeech() ? '此瀏覽器不支援語音播報' : `語音播報：${prefs.narration ? '開啟' : '關閉'}${speaking ? '（朗讀中）' : ''}`;
  }

  function openVoiceSettings() {
    refreshVoices();
    const supported = supportsSpeech();
    const voiceOptions = availableVoices.map(voice => {
      const selected = prefs.speechVoice && (prefs.speechVoice === voice.voiceURI || prefs.speechVoice === voice.name) ? ' selected' : '';
      return `<option value="${escapeHtml(voice.voiceURI || voice.name)}"${selected}>${escapeHtml(voice.name)}（${escapeHtml(voice.lang)}）</option>`;
    }).join('');
    openModal({
      title: '語音播報設定',
      subtitle: supported ? '使用裝置內建的 Web Speech 語音，不需下載音檔。' : '目前瀏覽器沒有提供 Web Speech 語音功能。',
      content: `
        <div class="voice-settings">
          <div class="voice-setting">
            <label class="voice-toggle"><input id="voiceEnabled" type="checkbox" ${prefs.narration ? 'checked' : ''} ${supported ? '' : 'disabled'}><span><strong>啟用語音播報</strong><br>與右上角音效開關分開控制。</span></label>
          </div>
          <div class="modal-grid">
            <div class="voice-setting">
              <label class="voice-toggle"><input id="voiceScenes" type="checkbox" ${prefs.narrateScenes ? 'checked' : ''}><span><strong>自動朗讀章回劇情</strong><br>進入新場景時自動朗讀。</span></label>
            </div>
            <div class="voice-setting">
              <label class="voice-toggle"><input id="voiceBattle" type="checkbox" ${prefs.narrateBattle ? 'checked' : ''}><span><strong>自動朗讀戰鬥訊息</strong><br>播報回合、攻擊與受傷結果。</span></label>
            </div>
            <div class="voice-setting">
              <label class="voice-toggle"><input id="voiceChoices" type="checkbox" ${prefs.narrateChoices ? 'checked' : ''}><span><strong>同時朗讀行動選項</strong><br>適合較依賴語音操作的玩家。</span></label>
            </div>
          </div>
          <div class="voice-setting">
            <label for="voiceSelect">朗讀語音</label>
            <select id="voiceSelect" ${supported ? '' : 'disabled'}>
              <option value="">自動選擇繁體中文語音</option>
              ${voiceOptions}
            </select>
          </div>
          <div class="voice-setting">
            <label for="voiceRate">語速</label>
            <div class="voice-range-row"><input id="voiceRate" type="range" min="0.6" max="1.5" step="0.1" value="${prefs.speechRate}"><output id="voiceRateValue" class="voice-range-value">${prefs.speechRate.toFixed(1)}×</output></div>
          </div>
          <div class="voice-setting">
            <label for="voiceVolume">音量</label>
            <div class="voice-range-row"><input id="voiceVolume" type="range" min="0" max="1" step="0.1" value="${prefs.speechVolume}"><output id="voiceVolumeValue" class="voice-range-value">${Math.round(prefs.speechVolume * 100)}%</output></div>
          </div>
          <div class="voice-actions">
            <button id="voiceTest" type="button" ${supported ? '' : 'disabled'}>試聽語音</button>
            <button id="voiceStop" type="button" ${supported ? '' : 'disabled'}>停止朗讀</button>
          </div>
          <p class="voice-support-note">可用語音由作業系統與瀏覽器提供；不同手機或電腦顯示的名稱可能不同。iPhone／iPad 首次朗讀通常需要先點一次按鈕。</p>
        </div>`
    });

    const saveVoicePrefs = () => {
      prefs.narration = Boolean($('#voiceEnabled', modalRoot)?.checked);
      prefs.narrateScenes = Boolean($('#voiceScenes', modalRoot)?.checked);
      prefs.narrateBattle = Boolean($('#voiceBattle', modalRoot)?.checked);
      prefs.narrateChoices = Boolean($('#voiceChoices', modalRoot)?.checked);
      prefs.speechVoice = $('#voiceSelect', modalRoot)?.value || '';
      prefs.speechRate = clamp(Number($('#voiceRate', modalRoot)?.value || 0.9), 0.6, 1.5);
      prefs.speechVolume = clamp(Number($('#voiceVolume', modalRoot)?.value || 1), 0, 1);
      savePrefs();
      updateNarrationButton();
      if (!prefs.narration) stopSpeaking();
    };

    ['voiceEnabled', 'voiceScenes', 'voiceBattle', 'voiceChoices', 'voiceSelect'].forEach(id => {
      $(`#${id}`, modalRoot)?.addEventListener('change', saveVoicePrefs);
    });
    $('#voiceRate', modalRoot)?.addEventListener('input', event => {
      $('#voiceRateValue', modalRoot).textContent = `${Number(event.target.value).toFixed(1)}×`;
      saveVoicePrefs();
    });
    $('#voiceVolume', modalRoot)?.addEventListener('input', event => {
      $('#voiceVolumeValue', modalRoot).textContent = `${Math.round(Number(event.target.value) * 100)}%`;
      saveVoicePrefs();
    });
    $('#voiceTest', modalRoot)?.addEventListener('click', () => {
      saveVoicePrefs();
      speakText('山河萬里，義氣千秋。水滸英雄傳，梁山風雲。', { interrupt: true });
    });
    $('#voiceStop', modalRoot)?.addEventListener('click', stopSpeaking);
  }

  function toast(message) {
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    toastRoot.append(node);
    setTimeout(() => node.remove(), 3200);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function tone(kind) {
    if (!prefs.sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;
      const map = {
        start: [220, 0.18], save: [520, 0.09], item: [660, 0.1], drink: [300, 0.12],
        battle: [130, 0.18], hit: [180, 0.08], critical: [110, 0.18], miss: [420, 0.06],
        hurt: [90, 0.11], guard: [260, 0.08], skill: [380, 0.15], victory: [720, 0.25],
        defeat: [75, 0.3], level: [880, 0.25]
      };
      const [frequency, duration] = map[kind] || [440, 0.08];
      oscillator.type = kind === 'critical' || kind === 'battle' ? 'sawtooth' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, now);
      if (kind === 'victory' || kind === 'level') oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.55, now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.09, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    } catch (error) {
      console.debug('Audio unavailable', error);
    }
  }

  function applyTheme() {
    document.body.dataset.theme = prefs.theme;
    $('#themeButton').title = `顯示模式：${THEME_NAMES[prefs.theme]}`;
    savePrefs();
  }

  function toggleTheme() {
    const index = THEMES.indexOf(prefs.theme);
    prefs.theme = THEMES[(index + 1) % THEMES.length];
    applyTheme();
    toast(`已切換為「${THEME_NAMES[prefs.theme]}」模式。`);
  }

  function toggleSound() {
    prefs.sound = !prefs.sound;
    $('#soundButton').textContent = prefs.sound ? '🔊' : '🔇';
    $('#soundButton').title = prefs.sound ? '音效：開啟' : '音效：關閉';
    savePrefs();
    if (prefs.sound) tone('item');
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'new-game') startNewGame();
    if (action === 'continue-game') continueGame();
    if (action === 'open-guide') openGuide();
    if (action === 'read-current-scene') speakCurrentScene();
    if (action === 'open-character') openCharacter();
    if (action === 'open-roster') openRoster();
    if (action === 'open-team') openTeam();
    if (action === 'open-inventory') openInventory();
    if (action === 'open-quests') openQuests();
    if (action === 'open-map') openMap();
    if (action === 'save-game') saveGame();
    if (action === 'clear-log') { state.log = []; renderLog(); }
    if (action === 'close-modal') closeModal();
  });

  $('#brandButton').addEventListener('click', () => {
    if (currentScreen === 'game' && state) saveGame(false);
    showTitle();
  });
  $('#aboutButton').addEventListener('click', openAbout);
  $('#themeButton').addEventListener('click', toggleTheme);
  $('#soundButton').addEventListener('click', toggleSound);
  $('#narrationButton').addEventListener('click', openVoiceSettings);
  $('#installButton').addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    $('#installButton').classList.add('hidden');
  });

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    $('#installButton').classList.remove('hidden');
  });

  window.addEventListener('beforeunload', () => {
    if (state && currentScreen === 'game') saveGame(false);
  });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(console.warn));
  }

  applyTheme();
  $('#soundButton').textContent = prefs.sound ? '🔊' : '🔇';
  if (supportsSpeech()) {
    refreshVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
  }
  updateNarrationButton();
  showTitle();
})();
