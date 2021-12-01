self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing Service worker', event)
})

self.addEventListener('activate', function(event) {
    console.log('[Service Worker] Activating Service worker...', event)
    return self.clients.claim();
})

// no life-cycle 
self.addEventListener('fetch', function(event) {
    // console.log('[Service Worker] Fetching Service worker', event)
    // event.respondWith(fetch(event.request)); // overwrite the data that is send
})

self.addEventListener('beforeinstallprompt', function(event) {
    console.log('[Service Worker] Before install prompt', event);
})