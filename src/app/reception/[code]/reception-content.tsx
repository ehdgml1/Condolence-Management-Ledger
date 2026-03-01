'use client';

import { useState, useRef, useTransition } from 'react';
import { addReceptionGuest, getReceptionCount } from '@/actions/reception';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import type { EventType, GroupName } from '@/lib/types';

interface ReceptionContentProps {
  wedding: {
    id: string;
    bride_name: string | null;
    groom_name: string;
    wedding_date: string | null;
    share_code: string;
    event_type: EventType;
  };
  code: string;
  members?: { name: string; display_name: string }[];
}

const GROUPS: GroupName[] = ['가족', '친척', '친구', '직장', '기타'];

const GROUP_COLORS: Record<GroupName, string> = {
  가족: 'bg-rose-100 text-rose-700 border-rose-200',
  친척: 'bg-orange-100 text-orange-700 border-orange-200',
  친구: 'bg-blue-100 text-blue-700 border-blue-200',
  직장: 'bg-purple-100 text-purple-700 border-purple-200',
  기타: 'bg-gray-100 text-gray-600 border-gray-200',
};

const GROUP_COLORS_ACTIVE: Record<GroupName, string> = {
  가족: 'bg-rose-500 text-white border-rose-500',
  친척: 'bg-orange-500 text-white border-orange-500',
  친구: 'bg-blue-500 text-white border-blue-500',
  직장: 'bg-purple-500 text-white border-purple-500',
  기타: 'bg-gray-500 text-white border-gray-500',
};

export function ReceptionContent({ wedding, code, members }: ReceptionContentProps) {
  const labels = EVENT_TYPE_LABELS[wedding.event_type || 'wedding'];
  const bgGradient = wedding.event_type === 'condolence' ? 'bg-formal-gradient' : 'bg-romantic-gradient';

  const sideOptions = members && members.length > 0 ? members : [];

  // PIN gate: last 4 chars of share_code
  const correctPin = code.slice(-4).toUpperCase();
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  // Entry form state
  const [name, setName] = useState('');
  const [side, setSide] = useState<string>(sideOptions[0]?.name || '');
  const [group, setGroup] = useState<GroupName>('친구');
  const [totalCount, setTotalCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });
  const [isPending, startTransition] = useTransition();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePinSubmit = () => {
    if (pinInput.toUpperCase() === correctPin) {
      setUnlocked(true);
      // Load initial count
      startTransition(async () => {
        const count = await getReceptionCount(wedding.id);
        setTotalCount(count);
      });
    } else {
      setPinError(true);
      setPinInput('');
      setTimeout(() => setPinError(false), 1500);
    }
  };

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, visible: true });
    toastTimerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2000);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      nameInputRef.current?.focus();
      return;
    }
    startTransition(async () => {
      const result = await addReceptionGuest(wedding.id, {
        name: name.trim(),
        side,
        group_name: group,
        envelope_number: totalCount + 1,
      }, pinInput);
      if (result.error) {
        showToast('등록에 실패했습니다. 다시 시도해 주세요.');
        return;
      }
      const newTotal = totalCount + 1;
      const newSession = sessionCount + 1;
      setTotalCount(newTotal);
      setSessionCount(newSession);
      setName('');
      showToast(`${result.data?.name}님 접수 완료!`);
      nameInputRef.current?.focus();
    });
  };

  // PIN screen
  if (!unlocked) {
    return (
      <div className={`min-h-screen ${bgGradient} flex items-center justify-center p-4`}>
        <div className="bg-card rounded-2xl shadow-lg p-8 text-center max-w-xs w-full">
          <div className="font-heading text-xl font-semibold mb-1">
            {wedding.bride_name
              ? `${wedding.groom_name} & ${wedding.bride_name}`
              : wedding.groom_name}
          </div>
          <p className="text-sm text-muted-foreground mb-6">접수 데스크</p>

          <p className="text-sm font-medium mb-3">PIN 4자리 입력</p>
          <input
            type="text"
            inputMode="text"
            maxLength={4}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
            placeholder="- - - -"
            className={[
              'w-full text-center text-2xl tracking-[0.5em] font-mono border-2 rounded-xl py-3 px-4 outline-none transition-colors',
              pinError
                ? 'border-destructive bg-destructive/5 text-destructive'
                : 'border-input focus:border-primary',
            ].join(' ')}
            autoFocus
          />
          {pinError && (
            <p className="text-xs text-destructive mt-2">PIN이 올바르지 않습니다</p>
          )}
          <button
            onClick={handlePinSubmit}
            className="mt-4 w-full bg-primary text-primary-foreground rounded-xl py-3 text-base font-medium active:opacity-80 transition-opacity"
          >
            확인
          </button>
          <p className="text-xs text-muted-foreground mt-4">
            링크를 공유한 분께 PIN을 받으세요
          </p>
        </div>
      </div>
    );
  }

  // Entry form
  return (
    <div className={`min-h-screen ${bgGradient} flex flex-col`}>
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-heading font-semibold text-base leading-tight">
            {wedding.bride_name
              ? `${wedding.groom_name} & ${wedding.bride_name}`
              : wedding.groom_name}
          </p>
          <p className="text-xs text-muted-foreground">접수 데스크</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary">{totalCount}명</p>
          <p className="text-xs text-muted-foreground">누적 접수</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col gap-4 p-4 max-w-lg mx-auto w-full">
        {/* Counter badge */}
        <div className="bg-card rounded-xl px-4 py-2.5 flex items-center justify-between shadow-sm">
          <span className="text-sm text-muted-foreground">이번 접수</span>
          <span className="font-semibold text-base">
            #{totalCount + 1}
            {sessionCount > 0 && (
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                (이 기기: {sessionCount}명)
              </span>
            )}
          </span>
        </div>

        {/* Name input */}
        <div className="bg-card rounded-2xl shadow-sm p-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
            성함
          </label>
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="홍길동"
            className="w-full text-lg border-b-2 border-input focus:border-primary outline-none bg-transparent py-1 transition-colors placeholder:text-muted-foreground/40"
            autoFocus
          />
        </div>

        {/* Side toggle */}
        <div className="bg-card rounded-2xl shadow-sm p-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
            구분
          </label>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${sideOptions.length}, 1fr)` }}>
            {sideOptions.map((m) => (
              <button
                key={m.name}
                onClick={() => setSide(m.name)}
                className={[
                  'py-3.5 rounded-xl text-base font-semibold border-2 transition-colors active:scale-95',
                  side === m.name
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-input',
                ].join(' ')}
              >
                {m.display_name}측
              </button>
            ))}
          </div>
        </div>

        {/* Group badges */}
        <div className="bg-card rounded-2xl shadow-sm p-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
            관계
          </label>
          <div className="flex flex-wrap gap-2">
            {GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={[
                  'px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors active:scale-95',
                  group === g ? GROUP_COLORS_ACTIVE[g] : GROUP_COLORS[g],
                ].join(' ')}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={isPending || !name.trim()}
          className="bg-primary text-primary-foreground rounded-2xl py-4 text-lg font-semibold shadow-md active:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {isPending ? '등록 중...' : `${labels.guest} 등록`}
        </button>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground pb-6">
          금액은 나중에 앱에서 입력하세요
        </p>
      </div>

      {/* Toast notification */}
      <div
        className={[
          'fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-3 rounded-full text-sm font-medium shadow-lg transition-all duration-300 whitespace-nowrap',
          toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
        ].join(' ')}
      >
        {toast.message}
      </div>
    </div>
  );
}
