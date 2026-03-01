'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { formatKRW } from '@/lib/utils';
import type { WeddingStats, GroupName } from '@/lib/types';

interface GroupChartProps {
  stats: WeddingStats;
}

const GROUP_ORDER: GroupName[] = ['가족', '친척', '친구', '직장', '기타'];

const GROUP_OKLCH: Record<GroupName, { bar: string; bg: string; text: string; badge: string }> = {
  가족: {
    bar: 'linear-gradient(90deg, oklch(0.68 0.10 10), oklch(0.75 0.08 15))',
    bg: 'oklch(0.97 0.02 10)',
    text: 'oklch(0.55 0.08 10)',
    badge: 'oklch(0.93 0.04 10)',
  },
  친척: {
    bar: 'linear-gradient(90deg, oklch(0.68 0.10 145), oklch(0.74 0.08 155))',
    bg: 'oklch(0.97 0.02 145)',
    text: 'oklch(0.48 0.08 145)',
    badge: 'oklch(0.93 0.04 145)',
  },
  친구: {
    bar: 'linear-gradient(90deg, oklch(0.72 0.12 85), oklch(0.78 0.10 90))',
    bg: 'oklch(0.97 0.02 85)',
    text: 'oklch(0.55 0.10 85)',
    badge: 'oklch(0.93 0.05 85)',
  },
  직장: {
    bar: 'linear-gradient(90deg, oklch(0.68 0.10 290), oklch(0.74 0.08 295))',
    bg: 'oklch(0.97 0.02 290)',
    text: 'oklch(0.50 0.08 290)',
    badge: 'oklch(0.93 0.04 290)',
  },
  기타: {
    bar: 'linear-gradient(90deg, oklch(0.70 0.10 55), oklch(0.76 0.08 60))',
    bg: 'oklch(0.97 0.02 55)',
    text: 'oklch(0.52 0.08 55)',
    badge: 'oklch(0.93 0.04 55)',
  },
};

export function GroupChart({ stats }: GroupChartProps) {
  const data = GROUP_ORDER.map((group) => ({
    name: group,
    total: stats.byGroup[group]?.total || 0,
    count: stats.byGroup[group]?.count || 0,
    average: stats.byGroup[group]?.average || 0,
  })).filter((d) => d.count > 0);

  if (data.length === 0) return null;

  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const overallAvg = stats.averageGift;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'oklch(0.995 0.003 80)',
        boxShadow: '0 2px 24px oklch(0.65 0.08 10 / 0.08), 0 1px 4px oklch(0.65 0.08 10 / 0.06)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={14} style={{ color: 'oklch(0.65 0.08 10)' }} />
          <span
            className="font-heading text-sm font-semibold tracking-wide"
            style={{ color: 'oklch(0.35 0.04 10)' }}
          >
            관계별 평균 인사이트
          </span>
        </div>
        <span
          className="text-xs rounded-full px-2.5 py-0.5 font-medium"
          style={{ background: 'oklch(0.94 0.03 10)', color: 'oklch(0.55 0.08 10)' }}
        >
          전체 평균 {formatKRW(overallAvg)}
        </span>
      </div>

      {/* Bars */}
      <div className="px-5 pb-5 space-y-4">
        {data.map((entry, i) => {
          const colors = GROUP_OKLCH[entry.name as GroupName];
          const widthPct = (entry.total / maxTotal) * 100;
          const diffPct = overallAvg > 0
            ? Math.round(((entry.average - overallAvg) / overallAvg) * 100)
            : 0;
          const isAbove = diffPct > 0;

          return (
            <motion.div
              key={entry.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.08 }}
            >
              {/* Row header */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0 shrink-0">
                  <span
                    className="inline-flex items-center justify-center w-14 rounded-lg py-0.5 text-xs font-semibold font-heading shrink-0"
                    style={{ background: colors.badge, color: colors.text }}
                  >
                    {entry.name}
                  </span>
                  <span className="text-xs shrink-0" style={{ color: 'oklch(0.55 0.02 30)' }}>
                    {entry.count}명
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end min-w-0">
                  <span className="text-xs font-semibold tabular-nums" style={{ color: 'oklch(0.30 0.04 30)' }}>
                    평균 {formatKRW(entry.average)}
                  </span>
                  {overallAvg > 0 && Math.abs(diffPct) >= 1 && (
                    <span
                      className="text-xs rounded-full px-1.5 py-0.5 font-medium tabular-nums shrink-0"
                      style={{
                        background: isAbove ? 'oklch(0.94 0.04 145)' : 'oklch(0.95 0.03 10)',
                        color: isAbove ? 'oklch(0.42 0.10 145)' : 'oklch(0.52 0.08 10)',
                      }}
                    >
                      {isAbove ? '+' : ''}{diffPct}%
                    </span>
                  )}
                </div>
              </div>

              {/* Bar track + optional outside label */}
              <div className="flex items-center gap-2">
                <div
                  className="relative h-7 rounded-xl overflow-hidden flex-1 min-w-0"
                  style={{ background: colors.bg }}
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-xl"
                    style={{ background: colors.bar }}
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.7, ease: [0.34, 1.2, 0.64, 1], delay: 0.2 + i * 0.08 }}
                  />
                  {/* Total label inside bar — only when bar is wide enough */}
                  {widthPct > 45 && (
                    <div className="absolute inset-0 flex items-center px-3">
                      <span
                        className="text-xs font-medium truncate"
                        style={{ color: 'oklch(0.98 0 0 / 0.9)' }}
                      >
                        {formatKRW(entry.total)}
                      </span>
                    </div>
                  )}
                </div>
                {/* Total label outside bar when bar is narrow */}
                {widthPct <= 45 && (
                  <span
                    className="text-xs font-medium tabular-nums shrink-0"
                    style={{ color: colors.text }}
                  >
                    {formatKRW(entry.total)}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
