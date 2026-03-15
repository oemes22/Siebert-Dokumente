const CACHE_NAME = 'lnr-app-v2.0'; // Version erhöht, damit der Browser neu lädt

const ASSETS = [
    'index.html',
    'LNR.html',
    'style.css',
    'Logo.svg',
    'manifest.json',
    'icon-192.png',
    'icon-512.png',
    // Die Bibliothek wird jetzt beim ersten Mal online geladen und für immer offline gespeichert:
    'https://cdnjs.cloudflare.com'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching assets (inkl. PDF Library)...');
                // Wir nutzen addAll für die Liste oben
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Liefert die Datei aus dem Cache (offline) oder lädt sie nach (online)
            return cachedResponse || fetch(event.request);
        })
    );
});
