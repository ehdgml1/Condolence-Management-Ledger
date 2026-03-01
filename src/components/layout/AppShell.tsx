import Link from 'next/link';
import { BottomNav } from './BottomNav';
import type { EventType } from '@/lib/types';

interface AppShellProps {
  children: React.ReactNode;
  eventType?: EventType;
  eventName?: string;
}

export function AppShell({ children, eventType, eventName }: AppShellProps) {
  return (
    <div
      className="min-h-screen bg-background"
      data-event-type={eventType}
    >
      {eventName && (
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b">
          <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm">
                {eventType === 'wedding' ? '💒' : '🙏'}
              </span>
              <span className="text-sm font-medium truncate">{eventName}</span>
            </div>
            <Link
              href="/events"
              className="text-xs text-primary hover:underline flex-shrink-0 ml-2"
            >
              전환
            </Link>
          </div>
        </div>
      )}
      <main className="max-w-lg mx-auto pb-20 px-4">
        {children}
      </main>
      <BottomNav eventType={eventType} />
    </div>
  );
}
