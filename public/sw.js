self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing Service worker', event)
    event.waitUntil(
        caches.open('static').then((cache) => {
            console.log('[Service Worker] Precaching App Shell');
            // cache.add('/src/js/app.js')
            cache.addAll([
                '/',
                '/index.html',
                '/src/js/app.js',
                '/src/js/feed.js',
                '/src/js/material.min.js',
                'src/css/app.css',
                'src/css/feed.css',
                'src/images/main-image.jpg',
                'https://fonts.googleapis.com/css?family=Roboto:400,700',
                'https://fonts.googleapis.com/icon?family=Material+Icons',
                'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
            ])
        })
    )
})

self.addEventListener('activate', function(event) {
    console.log('[Service Worker] Activating Service worker...', event)
    return self.clients.claim();
})

// no life-cycle 
self.addEventListener('fetch', function(event) {
    // console.log('[Service Worker] Fetching Service worker', event)
    // event.respondWith(fetch(event.request)); // overwrite the data that is send
    event.respondWith(
        caches.match(event.request).then((response) => {
            // if is not found 
            if (!response) return fetch(event.request);
            // return the cached response
            return response;
        })
    )
})

self.addEventListener('beforeinstallprompt', function(event) {
    console.log('[Service Worker] Before install prompt', event);
})