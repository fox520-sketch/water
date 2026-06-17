(() => {
  'use strict';
  function apply(prefs={}) {
    document.documentElement.style.setProperty('--user-font-scale',String(prefs.fontScale||1));
    document.body.classList.toggle('high-contrast',Boolean(prefs.highContrast));
    document.body.classList.toggle('reduce-motion',Boolean(prefs.reducedMotion));
    document.body.classList.toggle('hide-keyboard-hints',prefs.keyboardHints===false);
  }
  function focusFirst(root=document){const x=root.querySelector('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]');x?.focus();}
  function trapModal(event,root){if(event.key!=='Tab'||!root)return;const nodes=[...root.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')];if(!nodes.length)return;const first=nodes[0],last=nodes.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
  window.LS74Accessibility={apply,focusFirst,trapModal};
})();
