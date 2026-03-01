'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GuestList } from '@/components/guests/GuestList';
import { GuestForm } from '@/components/guests/GuestForm';
import { useGuests } from '@/hooks/use-guests';
import { createGuest } from '@/actions/guests';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Guest, GuestFormData } from '@/lib/types';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import { useWedding } from '@/hooks/use-wedding';

interface GuestsPageContentProps {
  initialGuests: Guest[];
  weddingId: string;
}

export function GuestsPageContent({ initialGuests, weddingId }: GuestsPageContentProps) {
  const { wedding } = useWedding();
  const labels = EVENT_TYPE_LABELS[wedding.event_type || 'wedding'];
  const { guests, addOptimistic } = useGuests(initialGuests, weddingId);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCreate = async (data: GuestFormData) => {
    startTransition(async () => {
      const result = await createGuest(weddingId, data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.data) {
        addOptimistic({ type: 'add', guest: result.data });
        toast.success(`${data.name}님이 등록되었습니다.`);
        setIsOpen(false);
      }
    });
  };

  return (
    <div className="py-6 space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-heading text-2xl font-bold">{`${labels.guest} 관리`}</h1>
          <p className="text-sm text-muted-foreground">
            {guests.length}명
          </p>
        </div>
        <div className="flex gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" />
              등록
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="font-heading">{`${labels.guest} 등록`}</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <GuestForm
                onSubmit={handleCreate}
                onCancel={() => setIsOpen(false)}
                isPending={isPending}
              />
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </motion.div>

      <GuestList guests={guests} />
    </div>
  );
}
