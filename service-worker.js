const CACHE = 'liangshan-v7.5.0-cache-1';
const ASSETS = [
  './','./index.html','./styles.css','./chapters.js','./game.js','./manifest.webmanifest',
  './modules/tiangang.js','./modules/dizha.js','./modules/save-schema.js','./modules/cloud-sync.js',
  './modules/endgame.js','./modules/content-v74.js','./modules/epic-chapters.js','./modules/roguelike.js',
  './modules/telemetry.js','./modules/accessibility.js','./assets/icon-192.png','./assets/icon-512.png',
  './README.md','./FIREBASE_SETUP.md','./DEPLOY_GITHUB_PAGES.md','./LIVE_DEPLOYMENT_CHECKLIST.md','./SCREEN_READER_CHECKLIST.md'
];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if(response && response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  }).catch(()=>caches.match('./index.html'))));
});
self.addEventListener('message', event => { if(event.data?.type==='SKIP_WAITING') self.skipWaiting(); });
