// Service Worker for Ransam Healthcare PWA
const CACHE_NAME = 'ransam-healthcare-v7';

const coreAssets = [
  '/RANSAMHEALTHCARE/',
  '/RANSAMHEALTHCARE/index.html',
  '/RANSAMHEALTHCARE/styles.css',
  '/RANSAMHEALTHCARE/script.js'
];

const imageAssets = [
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0001.jpg',
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0002.jpg',
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0003.jpg',
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0004.jpg',
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0005.jpg',
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0006.jpg',
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0007.jpg',
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0008.jpg',
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0009.jpg',
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0010.jpg',
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0011.jpg',
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0012.jpg',
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0013.jpg',
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0014.jpg',
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0015.jpg',
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0016.jpg',
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0017.jpg'
];

const audioAssets = [
  '/RANSAMHEALTHCARE/audio/RANCID-O.mp3',
  '/RANSAMHEALTHCARE/audio/RANGESIC-P.mp3',
  '/RANSAMHEALTHCARE/audio/RANCAL-M.mp3',
  '/RANSAMHEALTHCARE/audio/RANSAM%20SP.mp3',
  '/RANSAMHEALTHCARE/audio/RANSAM-DSR.mp3',
  '/RANSAMHEALTHCARE/audio/RANZYME-C.mp3',
  '/RANSAMHEALTHCARE/audio/R-LYSINE.mp3',
  '/RANSAMHEALTHCARE/audio/LIVCOVIT%2B.mp3',
  '/RANSAMHEALTHCARE/audio/FOLRAN-M.mp3',
  '/RANSAMHEALTHCARE/audio/RANCOUGH-D.mp3',
  '/RANSAMHEALTHCARE/audio/RANSWORM%20PLUS.mp3',
  '/RANSAMHEALTHCARE/audio/RANSAM-LS%20DROP.mp3',
  '/RANSAMHEALTHCARE/audio/RANVIT%20DROPS.mp3',
  '/RANSAMHEALTHCARE/audio/RANZYME%20DROPS.mp3',
  '/RANSAMHEALTHCARE/audio/RANCAL.mp3',
  '/RANSAMHEALTHCARE/audio/RANSWORM.mp3'
];

// Install event - cache all resources one by one so a single failure doesn't break everything
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Cache core assets first (must succeed)
      await cache.addAll(coreAssets);
      console.log('Core assets cached');

      // Cache images one by one
      for (const url of imageAssets) {
        try { await cache.add(url); } catch(e) { console.warn('Failed to cache image:', url, e); }
      }
      console.log('Image assets cached');

      // Cache audio one by one (critical for offline)
      for (const url of audioAssets) {
        try { await cache.add(url); console.log('Cached audio:', url); } catch(e) { console.warn('Failed to cache audio:', url, e); }
      }
      console.log('Audio assets cached');
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - handle audio range requests properly for offline playback
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Special handling for audio files (they use Range requests)
  if (url.endsWith('.mp3')) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
        if (cachedResponse) {
          // If the browser is requesting a range, serve the full file
          // The browser will handle the range internally
          return cachedResponse;
        }
        // Try matching by just the URL path (without range headers)
        return caches.open(CACHE_NAME).then(cache => {
          return cache.match(event.request.url).then(resp => {
            if (resp) return resp;
            // Not in cache, try network
            return fetch(event.request).then(networkResponse => {
              // Cache the audio for future offline use
              const clone = networkResponse.clone();
              cache.put(event.request.url, clone);
              return networkResponse;
            });
          });
        });
      }).catch(() => {
        return new Response('Audio not available offline', { status: 404 });
      })
    );
    return;
  }

  // Normal fetch for non-audio resources
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      const fetchRequest = event.request.clone();
      return fetch(fetchRequest).then(response => {
        if (!response || response.status !== 200) return response;
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    }).catch(() => {
      // Offline fallback
      return caches.match('/RANSAMHEALTHCARE/index.html');
    })
  );
});
