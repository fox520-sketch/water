const CACHE='liangshan-rpg-v6.2.0';
const ASSETS=['./','./index.html','./styles.css','./game.js','./manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(response=>response||fetch(event.request).then(network=>{const copy=network.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return network}).catch(()=>caches.match('./index.html'))))});
