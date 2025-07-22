/**
 * This is the "Offline page" service worker
 * It's a very simple service worker that caches our main page and assets,
 * allowing the app to work offline.
 */

const CACHE = "pwa-cache";

// Add whichever assets you want to pre-cache here:
const PRECACHE_ASSETS = ["/static/js/main.ed9bf8df.js", "/index.html"];

// Listener for the install event - pre-caches our assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(self.skipWaiting())
  );
});

// Listener for the activate event
self.addEventListener("activate", (event) => {
  const currentCaches = [CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Listener for the fetch event
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches
        .open(CACHE)
        .then((cache) =>
          cache
            .match(event.request)
            .then((response) => response || fetch(event.request))
        )
    );
  }
});
