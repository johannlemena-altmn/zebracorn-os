const CACHE = 'zebracorn-v3';
const SHELL = ['/', '/index.html', '/styles.css', '/db.js', '/sync.js',
  '/vendor/dexie.min.js', '/vendor/preact.module.js', '/vendor/hooks.module.js', '/vendor/htm.module.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

// Network-first : toujours frais quand en ligne, cache seulement en secours offline.
// (Le cache-first masquait les mises à jour CSS/JS — piège en dev ET en prod.)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
