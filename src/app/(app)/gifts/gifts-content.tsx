'use client';

import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuickEntryMode } from '@/components/gifts/QuickEntryMode';
import { GiftSummary } from '@/components/gifts/GiftSummary';
import { KoreanWon } from '@/components/shared/KoreanWon';
import { useGuests } from '@/hooks/use-guests';
import { useWedding } from '@/hooks/use-wedding';
import { Zap, List } from 'lucide-react';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import type { Guest } from '@/lib/types';

interface GiftsPageContentProps {
  initialGuests: Guest[];
  weddingId: string;
}

export function GiftsPageContent({ initialGuests, weddingId }: GiftsPageContentProps) {
  const { guests, addOptimistic } = useGuests(initialGuests, weddingId);
  const { wedding } = useWedding();
  const labels = EVENT_TYPE_LABELS[wedding.event_type || 'wedding'];
  const totalGifts = guests.reduce((sum, g) => sum + g.gift_amount, 0);

  const handleAdd = (guest: Guest) => {
    addOptimistic({ type: 'add', guest });
  };

  return (
    <div className="py-6 space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="font-heading text-2xl font-bold">{labels.gift}</h1>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-sm text-muted-foreground">합계</span>
          <KoreanWon amount={totalGifts} size="lg" className="text-primary" />
        </div>
      </motion.div>

      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="quick" className="flex-1 gap-1">
            <Zap className="w-4 h-4" />
            빠른 입력
          </TabsTrigger>
          <TabsTrigger value="list" className="flex-1 gap-1">
            <List className="w-4 h-4" />
            목록
          </TabsTrigger>
        </TabsList>
        <TabsContent value="quick" className="mt-4">
          <QuickEntryMode
            onAdd={handleAdd}
            guests={guests}
            nextEnvelopeNumber={guests.reduce((max, g) => Math.max(max, g.envelope_number ?? 0), 0) + 1}
          />
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <GiftSummary guests={guests} eventType={wedding.event_type} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
