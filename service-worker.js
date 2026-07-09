// Usamos la fecha y hora de la última modificación para que el nombre de la caché cambie solo en cada push
const CACHE_VERSION = '2026-07-09-04'; // <-- Cambia esta fecha fija si quieres forzar un reinicio completo, o déjalo automatizado
const CACHE_NAME = 'biblioteca-ade-cache-' + CACHE_VERSION;[cite: 10]

const ASSETS = [[cite: 10]
  './',[cite: 10]
  './index.html',[cite: 10]
  './calendario.html',[cite: 10]
  './estudio.html',[cite: 10]
  './progreso.html',[cite: 10]
  './visor.html',[cite: 10]
  './config.js',[cite: 10]
  './manifest.json',[cite: 10]
  './icon.svg'[cite: 10]
];[cite: 10]

// Mantén abajo tus eventos 'install', 'activate' y 'fetch' exactamente como los tenías.

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
  // Evitar interceptar solicitudes que no sean GET o que pertenezcan a Firebase Auth/Firestore/Analytics
  if (
    event.request.method !== 'GET' || 
    event.request.url.includes('firestore') || 
    event.request.url.includes('google-analytics') ||
    event.request.url.includes('googleapis.com') ||
    event.request.url.includes('securetoken')
  ) {
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
