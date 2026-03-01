'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWedding } from '@/hooks/use-wedding';
import { quickAddGift } from '@/actions/gifts';
import { GROUP_NAMES, COMMON_GIFT_AMOUNTS, PAYMENT_METHODS, EVENT_TYPE_LABELS } from '@/lib/constants';
import { formatKRW } from '@/lib/utils';
import { Check, Plus, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { GroupName, Guest, PaymentMethod } from '@/lib/types';

interface QuickEntryModeProps {
  onAdd: (guest: Guest) => void;
  guests: Guest[];
  nextEnvelopeNumber: number;
}

export function QuickEntryMode({ onAdd, guests, nextEnvelopeNumber }: QuickEntryModeProps) {
  const { wedding, members } = useWedding();
  const labels = EVENT_TYPE_LABELS[wedding.event_type || 'wedding'];
  const nameRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  // 2-step mode: '이름만' = envelope only, '이름+금액' = full entry
  const [entryMode, setEntryMode] = useState<'이름만' | '이름+금액'>('이름+금액');

  const [name, setName] = useState('');
  const [side, setSide] = useState<string>(members[0]?.name || '');
  const [groupName, setGroupName] = useState<GroupName>('친구');
  const [giftAmount, setGiftAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [envelopeNumber, setEnvelopeNumber] = useState<number>(nextEnvelopeNumber);

  // Running total: count guests added today (client-only to avoid hydration mismatch)
  const [todayCount, setTodayCount] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayGuests = guests.filter((g) => g.created_at.slice(0, 10) === today);
    setTodayCount(todayGuests.length);
    setTodayTotal(todayGuests.reduce((sum, g) => sum + g.gift_amount, 0));
  }, [guests]);

  const resetForm = () => {
    setName('');
    setGiftAmount(0);
    setCustomAmount('');
    setEnvelopeNumber((prev) => prev + 1);
    nameRef.current?.focus();
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('이름을 입력해주세요');
      return;
    }

    const isNameOnly = entryMode === '이름만';
    const finalAmount = isNameOnly
      ? 0
      : customAmount
        ? parseInt(customAmount) || 0
        : giftAmount;

    startTransition(async () => {
      const result = await quickAddGift(wedding.id, {
        name: name.trim(),
        side,
        group_name: groupName,
        gift_amount: finalAmount,
        attended: true,
        payment_method: paymentMethod,
        envelope_number: envelopeNumber,
        gift_received: isNameOnly ? true : finalAmount > 0,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.data) {
        onAdd(result.data);
        setLastAdded(name.trim());
        setTimeout(() => setLastAdded(null), 2000);
        toast.success(`${name.trim()}님 등록 완료!`);
        resetForm();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Zap className="w-4 h-4 text-amber-500" />
        <span>빠른 입력 모드 - 터치로 빠르게 입력하세요</span>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-4">
          {/* Running total */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">
              오늘 접수: <span className="font-semibold text-foreground">{todayCount}명</span>
            </span>
            <span className="text-muted-foreground">
              {`총 ${labels.gift}:`}{' '}
              <span className="font-semibold text-primary">{formatKRW(todayTotal)}</span>
            </span>
          </div>

          {/* Entry mode toggle */}
          <div className="flex rounded-lg overflow-hidden border">
            {(['이름만 먼저', '이름+금액 함께'] as const).map((label) => {
              const mode = label === '이름만 먼저' ? '이름만' : '이름+금액';
              const active = entryMode === mode;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setEntryMode(mode)}
                  className={[
                    'flex-1 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-muted',
                  ].join(' ')}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Name input with envelope number badge */}
          <div className="relative flex items-center gap-2">
            <Badge variant="outline" className="shrink-0 font-mono text-xs px-2 py-1">
              #{envelopeNumber}
            </Badge>
            <Input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`${labels.guest} 이름`}
              className="text-lg h-12"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
          </div>

          {/* Side selection */}
          <div className="flex gap-2">
            {members.map((m) => (
              <Button
                key={m.name}
                type="button"
                variant={side === m.name ? 'default' : 'outline'}
                onClick={() => setSide(m.name)}
                className="flex-1 h-10"
              >
                {m.display_name}
              </Button>
            ))}
          </div>

          {/* Group selection */}
          <div className="flex flex-wrap gap-2">
            {GROUP_NAMES.map((g) => (
              <Badge
                key={g}
                variant={groupName === g ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1.5 text-sm"
                onClick={() => setGroupName(g)}
              >
                {g}
              </Badge>
            ))}
          </div>

          {/* Payment method toggle */}
          <div className="flex rounded-lg overflow-hidden border">
            {PAYMENT_METHODS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPaymentMethod(value)}
                className={[
                  'flex-1 py-2 text-sm font-medium transition-colors',
                  paymentMethod === value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-muted',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Quick amount buttons - hidden in name-only mode */}
          <AnimatePresence initial={false}>
            {entryMode === '이름+금액' && (
              <motion.div
                key="amount-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-1 space-y-2">
                  <p className="text-xs text-muted-foreground">{`${labels.gift} 금액`}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {COMMON_GIFT_AMOUNTS.map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant={giftAmount === amount && !customAmount ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setGiftAmount(amount);
                          setCustomAmount('');
                        }}
                      >
                        {formatKRW(amount)}
                      </Button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setGiftAmount(0);
                    }}
                    placeholder="직접 입력 (원)"
                    className="h-10"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className="w-full h-14 text-lg"
          >
            {isPending ? (
              '등록 중...'
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                {entryMode === '이름만' ? '수령 등록' : '등록하기'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Success animation */}
      <AnimatePresence>
        {lastAdded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg">
              <Check className="w-4 h-4" />
              <span className="font-medium">{lastAdded}님 등록!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
