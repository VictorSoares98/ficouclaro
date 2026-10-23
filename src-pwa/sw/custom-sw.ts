/// <reference lib="webworker" />
/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config file > pwa > workboxMode is set to "InjectManifest"
 */

import { clientsClaim } from 'workbox-core';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';

import type { PrecacheEntry } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope &
  typeof globalThis & {
    __WB_MANIFEST: (string | PrecacheEntry)[];
  };

void self.skipWaiting();
clientsClaim();

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

if (import.meta.env.QUASAR_PROD) {
  // Non-SSR/SSG fallbacks to index.html
  // Production SSR/SSG fallbacks to offline.html (except for dev)
  registerRoute(
    new NavigationRoute(createHandlerBoundToURL(import.meta.env.QUASAR_PWA_FALLBACK_HTML), {
      denylist: [new RegExp(import.meta.env.QUASAR_PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/],
    }),
  );
}

// Push Notifications Handling
self.addEventListener('push', (event) => {
  let title = 'Ficou Claro?';
  let body = 'Nova notificação da aula!';
  let url = '/';

  if (event.data) {
    try {
      const payload = event.data.json() as { title?: string; body?: string; url?: string };
      if (payload.title) title = payload.title;
      if (payload.body) body = payload.body;
      if (payload.url) url = payload.url;
    } catch {
      body = event.data.text() || body;
    }
  }

  const options: NotificationOptions = {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-128x128.png',
    data: { url },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Clique na notificação abre ou foca na janela da aplicação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data?.url as string) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    }),
  );
});
