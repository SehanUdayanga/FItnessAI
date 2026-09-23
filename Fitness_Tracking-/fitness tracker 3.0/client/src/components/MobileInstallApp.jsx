import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Check, Activity, Smartphone } from 'lucide-react';

const DISMISS_KEY = 'fittrack_pwa_dismissed_at';
const DISMISS_COOLDOWN_DAYS = 7;

export default function MobileInstallApp() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if running in browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    // 2. Detect if already installed / running in Standalone Mode
    const checkIsStandalone = () => {
      const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isNavigatorStandalone = window.navigator.standalone === true;
      const isAndroidApp = document.referrer.includes('android-app://');
      return isDisplayStandalone || isNavigatorStandalone || isAndroidApp;
    };

    if (checkIsStandalone()) {
      setIsStandalone(true);
      return;
    }

    // 3. Mobile Device Detection (Android, iPhone, iPad)
    const ua = navigator.userAgent || '';
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua)); // Modern iPadOS
    const isAndroidDevice = /Android/i.test(ua);
    const isMobileDevice =
      isIOSDevice ||
      isAndroidDevice ||
      /Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    setIsIOS(isIOSDevice);
    setIsMobile(isMobileDevice);

    // If not on mobile device, do not show PWA mobile prompt
    if (!isMobileDevice) {
      return;
    }

    // 4. Check dismissal cooldown
    const lastDismissed = localStorage.getItem(DISMISS_KEY);
    if (lastDismissed) {
      const daysSinceDismiss = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < DISMISS_COOLDOWN_DAYS) {
        setIsDismissed(true);
        return;
      }
    }
    setIsDismissed(false);

    // 5. Android `beforeinstallprompt` Handler
    const handleBeforeInstallPrompt = (e) => {
      // Prevent browser's default mini-infobar
      e.preventDefault();
      // Stash event for trigger
      setDeferredPrompt(e);
      setIsDismissed(false);
    };

    // 6. `appinstalled` Handler
    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setIsDismissed(true);
      localStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show native install prompt
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setIsDismissed(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowIOSGuide(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  // Conditions to hide UI:
  // - Already in standalone mode
  // - User on desktop (not mobile)
  // - User recently dismissed banner
  // - Already installed
  if (isStandalone || !isMobile || isDismissed || installed) {
    return null;
  }

  // iOS Safari Flow
  if (isIOS) {
    return (
      <div className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-4 sm:bottom-4 z-50 max-w-sm mx-auto sm:mx-0 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
        <div className="bg-white/95 backdrop-blur-md border border-line rounded-2xl shadow-lg p-4 text-slate-700">
          {!showIOSGuide ? (
            // Compact Initial iOS Banner
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-700 flex-shrink-0 flex items-center justify-center text-white shadow-xs">
                <Activity className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-sora font-semibold text-sm text-navy-900 tracking-tight">
                    Install FitTrack App
                  </h4>
                  <button
                    onClick={handleDismiss}
                    aria-label="Close installation banner"
                    className="text-slate-400 hover:text-slate-600 p-1 -mr-1 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  Add to your iPhone Home Screen for full-screen tracking & quick access.
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setShowIOSGuide(true)}
                    className="flex-1 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>How to Install</span>
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="text-slate-500 hover:text-navy-900 text-xs font-medium py-2 px-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Step-by-Step iOS Add to Home Screen Instructions
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-line mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-green-700 flex items-center justify-center text-white">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-sora font-bold text-xs text-navy-900">
                    Install on iOS Home Screen
                  </h4>
                </div>
                <button
                  onClick={handleDismiss}
                  aria-label="Close guide"
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2.5 bg-[#FAFAF8] p-2 rounded-xl border border-line/60">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                    <span>Tap the Safari</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-navy-900 bg-white px-1.5 py-0.5 rounded border border-line">
                      <Share className="w-3 h-3 text-secondary" /> Share
                    </span>
                    <span>button below</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-[#FAFAF8] p-2 rounded-xl border border-line/60">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                    <span>Scroll and select</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-navy-900 bg-white px-1.5 py-0.5 rounded border border-line">
                      <PlusSquare className="w-3 h-3 text-slate-700" /> Add to Home Screen
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-[#FAFAF8] p-2 rounded-xl border border-line/60">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-800 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    3
                  </span>
                  <div className="flex items-center gap-1.5 flex-1">
                    <span>Tap</span>
                    <span className="font-semibold text-navy-900 bg-white px-1.5 py-0.5 rounded border border-line">
                      Add
                    </span>
                    <span>in top right corner</span>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-2 border-t border-line flex justify-end">
                <button
                  onClick={handleDismiss}
                  className="w-full bg-green-700 hover:bg-green-600 active:bg-green-800 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Got it</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Android & Other Supported Mobile Browsers Flow
  if (deferredPrompt) {
    return (
      <div className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-4 sm:bottom-4 z-50 max-w-sm mx-auto sm:mx-0 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
        <div className="bg-white/95 backdrop-blur-md border border-line rounded-2xl shadow-lg p-4 text-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-700 flex-shrink-0 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="font-sora font-semibold text-sm text-navy-900 tracking-tight">
                  Install FitTrack App
                </h4>
                <button
                  onClick={handleDismiss}
                  aria-label="Close installation banner"
                  className="text-slate-400 hover:text-slate-600 p-1 -mr-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                Add to your home screen for quick, standalone health & fitness tracking.
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-slate-500 hover:text-navy-900 text-xs font-medium py-2 px-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
