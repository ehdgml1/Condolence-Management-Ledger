'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { User, Banknote, CalendarCheck, FileText } from 'lucide-react';
import { GROUP_NAMES, COMMON_GIFT_AMOUNTS, EVENT_TYPE_LABELS } from '@/lib/constants';
import { formatKRW } from '@/lib/utils';
import { validateGuestForm } from '@/lib/validators';
import { useWedding } from '@/hooks/use-wedding';
import type { Guest, GuestFormData, GroupName } from '@/lib/types';

interface GuestFormProps {
  guest?: Guest;
  onSubmit: (data: GuestFormData) => Promise<void>;
  onCancel?: () => void;
  isPending?: boolean;
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-t-xl"
      style={{ background: 'oklch(0.97 0.015 10 / 0.6)' }}>
      <Icon
        size={14}
        style={{ color: 'oklch(0.60 0.08 10)' }}
        strokeWidth={2.5}
      />
      <span
        className="text-xs font-semibold tracking-wider uppercase"
        style={{ color: 'oklch(0.52 0.07 10)', fontFamily: 'var(--font-body, sans-serif)' }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Section Container ─────────────────────────────────────────────────────────
function Section({
  icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: '1px solid oklch(0.90 0.02 10)',
        background: 'oklch(0.998 0.002 80)',
        boxShadow: '0 1px 3px oklch(0.65 0.08 10 / 0.06)',
      }}
    >
      <SectionHeader icon={icon} label={label} />
      <div className="px-4 py-4 space-y-4">{children}</div>
    </div>
  );
}

// ─── Toggle Button Group ───────────────────────────────────────────────────────
function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="transition-all duration-150 font-medium rounded-lg select-none"
            style={{
              padding: size === 'sm' ? '5px 12px' : '7px 16px',
              fontSize: size === 'sm' ? '0.78rem' : '0.85rem',
              border: active
                ? '1.5px solid oklch(0.60 0.08 10)'
                : '1.5px solid oklch(0.88 0.015 30)',
              background: active
                ? 'oklch(0.60 0.08 10)'
                : 'oklch(0.99 0.003 80)',
              color: active ? 'oklch(0.99 0 0)' : 'oklch(0.40 0.01 30)',
              boxShadow: active
                ? '0 2px 6px oklch(0.60 0.08 10 / 0.25)'
                : 'none',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Styled Switch Row ─────────────────────────────────────────────────────────
function SwitchRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  accentColor,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  accentColor?: string;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-lg px-3 py-3 transition-all duration-150"
      style={{
        background: checked
          ? accentColor
            ? `${accentColor} / 0.08`
            : 'oklch(0.60 0.08 10 / 0.06)'
          : 'transparent',
        border: checked
          ? '1px solid oklch(0.60 0.08 10 / 0.15)'
          : '1px solid transparent',
      }}
    >
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer" style={{ color: checked ? 'oklch(0.45 0.07 10)' : 'oklch(0.35 0.01 30)' }}>
          {label}
        </Label>
        {description && (
          <span className="text-xs" style={{ color: 'oklch(0.60 0.01 30)' }}>
            {description}
          </span>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

// ─── Field Label ───────────────────────────────────────────────────────────────
function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-xs font-semibold tracking-wide uppercase"
      style={{ color: 'oklch(0.55 0.04 10)' }}
    >
      {children}
    </Label>
  );
}

// ─── Error Message ─────────────────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs mt-1" style={{ color: 'oklch(0.55 0.18 25)' }}>{message}</p>;
}

// ─── Number Stepper ────────────────────────────────────────────────────────────
function NumberStepper({
  value,
  onChange,
  min = 0,
  id,
  placeholder,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  id?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-lg font-light transition-colors"
        style={{
          border: '1.5px solid oklch(0.88 0.015 30)',
          background: 'oklch(0.97 0.008 30)',
          color: 'oklch(0.40 0.01 30)',
        }}
      >
        −
      </button>
      <Input
        id={id}
        type="number"
        min={min}
        value={value || ''}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        placeholder={placeholder ?? '0'}
        className="text-center flex-1 h-9"
        style={{ fontSize: '0.95rem' }}
      />
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-lg font-light transition-colors"
        style={{
          border: '1.5px solid oklch(0.88 0.015 30)',
          background: 'oklch(0.97 0.008 30)',
          color: 'oklch(0.40 0.01 30)',
        }}
      >
        +
      </button>
    </div>
  );
}

// ─── Main Form ─────────────────────────────────────────────────────────────────
export function GuestForm({ guest, onSubmit, onCancel, isPending }: GuestFormProps) {
  const { members, wedding } = useWedding();
  const labels = EVENT_TYPE_LABELS[wedding.event_type || 'wedding'];
  const [formData, setFormData] = useState<GuestFormData>({
    name: guest?.name ?? '',
    side: guest?.side ?? (members[0]?.name || ''),
    group_name: guest?.group_name ?? '친구',
    relationship: guest?.relationship ?? '',
    phone: guest?.phone ?? '',
    gift_amount: guest?.gift_amount ?? 0,
    meal_tickets: guest?.meal_tickets ?? 0,
    attended: guest?.attended ?? false,
    memo: guest?.memo ?? '',
    payment_method: guest?.payment_method ?? 'cash',
    envelope_number: guest?.envelope_number ?? null,
    gift_received: guest?.gift_received ?? false,
    gift_returned: guest?.gift_returned ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateGuestForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    await onSubmit(formData);
  };

  const sideOptions = members.map((m) => ({ value: m.name, label: m.display_name }));
  const groupOptions = GROUP_NAMES.map((g) => ({ value: g, label: g }));
  const paymentOptions = [
    { value: 'cash' as const, label: '현금' },
    { value: 'transfer' as const, label: '계좌이체' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-2">

      {/* ── 기본 정보 ──────────────────────────────────────────────── */}
      <Section icon={User} label="기본 정보">
        {/* 이름 */}
        <div className="space-y-1.5">
          <FieldLabel htmlFor="name">이름 *</FieldLabel>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={`${labels.guest} 이름`}
            className="h-11 text-base"
          />
          <FieldError message={errors.name} />
        </div>

        {/* 소속 (Side) */}
        <div className="space-y-1.5">
          <FieldLabel>소속</FieldLabel>
          <ToggleGroup
            options={sideOptions}
            value={formData.side}
            onChange={(v) => setFormData({ ...formData, side: v })}
          />
        </div>

        {/* 그룹 */}
        <div className="space-y-1.5">
          <FieldLabel>그룹</FieldLabel>
          <ToggleGroup
            options={groupOptions}
            value={formData.group_name}
            onChange={(v) => setFormData({ ...formData, group_name: v as GroupName })}
            size="sm"
          />
        </div>

        {/* 관계 */}
        <div className="space-y-1.5">
          <FieldLabel htmlFor="relationship">관계</FieldLabel>
          <Input
            id="relationship"
            value={formData.relationship}
            onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            placeholder="예: 대학 동기, 사촌"
            className="h-11"
          />
        </div>
      </Section>

      {/* ── 축의금 정보 ────────────────────────────────────────────── */}
      <Section icon={Banknote} label={`${labels.gift} 정보`}>
        {/* 결제 수단 */}
        <div className="space-y-1.5">
          <FieldLabel>결제 수단</FieldLabel>
          <ToggleGroup
            options={paymentOptions}
            value={formData.payment_method}
            onChange={(v) => setFormData({ ...formData, payment_method: v })}
          />
        </div>

        {/* 축의금 입력 */}
        <div className="space-y-2">
          <FieldLabel htmlFor="gift_amount">{labels.gift}</FieldLabel>
          <div className="relative">
            <Input
              id="gift_amount"
              type="number"
              value={formData.gift_amount || ''}
              onChange={(e) =>
                setFormData({ ...formData, gift_amount: parseInt(e.target.value) || 0 })
              }
              placeholder="0"
              className="h-11 pr-8 text-base tabular-nums"
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
              style={{ color: 'oklch(0.60 0.01 30)' }}
            >
              원
            </span>
          </div>
          {/* Quick amount chips */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {COMMON_GIFT_AMOUNTS.map((amount) => {
              const active = formData.gift_amount === amount;
              return (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setFormData({ ...formData, gift_amount: amount })}
                  className="transition-all duration-150 rounded-lg font-medium"
                  style={{
                    padding: '6px 11px',
                    fontSize: '0.78rem',
                    border: active
                      ? '1.5px solid oklch(0.72 0.10 85)'
                      : '1.5px solid oklch(0.88 0.015 30)',
                    background: active
                      ? 'oklch(0.88 0.08 85)'
                      : 'oklch(0.97 0.005 80)',
                    color: active ? 'oklch(0.28 0.06 60)' : 'oklch(0.45 0.01 30)',
                    boxShadow: active ? '0 1px 4px oklch(0.72 0.10 85 / 0.3)' : 'none',
                  }}
                >
                  {formatKRW(amount)}
                </button>
              );
            })}
          </div>
          <FieldError message={errors.gift_amount} />
        </div>

        {/* 봉투 번호 */}
        <div className="space-y-1.5">
          <FieldLabel htmlFor="envelope_number">봉투 번호</FieldLabel>
          <Input
            id="envelope_number"
            type="number"
            min={1}
            value={formData.envelope_number ?? ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                envelope_number: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            placeholder="선택사항"
            className="h-11"
          />
        </div>

        {/* 봉투 수령 switch */}
        <SwitchRow
          id="gift_received"
          label="봉투 수령됨"
          description={`${labels.gift} 봉투를 수령했습니다`}
          checked={formData.gift_received}
          onCheckedChange={(checked) => setFormData({ ...formData, gift_received: checked })}
        />
      </Section>

      {/* ── 참석 정보 ──────────────────────────────────────────────── */}
      <Section icon={CalendarCheck} label="참석 정보">
        {/* 참석 여부 switch */}
        <SwitchRow
          id="attended"
          label="참석 여부"
          description={`${labels.event}에 직접 참석했습니다`}
          checked={formData.attended}
          onCheckedChange={(checked) => setFormData({ ...formData, attended: checked })}
        />

        {/* 식권 수 */}
        {wedding.event_type !== 'condolence' && (
          <div className="space-y-1.5">
            <FieldLabel htmlFor="meal_tickets">식권 수</FieldLabel>
            <NumberStepper
              id="meal_tickets"
              value={formData.meal_tickets}
              onChange={(v) => setFormData({ ...formData, meal_tickets: v })}
              min={0}
            />
          </div>
        )}
      </Section>

      {/* ── 기타 ──────────────────────────────────────────────────── */}
      <Section icon={FileText} label="기타">
        {/* 연락처 */}
        <div className="space-y-1.5">
          <FieldLabel htmlFor="phone">연락처</FieldLabel>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="010-0000-0000"
            className="h-11"
            inputMode="tel"
          />
          <FieldError message={errors.phone} />
        </div>

        {/* 답례품 발송 switch */}
        <SwitchRow
          id="gift_returned"
          label="답례품 발송됨"
          description="감사 답례품을 발송했습니다"
          checked={formData.gift_returned}
          onCheckedChange={(checked) => setFormData({ ...formData, gift_returned: checked })}
        />

        {/* 메모 */}
        <div className="space-y-1.5">
          <FieldLabel htmlFor="memo">메모</FieldLabel>
          <Textarea
            id="memo"
            value={formData.memo}
            onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            placeholder="메모 (선택사항)"
            rows={3}
            className="resize-none text-sm"
          />
        </div>
      </Section>

      {/* ── Submit ─────────────────────────────────────────────────── */}
      <div className="flex gap-2.5 pt-1">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-12 text-sm font-medium"
            style={{
              border: '1.5px solid oklch(0.88 0.015 30)',
              color: 'oklch(0.45 0.02 30)',
            }}
          >
            취소
          </Button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 h-12 rounded-xl font-semibold text-sm transition-all duration-150 disabled:opacity-60"
          style={{
            background: isPending
              ? 'oklch(0.75 0.05 10)'
              : 'oklch(0.60 0.08 10)',
            color: 'oklch(0.99 0 0)',
            boxShadow: isPending
              ? 'none'
              : '0 3px 10px oklch(0.60 0.08 10 / 0.35)',
            letterSpacing: '0.02em',
          }}
        >
          {isPending ? '저장 중...' : guest ? '수정하기' : '등록하기'}
        </button>
      </div>
    </form>
  );
}
