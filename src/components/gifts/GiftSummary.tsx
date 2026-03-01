'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatKRW } from '@/lib/utils';
import { updateGiftAmount } from '@/actions/gifts';
import { Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import type { Guest, EventType } from '@/lib/types';

interface GiftSummaryProps {
  guests: Guest[];
  eventType?: EventType;
}

export function GiftSummary({ guests, eventType }: GiftSummaryProps) {
  const labels = EVENT_TYPE_LABELS[eventType || 'wedding'];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [isPending, startTransition] = useTransition();

  const giftGuests = guests
    .filter((g) => g.gift_amount > 0)
    .sort((a, b) => b.gift_amount - a.gift_amount);

  const handleSave = (guestId: string) => {
    const amount = parseInt(editAmount) || 0;
    startTransition(async () => {
      const result = await updateGiftAmount(guestId, amount);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('수정되었습니다');
      setEditingId(null);
    });
  };

  return (
    <div className="space-y-2">
      {giftGuests.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">{`아직 ${labels.gift} 기록이 없습니다.`}</p>
      ) : (
        giftGuests.map((guest, i) => (
          <motion.div
            key={guest.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
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
                {editingId === guest.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-28 h-8 text-sm"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleSave(guest.id)}
                      disabled={isPending}
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{formatKRW(guest.gift_amount)}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingId(guest.id);
                        setEditAmount(guest.gift_amount.toString());
                      }}
                    >
                      <Pencil className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
}
