const CACHE = 'mawaqit-v1';
const FILES = [
  './',
  './index.html',
  './admin.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// عند التثبيت: خزّن ملفات التطبيق
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

// عند التفعيل: احذف النسخ القديمة من الكاش
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// عند أي طلب: جرّب الكاش أولاً، ثم الشبكة، وخزّن الخطوط عند أول تحميل
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(res => {
        const url = e.request.url;
        if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      });
    })
  );
});