/* Minimal shell — installable PWA / standalone on supported browsers (GitHub Pages). */

self.addEventListener('install', () => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request))
})
