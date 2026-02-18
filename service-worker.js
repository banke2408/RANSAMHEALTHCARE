// Service Worker for Ransam Healthcare PWA
const CACHE_NAME = 'ransam-healthcare-v3';
const urlsToCache = [
  '/RANSAMHEALTHCARE/',
  '/RANSAMHEALTHCARE/index.html',
  '/RANSAMHEALTHCARE/styles.css',
  '/RANSAMHEALTHCARE/script.js',
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
  '/RANSAMHEALTHCARE/images/Ransam Visual_page-0017.jpg',
  '/RANSAMHEALTHCARE/audio/RANCID-O.mp3',
  '/RANSAMHEALTHCARE/audio/RANGESIC-P.mp3',
  '/RANSAMHEALTHCARE/audio/RANCAL-M.mp3',
  '/RANSAMHEALTHCARE/audio/RANSAM%20SP.mp3',
  '/RANSAMHEALTHCARE/audio/RANSAM-DSR.mp3',
  '/RANSAMHEALTHCARE/audio/RANZYME-C.mp3',
  '/RANSAMHEALTHCARE/audio/R-LYSINE.mp3',
  '/RANSAMHEALTHCARE/audio/LIVCOVIT+.mp3',
  '/RANSAMHEALTHCARE/audio/FOLRAN-M.mp3',
  '/RANSAMHEALTHCARE/audio/RANCOUGH-D.mp3',
  '/RANSAMHEALTHCARE/audio/RANSWORM%20PLUS.mp3',
  '/RANSAMHEALTHCARE/audio/RANSAM-LS%20DROP.mp3',
  '/RANSAMHEALTHCARE/audio/RANVIT%20DROPS.mp3',
  '/RANSAMHEALTHCARE/audio/RANZYME%20DROPS.mp3',
  '/RANSAMHEALTHCARE/audio/RANCAL.mp3',
  '/RANSAMHEALTHCARE/audio/RANSWORM.mp3'
];

// Install event - cache all resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
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
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});
