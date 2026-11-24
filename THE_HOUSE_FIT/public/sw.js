// Service Worker oficial de The House Fit (PWA Instalable)
const CACHE_NAME = 'thf-pwa-v2';
const ASSETS_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/assets/logo-icon-orange.png',
  '/assets/logo-icon-white.png',
  '/assets/logo-full-orange.png',
  '/assets/login/focus-athlete.jpg',
  '/assets/login/winged-statue.jpg',
  '/assets/login/you-vs-you-gym.jpg',
  '/assets/login/legend-pose.jpg',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_SHELL).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Nunca interceptar llamadas al backend API ni sockets de recarga en vivo
  if (url.pathname.startsWith('/api/') || url.pathname.includes('ng-cli-ws')) {
    return;
  }

  event.respondWith(
    fetch(req).catch(() =>
      caches.match(req).then((cached) => {
        if (cached) return cached;
        if (req.mode === 'navigate') {
          return caches.match('/');
        }
        return Response.error();
      })
    )
  );
});
