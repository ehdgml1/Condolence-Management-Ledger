'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // New SW installed and waiting
        const onUpdateFound = () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New content is available
              toast.info('새로운 업데이트가 있어요', {
                description: '다음 방문 시 최신 버전이 적용됩니다.',
                duration: 6000,
                action: {
                  label: '지금 업데이트',
                  onClick: () => {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                  },
                },
              });
            }

            if (newWorker.state === 'activated' && !navigator.serviceWorker.controller) {
              // First install — app ready for offline use
              toast.success('오프라인 사용 준비 완료', {
                description: '인터넷 없이도 앱을 사용할 수 있어요.',
                duration: 4000,
              });
            }
          });
        };

        registration.addEventListener('updatefound', onUpdateFound);

        // Handle controller change (after skipWaiting)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });

        // Check for updates in the background every 60 seconds
        const intervalId = setInterval(() => {
          registration.update().catch(() => {
            // Silently ignore update check failures when offline
          });
        }, 60_000);
        return () => clearInterval(intervalId);
      } catch (err) {
        console.warn('[SW] Registration failed:', err);
      }
    };

    // Defer registration to after page load for performance
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW, { once: true });
    }
  }, []);

  return null;
}
