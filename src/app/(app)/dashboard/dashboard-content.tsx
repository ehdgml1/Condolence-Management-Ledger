'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Wallet, Users, UserCheck, TrendingUp, Heart, UserPlus, ArrowRight, Sparkles, Bookmark } from 'lucide-react';
import { formatKRW, formatNumber, formatKoreanDate } from '@/lib/utils';
import { StatCard } from '@/components/dashboard/StatCard';
import { SideComparisonCard } from '@/components/shared/SideComparisonCard';
import { GroupBreakdownCard } from '@/components/shared/GroupBreakdownCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SectionLabel } from '@/components/shared/SectionLabel';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import type { Wedding, WeddingStats, Guest, EventMember } from '@/lib/types';

interface DashboardContentProps {
  wedding: Wedding;
  stats: WeddingStats;
  guests: Guest[];
  members: EventMember[];
}

export function DashboardContent({ wedding, stats, guests, members }: DashboardContentProps) {
  const labels = EVENT_TYPE_LABELS[wedding.event_type || 'wedding'];
  const gradientClass = wedding.event_type === 'condolence' ? 'bg-formal-gradient' : 'bg-romantic-gradient';
  const DecorativeIcon = wedding.event_type === 'condolence' ? Bookmark : Heart;
  const attendanceRate = guests.length > 0
    ? Math.round((stats.attendedGuests / guests.length) * 100)
    : 0;
  const separator = wedding.event_type === 'condolence' ? '·' : 'vs';

  return (
    <div className="py-6 space-y-5">
      {/* Hero Wedding Banner */}
      <motion.div
        className={`relative rounded-2xl overflow-hidden ${gradientClass}`}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.3, 0.64, 1] }}
      >
        <div className="bg-noise relative px-6 py-7 text-center">
          {/* Decorative icons */}
          <div className="absolute top-3 left-4 opacity-20">
            <DecorativeIcon size={16} className="fill-primary text-primary" />
          </div>
          <div className="absolute top-5 right-6 opacity-15">
            <Sparkles size={14} className="text-primary" />
          </div>
          <div className="absolute bottom-4 left-8 opacity-10">
            <Sparkles size={12} className="text-primary" />
          </div>
          <div className="absolute bottom-3 right-4 opacity-20">
            <DecorativeIcon size={14} className="fill-primary text-primary" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {wedding.event_type === 'wedding' ? (
              <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--stats-value)' }}>
                {wedding.groom_name}
                {wedding.bride_name && (
                  <>
                    <span className="mx-2 text-primary">&</span>
                    {wedding.bride_name}
                  </>
                )}
              </h1>
            ) : (
              <>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--stats-sublabel)' }}>
                  대표
                </p>
                <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--stats-value)' }}>
                  {wedding.groom_name}
                </h1>
              </>
            )}
          </motion.div>

          {wedding.wedding_date && (
            <motion.p
              className="text-sm mt-2"
              style={{ color: 'var(--stats-sublabel)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {formatKoreanDate(wedding.wedding_date)}
              {wedding.venue && ` · ${wedding.venue}`}
            </motion.p>
          )}

          {/* Decorative gold divider */}
          <motion.div
            className="mx-auto mt-4 flex items-center gap-3 justify-center"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="h-px w-12" style={{ background: 'var(--accent)' }} />
            <DecorativeIcon size={10} className="fill-current" style={{ color: 'var(--accent)' }} />
            <div className="h-px w-12" style={{ background: 'var(--accent)' }} />
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Action CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Link href="/guests" className="block">
          <div
            className="btn-primary-glow rounded-2xl px-5 py-4 flex items-center justify-between text-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <UserPlus size={18} />
              </div>
              <div>
                <p className="text-sm font-medium">{`${labels.guest} 빠르게 등록하기`}</p>
                <p className="text-xs opacity-80">터치 몇 번으로 간편 등록</p>
              </div>
            </div>
            <ArrowRight size={18} className="opacity-60" />
          </div>
        </Link>
      </motion.div>

      {/* Summary Section */}
      <div>
        <SectionLabel delay={0.05}>요약</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Wallet}
            label={`총 ${labels.gift}`}
            value={formatKRW(stats.totalGifts)}
            gradient="linear-gradient(135deg, oklch(0.96 0.025 12) 0%, oklch(0.98 0.010 30) 100%)"
            iconColor="oklch(0.58 0.09 12)"
            delay={0.1}
          />
          <StatCard
            icon={Users}
            label={`총 ${labels.guest}`}
            value={`${formatNumber(stats.totalGuests)}명`}
            gradient="linear-gradient(135deg, oklch(0.96 0.022 145) 0%, oklch(0.98 0.010 160) 100%)"
            iconColor="oklch(0.48 0.09 145)"
            delay={0.15}
          />
          <StatCard
            icon={UserCheck}
            label="참석률"
            value={`${attendanceRate}%`}
            sub={`${formatNumber(stats.attendedGuests)}명 참석`}
            gradient="linear-gradient(135deg, oklch(0.96 0.030 85) 0%, oklch(0.98 0.012 95) 100%)"
            iconColor="oklch(0.55 0.10 85)"
            delay={0.2}
          />
          <StatCard
            icon={TrendingUp}
            label={`평균 ${labels.gift}`}
            value={formatKRW(stats.averageGift)}
            gradient="linear-gradient(135deg, oklch(0.96 0.020 290) 0%, oklch(0.98 0.010 300) 100%)"
            iconColor="oklch(0.50 0.09 290)"
            delay={0.25}
          />
        </div>
      </div>

      {/* Side Comparison Section */}
      <div>
        <SectionLabel delay={0.3}>
          {members.length === 2 ? `${members[0].display_name}측 ${separator} ${members[1].display_name}측` : '멤버별 비교'}
        </SectionLabel>
        <SideComparisonCard
          stats={stats}
          members={members.map(m => ({ name: m.name, display_name: m.display_name }))}
          animated
          baseDelay={0.3}
          eventType={wedding.event_type}
        />
      </div>

      {/* Group Breakdown Section */}
      <div>
        <SectionLabel delay={0.4}>관계별 분석</SectionLabel>
        <GroupBreakdownCard stats={stats} animated baseDelay={0.45} />
      </div>

      {/* Recent Activity Section */}
      {guests.length > 0 && (
        <div>
          <SectionLabel delay={0.5}>최근 등록</SectionLabel>
          <RecentActivity guests={guests} />
        </div>
      )}

      {/* Bottom padding for mobile nav */}
      <div className="h-2" />
    </div>
  );
}
