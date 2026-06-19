(() => {
  'use strict';
  const VERSION = '7.9.2';
  const BAD_PATTERNS = [/\bundefined\b/i, /\[object Object\]/i];
  const text = value => {
    if (value == null) return '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return value.map(text).filter(Boolean).join('、');
    if (typeof value === 'object') return String(value.text || value.title || value.name || value.label || value.result || value.question || value.prompt || '');
    return String(value);
  };
  const normalizeOption = (option, index = 0) => {
    const letter = String.fromCharCode(65 + index);
    if (typeof option === 'string' || typeof option === 'number') {
      return {key: letter, text: String(option), success: false, result: '', effect: {}};
    }
    option = option || {};
    const out = {
      key: text(option.key) || letter,
      text: text(option.text || option.title || option.label || option.name || option.choice),
      success: Boolean(option.success || option.correct || option.ok),
      result: text(option.result || option.message || option.feedback || option.after),
      effect: option.effect && typeof option.effect === 'object' ? option.effect : {}
    };
    if (!out.text) out.text = `選項 ${letter}`;
    return out;
  };
  const normalizeTrial = (trial, chapter = {}) => {
    trial = trial || {};
    const options = Array.isArray(trial.options) ? trial.options : (Array.isArray(trial.choices) ? trial.choices : []);
    return {
      icon: text(trial.icon) || '🧭',
      name: text(trial.name || trial.title) || `${text(chapter.nickname || chapter.name) || '章回'}判斷`,
      prompt: text(trial.prompt || trial.question || trial.text) || `請判斷「${text(chapter.focus || chapter.title) || '本回事件'}」最適合的處置。`,
      options: options.map(normalizeOption).slice(0, 6),
      fail: trial.fail && typeof trial.fail === 'object' ? trial.fail : {result: text(trial.fail) || '判斷未盡周全，仍可補救。'}
    };
  };
  function epicSource() { return window.LS78Epic || window.LS77Epic || window.LS76Epic || window.LS75Epic || null; }
  function validateChapter(chapter, epic = epicSource()) {
    const rows = [];
    const add = (name, ok, detail) => rows.push({name, ok: Boolean(ok), detail: detail || ''});
    const n = Number(chapter?.number || 0);
    add('章回編號', Number.isInteger(n) && n >= 1 && n <= 108, `number=${chapter?.number}`);
    add('章回標題', !!text(chapter?.title), text(chapter?.title || '缺少 title'));
    add('英雄姓名', !!text(chapter?.name), text(chapter?.name || '缺少 name'));
    let trial = null;
    try { trial = epic?.trialForChapter ? epic.trialForChapter(chapter) : null; } catch (error) { add('判斷題產生', false, error.message); }
    const nt = normalizeTrial(trial, chapter);
    add('判斷題標題', !!nt.name && !BAD_PATTERNS.some(re => re.test(nt.name)), nt.name);
    add('判斷題說明', !!nt.prompt && !BAD_PATTERNS.some(re => re.test(nt.prompt)), nt.prompt.slice(0, 80));
    add('判斷題選項數', nt.options.length >= 3, `${nt.options.length} 個`);
    nt.options.forEach((opt, i) => {
      add(`選項 ${String.fromCharCode(65+i)} 文字`, !!opt.text && !BAD_PATTERNS.some(re => re.test(opt.text)), opt.text);
      add(`選項 ${String.fromCharCode(65+i)} 結果格式`, typeof opt.result === 'string', opt.result || '可空白');
    });
    return {chapter: n, title: text(chapter?.title), rows, passed: rows.filter(r=>r.ok).length, total: rows.length, trial: nt};
  }
  function validateAll(chapters = window.LIANGSHAN_CHAPTERS || [], epic = epicSource()) {
    const reports = (Array.isArray(chapters) ? chapters : []).map(ch => validateChapter(ch, epic));
    const total = reports.reduce((s, r) => s + r.total, 0);
    const passed = reports.reduce((s, r) => s + r.passed, 0);
    const failures = reports.flatMap(r => r.rows.filter(x => !x.ok).map(x => ({chapter:r.chapter, title:r.title, ...x})));
    return {type:'chapter-data-validation', version:VERSION, generatedAt:new Date().toISOString(), chapters:reports.length, passed, total, ok: failures.length === 0 && reports.length === 108, failures, reports};
  }
  function displayTest(chapters = window.LIANGSHAN_CHAPTERS || [], epic = epicSource()) {
    const rows = [];
    (Array.isArray(chapters) ? chapters : []).forEach(ch => {
      const nt = normalizeTrial(epic?.trialForChapter?.(ch), ch);
      const title = `${nt.icon} ${nt.name}`;
      const optionText = nt.options.map((o, i) => `${String.fromCharCode(65+i)}・${o.text}`).join('\n');
      const combined = `${title}\n${nt.prompt}\n${optionText}`;
      const bad = BAD_PATTERNS.find(re => re.test(combined));
      rows.push({chapter:Number(ch.number), ok:!bad && nt.options.length >= 3, title, options:nt.options.map(o=>o.text), detail:bad ? `偵測到 ${bad}` : `選項 ${nt.options.length} 個`});
    });
    const passed = rows.filter(r=>r.ok).length;
    return {type:'trial-display-regression', version:VERSION, generatedAt:new Date().toISOString(), passed, total:rows.length, ok: passed === rows.length && rows.length === 108, rows};
  }
  function scanText(root = document) {
    const raw = (root?.body || root?.documentElement || root)?.innerText || '';
    const matches = BAD_PATTERNS.flatMap(re => [...raw.matchAll(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'))].map(m => ({pattern:re.source, index:m.index, sample:raw.slice(Math.max(0,m.index-40), m.index+80)})));
    return {type:'visible-text-scan', version:VERSION, generatedAt:new Date().toISOString(), ok: matches.length === 0, passed: matches.length === 0 ? 1 : 0, total:1, matches, textSample:raw.slice(0,2500)};
  }
  function saveSafetyReport(state = {}) {
    const rows = [];
    const add = (name, ok, detail) => rows.push({name, ok:Boolean(ok), detail:detail||''});
    add('存檔物件', !!state && typeof state === 'object', typeof state);
    add('完成章回紀錄', !!state.completed && typeof state.completed === 'object', `${Object.keys(state.completed||{}).length} 回`);
    add('英雄資料', !!state.heroes && typeof state.heroes === 'object', `${Object.keys(state.heroes||{}).length} 名`);
    add('裝備資料', Array.isArray(state.inventory), `${(state.inventory||[]).length} 件`);
    const ids = new Set(); let dup = 0; (state.inventory||[]).forEach(it => { if (!it?.id) return; if (ids.has(it.id)) dup++; ids.add(it.id); });
    add('裝備 ID 重複', dup === 0, dup ? `${dup} 筆重複` : '無重複');
    add('遠征資料', !!state.endgame && typeof state.endgame === 'object', state.endgame ? '存在' : '缺少');
    add('章回連鎖旗標', !!state.chain && typeof state.chain === 'object', state.chain ? `${Object.keys(state.chain||{}).length} 欄` : '尚未建立，可自動補');
    const passed = rows.filter(r=>r.ok).length;
    return {type:'save-safety-check', version:VERSION, generatedAt:new Date().toISOString(), passed, total:rows.length, ok:passed===rows.length, rows};
  }
  function issueReport(base = {}, state = {}, prefs = {}) {
    const scan = scanText(document);
    const ch = state?.current?.chapter || state?.current?.number || null;
    return {...base, version:VERSION, generatedAt:new Date().toISOString(), visibleTextScan:scan, chapterState:{currentChapter:ch, screen:base.screen || '', currentStep:state?.current?.step, battle:!!state?.current?.battle, complete:!!state?.current?.complete}, prefs:{theme:prefs.theme, highContrast:prefs.highContrast, screenReaderMode:prefs.screenReaderMode}};
  }
  function chainResult(state = {}) {
    const completed = Object.values(state.completed || {});
    const perfect = completed.filter(x => x?.grade === 'S' || x?.perfect).length;
    const flags = state.chain || {};
    const unlocked = [];
    if (completed.length >= 12) unlocked.push('梁山聲望開端：商民願意主動提供情報。');
    if (completed.length >= 36) unlocked.push('三十六回聲望：前線章回會出現支援選項。');
    if (completed.length >= 72) unlocked.push('七十二回聲望：遠征隱藏事件出現率提高。');
    if (completed.length >= 108) unlocked.push('百八完章：可檢視長篇總結與隱藏結局條件。');
    if (perfect >= 30) unlocked.push('完美義名：首領弱點更容易提前揭露。');
    return {type:'chain-result', version:VERSION, generatedAt:new Date().toISOString(), completed:completed.length, perfect, flags, unlocked};
  }
  window.LS792Validation = {VERSION, BAD_PATTERNS, normalizeOption, normalizeTrial, validateChapter, validateAll, displayTest, scanText, saveSafetyReport, issueReport, chainResult};
})();
