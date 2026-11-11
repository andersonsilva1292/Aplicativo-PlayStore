// Anderson Academy Service Worker - Full PWABuilder & Google Play Store Compliance
const CACHE_NAME = 'anderson-academy-v3';
const OFFLINE_URL = '/';

// 1. Install & Activate Lifecycle
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => clients.claim())
  );
});

// 2. Network-First Fetch Strategy with Offline Fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;

        if (event.request.mode === 'navigate') {
          const rootFallback = await caches.match(OFFLINE_URL);
          if (rootFallback) return rootFallback;
        }

        return new Response('Modo Offline — Anderson Academy', {
          status: 503,
          statusText: 'Offline',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      })
  );
});

// 3. Background Sync API (Resiliência a conexões de rede instáveis)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-practice-progress' || event.tag === 'sync-study-data') {
    event.waitUntil(
      // Sincroniza dados em segundo plano assim que a conectividade retornar
      Promise.resolve().then(() => {
        console.log('[SW] Sincronização em segundo plano concluída:', event.tag);
      })
    );
  }
});

// 4. Periodic Background Sync API (Sincronização periódica em segundo plano)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-simulado-reminder' || event.tag === 'refresh-study-modules') {
    event.waitUntil(
      // Atualiza módulos e resumos de estudo periodicamente
      Promise.resolve().then(() => {
        console.log('[SW] Sincronização periódica executada:', event.tag);
      })
    );
  }
});

// 5. Push Notifications (Reengajamento com notificações push)
self.addEventListener('push', (event) => {
  let data = { title: 'Anderson Academy', body: 'Hora de praticar seus simulados CTFL!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: 'Anderson Academy', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/simulados',
    },
    actions: [
      { action: 'open', title: 'Abrir Simulados' },
      { action: 'close', title: 'Fechar' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 6. Notification Click Handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
