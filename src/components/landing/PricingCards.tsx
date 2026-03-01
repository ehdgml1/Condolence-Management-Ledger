'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

const container = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export function PricingCards() {
  return (
    <motion.div
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
      variants={container}
      className="max-w-md mx-auto"
    >
      <motion.div variants={item}>
        <Card className="border-2 border-primary shadow-lg relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground">완전 무료</Badge>
          </div>
          <CardContent className="p-6">
            <Badge variant="secondary" className="mb-3">무료</Badge>
            <h3 className="font-heading text-2xl font-bold mb-1">₩0</h3>
            <p className="text-sm text-muted-foreground mb-6">모든 기능 무료</p>
            <ul className="space-y-3">
              {[
                '무제한 인원 등록',
                '빠른 금액 입력',
                '실시간 파트너 공유',
                '통계 대시보드',
                'CSV 가져오기/내보내기',
                '식권 관리',
                '감사 메시지 템플릿',
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  {feat}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block mt-6">
              <Button className="w-full">무료로 시작</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
