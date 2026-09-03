const CACHE="xskt-lab-v14-confidence-interval";const ASSETS=["./","./index.html","./styles.css?v=9","./src/app.js?v=13","./src/data.js","./data/xsmn_seed.json?v=20260902","./src/model.js","./src/model6.js","./src/model-prizes.js","./src/backtest.js","./src/backtest6.js","./src/backtest-prizes.js","./src/storage.js"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>e.respondWith(fetch(e.request).then(r=>{const x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));return r}).catch(()=>caches.match(e.request))));
