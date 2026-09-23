// FitTrack Mobile Notifications Utility

export const NOTIFICATION_STORAGE_KEY = 'fittrack_welcome_notif_sent';
export const NOTIFICATION_PROMPT_SHOWN_KEY = 'fittrack_notif_prompt_dismissed_at';

/**
 * Check if the current browser and platform support Notifications
 */
export function isNotificationSupported() {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window;
}

/**
 * Get current notification permission state
 * @returns {'granted' | 'denied' | 'default' | 'unsupported'}
 */
export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from the user
 * @returns {Promise<'granted' | 'denied' | 'default' | 'unsupported'>}
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    return new Promise((resolve) => {
      Notification.requestPermission((perm) => {
        resolve(perm);
      });
    });
  }
}

// Fitness & Workout Tips Pool for 2-minute interval testing
export const FITNESS_TIPS_POOL = [
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

let tipCursor = 0;
let foregroundIntervalId = null;

/**
 * Display the FitTrack Welcome Notification in the device notification tray/bar
 */
export async function sendWelcomeNotification() {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const title = 'Welcome to FitTrack! 🏃‍♂️💪';
  const options = {
    body: 'Your personal AI health & fitness companion is ready. Start tracking your daily goals!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'fittrack-welcome-' + Date.now(),
    renotify: true,
    requireInteraction: false,
    vibrate: [150, 80, 150],
    data: {
      url: '/',
      dateOfArrival: Date.now()
    }
  };

  return displayNotification(title, options);
}

/**
 * Display notification every time the user opens the app / homepage
 */
export async function sendHomePageNotification() {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const title = 'FitTrack Dashboard Active ⚡';
  const options = {
    body: 'Welcome back! Your health metrics & workout logs are ready to track.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'fittrack-homepage-' + Date.now(),
    renotify: true,
    vibrate: [100, 50, 100],
    data: {
      url: '/',
      dateOfArrival: Date.now()
    }
  };

  return displayNotification(title, options);
}

/**
 * Send next fitness & workout tip
 */
export async function sendNextFitnessTipNotification() {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const tip = FITNESS_TIPS_POOL[tipCursor % FITNESS_TIPS_POOL.length];
  tipCursor++;

  const options = {
    body: tip.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'fittrack-tip-' + Date.now(),
    renotify: true,
    vibrate: [150, 80, 150],
    data: {
      url: '/dashboard',
      dateOfArrival: Date.now()
    }
  };

  return displayNotification(tip.title, options);
}

/**
 * Common helper to display native notification via Service Worker (or fallback)
 */
async function displayNotification(title, options) {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, options);
        return true;
      }
    }

    new Notification(title, options);
    return true;
  } catch (err) {
    console.warn('[FitTrack Notification] Failed to display notification:', err);
    return false;
  }
}

/**
 * Start 2-minute recurring interval timer for fitness tips (foreground + background via SW)
 */
export function startFitnessTipsScheduler(intervalMs = 120000) {
  if (typeof window === 'undefined' || !isNotificationSupported()) return;

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'START_TIPS_TIMER',
      intervalMs: intervalMs
    });
  }

  if (foregroundIntervalId) {
    clearInterval(foregroundIntervalId);
  }

  foregroundIntervalId = setInterval(() => {
    if (Notification.permission === 'granted') {
      sendNextFitnessTipNotification();
    }
  }, intervalMs);
}
