'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Users, Gift, BarChart3, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import type { EventType } from '@/lib/types';

interface BottomNavProps {
  eventType?: EventType;
}

export function BottomNav({ eventType }: BottomNavProps) {
  const pathname = usePathname();
  const labels = EVENT_TYPE_LABELS[eventType || 'wedding'];

  const navItems = [
    { href: '/dashboard', icon: Home, label: '홈' },
    { href: '/guests', icon: Users, label: labels.guest },
    { href: '/gifts', icon: Gift, label: labels.gift },
    { href: '/stats', icon: BarChart3, label: '통계' },
    { href: '/settings', icon: MoreHorizontal, label: '더보기' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 relative">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 min-w-[64px]"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-1 rounded-xl bg-primary/8"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <motion.div
                animate={{
                  scale: isActive ? 1.05 : 1,
                  y: isActive ? -1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative z-10"
              >
                <item.icon
                  className={cn(
                    'w-5 h-5 transition-colors duration-200',
                    isActive
                      ? 'text-primary stroke-[2.5]'
                      : 'text-muted-foreground'
                  )}
                />
              </motion.div>
              <span
                className={cn(
                  'text-[10px] font-medium relative z-10 transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
