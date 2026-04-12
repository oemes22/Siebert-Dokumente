const CACHE_NAME = 'lnr-app-v2.5';
const VERSION = '2.5 Bockwurst';
const bwChannel = new BroadcastChannel('sw_status');

const ASSETS = [
  'index.html',
  'LNR.html',
  'LNL.html',
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
      bwChannel.postMessage({ type: 'VERSION_INFO', version: VERSION });
    })
  );
});

// Fetch-Strategie inklusive Share-Target-Handling für Android
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Spezielle Logik für das Teilen von Dateien (POST an index.html)
  if (event.request.method === 'POST' && url.pathname.endsWith('index.html')) {
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        const file = formData.get('shared_files'); // Muss mit "name" im Manifest übereinstimmen

        if (file) {
          let targetPage = 'index.html';
          const fileName = file.name.toLowerCase();

          // Zielseite basierend auf Dateiendung bestimmen
          if (fileName.endsWith('.lnr')) targetPage = 'LNR.html';
          else if (fileName.endsWith('.lnl')) targetPage = 'LNL.html';
          else if (fileName.endsWith('.lnz')) targetPage = 'LNZ.html';
          else if (fileName.endsWith('.ka')) targetPage = 'Kappenaufmaß.html';

          // Datei-Daten per BroadcastChannel senden, sobald die Zielseite lädt
          // Hinweis: Die Zielseite muss auf die Message warten!
          setTimeout(() => {
            bwChannel.postMessage({
              type: 'SHARE_FILE_RECEIVED',
              file: file,
              fileName: file.name
            });
          }, 1000); // Kurze Verzögerung, damit die Seite Zeit zum Laden hat

          return Response.redirect(targetPage, 303);
        }

        return fetch(event.request);
      })()
    );
    return;
  }

  // Standard-Strategie: Cache first, then Network
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});

// Antworten auf Versions-Anfragen
bwChannel.onmessage = (event) => {
  if (event.data.type === 'GET_VERSION') {
    bwChannel.postMessage({ type: 'VERSION_INFO', version: VERSION });
  }
};
