// Service Worker for Interactive Career Graph (Template)
// Provides offline functionality and performance improvements

const CACHE_NAME = 'career-graph-template-v1.1.0';

const ASSET_PATHS = [
  './',
  // './index.php' removed: not used in this static template and caused noisy 404s in dev
  './css/styles-new.css',
  './css/components/_variables.css',
  './css/components/_base.css',
  './css/components/_accessibility.css',
  './css/components/_buttons.css',
  './css/components/_header.css',
  './css/components/_graph.css',
  './css/components/_menu.css',
  './css/components/_popups.css',
  './css/components/_tooltip.css',
  './css/components/_walkthrough.css',
  './css/components/_colors.css',
  './css/components/_responsive.css',
  './js/main-graph.js',
  './js/cv-generator.js',
  './js/graph-data.js',
  './js/utils.js',
  './js/walkthrough.js',
  './js/shared/link-types.js',
  './js/shared/tours.js',
  './js/d3.v7.min.js',
  './templates/career/tour.json',
  './templates/career-lite/tour.json',
  './templates/task-management/tour.json',
  './manifest.json',
  './images/favicon.png',
  './images/favicon.svg',
  './images/team/profile-placeholder.svg'
  // Additional images cached on first request
];

const urlsToCache = ASSET_PATHS.map((path) => new URL(path, self.location).toString());

const precacheAssets = async (cache) => {
  for (const url of urlsToCache) {
    try {
      const response = await fetch(url, { cache: 'reload' });
      if (!response || !response.ok) {
        console.warn('Skipping asset due to bad response during pre-cache:', url, response?.status);
        continue;
      }
      await cache.put(url, response.clone());
    } catch (error) {
      console.warn('Skipping asset due to fetch error during pre-cache:', url, error);
    }
  }
};

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
  return precacheAssets(cache);
      })
      .catch(err => {
        console.error('Cache install error:', err);
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
          
          // Cache the fetched response for future use
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(err => {
          console.error('Fetch failed:', err);
          // Could return a custom offline page here
          throw err;
        });
      })
  );
});
