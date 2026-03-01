'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Zap, Share2, BarChart3, Smartphone, Upload, Shield,
  type LucideIcon,
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  bg: string;
}

const features: Feature[] = [
  {
    icon: Zap,
    title: '빠른 입력',
    desc: '행사 당일 터치 최적화 빠른 입력 모드',
    bg: 'bg-primary/8',
  },
  {
    icon: Share2,
    title: '실시간 공유',
    desc: '멤버 동시 입력, 자동 동기화',
    bg: 'bg-secondary/60',
  },
  {
    icon: BarChart3,
    title: '한눈에 통계',
    desc: '그룹별, 측별 분석 차트와 분포 통계',
    bg: 'bg-primary/10',
  },
  {
    icon: Smartphone,
    title: '모바일 최적화',
    desc: 'PWA 지원, 앱처럼 사용 가능',
    bg: 'bg-secondary/50',
  },
  {
    icon: Upload,
    title: 'CSV 가져오기/내보내기',
    desc: '기존 엑셀 데이터를 한 번에 등록',
    bg: 'bg-primary/8',
  },
  {
    icon: Shield,
    title: '안전한 데이터',
    desc: '암호화된 클라우드 저장, 접근 권한 관리',
    bg: 'bg-secondary/60',
  },
];

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

export function FeaturesGrid() {
  return (
    <motion.div
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
      variants={container}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {features.map((feature) => (
        <motion.div key={feature.title} variants={item}>
          <Card className="border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 h-full">
            <CardContent className="p-5 flex gap-4">
              <div
                className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center shrink-0`}
              >
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
