/**
 * StreetGO Progressive Web App Service Worker
 *
 * Navigation:
 *   NETWORK FIRST
 *
 * Static assets:
 *   NETWORK FIRST with cache fallback
 *
 * Supabase / API / Media:
 *   NOT intercepted
 *
 * Purpose:
 *   - Prevent old StreetGO versions from being permanently served
 *   - Let Vercel deliver the newest deployment
 *   - Keep limited offline support
 *   - Avoid interfering with Supabase authentication
 *   - Avoid interfering with videos
 */

const CACHE_NAME = 'streetgo-v4'

const OFFLINE_SHELL = [
  '/',
  '/manifest.json',
  '/icon.svg',
]

/*
 * =========================================================
 * INSTALL
 * =========================================================
 */

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache =
          await caches.open(CACHE_NAME)

        for (const url of OFFLINE_SHELL) {
          try {
            await cache.add(url)
          } catch (error) {
            console.warn(
              '[StreetGO] Failed to cache:',
              url,
              error
            )
          }
        }
      } catch (error) {
        console.error(
          '[StreetGO] Install failed:',
          error
        )
      }
    })()
  )

  /*
   * Activate the new worker immediately.
   */
  self.skipWaiting()
})

/*
 * =========================================================
 * ACTIVATE
 * =========================================================
 */

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys =
          await caches.keys()

        await Promise.all(
          keys
            .filter(
              (key) =>
                key !== CACHE_NAME
            )
            .map((key) =>
              caches.delete(key)
            )
        )

        /*
         * Take control of open tabs immediately.
         */
        await self.clients.claim()

        console.log(
          '[StreetGO] Service Worker activated:',
          CACHE_NAME
        )
      } catch (error) {
        console.error(
          '[StreetGO] Activation failed:',
          error
        )
      }
    })()
  )
})

/*
 * =========================================================
 * FETCH
 * =========================================================
 */

self.addEventListener('fetch', (event) => {
  const request = event.request

  /*
   * Only GET requests.
   */
  if (request.method !== 'GET') {
    return
  }

  const url =
    new URL(request.url)

  /*
   * =======================================================
   * NEVER INTERCEPT CROSS-ORIGIN REQUESTS
   * =======================================================
   *
   * This is important for:
   * - Supabase REST
   * - Supabase Realtime
   * - Supabase Storage
   * - external media/CDNs
   */

  if (
    url.origin !==
    self.location.origin
  ) {
    return
  }

  /*
   * =======================================================
   * NEVER INTERCEPT API/MEDIA CONNECTIONS
   * =======================================================
   */

  const path =
    url.pathname

  const isNextAsset =
    path.startsWith('/_next/')

  const isApiRequest =
    path.startsWith('/api/')

  const isVideo =
    request.destination === 'video' ||
    /\.(mp4|webm|mov|m4v|avi)$/i.test(
      path
    )

  const isAudio =
    request.destination === 'audio' ||
    /\.(mp3|wav|ogg|m4a)$/i.test(
      path
    )

  /*
   * Let the browser/network handle these directly.
   */
  if (
    isApiRequest ||
    isVideo ||
    isAudio
  ) {
    return
  }

  /*
   * =======================================================
   * NAVIGATION — NETWORK FIRST
   * =======================================================
   *
   * This is the most important change.
   *
   * Every normal page navigation asks Vercel for
   * the newest page first.
   *
   * Cache is only a fallback when offline.
   */

  if (
    request.mode === 'navigate'
  ) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse =
            await fetch(
              request,
              {
                cache: 'no-store',
              }
            )

          /*
           * Only use a successful HTML response.
           */
          if (
            networkResponse.ok
          ) {
            return networkResponse
          }

          throw new Error(
            `Navigation failed: ${networkResponse.status}`
          )
        } catch (error) {
          console.warn(
            '[StreetGO] Navigation network failed:',
            error
          )

          const cached =
            await caches.match('/')

          if (cached) {
            return cached
          }

          return new Response(
            `
              <!doctype html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta
                    name="viewport"
                    content="width=device-width,initial-scale=1"
                  >
                  <title>StreetGO</title>
                </head>
                <body
                  style="
                    margin:0;
                    min-height:100vh;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-family:sans-serif;
                  "
                >
                  StreetGO is offline.
                </body>
              </html>
            `,
            {
              status: 503,
              headers: {
                'Content-Type':
                  'text/html; charset=utf-8',
              },
            }
          )
        }
      })()
    )

    return
  }

  /*
   * =======================================================
   * STATIC ASSETS — NETWORK FIRST
   * =======================================================
   *
   * Next.js assets are hashed, so new deployments will
   * reference new filenames.
   *
   * Network first keeps the browser current.
   */

  if (
    isNextAsset ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    request.destination === 'manifest'
  ) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse =
            await fetch(
              request,
              {
                cache: 'no-store',
              }
            )

          if (
            networkResponse.ok
          ) {
            /*
             * Cache only successful same-origin
             * static assets.
             */
            const cache =
              await caches.open(
                CACHE_NAME
              )

            await cache.put(
              request,
              networkResponse.clone()
            )
          }

          return networkResponse
        } catch (error) {
          console.warn(
            '[StreetGO] Asset network failed:',
            request.url
          )

          const cached =
            await caches.match(
              request
            )

          if (cached) {
            return cached
          }

          return new Response(
            '',
            {
              status: 503,
              statusText:
                'Service Unavailable',
            }
          )
        }
      })()
    )

    return
  }

  /*
   * =======================================================
   * OTHER SAME-ORIGIN GET REQUESTS
   * =======================================================
   *
   * Do not aggressively cache them.
   * Ask the network first.
   */

  event.respondWith(
    (async () => {
      try {
        return await fetch(
          request,
          {
            cache: 'no-store',
          }
        )
      } catch {
        const cached =
          await caches.match(
            request
          )

        if (cached) {
          return cached
        }

        return new Response(
          '',
          {
            status: 503,
            statusText:
              'Service Unavailable',
          }
        )
      }
    })()
  )
})