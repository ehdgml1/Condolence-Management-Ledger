'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, CheckCircle2 } from 'lucide-react';

type Status = 'online' | 'offline' | 'reconnected';

export function OfflineIndicator() {
  const [status, setStatus] = useState<Status>('online');

  useEffect(() => {
    // Detect initial offline state on mount
    if (!navigator.onLine) setStatus('offline');

    const handleOffline = () => {
      setStatus('offline');
    };

    const handleOnline = () => {
      setStatus('reconnected');
      const timer = setTimeout(() => setStatus('online'), 2500);
      return () => clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const isVisible = status !== 'online';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={status}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          // Position above the bottom nav (h-16 = 64px) + extra spacing
          className="fixed bottom-[calc(64px+12px)] left-1/2 z-50 -translate-x-1/2"
          aria-live="polite"
          role="status"
        >
          {status === 'offline' && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg">
              <WifiOff className="h-3.5 w-3.5 shrink-0" />
              <span>오프라인 모드</span>
            </div>
          )}

          {status === 'reconnected' && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>동기화 완료!</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
