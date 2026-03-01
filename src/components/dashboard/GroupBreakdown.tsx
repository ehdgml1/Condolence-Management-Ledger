'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatKRW, formatNumber } from '@/lib/utils';
import { GROUP_COLORS } from '@/lib/constants';
import type { WeddingStats, GroupName } from '@/lib/types';

interface GroupBreakdownProps {
  stats: WeddingStats;
}

const GROUP_ORDER: GroupName[] = ['가족', '친척', '친구', '직장', '기타'];

export function GroupBreakdown({ stats }: GroupBreakdownProps) {
  const maxTotal = Math.max(...GROUP_ORDER.map(g => stats.byGroup[g]?.total || 0), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">그룹별 분석</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {GROUP_ORDER.map((group, index) => {
            const data = stats.byGroup[group];
            if (!data || data.count === 0) return null;
            const percent = (data.total / maxTotal) * 100;

            return (
              <div key={group} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{group}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(data.count)}명 · 평균 {formatKRW(data.average)}
                  </span>
                </div>
                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{ background: GROUP_COLORS[group] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  />
                </div>
                <p className="text-xs text-right text-muted-foreground">
                  {formatKRW(data.total)}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
