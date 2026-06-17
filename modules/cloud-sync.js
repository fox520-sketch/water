(() => {
  'use strict';
  const CONFIG_KEY = 'liangshan-v74-firebase-config';
  const SESSION_KEY = 'liangshan-v74-firebase-session';
  let config = null;
  let session = null;
  const safeLocal={get:k=>{try{return localStorage.getItem(k)}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch{}},remove:k=>{try{localStorage.removeItem(k)}catch{}}};
  const safeSession={get:k=>{try{return sessionStorage.getItem(k)}catch{return null}},set:(k,v)=>{try{sessionStorage.setItem(k,v)}catch{}},remove:k=>{try{sessionStorage.removeItem(k)}catch{}}};

  function load() {
    try { config = JSON.parse(safeLocal.get(CONFIG_KEY)||'null'); } catch { config = null; }
    try { session = JSON.parse(safeSession.get(SESSION_KEY)||'null'); } catch { session = null; }
  }
  load();

  function validConfig(c) { return Boolean(c?.apiKey && c?.projectId); }
  function configure(c) {
    if (!validConfig(c)) throw new Error('Firebase 設定需包含 apiKey 與 projectId。');
    config = {apiKey:String(c.apiKey).trim(),projectId:String(c.projectId).trim(),authDomain:String(c.authDomain||'').trim()};
    safeLocal.set(CONFIG_KEY,JSON.stringify(config));
    return config;
  }
  function clearConfig(){ config=null;session=null;safeLocal.remove(CONFIG_KEY);safeSession.remove(SESSION_KEY); }
  function authUrl(path){ if(!validConfig(config))throw new Error('尚未設定 Firebase。'); return `https://identitytoolkit.googleapis.com/v1/accounts:${path}?key=${encodeURIComponent(config.apiKey)}`; }
  async function request(url,options={}) {
    const res = await fetch(url,{...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
    const data = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data?.error?.message||data?.error?.status||`HTTP ${res.status}`);
    return data;
  }
  async function auth(path,email,password) {
    const data = await request(authUrl(path),{method:'POST',body:JSON.stringify({email,password,returnSecureToken:true})});
    session={uid:data.localId,email:data.email,idToken:data.idToken,refreshToken:data.refreshToken,expiresAt:Date.now()+Number(data.expiresIn||3600)*1000};
    safeSession.set(SESSION_KEY,JSON.stringify(session));
    return session;
  }
  const signUp = (email,password) => auth('signUp',email,password);
  const signIn = (email,password) => auth('signInWithPassword',email,password);
  function signOut(){session=null;safeSession.remove(SESSION_KEY);}
  function requireSession(){if(!session?.idToken)throw new Error('請先登入 Firebase 雲端存檔。');return session;}
  function docUrl(){const s=requireSession();return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/(default)/documents/users/${encodeURIComponent(s.uid)}/saves/main`;}
  function encodeDoc(payload,checksum,version){return{fields:{payload:{stringValue:JSON.stringify(payload)},checksum:{stringValue:checksum||''},version:{stringValue:version||''},updatedAt:{timestampValue:new Date().toISOString()}}};}
  function decodeDoc(doc){const f=doc?.fields||{};if(!f.payload?.stringValue)return null;return{payload:JSON.parse(f.payload.stringValue),checksum:f.checksum?.stringValue||'',version:f.version?.stringValue||'',updatedAt:f.updatedAt?.timestampValue||doc.updateTime||''};}
  async function upload(payload,checksum,version){const s=requireSession();const data=await request(docUrl(),{method:'PATCH',headers:{Authorization:`Bearer ${s.idToken}`},body:JSON.stringify(encodeDoc(payload,checksum,version))});return decodeDoc(data);}
  async function download(){const s=requireSession();const res=await fetch(docUrl(),{headers:{Authorization:`Bearer ${s.idToken}`}});if(res.status===404)return null;const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data?.error?.message||`HTTP ${res.status}`);return decodeDoc(data);}
  function getStatus(){return{configured:validConfig(config),config:config?{projectId:config.projectId,apiKeyMasked:`${config.apiKey.slice(0,4)}…${config.apiKey.slice(-3)}`} : null,signedIn:Boolean(session?.idToken),email:session?.email||'',uid:session?.uid||''};}
  window.LS74Cloud = {configure,clearConfig,signUp,signIn,signOut,upload,download,getStatus,getConfig:()=>config};
})();
