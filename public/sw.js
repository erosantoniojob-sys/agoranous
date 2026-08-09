const CACHE = 'agora-shell-v2'
const APP_SHELL = ['/', '/manifest.webmanifest', '/favicon.svg']
const STATIC_DESTINATIONS = new Set(['font', 'image', 'manifest', 'script', 'style'])

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)))
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => (await caches.match('/')) || Response.error()))
    return
  }

  if (!STATIC_DESTINATIONS.has(request.destination)) return

  event.respondWith(
    caches.match(request).then(async cached => {
      if (cached) return cached

      const response = await fetch(request)
      if (response.ok) {
        const cache = await caches.open(CACHE)
        void cache.put(request, response.clone())
      }
      return response
    }),
  )
})
