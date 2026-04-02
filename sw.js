const CACHE_NAME = 'lnr-app-v1.2';
const VERSION = '1.2 Bratwurst'; // Diese Variable wird an die Webseite gesendet
const bwChannel = new BroadcastChannel('sw_status');

const ASSETS = [
    'index.html',
    'LNR.html',
	'LNZ.html',
	'Kappenaufmaß.html',
	'Std.html',
    'style.css',
    'Logo.svg',
    'manifest.json',
    'icon-192.png',
    'icon-512.png'
];

// Installation & Caching
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching assets...');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Aktivierung & Cache-Bereinigung
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => {
            self.clients.claim();
            // Automatisch Version senden, sobald aktiviert
            bwChannel.postMessage({ type: 'VERSION_INFO', version: VERSION });
        })
    );
});

// Fetch-Strategie: Cache first, then Network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});

// Antworten, falls die Seite aktiv nachfragt
bwChannel.onmessage = (event) => {
    if (event.data.type === 'GET_VERSION') {
        bwChannel.postMessage({ type: 'VERSION_INFO', version: VERSION });
    }
};
