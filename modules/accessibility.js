(() => {
  'use strict';
  function apply(prefs={}) {
    document.documentElement.style.setProperty('--user-font-scale',String(prefs.fontScale||1));
    document.body.classList.toggle('high-contrast',Boolean(prefs.highContrast));
    document.body.classList.toggle('reduce-motion',Boolean(prefs.reducedMotion));
    document.body.classList.toggle('hide-keyboard-hints',prefs.keyboardHints===false);
    document.body.classList.toggle('low-power',Boolean(prefs.lowPower));
    document.body.classList.toggle('screen-reader-mode',Boolean(prefs.screenReaderMode));
  }
  function focusFirst(root=document){const x=root.querySelector('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]');x?.focus();}
  function trapModal(event,root){if(event.key!=='Tab'||!root)return;const nodes=[...root.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')];if(!nodes.length)return;const first=nodes[0],last=nodes.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
  function audit(root=document){const issues=[];for(const img of root.querySelectorAll('img:not([alt])'))issues.push('圖片缺少 alt');for(const b of root.querySelectorAll('button'))if(!b.textContent.trim()&&!b.getAttribute('aria-label'))issues.push('按鈕缺少可讀名稱');for(const input of root.querySelectorAll('input,select,textarea')){if(input.id&&!root.querySelector(`label[for="${CSS.escape(input.id)}"]`)&&!input.closest('label')&&!input.getAttribute('aria-label'))issues.push(`欄位 ${input.id||input.name} 缺少標籤`);}return{ok:issues.length===0,issues};}
  window.LS75Accessibility={apply,focusFirst,trapModal,audit};
  window.LS74Accessibility=window.LS75Accessibility;
})();
