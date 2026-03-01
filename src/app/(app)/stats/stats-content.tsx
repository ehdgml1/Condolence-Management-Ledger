'use client';

import { motion } from 'framer-motion';
import { Heart, Users, Banknote, TrendingUp, BarChart3, Bookmark } from 'lucide-react';
import { SideComparisonCard } from '@/components/shared/SideComparisonCard';
import { GroupBreakdownCard } from '@/components/shared/GroupBreakdownCard';
import { SectionLabel } from '@/components/shared/SectionLabel';
import { DistributionStats } from '@/components/stats/DistributionStats';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatKRW } from '@/lib/utils';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import type { Wedding, WeddingStats, Guest, GroupName, EventMember } from '@/lib/types';

interface StatsPageContentProps {
  wedding: Wedding;
  stats: WeddingStats;
  guests: Guest[];
  members: EventMember[];
}

// ── Hero summary card ───────────────────────────────────────────────────────
interface HeroCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  gradient: string;
  delay: number;
}

function HeroCard({ icon, label, value, sub, gradient, delay }: HeroCardProps) {
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
          className="flex items-center justify-center w-7 h-7 rounded-lg"
          style={{ background: 'oklch(0.99 0 0 / 0.7)' }}
        >
          {icon}
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

// ── Main component ──────────────────────────────────────────────────────────
export function StatsPageContent({ wedding, stats, guests, members }: StatsPageContentProps) {
  const labels = EVENT_TYPE_LABELS[wedding.event_type || 'wedding'];
  const separator = wedding.event_type === 'condolence' ? '·' : 'vs';

  if (guests.length === 0) {
    return (
      <div className="py-6">
        <h1 className="font-heading text-2xl font-bold mb-4">통계</h1>
        <EmptyState
          icon={BarChart3}
          title="아직 데이터가 없습니다"
          description={`${labels.guest}을 등록하면 통계를 확인할 수 있습니다.`}
        />
      </div>
    );
  }

  // Most common group
  const groupNames: GroupName[] = ['가족', '친척', '친구', '직장', '기타'];
  const topGroup = groupNames
    .filter((g) => (stats.byGroup[g]?.count || 0) > 0)
    .sort((a, b) => (stats.byGroup[b]?.count || 0) - (stats.byGroup[a]?.count || 0))[0];
  const topGroupCount = topGroup ? stats.byGroup[topGroup]?.count || 0 : 0;

  const attendancePct =
    stats.totalGuests > 0
      ? Math.round((stats.attendedGuests / stats.totalGuests) * 100)
      : 0;

  return (
    <div className="py-6 space-y-5">
      {/* Page heading */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--stats-value)' }}>
          통계
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--stats-sublabel)' }}>
          {wedding.event_type === 'wedding'
            ? `${wedding.groom_name}${wedding.bride_name ? ` & ${wedding.bride_name}` : ''}의 ${labels.gift} 현황`
            : `${wedding.groom_name}의 ${labels.gift} 현황`}
        </p>
      </motion.div>

      {/* ── A. Hero cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <HeroCard
          icon={<Banknote size={14} style={{ color: 'oklch(0.58 0.09 10)' }} />}
          label={`총 ${labels.gift}`}
          value={formatKRW(stats.totalGifts)}
          gradient="linear-gradient(135deg, oklch(0.96 0.025 10) 0%, oklch(0.98 0.010 30) 100%)"
          delay={0.05}
        />
        <HeroCard
          icon={<Users size={14} style={{ color: 'oklch(0.48 0.09 145)' }} />}
          label={`총 ${labels.guest}`}
          value={`${stats.totalGuests}명`}
          sub={`참석률 ${attendancePct}%`}
          gradient="linear-gradient(135deg, oklch(0.96 0.022 145) 0%, oklch(0.98 0.010 160) 100%)"
          delay={0.12}
        />
        <HeroCard
          icon={<TrendingUp size={14} style={{ color: 'oklch(0.55 0.10 85)' }} />}
          label={`1인 평균 ${labels.gift}`}
          value={formatKRW(stats.averageGift)}
          gradient="linear-gradient(135deg, oklch(0.96 0.030 85) 0%, oklch(0.98 0.012 95) 100%)"
          delay={0.19}
        />
        <HeroCard
          icon={wedding.event_type === 'condolence'
            ? <Bookmark size={14} className="fill-current" style={{ color: 'oklch(0.50 0.09 290)' }} />
            : <Heart size={14} className="fill-current" style={{ color: 'oklch(0.50 0.09 290)' }} />}
          label="최다 그룹"
          value={topGroup ?? '—'}
          sub={topGroup ? `${topGroupCount}명` : undefined}
          gradient="linear-gradient(135deg, oklch(0.96 0.020 290) 0%, oklch(0.98 0.010 300) 100%)"
          delay={0.26}
        />
      </div>

      {/* ── C. Side comparison ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.30 }}
      >
        <SectionLabel>
          {members.length === 2 ? `${members[0].display_name}측 ${separator} ${members[1].display_name}측 비교` : '멤버별 비교'}
        </SectionLabel>
        <SideComparisonCard
          stats={stats}
          members={members.map((m) => ({ name: m.name, display_name: m.display_name }))}
          baseDelay={0.2}
          eventType={wedding.event_type}
        />
      </motion.div>

      {/* ── B. Group average insight ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.38 }}
      >
        <SectionLabel>관계별 평균 인사이트</SectionLabel>
        <GroupBreakdownCard stats={stats} title="관계별 평균 인사이트" showInsights baseDelay={0.1} />
      </motion.div>

      {/* ── D. Distribution ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.46 }}
      >
        <SectionLabel>{`${labels.gift} 금액 분포`}</SectionLabel>
        <DistributionStats guests={guests} eventType={wedding.event_type} />
      </motion.div>

      {/* Bottom padding for mobile nav */}
      <div className="h-2" />
    </div>
  );
}

