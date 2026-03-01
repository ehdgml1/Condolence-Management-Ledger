'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatKRW } from '@/lib/utils';
import type { Guest } from '@/lib/types';
import { UserCheck, UserX, ChevronRight, Banknote, ArrowLeftRight, Gift } from 'lucide-react';
import Link from 'next/link';

interface GuestCardProps {
  guest: Guest;
  index?: number;
}

export function GuestCard({ guest, index = 0 }: GuestCardProps) {
  const showAmountPending = guest.gift_received && guest.gift_amount === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Link href={`/guests/${guest.id}`}>
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  guest.attended
                    ? 'bg-green-100 text-green-700'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {guest.attended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{guest.name}</p>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {guest.side}
                    </Badge>
                    {guest.envelope_number != null && (
                      <Badge variant="outline" className="text-xs shrink-0 font-mono">
                        #{guest.envelope_number}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <p className="text-xs text-muted-foreground">
                      {guest.group_name}
                      {guest.relationship && ` · ${guest.relationship}`}
                    </p>
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      {guest.payment_method === 'cash' ? (
                        <><Banknote className="w-3 h-3" />현금</>
                      ) : (
                        <><ArrowLeftRight className="w-3 h-3" />이체</>
                      )}
                    </span>
                    {showAmountPending && (
                      <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-100 px-1.5 py-0">
                        금액 미입력
                      </Badge>
                    )}
                    {guest.gift_returned && (
                      <span className="flex items-center gap-0.5 text-xs text-green-600">
                        <Gift className="w-3 h-3" />답례완료
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="font-bold text-sm">{formatKRW(guest.gift_amount)}</p>
                  {guest.thanked && (
                    <p className="text-xs text-green-600">감사 완료</p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
