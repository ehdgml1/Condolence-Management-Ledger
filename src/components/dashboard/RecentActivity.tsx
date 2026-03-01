'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { formatKRW, formatKoreanDateShort } from '@/lib/utils';
import type { Guest } from '@/lib/types';

interface RecentActivityProps {
  guests: Guest[];
}

const GROUP_COLORS: Record<string, { bg: string; text: string }> = {
  가족: { bg: 'oklch(0.93 0.04 10)', text: 'oklch(0.55 0.08 10)' },
  친척: { bg: 'oklch(0.93 0.04 145)', text: 'oklch(0.48 0.08 145)' },
  친구: { bg: 'oklch(0.93 0.05 85)', text: 'oklch(0.55 0.10 85)' },
  직장: { bg: 'oklch(0.93 0.04 290)', text: 'oklch(0.50 0.08 290)' },
  기타: { bg: 'oklch(0.93 0.04 55)', text: 'oklch(0.52 0.08 55)' },
};

function computeTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return formatKoreanDateShort(dateStr);
}

function useTimeAgo(dates: string[]): Record<string, string> {
  const [timeAgos, setTimeAgos] = useState<Record<string, string>>(() => {
    const result: Record<string, string> = {};
    for (const d of dates) {
      result[d] = formatKoreanDateShort(d);
    }
    return result;
  });

  useEffect(() => {
    const update = () => {
      const result: Record<string, string> = {};
      for (const d of dates) {
        result[d] = computeTimeAgo(d);
      }
      setTimeAgos(result);
    };
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [dates.join(',')]);

  return timeAgos;
}

export function RecentActivity({ guests }: RecentActivityProps) {
  const recent = [...guests]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Build stable side-to-index mapping: first unique side = 0, second = 1, etc.
  const sideOrder: Record<string, number> = {};
  let sideCounter = 0;
  for (const g of recent) {
    if (!(g.side in sideOrder)) {
      sideOrder[g.side] = sideCounter++;
    }
  }

  const timeAgos = useTimeAgo(recent.map(g => g.created_at));

  if (recent.length === 0) return null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--stats-surface)',
        boxShadow: 'var(--stats-shadow)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-2">
        <Clock size={14} style={{ color: 'var(--stats-icon)' }} />
        <span className="font-heading text-sm font-semibold tracking-wide" style={{ color: 'var(--stats-heading)' }}>
          최근 등록
        </span>
      </div>

      {/* Activity list */}
      <div className="px-5 pb-5">
        {recent.map((guest, i) => {
          const isFirstSide = (sideOrder[guest.side] ?? 0) === 0;
          const groupColor = GROUP_COLORS[guest.group_name] || GROUP_COLORS['기타'];

          return (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.05 }}
            >
              {i > 0 && (
                <div className="h-px mx-1" style={{ background: 'var(--border)', opacity: 0.5 }} />
              )}
              <div className="flex items-center gap-3 py-3">
                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-heading font-bold shrink-0"
                  style={{
                    background: isFirstSide
                      ? 'linear-gradient(135deg, var(--groom-light), var(--groom-bg))'
                      : 'linear-gradient(135deg, var(--bride-light), var(--bride-bg))',
                    color: isFirstSide ? 'var(--groom-text)' : 'var(--bride-text)',
                  }}
                >
                  {guest.name[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--stats-value)' }}>
                      {guest.name}
                    </span>
                    <span
                      className="text-[10px] rounded-md px-1.5 py-0.5 font-medium shrink-0"
                      style={{ background: groupColor.bg, color: groupColor.text }}
                    >
                      {guest.group_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs" style={{ color: 'var(--stats-sublabel)' }}>
                      {guest.side}측
                    </span>
                    <span className="text-xs" style={{ color: 'var(--stats-sublabel)' }}>·</span>
                    <span className="text-xs" style={{ color: 'var(--stats-sublabel)' }}>
                      {timeAgos[guest.created_at] || formatKoreanDateShort(guest.created_at)}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <span
                  className="font-heading font-bold text-sm tabular-nums shrink-0"
                  style={{ color: 'var(--stats-value)' }}
                >
                  {guest.gift_amount > 0 ? formatKRW(guest.gift_amount) : '—'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
