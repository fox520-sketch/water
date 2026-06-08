(() => {
  'use strict';

  const SAVE_KEY = 'liangshan-rpg-save-v1';
  const PREF_KEY = 'liangshan-rpg-prefs-v1';
  const VERSION = '1.9.0';
  const THEMES = ['ink', 'dark', 'paper'];
  const THEME_NAMES = { ink: '水墨宣紙', dark: '夜行深色', paper: '黑白電子紙' };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const cloneData = value => JSON.parse(JSON.stringify(value));
  const memoryStorage = (() => {
    const data = new Map();
    return {
      getItem: key => data.has(key) ? data.get(key) : null,
      setItem: (key, value) => data.set(key, String(value)),
      removeItem: key => data.delete(key)
    };
  })();
  const storage = (() => {
    try {
      const probe = '__liangshan_storage_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return window.localStorage;
    } catch {
      return memoryStorage;
    }
  })();

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
    },
    linchong: {
      id: 'linchong', name: '林沖', avatar: '林', title: '八十萬禁軍教頭', level: 3, xp: 0, nextXp: 145,
      hp: 126, maxHp: 126, sp: 32, maxSp: 38,
      baseAttack: 20, baseDefense: 10, morality: 62, silver: 18, drunk: 0,
      guarding: false, unlocked: false
    },
    yangzhi: {
      id: 'yangzhi', name: '楊志', avatar: '楊', title: '青面獸・殿司制使', level: 4, xp: 0, nextXp: 180,
      hp: 138, maxHp: 138, sp: 34, maxSp: 42,
      baseAttack: 22, baseDefense: 11, morality: 55, silver: 20, drunk: 0,
      guarding: false, unlocked: false
    },
    songjiang: {
      id: 'songjiang', name: '宋江', avatar: '宋', title: '鄆城押司・及時雨', level: 4, xp: 0, nextXp: 185,
      hp: 124, maxHp: 124, sp: 38, maxSp: 44,
      baseAttack: 17, baseDefense: 12, morality: 74, silver: 45, drunk: 0,
      guarding: false, unlocked: false
    },
    likui: {
      id: 'likui', name: '李逵', avatar: '李', title: '黑旋風・江州牢子', level: 5, xp: 0, nextXp: 225,
      hp: 162, maxHp: 162, sp: 34, maxSp: 46,
      baseAttack: 25, baseDefense: 11, morality: 60, silver: 16, drunk: 0,
      guarding: false, unlocked: false
    },
    husanniang: {
      id: 'husanniang', name: '扈三娘', avatar: '扈', title: '一丈青・扈家莊女將', level: 6, xp: 0, nextXp: 265,
      hp: 148, maxHp: 148, sp: 38, maxSp: 48,
      baseAttack: 24, baseDefense: 13, morality: 66, silver: 24, drunk: 0,
      guarding: false, unlocked: false
    },
    huyanzhuo: {
      id: 'huyanzhuo', name: '呼延灼', avatar: '呼', title: '雙鞭將・汝寧郡都統制', level: 7, xp: 0, nextXp: 310,
      hp: 176, maxHp: 176, sp: 40, maxSp: 52,
      baseAttack: 27, baseDefense: 16, morality: 62, silver: 30, drunk: 0,
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
    ],
    linchong: [
      { id: 'spearFlurry', name: '寒星連刺', cost: 8, description: '槍尖如雪，連續刺擊三次。' },
      { id: 'snowCounter', name: '風雪回馬槍', cost: 12, description: '重創敵手並架起一次反擊之勢。' }
    ],
    yangzhi: [
      { id: 'greenFaceSlash', name: '青面斬', cost: 8, description: '楊家刀法迅疾狠準，較容易打出重擊。' },
      { id: 'escortOrder', name: '護綱軍令', cost: 12, description: '以軍令壓住敵勢，造成傷害、削弱攻擊並進入防禦。' }
    ],
    songjiang: [
      { id: 'timelyRain', name: '及時雨撫眾', cost: 8, description: '安定人心，恢復氣血並進入防禦架勢。' },
      { id: 'clerkRuse', name: '押司機變', cost: 12, description: '以案牘口令擾亂敵陣，削弱武力、筋骨並看破一次攻勢。' }
    ],
    likui: [
      { id: 'whirlwindAxes', name: '黑旋風雙斧', cost: 8, description: '雙斧連環猛劈，敵方氣血越低，追擊越兇。' },
      { id: 'blackRoar', name: '鐵牛怒吼', cost: 12, description: '震退群敵、恢復豪氣，並有機會使敵人膽怯。' }
    ],
    husanniang: [
      { id: 'sunMoonBlades', name: '日月雙刀', cost: 8, description: '雙刀交錯連斬，並削弱敵方筋骨。' },
      { id: 'redLasso', name: '紅錦套索', cost: 12, description: '套索制敵，造成傷害並有機會使敵人失衡一回合。' }
    ],
    huyanzhuo: [
      { id: 'twinWhipCrush', name: '雙鞭鎮嶽', cost: 8, description: '雙鞭接連重擊，削弱敵方筋骨。' },
      { id: 'chainHorseOrder', name: '連環馬令', cost: 12, description: '整頓騎陣、架起守勢，並蓄積下一擊威力。' }
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
    linSpear: { name: '寒星丈八蛇矛', type: 'weapon', hero: 'linchong', description: '林教頭慣用長槍，槍出如寒星，武力 +7、筋骨 +1。', attack: 7, defense: 1 },
    snowCloak: { name: '風雪氈衣', type: 'armor', hero: 'linchong', description: '滄州風雪中護身的厚氈衣，筋骨 +5。', defense: 5 },
    yangSaber: { name: '楊家雁翎刀', type: 'weapon', hero: 'yangzhi', description: '楊家將門所傳雁翎刀，武力 +9、筋骨 +1。', attack: 9, defense: 1 },
    escortArmor: { name: '制使青甲', type: 'armor', hero: 'yangzhi', description: '護送生辰綱時所穿輕甲，筋骨 +6。', defense: 6 },
    clerkBlade: { name: '押司雁翎腰刀', type: 'weapon', hero: 'songjiang', description: '宋江隨身防衛短刀，武力 +5、筋骨 +2。', attack: 5, defense: 2 },
    clerkRobe: { name: '鄆城押司青衫', type: 'armor', hero: 'songjiang', description: '便於行走縣衙與鄉里的青衫，筋骨 +6。', defense: 6 },
    twinAxes: { name: '黑旋風板斧', type: 'weapon', hero: 'likui', description: '李逵劫法場時所持一雙板斧，武力 +10、筋骨 +1。', attack: 10, defense: 1 },
    blackWarCoat: { name: '鐵牛皂戰衣', type: 'armor', hero: 'likui', description: '便於衝陣的厚實皂衣，筋骨 +7。', defense: 7 },
    sunMoonSabers: { name: '日月霜華雙刀', type: 'weapon', hero: 'husanniang', description: '扈三娘慣使的日月雙刀，武力 +10、筋骨 +2。', attack: 10, defense: 2 },
    redBrocadeArmor: { name: '紅錦雁翎甲', type: 'armor', hero: 'husanniang', description: '輕捷堅韌的女將戰甲，筋骨 +8。', defense: 8 },
    steelTwinWhips: { name: '水磨八稜雙鞭', type: 'weapon', hero: 'huyanzhuo', description: '呼延灼祖傳雙鞭，沉重剛猛，武力 +11、筋骨 +2。', attack: 11, defense: 2 },
    chainCavalryArmor: { name: '烏油連環馬甲', type: 'armor', hero: 'huyanzhuo', description: '連環馬統帥所穿重甲，筋骨 +9。', defense: 9 },
    tigerToken: { name: '打虎英雄牌', type: 'key', description: '陽谷知縣所贈名牌，記錄景陽岡打虎之功。' },
    riceSeal: { name: '義米封條', type: 'key', description: '遭劫米袋上的封條，見證你為百姓奪回糧食。' },
    jinHairpin: { name: '金氏銀釵', type: 'key', description: '金翠蓮留下的信物，記錄魯提轄仗義救人的往事。' },
    monkCertificate: { name: '五臺度牒', type: 'key', description: '魯達於五臺山剃度後所得度牒，法名智深。' },
    cangzhouLetter: { name: '柴進薦書', type: 'key', description: '柴進寫給滄州牢城營管營的薦書，使林沖免受百殺威棒。' },
    grassYardSeal: { name: '草料場銅印', type: 'key', description: '草料場值守銅印，見證風雪夜中陸謙設下的毒計。' },
    birthdaySeal: { name: '生辰綱封記', type: 'key', description: '梁中書送往東京的金珠寶貝封記，見證黃泥岡一場智取。' },
    dateScoop: { name: '棗瓢暗記', type: 'key', description: '吳用等人在酒瓢上留下的暗記，象徵七星聚義計成。' },
    chaoLetter: { name: '晁蓋謝書', type: 'key', description: '晁蓋感念宋江通風報信所寫的書信，也是閻婆惜事件的關鍵證物。' },
    yunchengSeal: { name: '鄆城押司印記', type: 'key', description: '宋江處理案牘所用的小印，見證他在公門與江湖義氣間的抉擇。' },
    antiPoemCopy: { name: '潯陽樓詩箋', type: 'key', description: '潯陽樓壁間抄下的詩箋，見證文字如何被權力解讀為罪證。' },
    jiangzhouDrum: { name: '江州法場戰鼓', type: 'key', description: '晁蓋眾人劫法場後留下的戰鼓銅環，象徵眾好漢同生共死。' },
    liangshanBanner: { name: '梁山聚義旗', type: 'key', description: '白龍廟聚義後立下的旗幟，山寨建設自此開端。' },
    pantuoMap: { name: '盤陀路暗記圖', type: 'key', description: '獨龍岡盤陀路的樹記與旗號，記錄祝家莊迷路機關的破解方法。' },
    allianceToken: { name: '獨龍岡盟誓牌', type: 'key', description: '扈家莊、李家莊與梁山停戰護民的信物，象徵攻莊不傷百姓的約定。' },
    hookLanceManual: { name: '鉤鐮槍譜', type: 'key', description: '金槍手徐寧傳下的鉤、割、倒馬步法，專破鐵甲連環馬。' },
    chainHorseInsignia: { name: '連環馬都統令', type: 'key', description: '呼延灼統領連環馬時所用軍令，見證官軍與梁山由敵轉友。' },
    goldenArmorToken: { name: '賽唐猊甲記', type: 'key', description: '湯隆與徐寧相認的鎧甲暗記，記錄鉤鐮槍入梁山的曲折因緣。' }
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
    },
    lixiaoer: {
      name: '李小二', title: '滄州酒店掌櫃', avatar: '李', role: '情報支援', skillName: '暖酒密報',
      description: '每場戰鬥可使用一次，恢復豪氣並提高一次閃避機會；羈絆越深，效果越強。',
      unlockHint: '林沖抵達滄州後，與受過恩惠的李小二重逢。'
    },
    wuyong: {
      name: '吳用', title: '智多星・鄉學先生', avatar: '智', role: '軍師支援', skillName: '智多星妙計',
      description: '每場戰鬥可使用一次，削弱敵方筋骨與武力，並使英雄看破下一次攻勢。',
      unlockHint: '完成第四回「智取生辰綱」，見證七星聚義。'
    },
    chaogai: {
      name: '晁蓋', title: '托塔天王・東溪村保正', avatar: '晁', role: '破陣支援', skillName: '托塔天王破陣',
      description: '每場戰鬥可使用一次，重創敵方並恢復英雄豪氣；羈絆越深，威力越高。',
      unlockHint: '完成第五回，協助晁蓋避開官府追捕。'
    },
    daizong: {
      name: '戴宗', title: '神行太保・江州兩院押牢節級', avatar: '戴', role: '神行救援', skillName: '神行甲馬',
      description: '每場戰鬥可使用一次，立即恢復豪氣、提高閃避，並使下一次攻擊更容易重擊。',
      unlockHint: '在江州牢城結識神行太保戴宗。'
    },
    sunli: {
      name: '孫立', title: '病尉遲・登州兵馬提轄', avatar: '孫', role: '臥底破陣', skillName: '登州破陣',
      description: '每場戰鬥可使用一次，重創敵方、削弱筋骨，並替英雄架起一回合守勢。',
      unlockHint: '三打祝家莊時，接受孫立裡應外合之計。'
    },
    xuning: {
      name: '徐寧', title: '金槍手・禁軍教師', avatar: '徐', role: '鉤鐮破騎', skillName: '金槍鉤鐮',
      description: '每場戰鬥可使用一次，重創敵方、削弱筋骨，並有機會鉤倒敵手使其停一回合。',
      unlockHint: '第八回請金槍手徐寧上梁山，完成鉤鐮槍訓練。'
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
    },
    escortThugs: {
      name: '董超、薛霸', title: '野豬林行兇公人', avatar: '差', maxHp: 156, attack: 24, defense: 8,
      xp: 52, silver: 12, canFlee: true,
      moves: ['掄水火棍猛砸', '扯緊枷鎖勒來', '左右夾擊逼近']
    },
    luqian: {
      name: '陸謙與富安', title: '山神廟外的追命惡徒', avatar: '陸', maxHp: 226, attack: 30, defense: 11,
      xp: 135, silver: 32, canFlee: false,
      moves: ['挺朴刀直取心窩', '踏雪夾擊', '趁火勢揮刀猛斬']
    },
    cangzhouArena: {
      name: '滄州槍棒教頭', title: '牢城營演武高手', avatar: '槍', maxHp: 164, attack: 24, defense: 10,
      xp: 48, silver: 15, canFlee: true,
      moves: ['槍花點胸', '拖槍回掃', '進步攔腰扎來']
    },
    birthdayBandits: {
      name: '黃泥岡剪徑賊', title: '窺伺生辰綱的亡命徒', avatar: '劫', maxHp: 184, attack: 27, defense: 10,
      xp: 56, silver: 18, canFlee: false,
      moves: ['持朴刀搶近車隊', '扯住擔索猛拽', '從松林兩面包抄']
    },
    pursuitSoldiers: {
      name: '大名府追緝廂軍', title: '奉命追回失綱制使', avatar: '緝', maxHp: 206, attack: 29, defense: 11,
      xp: 62, silver: 16, canFlee: true,
      moves: ['列陣持槍逼近', '張弓封住去路', '喝令楊志束手就擒']
    },
    damingArena: {
      name: '大名府刀牌教頭', title: '留守司演武好手', avatar: '刀', maxHp: 188, attack: 27, defense: 11,
      xp: 52, silver: 16, canFlee: true,
      moves: ['盾牌撞開刀路', '雁翎刀斜劈', '踏步連環進逼']
    },
    yunchengPatrol: {
      name: '鄆城巡檢官差', title: '封鎖東溪村道路的追兵', avatar: '捕', maxHp: 214, attack: 29, defense: 12,
      xp: 66, silver: 18, canFlee: false,
      moves: ['持鐵尺攔腰打來', '以鎖鏈纏住去路', '結成雁行陣逼近']
    },
    yunchengArena: {
      name: '鄆城朴刀教頭', title: '縣衙演武場好手', avatar: '朴', maxHp: 196, attack: 28, defense: 12,
      xp: 55, silver: 17, canFlee: true,
      moves: ['朴刀斜肩劈落', '踏步翻腕挑刀', '以刀背猛撞胸口']
    },
    jiangzhouRuffians: {
      name: '揭陽嶺潑皮', title: '欺壓酒客的江州惡漢', avatar: '潑', maxHp: 220, attack: 30, defense: 12,
      xp: 62, silver: 20, canFlee: true,
      moves: ['掀桌揮棍亂打', '提拳撞開人群', '從兩側持刀圍上']
    },
    jiangzhouJailer: {
      name: '江州牢城禁子', title: '黃文炳調來的押牢打手', avatar: '牢', maxHp: 238, attack: 32, defense: 13,
      xp: 68, silver: 18, canFlee: false,
      moves: ['甩動鐵鏈纏來', '以水火棍猛擊', '鎖住退路一擁而上']
    },
    executionGuard: {
      name: '江州法場刀斧手', title: '刑臺前的重甲守軍', avatar: '刑', maxHp: 228, attack: 30, defense: 13,
      xp: 82, silver: 22, canFlee: false,
      moves: ['列盾封住刑臺', '長槍齊刺逼近', '刀斧手踏步重劈']
    },
    wuweiArmy: {
      name: '無為軍追兵', title: '沿江圍堵的官軍大隊', avatar: '軍', maxHp: 256, attack: 31, defense: 13,
      xp: 96, silver: 28, canFlee: false,
      moves: ['弓手齊射封路', '槍盾陣層層推進', '騎軍自側翼衝殺']
    },
    liangshanArena: {
      name: '梁山水軍頭目', title: '金沙灘聚義演武好手', avatar: '水', maxHp: 248, attack: 32, defense: 14,
      xp: 64, silver: 19, canFlee: true,
      moves: ['水火棍連點', '藤牌撞開架勢', '踏浪步貼身搶攻']
    },
    zhuGateGuard: {
      name: '祝家莊莊丁槍隊', title: '盤陀路口的鐵甲守軍', avatar: '莊', maxHp: 274, attack: 34, defense: 15,
      xp: 74, silver: 21, canFlee: false,
      moves: ['長槍自鹿角後齊刺', '絆馬索猛然收緊', '報事鐘響後兩翼包抄']
    },
    wangyingDuel: {
      name: '矮腳虎王英', title: '梁山先鋒・急性好戰', avatar: '王', maxHp: 224, attack: 31, defense: 12,
      xp: 70, silver: 16, canFlee: false,
      moves: ['挺槍搶進', '俯身掃腿', '虛晃一槍再刺肩頭']
    },
    zhuLong: {
      name: '祝龍與祝氏親軍', title: '祝家莊最後防線', avatar: '祝', maxHp: 318, attack: 36, defense: 16,
      xp: 132, silver: 38, canFlee: false,
      moves: ['祝龍飛馬挺槍', '親軍列盾壓進', '莊牆弩手交叉放箭']
    },
    zhujiaArena: {
      name: '獨龍岡雙刀教頭', title: '三莊聯盟演武好手', avatar: '岡', maxHp: 286, attack: 34, defense: 15,
      xp: 70, silver: 21, canFlee: true,
      moves: ['雙刀剪進', '翻身避刃反斬', '套索纏住兵器']
    },
    liangshanVanguard: {
      name: '梁山前哨步軍', title: '試探連環馬鋒勢的山寨軍', avatar: '哨', maxHp: 302, attack: 35, defense: 16,
      xp: 78, silver: 20, canFlee: false,
      moves: ['藤牌步軍交替掩護', '長槍隊刺向馬腹', '鹿角木封住騎路']
    },
    qingzhouGuard: {
      name: '青州慕容府親軍', title: '逼迫呼延灼屠村邀功的官兵', avatar: '青', maxHp: 326, attack: 37, defense: 17,
      xp: 88, silver: 24, canFlee: false,
      moves: ['親軍刀盾齊進', '弓手向村口放箭', '騎隊包抄退路']
    },
    chainArena: {
      name: '鉤鐮槍演武隊', title: '梁山步騎協同教頭', avatar: '鉤', maxHp: 314, attack: 36, defense: 17,
      xp: 76, silver: 22, canFlee: true,
      moves: ['鉤鐮槍低掃馬腿', '藤牌護住槍手前進', '短鉤扣住兵器回扯']
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
    { id: 'wutai', name: '五臺山', region: '清涼佛地', x: 94, y: 18, unlock: s => s.flags.wutaiReached },
    { id: 'boarforest', name: '野豬林', region: '東京郊外', x: 65, y: 18, unlock: s => s.flags.chapter3Started },
    { id: 'cangzhou', name: '滄州牢城', region: '河北滄州', x: 43, y: 22, unlock: s => s.flags.reachedCangzhou },
    { id: 'grassyard', name: '草料場', region: '滄州城外', x: 20, y: 18, unlock: s => s.flags.reachedGrassYard },
    { id: 'daming', name: '大名府', region: '河北北京', x: 10, y: 42, unlock: s => s.flags.chapter4Started },
    { id: 'huangnigang', name: '黃泥岡', region: '濟州山路', x: 48, y: 36, unlock: s => s.flags.reachedHuangnigang },
    { id: 'yuncheng', name: '鄆城縣', region: '濟州鄆城', x: 72, y: 63, unlock: s => s.flags.chapter5Started },
    { id: 'dongxi', name: '東溪村', region: '鄆城東鄉', x: 88, y: 34, unlock: s => s.flags.warnedChaoGai },
    { id: 'jiangzhou', name: '江州牢城', region: '潯陽江畔', x: 82, y: 80, unlock: s => s.flags.chapter6Started },
    { id: 'xunyang', name: '潯陽樓', region: '江州城南', x: 64, y: 86, unlock: s => s.flags.reachedXunyang },
    { id: 'execution', name: '江州法場', region: '江州城中', x: 49, y: 90, unlock: s => s.flags.executionSentenced },
    { id: 'liangshan', name: '梁山泊', region: '濟州水泊', x: 30, y: 88, unlock: s => s.flags.liangshanBaseUnlocked },
    { id: 'dulong', name: '獨龍岡', region: '濟州鄆城東', x: 12, y: 72, unlock: s => s.flags.chapter7Started },
    { id: 'zhujia', name: '祝家莊', region: '獨龍岡中莊', x: 12, y: 58, unlock: s => s.flags.firstAssaultFailed || s.flags.chapter7Complete },
    { id: 'hujia', name: '扈家莊', region: '獨龍岡西莊', x: 25, y: 52, unlock: s => s.flags.huPerspective || s.flags.chapter7Complete },
    { id: 'chaincamp', name: '連環馬大營', region: '濟州官軍營', x: 39, y: 70, unlock: s => s.flags.chapter8Started },
    { id: 'hookrange', name: '鉤鐮槍演武場', region: '梁山後寨', x: 26, y: 78, unlock: s => s.flags.metXuNing || s.flags.chapter8Complete },
    { id: 'qingzhou', name: '青州城外', region: '青州地界', x: 58, y: 72, unlock: s => s.flags.chainFormationBroken || s.flags.chapter8Complete }
  ];

  function createHero(id) {
    return cloneData(HERO_BLUEPRINTS[id]);
  }

  const defaultState = () => {
    const wusong = createHero('wusong');
    const luzhishen = createHero('luzhishen');
    const linchong = createHero('linchong');
    const yangzhi = createHero('yangzhi');
    const songjiang = createHero('songjiang');
    const likui = createHero('likui');
    const husanniang = createHero('husanniang');
    const huyanzhuo = createHero('huyanzhuo');
    return {
      version: VERSION,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sceneId: 'manor_start',
      location: 'manor',
      chapter: 1,
      activeHeroId: 'wusong',
      hero: cloneData(wusong),
      heroes: { wusong, luzhishen, linchong, yangzhi, songjiang, likui, husanniang, huyanzhuo },
      inventory: { herb: 2, bun: 2, wine: 1, staff: 1, robe: 1, ironCudgel: 1, officerCoat: 1, linSpear: 1, snowCloak: 1, yangSaber: 1, escortArmor: 1, clerkBlade: 1, clerkRobe: 1, twinAxes: 1, blackWarCoat: 1, sunMoonSabers: 1, redBrocadeArmor: 1, steelTwinWhips: 1, chainCavalryArmor: 1 },
      equipment: { weapon: 'staff', armor: 'robe' },
      equipments: {
        wusong: { weapon: 'staff', armor: 'robe' },
        luzhishen: { weapon: 'ironCudgel', armor: 'officerCoat' },
        linchong: { weapon: 'linSpear', armor: 'snowCloak' },
        yangzhi: { weapon: 'yangSaber', armor: 'escortArmor' },
        songjiang: { weapon: 'clerkBlade', armor: 'clerkRobe' },
        likui: { weapon: 'twinAxes', armor: 'blackWarCoat' },
        husanniang: { weapon: 'sunMoonSabers', armor: 'redBrocadeArmor' },
        huyanzhuo: { weapon: 'steelTwinWhips', armor: 'chainCavalryArmor' }
      },
      companions: {
        songjiang: { unlocked: false, bond: 1, wins: 0 },
        chaijin: { unlocked: false, bond: 1, wins: 0 },
        shijin: { unlocked: false, bond: 1, wins: 0 },
        lixiaoer: { unlocked: false, bond: 1, wins: 0 },
        wuyong: { unlocked: false, bond: 1, wins: 0 },
        chaogai: { unlocked: false, bond: 1, wins: 0 },
        daizong: { unlocked: false, bond: 1, wins: 0 },
        sunli: { unlocked: false, bond: 1, wins: 0 },
        xuning: { unlocked: false, bond: 1, wins: 0 }
      },
      team: { active: null },
      quests: {
        main_jingyang: { title: '景陽岡打虎', description: '離開柴進莊，翻越景陽岡，返鄉尋兄。', status: 'active', progress: '向陽谷縣進發' },
        side_rice: { title: '被劫的義米', description: '替岡下酒家追回遭山賊劫去、原要施給窮戶的米糧。', status: 'hidden', progress: '尚未聽聞' },
        main_zhengguan: { title: '拳打鎮關西', description: '在渭州救助金氏父女，懲治欺壓良善的鄭屠。', status: 'hidden', progress: '尚未開篇' },
        main_linchong: { title: '風雪山神廟', description: '林沖受高俅陷害刺配滄州，在草料場風雪夜揭破陸謙毒計。', status: 'hidden', progress: '尚未開篇' },
        main_birthday: { title: '智取生辰綱', description: '楊志奉命押送金珠寶貝，吳用等七星好漢則在黃泥岡設下智局。', status: 'hidden', progress: '尚未開篇' },
        main_songjiang: { title: '私放晁蓋・怒殺閻婆惜', description: '宋江在官法與江湖義氣間周旋，私報晁蓋逃難，並面對招文袋引發的危局。', status: 'hidden', progress: '尚未開篇' },
        main_jiangzhou: { title: '潯陽樓題詩・江州劫法場', description: '宋江刺配江州後結識戴宗、李逵，因潯陽樓題詩遭陷害，眾好漢冒死劫法場。', status: 'hidden', progress: '尚未開篇' },
        main_zhujia: { title: '三打祝家莊', description: '梁山三次進攻獨龍岡，以盤陀路情報、三莊聯盟與孫立臥底攻破祝家莊。', status: 'hidden', progress: '尚未開篇' },
        main_chainhorse: { title: '大破連環馬', description: '呼延灼奉命征討梁山，徐寧傳授鉤鐮槍法；梁山以步騎協同破解鐵甲連環馬。', status: 'hidden', progress: '尚未開篇' }
      },
      flags: {
        metSongJiang: false, leftManor: false, roadBanditCleared: false, reachedInn: false,
        riceQuestOffered: false, riceQuestDone: false, drankAtInn: 0, enteredForest: false,
        foundHerb: false, readNotice: false, restedTemple: false, tigerDefeated: false,
        reachedCounty: false, gameComplete: false, arenaWins: 0,
        chapter2Started: false, chapter2Complete: false, metShiJin: false, heardJinStory: false,
        jinFamilySaved: false, innThugsDefeated: false, reachedButcherStall: false,
        butcherOrders: 0, zhengDefeated: false, escapedWeizhou: false, wutaiReached: false,
        weizhouArenaWins: 0,
        chapter3Started: false, chapter3Complete: false, baihutangCautious: false,
        boarForestCleared: false, reachedCangzhou: false, metLiXiaoer: false,
        investigatedLuqian: false, reachedGrassYard: false, grassYardBurned: false,
        luqianDefeated: false, cangzhouArenaWins: 0,
        chapter4Started: false, chapter4Complete: false, acceptedBirthdayEscort: false,
        escortDiscipline: 0, escortMorale: 2, birthdayBanditsDefeated: false,
        reachedHuangnigang: false, qixingPerspective: false, strategyPlanScore: 0,
        birthdayCargoLost: false, pursuitDefeated: false, damingArenaWins: 0,
        chapter5Started: false, chapter5Complete: false, metHeTao: false,
        caseInsight: 0, caseDuelWon: false, warnedChaoGai: false, patrolDefeated: false,
        chaoLetterReceived: false, yanFoundLetter: false, yanOutcome: '',
        yunchengReputation: 50, yunchengArenaWins: 0,
        chapter6Started: false, chapter6Complete: false, reachedJiangzhou: false,
        metDaiZong: false, metLiKui: false, jiangzhouRuffiansDefeated: false,
        reachedXunyang: false, poemRisk: 0, antiPoemWritten: false, executionSentenced: false,
        letterPaperChecked: false, letterSealChecked: false, letterToneChecked: false,
        fakeLetterScore: 0, fakeLetterExposed: false, jailerDefeated: false,
        executionStage: 0, executionRescued: false, liangshanBaseUnlocked: false,
        liangshanArenaWins: 0,
        chapter7Started: false, chapter7Complete: false, dulongReached: false,
        firstAssaultScouted: false, firstAssaultFailed: false, huPerspective: false,
        huDuelWon: false, huCaptured: false, allianceReputation: 0, liYingAllied: false,
        metSunLi: false, infiltrationReady: false, fortressWon: false,
        zhuLongDefeated: false, zhujiaArenaWins: 0, villageProtected: false,
        chapter8Started: false, chapter8Complete: false, imperialCommission: false,
        chainDiscipline: 1, horseCare: 1, firstChainAttackWon: false,
        metTangLong: false, metXuNing: false, hookTrainingScore: 0,
        chainFormationBroken: false, qingzhouGuardDefeated: false,
        huyanJoined: false, chainArenaWins: 0, expeditionCount: 0
      },
      log: ['第一回開篇：武松客居柴進莊。'],
      battle: null,
      strategyBattle: null,
      caseBattle: null,
      fortressBattle: null,
      chainBattle: null,
      base: { timber: 3, stone: 2, grain: 5, hall: 1, infirmary: 1, forge: 1, granary: 1, armory: 1 },
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
  let strategyLocked = false;
  let caseLocked = false;
  let fortressLocked = false;
  let chainLocked = false;
  let availableVoices = [];
  let lastNarratedSceneId = '';
  let lastNarratedBattleKey = '';
  let speechToken = 0;

  const screenRoot = $('#screenRoot');
  const modalRoot = $('#modalRoot');
  const toastRoot = $('#toastRoot');

  function loadPrefs() {
    try {
      const saved = JSON.parse(storage.getItem(PREF_KEY));
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
    storage.setItem(PREF_KEY, JSON.stringify(prefs));
  }

  function hasSave() {
    return Boolean(storage.getItem(SAVE_KEY));
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
    storage.setItem(SAVE_KEY, JSON.stringify(state));
    if (showNotice) {
      toast('篇章已收入本機存檔。');
      tone('save');
    }
    refreshTitleSaveHint();
  }

  function loadGame() {
    try {
      const parsed = JSON.parse(storage.getItem(SAVE_KEY));
      if (!parsed || !parsed.hero || !parsed.sceneId) throw new Error('invalid save');
      state = migrateState(parsed);
      storage.setItem(SAVE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      console.warn(error);
      storage.removeItem(SAVE_KEY);
      toast('存檔格式異常，已無法讀取。');
      return false;
    }
  }

  function migrateState(saved) {
    const base = defaultState();
    const guessedActive = saved.activeHeroId || (/^魯/.test(saved.hero?.name || '') ? 'luzhishen' : /^林/.test(saved.hero?.name || '') ? 'linchong' : /^楊/.test(saved.hero?.name || '') ? 'yangzhi' : /^宋/.test(saved.hero?.name || '') ? 'songjiang' : /^李/.test(saved.hero?.name || '') ? 'likui' : /^扈/.test(saved.hero?.name || '') ? 'husanniang' : /^呼/.test(saved.hero?.name || '') ? 'huyanzhuo' : 'wusong');
    const savedHeroes = saved.heroes || {};
    const savedEquipments = saved.equipments || {};
    const oldHeroTarget = ['luzhishen', 'linchong', 'yangzhi', 'songjiang', 'likui', 'husanniang', 'huyanzhuo'].includes(guessedActive) ? guessedActive : 'wusong';
    const heroes = {
      wusong: { ...base.heroes.wusong, ...(savedHeroes.wusong || (oldHeroTarget === 'wusong' ? saved.hero : {})) },
      luzhishen: { ...base.heroes.luzhishen, ...(savedHeroes.luzhishen || (oldHeroTarget === 'luzhishen' ? saved.hero : {})) },
      linchong: { ...base.heroes.linchong, ...(savedHeroes.linchong || (oldHeroTarget === 'linchong' ? saved.hero : {})) },
      yangzhi: { ...base.heroes.yangzhi, ...(savedHeroes.yangzhi || (oldHeroTarget === 'yangzhi' ? saved.hero : {})) },
      songjiang: { ...base.heroes.songjiang, ...(savedHeroes.songjiang || (oldHeroTarget === 'songjiang' ? saved.hero : {})) },
      likui: { ...base.heroes.likui, ...(savedHeroes.likui || (oldHeroTarget === 'likui' ? saved.hero : {})) },
      husanniang: { ...base.heroes.husanniang, ...(savedHeroes.husanniang || (oldHeroTarget === 'husanniang' ? saved.hero : {})) },
      huyanzhuo: { ...base.heroes.huyanzhuo, ...(savedHeroes.huyanzhuo || (oldHeroTarget === 'huyanzhuo' ? saved.hero : {})) }
    };
    const equipments = {
      wusong: { ...base.equipments.wusong, ...(savedEquipments.wusong || (oldHeroTarget === 'wusong' ? saved.equipment : {})) },
      luzhishen: { ...base.equipments.luzhishen, ...(savedEquipments.luzhishen || (oldHeroTarget === 'luzhishen' ? saved.equipment : {})) },
      linchong: { ...base.equipments.linchong, ...(savedEquipments.linchong || (oldHeroTarget === 'linchong' ? saved.equipment : {})) },
      yangzhi: { ...base.equipments.yangzhi, ...(savedEquipments.yangzhi || (oldHeroTarget === 'yangzhi' ? saved.equipment : {})) },
      songjiang: { ...base.equipments.songjiang, ...(savedEquipments.songjiang || (oldHeroTarget === 'songjiang' ? saved.equipment : {})) },
      likui: { ...base.equipments.likui, ...(savedEquipments.likui || (oldHeroTarget === 'likui' ? saved.equipment : {})) },
      husanniang: { ...base.equipments.husanniang, ...(savedEquipments.husanniang || (oldHeroTarget === 'husanniang' ? saved.equipment : {})) },
      huyanzhuo: { ...base.equipments.huyanzhuo, ...(savedEquipments.huyanzhuo || (oldHeroTarget === 'huyanzhuo' ? saved.equipment : {})) }
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
        shijin: { ...base.companions.shijin, ...(saved.companions?.shijin || {}) },
        lixiaoer: { ...base.companions.lixiaoer, ...(saved.companions?.lixiaoer || {}) },
        wuyong: { ...base.companions.wuyong, ...(saved.companions?.wuyong || {}) },
        chaogai: { ...base.companions.chaogai, ...(saved.companions?.chaogai || {}) },
        daizong: { ...base.companions.daizong, ...(saved.companions?.daizong || {}) },
        sunli: { ...base.companions.sunli, ...(saved.companions?.sunli || {}) },
        xuning: { ...base.companions.xuning, ...(saved.companions?.xuning || {}) }
      },
      team: { ...base.team, ...(saved.team || {}) },
      quests: { ...base.quests, ...saved.quests },
      flags: { ...base.flags, ...saved.flags },
      base: { ...base.base, ...(saved.base || {}) },
      version: VERSION,
      battle: null,
      strategyBattle: null,
      caseBattle: null,
      fortressBattle: null,
      chainBattle: null,
      lastTickAt: Date.now()
    };
    if (merged.flags.metSongJiang) merged.companions.songjiang.unlocked = true;
    if (merged.flags.leftManor) merged.companions.chaijin.unlocked = true;
    if (merged.flags.metShiJin) merged.companions.shijin.unlocked = true;
    if (merged.flags.metLiXiaoer) merged.companions.lixiaoer.unlocked = true;
    if (merged.flags.chapter4Complete) merged.companions.wuyong.unlocked = true;
    if (merged.flags.chapter5Complete) merged.companions.chaogai.unlocked = true;
    if (merged.flags.metDaiZong || merged.flags.chapter6Complete) merged.companions.daizong.unlocked = true;
    if (merged.flags.metSunLi || merged.flags.chapter7Complete) merged.companions.sunli.unlocked = true;
    if (merged.flags.metXuNing || merged.flags.chapter8Complete) merged.companions.xuning.unlocked = true;
    if (merged.flags.chapter2Started || merged.flags.chapter2Complete || guessedActive === 'luzhishen') merged.heroes.luzhishen.unlocked = true;
    if (merged.flags.chapter3Started || merged.flags.chapter3Complete || guessedActive === 'linchong') merged.heroes.linchong.unlocked = true;
    if (merged.flags.chapter4Started || merged.flags.chapter4Complete || guessedActive === 'yangzhi') merged.heroes.yangzhi.unlocked = true;
    if (merged.flags.chapter5Started || merged.flags.chapter5Complete || guessedActive === 'songjiang') merged.heroes.songjiang.unlocked = true;
    if (merged.flags.chapter6Started || merged.flags.chapter6Complete || guessedActive === 'likui') merged.heroes.likui.unlocked = true;
    if (merged.flags.huPerspective || merged.flags.chapter7Complete || guessedActive === 'husanniang') merged.heroes.husanniang.unlocked = true;
    if (merged.flags.chapter8Started || merged.flags.chapter8Complete || guessedActive === 'huyanzhuo') merged.heroes.huyanzhuo.unlocked = true;
    if (!merged.heroes[merged.activeHeroId]?.unlocked) merged.activeHeroId = 'wusong';
    merged.hero = cloneData(merged.heroes[merged.activeHeroId]);
    merged.equipment = { ...merged.equipments[merged.activeHeroId] };
    if (!merged.team.active || !merged.companions[merged.team.active]?.unlocked) {
      merged.team.active = merged.companions.songjiang.unlocked ? 'songjiang' : merged.companions.chaijin.unlocked ? 'chaijin' : merged.companions.shijin.unlocked ? 'shijin' : merged.companions.lixiaoer.unlocked ? 'lixiaoer' : merged.companions.wuyong.unlocked ? 'wuyong' : merged.companions.chaogai.unlocked ? 'chaogai' : merged.companions.daizong.unlocked ? 'daizong' : merged.companions.sunli.unlocked ? 'sunli' : merged.companions.xuning.unlocked ? 'xuning' : null;
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
      toast('完成第二回後，才可切換已完成章回的主角。');
      return;
    }
    if (id === 'linchong' && !state.flags.chapter3Complete) {
      toast('完成第三回後，林沖才會正式加入英雄譜。');
      return;
    }
    if (id === 'yangzhi' && !state.flags.chapter4Complete) {
      toast('完成第四回後，楊志才會正式加入英雄譜。');
      return;
    }
    if (id === 'songjiang' && !state.flags.chapter5Complete) {
      toast('完成第五回後，宋江才會正式加入英雄譜。');
      return;
    }
    if (id === 'likui' && !state.flags.chapter6Complete) {
      toast('完成第六回後，李逵才會正式加入英雄譜。');
      return;
    }
    if (id === 'husanniang' && !state.flags.chapter7Complete) {
      toast('完成第七回後，扈三娘才會正式加入英雄譜。');
      return;
    }
    if (id === 'huyanzhuo' && !state.flags.chapter8Complete) {
      toast('完成第八回後，呼延灼才會正式加入英雄譜。');
      return;
    }
    if (!setActiveHero(id)) return;
    state.chapter = { wusong: 1, luzhishen: 2, linchong: 3, yangzhi: 4, songjiang: 5, likui: 6, husanniang: 7, huyanzhuo: 8 }[id] || 1;
    closeModal();
    addLog(`目前操控英雄切換為「${state.hero.name}」。`);
    const homes = { wusong: 'county_free', luzhishen: 'wutai_free', linchong: 'cangzhou_free', yangzhi: 'daming_free', songjiang: state.flags.chapter6Complete ? 'jiangzhou_free' : 'yuncheng_free', likui: 'liangshan_free', husanniang: 'zhujia_free', huyanzhuo: 'chainhorse_free' };
    goScene(homes[id]);
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

  function startChapterThree() {
    if (!state?.flags?.chapter2Complete) {
      toast('須先完成第二回「拳打鎮關西」。');
      return;
    }
    if (state.flags.chapter3Complete) {
      switchHero('linchong');
      return;
    }
    state.flags.chapter3Started = true;
    state.heroes.linchong.unlocked = true;
    state.quests.main_linchong.status = 'active';
    if (state.quests.main_linchong.progress === '尚未開篇') state.quests.main_linchong.progress = '東京白虎堂前，林教頭遭人設局';
    setActiveHero('linchong');
    state.chapter = 3;
    const resumeScene = state.flags.luqianDefeated ? 'mountain_temple_after'
      : state.flags.grassYardBurned ? 'mountain_temple'
        : state.flags.reachedGrassYard ? 'grass_yard'
          : state.flags.investigatedLuqian ? 'grass_assignment'
            : state.flags.metLiXiaoer ? 'cangzhou_tavern'
              : state.flags.reachedCangzhou ? 'cangzhou_camp'
                : state.flags.boarForestCleared ? 'cangzhou_road' : 'lin_baihutang';
    if (!state.log.some(entry => entry.includes('第三回開篇'))) addLog('第三回開篇：林教頭誤入白虎堂，命運轉折。');
    goScene(resumeScene);
    tone('start');
  }

  function finishChapterThree() {
    if (!state.flags.chapter3Complete) {
      state.flags.chapter3Complete = true;
      state.flags.luqianDefeated = true;
      state.quests.main_linchong.status = 'completed';
      state.quests.main_linchong.progress = '風雪山神廟手刃仇敵，投奔梁山之路已開';
      state.hero.title = '豹子頭・風雪英雄';
      addItem('grassYardSeal', 1);
      gainXp(65);
      syncActiveHero();
    }
    goScene('chapter3_end');
    saveGame(false);
  }


  function startChapterFour() {
    if (!state?.flags?.chapter3Complete) {
      toast('須先完成第三回「風雪山神廟」。');
      return;
    }
    if (state.flags.chapter4Complete) {
      switchHero('yangzhi');
      return;
    }
    state.flags.chapter4Started = true;
    state.heroes.yangzhi.unlocked = true;
    state.quests.main_birthday.status = 'active';
    if (state.quests.main_birthday.progress === '尚未開篇') state.quests.main_birthday.progress = '大名府梁中書點將，楊志奉命護送生辰綱';
    setActiveHero('yangzhi');
    state.chapter = 4;
    const resumeScene = state.flags.pursuitDefeated ? 'yangzhi_escape_after'
      : state.flags.birthdayCargoLost ? 'yangzhi_awake'
        : state.flags.qixingPerspective ? 'qixing_plan'
          : state.flags.reachedHuangnigang ? 'huangnigang_arrive'
            : state.flags.birthdayBanditsDefeated ? 'escort_after_bandits'
              : state.flags.acceptedBirthdayEscort ? 'escort_depart' : 'daming_mansion';
    if (!state.log.some(entry => entry.includes('第四回開篇'))) addLog('第四回開篇：青面獸楊志奉命押送生辰綱。');
    goScene(resumeScene);
    tone('start');
  }

  function finishChapterFour() {
    if (!state.flags.chapter4Complete) {
      state.flags.chapter4Complete = true;
      state.flags.birthdayCargoLost = true;
      state.quests.main_birthday.status = 'completed';
      state.quests.main_birthday.progress = '黃泥岡七星聚義，楊志失綱亡命';
      state.hero.title = '青面獸・失綱亡命';
      unlockCompanion('wuyong');
      addItem('birthdaySeal', 1);
      addItem('dateScoop', 1);
      gainXp(75);
      syncActiveHero();
    }
    goScene('chapter4_end');
    saveGame(false);
  }

  function startChapterFive() {
    if (!state?.flags?.chapter4Complete) {
      toast('須先完成第四回「智取生辰綱」。');
      return;
    }
    if (state.flags.chapter5Complete) {
      switchHero('songjiang');
      return;
    }
    state.flags.chapter5Started = true;
    state.heroes.songjiang.unlocked = true;
    state.quests.main_songjiang.status = 'active';
    if (state.quests.main_songjiang.progress === '尚未開篇') state.quests.main_songjiang.progress = '鄆城縣衙收到追查生辰綱的緊急公文';
    setActiveHero('songjiang');
    state.chapter = 5;
    if (state.team.active === 'songjiang') state.team.active = state.companions.wuyong.unlocked ? 'wuyong' : state.companions.chaijin.unlocked ? 'chaijin' : null;
    const resumeScene = state.flags.yanFoundLetter ? 'yan_confrontation'
      : state.flags.chaoLetterReceived ? 'songjiang_home'
        : state.flags.warnedChaoGai ? 'dongxi_depart'
          : state.flags.caseDuelWon ? 'night_ride'
            : state.flags.metHeTao ? 'case_files' : 'yuncheng_yamen';
    if (!state.log.some(entry => entry.includes('第五回開篇'))) addLog('第五回開篇：宋押司在鄆城縣衙收到生辰綱追捕公文。');
    goScene(resumeScene);
    tone('start');
  }

  function finishChapterFive(outcome) {
    if (!state.flags.chapter5Complete) {
      state.flags.chapter5Complete = true;
      state.flags.yanOutcome = outcome || state.flags.yanOutcome || 'original';
      state.quests.main_songjiang.status = 'completed';
      const outcomes = {
        mercy: '保全書信與人命，夜走柴進莊避禍',
        original: '招文袋事發，宋江怒殺閻婆惜後亡命',
        exile: '忍辱棄家，帶罪名遠走江湖'
      };
      state.quests.main_songjiang.progress = outcomes[state.flags.yanOutcome] || outcomes.original;
      state.hero.title = state.flags.yanOutcome === 'mercy' ? '及時雨・義全人未傷' : '及時雨・亡命江湖';
      unlockCompanion('chaogai');
      addItem('yunchengSeal', 1);
      gainXp(state.flags.yanOutcome === 'mercy' ? 90 : 78);
      syncActiveHero();
    }
    goScene('chapter5_end');
    saveGame(false);
  }


  function startChapterSix() {
    if (!state?.flags?.chapter5Complete) {
      toast('須先完成第五回「宋江私放晁蓋」。');
      return;
    }
    if (state.flags.chapter6Complete) {
      switchHero('likui');
      return;
    }
    state.flags.chapter6Started = true;
    state.flags.reachedJiangzhou = true;
    state.quests.main_jiangzhou.status = 'active';
    if (state.quests.main_jiangzhou.progress === '尚未開篇') state.quests.main_jiangzhou.progress = '宋江刺配江州，前往牢城營報到';
    setActiveHero('songjiang');
    state.chapter = 6;
    const resumeScene = state.flags.executionRescued ? 'white_dragon_temple'
      : state.flags.executionStage >= 1 ? 'execution_break'
        : state.flags.executionSentenced ? 'execution_notice'
          : state.flags.reachedXunyang ? 'xunyang_tower'
            : state.flags.metLiKui ? 'jiangzhou_tavern_after' : state.flags.metDaiZong ? 'likui_meet' : 'jiangzhou_arrival';
    if (!state.log.some(entry => entry.includes('第六回開篇'))) addLog('第六回開篇：宋江刺配江州，潯陽江畔風波將起。');
    goScene(resumeScene);
    tone('start');
  }

  function finishChapterSix() {
    if (!state.flags.chapter6Complete) {
      state.flags.chapter6Complete = true;
      state.flags.executionRescued = true;
      state.flags.liangshanBaseUnlocked = true;
      state.quests.main_jiangzhou.status = 'completed';
      state.quests.main_jiangzhou.progress = '江州劫法場成功，白龍廟聚義，同上梁山';
      state.heroes.likui.unlocked = true;
      unlockCompanion('daizong');
      addItem('jiangzhouDrum', 1);
      addItem('liangshanBanner', 1);
      state.base.timber = Math.max(3, state.base.timber || 0);
      state.base.stone = Math.max(2, state.base.stone || 0);
      gainXp(105);
      syncActiveHero();
    }
    goScene('chapter6_end');
    saveGame(false);
  }

  function startChapterSeven() {
    if (!state?.flags?.chapter6Complete) {
      toast('須先完成第六回「江州劫法場」。');
      return;
    }
    if (state.flags.chapter7Complete) {
      switchHero('husanniang');
      return;
    }
    state.flags.chapter7Started = true;
    state.flags.dulongReached = true;
    state.quests.main_zhujia.status = 'active';
    if (state.quests.main_zhujia.progress === '尚未開篇') state.quests.main_zhujia.progress = '梁山聚義廳議定出兵獨龍岡';
    setActiveHero('songjiang');
    state.chapter = 7;
    const resumeScene = state.flags.zhuLongDefeated ? 'zhujia_after'
      : state.flags.fortressWon ? 'fortress_breached'
        : state.flags.infiltrationReady ? 'third_assault'
          : state.flags.huCaptured ? 'liying_negotiation'
            : state.flags.huPerspective ? 'hujia_perspective'
              : state.flags.firstAssaultFailed ? 'pantou_retreat' : 'liangshan_council';
    if (!state.log.some(entry => entry.includes('第七回開篇'))) addLog('第七回開篇：梁山出兵獨龍岡，三打祝家莊。');
    goScene(resumeScene);
    tone('start');
  }

  function finishChapterSeven() {
    if (!state.flags.chapter7Complete) {
      state.flags.chapter7Complete = true;
      state.flags.fortressWon = true;
      state.flags.zhuLongDefeated = true;
      state.flags.liangshanBaseUnlocked = true;
      state.quests.main_zhujia.status = 'completed';
      state.quests.main_zhujia.progress = '三路破莊、護民開倉，扈三娘與孫立同入梁山';
      state.heroes.husanniang.unlocked = true;
      state.heroes.husanniang.name = '扈三娘';
      state.heroes.husanniang.title = '一丈青・梁山女將';
      unlockCompanion('sunli');
      addItem('pantuoMap', 1);
      addItem('allianceToken', 1);
      state.base.timber += 3;
      state.base.stone += 2;
      state.base.grain += state.flags.villageProtected ? 7 : 4;
      if (state.activeHeroId !== 'husanniang') setActiveHero('husanniang');
      state.hero.name = '扈三娘';
      state.hero.title = '一丈青・梁山女將';
      gainXp(120);
      syncActiveHero();
    }
    goScene('chapter7_end');
    saveGame(false);
  }


  function startChapterEight() {
    if (!state?.flags?.chapter7Complete) {
      toast('須先完成第七回「三打祝家莊」。');
      return;
    }
    if (state.flags.chapter8Complete) {
      switchHero('huyanzhuo');
      return;
    }
    state.flags.chapter8Started = true;
    state.flags.imperialCommission = true;
    state.heroes.huyanzhuo.unlocked = true;
    state.quests.main_chainhorse.status = 'active';
    if (state.quests.main_chainhorse.progress === '尚未開篇') state.quests.main_chainhorse.progress = '呼延灼奉詔統領鐵甲連環馬，進軍梁山';
    setActiveHero('huyanzhuo');
    state.chapter = 8;
    const resumeScene = state.flags.qingzhouGuardDefeated ? 'qingzhou_after'
      : state.flags.chainFormationBroken ? 'huyan_qingzhou'
        : state.flags.metXuNing ? 'hook_training'
          : state.flags.firstChainAttackWon ? 'liangshan_chain_council' : 'imperial_command';
    if (!state.log.some(entry => entry.includes('第八回開篇'))) addLog('第八回開篇：呼延灼奉詔征梁山，鐵甲連環馬壓境。');
    goScene(resumeScene);
    tone('start');
  }

  function finishChapterEight() {
    if (!state.flags.chapter8Complete) {
      state.flags.chapter8Complete = true;
      state.flags.chainFormationBroken = true;
      state.flags.huyanJoined = true;
      state.flags.liangshanBaseUnlocked = true;
      state.quests.main_chainhorse.status = 'completed';
      state.quests.main_chainhorse.progress = '鉤鐮槍大破連環馬，呼延灼棄苛令而歸梁山';
      state.heroes.huyanzhuo.unlocked = true;
      state.heroes.huyanzhuo.title = '雙鞭將・梁山馬軍統領';
      unlockCompanion('xuning');
      addItem('hookLanceManual', 1);
      addItem('chainHorseInsignia', 1);
      state.base.timber += 3;
      state.base.stone += 3;
      state.base.grain += 3;
      state.base.armory = Math.max(1, state.base.armory || 1);
      if (state.activeHeroId !== 'huyanzhuo') setActiveHero('huyanzhuo');
      state.hero.title = '雙鞭將・梁山馬軍統領';
      gainXp(135);
      syncActiveHero();
    }
    goScene('chapter8_end');
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
      const saved = JSON.parse(storage.getItem(SAVE_KEY));
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
    if (!id || id === state.activeHeroId || !COMPANIONS[id] || !state.companions?.[id]?.unlocked) return null;
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
      text: () => `街市上人人都識得打虎武松。賣炊餅的、打鐵的、跑堂的紛紛向你招呼。縣衙旁新設演武擂臺，正可帶上江湖同伴磨合招式。${state.flags.chapter3Complete ? '<p>魯智深與林沖也已完成各自章回，三位英雄如今可在英雄譜自由切換。</p>' : state.flags.chapter2Complete ? '<p>魯智深已在五臺山落髮；東京的林教頭亦將迎來風雪中的命運轉折。</p>' : '<p>說書人口中，渭州還有一位性烈如火的魯提轄，另一段不平事正待揭開。</p>'}`,
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
        if (state.flags.chapter2Complete && !state.flags.chapter3Complete) choices.push({ label: state.flags.chapter3Started ? '返回第三回進度' : '開啟第三回：風雪山神廟', action: () => startChapterThree() });
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
        { label: state.flags.chapter3Complete ? '切換至林沖章回' : state.flags.chapter3Started ? '續讀第三回：風雪山神廟' : '開啟第三回：風雪山神廟', action: () => startChapterThree() },
        { label: '查看兩回總成果', action: () => openSummary() },
        { label: '留在五臺山整備', action: () => goScene('wutai_free') },
        { label: '開啟英雄譜切換主角', action: () => openRoster() },
        { label: '回到遊戲標題', action: () => { saveGame(); showTitle(); } }
      ]
    },
    wutai_free: {
      location: 'wutai', scene: 'temple', region: '清涼佛地', name: '五臺山文殊院', caption: '演武坪・松風', speaker: '旁白',
      title: '花和尚初習禪杖',
      text: () => `魯智深雖披僧衣，豪氣未減。寺後演武坪可重溫棍棒招式；山門外亦有來往香客傳遞各地消息。${state.flags.chapter3Complete ? '武松、魯智深與林沖三位英雄均可自由切換。' : '林教頭在東京與滄州的風雪章回，正等待你開啟。'}`,
      choices: () => [
        { label: '到演武坪與渭州棒師切磋', action: () => startBattle('weizhouArena', 'weizhou_arena_win') },
        { label: '調整江湖同伴編成', action: () => openTeam() },
        { label: '在禪房休息，恢復全部狀態', action: () => { state.hero.hp = state.hero.maxHp; state.hero.sp = state.hero.maxSp; state.hero.drunk = 0; addLog('在五臺山禪房休息，狀態全復。'); renderGame(); } },
        { label: state.flags.chapter3Complete ? '切換英雄章回' : state.flags.chapter3Started ? '返回第三回進度' : '開啟第三回：風雪山神廟', action: () => state.flags.chapter3Complete ? openRoster() : startChapterThree() },
        { label: '查看章回總成果', action: () => openSummary() }
      ]
    },
    weizhou_free: {
      location: 'weizhou', scene: 'street', region: '關西重鎮', name: '渭州城', caption: '渭州舊事・章回追憶', speaker: '說書人',
      title: '狀元橋舊事',
      text: () => `說書人拍響醒木，講的正是魯提轄救金氏、三拳打死鎮關西的舊事。此處可重返演武場切磋，但已完成的鄭屠首領戰不會重置。`,
      choices: () => [
        { label: '到經略府演武場切磋', action: () => startBattle('weizhouArena', 'weizhou_arena_win') },
        { label: '返回五臺山', action: () => goScene('wutai_free') },
        { label: state.flags.chapter3Started ? '返回第三回進度' : '開啟第三回：風雪山神廟', action: () => startChapterThree() },
        { label: '切換英雄章回', action: () => openRoster() }
      ]
    },
    lin_baihutang: {
      location: 'boarforest', scene: 'hall', region: '東京汴梁', name: '太尉府・白虎節堂', caption: '白虎堂・陰雲', speaker: '旁白',
      title: '寶刀引路，誤入白虎堂',
      text: () => `八十萬禁軍教頭林沖新得一口寶刀。兩名承局接連引路，說太尉府有人要看刀。你行過數重門戶，竟被引入軍機重地白虎節堂。<p>堂上空無一人，門外腳步卻忽然密集。高俅的喝聲已從廊下傳來：「誰敢持刀擅入白虎堂！」</p>`,
      choices: () => [
        { label: '先察門窗與路線，沉著應對', action: () => { state.flags.baihutangCautious = true; state.quests.main_linchong.progress = '白虎堂蒙冤，刺配滄州'; changeMorality(2, '危局中仍不濫傷無辜'); goScene('lin_exile'); } },
        { label: '持刀出堂，當面質問高俅', action: () => { state.flags.baihutangCautious = false; state.quests.main_linchong.progress = '白虎堂蒙冤，刺配滄州'; goScene('lin_exile'); } }
      ]
    },
    lin_exile: {
      location: 'boarforest', scene: 'road', region: '東京郊外', name: '刺配滄州古道', caption: '古道・枷鎖沉重', speaker: '旁白',
      title: '一紙脊杖，萬里離京',
      text: () => `開封府雖知高俅設局，仍判你脊杖二十、刺配滄州。公人董超、薛霸奉命押送，沿途以滾水燙腳、鐵枷勒頸，步步催逼。<p>前方密林陰森，兩人交換眼色，把你推入一片荒僻松林——野豬林。</p>`,
      choices: () => [
        { label: '忍住傷勢，暗中鬆動枷鎖', action: () => { state.hero.hp = Math.max(72, state.hero.hp - (state.flags.baihutangCautious ? 8 : 15)); goScene('boar_forest'); } },
        { label: '沿路高聲說明冤情，留下人證', action: () => { changeMorality(3, '受辱仍盼以公理自清'); state.hero.sp = clamp(state.hero.sp + 5, 0, state.hero.maxSp); goScene('boar_forest'); } }
      ]
    },
    boar_forest: {
      location: 'boarforest', scene: 'forest', region: '東京郊外', name: '野豬林', caption: '野豬林・殺機', speaker: '董超',
      title: '水火棍起，故人禪杖到',
      text: () => `董超把你綁在樹上，薛霸提起水火棍，冷笑道：「休怪我等，太尉府有人買你的性命。」<p>林深處似有鳥雀驚飛。你知道魯智深一路暗中相護，但此刻仍可選擇先靠自己破局。</p>`,
      choices: () => [
        { label: '掙開鬆動的枷鎖，迎戰兩名公人', action: () => startBattle('escortThugs', 'escort_win') },
        { label: '高聲喝破毒計，等待林中援手', action: () => { state.flags.boarForestCleared = true; changeMorality(5, '念及公人受命，未取二人性命'); state.quests.main_linchong.progress = '魯智深野豬林相救，繼續前往滄州'; goScene('boar_forest_after'); } }
      ]
    },
    boar_forest_after: {
      location: 'boarforest', scene: 'forest', region: '東京郊外', name: '野豬林', caption: '松林・禪杖橫空', speaker: '魯智深',
      title: '花和尚大鬧野豬林',
      text: () => `一株松樹轟然倒下，魯智深倒拖禪杖躍出，喝道：「洒家在野豬林等你們多時！」董超、薛霸嚇得面無人色。<p>林沖攔住智深，不願濫殺兩個公人，只令他們好生護送。兄弟在長亭灑淚而別，你繼續向滄州而行。</p>`,
      choices: () => [{ label: '收下柴進薦書，前往滄州牢城營', action: () => { if (!state.inventory.cangzhouLetter) addItem('cangzhouLetter', 1); state.flags.reachedCangzhou = true; state.quests.main_linchong.progress = '抵達滄州牢城營報到'; goScene('cangzhou_camp'); } }]
    },
    cangzhou_road: {
      location: 'cangzhou', scene: 'snowroad', region: '河北滄州', name: '滄州城外', caption: '北風・長路', speaker: '旁白',
      title: '滄州在望',
      text: () => `北地風硬如刀，滄州城牆已在暮色裡浮現。柴進薦書藏在貼身處，前方牢城營正等著新配軍報到。`,
      choices: () => [{ label: '進入滄州牢城營', action: () => { state.flags.reachedCangzhou = true; goScene('cangzhou_camp'); } }]
    },
    cangzhou_camp: {
      location: 'cangzhou', scene: 'camp', region: '河北滄州', name: '滄州牢城營', caption: '牢城營・點名', speaker: '差撥',
      title: '百殺威棒，薦書解厄',
      text: () => `差撥原要按例索取銀兩、施打一百殺威棒。管營看過柴進薦書，暗中吩咐免打，只將你留在營中看守天王堂。<p>數日後，一名酒店掌櫃遠遠認出你，竟是昔日在東京受過恩惠的李小二。</p>`,
      choices: () => [{ label: '與李小二重逢，聽他說滄州近況', action: () => { state.flags.metLiXiaoer = true; unlockCompanion('lixiaoer'); state.quests.main_linchong.progress = '留意陸謙等人在滄州的行蹤'; goScene('cangzhou_tavern'); } }]
    },
    cangzhou_tavern: {
      location: 'cangzhou', scene: 'tavern', region: '河北滄州', name: '李小二酒店', caption: '酒店・密語', speaker: '李小二',
      title: '東京來客，密室低語',
      text: () => `李小二低聲說，近日有三個東京口音的客人與管營差撥在密室商議，為首者正像林教頭舊識陸謙。他偷聽到「草料場」「火燒」「不留活口」幾個字。<p>外頭北風捲雪，這顯然不是普通差事。</p>`,
      choices: () => [
        { label: '先查看密室留下的酒盞與腳印', action: () => { state.flags.investigatedLuqian = true; changeMorality(2, '查明證據後再作決斷'); state.quests.main_linchong.progress = '陸謙毒計露出端倪，提防草料場差事'; goScene('grass_assignment'); } },
        { label: '立即去找陸謙對質', action: () => { state.flags.investigatedLuqian = false; goScene('grass_assignment'); } }
      ]
    },
    grass_assignment: {
      location: 'grassyard', scene: 'snowroad', region: '滄州城外', name: '草料場古道', caption: '朔風・大雪', speaker: '旁白',
      title: '差遣忽至，風雪壓城',
      text: () => `管營忽將你調往城外草料場看守。一路大雪紛飛，你買了酒與牛肉，獨自來到草屋。<p>夜裡風勢更急，草屋屋頂被積雪壓塌。你只得抱著花槍，往不遠處山神廟暫避。</p>`,
      choices: () => [{ label: '提槍前往山神廟避雪', action: () => { state.flags.reachedGrassYard = true; state.quests.main_linchong.progress = '草屋倒塌，前往山神廟避雪'; goScene('grass_yard'); } }]
    },
    grass_yard: {
      location: 'grassyard', scene: 'snow', region: '滄州城外', name: '草料場', caption: '風雪夜・火光', speaker: '旁白',
      title: '不是天火，是人心之火',
      text: () => `你才到山神廟不久，草料場忽然火光沖天。隔著廟門，三個人踩雪而來。陸謙笑道：「草場一燒，林沖縱不死，也要問個死罪。」<p>${state.flags.investigatedLuqian ? '你早從酒盞與腳印確認來人身份，心中已有準備，決戰時敵手初始氣力將受影響。' : '直到此刻，你才完全看清這場毒計。'}</p>`,
      choices: () => [{ label: '以石抵門，屏息聽清全部毒計', action: () => { state.flags.grassYardBurned = true; goScene('mountain_temple'); } }]
    },
    mountain_temple: {
      location: 'grassyard', scene: 'snow', region: '滄州城外', name: '山神廟', caption: '古廟・槍鋒映火', speaker: '林沖',
      title: '忍無可忍，便無須再忍',
      text: () => `陸謙、富安與差撥推門而入。你橫槍立在風雪中，問道：「我與你自幼相交，何故一步步取我性命？」<p>陸謙拔刀後退，火光照出他驚恐的臉。東京的忍讓、白虎堂的冤屈、野豬林的殺機，至此都化作槍尖一點寒芒。</p>`,
      choices: () => [{ label: '挺槍迎敵，決戰山神廟', action: () => { startBattle('luqian', 'luqian_win'); if (state.battle && state.flags.investigatedLuqian) { state.battle.hp -= 28; state.battle.attack -= 3; state.battle.message = '你早已掌握毒計，陸謙等人措手不及，氣勢先折！'; renderBattle(); } } }]
    },
    mountain_temple_after: {
      location: 'grassyard', scene: 'snow', region: '滄州城外', name: '山神廟', caption: '雪止・火盡', speaker: '旁白',
      title: '風雪盡頭，別無歸路',
      text: () => `陸謙等人伏在雪地，草料場仍在遠處燃燒。你把仇人的衣物與盤纏收起，挑起花槍，望向漫天飛雪。<p>朝廷法度已被奸人用作殺人之刀，東京再無可回之路。東方有梁山泊，或許那裡才容得下一身清白與滿腔不平。</p>`,
      choices: () => [{ label: '取草料場銅印為證，踏上投奔梁山之路', action: () => finishChapterThree() }]
    },
    chapter3_end: {
      location: 'cangzhou', scene: 'snowroad', region: '河北滄州', name: '滄州城外', caption: '雪後長路・新章待續', speaker: '章回評語',
      title: '第三回完：林教頭風雪山神廟',
      text: () => `白虎堂前受奇冤，山神廟外斷舊恩。豹子頭林沖完成第三回，正式加入英雄譜。<p>武松、魯智深與林沖如今皆可自由切換；李小二也成為可編成的情報型同伴。</p>`,
      choices: () => [
        { label: '查看三回總成果', action: () => openSummary() },
        { label: '開啟第四回：智取生辰綱', action: () => startChapterFour() },
        { label: '前往滄州演武場整備', action: () => goScene('cangzhou_free') },
        { label: '開啟英雄譜切換主角', action: () => openRoster() },
        { label: '回到遊戲標題', action: () => { saveGame(); showTitle(); } }
      ]
    },
    cangzhou_free: {
      location: 'cangzhou', scene: 'camp', region: '河北滄州', name: '滄州牢城演武場', caption: '演武場・槍影', speaker: '旁白',
      title: '豹子頭磨槍待發',
      text: () => `林沖已看破陸謙毒計，踏上投奔梁山之路。此處作為第三回完成後的整備據點，可反覆切磋槍棒、調整同伴與切換英雄。`,
      choices: () => [
        { label: '與滄州槍棒教頭切磋', action: () => startBattle('cangzhouArena', 'cangzhou_arena_win') },
        { label: '調整江湖同伴編成', action: () => openTeam() },
        { label: '在營房休息，恢復全部狀態', action: () => { state.hero.hp = state.hero.maxHp; state.hero.sp = state.hero.maxSp; addLog('林沖在營房調息，狀態全復。'); renderGame(); } },
        { label: '切換英雄章回', action: () => openRoster() },
        { label: state.flags.chapter4Started ? '返回第四回進度' : '開啟第四回：智取生辰綱', action: () => startChapterFour() },
        { label: '查看章回總成果', action: () => openSummary() }
      ]
    },
    daming_mansion: {
      location: 'daming', scene: 'hall', region: '河北北京', name: '大名府留守司', caption: '留守府・重寶列堂', speaker: '梁中書',
      title: '一擔金珠，十一路險',
      text: () => `梁中書為蔡京賀壽，搜羅十萬貫金珠寶貝，命你押送東京。你曾失陷花石綱，正盼藉此重振門楣，卻也明白沿途盜賊覬覦。<p>都管與虞候在旁催促，十一名廂軍已候在府外。這不是尋常差事，而是一場與暑氣、人心和江湖眼線的較量。</p>`,
      choices: () => [
        { label: '立下軍令狀，接下押綱重任', action: () => { state.flags.acceptedBirthdayEscort = true; state.flags.escortDiscipline = 2; state.quests.main_birthday.progress = '整頓十一名廂軍，準備秘密啟程'; changeMorality(2, '以性命承擔護送責任'); goScene('escort_depart'); } },
        { label: '先陳明酷暑與路險，再接下重任', action: () => { state.flags.acceptedBirthdayEscort = true; state.flags.escortMorale = 3; state.flags.escortDiscipline = 1; state.quests.main_birthday.progress = '以商旅裝束掩護生辰綱啟程'; addLog('楊志先向梁中書說明風險，取得調度餘地。'); goScene('escort_depart'); } }
      ]
    },
    escort_depart: {
      location: 'daming', scene: 'gate', region: '大名府外', name: '護綱古道', caption: '六月炎天・車擔啟程', speaker: '楊志',
      title: '明旗易招賊，暗行難服眾',
      text: () => `你命眾人卸去官軍旗號，扮作濠州商客，挑擔趕路。虞候不服你以藤條催行，都管也只顧官威；士卒汗流浹背，軍心逐漸浮動。<p>目前軍紀 ${state.flags.escortDiscipline}，士氣 ${state.flags.escortMorale}。兩者將影響沿途伏擊與黃泥岡智策對決。</p>`,
      choices: () => [
        { label: '趁五更涼爽急行，日高便歇', action: () => { state.flags.escortDiscipline += 1; state.flags.escortMorale += 1; state.quests.main_birthday.progress = '晝伏夜行，避開酷暑與耳目'; goScene('escort_heat'); } },
        { label: '以軍令催趕，不許任何人停步', action: () => { state.flags.escortDiscipline += 2; state.flags.escortMorale = Math.max(0, state.flags.escortMorale - 1); state.quests.main_birthday.progress = '嚴令催行，軍紀森嚴但眾怨漸生'; goScene('escort_heat'); } }
      ]
    },
    escort_heat: {
      location: 'huangnigang', scene: 'road', region: '濟州山路', name: '赤日古道', caption: '炎天・塵土如火', speaker: '旁白',
      title: '烈日比刀更磨人',
      text: () => `紅日當空，石路燙腳。廂軍一見樹蔭便要歇息，虞候反來責怪你苛待眾人。正爭執間，松林內竄出幾名持械亡命徒，直撲最沉的幾副擔子。`,
      choices: () => [
        { label: '拔出雁翎刀，護住生辰綱', action: () => { startBattle('birthdayBandits', 'birthday_bandits_win'); const edge = state.flags.escortDiscipline + state.flags.escortMorale; if (state.battle && edge >= 6) { state.battle.hp -= 24; state.battle.attack -= 2; state.battle.message = '隊伍軍紀與士氣尚穩，眾軍結陣護住擔子，賊勢先挫！'; renderBattle(); } } }
      ]
    },
    escort_after_bandits: {
      location: 'huangnigang', scene: 'road', region: '濟州山路', name: '黃泥岡山腳', caption: '松影・人困馬乏', speaker: '楊志',
      title: '賊可用刀退，渴意卻難斬',
      text: () => `剪徑賊被你殺退，生辰綱未失。但士卒更加疲憊，對你的藤條與軍令怨聲四起。前方一片老松林，正是黃泥岡。<p>都管說只歇片刻；你卻看見松下已有七名販棗客，山坳另挑來一桶白酒。</p>`,
      choices: () => [
        { label: '先盤問販棗客來歷，再准眾人入林', action: () => { state.flags.reachedHuangnigang = true; state.flags.escortDiscipline += 1; state.flags.strategyPlanScore = Math.max(0, 2 - state.flags.escortDiscipline); goScene('huangnigang_arrive'); } },
        { label: '顧念士卒疲憊，准許入林歇腳', action: () => { state.flags.reachedHuangnigang = true; state.flags.escortMorale += 2; state.flags.strategyPlanScore = 2; goScene('huangnigang_arrive'); } }
      ]
    },
    huangnigang_arrive: {
      location: 'huangnigang', scene: 'forest', region: '濟州山路', name: '黃泥岡', caption: '松林・酒香浮動', speaker: '旁白',
      title: '一桶白酒，兩邊心思',
      text: () => `販棗客自稱從濠州來，七人輪流說起行程，口徑滴水不漏。白勝挑酒上岡，眾軍一聞酒香便喉頭發緊。你喝令不准買酒，虞候與都管卻替軍士求情。<p>畫面另一側，智多星吳用正在觀察你的軍紀、士氣與每一道疑心。故事即將切換至七星聚義的劫取視角。</p>`,
      choices: () => [
        { label: '切換至吳用視角，佈下黃泥岡智局', action: () => { state.flags.qixingPerspective = true; state.quests.main_birthday.progress = '七星聚義假扮棗客，準備智取生辰綱'; goScene('qixing_plan'); } }
      ]
    },
    qixing_plan: {
      location: 'huangnigang', scene: 'forest', region: '濟州山路', name: '黃泥岡松林', caption: '七星聚義・暗瓢藏計', speaker: '吳用',
      title: '智取不在力，而在人心',
      text: () => `晁蓋、公孫勝、劉唐、三阮與你扮成七名棗客，白勝則挑酒入岡。要瞞過楊志，必須讓「酒沒有問題」這件事由楊志親眼看見。<p>護送隊的警戒會依先前軍紀而變化；士氣越低，軍士越容易搶酒，卻也越可能引發混亂。按下開始後，請在疑心升滿前瓦解護綱意志。</p>`,
      choices: () => [
        { label: '開始智策對決：七星智取生辰綱', action: () => startStrategyDuel() },
        { label: '回顧護送隊狀況', action: () => toast(`軍紀 ${state.flags.escortDiscipline}｜士氣 ${state.flags.escortMorale}`) }
      ]
    },
    qixing_success: {
      location: 'huangnigang', scene: 'forest', region: '濟州山路', name: '黃泥岡', caption: '酒盡・眾人倒地', speaker: '章回旁白',
      title: '藥在瓢中，疑心反成破綻',
      text: () => `白勝故意不肯賣酒，晁蓋等人先買一瓢痛飲；劉唐又假意偷舀，白勝趕來奪瓢。就在爭奪間，吳用把蒙汗藥抖入剩酒。<p>楊志親見眾人飲酒無事，終於也喝下半瓢。片刻後，護送眾人盡倒松根，七星好漢挑起金珠寶貝，從容下岡。</p>`,
      choices: () => [{ label: '切回楊志視角，面對失綱後果', action: () => { state.flags.birthdayCargoLost = true; state.quests.main_birthday.progress = '生辰綱已失，楊志醒來面對追責'; setActiveHero('yangzhi'); state.chapter = 4; goScene('yangzhi_awake'); } }]
    },
    yangzhi_awake: {
      location: 'huangnigang', scene: 'road', region: '濟州山路', name: '黃泥岡', caption: '斜陽・空擔散落', speaker: '楊志',
      title: '一醒十萬貫，一夢半生名',
      text: () => `你從松根下醒來，只見空擔散落，十一名廂軍與都管、虞候尚在昏睡。失過花石綱，如今又失生辰綱，回大名府必是死罪。<p>遠處已有追緝廂軍循著驛報趕來。是束手回府，還是提刀踏上一條再無官身的江湖路？</p>`,
      choices: () => [
        { label: '不連累士卒，獨自引開追兵', action: () => { changeMorality(7, '失綱後仍願獨自承擔追責'); startBattle('pursuitSoldiers', 'pursuit_win'); } },
        { label: '趁追兵未近，先隱入山道', action: () => { state.flags.pursuitDefeated = true; changeMorality(2, '保全性命，等待洗清罪責之日'); goScene('yangzhi_escape_after'); } }
      ]
    },
    yangzhi_escape_after: {
      location: 'huangnigang', scene: 'snowroad', region: '濟州山路', name: '二龍山古道', caption: '暮色・青面獨行', speaker: '旁白',
      title: '官路已絕，江湖未盡',
      text: () => `楊志甩開追兵，獨自走向群山。將門之後一心求取功名，卻一次次被濁世推回江湖。另一邊，晁蓋與吳用等人攜生辰綱歸返東溪村，七星聚義之名自此埋下梁山大業的火種。`,
      choices: () => [{ label: '完成第四回，收錄智多星吳用', action: () => finishChapterFour() }]
    },
    chapter4_end: {
      location: 'huangnigang', scene: 'forest', region: '濟州山路', name: '黃泥岡', caption: '七星已聚・風雲將起', speaker: '章回評語',
      title: '第四回完：吳用智取生辰綱',
      text: () => `青面獸護綱有勇，智多星設局無痕。第四回從護送與劫取兩側寫出人心攻防，楊志正式加入英雄譜，吳用成為軍師型同伴。<p>四位主角可自由切換；黃泥岡智策對決也可在大名府據點重新演練。</p>`,
      choices: () => [
        { label: '查看四回總成果', action: () => openSummary() },
        { label: '開啟第五回：宋江私放晁蓋', action: () => startChapterFive() },
        { label: '前往大名府演武據點', action: () => goScene('daming_free') },
        { label: '開啟英雄譜切換主角', action: () => openRoster() },
        { label: '回到遊戲標題', action: () => { saveGame(); showTitle(); } }
      ]
    },
    daming_free: {
      location: 'daming', scene: 'hall', region: '河北北京', name: '大名府演武院', caption: '刀牌場・青面磨刃', speaker: '旁白',
      title: '失綱之後，刀意更沉',
      text: () => `此處作為第四回完成後的整備據點。楊志可反覆與刀牌教頭切磋，也能重演黃泥岡智局、調整同伴與切換其他英雄。`,
      choices: () => [
        { label: '與大名府刀牌教頭切磋', action: () => startBattle('damingArena', 'daming_arena_win') },
        { label: '重演黃泥岡智策對決', action: () => { state.flags.qixingPerspective = true; goScene('qixing_plan'); } },
        { label: '休息整備，恢復全部狀態', action: () => { state.hero.hp = state.hero.maxHp; state.hero.sp = state.hero.maxSp; addLog('楊志擦拭雁翎刀，狀態全復。'); renderGame(); } },
        { label: '調整江湖同伴編成', action: () => openTeam() },
        { label: '切換英雄章回', action: () => openRoster() },
        { label: state.flags.chapter5Started ? '返回第五回進度' : '開啟第五回：宋江私放晁蓋', action: () => startChapterFive() },
        { label: '查看四回總成果', action: () => openSummary() }
      ]
    },
    yuncheng_yamen: {
      location: 'yuncheng', scene: 'yamen', region: '濟州鄆城', name: '鄆城縣衙', caption: '公案・急遞文書', speaker: '旁白',
      title: '一紙海捕文書，牽動七星性命',
      text: () => `黃泥岡生辰綱失陷，濟州府限令各縣緝捕。何濤帶著燙傷面頰與口供趕到鄆城，指認東溪村保正晁蓋。<p>你既是縣衙押司，深知公文一旦入案，朱仝、雷橫頃刻便會出發；你也記得晁蓋平日仗義疏財，絕非尋常草寇。</p>`,
      choices: () => [
        { label: '接過公文，先核對何濤口供', action: () => { state.flags.metHeTao = true; state.flags.caseInsight += 1; state.quests.main_songjiang.progress = '查驗何濤口供，設法拖延官差出發'; goScene('case_files'); } },
        { label: '故作震怒，命人立即整隊', action: () => { state.flags.metHeTao = true; state.flags.yunchengReputation += 4; state.quests.main_songjiang.progress = '表面催辦緝捕，暗中尋找示警機會'; goScene('case_files'); } }
      ]
    },
    case_files: {
      location: 'yuncheng', scene: 'yamen', region: '濟州鄆城', name: '押司案房', caption: '燈下案牘・朱筆未落', speaker: '宋江',
      title: '公門有法，筆下也有一線生機',
      text: () => `何濤的口供提到「販棗七客」「東溪村晁保正」與白勝。你必須在不讓知縣起疑的情況下，調整緝捕先後、拖住都頭，替晁蓋爭取一夜。<p>案牘推演會考驗官府疑心與周旋餘裕；若失敗，東溪村道路將被官差提前封鎖。</p>`,
      choices: () => [
        { label: '開始案牘推演：暗中拖延緝捕', action: () => startCaseDuel() },
        { label: '先以押司身分安撫何濤', disabled: state.flags.caseInsight >= 3, action: () => { state.flags.caseInsight = Math.min(3, state.flags.caseInsight + 1); state.flags.yunchengReputation += 2; toast('取得一點案情洞察。'); renderGame(); } }
      ]
    },
    case_success: {
      location: 'yuncheng', scene: 'night', region: '濟州鄆城', name: '鄆城縣衙後門', caption: '更鼓・馬蹄將起', speaker: '旁白',
      title: '朱筆拖住官差，快馬先救故人',
      text: () => `你把東溪村列作次日查訪，又安排朱仝、雷橫先去核對白勝住處。官差的腳步暫被文書程序絆住。<p>夜色已深，你換下公服，牽出快馬。從鄆城到東溪村，只有這一夜可用。</p>`,
      choices: () => [{ label: '從縣衙後門快馬奔往東溪村', action: () => goScene('night_ride') }]
    },
    night_ride: {
      location: 'dongxi', scene: 'nightroad', region: '鄆城東鄉', name: '東溪村古道', caption: '月夜・馬蹄急', speaker: '宋江',
      title: '擔的是官身，趕的是人命',
      text: () => `${state.flags.caseDuelWon ? '案牘尚能拖延半夜，古道暫無官差。' : '案牘推演露出破綻，巡檢官差已提前封鎖東溪村入口。'}<p>遠處東溪村燈火可見。你必須在天亮前把何濤口供與海捕消息送到晁蓋手中。</p>`,
      choices: () => state.flags.caseDuelWon ? [
        { label: '避開驛路，從河堤小徑入村', action: () => { state.flags.warnedChaoGai = true; changeMorality(8, '冒著官身盡失之險私報晁蓋'); goScene('dongxi_warning'); } }
      ] : [
        { label: '以押司腰牌周旋，仍遭官差攔截', action: () => startBattle('yunchengPatrol', 'yuncheng_patrol_win') }
      ]
    },
    dongxi_warning: {
      location: 'dongxi', scene: 'village', region: '鄆城東鄉', name: '晁蓋莊', caption: '密室・七星驚起', speaker: '宋江',
      title: '保正哥哥，事發了！',
      text: () => `晁蓋開門見你滿身夜露，吳用、公孫勝等人也從後堂出來。你把何濤口供一字不漏說明，勸他們立刻收拾細軟、分路離開。<p>晁蓋握住你的手：「賢弟今日救我七人性命，這份恩義，梁山水泊也記得。」</p>`,
      choices: () => [{ label: '催七星連夜撤離，自己趕回縣衙', action: () => { state.flags.warnedChaoGai = true; state.quests.main_songjiang.progress = '私報晁蓋成功，返回鄆城掩護後續'; goScene('dongxi_depart'); } }]
    },
    dongxi_depart: {
      location: 'dongxi', scene: 'nightroad', region: '鄆城東鄉', name: '東溪村外', caption: '雞鳴前・分道而行', speaker: '晁蓋',
      title: '七星散去，一封謝書留下後患',
      text: () => `七星好漢分批離村。數日後，晁蓋遣劉唐送來百兩黃金與一封謝書。你只收一小錠作信物，其餘盡數退回。<p>然而招文袋與書信被帶回住處，閻婆惜已察覺你深夜往來的秘密。</p>`,
      choices: () => [{ label: '收下晁蓋謝書，返回紫石街住處', action: () => { state.flags.chaoLetterReceived = true; if (!state.inventory.chaoLetter) addItem('chaoLetter', 1); goScene('songjiang_home'); } }]
    },
    songjiang_home: {
      location: 'yuncheng', scene: 'house', region: '濟州鄆城', name: '紫石街住處', caption: '夜燈・招文袋半開', speaker: '旁白',
      title: '救人一封書，反成催命符',
      text: () => `你回到住處，招文袋竟不在腰間。閻婆惜坐在燈下，手中正是晁蓋謝書。她早對你冷落不滿，如今抓住私通「賊人」的證據，要你寫下休書、交出金銀，還不肯歸還書信。<p>第五回採分歧改編：可以追求原著悲劇線，也能以先前案情洞察與聲望尋找不傷人命的解法。</p>`,
      choices: () => [{ label: '沉住氣，與閻婆惜正面交涉', action: () => { state.flags.yanFoundLetter = true; goScene('yan_confrontation'); } }]
    },
    yan_confrontation: {
      location: 'yuncheng', scene: 'house', region: '濟州鄆城', name: '紫石街住處', caption: '深夜・一紙生死', speaker: '閻婆惜',
      title: '三項條件，最後一線忍耐',
      text: () => `閻婆惜要你交出晁蓋所送百兩黃金；你說只收了一小錠，她卻認定你藏匿。她又以告官相逼，聲音越來越高。<p>目前案情洞察 ${state.flags.caseInsight}/3，鄆城聲望 ${state.flags.yunchengReputation}。洞察與聲望足夠時，可請朱仝、閻婆居中作證，以契約換回書信。</p>`,
      choices: () => {
        const canMediate = state.flags.caseInsight >= 2 && state.flags.yunchengReputation >= 52;
        return [
          { label: '請朱仝與閻婆連夜到場，立契調停（最佳分歧）', disabled: !canMediate, action: () => { state.flags.yanOutcome = 'mercy'; changeMorality(10, '忍住怒氣，以契約保全書信與人命'); state.hero.silver = Math.max(0, state.hero.silver - 12); goScene('yan_mercy'); } },
          { label: '答應休書與現有銀兩，忍辱換回書信', action: () => { state.flags.yanOutcome = 'exile'; state.hero.silver = 0; changeMorality(3, '忍辱退讓以避免當場傷人'); goScene('yan_exile'); } },
          { label: '強奪書信；爭執中誤拔腰刀（原著悲劇線）', action: () => { state.flags.yanOutcome = 'original'; changeMorality(-8, '盛怒之下釀成無可挽回的悲劇'); goScene('yan_original'); } }
        ];
      }
    },
    yan_mercy: {
      location: 'yuncheng', scene: 'dawn', region: '濟州鄆城', name: '紫石街', caption: '天將明・契紙落印', speaker: '章回分歧',
      title: '義可救友，忍亦能救人',
      text: () => `朱仝與閻婆到場作證，你交付合理銀兩並寫下休書；閻婆惜歸還晁蓋謝書，承諾不以此告官。<p>這是遊戲新增的「義全人未傷」分歧：宋江仍因私放晁蓋而離開鄆城避禍，但不背人命。</p>`,
      choices: () => [{ label: '焚去書信，夜走柴進莊', action: () => finishChapterFive('mercy') }]
    },
    yan_exile: {
      location: 'yuncheng', scene: 'nightroad', region: '濟州鄆城', name: '紫石街後巷', caption: '空囊・獨行', speaker: '章回分歧',
      title: '保住人命，卻留下告官風險',
      text: () => `你交出身邊銀兩，閻婆惜暫將書信歸還，卻揚言日後仍可翻供。你明白官身已不能久留，只得連夜離開鄆城。<p>此線保全性命，但聲名與家業盡失，後續將以亡命身份行走江湖。</p>`,
      choices: () => [{ label: '帶著書信遠走江湖', action: () => finishChapterFive('exile') }]
    },
    yan_original: {
      location: 'yuncheng', scene: 'night', region: '濟州鄆城', name: '紫石街住處', caption: '燈倒・悲劇已成', speaker: '章回旁白',
      title: '一念失守，官路與歸路同斷',
      text: () => `爭奪間，閻婆惜高聲呼喊要去告官。你盛怒失手，腰刀出鞘，悲劇已無法挽回。<p>本段不將暴力作英雄化處理：宋江私放晁蓋出於義氣，卻也必須承擔失控造成的人命與亡命後果。</p>`,
      choices: () => [{ label: '取回書信，逃離鄆城', action: () => finishChapterFive('original') }]
    },
    chapter5_end: {
      location: 'yuncheng', scene: 'dawn', region: '濟州鄆城', name: '鄆城古道', caption: '曉色・及時雨遠行', speaker: '章回評語',
      title: '第五回完：宋江私放晁蓋',
      text: () => `押司筆下拖官差，及時雨夜救七星。第五回加入官府案牘推演與閻婆惜事件分歧，宋江正式加入英雄譜，晁蓋成為破陣型同伴。<p>本次結局：${state.flags.yanOutcome === 'mercy' ? '義全人未傷' : state.flags.yanOutcome === 'exile' ? '忍辱遠走' : '原著悲劇線'}。</p>`,
      choices: () => [
        { label: '查看五回總成果', action: () => openSummary() },
        { label: '開啟第六回：江州題反詩與劫法場', action: () => startChapterSix() },
        { label: '前往鄆城演武據點', action: () => goScene('yuncheng_free') },
        { label: '開啟英雄譜切換主角', action: () => openRoster() },
        { label: '回到遊戲標題', action: () => { saveGame(); showTitle(); } }
      ]
    },
    yuncheng_free: {
      location: 'yuncheng', scene: 'yamen', region: '濟州鄆城', name: '鄆城縣衙演武場', caption: '朴刀場・案牘重演', speaker: '旁白',
      title: '及時雨重整行裝',
      text: () => `此處作為第五回完成後的整備據點。宋江可與朴刀教頭切磋、重演案牘推演、調整同伴及切換其他英雄。`,
      choices: () => [
        { label: '與鄆城朴刀教頭切磋', action: () => startBattle('yunchengArena', 'yuncheng_arena_win') },
        { label: '重演官府案牘推演', action: () => startCaseDuel(true) },
        { label: '休息整備，恢復全部狀態', action: () => { state.hero.hp = state.hero.maxHp; state.hero.sp = state.hero.maxSp; addLog('宋江整理案牘與行裝，狀態全復。'); renderGame(); } },
        { label: '調整江湖同伴編成', action: () => openTeam() },
        { label: '切換英雄章回', action: () => openRoster() },
        { label: state.flags.chapter6Started ? '返回第六回進度' : '開啟第六回：江州題反詩與劫法場', action: () => startChapterSix() },
        { label: '查看五回總成果', action: () => openSummary() }
      ]
    },

    jiangzhou_arrival: {
      location: 'jiangzhou', scene: 'river', region: '潯陽江畔', name: '江州牢城營', caption: '江風・刺配文書', speaker: '旁白',
      title: '罪籍到江州，故人先伸手',
      text: () => `宋江離鄆城後輾轉被發配江州。牢城營外江潮拍岸，差撥正要索取常例銀，兩院押牢節級戴宗卻持文書趕來，暗中替你解圍。<p>戴宗號稱神行太保，早聞及時雨之名，也與梁山好漢有往來。</p>`,
      choices: () => [
        { label: '坦言自身來歷，與戴宗結交', action: () => { state.flags.metDaiZong = true; unlockCompanion('daizong'); state.quests.main_jiangzhou.progress = '結識戴宗，熟悉江州牢城內外'; changeMorality(3, '在患難中仍以誠待人'); goScene('likui_meet'); } },
        { label: '先按牢城規矩行事，再私下致謝', action: () => { state.flags.metDaiZong = true; unlockCompanion('daizong'); state.hero.silver = Math.max(0, state.hero.silver - 4); goScene('likui_meet'); } }
      ]
    },
    likui_meet: {
      location: 'jiangzhou', scene: 'tavern', region: '潯陽江畔', name: '琵琶亭酒肆', caption: '江聲・黑漢闖席', speaker: '戴宗',
      title: '黑旋風李逵，先賭後認哥哥',
      text: () => `戴宗帶你到江邊酒肆，一名黑凜凜大漢闖進門來，開口便借銀去賭魚。此人正是牢城小牢子李逵，性烈如火，卻最服仗義之人。<p>幾個潑皮見他欠帳，趁勢掀桌圍打；李逵抄起板凳，你也被捲入衝突。</p>`,
      choices: () => [{ label: '與李逵並肩擊退潑皮', action: () => startBattle('jiangzhouRuffians', 'jiangzhou_ruffians_win') }]
    },
    jiangzhou_tavern_after: {
      location: 'jiangzhou', scene: 'tavern', region: '潯陽江畔', name: '琵琶亭酒肆', caption: '酒碗・兄弟相認', speaker: '李逵',
      title: '鐵牛只認一個公明哥哥',
      text: () => `潑皮散去，李逵才從戴宗口中得知你便是山東及時雨。他推開酒碗便拜：「原來是公明哥哥！鐵牛有眼不識泰山。」<p>此後數日，戴宗與李逵常來相伴。你在牢城抄寫文案，日子暫得平靜。</p>`,
      choices: () => [{ label: '得閒登潯陽樓，排遣胸中鬱結', action: () => { state.flags.reachedXunyang = true; state.quests.main_jiangzhou.progress = '登潯陽樓飲酒，慎防文字惹禍'; goScene('xunyang_tower'); } }]
    },
    xunyang_tower: {
      location: 'xunyang', scene: 'tower', region: '江州城南', name: '潯陽樓', caption: '暮江・酒旗映水', speaker: '宋江',
      title: '滿腔不得志，落筆便成罪',
      text: () => `秋江浩蕩，孤雁掠過樓外。你想起鄆城舊事與一路顛沛，酒意催動心緒。牆上滿是往來文士題詠；此刻寫與不寫，字句如何，都會改變官府日後羅織罪名的難易。<p>目前題詩風險：${state.flags.poemRisk}/3。</p>`,
      choices: () => [
        { label: '直書豪情：「他年若遂凌雲志，敢笑黃巢不丈夫」', action: () => { state.flags.poemRisk = 3; state.flags.antiPoemWritten = true; addItem('antiPoemCopy', 1); goScene('poem_discovered'); } },
        { label: '改寫為思鄉與自省之詩，收住鋒芒', action: () => { state.flags.poemRisk = 1; state.flags.antiPoemWritten = true; state.flags.fakeLetterScore += 1; addItem('antiPoemCopy', 1); goScene('poem_discovered'); } },
        { label: '擱筆不題，只請酒保記下心事', action: () => { state.flags.poemRisk = 0; state.flags.antiPoemWritten = false; changeMorality(2, '醉中仍能自制，不讓怨氣傷人'); goScene('poem_discovered'); } }
      ]
    },
    poem_discovered: {
      location: 'xunyang', scene: 'tower', region: '江州城南', name: '潯陽樓', caption: '翌日・黃文炳登樓', speaker: '旁白',
      title: '黃文炳羅織，無詩也能生案',
      text: () => `${state.flags.antiPoemWritten ? '通判黃文炳讀到牆上詩句，刻意把失意之詞解作反意。' : '你雖未留詩，黃文炳仍從酒保轉述與舊案中拼湊「心懷不軌」的口供。'}<p>蔡九知府下令拿人。題詩風險越高，牢城看守越嚴；但真正決定生死的，仍是官府如何使用文字與口供。</p>`,
      choices: () => [{ label: '面對江州府審問', action: () => { state.flags.executionSentenced = true; state.quests.main_jiangzhou.progress = '遭黃文炳陷害下獄，等待戴宗求援'; if (state.flags.poemRisk >= 2) startBattle('jiangzhouJailer', 'jiangzhou_jailer_win'); else goScene('prison_cell'); } }]
    },
    prison_cell: {
      location: 'jiangzhou', scene: 'prison', region: '江州牢城', name: '死囚牢', caption: '鐵窗・密信將發', speaker: '戴宗',
      title: '一封假回書，能救命也能催命',
      text: () => `戴宗奉命把蔡九知府求示的公文送往東京蔡京府。梁山眾人準備偽造蔡京回書赦免宋江，卻可能在印章、紙張與官樣措辭上露出破綻。<p>你與戴宗透過牢子傳話，盡量檢查偽書細節。完成兩項以上查驗，可降低黃文炳識破的警戒。</p>`,
      choices: () => [
        { label: '檢查太師府公文紙張與水紋', disabled: state.flags.letterPaperChecked, action: () => { state.flags.letterPaperChecked = true; state.flags.fakeLetterScore += 1; toast('紙張查驗完成。'); renderGame(); } },
        { label: '核對蔡京關防印記與用印位置', disabled: state.flags.letterSealChecked, action: () => { state.flags.letterSealChecked = true; state.flags.fakeLetterScore += 1; toast('印記查驗完成。'); renderGame(); } },
        { label: '修正父子官稱與回書官樣措辭', disabled: state.flags.letterToneChecked, action: () => { state.flags.letterToneChecked = true; state.flags.fakeLetterScore += 1; toast('措辭查驗完成。'); renderGame(); } },
        { label: '讓戴宗送出回書，等待結果', action: () => { state.flags.fakeLetterExposed = state.flags.fakeLetterScore < 2; goScene('fake_letter_result'); } }
      ]
    },
    fake_letter_result: {
      location: 'jiangzhou', scene: 'yamen', region: '江州城中', name: '蔡九知府衙', caption: '公堂・回書拆封', speaker: '旁白',
      title: '黃文炳識書，法場之期已定',
      text: () => `${state.flags.fakeLetterExposed ? '偽書在紙張與官稱上留下破綻，黃文炳當堂拆穿，戴宗也被打入死牢。' : '偽書細節幾近無誤，卻仍被黃文炳從蔡京與蔡九父子的避諱稱呼中生疑。戴宗為護梁山眾人，主動承擔罪名。'}<p>宋江與戴宗同被判斬，法場定在次日午時。消息已由牢中暗線傳往梁山。</p>`,
      choices: () => [{ label: '押赴江州法場', action: () => goScene('execution_notice') }]
    },
    execution_notice: {
      location: 'execution', scene: 'execution', region: '江州城中', name: '江州法場', caption: '午時・陰雲壓城', speaker: '旁白',
      title: '一聲炮響，黑旋風先跳下樓',
      text: () => `刑臺四周刀槍林立。宋江、戴宗已被押到法場，監斬官正待午時三刻。忽聽酒樓上一聲暴喝，李逵赤膊持雙斧躍入人群；晁蓋、花榮等梁山好漢也從四面殺出。<p>本場為兩階段救援戰。第一階段切換操控李逵，突破刑臺刀斧手；第二階段沿江抵擋無為軍追兵。</p>`,
      choices: () => [{ label: '切換李逵，雙斧劈開法場', action: () => { syncActiveHero(); state.heroes.likui.unlocked = true; setActiveHero('likui'); state.chapter = 6; state.flags.executionStage = 1; startBattle('executionGuard', 'execution_guard_win'); } }]
    },
    execution_break: {
      location: 'execution', scene: 'execution', region: '江州城中', name: '江州法場', caption: '刑臺已破・眾人突圍', speaker: '李逵',
      title: '刑臺救下哥哥，城門又起追兵',
      text: () => `你雙斧劈散刀斧手，晁蓋等人割斷宋江與戴宗繩索。眾好漢護著二人衝出南門，卻見無為軍沿江列陣，弓手封住通往白龍廟的道路。<p>第二階段開始前，李逵恢復少量氣血與豪氣。</p>`,
      choices: () => [{ label: '迎戰無為軍追兵，護送眾人渡江', action: () => { state.hero.hp = state.hero.maxHp; state.hero.sp = state.hero.maxSp; state.flags.executionStage = 2; startBattle('wuweiArmy', 'wuwei_army_win'); } }]
    },
    white_dragon_temple: {
      location: 'liangshan', scene: 'temple', region: '潯陽江口', name: '白龍廟', caption: '夜火・二十九人聚義', speaker: '宋江',
      title: '法場同生死，白龍廟定去處',
      text: () => `眾人渡過江口，在白龍廟清點人數。宋江與戴宗得救，李逵滿身血污仍守在門外。晁蓋勸宋江同上梁山，從此不再受貪官酷吏擺布。<p>這一夜的聚義，讓梁山由避禍之地逐漸成為可建設、可經營的共同據點。</p>`,
      choices: () => [{ label: '同上梁山，開啟山寨建設', action: () => finishChapterSix() }]
    },
    chapter6_end: {
      location: 'liangshan', scene: 'mountain', region: '濟州水泊', name: '梁山泊', caption: '金沙灘・聚義旗初立', speaker: '章回評語',
      title: '第六回完：江州劫法場，白龍廟聚義',
      text: () => `潯陽樓一紙成獄，江州城群雄劫場。第六回新增文字風險、偽書查驗與兩階段救援戰；黑旋風李逵正式加入英雄譜，戴宗成為神行型同伴。<p>梁山據點雛形已開放，可用木材、石料與銀兩升級聚義廳、醫館與鐵匠鋪。</p>`,
      choices: () => [
        { label: '進入梁山山寨', action: () => goScene('liangshan_free') },
        { label: '查看六回總成果', action: () => openSummary() },
        { label: '開啟六英雄譜', action: () => openRoster() },
        { label: '管理梁山建設', action: () => openBase() },
        { label: '開啟第七回：三打祝家莊', action: () => startChapterSeven() },
        { label: '回到遊戲標題', action: () => { saveGame(); showTitle(); } }
      ]
    },
    jiangzhou_free: {
      location: 'jiangzhou', scene: 'river', region: '潯陽江畔', name: '江州牢城舊地', caption: '江風・舊案回看', speaker: '旁白',
      title: '及時雨回望潯陽江',
      text: () => `第六回完成後，宋江可回到江州舊地整備、查看題詩與偽書結果，也能返回梁山山寨。`,
      choices: () => [
        { label: '前往梁山山寨', action: () => { if (state.activeHeroId !== 'songjiang') setActiveHero('songjiang'); goScene('liangshan_free'); } },
        { label: '恢復全部狀態', action: () => { state.hero.hp = state.hero.maxHp; state.hero.sp = state.hero.maxSp; renderGame(); } },
        { label: '切換英雄章回', action: () => openRoster() },
        { label: '查看六回總成果', action: () => openSummary() }
      ]
    },
    liangshan_free: {
      location: 'liangshan', scene: 'mountain', region: '濟州水泊', name: '梁山泊聚義廳', caption: '水寨・旌旗迎風', speaker: '旁白',
      title: '山寨初成，百廢待舉',
      text: () => `梁山泊已成眾好漢共同據點。聚義廳影響山寨士氣，醫館提高休息恢復，鐵匠鋪強化演武整備，糧倉則支援全寨休養與遠征。<p>目前木材 ${state.base.timber}、石料 ${state.base.stone}、糧草 ${state.base.grain}；聚義廳 Lv.${state.base.hall}、醫館 Lv.${state.base.infirmary}、鐵匠鋪 Lv.${state.base.forge}、糧倉 Lv.${state.base.granary}、軍械坊 Lv.${state.base.armory || 1}。</p>`,
      choices: () => [
        { label: '管理梁山建設', action: () => openBase() },
        { label: '與梁山水軍頭目切磋', action: () => startBattle('liangshanArena', 'liangshan_arena_win') },
        { label: '在醫館休息整備', action: () => { const boost = 12 * state.base.infirmary; state.hero.hp = clamp(state.hero.hp + boost, 0, state.hero.maxHp); state.hero.sp = clamp(state.hero.sp + 6 * state.base.infirmary, 0, state.hero.maxSp); addLog(`在梁山醫館休息，恢復 ${boost} 點氣血。`); renderGame(); } },
        { label: '調整江湖同伴編成', action: () => openTeam() },
        { label: state.flags.chapter8Complete ? '切換八名英雄' : state.flags.chapter7Complete ? '切換七名英雄' : '切換六名英雄', action: () => openRoster() },
        { label: state.flags.chapter8Started ? '返回第八回進度' : state.flags.chapter7Complete ? '開啟第八回：大破連環馬' : state.flags.chapter7Started ? '返回第七回進度' : '開啟第七回：三打祝家莊', action: () => state.flags.chapter7Complete ? startChapterEight() : startChapterSeven() },
        { label: state.flags.chapter8Complete ? '查看八回總成果' : state.flags.chapter7Complete ? '查看七回總成果' : '查看六回總成果', action: () => openSummary() }
      ]
    },

    liangshan_council: {
      location: 'liangshan', scene: 'mountain', region: '濟州水泊', name: '梁山泊聚義廳', caption: '軍議・獨龍岡告急', speaker: '宋江',
      title: '三莊結盟拒梁山，先問為何再出兵',
      text: () => `楊雄、石秀帶來消息：時遷在祝家莊惹事被擒，獨龍岡三莊又以盤陀路、吊橋、報事鐘拒守。宋江主張救人，也要求軍令不得搶掠百姓。<p>山寨現有糧草 ${state.base.grain}。投入糧草整備，可提高三莊對梁山「護民軍令」的信任。</p>`,
      choices: () => [
        { label: '撥出 2 份糧草救濟沿路村戶', disabled: state.base.grain < 2, action: () => { state.base.grain -= 2; state.flags.allianceReputation += 2; state.flags.villageProtected = true; changeMorality(4, '出兵前先立護民軍令並賑濟村戶'); goScene('dulong_ridge'); } },
        { label: '先整軍救時遷，嚴令沿途不得擾民', action: () => { state.flags.allianceReputation += 1; goScene('dulong_ridge'); } }
      ]
    },
    dulong_ridge: {
      location: 'dulong', scene: 'ridge', region: '濟州鄆城東', name: '獨龍岡外', caption: '暮嵐・盤陀路入口', speaker: '石秀',
      title: '樹木似陣，路標會轉',
      text: () => `獨龍岡林木縱橫，白楊樹上的暗記能引人入陷坑；祝家莊又在高處設鐘，一處受敵，三莊皆知。石秀請命先探路。<p>是否偵察，會直接改變首攻與最終攻略的警報。</p>`,
      choices: () => [
        { label: '讓石秀夜探盤陀路，留下白粉暗記', action: () => { state.flags.firstAssaultScouted = true; state.flags.allianceReputation += 1; addItem('pantuoMap', 1); goScene('first_assault'); } },
        { label: '趁暮色直接進攻外寨', action: () => goScene('first_assault') }
      ]
    },
    first_assault: {
      location: 'zhujia', scene: 'fortress', region: '獨龍岡', name: '祝家莊外寨', caption: '第一打・鐘樓鳴警', speaker: '旁白',
      title: '破得槍隊，未必走得出盤陀路',
      text: () => `${state.flags.firstAssaultScouted ? '石秀的白粉暗記讓前軍避開第一處陷坑。' : '未經偵察的前軍很快在岔路失去方向。'}祝家莊槍隊自鹿角後列陣，報事鐘一響，弩箭便從兩翼落下。`,
      choices: () => [{ label: '擊破外寨槍隊，救出被圍前軍', action: () => startBattle('zhuGateGuard', 'zhu_gate_first_win') }]
    },
    pantou_retreat: {
      location: 'dulong', scene: 'ridge', region: '獨龍岡', name: '盤陀路', caption: '第一打收兵・迷霧四合', speaker: '宋江',
      title: '勝一陣，卻輸給道路與鐘聲',
      text: () => `外寨槍隊雖退，梁山軍卻在會轉的路標與陷坑間彼此失散。附近村戶也被戰火驚散。此時可先救人、收兵，再尋三莊內部的裂縫。<p>目前聯盟聲望：${state.flags.allianceReputation}。</p>`,
      choices: () => [
        { label: '先救出陷坑旁的村戶，再有序撤軍', action: () => { state.flags.villageProtected = true; state.flags.allianceReputation += 2; changeMorality(5, '敗退時仍先護送村戶離開戰場'); goScene('hujia_perspective'); } },
        { label: '收攏軍隊立刻撤退，避免更大傷亡', action: () => { state.flags.allianceReputation += 1; goScene('hujia_perspective'); } }
      ]
    },
    hujia_perspective: {
      location: 'hujia', scene: 'courtyard', region: '獨龍岡西莊', name: '扈家莊演武庭', caption: '第二打・女將上馬', speaker: '扈三娘',
      title: '一丈青出陣，守的是家門也是百姓',
      text: () => `祝家莊求援，扈家莊女將扈三娘披紅錦甲、持日月雙刀出陣。她不願祝家恃強欺鄉，也不能任外軍踏入三莊。梁山先鋒王英搶先挑戰。<p>本段切換操控扈三娘，展現三莊一方並非只有惡霸，也有守土與親族牽絆。</p>`,
      choices: () => [{ label: '切換扈三娘，以雙刀迎戰王英', action: () => { syncActiveHero(); state.flags.huPerspective = true; state.heroes.husanniang.unlocked = true; setActiveHero('husanniang'); state.chapter = 7; startBattle('wangyingDuel', 'hu_duel_win'); } }]
    },
    hu_duel_after: {
      location: 'hujia', scene: 'courtyard', region: '獨龍岡西莊', name: '扈家莊外', caption: '雙刀勝槍・寒星又至', speaker: '旁白',
      title: '擒得王英，卻遇林沖截陣',
      text: () => `扈三娘以套索奪下王英兵器，只擒不殺。正要回馬，林沖從側翼截住去路；數合後，扈三娘馬失前蹄，被梁山軍帶回營中。<p>宋江提出停戰：若扈、李兩莊不助祝氏欺民，梁山願保障村戶與家眷。</p>`,
      choices: () => [
        { label: '要求先放還村戶，再談三莊停戰', action: () => { state.flags.allianceReputation += 2; state.flags.villageProtected = true; syncActiveHero(); setActiveHero('songjiang'); goScene('liying_negotiation'); } },
        { label: '承認祝氏橫暴，願聽梁山如何護民', action: () => { state.flags.allianceReputation += 1; syncActiveHero(); setActiveHero('songjiang'); goScene('liying_negotiation'); } }
      ]
    },
    liying_negotiation: {
      location: 'dulong', scene: 'village', region: '獨龍岡東莊', name: '李家莊', caption: '第二打後・三莊裂縫', speaker: '撲天雕李應',
      title: '三莊有盟，卻不是同一條心',
      text: () => `李應早因祝彪箭傷而與祝家不睦。他願提供道路與糧情，但要求梁山明文承諾：不焚民宅、不奪農糧、不以扈三娘作人質。<p>目前聯盟聲望：${state.flags.allianceReputation}。</p>`,
      choices: () => [
        { label: '立盟誓牌，接受三項護民條件', action: () => { state.flags.liYingAllied = true; state.flags.allianceReputation += 2; state.flags.villageProtected = true; addItem('allianceToken', 1); goScene('sunli_plan'); } },
        { label: '只要求李家莊保持中立', action: () => { state.flags.liYingAllied = state.flags.allianceReputation >= 3; goScene('sunli_plan'); } }
      ]
    },
    sunli_plan: {
      location: 'dulong', scene: 'camp', region: '獨龍岡梁山營', name: '中軍帳', caption: '第三打前夜・登州來客', speaker: '吳用',
      title: '外攻已試兩回，第三回須從門內開始',
      text: () => `登州提轄孫立與祝家教師欒廷玉同門，願假稱調任路過，帶眾人入莊。吳用則安排花榮射鐘、李應截援、扈三娘引路。<p>這不是單一奇計，而是前兩次失敗換來的道路、民心與內應。</p>`,
      choices: () => [
        { label: '接受孫立裡應外合之計', action: () => { state.flags.metSunLi = true; state.flags.infiltrationReady = true; unlockCompanion('sunli'); state.quests.main_zhujia.progress = '孫立入莊臥底，第三次總攻在即'; goScene('third_assault'); } },
        { label: '先核對祝家口令與吊橋換防時辰', action: () => { state.flags.metSunLi = true; state.flags.infiltrationReady = true; state.flags.allianceReputation += 1; unlockCompanion('sunli'); goScene('third_assault'); } }
      ]
    },
    third_assault: {
      location: 'zhujia', scene: 'fortress', region: '獨龍岡', name: '祝家莊三重寨門', caption: '第三打・內外合擊', speaker: '宋江',
      title: '道路、盟約、臥底，三線同時落子',
      text: () => `第三次進攻開始。莊寨攻略不是普通血量戰：必須利用盤陀路暗記、李應封援、孫立開門與花榮斷鐘，降低防線後才能下令三路總攻。<p>聯盟聲望越高，梁山軍的攻勢越持久。</p>`,
      choices: () => [{ label: '開始「祝家莊攻略」策略戰', action: () => startFortressDuel(false) }]
    },
    fortress_breached: {
      location: 'zhujia', scene: 'fortress', region: '獨龍岡', name: '祝家莊內寨', caption: '寨門已破・祝龍迎戰', speaker: '扈三娘',
      title: '破莊之後，仍要決定如何收刀',
      text: () => `孫立奪門、花榮斷鐘，三路軍終於會合。祝龍率親軍退守宗祠，仍驅使莊丁與村戶作盾。扈三娘請命領路，只攻持械親軍，不讓戰火蔓延至民宅。`,
      choices: () => [{ label: '切換扈三娘，擊破祝龍最後防線', action: () => { syncActiveHero(); setActiveHero('husanniang'); state.chapter = 7; state.hero.hp = state.hero.maxHp; state.hero.sp = state.hero.maxSp; startBattle('zhuLong', 'zhu_long_win'); } }]
    },
    zhujia_after: {
      location: 'zhujia', scene: 'granary', region: '獨龍岡', name: '祝家莊糧倉', caption: '戰後・開倉與軍令', speaker: '宋江',
      title: '取莊容易，如何對待莊民才見梁山本色',
      text: () => `祝氏親軍潰散，莊中尚有大量軍糧與農戶寄存的種糧。若不分清歸屬，梁山也會成為另一群掠奪者。<p>目前聯盟聲望：${state.flags.allianceReputation}。</p>`,
      choices: () => [
        { label: '歸還農戶種糧，只取祝氏軍糧', action: () => { state.flags.villageProtected = true; state.flags.allianceReputation += 2; state.base.grain += 7; changeMorality(8, '破莊後仍分清軍糧與百姓種糧'); finishChapterSeven(); } },
        { label: '按戶造冊後取半數作梁山軍糧', action: () => { state.base.grain += 5; changeMorality(3, '戰後造冊分糧，避免無序搶掠'); finishChapterSeven(); } }
      ]
    },
    chapter7_end: {
      location: 'liangshan', scene: 'mountain', region: '濟州水泊', name: '梁山泊', caption: '凱旋・女將入聚義廳', speaker: '章回評語',
      title: '第七回完：三打祝家莊',
      text: () => `一打識路，二打識人，三打才得破莊。第七回加入三次進攻、三莊聯盟聲望、祝家莊攻略策略戰與戰後護民抉擇；一丈青扈三娘正式加入英雄譜，病尉遲孫立成為臥底破陣型同伴。<p>梁山新增糧草與糧倉，可消耗糧草讓所有已解鎖英雄完成全寨整備。</p>`,
      choices: () => [
        { label: '進入梁山山寨', action: () => goScene('liangshan_free') },
        { label: '查看七回總成果', action: () => openSummary() },
        { label: '開啟七英雄譜', action: () => openRoster() },
        { label: '管理糧倉與山寨建設', action: () => openBase() },
        { label: '前往獨龍岡整備據點', action: () => goScene('zhujia_free') },
        { label: '開啟第八回：大破連環馬', action: () => startChapterEight() },
        { label: '回到遊戲標題', action: () => { saveGame(); showTitle(); } }
      ]
    },
    zhujia_free: {
      location: 'zhujia', scene: 'courtyard', region: '獨龍岡', name: '三莊聯盟演武庭', caption: '戰後・雙刀與套索', speaker: '旁白',
      title: '一丈青守住的新盟約',
      text: () => `祝家莊戰後，扈、李兩莊與梁山以盟誓牌約束彼此。扈三娘可在此演武、重演莊寨攻略，或返回梁山管理糧草。<p>獨龍岡演武每勝一場可取得 1 份糧草。</p>`,
      choices: () => [
        { label: '與獨龍岡雙刀教頭切磋', action: () => startBattle('zhujiaArena', 'zhujia_arena_win') },
        { label: '重演祝家莊攻略策略戰', action: () => startFortressDuel(true) },
        { label: '返回梁山山寨', action: () => goScene('liangshan_free') },
        { label: '恢復全部狀態', action: () => { state.hero.hp = state.hero.maxHp; state.hero.sp = state.hero.maxSp; renderGame(); } },
        { label: '調整江湖同伴編成', action: () => openTeam() },
        { label: state.flags.chapter8Complete ? '切換八名英雄' : '切換七名英雄', action: () => openRoster() },
        { label: state.flags.chapter8Started ? '返回第八回進度' : '開啟第八回：大破連環馬', action: () => startChapterEight() },
        { label: state.flags.chapter8Complete ? '查看八回總成果' : '查看七回總成果', action: () => openSummary() }
      ]
    },

    imperial_command: {
      location: 'chaincamp', scene: 'fortress', region: '東京殿前司', name: '征討軍大帳', caption: '詔令・鐵甲馬成軍', speaker: '呼延灼',
      title: '將門之後奉命出征，先問軍令為誰而戰',
      text: () => `高俅保舉你統率官軍征討梁山，並調撥三千匹戰馬、鐵甲與皮索，組成三十騎一列的連環馬。朝廷要的是速勝，軍士卻要在重甲與酷訓中活下來。<p>你對操練與養馬的選擇會影響連環馬軍紀，也會影響梁山鉤鐮槍破陣時的難度。</p>`,
      choices: () => [
        { label: '嚴整號令，但規定每操練一刻便卸甲歇馬', action: () => { state.flags.chainDiscipline += 2; state.flags.horseCare += 2; changeMorality(3, '治軍嚴明而不以人馬性命邀功'); goScene('chain_camp_training'); } },
        { label: '連夜操成三十騎一列，先求軍威', action: () => { state.flags.chainDiscipline += 3; state.flags.horseCare = Math.max(0, state.flags.horseCare - 1); goScene('chain_camp_training'); } }
      ]
    },
    chain_camp_training: {
      location: 'chaincamp', scene: 'camp', region: '濟州官軍營', name: '連環馬大營', caption: '鐵甲・雙鞭點陣', speaker: '呼延灼',
      title: '馬與馬相連，勝在同進也險在同倒',
      text: () => `三十匹戰馬以皮索相連，前排披甲、後排持槍。此陣正面衝鋒如牆推進，但只要前馬失足，後騎便無處閃避。<p>目前軍紀 ${state.flags.chainDiscipline}｜養馬 ${state.flags.horseCare}。你將親自率隊試攻梁山前哨。</p>`,
      choices: () => [
        { label: '先拆成十騎小隊反覆換位', action: () => { state.flags.chainDiscipline += 1; state.flags.horseCare += 1; startBattle('liangshanVanguard', 'chain_vanguard_win'); } },
        { label: '全陣披甲，直接以鐵蹄壓過前哨', action: () => startBattle('liangshanVanguard', 'chain_vanguard_win') }
      ]
    },
    chain_first_victory: {
      location: 'chaincamp', scene: 'ridge', region: '梁山泊北岸', name: '官軍前寨', caption: '首戰・步軍退入蘆葦', speaker: '旁白',
      title: '連環馬得勢，梁山卻看見了陣法代價',
      text: () => `梁山前哨無法正面抵住鐵甲騎陣，只得退入水泊。呼延灼沒有追入蘆葦，因為重甲馬已喘息不止。遠處吳用與林沖看見：此陣雖強，皮索、馬腿與轉向都是破口。`,
      choices: () => [{ label: '切換梁山視角，商議破連環馬', action: () => { syncActiveHero(); setActiveHero('songjiang'); state.chapter = 8; goScene('liangshan_chain_council'); } }]
    },
    liangshan_chain_council: {
      location: 'liangshan', scene: 'mountain', region: '濟州水泊', name: '梁山聚義廳', caption: '軍議・鐵蹄壓寨', speaker: '湯隆',
      title: '硬擋鐵甲不是勇，先造能鉤倒戰馬的兵器',
      text: () => `金錢豹子湯隆指出：他的表兄徐寧是禁軍金槍班教師，精通鉤鐮槍，專能低身鉤馬腿。若請得徐寧教陣，再由軍械坊仿造槍頭，連環馬並非不可破。<p>梁山軍械坊 Lv.${state.base.armory || 1}，等級越高，鉤鐮槍隊初始陣勢越穩。</p>`,
      choices: () => [
        { label: '以湯隆家書與舊甲暗記誠邀徐寧', action: () => { state.flags.metTangLong = true; state.flags.metXuNing = true; state.flags.hookTrainingScore += 2; unlockCompanion('xuning'); addItem('goldenArmorToken', 1); goScene('hook_lance_lesson'); } },
        { label: '依原著設局取甲，再向徐寧說明梁山危局', action: () => { state.flags.metTangLong = true; state.flags.metXuNing = true; state.flags.hookTrainingScore += 1; unlockCompanion('xuning'); addItem('goldenArmorToken', 1); goScene('hook_lance_lesson'); } }
      ]
    },
    hook_lance_lesson: {
      location: 'hookrange', scene: 'courtyard', region: '梁山後寨', name: '鉤鐮槍演武場', caption: '徐寧教陣・七日操槍', speaker: '徐寧',
      title: '槍不只刺人，先鉤索、再鉤腿、最後制騎士',
      text: () => `徐寧將步軍分為藤牌、鉤鐮與長槍三列：盾手承受第一輪衝擊，鉤鐮手貼地割索鉤腿，長槍手再制住落馬騎兵。<p>你可補強操練。訓練分數越高，正式破陣時可承受更多鐵蹄衝擊。</p>`,
      choices: () => [
        { label: '反覆練習「盾護、斷索、鉤腿」三拍', action: () => { state.flags.hookTrainingScore = Math.min(5, state.flags.hookTrainingScore + 2); state.base.timber = Math.max(0, state.base.timber - 1); goScene('hook_training'); } },
        { label: '讓林沖、扈三娘加入兩翼協同', action: () => { state.flags.hookTrainingScore = Math.min(5, state.flags.hookTrainingScore + 1); goScene('hook_training'); } }
      ]
    },
    hook_training: {
      location: 'hookrange', scene: 'courtyard', region: '梁山後寨', name: '鉤鐮槍演武場', caption: '決戰・步騎協同', speaker: '宋江',
      title: '不是一枝神兵破敵，而是一整套協同陣法',
      text: () => `鉤鐮槍隊已整備完成。正式策略戰必須依序護陣、斷索、鉤馬，再由兩翼截斷轉向，最後全隊推進。<p>訓練分數 ${state.flags.hookTrainingScore}/5｜軍械坊 Lv.${state.base.armory || 1}。</p>`,
      choices: () => [{ label: '開始「鉤鐮槍破連環馬」陣型戰', action: () => startChainDuel(false) }]
    },
    chain_broken: {
      location: 'chaincamp', scene: 'ridge', region: '梁山泊北岸', name: '連環馬戰場', caption: '鐵索斷裂・人馬散陣', speaker: '呼延灼',
      title: '陣法已破，敗將仍可選擇不把刀落向百姓',
      text: () => `鉤鐮槍專斷皮索、鉤翻前馬，連環陣一列列倒下。宋江命人救治落馬軍士，不追殺卸甲者。呼延灼敗走青州，慕容知府卻命他以掃蕩村寨立功，逼百姓替官軍承擔敗績。`,
      choices: () => [{ label: '切換呼延灼，前往青州面對新軍令', action: () => { syncActiveHero(); setActiveHero('huyanzhuo'); state.chapter = 8; goScene('huyan_qingzhou'); } }]
    },
    huyan_qingzhou: {
      location: 'qingzhou', scene: 'village', region: '青州城外', name: '桃花山下村口', caption: '敗軍・苛令再至', speaker: '呼延灼',
      title: '知府要人頭，你看見的卻是被戰火逼迫的村戶',
      text: () => `慕容知府派親軍監視，命你把拒交糧草的村戶一併當作山賊處置。你若服從，或許能換回官職；若拒絕，便等同與官府決裂。`,
      choices: () => [
        { label: '拒絕屠村，雙鞭攔住慕容府親軍', action: () => startBattle('qingzhouGuard', 'qingzhou_guard_win') },
        { label: '先放走村戶，再以軍法質問親軍', action: () => { state.flags.horseCare += 1; changeMorality(5, '先疏散村戶，再承擔抗命後果'); startBattle('qingzhouGuard', 'qingzhou_guard_win'); } }
      ]
    },
    qingzhou_after: {
      location: 'qingzhou', scene: 'village', region: '青州城外', name: '桃花山古道', caption: '雙鞭止戰・梁山來迎', speaker: '宋江',
      title: '同樣是用兵，梁山願以軍令保人而非邀功',
      text: () => `呼延灼擊退逼迫百姓的親軍，也失去回朝請罪的最後道路。宋江親自到陣前，歸還雙鞭與戰馬，並邀他共同整頓梁山馬軍。<p>呼延灼看見落馬官軍曾受梁山醫治，終於明白聚義不只是不服官府，也可以是建立另一套約束武力的軍令。</p>`,
      choices: () => [{ label: '接受邀請，加入梁山馬軍', action: () => finishChapterEight() }]
    },
    chapter8_end: {
      location: 'liangshan', scene: 'mountain', region: '濟州水泊', name: '梁山泊', caption: '聚義・步騎新編', speaker: '章回評語',
      title: '第八回完：鉤鐮槍大破連環馬',
      text: () => `連環馬之強，在於同進；其敗，也在於不能各自轉身。第八回加入呼延灼雙視角、徐寧鉤鐮槍、五階段陣型戰、軍械坊與山寨遠征。<p>雙鞭將呼延灼正式加入英雄譜，金槍手徐寧成為鉤鐮破騎型同伴。</p>`,
      choices: () => [
        { label: '進入梁山山寨', action: () => goScene('liangshan_free') },
        { label: '查看八回總成果', action: () => openSummary() },
        { label: '開啟八英雄譜', action: () => openRoster() },
        { label: '管理軍械坊與山寨建設', action: () => openBase() },
        { label: '前往鉤鐮槍演武場', action: () => goScene('chainhorse_free') },
        { label: '回到遊戲標題', action: () => { saveGame(); showTitle(); } }
      ]
    },
    chainhorse_free: {
      location: 'hookrange', scene: 'courtyard', region: '梁山後寨', name: '鉤鐮槍演武場', caption: '戰後・步騎協同', speaker: '旁白',
      title: '呼延灼與徐寧重編梁山馬步軍',
      text: () => `呼延灼負責騎隊轉向與衝鋒，徐寧訓練鉤鐮槍手。此處可重演連環馬陣型戰、挑戰演武隊，也能派出山寨遠征。<p>目前軍械坊 Lv.${state.base.armory || 1}｜遠征次數 ${state.flags.expeditionCount || 0}。</p>`,
      choices: () => [
        { label: '與鉤鐮槍演武隊切磋', action: () => startBattle('chainArena', 'chain_arena_win') },
        { label: '重演鉤鐮槍破連環馬', action: () => startChainDuel(true) },
        { label: '派出山寨遠征', action: () => openExpedition() },
        { label: '返回梁山山寨', action: () => goScene('liangshan_free') },
        { label: '恢復全部狀態', action: () => { state.hero.hp = state.hero.maxHp; state.hero.sp = state.hero.maxSp; renderGame(); } },
        { label: '調整江湖同伴編成', action: () => openTeam() },
        { label: '切換八名英雄', action: () => openRoster() },
        { label: '查看八回總成果', action: () => openSummary() }
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
    $('[data-role="portrait"]').textContent = state.hero.avatar || ({ luzhishen: '魯', linchong: '林', yangzhi: '楊', songjiang: '宋', likui: '李', husanniang: '扈', huyanzhuo: '呼', wusong: '武' }[state.activeHeroId] || '俠');
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
    $('[data-role="battle-hero-avatar"]', overlay).textContent = state.hero.avatar || ({ luzhishen: '魯', linchong: '林', yangzhi: '楊', songjiang: '宋', likui: '李', wusong: '武' }[state.activeHeroId] || '俠');
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
    const heroSkillButtons = state.activeHeroId === 'huyanzhuo'
      ? [
          { label: '雙鞭鎮嶽－8 豪氣', disabled: state.hero.sp < 8, action: () => heroBattleAction('twinWhipCrush') },
          { label: '連環馬令－12 豪氣', disabled: state.hero.sp < 12, action: () => heroBattleAction('chainHorseOrder') }
        ]
      : state.activeHeroId === 'husanniang'
      ? [
          { label: '日月雙刀－8 豪氣', disabled: state.hero.sp < 8, action: () => heroBattleAction('sunMoonBlades') },
          { label: '紅錦套索－12 豪氣', disabled: state.hero.sp < 12, action: () => heroBattleAction('redLasso') }
        ]
      : state.activeHeroId === 'likui'
      ? [
          { label: '黑旋風雙斧－8 豪氣', disabled: state.hero.sp < 8, action: () => heroBattleAction('whirlwindAxes') },
          { label: '鐵牛怒吼－12 豪氣', disabled: state.hero.sp < 12, action: () => heroBattleAction('blackRoar') }
        ]
      : state.activeHeroId === 'songjiang'
      ? [
          { label: '及時雨撫眾－8 豪氣', disabled: state.hero.sp < 8, action: () => heroBattleAction('timelyRain') },
          { label: '押司機變－12 豪氣', disabled: state.hero.sp < 12, action: () => heroBattleAction('clerkRuse') }
        ]
      : state.activeHeroId === 'yangzhi'
      ? [
          { label: '青面斬－8 豪氣', disabled: state.hero.sp < 8, action: () => heroBattleAction('greenFaceSlash') },
          { label: '護綱軍令－12 豪氣', disabled: state.hero.sp < 12, action: () => heroBattleAction('escortOrder') }
        ]
      : state.activeHeroId === 'luzhishen'
        ? [
            { label: '禪杖橫掃－8 豪氣', disabled: state.hero.sp < 8, action: () => heroBattleAction('staffSweep') },
            { label: '金剛怒喝－12 豪氣', disabled: state.hero.sp < 12, action: () => heroBattleAction('vajraRoar') }
          ]
        : state.activeHeroId === 'linchong'
          ? [
              { label: '寒星連刺－8 豪氣', disabled: state.hero.sp < 8, action: () => heroBattleAction('spearFlurry') },
              { label: '風雪回馬槍－12 豪氣', disabled: state.hero.sp < 12, action: () => heroBattleAction('snowCounter') }
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
        const critChance = 0.1 + state.hero.drunk * 0.055 + (b.critBoost || 0);
        const crit = Math.random() < critChance;
        b.critBoost = 0;
        const raw = stats.attack + randomInt(2, 7) - b.defense * 0.48;
        const chargeBonus = b.chainCharge || 1;
        const damage = Math.max(4, Math.round(raw * (crit ? 1.75 : 1) * chargeBonus));
        b.chainCharge = 1;
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

    if (type === 'spearFlurry') {
      state.hero.sp -= 8;
      let total = 0;
      for (let i = 0; i < 3; i += 1) total += Math.max(3, Math.round(stats.attack * 0.42 + randomInt(1, 4) - b.defense * 0.2));
      b.hp -= total;
      message = `林家槍法寒星連點，三刺共造成 ${total} 點傷害。`;
      tone('skill');
    }

    if (type === 'snowCounter') {
      state.hero.sp -= 12;
      const damage = Math.max(11, Math.round((stats.attack + randomInt(7, 14)) * 1.22 - b.defense * 0.32));
      b.hp -= damage;
      b.counterReady = true;
      message = `你在風雪步法中驟然回槍，造成 ${damage} 點傷害，並架起一次反擊之勢。`;
      tone('critical');
    }

    if (type === 'greenFaceSlash') {
      state.hero.sp -= 8;
      const crit = Math.random() < 0.38;
      const damage = Math.max(10, Math.round((stats.attack + randomInt(6, 13)) * (crit ? 1.65 : 1.25) - b.defense * 0.34));
      b.hp -= damage;
      message = `雁翎刀映出青光，「青面斬」造成 ${damage} 點${crit ? '致命' : ''}傷害！`;
      tone(crit ? 'critical' : 'skill');
    }

    if (type === 'escortOrder') {
      state.hero.sp -= 12;
      const damage = Math.max(9, Math.round((stats.attack + randomInt(4, 10)) * 1.05 - b.defense * 0.3));
      b.hp -= damage;
      b.attack = Math.max(8, b.attack - 3);
      state.hero.guarding = true;
      message = `你喝出護綱軍令，整隊壓進，造成 ${damage} 點傷害、削弱敵勢並架起防禦。`;
      tone('skill');
    }

    if (type === 'timelyRain') {
      state.hero.sp -= 8;
      const heal = 24 + state.hero.level * 5 + randomInt(2, 8);
      state.hero.hp = clamp(state.hero.hp + heal, 0, state.hero.maxHp);
      state.hero.guarding = true;
      message = `你以「及時雨撫眾」安定人心，恢復 ${heal} 點氣血並架起防禦。`;
      tone('level');
    }

    if (type === 'clerkRuse') {
      state.hero.sp -= 12;
      const damage = Math.max(8, Math.round((stats.attack + randomInt(4, 10)) * 0.95 - b.defense * 0.25));
      b.hp -= damage;
      b.attack = Math.max(8, b.attack - 3);
      b.defense = Math.max(0, b.defense - 3);
      b.informedDodge = 1;
      message = `你以案牘口令擾亂敵陣，「押司機變」造成 ${damage} 點傷害，並削弱敵勢、看破下一擊。`;
      tone('skill');
    }

    if (type === 'whirlwindAxes') {
      state.hero.sp -= 8;
      const woundedBonus = b.hp < b.maxHp * 0.5 ? 1.35 : 1;
      let total = 0;
      for (let i = 0; i < 2; i += 1) total += Math.max(6, Math.round((stats.attack * 0.62 + randomInt(3, 8) - b.defense * 0.27) * woundedBonus));
      b.hp -= total;
      message = `黑旋風雙斧如車輪般連劈，造成 ${total} 點傷害${woundedBonus > 1 ? '，並乘敵勢衰再度追擊' : ''}！`;
      tone('critical');
    }

    if (type === 'blackRoar') {
      state.hero.sp -= 12;
      const damage = Math.max(12, Math.round((stats.attack + randomInt(5, 12)) * 0.95 - b.defense * 0.25));
      b.hp -= damage;
      state.hero.sp = clamp(state.hero.sp + 6, 0, state.hero.maxSp);
      const stunned = Math.random() < 0.42;
      if (stunned) b.stunned = 1;
      message = `李逵一聲「鐵牛在此！」震動戰場，造成 ${damage} 點傷害並回復 6 點豪氣。${stunned ? '敵軍膽怯，下一回合無法出手。' : ''}`;
      tone(stunned ? 'critical' : 'skill');
    }

    if (type === 'sunMoonBlades') {
      state.hero.sp -= 8;
      let total = 0;
      for (let i = 0; i < 2; i += 1) total += Math.max(6, Math.round(stats.attack * 0.68 + randomInt(3, 8) - b.defense * 0.28));
      b.hp -= total;
      b.defense = Math.max(0, b.defense - 2);
      message = `日月雙刀一明一暗交錯連斬，造成 ${total} 點傷害，並削弱敵方筋骨。`;
      tone('skill');
    }

    if (type === 'redLasso') {
      state.hero.sp -= 12;
      const damage = Math.max(12, Math.round((stats.attack + randomInt(7, 14)) * 1.08 - b.defense * 0.24));
      b.hp -= damage;
      b.attack = Math.max(8, b.attack - 2);
      const snared = Math.random() < 0.48;
      if (snared) b.stunned = 1;
      message = `紅錦套索凌空捲住敵勢，造成 ${damage} 點傷害並削弱武力。${snared ? '敵手失衡，下一回合無法行動。' : ''}`;
      tone(snared ? 'critical' : 'skill');
    }

    if (type === 'twinWhipCrush') {
      state.hero.sp -= 8;
      let total = 0;
      for (let i = 0; i < 2; i += 1) total += Math.max(7, Math.round(stats.attack * 0.7 + randomInt(3, 9) - b.defense * 0.3));
      b.hp -= total;
      b.defense = Math.max(0, b.defense - 3);
      message = `雙鞭一先一後重落如山，造成 ${total} 點傷害，敵方筋骨下降。`;
      tone('skill');
    }

    if (type === 'chainHorseOrder') {
      state.hero.sp -= 12;
      const damage = Math.max(11, Math.round((stats.attack + randomInt(5, 12)) * 0.95 - b.defense * 0.24));
      b.hp -= damage;
      state.hero.guarding = true;
      b.chainCharge = 1.55;
      state.hero.sp = clamp(state.hero.sp + 4, 0, state.hero.maxSp);
      message = `你喝令騎陣收束，鐵蹄推進造成 ${damage} 點傷害；本回合進入防禦，下一次普通攻擊獲得衝鋒加成。`;
      tone('critical');
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
      } else if (companion.id === 'lixiaoer') {
        const spirit = 10 + companion.bond * 3;
        state.hero.sp = clamp(state.hero.sp + spirit, 0, state.hero.maxSp);
        b.informedDodge = 1;
        message = `李小二送來暖酒與密報，你恢復 ${spirit} 點豪氣，並看破下一次攻勢。`;
      } else if (companion.id === 'wuyong') {
        const weaken = 2 + Math.floor(companion.bond / 2);
        b.attack = Math.max(8, b.attack - weaken);
        b.defense = Math.max(0, b.defense - weaken);
        b.informedDodge = 1;
        message = `吳用展開智多星妙計，敵方武力與筋骨各降 ${weaken}，你也看破下一次攻勢。`;
      } else if (companion.id === 'chaogai') {
        const damage = 28 + companion.bond * 10 + randomInt(2, 10);
        const spirit = 5 + companion.bond * 2;
        b.hp -= damage;
        state.hero.sp = clamp(state.hero.sp + spirit, 0, state.hero.maxSp);
        message = `晁蓋托塔破陣，重創敵方 ${damage} 點，並使你恢復 ${spirit} 點豪氣。`;
      } else if (companion.id === 'daizong') {
        const spirit = 12 + companion.bond * 3;
        state.hero.sp = clamp(state.hero.sp + spirit, 0, state.hero.maxSp);
        b.informedDodge = 1;
        b.critBoost = 0.18 + companion.bond * 0.03;
        message = `戴宗踏神行甲馬疾馳送援，你恢復 ${spirit} 點豪氣、看破下一擊，下一次普通攻擊更容易重創。`;
      } else if (companion.id === 'sunli') {
        const damage = 30 + companion.bond * 9 + randomInt(3, 11);
        b.hp -= damage;
        b.defense = Math.max(0, b.defense - (2 + Math.floor(companion.bond / 2)));
        state.hero.guarding = true;
        message = `孫立以登州軍法破陣，造成 ${damage} 點傷害、削弱敵方筋骨，並替你架起守勢。`;
      } else if (companion.id === 'xuning') {
        const damage = 32 + companion.bond * 10 + randomInt(4, 12);
        b.hp -= damage;
        b.defense = Math.max(0, b.defense - (3 + Math.floor(companion.bond / 2)));
        const hooked = Math.random() < 0.35 + companion.bond * 0.05;
        if (hooked) b.stunned = 1;
        message = `徐寧使出金槍鉤鐮，造成 ${damage} 點傷害並破開筋骨。${hooked ? '敵手下盤被鉤住，下一回合無法出手。' : ''}`;
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
    const informed = b.informedDodge > 0;
    const dodgeChance = informed ? 1 : state.flags.readNotice && b.enemyId === 'tiger' ? 0.13 : 0.06;
    if (Math.random() < dodgeChance) {
      if (informed) b.informedDodge -= 1;
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
      if (b.counterReady && state.hero.hp > 0) {
        const counter = Math.max(8, Math.round(stats.attack * 0.82 + randomInt(2, 7) - b.defense * 0.22));
        b.hp -= counter;
        b.counterReady = false;
        b.message += ` 你順勢使出回馬槍，反擊造成 ${counter} 點傷害！`;
      }
      tone('hurt');
    }
    state.hero.guarding = false;
    b.turn += 1;
    if (b.hp <= 0 && state.hero.hp > 0) {
      renderBattle();
      setTimeout(() => winBattle(), 550);
      return;
    }
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
    if (result.afterWin === 'escort_win') {
      state.flags.boarForestCleared = true;
      changeMorality(4, '在野豬林自保而不濫殺公人');
      state.quests.main_linchong.progress = '脫離野豬林殺局，繼續前往滄州';
      goScene('boar_forest_after');
    }
    if (result.afterWin === 'luqian_win') {
      state.flags.luqianDefeated = true;
      state.quests.main_linchong.progress = '陸謙毒計已破，離開草料場';
      changeMorality(7, '於山神廟手刃追命仇敵');
      goScene('mountain_temple_after');
    }
    if (result.afterWin === 'cangzhou_arena_win') {
      state.flags.cangzhouArenaWins = (state.flags.cangzhouArenaWins || 0) + 1;
      addLog(`完成第 ${state.flags.cangzhouArenaWins} 次滄州槍棒切磋。`);
      state.hero.hp = clamp(state.hero.hp + 14, 0, state.hero.maxHp);
      goScene('cangzhou_free');
    }
    if (result.afterWin === 'birthday_bandits_win') {
      state.flags.birthdayBanditsDefeated = true;
      state.quests.main_birthday.progress = '擊退剪徑賊，護綱隊抵達黃泥岡';
      changeMorality(4, '護住生辰綱與同行士卒性命');
      goScene('escort_after_bandits');
    }
    if (result.afterWin === 'pursuit_win') {
      state.flags.pursuitDefeated = true;
      state.quests.main_birthday.progress = '引開追兵，楊志踏上亡命江湖路';
      goScene('yangzhi_escape_after');
    }
    if (result.afterWin === 'daming_arena_win') {
      state.flags.damingArenaWins = (state.flags.damingArenaWins || 0) + 1;
      addLog(`完成第 ${state.flags.damingArenaWins} 次大名府刀牌切磋。`);
      state.hero.hp = clamp(state.hero.hp + 16, 0, state.hero.maxHp);
      goScene('daming_free');
    }
    if (result.afterWin === 'yuncheng_patrol_win') {
      state.flags.patrolDefeated = true;
      state.flags.warnedChaoGai = true;
      state.quests.main_songjiang.progress = '突破封鎖，趕到東溪村示警晁蓋';
      changeMorality(6, '冒險突破官差封鎖，救晁蓋等人性命');
      goScene('dongxi_warning');
    }
    if (result.afterWin === 'yuncheng_arena_win') {
      state.flags.yunchengArenaWins = (state.flags.yunchengArenaWins || 0) + 1;
      addLog(`完成第 ${state.flags.yunchengArenaWins} 次鄆城朴刀切磋。`);
      state.hero.hp = clamp(state.hero.hp + 16, 0, state.hero.maxHp);
      goScene('yuncheng_free');
    }
    if (result.afterWin === 'jiangzhou_ruffians_win') {
      state.flags.metLiKui = true;
      state.flags.jiangzhouRuffiansDefeated = true;
      state.quests.main_jiangzhou.progress = '結識黑旋風李逵，準備登潯陽樓';
      changeMorality(4, '與李逵制止潑皮欺客');
      goScene('jiangzhou_tavern_after');
    }
    if (result.afterWin === 'jiangzhou_jailer_win') {
      state.flags.jailerDefeated = true;
      state.hero.hp = clamp(state.hero.hp + 20, 0, state.hero.maxHp);
      goScene('prison_cell');
    }
    if (result.afterWin === 'execution_guard_win') {
      state.flags.executionStage = 1;
      state.quests.main_jiangzhou.progress = '李逵突破刑臺，護送宋江、戴宗突圍';
      goScene('execution_break');
    }
    if (result.afterWin === 'wuwei_army_win') {
      state.flags.executionStage = 2;
      state.flags.executionRescued = true;
      changeMorality(8, '拼死護送眾好漢逃離江州追兵');
      goScene('white_dragon_temple');
    }
    if (result.afterWin === 'zhu_gate_first_win') {
      state.flags.firstAssaultFailed = true;
      state.quests.main_zhujia.progress = '首攻破外寨卻陷盤陀路，梁山軍被迫收兵';
      goScene('pantou_retreat');
    }
    if (result.afterWin === 'hu_duel_win') {
      state.flags.huDuelWon = true;
      state.flags.huCaptured = true;
      changeMorality(4, '扈三娘擒將不濫傷，守莊亦守武德');
      goScene('hu_duel_after');
    }
    if (result.afterWin === 'zhu_long_win') {
      state.flags.zhuLongDefeated = true;
      state.quests.main_zhujia.progress = '祝氏親軍已破，處置莊糧與百姓';
      goScene('zhujia_after');
    }
    if (result.afterWin === 'zhujia_arena_win') {
      state.flags.zhujiaArenaWins = (state.flags.zhujiaArenaWins || 0) + 1;
      state.base.grain += 1;
      addLog(`完成第 ${state.flags.zhujiaArenaWins} 次獨龍岡演武，取得 1 份糧草。`);
      state.hero.hp = clamp(state.hero.hp + 20, 0, state.hero.maxHp);
      goScene('zhujia_free');
    }
    if (result.afterWin === 'chain_vanguard_win') {
      state.flags.firstChainAttackWon = true;
      state.quests.main_chainhorse.progress = '連環馬首戰逼退梁山前哨，山寨另尋破騎之法';
      goScene('chain_first_victory');
    }
    if (result.afterWin === 'qingzhou_guard_win') {
      state.flags.qingzhouGuardDefeated = true;
      changeMorality(8, '拒絕以屠村換取官府信任，反護百姓離城');
      goScene('qingzhou_after');
    }
    if (result.afterWin === 'chain_arena_win') {
      state.flags.chainArenaWins = (state.flags.chainArenaWins || 0) + 1;
      state.base.stone += 1;
      if (state.flags.chainArenaWins % 2 === 0) state.base.timber += 1;
      addLog(`完成第 ${state.flags.chainArenaWins} 次鉤鐮槍演武，取得軍械建材。`);
      state.hero.hp = clamp(state.hero.hp + 22, 0, state.hero.maxHp);
      goScene('chainhorse_free');
    }
    if (result.afterWin === 'liangshan_arena_win') {
      state.flags.liangshanArenaWins = (state.flags.liangshanArenaWins || 0) + 1;
      state.base.timber += 1;
      if (state.flags.liangshanArenaWins % 2 === 0) state.base.stone += 1;
      if (state.flags.liangshanArenaWins % 3 === 0) state.base.grain += 1;
      addLog(`完成第 ${state.flags.liangshanArenaWins} 次梁山水寨演武，取得建材。`);
      state.hero.hp = clamp(state.hero.hp + 18, 0, state.hero.maxHp);
      goScene('liangshan_free');
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
      weizhouArena: 'wutai_free',
      escortThugs: 'boar_forest',
      luqian: 'mountain_temple',
      cangzhouArena: 'cangzhou_free',
      birthdayBandits: 'escort_heat',
      pursuitSoldiers: 'yangzhi_awake',
      damingArena: 'daming_free',
      yunchengPatrol: 'night_ride',
      yunchengArena: 'yuncheng_free',
      jiangzhouRuffians: 'likui_meet',
      jiangzhouJailer: 'poem_discovered',
      executionGuard: 'execution_notice',
      wuweiArmy: 'execution_break',
      liangshanArena: 'liangshan_free',
      zhuGateGuard: 'first_assault',
      wangyingDuel: 'hujia_perspective',
      zhuLong: 'fortress_breached',
      zhujiaArena: 'zhujia_free',
      liangshanVanguard: 'chain_camp_training',
      qingzhouGuard: 'huyan_qingzhou',
      chainArena: 'chainhorse_free'
    };
    goScene(recoveryScenes[enemyId] || state.sceneId);
  }

  function endBattleFlee() {
    const enemyId = state.battle?.enemyId;
    closeBattleOverlay();
    state.battle = null;
    battleLocked = false;
    addLog('暫時退出戰鬥。');
    const fleeScenes = { bandit: 'road_first', escortThugs: 'boar_forest', cangzhouArena: 'cangzhou_free', pursuitSoldiers: 'yangzhi_awake', damingArena: 'daming_free', yunchengArena: 'yuncheng_free', jiangzhouRuffians: 'likui_meet', liangshanArena: 'liangshan_free', zhujiaArena: 'zhujia_free', chainArena: 'chainhorse_free' };
    goScene(fleeScenes[enemyId] || state.sceneId);
  }

  function closeBattleOverlay() {
    $('.battle-overlay')?.remove();
    lastNarratedBattleKey = '';
  }

  function startFortressDuel(replay = false) {
    closeBattleOverlay();
    const alliance = clamp(state.flags.allianceReputation || 0, 0, 8);
    state.fortressBattle = {
      defense: 122 + (state.flags.firstAssaultScouted ? 0 : 10),
      maxDefense: 132,
      momentum: 92 + alliance * 5 + (state.base.hall || 1) * 3,
      maxMomentum: 140,
      alarm: state.flags.firstAssaultScouted ? 16 : 28,
      turn: 1,
      used: [],
      replay,
      message: '祝家莊三層寨門、盤陀路與報事鐘彼此呼應，須以情報、聯盟與臥底逐層拆解。'
    };
    fortressLocked = false;
    renderFortressDuel();
    tone('battle');
  }

  function renderFortressDuel() {
    const f = state.fortressBattle;
    if (!f) return;
    let overlay = $('.battle-overlay');
    if (!overlay) {
      document.body.append($('#battleTemplate').content.cloneNode(true));
      overlay = $('.battle-overlay');
    }
    $('[data-role="enemy-avatar"]', overlay).textContent = '寨';
    $('[data-role="enemy-name"]', overlay).textContent = '祝家莊三重防線';
    $('[data-role="enemy-title"]', overlay).textContent = `莊寨警報｜${Math.round(f.alarm)}%`;
    $('[data-role="enemy-hp-text"]', overlay).textContent = `${Math.max(0, Math.ceil(f.defense))} / ${f.maxDefense}`;
    $('[data-role="enemy-hp-bar"]', overlay).style.width = `${clamp((f.defense / f.maxDefense) * 100, 0, 100)}%`;
    $('[data-role="battle-hero-avatar"]', overlay).textContent = '義';
    $('[data-role="battle-hero-name"]', overlay).textContent = '梁山三路軍';
    $('[data-role="battle-hero-hp-text"]', overlay).textContent = `${Math.max(0, Math.ceil(f.momentum))} / ${f.maxMomentum}`;
    $('[data-role="battle-hero-hp-bar"]', overlay).style.width = `${clamp((f.momentum / f.maxMomentum) * 100, 0, 100)}%`;
    const support = $('[data-role="battle-companion"]', overlay);
    support.classList.remove('hidden');
    $('[data-role="battle-companion-avatar"]', overlay).textContent = state.flags.metSunLi ? '孫' : '圖';
    $('[data-role="battle-companion-name"]', overlay).textContent = `攻略情報｜聯盟聲望 ${state.flags.allianceReputation || 0}`;
    $('[data-role="battle-message"]', overlay).innerHTML = `<strong>第 ${f.turn} 陣</strong>｜${f.message}`;
    const actions = $('[data-role="battle-actions"]', overlay);
    actions.replaceChildren();
    const specs = [
      ['markers', '依盤陀路暗記調整軍道', !state.flags.firstAssaultScouted],
      ['liying', '李應封住西莊援路', !state.flags.liYingAllied],
      ['sunli', '孫立臥底開啟內門', !state.flags.infiltrationReady],
      ['bell', '花榮射斷報事鐘索', false],
      ['assault', '宋江下令三路總攻', f.defense > 38 || f.used.length < 3]
    ];
    for (const [id, label, unavailable] of specs) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${label}${f.used.includes(id) ? '（已用）' : ''}`;
      button.disabled = fortressLocked || unavailable || f.used.includes(id);
      button.addEventListener('click', () => fortressAction(id));
      actions.append(button);
    }
    if (prefs.narration && prefs.narrateBattle) speakText(`第 ${f.turn} 陣。${f.message}`, { interrupt: true });
  }

  function fortressAction(type) {
    const f = state.fortressBattle;
    if (!f || fortressLocked || f.used.includes(type)) return;
    fortressLocked = true;
    f.used.push(type);
    const alliance = clamp(state.flags.allianceReputation || 0, 0, 8);
    if (type === 'markers') {
      f.defense -= 18;
      f.alarm = Math.max(0, f.alarm - 10);
      f.message = '石秀留下的白粉樹記引導三路軍避開絆馬坑，盤陀迷路不再奏效。';
    } else if (type === 'liying') {
      f.defense -= 22 + Math.floor(alliance / 2);
      f.momentum = Math.min(f.maxMomentum, f.momentum + 10);
      f.message = '撲天雕李應遵守護民盟約，封住西莊援路並送來莊內道路圖。';
    } else if (type === 'sunli') {
      f.defense -= 30;
      f.alarm += 8;
      f.message = '孫立以登州教師身分騙開內門，伏兵立刻奪下吊橋與箭樓。';
    } else if (type === 'bell') {
      f.defense -= 20;
      f.alarm += 12;
      f.message = '花榮一箭射斷報事鐘索，祝家莊各寨無法互通號令。';
    } else if (type === 'assault') {
      f.defense = 0;
      f.message = '宋江令林沖、秦明、扈三娘分三路齊進，內外呼應，祝家莊寨門終於洞開！';
    }
    tone(type === 'assault' ? 'critical' : 'skill');
    renderFortressDuel();
    if (f.defense <= 0) {
      setTimeout(finishFortressDuel, 650);
      return;
    }
    setTimeout(fortressOpponentTurn, 650);
  }

  function fortressOpponentTurn() {
    const f = state.fortressBattle;
    if (!f) return;
    const pressure = randomInt(8, 14) + Math.floor(f.alarm / 24);
    f.momentum -= pressure;
    f.alarm = Math.min(100, f.alarm + randomInt(6, 10));
    f.turn += 1;
    f.message = `祝家莊弩手與陷坑輪番阻擊，梁山軍消耗 ${pressure} 點攻勢；報事火把正在向內寨傳遞。`;
    if (f.momentum <= 0 || f.alarm >= 100) {
      renderFortressDuel();
      setTimeout(loseFortressDuel, 650);
      return;
    }
    fortressLocked = false;
    renderFortressDuel();
  }

  function finishFortressDuel() {
    const replay = Boolean(state.fortressBattle?.replay);
    state.fortressBattle = null;
    fortressLocked = false;
    closeBattleOverlay();
    addLog('祝家莊攻略成功：盤陀路、三莊聯盟與孫立臥底形成連鎖破陣。');
    tone('victory');
    if (replay) goScene('zhujia_free');
    else {
      state.flags.fortressWon = true;
      state.quests.main_zhujia.progress = '祝家莊三重防線已破，迎戰祝氏親軍';
      goScene('fortress_breached');
    }
  }

  function loseFortressDuel() {
    const replay = Boolean(state.fortressBattle?.replay);
    state.fortressBattle = null;
    fortressLocked = false;
    closeBattleOverlay();
    addLog('三路軍攻勢被弩臺與盤陀路截斷，暫退獨龍岡外重整。');
    toast('攻勢或隱密度耗盡，請重新安排破陣順序。');
    goScene(replay ? 'zhujia_free' : 'third_assault');
  }


  function startChainDuel(replay = false) {
    closeBattleOverlay();
    const training = clamp(state.flags.hookTrainingScore || 0, 0, 5);
    state.chainBattle = {
      formation: 148,
      maxFormation: 148,
      momentum: 102 + training * 8 + (state.base.armory || 1) * 4,
      maxMomentum: 166,
      charge: Math.max(14, 34 - training * 3),
      turn: 1,
      used: [],
      replay,
      message: '三十匹鐵甲戰馬以皮索相連，正面衝勢極強；鉤鐮槍隊必須先護陣、斷索，再鉤倒前馬。'
    };
    chainLocked = false;
    renderChainDuel();
    tone('battle');
  }

  function renderChainDuel() {
    const c = state.chainBattle;
    if (!c) return;
    let overlay = $('.battle-overlay');
    if (!overlay) {
      document.body.append($('#battleTemplate').content.cloneNode(true));
      overlay = $('.battle-overlay');
    }
    $('[data-role="enemy-avatar"]', overlay).textContent = '馬';
    $('[data-role="enemy-name"]', overlay).textContent = '鐵甲連環馬陣';
    $('[data-role="enemy-title"]', overlay).textContent = `騎陣衝勢｜${Math.round(c.charge)}%`;
    $('[data-role="enemy-hp-text"]', overlay).textContent = `${Math.max(0, Math.ceil(c.formation))} / ${c.maxFormation}`;
    $('[data-role="enemy-hp-bar"]', overlay).style.width = `${clamp((c.formation / c.maxFormation) * 100, 0, 100)}%`;
    $('[data-role="battle-hero-avatar"]', overlay).textContent = '鉤';
    $('[data-role="battle-hero-name"]', overlay).textContent = '梁山鉤鐮槍隊';
    $('[data-role="battle-hero-hp-text"]', overlay).textContent = `${Math.max(0, Math.ceil(c.momentum))} / ${c.maxMomentum}`;
    $('[data-role="battle-hero-hp-bar"]', overlay).style.width = `${clamp((c.momentum / c.maxMomentum) * 100, 0, 100)}%`;
    const support = $('[data-role="battle-companion"]', overlay);
    support.classList.remove('hidden');
    $('[data-role="battle-companion-avatar"]', overlay).textContent = '徐';
    $('[data-role="battle-companion-name"]', overlay).textContent = `徐寧教陣｜軍械坊 Lv.${state.base.armory || 1}`;
    $('[data-role="battle-message"]', overlay).innerHTML = `<strong>第 ${c.turn} 陣</strong>｜${c.message}`;
    const actions = $('[data-role="battle-actions"]', overlay);
    actions.replaceChildren();
    const specs = [
      ['shield', '藤牌護住鉤鐮槍手', false],
      ['cut', '花榮射斷前列連馬索', !c.used.includes('shield')],
      ['hook', '徐寧號令低身鉤馬腿', !c.used.includes('cut')],
      ['flank', '林沖、扈三娘分擊兩翼', !c.used.includes('hook')],
      ['advance', '鉤鐮槍隊齊步推進', c.formation > 40 || c.used.length < 4]
    ];
    for (const [id, label, unavailable] of specs) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${label}${c.used.includes(id) ? '（已用）' : ''}`;
      button.disabled = chainLocked || unavailable || c.used.includes(id);
      button.addEventListener('click', () => chainAction(id));
      actions.append(button);
    }
    if (prefs.narration && prefs.narrateBattle) speakText(`第 ${c.turn} 陣。${c.message}`, { interrupt: true });
  }

  function chainAction(type) {
    const c = state.chainBattle;
    if (!c || chainLocked || c.used.includes(type)) return;
    chainLocked = true;
    c.used.push(type);
    const training = clamp(state.flags.hookTrainingScore || 0, 0, 5);
    if (type === 'shield') {
      c.formation -= 16 + training;
      c.charge = Math.max(0, c.charge - 10);
      c.momentum = Math.min(c.maxMomentum, c.momentum + 8);
      c.message = '藤牌手半跪成牆，鉤鐮槍手伏在盾後，第一輪鐵蹄未能撞散步陣。';
    } else if (type === 'cut') {
      c.formation -= 24 + training * 2;
      c.charge = Math.max(0, c.charge - 8);
      c.message = '花榮連珠箭射斷前列皮索，原本彼此借勢的戰馬開始失去同步。';
    } else if (type === 'hook') {
      c.formation -= 34 + training * 2;
      c.charge += 5;
      c.message = '徐寧號令槍手貼地送鉤，鉤住前馬腿腕再同時後扯，數騎轟然倒地。';
    } else if (type === 'flank') {
      c.formation -= 28 + Math.floor(training * 1.5);
      c.momentum = Math.min(c.maxMomentum, c.momentum + 12);
      c.message = '林沖與扈三娘自兩翼切入，迫使後列騎兵轉向，連環陣再也不能直線加速。';
    } else if (type === 'advance') {
      c.formation = 0;
      c.message = '鉤鐮槍隊齊步推進，前鉤馬腿、後槍制人；鐵甲連環馬終於整列崩解！';
    }
    tone(type === 'advance' ? 'critical' : 'skill');
    renderChainDuel();
    if (c.formation <= 0) {
      setTimeout(finishChainDuel, 650);
      return;
    }
    setTimeout(chainOpponentTurn, 650);
  }

  function chainOpponentTurn() {
    const c = state.chainBattle;
    if (!c) return;
    const pressure = randomInt(9, 15) + Math.floor(c.charge / 20);
    c.momentum -= pressure;
    c.charge = Math.min(100, c.charge + randomInt(7, 12));
    c.turn += 1;
    c.message = `呼延灼重整馬隊再度衝鋒，步軍消耗 ${pressure} 點陣勢；鐵蹄正在重新聚成一線。`;
    if (c.momentum <= 0 || c.charge >= 100) {
      renderChainDuel();
      setTimeout(loseChainDuel, 650);
      return;
    }
    chainLocked = false;
    renderChainDuel();
  }

  function finishChainDuel() {
    const replay = Boolean(state.chainBattle?.replay);
    state.chainBattle = null;
    chainLocked = false;
    closeBattleOverlay();
    addLog('鉤鐮槍破陣成功：斷索、鉤馬、兩翼截擊形成步騎協同。');
    tone('victory');
    if (replay) goScene('chainhorse_free');
    else {
      state.flags.chainFormationBroken = true;
      state.quests.main_chainhorse.progress = '連環馬陣已破，呼延灼退往青州';
      goScene('chain_broken');
    }
  }

  function loseChainDuel() {
    const replay = Boolean(state.chainBattle?.replay);
    state.chainBattle = null;
    chainLocked = false;
    closeBattleOverlay();
    addLog('鉤鐮槍隊未能守住陣腳，暫退後寨重新操練。');
    toast('步軍陣勢耗盡或騎陣衝勢過高，請依護陣、斷索、鉤馬的順序重試。');
    goScene(replay ? 'chainhorse_free' : 'hook_training');
  }

  function startStrategyDuel() {
    closeBattleOverlay();
    const discipline = clamp(state.flags.escortDiscipline || 0, 0, 6);
    const morale = clamp(state.flags.escortMorale || 0, 0, 6);
    state.strategyBattle = {
      guard: 100 + discipline * 8,
      maxGuard: 100 + discipline * 8,
      momentum: 100 + morale * 4,
      maxMomentum: 100 + morale * 4,
      suspicion: Math.max(5, 24 + discipline * 5 - morale * 3),
      turn: 1,
      used: [],
      message: '楊志目光如刀，七星好漢必須讓他親眼相信酒中無藥。'
    };
    strategyLocked = false;
    renderStrategyDuel();
    tone('battle');
  }

  function renderStrategyDuel() {
    const s = state.strategyBattle;
    if (!s) return;
    let overlay = $('.battle-overlay');
    if (!overlay) {
      document.body.append($('#battleTemplate').content.cloneNode(true));
      overlay = $('.battle-overlay');
    }
    $('[data-role="enemy-avatar"]', overlay).textContent = '綱';
    $('[data-role="enemy-name"]', overlay).textContent = '楊志護送隊';
    $('[data-role="enemy-title"]', overlay).textContent = `護綱警戒｜疑心 ${Math.round(s.suspicion)}%`;
    $('[data-role="enemy-hp-text"]', overlay).textContent = `${Math.max(0, Math.ceil(s.guard))} / ${s.maxGuard}`;
    $('[data-role="enemy-hp-bar"]', overlay).style.width = `${clamp((s.guard / s.maxGuard) * 100, 0, 100)}%`;
    $('[data-role="battle-hero-avatar"]', overlay).textContent = '七';
    $('[data-role="battle-hero-name"]', overlay).textContent = '七星聚義';
    $('[data-role="battle-hero-hp-text"]', overlay).textContent = `${Math.max(0, Math.ceil(s.momentum))} / ${s.maxMomentum}`;
    $('[data-role="battle-hero-hp-bar"]', overlay).style.width = `${clamp((s.momentum / s.maxMomentum) * 100, 0, 100)}%`;
    const support = $('[data-role="battle-companion"]', overlay);
    support.classList.remove('hidden');
    $('[data-role="battle-companion-avatar"]', overlay).textContent = '智';
    $('[data-role="battle-companion-name"]', overlay).textContent = `吳用佈局｜已用 ${s.used.length}/4 計`;
    $('[data-role="battle-message"]', overlay).innerHTML = `<strong>第 ${s.turn} 局</strong>｜${s.message}`;
    const actions = $('[data-role="battle-actions"]', overlay);
    actions.replaceChildren();
    const specs = [
      ['scout', '公孫勝觀天察勢'],
      ['sell', '白勝故意惜酒不賣'],
      ['drink', '晁蓋七人先買酒痛飲'],
      ['steal', '劉唐偷瓢、白勝奪酒'],
      ['drug', '吳用趁亂下蒙汗藥']
    ];
    for (const [id, label] of specs) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${label}${s.used.includes(id) ? '（已用）' : ''}`;
      button.disabled = strategyLocked || s.used.includes(id) || (id === 'drug' && s.used.length < 3);
      button.addEventListener('click', () => strategyAction(id));
      actions.append(button);
    }
    if (prefs.narration && prefs.narrateBattle) speakText(`第 ${s.turn} 局。${s.message}`, { interrupt: true });
  }

  function strategyAction(type) {
    const s = state.strategyBattle;
    if (!s || strategyLocked || s.used.includes(type)) return;
    strategyLocked = true;
    s.used.push(type);
    const scoreBonus = clamp(state.flags.strategyPlanScore || 0, 0, 3);
    if (type === 'scout') {
      s.guard -= 13 + scoreBonus * 2;
      s.suspicion = Math.max(0, s.suspicion - 8);
      s.message = '公孫勝看定風向與退路，指出楊志始終盯著酒桶與瓢，七星調整站位。';
    } else if (type === 'sell') {
      s.guard -= 18 + scoreBonus * 2;
      s.suspicion = Math.max(0, s.suspicion - 10);
      s.message = '白勝越是不肯賣酒，眾軍越相信他只是尋常販酒漢，護綱意志開始鬆動。';
    } else if (type === 'drink') {
      s.guard -= 24 + scoreBonus * 3;
      s.suspicion += 4;
      s.message = '晁蓋等人當面買酒痛飲，人人無事。楊志雖仍戒備，卻找不出破綻。';
    } else if (type === 'steal') {
      s.guard -= 28 + scoreBonus * 3;
      s.suspicion += 7;
      s.message = '劉唐故意偷酒，白勝立刻奪瓢追打，眾人目光全被爭執引開。';
    } else if (type === 'drug') {
      const prepared = ['sell', 'drink', 'steal'].filter(id => s.used.includes(id)).length;
      if (prepared >= 3) {
        s.guard = 0;
        s.message = '吳用借瓢舀酒，藥已落入桶中；白勝再奪回一瓢，天衣無縫！';
      } else {
        s.guard -= 12;
        s.suspicion += 30;
        s.message = '時機未熟便急著下藥，楊志似乎察覺瓢邊異樣！';
      }
    }
    tone(type === 'drug' ? 'critical' : 'skill');
    renderStrategyDuel();
    if (s.guard <= 0) {
      setTimeout(finishStrategyDuel, 650);
      return;
    }
    setTimeout(strategyOpponentTurn, 650);
  }

  function strategyOpponentTurn() {
    const s = state.strategyBattle;
    if (!s) return;
    const pressure = randomInt(8, 14) + Math.floor((state.flags.escortDiscipline || 0) / 2);
    s.momentum -= pressure;
    s.suspicion += randomInt(5, 10);
    s.turn += 1;
    s.message = `楊志喝令眾軍遠離酒桶，護綱隊重新盤問販棗客。七星佈局消耗 ${pressure} 點聲勢。`;
    if (s.momentum <= 0 || s.suspicion >= 100) {
      renderStrategyDuel();
      setTimeout(loseStrategyDuel, 650);
      return;
    }
    strategyLocked = false;
    renderStrategyDuel();
  }

  function finishStrategyDuel() {
    state.flags.strategyPlanScore = Math.max(state.flags.strategyPlanScore || 0, 4);
    state.strategyBattle = null;
    strategyLocked = false;
    closeBattleOverlay();
    addLog('黃泥岡智策對決成功：七星聚義智取生辰綱。');
    tone('victory');
    goScene('qixing_success');
  }

  function loseStrategyDuel() {
    state.strategyBattle = null;
    strategyLocked = false;
    closeBattleOverlay();
    addLog('智策佈局被楊志看出破綻，七星退入松林重新商議。');
    toast('疑心過高，請調整計策順序後再試。');
    goScene('qixing_plan');
  }

  function startCaseDuel(replay = false) {
    closeBattleOverlay();
    const insight = clamp(state.flags.caseInsight || 0, 0, 3);
    state.caseBattle = {
      suspicion: 110 - insight * 8,
      maxSuspicion: 110 - insight * 8,
      leverage: 108 + state.flags.yunchengReputation * 0.25,
      maxLeverage: 108 + state.flags.yunchengReputation * 0.25,
      exposure: Math.max(8, 28 - insight * 5),
      turn: 1,
      used: [],
      replay,
      message: '何濤口供已送入案房。你要用合乎公文程序的方式，為東溪村爭取一夜。'
    };
    caseLocked = false;
    renderCaseDuel();
    tone('battle');
  }

  function renderCaseDuel() {
    const c = state.caseBattle;
    if (!c) return;
    let overlay = $('.battle-overlay');
    if (!overlay) {
      document.body.append($('#battleTemplate').content.cloneNode(true));
      overlay = $('.battle-overlay');
    }
    $('[data-role="enemy-avatar"]', overlay).textContent = '疑';
    $('[data-role="enemy-name"]', overlay).textContent = '官府追查疑心';
    $('[data-role="enemy-title"]', overlay).textContent = `洩露風險｜${Math.round(c.exposure)}%`;
    $('[data-role="enemy-hp-text"]', overlay).textContent = `${Math.max(0, Math.ceil(c.suspicion))} / ${Math.ceil(c.maxSuspicion)}`;
    $('[data-role="enemy-hp-bar"]', overlay).style.width = `${clamp((c.suspicion / c.maxSuspicion) * 100, 0, 100)}%`;
    $('[data-role="battle-hero-avatar"]', overlay).textContent = '宋';
    $('[data-role="battle-hero-name"]', overlay).textContent = '宋江案牘周旋';
    $('[data-role="battle-hero-hp-text"]', overlay).textContent = `${Math.max(0, Math.ceil(c.leverage))} / ${Math.ceil(c.maxLeverage)}`;
    $('[data-role="battle-hero-hp-bar"]', overlay).style.width = `${clamp((c.leverage / c.maxLeverage) * 100, 0, 100)}%`;
    const support = $('[data-role="battle-companion"]', overlay);
    support.classList.remove('hidden');
    $('[data-role="battle-companion-avatar"]', overlay).textContent = '案';
    $('[data-role="battle-companion-name"]', overlay).textContent = `案情洞察 ${state.flags.caseInsight}/3｜已用 ${c.used.length}/4 策`;
    $('[data-role="battle-message"]', overlay).innerHTML = `<strong>第 ${c.turn} 輪</strong>｜${c.message}`;
    const actions = $('[data-role="battle-actions"]', overlay);
    actions.replaceChildren();
    const specs = [
      ['verify', '核對何濤口供與傷痕'],
      ['timeline', '重排案發時辰與驛程'],
      ['divert', '先遣都頭查訪白勝'],
      ['delay', '將東溪村列為次日後查'],
      ['seal', '封存口供、簽發緩行票']
    ];
    for (const [id, label] of specs) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${label}${c.used.includes(id) ? '（已用）' : ''}`;
      button.disabled = caseLocked || c.used.includes(id) || (id === 'seal' && c.used.length < 3);
      button.addEventListener('click', () => caseAction(id));
      actions.append(button);
    }
    if (prefs.narration && prefs.narrateBattle) speakText(`第 ${c.turn} 輪。${c.message}`, { interrupt: true });
  }

  function caseAction(type) {
    const c = state.caseBattle;
    if (!c || caseLocked || c.used.includes(type)) return;
    caseLocked = true;
    c.used.push(type);
    const insight = clamp(state.flags.caseInsight || 0, 0, 3);
    if (type === 'verify') {
      c.suspicion -= 16 + insight * 2;
      c.exposure = Math.max(0, c.exposure - 8);
      c.message = '你逐項核對何濤傷痕與路程，指出口供仍有待覆核，知縣准你補齊案卷。';
    } else if (type === 'timeline') {
      c.suspicion -= 20 + insight * 2;
      c.exposure = Math.max(0, c.exposure - 6);
      c.message = '你重排黃泥岡至鄆城的驛程，證明連夜大索未必能趕上，官差開始依賴你的判斷。';
    } else if (type === 'divert') {
      c.suspicion -= 24 + insight * 3;
      c.exposure += 5;
      c.message = '你援引口供，主張先查白勝酒桶與住處，朱仝、雷橫的隊伍被引往另一條路。';
    } else if (type === 'delay') {
      c.suspicion -= 28 + insight * 3;
      c.exposure += 8;
      c.message = '你把東溪村排到次日後查，表面合乎由近及遠的緝捕次序，實際替晁蓋爭到一夜。';
    } else if (type === 'seal') {
      const prepared = ['verify', 'timeline', 'divert', 'delay'].filter(id => c.used.includes(id)).length;
      if (prepared >= 3) {
        c.suspicion = 0;
        c.message = '你落下押司朱筆、封存口供並簽出緩行票。官差明晨才會前往東溪村。';
      } else {
        c.suspicion -= 10;
        c.exposure += 32;
        c.message = '案卷尚未鋪陳便急著封存，知縣察覺你的筆意不尋常！';
      }
    }
    tone(type === 'seal' ? 'critical' : 'skill');
    renderCaseDuel();
    if (c.suspicion <= 0) {
      setTimeout(finishCaseDuel, 650);
      return;
    }
    setTimeout(caseOpponentTurn, 650);
  }

  function caseOpponentTurn() {
    const c = state.caseBattle;
    if (!c) return;
    const pressure = randomInt(8, 14) + Math.floor(c.exposure / 30);
    c.leverage -= pressure;
    c.exposure += randomInt(5, 9);
    c.turn += 1;
    c.message = `何濤催問何時出發，知縣又派書吏來取案卷；你的周旋餘裕減少 ${pressure} 點。`;
    if (c.leverage <= 0 || c.exposure >= 100) {
      renderCaseDuel();
      setTimeout(loseCaseDuel, 650);
      return;
    }
    caseLocked = false;
    renderCaseDuel();
  }

  function finishCaseDuel() {
    const replay = state.caseBattle?.replay;
    state.caseBattle = null;
    caseLocked = false;
    closeBattleOverlay();
    if (replay) {
      addLog('重演案牘推演成功。');
      tone('victory');
      goScene('yuncheng_free');
      return;
    }
    state.flags.caseDuelWon = true;
    state.flags.caseInsight = Math.max(2, state.flags.caseInsight || 0);
    state.flags.yunchengReputation += 4;
    state.quests.main_songjiang.progress = '以公文程序拖延緝捕，準備快馬示警';
    addLog('案牘推演成功：官差出發時間被拖到次日。');
    tone('victory');
    goScene('case_success');
  }

  function loseCaseDuel() {
    const replay = state.caseBattle?.replay;
    state.caseBattle = null;
    caseLocked = false;
    closeBattleOverlay();
    if (replay) {
      toast('案牘推演未成，可重新調整順序。');
      goScene('yuncheng_free');
      return;
    }
    state.flags.caseDuelWon = false;
    state.flags.yunchengReputation = Math.max(35, state.flags.yunchengReputation - 4);
    state.quests.main_songjiang.progress = '拖延失敗，必須突破東溪村封鎖';
    addLog('案牘推演露出破綻，官差提前封鎖東溪村。');
    toast('官府疑心升高，夜路將出現追兵。');
    goScene('night_ride');
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
          <article class="info-card"><h3>八章回探索</h3><p>依序操控武松、魯智深、林沖、楊志、宋江、李逵、扈三娘與呼延灼。第八回加入官軍／梁山雙視角、連環馬陣型戰與八英雄切換。</p></article>
          <article class="info-card"><h3>黃泥岡智策</h3><p>第四回先從楊志護送視角維持軍紀與士氣，再切換吳用視角，以計策順序瓦解護綱警戒。</p></article>
          <article class="info-card"><h3>鄆城案牘推演</h3><p>第五回以宋江押司身分核對口供、安排查訪次序，在官府疑心升滿前替晁蓋爭取逃離時間。</p></article>
          <article class="info-card"><h3>祝家莊攻略</h3><p>第七回結合盤陀路偵察、扈三娘決鬥、孫立臥底與五階段軍略。前兩次進攻取得的情報，會直接影響第三次總攻難度。</p></article>
          <article class="info-card"><h3>連環馬陣型戰</h3><p>第八回要以藤牌護陣、箭斷皮索、鉤鐮倒馬與兩翼截擊依序破解鐵甲騎陣；軍械坊與訓練分數會提高步軍陣勢。</p></article>
          <article class="info-card"><h3>梁山建設</h3><p>可使用木材、石料、糧草與銀兩升級聚義廳、醫館、鐵匠鋪、糧倉及軍械坊；完成第八回後可派出山寨遠征。</p></article>
          <article class="info-card"><h3>回合戰鬥</h3><p>普通攻擊可累積豪氣；技能傷害較高。防禦能大幅降低下一次受傷。</p></article>
          <article class="info-card"><h3>酒意</h3><p>酒意越高，普通攻擊暴擊率越高，但命中稍微下降；醉拳技能也會更強。</p></article>
          <article class="info-card"><h3>同伴編成</h3><p>目前可結識宋江、柴進、史進、李小二、吳用、晁蓋、戴宗、孫立與徐寧。每場戰鬥可使用一次助陣技能，共同取勝會提升羈絆。</p></article>
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
      subtitle: '八章回版：新增大破連環馬、呼延灼主角與鉤鐮槍陣型戰',
      content: `
        <div class="modal-grid">
          <article class="info-card"><h3>已收錄</h3><p>八回章回劇情、武松／魯智深／林沖／楊志／宋江／李逵／扈三娘／呼延灼八主角、專屬技能、九名同伴、黃泥岡智策、鄆城案牘、江州劫法場、祝家莊攻略、連環馬陣型戰、山寨遠征、梁山建設、語音播報、本機存檔與 PWA。</p></article>
          <article class="info-card"><h3>文學改編</h3><p>以《水滸傳》景陽岡打虎、拳打鎮關西、風雪山神廟、智取生辰綱、宋江私放晁蓋、江州劫法場、三打祝家莊與大破連環馬為主軸；部分選擇加入架空分歧，並非原文逐字重現。</p></article>
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
    const heroNames = { wusong: '武松', luzhishen: state.heroes.luzhishen.name || '魯智深', linchong: '林沖', yangzhi: '楊志', songjiang: '宋江', likui: '李逵', husanniang: '扈三娘', huyanzhuo: '呼延灼' };
    const homeNames = { wusong: '陽谷縣', luzhishen: '五臺山', linchong: '滄州牢城', yangzhi: '大名府演武院', songjiang: '江州舊地', likui: '梁山泊聚義廳', husanniang: '獨龍岡演武庭', huyanzhuo: '鉤鐮槍演武場' };
    const unlockHints = {
      wusong: '第一回初始英雄。',
      luzhishen: '完成第一回後，開啟「魯提轄拳打鎮關西」。',
      linchong: '完成第二回後，開啟「林教頭風雪山神廟」。',
      yangzhi: '完成第三回後，開啟「吳用智取生辰綱」。',
      songjiang: '完成第四回後，開啟「宋江私放晁蓋」。',
      likui: '完成第五回後，開啟「江州題反詩與劫法場」。',
      husanniang: '完成第六回後，開啟「三打祝家莊」。',
      huyanzhuo: '完成第七回後，開啟「大破連環馬」。'
    };
    const cards = Object.keys(HERO_BLUEPRINTS).map(id => {
      const hero = state.heroes[id];
      const unlocked = Boolean(hero?.unlocked);
      if (!unlocked) return `<article class="hero-roster-card locked"><span class="hero-roster-avatar">？</span><div><h3>尚未開篇</h3><p>${escapeHtml(unlockHints[id])}</p></div></article>`;
      const stats = getStatsForHero(id);
      const active = id === state.activeHeroId;
      const storyComplete = id === 'linchong' ? state.flags.chapter3Complete : id === 'yangzhi' ? state.flags.chapter4Complete : id === 'songjiang' ? state.flags.chapter5Complete : id === 'likui' ? state.flags.chapter6Complete : id === 'husanniang' ? state.flags.chapter7Complete : id === 'huyanzhuo' ? state.flags.chapter8Complete : true;
      const switchDisabled = active || !state.flags.chapter2Complete || !storyComplete;
      const chapterLabel = id === 'huyanzhuo' ? '八' : id === 'husanniang' ? '七' : id === 'likui' ? '六' : id === 'songjiang' ? '五' : id === 'yangzhi' ? '四' : '三';
      const buttonText = active ? '目前主角' : !storyComplete ? `完成第${chapterLabel}回後開放` : `切換為${heroNames[id]}`;
      return `<article class="hero-roster-card ${active ? 'active' : ''}">
        <span class="hero-roster-avatar">${escapeHtml(hero.avatar || hero.name.slice(0, 1))}</span>
        <div class="hero-roster-copy"><h3>${escapeHtml(hero.name)}</h3><p>${escapeHtml(hero.title)}</p><p>Lv.${hero.level}｜武力 ${stats.attack}｜筋骨 ${stats.defense}｜義氣 ${hero.morality}</p><p>章回據點：${homeNames[id]}</p></div>
        <button type="button" data-switch-hero="${id}" ${switchDisabled ? 'disabled' : ''}>${buttonText}</button>
      </article>`;
    }).join('');
    const subtitle = state.flags.chapter8Complete ? '八位英雄均可自由切換；個別保存數值、銀兩與裝備，行囊、同伴及梁山資源共用。'
      : state.flags.chapter8Started ? '第八回進行中；完成大破連環馬後，呼延灼將正式加入英雄譜。'
      : state.flags.chapter7Complete ? '七位英雄均可自由切換；可由梁山開啟大破連環馬。'
      : state.flags.chapter7Started ? '第七回進行中；完成三打祝家莊後，扈三娘將正式加入英雄譜。'
      : state.flags.chapter6Complete ? '六位英雄均可自由切換；可由梁山開啟三打祝家莊。'
      : state.flags.chapter6Started ? '第六回進行中；完成江州劫法場後，李逵將正式加入英雄譜。'
        : state.flags.chapter5Complete ? '第五回已完成，可開啟江州題反詩與劫法場。'
      : state.flags.chapter5Started ? '第五回進行中；宋江完成鄆城亡命篇後，將正式開放自由切換。'
        : state.flags.chapter4Complete ? '第四回已完成，可開啟宋江私放晁蓋與閻婆惜事件。'
          : state.flags.chapter4Started ? '第四回進行中；楊志完成黃泥岡失綱篇後，將正式開放自由切換。'
            : state.flags.chapter3Complete ? '第三回已完成，可開啟楊志與吳用交錯視角的智取生辰綱。'
              : '依序完成章回即可擴充英雄譜。';
    openModal({ title: '梁山英雄譜', subtitle, content: `<div class="hero-roster-grid">${cards}</div>`, wide: true });
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
      const isHero = id === state.activeHeroId;
      const nextAt = entry.bond >= 5 ? '羈絆已滿' : `再共同取勝 ${Math.max(1, entry.bond * 2 - (entry.wins || 0))} 場可提升`;
      return `<article class="companion-card ${active ? 'active' : ''}">
        <div class="companion-card-head"><span class="companion-card-avatar">${escapeHtml(companion.avatar)}</span><div><h3>${escapeHtml(companion.name)}</h3><p>${escapeHtml(companion.title)}｜${escapeHtml(companion.role)}</p></div></div>
        <p>${escapeHtml(companion.description)}</p>
        <div class="bond-row"><span>羈絆 ${entry.bond}/5</span><span>${escapeHtml(nextAt)}</span></div>
        <div class="bond-meter"><i style="width:${entry.bond * 20}%"></i></div>
        <footer><strong>${escapeHtml(companion.skillName)}</strong><button type="button" data-set-companion="${id}" ${active || isHero ? 'disabled' : ''}>${isHero ? '本章主角' : active ? '助陣中' : '設為助陣'}</button></footer>
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
      county: [26, 45], weizhou: [72, 36], market: [30, 28], wutai: [76, 20],
      boarforest: [27, 12], cangzhou: [55, 8], grassyard: [80, 5],
      daming: [10, 56], huangnigang: [52, 35], yuncheng: [28, 24], dongxi: [76, 15],
      jiangzhou: [18, 82], xunyang: [48, 88], execution: [77, 82], liangshan: [55, 70],
      dulong: [16, 62], zhujia: [48, 57], hujia: [80, 51],
      chaincamp: [18, 44], hookrange: [50, 40], qingzhou: [82, 35]
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
    const thirdChapterLocations = ['boarforest', 'cangzhou', 'grassyard'];
    const fourthChapterLocations = ['daming', 'huangnigang'];
    const fifthChapterLocations = ['yuncheng', 'dongxi'];
    const sixthSongLocations = ['jiangzhou', 'xunyang', 'execution'];
    const seventhChapterLocations = ['dulong', 'zhujia', 'hujia'];
    const eighthChapterLocations = ['chaincamp', 'hookrange', 'qingzhou'];
    const requiredHero = eighthChapterLocations.includes(locationId) ? 'huyanzhuo' : seventhChapterLocations.includes(locationId) ? 'husanniang' : locationId === 'liangshan' ? (state.activeHeroId === 'likui' ? 'likui' : 'songjiang') : sixthSongLocations.includes(locationId) ? 'songjiang' : fifthChapterLocations.includes(locationId) ? 'songjiang' : fourthChapterLocations.includes(locationId) ? 'yangzhi' : thirdChapterLocations.includes(locationId) ? 'linchong' : secondChapterLocations.includes(locationId) ? 'luzhishen' : 'wusong';
    if (state.activeHeroId !== requiredHero) {
      if (!state.flags.chapter2Complete) { toast('目前正處於另一位英雄的關鍵章回，尚不能跨線旅行。'); return; }
      if (requiredHero === 'linchong' && !state.flags.chapter3Complete) { closeModal(); startChapterThree(); return; }
      if (requiredHero === 'yangzhi' && !state.flags.chapter4Complete) { closeModal(); startChapterFour(); return; }
      if (requiredHero === 'songjiang' && !state.flags.chapter5Complete) { closeModal(); startChapterFive(); return; }
      if (locationId === 'liangshan' && !state.flags.chapter6Complete) { closeModal(); startChapterSix(); return; }
      if (requiredHero === 'husanniang' && !state.flags.chapter7Complete) { closeModal(); startChapterSeven(); return; }
      if (requiredHero === 'huyanzhuo' && !state.flags.chapter8Complete) { closeModal(); startChapterEight(); return; }
      setActiveHero(requiredHero);
      state.chapter = { wusong: 1, luzhishen: 2, linchong: 3, yangzhi: 4, songjiang: state.flags.chapter6Started ? 6 : 5, likui: 6, husanniang: 7, huyanzhuo: 8 }[requiredHero];
    }
    const destinations = {
      manor: 'manor_depart', road: state.flags.roadBanditCleared ? 'road_after_bandit' : 'road_first', inn: 'inn_arrive',
      forest: state.flags.tigerDefeated ? 'tiger_fallen' : 'forest_notice', county: state.flags.gameComplete ? 'county_free' : 'county_reward',
      weizhou: state.flags.chapter2Complete ? 'weizhou_free' : state.flags.reachedButcherStall ? 'butcher_stall' : state.flags.jinFamilySaved ? 'jin_departed' : 'weizhou_tavern',
      market: state.flags.zhengDefeated ? 'weizhou_free' : 'butcher_stall', wutai: state.flags.chapter2Complete ? 'wutai_free' : 'wutai_gate',
      boarforest: state.flags.boarForestCleared ? 'boar_forest_after' : 'boar_forest',
      cangzhou: state.flags.chapter3Complete ? 'cangzhou_free' : state.flags.metLiXiaoer ? 'cangzhou_tavern' : 'cangzhou_camp',
      grassyard: state.flags.luqianDefeated ? 'mountain_temple_after' : 'grass_yard',
      daming: state.flags.chapter4Complete ? 'daming_free' : state.flags.acceptedBirthdayEscort ? 'escort_depart' : 'daming_mansion',
      huangnigang: state.flags.chapter4Complete ? 'daming_free' : state.flags.birthdayCargoLost ? 'yangzhi_awake' : state.flags.qixingPerspective ? 'qixing_plan' : 'huangnigang_arrive',
      yuncheng: state.flags.chapter5Complete ? 'yuncheng_free' : state.flags.yanFoundLetter ? 'yan_confrontation' : state.flags.chaoLetterReceived ? 'songjiang_home' : state.flags.metHeTao ? 'case_files' : 'yuncheng_yamen',
      dongxi: state.flags.chapter5Complete ? 'yuncheng_free' : state.flags.warnedChaoGai ? 'dongxi_depart' : 'night_ride',
      jiangzhou: state.flags.chapter6Complete ? 'jiangzhou_free' : state.flags.metDaiZong ? (state.flags.metLiKui ? 'jiangzhou_tavern_after' : 'likui_meet') : 'jiangzhou_arrival',
      xunyang: state.flags.executionSentenced ? 'prison_cell' : 'xunyang_tower',
      execution: state.flags.executionRescued ? 'white_dragon_temple' : state.flags.executionStage ? 'execution_break' : 'execution_notice',
      liangshan: 'liangshan_free',
      dulong: state.flags.chapter7Complete ? 'zhujia_free' : state.flags.firstAssaultFailed ? 'pantou_retreat' : 'dulong_ridge',
      zhujia: state.flags.chapter7Complete ? 'zhujia_free' : state.flags.fortressWon ? 'fortress_breached' : state.flags.infiltrationReady ? 'third_assault' : 'first_assault',
      hujia: state.flags.chapter7Complete ? 'zhujia_free' : state.flags.huCaptured ? 'liying_negotiation' : 'hujia_perspective',
      chaincamp: state.flags.chapter8Complete ? 'chainhorse_free' : state.flags.firstChainAttackWon ? 'liangshan_chain_council' : 'chain_camp_training',
      hookrange: state.flags.chapter8Complete ? 'chainhorse_free' : 'hook_training',
      qingzhou: state.flags.chapter8Complete ? 'chainhorse_free' : 'huyan_qingzhou'
    };
    closeModal();
    goScene(destinations[locationId]);
  }

  function openSummary() {
    syncActiveHero();
    const completed = Object.values(state.quests).filter(q => q.status === 'completed').length;
    const ids = ['wusong', 'luzhishen', 'linchong', 'yangzhi', 'songjiang', 'likui', 'husanniang', 'huyanzhuo'];
    const unlockedHeroes = ids.map(id => state.heroes[id]).filter(hero => hero?.unlocked);
    const averageMorality = unlockedHeroes.reduce((sum, hero) => sum + hero.morality, 0) / Math.max(1, unlockedHeroes.length);
    const ending = averageMorality >= 75 ? '義薄雲天' : averageMorality >= 58 ? '群星聚義' : '豪傑本色';
    const fallbacks = { wusong: '武松', luzhishen: '魯智深', linchong: '林沖', yangzhi: '楊志', songjiang: '宋江', likui: '李逵', husanniang: '扈三娘', huyanzhuo: '呼延灼' };
    const heroCards = ids.map(id => {
      const hero = state.heroes[id];
      const unlocked = Boolean(hero?.unlocked);
      const stats = unlocked ? getStatsForHero(id) : { attack: '－', defense: '－' };
      return `<article class="info-card"><h3>${unlocked ? escapeHtml(hero.name) : fallbacks[id]}</h3><p>${unlocked ? escapeHtml(hero.title) : '章回尚未開啟'}</p><p>等級 ${unlocked ? hero.level : '－'}</p><p>武力 ${stats.attack}｜筋骨 ${stats.defense}</p><p>義氣 ${unlocked ? hero.morality : '－'}</p></article>`;
    }).join('');
    const title = state.flags.chapter8Complete ? '八回章回成果' : state.flags.chapter7Complete ? '七回章回成果' : state.flags.chapter6Complete ? '六回章回成果' : state.flags.chapter5Complete ? '五回章回成果' : state.flags.chapter4Complete ? '四回章回成果' : state.flags.chapter3Complete ? '三回章回成果' : state.flags.chapter2Complete ? '兩回章回成果' : '第一回成果';
    openModal({
      title, subtitle: `章回評等：${ending}`,
      content: `<div class="modal-grid">
        ${heroCards}
        <article class="info-card"><h3>歷程</h3><p>完成任務：${completed}</p><p>景陽岡猛虎：${state.flags.tigerDefeated ? '已擊破' : '未擊破'}</p><p>鎮關西鄭屠：${state.flags.zhengDefeated ? '已伏誅' : '尚未交鋒'}</p><p>山神廟陸謙：${state.flags.luqianDefeated ? '已伏誅' : '尚未交鋒'}</p><p>生辰綱：${state.flags.birthdayCargoLost ? '黃泥岡智取成功' : '章回尚未完成'}</p><p>鄆城結局：${state.flags.chapter5Complete ? (state.flags.yanOutcome === 'mercy' ? '義全人未傷' : state.flags.yanOutcome === 'exile' ? '忍辱遠走' : '原著悲劇線') : '章回尚未完成'}</p><p>江州法場：${state.flags.executionRescued ? '兩階段救援成功' : '章回尚未完成'}</p><p>祝家莊：${state.flags.chapter7Complete ? `三打破莊｜聯盟聲望 ${state.flags.allianceReputation}` : '章回尚未完成'}</p><p>連環馬：${state.flags.chapter8Complete ? `鉤鐮破陣｜訓練 ${state.flags.hookTrainingScore}/5` : '章回尚未完成'}</p><p>演武勝場：${(state.flags.arenaWins || 0) + (state.flags.weizhouArenaWins || 0) + (state.flags.cangzhouArenaWins || 0) + (state.flags.damingArenaWins || 0) + (state.flags.yunchengArenaWins || 0) + (state.flags.liangshanArenaWins || 0) + (state.flags.zhujiaArenaWins || 0) + (state.flags.chainArenaWins || 0)}</p></article>
        <article class="info-card"><h3>同伴與收藏</h3><p>已結識同伴：${Object.values(state.companions).filter(entry => entry.unlocked).length} / ${Object.keys(COMPANIONS).length}</p><p>打虎英雄牌：${state.inventory.tigerToken ? '已取得' : '未取得'}</p><p>五臺度牒：${state.inventory.monkCertificate ? '已取得' : '未取得'}</p><p>草料場銅印：${state.inventory.grassYardSeal ? '已取得' : '未取得'}</p><p>棗瓢暗記：${state.inventory.dateScoop ? '已取得' : '未取得'}</p><p>鄆城押司印記：${state.inventory.yunchengSeal ? '已取得' : '未取得'}</p><p>梁山聚義旗：${state.inventory.liangshanBanner ? '已取得' : '未取得'}</p><p>獨龍岡盟誓牌：${state.inventory.allianceToken ? '已取得' : '未取得'}</p><p>鉤鐮槍譜：${state.inventory.hookLanceManual ? '已取得' : '未取得'}</p><p>山寨：聚義廳 Lv.${state.base.hall}｜醫館 Lv.${state.base.infirmary}｜鐵匠鋪 Lv.${state.base.forge}｜糧倉 Lv.${state.base.granary}｜軍械坊 Lv.${state.base.armory || 1}</p><p>糧草：${state.base.grain}｜遠征 ${state.flags.expeditionCount || 0} 次</p></article>
        <article class="info-card"><h3>後續預告</h3><p>${state.flags.chapter8Complete ? '下一版預計開啟晁蓋曾頭市中箭與梁山寨主更替，加入軍團編成與據點防衛。' : state.flags.chapter7Complete ? '可開啟大破連環馬，體驗呼延灼雙視角、鉤鐮槍陣型戰與山寨遠征。' : state.flags.chapter6Complete ? '可開啟三打祝家莊，體驗盤陀路、三莊聯盟與臥底攻略。' : state.flags.chapter5Complete ? '完成第五回後，可開啟江州題反詩與劫法場。' : state.flags.chapter4Complete ? '完成第四回後，可開啟宋江私放晁蓋與鄆城案牘推演。' : state.flags.chapter3Complete ? '完成第三回後，可開啟楊志與吳用交錯視角的智取生辰綱。' : state.flags.chapter2Complete ? '完成第二回後，可開啟林教頭風雪山神廟。' : '完成第一回後，可開啟魯提轄拳打鎮關西。'}</p></article>
      </div>`, wide: true
    });
  }


  function openBase() {
    if (!state?.flags?.liangshanBaseUnlocked) {
      toast('完成第六回江州劫法場後，才會開放梁山建設。');
      return;
    }
    const b = state.base;
    const costText = level => `${level + 1} 木材、${Math.max(1, level)} 石料、${8 + level * 6} 兩`;
    openModal({
      title: '梁山山寨建設',
      subtitle: `木材 ${b.timber}｜石料 ${b.stone}｜糧草 ${b.grain}｜${state.hero.name}持有 ${state.hero.silver} 兩`,
      content: `<div class="modal-grid">
        <article class="info-card"><h3>聚義廳 Lv.${b.hall}</h3><p>提高山寨士氣；每級使梁山演武獎勵額外增加 1 兩。</p><button type="button" data-base-upgrade="hall">升級：${costText(b.hall)}</button></article>
        <article class="info-card"><h3>醫館 Lv.${b.infirmary}</h3><p>每級提高梁山休息時的氣血與豪氣恢復量。</p><button type="button" data-base-upgrade="infirmary">升級：${costText(b.infirmary)}</button></article>
        <article class="info-card"><h3>鐵匠鋪 Lv.${b.forge}</h3><p>每級讓普通攻擊在梁山演武中額外獲得 1 點基礎傷害。</p><button type="button" data-base-upgrade="forge">升級：${costText(b.forge)}</button></article>
        <article class="info-card"><h3>糧倉 Lv.${b.granary}</h3><p>提高糧草儲備與全寨整備效率；消耗 1 份糧草可使所有已解鎖英雄恢復。</p><button type="button" data-base-upgrade="granary">升級：${costText(b.granary)}</button><button type="button" data-base-rest>全寨整備：消耗 1 份糧草</button></article>
        <article class="info-card"><h3>軍械坊 Lv.${b.armory || 1}</h3><p>提高鉤鐮槍陣型戰的初始陣勢，並改善遠征取得軍械建材的效率。</p><button type="button" data-base-upgrade="armory">升級：${costText(b.armory || 1)}</button><button type="button" data-base-expedition ${state.flags.chapter8Complete ? '' : 'disabled'}>山寨遠征</button></article>
      </div>`, wide: true
    });
    $$('[data-base-upgrade]', modalRoot).forEach(button => button.addEventListener('click', () => upgradeBase(button.dataset.baseUpgrade)));
    $('[data-base-rest]', modalRoot)?.addEventListener('click', resupplyBase);
    $('[data-base-expedition]', modalRoot)?.addEventListener('click', openExpedition);
  }

  function upgradeBase(type) {
    const b = state.base;
    const level = b[type] || 1;
    if (level >= 5) { toast('此建築已升至目前版本上限。'); return; }
    const timber = level + 1;
    const stone = Math.max(1, level);
    const silver = 8 + level * 6;
    if (b.timber < timber || b.stone < stone || state.hero.silver < silver) {
      toast('木材、石料或銀兩不足。可透過梁山演武取得建材。');
      return;
    }
    b.timber -= timber; b.stone -= stone; state.hero.silver -= silver; b[type] += 1;
    const names = { hall: '聚義廳', infirmary: '醫館', forge: '鐵匠鋪', granary: '糧倉', armory: '軍械坊' };
    addLog(`${names[type]}升至 Lv.${b[type]}。`);
    tone('level'); saveGame(false); openBase(); renderHeroPanel();
  }

  function resupplyBase() {
    if ((state.base.grain || 0) < 1) { toast('糧草不足。可透過獨龍岡演武或梁山水寨演武取得。'); return; }
    syncActiveHero();
    state.base.grain -= 1;
    Object.values(state.heroes).forEach(hero => {
      if (!hero?.unlocked) return;
      const ratio = clamp(0.72 + (state.base.granary || 1) * 0.06, 0.78, 1);
      hero.hp = Math.round(hero.maxHp * ratio);
      hero.sp = hero.maxSp;
    });
    state.hero = cloneData(state.heroes[state.activeHeroId]);
    addLog(`糧倉發放軍糧，所有已解鎖英雄完成全寨整備（糧倉 Lv.${state.base.granary}）。`);
    tone('level'); saveGame(false); openBase(); renderHeroPanel();
  }


  function openExpedition() {
    if (!state?.flags?.chapter8Complete) {
      toast('完成第八回後，才會開放山寨遠征。');
      return;
    }
    openModal({
      title: '梁山山寨遠征',
      subtitle: `糧草 ${state.base.grain}｜軍械坊 Lv.${state.base.armory || 1}｜已完成 ${state.flags.expeditionCount || 0} 次`,
      content: `<div class="modal-grid">
        <article class="info-card"><h3>濟州糧道護送</h3><p>消耗 2 份糧草，護送商旅並交換木材。穩定取得木材與銀兩。</p><button type="button" data-expedition="grainroad">派隊護送</button></article>
        <article class="info-card"><h3>青州廢馬場搜索</h3><p>消耗 2 份糧草，回收馬具、鐵料與皮索。軍械坊越高，石料回收越多。</p><button type="button" data-expedition="horseyard">派隊搜索</button></article>
        <article class="info-card"><h3>滄州鐵礦交涉</h3><p>消耗 2 份糧草，以銀兩與護衛換取軍械材料；可同時提升目前同伴羈絆。</p><button type="button" data-expedition="ironmine">派隊交涉</button></article>
      </div>`, wide: true
    });
    $$('[data-expedition]', modalRoot).forEach(button => button.addEventListener('click', () => runExpedition(button.dataset.expedition)));
  }

  function runExpedition(type) {
    if ((state.base.grain || 0) < 2) { toast('糧草不足，遠征至少需要 2 份糧草。'); return; }
    state.base.grain -= 2;
    state.flags.expeditionCount = (state.flags.expeditionCount || 0) + 1;
    const armory = state.base.armory || 1;
    if (type === 'grainroad') {
      const timber = 2 + Math.floor(armory / 2);
      const silver = 8 + armory * 3;
      state.base.timber += timber;
      state.hero.silver += silver;
      addLog(`濟州糧道護送完成：取得木材 ${timber}、銀兩 ${silver}。`);
    } else if (type === 'horseyard') {
      const stone = 2 + Math.floor(armory / 2);
      state.base.stone += stone;
      state.base.timber += 1;
      addLog(`青州廢馬場搜索完成：取得石料 ${stone}、木材 1。`);
    } else {
      const stone = 1 + Math.floor(armory / 2);
      const silver = 5 + armory * 2;
      state.base.stone += stone;
      state.hero.silver += silver;
      if (activeCompanion()) gainCompanionBond();
      addLog(`滄州鐵礦交涉完成：取得石料 ${stone}、銀兩 ${silver}，同伴羈絆獲得磨合。`);
    }
    tone('level');
    saveGame(false);
    renderHeroPanel();
    openExpedition();
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
    if (action === 'open-base') openBase();
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
