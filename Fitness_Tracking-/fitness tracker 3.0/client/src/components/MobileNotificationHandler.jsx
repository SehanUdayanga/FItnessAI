import React, { useState, useEffect } from 'react';
import { Bell, BellRing, X, CheckCircle2 } from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendWelcomeNotification,
  NOTIFICATION_STORAGE_KEY,
  NOTIFICATION_PROMPT_SHOWN_KEY
} from '../utils/notifications';

export default function MobileNotificationHandler() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permissionState, setPermissionState] = useState('unsupported');
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect mobile device or standalone mode
    const ua = navigator.userAgent || '';
    const isMobile =
      /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry/i.test(ua) ||
      (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua)) ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    setIsMobileDevice(isMobile);

    if (!isMobile || !isNotificationSupported()) {
      return;
    }

    const currentPermission = getNotificationPermission();
    setPermissionState(currentPermission);

    // If permission is already granted:
    // Check if welcome notification was sent yet on this device
    if (currentPermission === 'granted') {
      const alreadySent = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (!alreadySent) {
        // Small delay to ensure service worker is active
        setTimeout(() => {
          sendWelcomeNotification();
        }, 1200);
      }
      return;
    }

    // If permission is default (never asked or pending):
    if (currentPermission === 'default') {
      // Check if recently dismissed
      const lastDismissed = localStorage.getItem(NOTIFICATION_PROMPT_SHOWN_KEY);
      if (lastDismissed) {
        const days = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60 * 24);
        if (days < 3) {
          return;
        }
      }

      // Show the mobile permission request banner after a brief intro delay
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleRequestPermission = async () => {
    try {
      const result = await requestNotificationPermission();
      setPermissionState(result);
      setShowPrompt(false);

      if (result === 'granted') {
        // Send welcome notification immediately upon user approval
        await sendWelcomeNotification();
      }
    } catch (err) {
      console.warn('[FitTrack Notification] Permission error:', err);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(NOTIFICATION_PROMPT_SHOWN_KEY, Date.now().toString());
  };

  if (!isMobileDevice || !showPrompt || permissionState !== 'default') {
    return null;
  }

  return (
    <div className="fixed top-4 inset-x-3 sm:inset-x-auto sm:right-4 sm:top-4 z-50 max-w-sm mx-auto sm:mx-0 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className="bg-white/95 backdrop-blur-md border border-line rounded-2xl shadow-xl p-4 text-slate-700">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-700 flex-shrink-0 flex items-center justify-center text-white shadow-xs">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h4 className="font-sora font-semibold text-sm text-navy-900 tracking-tight">
                Enable Notifications
              </h4>
              <button
                onClick={handleDismiss}
                aria-label="Dismiss notification prompt"
                className="text-slate-400 hover:text-slate-600 p-1 -mr-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              Get your welcome alert and daily health reminders in your device notification bar.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleRequestPermission}
                className="flex-1 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Allow Notifications</span>
              </button>
              <button
                onClick={handleDismiss}
                className="text-slate-500 hover:text-navy-900 text-xs font-medium py-2 px-2.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
