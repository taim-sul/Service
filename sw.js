const CACHE_NAME = 'servicestationen-v8';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './jspdf.min.js',
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  // CDN resources (Firebase, fonts): cache-first
  if (url.includes('gstatic.com') || url.includes('googleapis.com')) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request).then(r => {
        if (r.ok) { const c = r.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, c)); }
        return r;
      }))
    );
    return;
  }
  // Local: network-first, cache fallback
  event.respondWith(
    fetch(event.request).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, c)); }
      return r;
    }).catch(() => caches.match(event.request))
  );
});
