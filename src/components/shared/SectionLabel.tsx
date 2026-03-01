'use client';

import { motion } from 'framer-motion';

interface SectionLabelProps {
  children: React.ReactNode;
  delay?: number;
}

export function SectionLabel({ children, delay }: SectionLabelProps) {
  if (delay !== undefined) {
    return (
      <motion.p
        className="text-xs font-semibold uppercase tracking-widest mb-2 pl-1"
        style={{ color: 'var(--stats-icon)', letterSpacing: '0.08em' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay }}
      >
        {children}
      </motion.p>
    );
  }

  return (
    <p
      className="text-xs font-semibold uppercase tracking-widest mb-2 pl-1"
      style={{ color: 'var(--stats-icon)', letterSpacing: '0.08em' }}
    >
      {children}
    </p>
  );
}
