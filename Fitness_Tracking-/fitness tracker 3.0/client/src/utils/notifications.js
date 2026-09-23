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
    // Standard promise-based requestPermission
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    // Fallback for older callback-based browsers
    return new Promise((resolve) => {
      Notification.requestPermission((perm) => {
        resolve(perm);
      });
    });
  }
}

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
    image: undefined,
    tag: 'fittrack-welcome-notification',
    renotify: false,
    requireInteraction: false,
    vibrate: [100, 50, 100],
    data: {
      url: '/',
      dateOfArrival: Date.now()
    }
  };

  try {
    // Primary method: Service Worker registration showNotification (required on mobile PWA & Android)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, options);
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, Date.now().toString());
        return true;
      }
    }

    // Fallback method: Direct Notification constructor
    new Notification(title, options);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, Date.now().toString());
    return true;
  } catch (err) {
    console.warn('[FitTrack Notification] Failed to display welcome notification:', err);
    return false;
  }
}
