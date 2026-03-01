'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { formatKRW, formatNumber } from '@/lib/utils';
import type { WeddingStats, GroupName } from '@/lib/types';

interface GroupBreakdownCardProps {
  stats: WeddingStats;
  /** Card title displayed in the header */
  title?: string;
  /** Show overall average badge and per-row diff percentage badges */
  showInsights?: boolean;
  /** Whether to wrap root in a motion.div with entrance animation */
  animated?: boolean;
  /** Base delay for staggered animations (default 0.1) */
  baseDelay?: number;
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

export function GroupBreakdownCard({
  stats,
  title = '관계별 분석',
  showInsights = false,
  animated = false,
  baseDelay = 0.1,
}: GroupBreakdownCardProps) {
  const data = GROUP_ORDER.map((group) => ({
    name: group,
    total: stats.byGroup[group]?.total || 0,
    count: stats.byGroup[group]?.count || 0,
    average: stats.byGroup[group]?.average || 0,
  })).filter((d) => d.count > 0);

  if (data.length === 0) return null;

  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const overallAvg = stats.averageGift;
  const barHeight = showInsights ? 'h-7' : 'h-6';
  const badgeWidth = showInsights ? 'w-14' : 'w-12';

  const content = (
    <>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={14} style={{ color: 'var(--stats-icon)' }} />
          <span className="font-heading text-sm font-semibold tracking-wide" style={{ color: 'var(--stats-heading)' }}>
            {title}
          </span>
        </div>
        {showInsights && overallAvg > 0 && (
          <span
            className="text-xs rounded-full px-2.5 py-0.5 font-medium"
            style={{ background: 'oklch(0.94 0.03 10)', color: 'oklch(0.55 0.08 10)' }}
          >
            전체 평균 {formatKRW(overallAvg)}
          </span>
        )}
      </div>

      {/* Bars */}
      <div className="px-5 pb-5 space-y-3.5">
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
              transition={{ duration: 0.45, delay: baseDelay + i * 0.08 }}
            >
              {/* Row header */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center ${badgeWidth} rounded-lg py-0.5 text-xs font-semibold font-heading`}
                    style={{ background: colors.badge, color: colors.text }}
                  >
                    {entry.name}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--stats-label)' }}>
                    {formatNumber(entry.count)}명
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end min-w-0">
                  <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--stats-value)' }}>
                    평균 {formatKRW(entry.average)}
                  </span>
                  {showInsights && overallAvg > 0 && Math.abs(diffPct) >= 1 && (
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
                  className={`relative ${barHeight} rounded-xl overflow-hidden flex-1 min-w-0`}
                  style={{ background: colors.bg }}
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-xl"
                    style={{ background: colors.bar }}
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ duration: 0.7, ease: [0.34, 1.2, 0.64, 1], delay: baseDelay + 0.1 + i * 0.08 }}
                  />
                  {widthPct > 45 && (
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="text-xs font-medium truncate" style={{ color: 'oklch(0.98 0 0 / 0.9)' }}>
                        {formatKRW(entry.total)}
                      </span>
                    </div>
                  )}
                </div>
                {widthPct <= 45 && (
                  <span className="text-xs font-medium tabular-nums shrink-0" style={{ color: colors.text }}>
                    {formatKRW(entry.total)}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );

  const cardStyle = {
    background: 'var(--stats-surface)',
    boxShadow: 'var(--stats-shadow)',
  };

  if (animated) {
    return (
      <motion.div
        className="rounded-2xl overflow-hidden"
        style={cardStyle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: baseDelay - 0.05 }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={cardStyle}>
      {content}
    </div>
  );
}
