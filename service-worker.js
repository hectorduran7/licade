const CACHE_NAME = 'biblioteca-ade-cache-v2';
const ASSETS = [
  './',
  './index.html',
  './calendario.html',
  './estudio.html',
  './progreso.html',
  './visor.html',
  './config.js',
  './manifest.json',
  './icon.svg'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  // Evitar interceptar solicitudes que no sean de tipo GET o de Firebase/Analytics
  if (event.request.method !== 'GET' || event.request.url.includes('firestore') || event.request.url.includes('google-analytics')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Devolver el recurso en caché inmediatamente, pero actualizar en segundo plano (Stale-While-Revalidate)
          fetch(event.request)
            .then(networkResponse => {
              if (networkResponse.status === 200) {
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
              }
            })
            .catch(() => {/* Ignorar errores de red */});
          return cachedResponse;
        }

        // Si no está en caché, buscar en la red
        return fetch(event.request)
          .then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // Guardar nuevas solicitudes en caché para navegación offline posterior
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          })
          .catch(() => {
            // Si la red falla y es una navegación de página, podríamos servir index.html
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});
