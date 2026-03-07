const CACHE_NAME = 'lnr-app-v1';
// Hier alle Dateien auflisten, die offline verfügbar sein müssen
const ASSETS = [
    './',
    './index.html',  // Falls deine Datei so heißt, sonst anpassen
    './style.css',
    './Logo.svg',
    './manifest.json'
];

// 1. Installieren: Dateien in den Cache laden
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching assets...');
                return cache.addAll(ASSETS);
            })
    );
});

// 2. Aktivieren: Alten Cache löschen, wenn Version sich ändert
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

// 3. Fetch: Anfragen abfangen und aus dem Cache bedienen
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Wenn im Cache, dann Cache nutzen, sonst Netzwerk
            return cachedResponse || fetch(event.request);
        })
    );
});
