'use client';

import { motion } from 'framer-motion';
import { Heart, Bookmark, Users, Banknote } from 'lucide-react';
import { formatKRW } from '@/lib/utils';
import { getSideColors, EVENT_TYPE_LABELS } from '@/lib/constants';
import type { WeddingStats, EventType } from '@/lib/types';

interface SideChartProps {
  stats: WeddingStats;
  members: { name: string; display_name: string }[];
  eventType?: EventType;
}

export function SideChart({ stats, members, eventType }: SideChartProps) {
  const labels = EVENT_TYPE_LABELS[eventType || 'wedding'];

  if (members.length === 0) return null;

  const total = members.reduce((sum, m) => sum + (stats.bySide[m.name]?.total || 0), 0);

  const memberData = members.map((m, i) => {
    const side = stats.bySide[m.name] || { count: 0, total: 0, average: 0 };
    const pct = total > 0 ? (side.total / total) * 100 : 100 / members.length;
    const sideColors = getSideColors(eventType || 'wedding');
    return { ...m, ...side, pct, color: sideColors[i % sideColors.length] };
  });

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
        {eventType === 'condolence'
          ? <Bookmark size={14} className="fill-current" style={{ color: 'var(--stats-icon)' }} />
          : <Heart size={14} className="fill-current" style={{ color: 'var(--stats-icon)' }} />}
        <span
          className="font-heading text-sm font-semibold tracking-wide"
          style={{ color: 'var(--stats-heading)' }}
        >
          {members.length === 2
            ? `${members[0].display_name}측 ${eventType === 'condolence' ? '·' : 'vs'} ${members[1].display_name}측`
            : '멤버별 비교'}
        </span>
      </div>

      {/* Split bar */}
      <div className="px-5 pb-4">
        <div className="relative h-3 rounded-full overflow-hidden flex" style={{ background: 'var(--groom-bg)' }}>
          {memberData.map((m, i) => (
            <motion.div
              key={m.name}
              className={`h-full ${i === 0 ? 'rounded-l-full' : ''} ${i === memberData.length - 1 ? 'rounded-r-full' : ''}`}
              style={{ background: m.color }}
              initial={{ width: 0 }}
              animate={{ width: `${m.pct}%` }}
              transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 + i * 0.1 }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {memberData.map((m) => (
            <span key={m.name} className="text-xs" style={{ color: m.color }}>
              {m.pct.toFixed(0)}%
            </span>
          ))}
        </div>
      </div>

      {/* Member stats grid */}
      <div
        className="grid gap-0 pb-5"
        style={{ gridTemplateColumns: memberData.map(() => 'minmax(0,1fr)').join(' auto ') }}
      >
        {memberData.map((m, i) => (
          <div key={m.name} className="contents">
            <motion.div
              className="flex flex-col items-center gap-3 px-4"
              initial={{ opacity: 0, x: i === 0 ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 + i * 0.05 }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-heading font-bold"
                style={{
                  background: `${m.color}22`,
                  color: m.color,
                }}
              >
                {m.display_name[0]}
              </div>
              <div className="text-center min-w-0 w-full">
                <p className="font-heading font-bold text-xs mb-0.5 truncate" style={{ color: m.color }}>
                  {m.display_name}측
                </p>
                <p
                  className="font-heading font-bold text-sm leading-tight truncate"
                  style={{ color: 'var(--stats-value)' }}
                >
                  {formatKRW(m.total)}
                </p>
              </div>
              <div className="w-full space-y-1.5 min-w-0">
                <div
                  className="rounded-xl px-3 py-1.5 flex items-center justify-between gap-1 min-w-0"
                  style={{ background: `${m.color}11` }}
                >
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Users size={11} style={{ color: m.color }} />
                    <span className="text-xs" style={{ color: 'var(--stats-label)' }}>{labels.guest}</span>
                  </div>
                  <span className="text-xs font-semibold tabular-nums truncate" style={{ color: 'var(--stats-heading)' }}>
                    {m.count}명
                  </span>
                </div>
                <div
                  className="rounded-xl px-3 py-1.5 flex items-center justify-between gap-1 min-w-0"
                  style={{ background: `${m.color}11` }}
                >
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Banknote size={11} style={{ color: m.color }} />
                    <span className="text-xs" style={{ color: 'var(--stats-label)' }}>평균</span>
                  </div>
                  <span className="text-xs font-semibold tabular-nums truncate" style={{ color: 'var(--stats-heading)' }}>
                    {formatKRW(m.average)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Divider between members */}
            {i < memberData.length - 1 && (
              <div className="flex flex-col items-center justify-center gap-1 py-2">
                <div className="w-px flex-1" style={{ background: 'var(--border)' }} />
                {eventType === 'condolence'
                ? <Bookmark size={12} className="fill-current" style={{ color: m.color }} />
                : <Heart size={12} className="fill-current" style={{ color: m.color }} />}
                <div className="w-px flex-1" style={{ background: 'var(--border)' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Combined total */}
      <motion.div
        className="mx-4 mb-4 rounded-xl px-4 py-3 flex items-center justify-between"
        style={{
          background: eventType === 'condolence'
            ? 'linear-gradient(135deg, oklch(0.97 0.015 250) 0%, oklch(0.98 0.01 220) 50%, oklch(0.97 0.015 200) 100%)'
            : 'linear-gradient(135deg, oklch(0.97 0.02 10) 0%, oklch(0.98 0.015 80) 50%, oklch(0.97 0.02 145) 100%)',
          border: '1px solid var(--border)',
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.55 }}
      >
        <span className="text-xs font-medium" style={{ color: 'var(--stats-label)' }}>
          {`합산 총 ${labels.gift}`}
        </span>
        <span className="font-heading font-bold text-sm" style={{ color: 'var(--stats-value)' }}>
          {formatKRW(total)}
        </span>
      </motion.div>
    </div>
  );
}
