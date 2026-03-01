'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GuestCard } from './GuestCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Users, Search } from 'lucide-react';
import type { Guest, GroupName } from '@/lib/types';
import { GROUP_NAMES, EVENT_TYPE_LABELS } from '@/lib/constants';
import { useWedding } from '@/hooks/use-wedding';

interface GuestListProps {
  guests: Guest[];
}

type AmountFilter = 'all' | 'pending' | 'completed';
type PaymentFilter = 'all' | 'cash' | 'transfer';

export function GuestList({ guests }: GuestListProps) {
  const { members, wedding } = useWedding();
  const labels = EVENT_TYPE_LABELS[wedding.event_type || 'wedding'];
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<GroupName | 'all'>('all');
  const [amountFilter, setAmountFilter] = useState<AmountFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');

  const filtered = useMemo(() => {
    return guests.filter((g) => {
      if (search && !g.name.includes(search) && !g.relationship?.includes(search)) {
        return false;
      }
      if (sideFilter !== 'all' && g.side !== sideFilter) return false;
      if (groupFilter !== 'all' && g.group_name !== groupFilter) return false;
      if (amountFilter === 'pending' && !(g.gift_received && g.gift_amount === 0)) return false;
      if (amountFilter === 'completed' && !(g.gift_amount > 0)) return false;
      if (paymentFilter === 'cash' && g.payment_method !== 'cash') return false;
      if (paymentFilter === 'transfer' && g.payment_method !== 'transfer') return false;
      return true;
    });
  }, [guests, search, sideFilter, groupFilter, amountFilter, paymentFilter]);

  const pendingCount = useMemo(
    () => guests.filter((g) => g.gift_received && g.gift_amount === 0).length,
    [guests]
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="이름, 관계로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2">
        <Select value={sideFilter} onValueChange={(v) => setSideFilter(v)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="소속" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.name} value={m.name}>{m.display_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={groupFilter} onValueChange={(v) => setGroupFilter(v as GroupName | 'all')}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="그룹" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {GROUP_NAMES.map((g) => (
              <SelectItem key={g} value={g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setAmountFilter(amountFilter === 'pending' ? 'all' : 'pending')}
          className="focus:outline-none"
        >
          <Badge
            variant={amountFilter === 'pending' ? 'default' : 'outline'}
            className={`cursor-pointer text-xs px-3 py-1 ${
              amountFilter === 'pending'
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                : 'hover:bg-amber-50 border-amber-300 text-amber-700'
            }`}
          >
            금액 미입력
            {pendingCount > 0 && (
              <span className="ml-1 font-bold">{pendingCount}</span>
            )}
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setAmountFilter(amountFilter === 'completed' ? 'all' : 'completed')}
          className="focus:outline-none"
        >
          <Badge
            variant={amountFilter === 'completed' ? 'default' : 'outline'}
            className={`cursor-pointer text-xs px-3 py-1 ${
              amountFilter === 'completed'
                ? 'bg-green-500 hover:bg-green-600 text-white border-green-500'
                : 'hover:bg-green-50 border-green-300 text-green-700'
            }`}
          >
            금액 입력완료
          </Badge>
        </button>

        <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as PaymentFilter)}>
          <SelectTrigger className="w-[110px] h-7 text-xs">
            <SelectValue placeholder="결제수단" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="cash">현금</SelectItem>
            <SelectItem value="transfer">계좌이체</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={`${labels.guest}이 없습니다`}
          description={search ? `검색 조건에 맞는 ${labels.guest}이 없습니다.` : `첫 ${labels.guest}을 등록해보세요!`}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((guest, i) => (
            <GuestCard key={guest.id} guest={guest} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
