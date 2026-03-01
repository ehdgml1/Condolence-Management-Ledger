'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { formatKRW } from '@/lib/utils';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import type { Guest, EventType } from '@/lib/types';

interface DistributionStatsProps {
  guests: Guest[];
  eventType?: EventType;
}

const BUCKETS = [
  { label: '3만원 이하', sublabel: '～30,000', min: 0, max: 30000 },
  { label: '5만원', sublabel: '50,000', min: 30001, max: 50000 },
  { label: '7～10만원', sublabel: '70,000～100,000', min: 50001, max: 100000 },
  { label: '15～20만원', sublabel: '150,000～200,000', min: 100001, max: 200000 },
  { label: '30만원 이상', sublabel: '300,000+', min: 200001, max: Infinity },
];

// Pastel gradient per bucket, warm → cool
const BUCKET_GRADIENTS = [
  'linear-gradient(90deg, oklch(0.80 0.06 55), oklch(0.84 0.05 60))',
  'linear-gradient(90deg, oklch(0.72 0.09 85), oklch(0.78 0.08 90))',
  'linear-gradient(90deg, oklch(0.70 0.09 10), oklch(0.76 0.08 15))',
  'linear-gradient(90deg, oklch(0.68 0.09 145), oklch(0.74 0.08 155))',
  'linear-gradient(90deg, oklch(0.68 0.09 290), oklch(0.74 0.07 295))',
];

const BUCKET_BG = [
  'oklch(0.96 0.025 55)',
  'oklch(0.96 0.025 85)',
  'oklch(0.96 0.020 10)',
  'oklch(0.96 0.020 145)',
  'oklch(0.96 0.020 290)',
];

const BUCKET_TEXT = [
  'oklch(0.52 0.09 55)',
  'oklch(0.48 0.10 85)',
  'oklch(0.52 0.09 10)',
  'oklch(0.42 0.09 145)',
  'oklch(0.46 0.09 290)',
];

export function DistributionStats({ guests, eventType }: DistributionStatsProps) {
  const labels = EVENT_TYPE_LABELS[eventType || 'wedding'];
  const giftGuests = guests.filter((g) => g.gift_amount > 0);
  if (giftGuests.length === 0) return null;

  const amounts = giftGuests.map((g) => g.gift_amount).sort((a, b) => a - b);
  const median =
    amounts.length % 2 === 0
      ? (amounts[amounts.length / 2 - 1] + amounts[amounts.length / 2]) / 2
      : amounts[Math.floor(amounts.length / 2)];
  const max = amounts[amounts.length - 1];
  const min = amounts[0];

  const distribution = BUCKETS.map((bucket) => ({
    ...bucket,
    count: giftGuests.filter(
      (g) => g.gift_amount >= bucket.min && g.gift_amount <= bucket.max
    ).length,
  }));

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);
  const modeIdx = distribution.findIndex((d) => d.count === maxCount);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--stats-surface)',
        boxShadow: 'var(--stats-shadow)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={14} style={{ color: 'var(--stats-icon)' }} />
          <span
            className="font-heading text-sm font-semibold tracking-wide"
            style={{ color: 'var(--stats-heading)' }}
          >
            {labels.gift} 분포
          </span>
        </div>

        {/* Min / Median / Max pills */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '최소', value: min },
            { label: '중간값', value: median },
            { label: '최대', value: max },
          ].map(({ label, value }, i) => (
            <motion.div
              key={label}
              className="rounded-xl px-3 py-2.5 text-center"
              style={{
                background: i === 1
                  ? 'linear-gradient(135deg, oklch(0.97 0.02 10), oklch(0.97 0.02 145))'
                  : 'oklch(0.97 0.01 30)',
                border: i === 1 ? '1px solid oklch(0.91 0.03 10)' : '1px solid oklch(0.93 0.01 30)',
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 + i * 0.07 }}
            >
              <p className="text-xs mb-0.5" style={{ color: 'var(--stats-sublabel)' }}>
                {label}
              </p>
              <p
                className="font-heading font-bold text-xs"
                style={{ color: i === 1 ? 'oklch(0.40 0.08 10)' : 'oklch(0.30 0.04 30)' }}
              >
                {formatKRW(value)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bars */}
      <div className="px-5 pb-5 space-y-3">
        {distribution.map((bucket, i) => {
          const isMode = i === modeIdx && bucket.count > 0;
          const widthPct = maxCount > 0 ? (bucket.count / maxCount) * 100 : 0;
          const pct = giftGuests.length > 0
            ? Math.round((bucket.count / giftGuests.length) * 100)
            : 0;

          return (
            <motion.div
              key={bucket.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.25 + i * 0.07 }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-medium shrink-0" style={{ color: 'oklch(0.40 0.03 30)' }}>
                    {bucket.label}
                  </span>
                  {isMode && (
                    <span
                      className="text-xs rounded-full px-1.5 py-0.5 font-semibold shrink-0"
                      style={{
                        background: 'oklch(0.95 0.04 10)',
                        color: 'oklch(0.52 0.08 10)',
                      }}
                    >
                      최다 ✦
                    </span>
                  )}
                </div>
                <span className="text-xs tabular-nums shrink-0" style={{ color: 'oklch(0.55 0.02 30)' }}>
                  {bucket.count}명 · {pct}%
                </span>
              </div>

              <div
                className="relative h-8 rounded-xl overflow-hidden"
                style={{ background: BUCKET_BG[i] }}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-xl"
                  style={{
                    background: BUCKET_GRADIENTS[i],
                    boxShadow: isMode ? `0 0 12px ${BUCKET_BG[i]}` : 'none',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: bucket.count > 0 ? `${widthPct}%` : 0 }}
                  transition={{ duration: 0.75, ease: [0.34, 1.2, 0.64, 1], delay: 0.3 + i * 0.07 }}
                />
                {bucket.count > 0 && widthPct > 35 && (
                  <div className="absolute inset-0 flex items-center px-3">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: 'oklch(0.98 0 0 / 0.92)' }}
                    >
                      {bucket.count}명
                    </span>
                  </div>
                )}
                {/* Subtle glow ring for mode */}
                {isMode && (
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 0 1.5px ${BUCKET_TEXT[i]}40`,
                    }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
