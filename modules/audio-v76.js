(() => {
  'use strict';
  let ctx=null,master=null,timer=null,theme='hall',playing=false,index=0;
  const themes={
    hall:[220,277,330,277,247,220,196,220],battle:[147,196,220,165,196,247,220,196],water:[196,220,294,247,220,196,165,196],snow:[262,247,220,196,220,247,196,174],stealth:[165,196,185,147,165,220,196,147],victory:[262,330,392,523,392,440,523,659]
  };
  function ensure(){if(ctx)return ctx;const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ctx=new C();master=ctx.createGain();master.gain.value=.035;master.connect(ctx.destination);return ctx;}
  function note(freq,duration=.22,volume=1){if(!ensure())return;const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.0001,ctx.currentTime);g.gain.exponentialRampToValueAtTime(Math.max(.0002,.035*volume),ctx.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);o.connect(g);g.connect(master);o.start();o.stop(ctx.currentTime+duration+.02);}
  function playTheme(next='hall'){theme=themes[next]?next:'hall';if(playing)return;playing=true;index=0;const tick=()=>{if(!playing)return;const seq=themes[theme];note(seq[index%seq.length],.28,.6);if(index%4===0)note(seq[index%seq.length]/2,.42,.28);index++;timer=setTimeout(tick,460);};tick();}
  function stop(){playing=false;if(timer)clearTimeout(timer);timer=null;}
  function toggle(next='hall'){if(playing){stop();return false;}playTheme(next);return true;}
  function setTheme(next){theme=themes[next]?next:'hall';}
  function sfx(type){const map={hit:[160],hurt:[105],skill:[330,440],guard:[220],save:[294,392],battle:[147,196],victory:[392,523,659],achievement:[523,659,784],phase:[196,294,392]};(map[type]||[260]).forEach((f,i)=>setTimeout(()=>note(f,.18,.9),i*75));}
  function status(){return{playing,theme,supported:Boolean(window.AudioContext||window.webkitAudioContext)};}
  window.LS76Audio={playTheme,stop,toggle,setTheme,sfx,status};
})();
