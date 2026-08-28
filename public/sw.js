/**
 * StreetGO Progressive Web App Service Worker
 * Strategy: Cache First (with Network Fallback) for App Shell & Static Assets
 */

const CACHE_NAME = 'streetgo-v2';
const APP_SHELL = ['/', '/manifest.json', '/icon.svg'];

// Cache core assets on installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Sequentially add assets so one failing network request doesn't break the entire install
      for (const url of APP_SHELL) {
        try {
          await cache.add(url);
        } catch (error) {
          console.warn(`[StreetGO] Failed to precache: ${url}`, error);
        }
      }
    })()
  );
  self.skipWaiting();
});

// Purge obsolete caches immediately upon activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })()
  );
  self.clients.claim();
});

// Centralized Fetch Interceptor
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only intercept standard GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  event.respondWith(
    (async () => {
      // 1. Serve from cache immediately if available
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;

      try {
        // 2. Fallback to network
        const networkResponse = await fetch(request);

        // 3. Dynamically cache successful Same-Origin assets (JS, CSS, Chunks, Images)
        if (isSameOrigin && networkResponse.status === 200) {
          // Safeguard: Check response type to prevent caching partial content or chrome extensions
          const responseType = networkResponse.type;
          if (responseType === 'basic' || responseType === 'cors') {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
        }

        return networkResponse;
      } catch (error) {
        // 4. Offline Fallback Handling
        if (isSameOrigin && request.mode === 'navigate') {
          const fallbackResponse = await caches.match('/');
          if (fallbackResponse) return fallbackResponse;
        }

        // Return a standard 503 response for API/Media failures when offline
        return new Response('', { 
          status: 503, 
          statusText: 'Service Unavailable (Offline)' 
        });
      }
    })()
  );
});
