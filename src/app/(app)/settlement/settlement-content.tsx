'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { createWeddingCost, updateWeddingCost, deleteWeddingCost } from '@/actions/settlement';
import { formatKRW } from '@/lib/utils';
import { getCostCategories, EVENT_TYPE_LABELS } from '@/lib/constants';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { useWedding } from '@/hooks/use-wedding';
import type { Wedding, Guest, WeddingCost } from '@/lib/types';

interface SettlementContentProps {
  wedding: Wedding;
  guests: Guest[];
  initialCosts: WeddingCost[];
}

interface CostFormState {
  category: string;
  description: string;
  amount: string;
  paid_by: string;
}

function getDefaultFormState(eventType?: string): CostFormState {
  return {
    category: eventType === 'condolence' ? '식대' : '예식장',
    description: '',
    amount: '',
    paid_by: '공동',
  };
}

function BalanceDisplay({ amount, label }: { amount: number; label: string }) {
  const isPositive = amount >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{isPositive ? '+' : ''}{formatKRW(amount)}</span>
      </div>
    </div>
  );
}

function CostForm({
  formState,
  setFormState,
  onSubmit,
  submitLabel,
  isPending,
  paidByOptions,
  categories,
}: {
  formState: CostFormState;
  setFormState: (s: CostFormState) => void;
  onSubmit: () => void;
  submitLabel: string;
  isPending: boolean;
  paidByOptions: { value: string; label: string }[];
  categories: readonly string[];
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs">카테고리</Label>
        <Select
          value={formState.category}
          onValueChange={(v) => setFormState({ ...formState, category: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">상세 내용</Label>
        <Input
          placeholder="예: 한복 촬영 포함"
          value={formState.description}
          onChange={(e) => setFormState({ ...formState, description: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">금액 (원)</Label>
        <Input
          type="number"
          placeholder="0"
          value={formState.amount}
          onChange={(e) => setFormState({ ...formState, amount: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">부담</Label>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${paidByOptions.length}, 1fr)` }}>
          {paidByOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFormState({ ...formState, paid_by: opt.value })}
              className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                formState.paid_by === opt.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-muted-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={onSubmit} disabled={isPending} className="w-full">
        {isPending ? '처리 중...' : submitLabel}
      </Button>
    </div>
  );
}

export function SettlementContent({ wedding, guests, initialCosts }: SettlementContentProps) {
  const { members } = useWedding();
  const labels = EVENT_TYPE_LABELS[wedding.event_type || 'wedding'];
  const costCategories = getCostCategories(wedding.event_type || 'wedding');
  const [costs, setCosts] = useState<WeddingCost[]>(initialCosts);
  const [mealCostPerPerson, setMealCostPerPerson] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<WeddingCost | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState<CostFormState>(() => getDefaultFormState(wedding.event_type));
  const [editForm, setEditForm] = useState<CostFormState>(() => getDefaultFormState(wedding.event_type));
  const [isPending, startTransition] = useTransition();

  const PAID_BY_OPTIONS = [
    ...members.map((m) => ({ value: m.name, label: m.display_name })),
    { value: '공동', label: '공동' },
  ];

  // Per-member stats
  const memberStats = members.map((m) => {
    const memberGuests = guests.filter((g) => g.side === m.name);
    const attended = memberGuests.filter((g) => g.attended).length;
    const gifts = memberGuests.reduce((sum, g) => sum + g.gift_amount, 0);
    return { ...m, guests: memberGuests, attended, gifts };
  });

  const totalAttended = guests.filter((g) => g.attended).length;

  // Gift totals
  const totalGifts = guests.reduce((sum, g) => sum + g.gift_amount, 0);

  // Cost totals
  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);

  // Per-member costs (shared costs split equally)
  const memberCosts = members.map((m) =>
    costs.reduce((sum, c) => {
      if (c.paid_by === m.name) return sum + c.amount;
      if (c.paid_by === '공동') return sum + Math.round(c.amount / members.length);
      return sum;
    }, 0)
  );

  // Meal costs
  const totalMealCost = totalAttended * mealCostPerPerson;

  // Per-member balance
  const memberBalances = members.map((m, i) => {
    const mealCost = memberStats[i].attended * mealCostPerPerson;
    return memberStats[i].gifts - memberCosts[i] - mealCost;
  });

  const balance = totalGifts - totalCosts;

  const handleAdd = () => {
    const amount = parseInt(form.amount.replace(/,/g, ''), 10);
    if (!form.category || isNaN(amount) || amount <= 0) {
      toast.error('카테고리와 금액을 올바르게 입력해주세요');
      return;
    }

    startTransition(async () => {
      const result = await createWeddingCost(wedding.id, {
        category: form.category,
        description: form.description,
        amount,
        paid_by: form.paid_by,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.data) {
        setCosts((prev) => [result.data!, ...prev]);
        toast.success('비용이 등록되었습니다');
        setForm(getDefaultFormState(wedding.event_type));
        setIsAddOpen(false);
      }
    });
  };

  const handleEdit = () => {
    if (!editingCost) return;
    const amount = parseInt(editForm.amount.replace(/,/g, ''), 10);
    if (!editForm.category || isNaN(amount) || amount <= 0) {
      toast.error('카테고리와 금액을 올바르게 입력해주세요');
      return;
    }

    startTransition(async () => {
      const result = await updateWeddingCost(editingCost.id, {
        category: editForm.category,
        description: editForm.description,
        amount,
        paid_by: editForm.paid_by,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.data) {
        setCosts((prev) => prev.map((c) => (c.id === editingCost.id ? result.data! : c)));
        toast.success('수정되었습니다');
        setIsEditOpen(false);
        setEditingCost(null);
      }
    });
  };

  const handleDelete = (costId: string) => {
    startTransition(async () => {
      const result = await deleteWeddingCost(costId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setCosts((prev) => prev.filter((c) => c.id !== costId));
      toast.success('삭제되었습니다');
    });
  };

  const openEdit = (cost: WeddingCost) => {
    setEditingCost(cost);
    setEditForm({
      category: cost.category,
      description: cost.description,
      amount: cost.amount.toString(),
      paid_by: cost.paid_by,
    });
    setIsEditOpen(true);
  };

  return (
    <div className="py-6 space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading text-2xl font-bold">정산 계산기</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{wedding.event_type === 'condolence' ? '비용 정산을 도와드립니다' : '양가 비용 정산을 도와드립니다'}</p>
      </motion.div>

      {/* Section 1: 비용 요약 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">비용 요약</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{`총 ${labels.event} 비용`}</span>
              <span className="font-semibold">{formatKRW(totalCosts)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{`총 ${labels.gift}`}</span>
              <span className="font-semibold">{formatKRW(totalGifts)}</span>
            </div>
            <Separator />
            <BalanceDisplay amount={balance} label="수지" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 2: 식대 계산기 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">식대 계산기</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Label className="text-xs whitespace-nowrap text-muted-foreground">1인당 식대</Label>
              <div className="relative flex-1">
                <Input
                  type="number"
                  placeholder="0"
                  value={mealCostPerPerson === 0 ? '' : mealCostPerPerson}
                  onChange={(e) => setMealCostPerPerson(parseInt(e.target.value, 10) || 0)}
                  className="pr-6"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">원</span>
              </div>
            </div>

            {mealCostPerPerson > 0 && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">참석 인원 ({totalAttended}명) 총 식대</span>
                  <span className="font-medium">{formatKRW(totalMealCost)}</span>
                </div>
                <Separator />
                {memberStats.map((m) => (
                  <div key={m.name} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{m.display_name}측 ({m.attended}명)</span>
                    <span>{formatKRW(m.attended * mealCostPerPerson)}</span>
                  </div>
                ))}
              </div>
            )}

            {mealCostPerPerson === 0 && (
              <p className="text-xs text-muted-foreground">
                1인당 식대를 입력하면 멤버별 식대가 자동 계산됩니다
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 3: 정산 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{wedding.event_type === 'condolence' ? '정산' : '양가 정산'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {members.map((m, i) => (
              <div key={m.name} className="space-y-2">
                <p className="text-xs font-medium" style={{ color: `var(--chart-${(i % 5) + 1})` }}>
                  {m.display_name}측
                </p>
                <div className="bg-muted/40 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{labels.gift}</span>
                    <span>{formatKRW(memberStats[i].gifts)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{`${labels.event} 비용`}</span>
                    <span className="text-rose-500">-{formatKRW(memberCosts[i])}</span>
                  </div>
                  {mealCostPerPerson > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">식대</span>
                      <span className="text-rose-500">-{formatKRW(memberStats[i].attended * mealCostPerPerson)}</span>
                    </div>
                  )}
                  <Separator />
                  <BalanceDisplay amount={memberBalances[i]} label="수지" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Section 4: 비용 항목 목록 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">비용 항목</CardTitle>
              <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                <SheetTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    추가
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[75vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="font-heading">비용 추가</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <CostForm
                      formState={form}
                      setFormState={setForm}
                      onSubmit={handleAdd}
                      submitLabel="추가하기"
                      isPending={isPending}
                      paidByOptions={PAID_BY_OPTIONS}
                      categories={costCategories}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </CardHeader>
          <CardContent>
            {costs.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Minus className="w-8 h-8 mx-auto mb-2 opacity-30" />
                등록된 비용 항목이 없습니다
              </div>
            ) : (
              <div className="space-y-2">
                {costs.map((cost) => (
                  <div
                    key={cost.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium shrink-0">
                          {cost.category}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {PAID_BY_OPTIONS.find((o) => o.value === cost.paid_by)?.label ?? cost.paid_by}
                        </span>
                      </div>
                      {cost.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{cost.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <span className="font-semibold text-sm">{formatKRW(cost.amount)}</span>
                      <button
                        onClick={() => openEdit(cost)}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="수정"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cost.id)}
                        className="p-1 text-muted-foreground hover:text-rose-500 transition-colors"
                        aria-label="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Sheet */}
      <Sheet open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) setEditingCost(null); }}>
        <SheetContent side="bottom" className="h-[75vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-heading">비용 수정</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <CostForm
              formState={editForm}
              setFormState={setEditForm}
              onSubmit={handleEdit}
              submitLabel="수정하기"
              isPending={isPending}
              paidByOptions={PAID_BY_OPTIONS}
              categories={costCategories}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
