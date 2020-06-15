const CACHE_NAME = 'howamidoing-cache';

const toCache = [
    './',
    './css/app.css',
    './libs/bootstrap/dist/css/bootstrap.min.css',
    './libs/jquery/dist/jquery.min.js',
    './libs/bootstrap/dist/js/bootstrap.min.js',
    './js/app.js',
    './fallback.json',
];

self.addEventListener('install', async event => {
    /**
     * Register the service worker
     */

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(toCache)
            })    
            .then(self.skipWaiting())
    )

});


self.addEventListener('fetch', event => {
    /**
     * Return cached data when request failed
     */

    event.respondWith(
        fetch(event.request)
            .catch(() => {
            return caches.open(CACHE_NAME)
                .then((cache) => {
                    return cache.match(event.request)
            })
        })
    );

});


self.addEventListener('activate', function(event) {
    /**
     * Triggers when service worker activates
     */

    event.waitUntil(
        caches.keys()
            .then((keyList) => {
                return Promise.all(keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache', key)
                        return caches.delete(key)
                    }
                }))
            })
            .then(() => self.clients.claim())
    )
});