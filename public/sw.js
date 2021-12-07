const CACHE_STATIC_NAME = 'static-'+Math.random();
const CACHE_DYNAMIC_NAME = 'dynamic-'+Math.random();
self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing Service worker', event)
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME).then((cache) => {
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
    console.log('[Service Worker] Activating Service worker...', event);
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys.map(key => {
                if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                    console.log('[Service Worker] removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
})

function dynamicCache (res, event) {
    return caches.open(CACHE_DYNAMIC_NAME).then(
        function(cache) {
            cache.put(event.request.url, res.clone());
            return res
    })
}

// no life-cycle 
self.addEventListener('fetch', function(event) {
    // console.log('[Service Worker] Fetching Service worker', event)
    // event.respondWith(fetch(event.request)); // overwrite the data that is send
    event.respondWith(
        caches.match(event.request).then(function (response) {
            // if is not found 
            if (!response) {
                return fetch(event.request)
                    .then((res) => dynamicCache(res, event))
                    .catch(err => {
                        console.error(err)
                    })
            }
            // return the cached response
            return response;
        })
    )
})


self.addEventListener('beforeinstallprompt', function(event) {
    console.log('[Service Worker] Before install prompt', event);
})