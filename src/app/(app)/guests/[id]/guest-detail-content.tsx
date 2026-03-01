'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GuestForm } from '@/components/guests/GuestForm';
import { KoreanWon } from '@/components/shared/KoreanWon';
import { updateGuest, deleteGuest } from '@/actions/guests';
import { formatPhone } from '@/lib/utils';
import { ArrowLeft, Pencil, Trash2, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { useWedding } from '@/hooks/use-wedding';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import type { Guest, GuestFormData } from '@/lib/types';

interface GuestDetailContentProps {
  guest: Guest;
}

export function GuestDetailContent({ guest: initialGuest }: GuestDetailContentProps) {
  const router = useRouter();
  const { wedding } = useWedding();
  const labels = EVENT_TYPE_LABELS[wedding.event_type || 'wedding'];
  const [guest, setGuest] = useState(initialGuest);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = async (data: GuestFormData) => {
    startTransition(async () => {
      const result = await updateGuest(guest.id, data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.data) {
        setGuest(result.data);
        toast.success('수정되었습니다.');
        setIsEditing(false);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteGuest(guest.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('삭제되었습니다.');
      router.push('/guests');
    });
  };

  return (
    <div className="py-6 space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="뒤로 가기">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-heading text-xl font-bold flex-1">{guest.name}</h1>
        <Sheet open={isEditing} onOpenChange={setIsEditing}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="수정">
              <Pencil className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="font-heading">{`${labels.guest} 수정`}</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <GuestForm
                guest={guest}
                onSubmit={handleUpdate}
                onCancel={() => setIsEditing(false)}
                isPending={isPending}
              />
            </div>
          </SheetContent>
        </Sheet>
        <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="text-destructive" aria-label="삭제">
              <Trash2 className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {guest.name}님의 정보가 영구적으로 삭제됩니다.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsDeleting(false)}>
                취소
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                {isPending ? '삭제 중...' : '삭제'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Badge>{guest.side}</Badge>
              <Badge variant="secondary">{guest.group_name}</Badge>
              {guest.attended ? (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  <UserCheck className="w-3 h-3 mr-1" />
                  참석
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <UserX className="w-3 h-3 mr-1" />
                  미참석
                </Badge>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{labels.gift}</span>
                <KoreanWon amount={guest.gift_amount} size="md" className="font-bold" />
              </div>
              {guest.relationship && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">관계</span>
                  <span className="text-sm">{guest.relationship}</span>
                </div>
              )}
              {guest.phone && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">연락처</span>
                  <span className="text-sm">{formatPhone(guest.phone)}</span>
                </div>
              )}
              {wedding.event_type !== 'condolence' && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">식권</span>
                  <span className="text-sm">{guest.meal_tickets}장</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">감사 인사</span>
                <span className="text-sm">{guest.thanked ? '완료' : '미완료'}</span>
              </div>
            </div>

            {guest.memo && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">메모</p>
                  <p className="text-sm">{guest.memo}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
