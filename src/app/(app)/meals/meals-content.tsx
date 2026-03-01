'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PremiumGate } from '@/components/shared/PremiumGate';
import { updateMealTickets } from '@/actions/meals';
import { formatNumber } from '@/lib/utils';
import { UtensilsCrossed, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useWedding } from '@/hooks/use-wedding';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import type { Guest } from '@/lib/types';

interface MealsPageContentProps {
  guests: Guest[];
}

export function MealsPageContent({ guests: initialGuests }: MealsPageContentProps) {
  const { wedding } = useWedding();
  const labels = EVENT_TYPE_LABELS[wedding.event_type || 'wedding'];
  const [guests, setGuests] = useState(initialGuests);
  const [isPending, startTransition] = useTransition();

  const totalTickets = guests.reduce((sum, g) => sum + g.meal_tickets, 0);
  const attendedCount = guests.filter((g) => g.attended).length;

  const handleUpdate = (guestId: string, delta: number) => {
    const guest = guests.find((g) => g.id === guestId);
    if (!guest) return;

    const newCount = Math.max(0, guest.meal_tickets + delta);

    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, meal_tickets: newCount } : g))
    );

    startTransition(async () => {
      const result = await updateMealTickets(guestId, newCount);
      if (result.error) {
        toast.error(result.error);
        setGuests((prev) =>
          prev.map((g) => (g.id === guestId ? { ...g, meal_tickets: guest.meal_tickets } : g))
        );
      }
    });
  };

  if (wedding.event_type === 'condolence') {
    return (
      <div className="py-6 space-y-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">경조사 이벤트에서는 식권 관리를 사용하지 않습니다.</p>
          <a href="/dashboard" className="text-primary underline text-sm">대시보드로 돌아가기</a>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="font-heading text-2xl font-bold">식권 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">{`${labels.guest}별 식권을 관리하세요`}</p>
      </motion.div>

      <PremiumGate feature="식권 관리">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <UtensilsCrossed className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{formatNumber(totalTickets)}</p>
              <p className="text-xs text-muted-foreground">총 식권</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{formatNumber(attendedCount)}</p>
              <p className="text-xs text-muted-foreground">참석 인원</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          {guests
            .filter((g) => g.attended)
            .map((guest, i) => (
              <motion.div
                key={guest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium truncate">{guest.name}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {guest.side}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => handleUpdate(guest.id, -1)}
                        disabled={guest.meal_tickets === 0 || isPending}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-bold">
                        {guest.meal_tickets}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => handleUpdate(guest.id, 1)}
                        disabled={isPending}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      </PremiumGate>
    </div>
  );
}
