// FitTrack PWA Lightweight Service Worker
const CACHE_NAME = 'fittrack-static-v1';

// Safe static core shell assets for installation and fast mobile load
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png'
];

// 1. Install Event - Cache essential static shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event - Clean up stale caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event - Safe handling with strict bypass for APIs and mutation methods
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // STRICT BYPASS: Never intercept or cache non-GET requests (POST, PUT, PATCH, DELETE)
  if (request.method !== 'GET') {
    return;
  }

  // STRICT BYPASS: Never intercept backend API requests or cross-origin API calls
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.includes('/auth') ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Navigation requests (HTML shell): Network first with cache fallback (SPA router support)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // Safe frontend static assets (JS, CSS, images, icons, fonts)
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});

// 4. Notification Click Event - Focus app window or navigate to /dashboard
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes(self.location.origin)) {
            return client.focus();
          }
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 5. Fitness Tips Rotation (every 2 minutes)
const FITNESS_TIPS = [
  {
    title: '💧 Hydration Check — FitTrack',
    body: 'Time to drink a glass of water! Staying hydrated boosts workout endurance and recovery.'
  },
  {
    title: '🧘 Quick Posture Reset — FitTrack',
    body: 'Roll your shoulders back, straighten your spine, and take 3 slow, deep breaths.'
  },
  {
    title: '🤸 2-Minute Workout Stretch — FitTrack',
    body: 'Stand up and stretch your arms overhead, followed by 10 gentle torso twists.'
  },
  {
    title: '🚶 Step Boost Alert — FitTrack',
    body: 'Take a quick 1-2 minute walk around to increase blood flow and metabolism.'
  },
  {
    title: '⚡ Quick Energy Booster — FitTrack',
    body: 'Try 15 bodyweight squats or 20 jumping jacks to re-energize your body!'
  },
  {
    title: '🥗 Nutrition Tip — FitTrack',
    body: 'Fuel your fitness with balanced protein and healthy greens for optimal muscle tone.'
  },
  {
    title: '🏋️ Core Engagement — FitTrack',
    body: 'Gently brace your abdominal core for 20 seconds to strengthen your stabilizer muscles.'
  }
];

let tipIndex = 0;
let tipsTimerId = null;

function sendNextFitnessTip() {
  if (!self.registration || !self.registration.showNotification) return;

  const tip = FITNESS_TIPS[tipIndex % FITNESS_TIPS.length];
  tipIndex++;

  self.registration.showNotification(tip.title, {
    body: tip.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'fittrack-fitness-tip-' + Date.now(),
    renotify: true,
    vibrate: [150, 80, 150],
    data: {
      url: '/dashboard',
      timestamp: Date.now()
    }
  });
}

function startBackgroundTipsTimer(intervalMs = 120000) {
  if (tipsTimerId) {
    clearInterval(tipsTimerId);
  }
  // Schedule every intervalMs (default 2 minutes = 120000ms)
  tipsTimerId = setInterval(() => {
    sendNextFitnessTip();
  }, intervalMs);
}

// 6. Service Worker Message Listener (Communication from Frontend Client)
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'START_TIPS_TIMER') {
    const intervalMs = data.intervalMs || 120000;
    startBackgroundTipsTimer(intervalMs);
  } else if (data.type === 'STOP_TIPS_TIMER') {
    if (tipsTimerId) {
      clearInterval(tipsTimerId);
      tipsTimerId = null;
    }
  } else if (data.type === 'SHOW_NOTIFICATION') {
    if (self.registration && self.registration.showNotification) {
      self.registration.showNotification(data.title || 'FitTrack Alert', {
        body: data.body || 'Keep pushing towards your fitness goals today!',
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/icon-192x192.png',
        tag: data.tag || 'fittrack-notification',
        renotify: true,
        vibrate: [100, 50, 100],
        data: {
          url: data.url || '/'
        }
      });
    }
  }
});


