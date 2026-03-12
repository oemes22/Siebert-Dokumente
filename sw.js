const CACHE_NAME = 'lnr-app-v1.7';
// Assets OHNE "./" am Anfang sind oft stabiler auf GitHub Pages
const ASSETS = [
    'index.html',
	'LNR.html',
    'style.css',
    'Logo.svg',
    'manifest.json',
    'icon-192.png',
    'icon-512.png'
 ];


self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching assets...');
                // Tipp: Nutze einzelne cache.add() für kritische Dateien, 
                // damit ein fehlendes Logo nicht die ganze PWA blockiert.
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting()) // Erzwingt sofortige Aktivierung
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim()) // Übernimmt sofort die Kontrolle
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request).catch(() => {
                // Optional: Hier könnte eine Offline-Fallback-Seite geladen werden
            });
        })
    );
});
