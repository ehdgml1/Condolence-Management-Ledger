'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { switchEvent } from '@/actions/events';
import { Calendar, MapPin, Plus, Loader2 } from 'lucide-react';
import type { Wedding } from '@/lib/types';
import { formatKoreanDate } from '@/lib/utils';

interface EventSelectorContentProps {
  events: { wedding: Wedding; role: string }[];
}

export function EventSelectorContent({ events }: EventSelectorContentProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSelectEvent = (weddingId: string) => {
    startTransition(async () => {
      await switchEvent(weddingId);
    });
  };

  return (
    <div className="min-h-screen bg-romantic-gradient flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">내 이벤트</h1>
          <p className="text-muted-foreground">관리할 이벤트를 선택하세요</p>
        </div>

        <div className="space-y-3">
          {events.map((event, index) => (
            <motion.div
              key={event.wedding.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => !isPending && handleSelectEvent(event.wedding.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">
                      {event.wedding.event_type === 'wedding' ? '\u{1F492}' : '\u{1F64F}'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {event.wedding.event_type === 'wedding' ? '결혼식' : '경조사'}
                        </span>
                      </div>
                      <p className="font-heading text-lg font-semibold truncate">
                        {event.wedding.event_type === 'wedding' && event.wedding.bride_name
                          ? `${event.wedding.groom_name} \u2665 ${event.wedding.bride_name}`
                          : event.wedding.groom_name}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        {event.wedding.wedding_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatKoreanDate(event.wedding.wedding_date, { month: 'short' })}
                          </span>
                        )}
                        {event.wedding.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.wedding.venue}
                          </span>
                        )}
                      </div>
                    </div>
                    {isPending && (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: events.length * 0.1 + 0.2 }}
          className="mt-6"
        >
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/onboarding?from=events')}
            disabled={isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            새 이벤트 만들기
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
