'use client';

import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  gradient: string;
  iconColor: string;
  delay?: number;
}

export function StatCard({ icon: Icon, label, value, sub, gradient, iconColor, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden px-4 pt-4 pb-4 flex flex-col gap-2"
      style={{
        background: gradient,
        boxShadow: 'var(--stats-shadow)',
      }}
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.34, 1.3, 0.64, 1] }}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: 'oklch(0.99 0 0 / 0.7)' }}
        >
          <Icon size={15} style={{ color: iconColor }} />
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--stats-label)' }}>
          {label}
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-heading font-bold text-lg leading-tight truncate" style={{ color: 'var(--stats-value)' }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--stats-sublabel)' }}>
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  );
}
