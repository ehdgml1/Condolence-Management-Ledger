'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Download,
  Share2,
  Plus,
  CheckCircle2,
  Smartphone,
  Monitor,
  Heart,
  ArrowRight,
  Chrome,
} from 'lucide-react';

// BeforeInstallPromptEvent is not in standard TS lib
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type DeviceType = 'ios' | 'android' | 'desktop' | 'unknown';

function detectDevice(): DeviceType {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

function useIsStandalone() {
  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    setStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);
  return standalone;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: [0, 0, 0.58, 1] as const },
  }),
};

export default function InstallPage() {
  const [device, setDevice] = useState<DeviceType>('unknown');
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<
    'idle' | 'installing' | 'installed'
  >('idle');
  const isStandalone = useIsStandalone();

  useEffect(() => {
    setDevice(detectDevice());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstallState('installing');
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallState('installed');
    } else {
      setInstallState('idle');
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-romantic-gradient flex flex-col items-center px-4 py-12">
      {/* Header */}
      <motion.div
        initial="hidden"
        animate="show"
        custom={0}
        variants={fadeUp}
        className="flex flex-col items-center mb-10 text-center"
      >
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg mb-4 bg-white/60">
          <Image
            src="/icons/icon-192.png"
            alt="앱 아이콘"
            fill
            className="object-contain p-2"
          />
        </div>
        <h1 className="font-heading text-3xl font-bold text-foreground mb-1">
          앱 설치하기
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs">
          홈 화면에 추가하면 더 빠르고 편리하게 사용할 수 있어요.
        </p>
      </motion.div>

      <div className="w-full max-w-sm space-y-4">
        {/* Already installed */}
        {isStandalone && (
          <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp}>
            <Card className="border-green-200 bg-green-50/80">
              <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <div>
                  <p className="font-heading font-bold text-lg text-foreground">
                    이미 설치되었습니다
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    홈 화면의 아이콘으로 앱을 열어보세요.
                  </p>
                </div>
                <Link href="/dashboard">
                  <Button className="mt-2 btn-primary-glow">
                    앱 열기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Android */}
        {!isStandalone && device === 'android' && (
          <>
            <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Chrome className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">Android · Chrome</CardTitle>
                  </div>
                  <CardDescription>
                    버튼을 탭하면 홈 화면에 바로 추가됩니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {deferredPrompt ? (
                    <Button
                      className="w-full btn-primary-glow"
                      size="lg"
                      onClick={handleInstall}
                      disabled={installState === 'installing'}
                    >
                      {installState === 'installing' ? (
                        '설치 중...'
                      ) : installState === 'installed' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          설치 완료!
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          설치하기
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
                      Chrome 주소창 오른쪽의 메뉴(⋮)를 탭한 뒤{' '}
                      <strong>홈 화면에 추가</strong>를 선택하세요.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Fallback manual steps for Android */}
            {!deferredPrompt && (
              <motion.div initial="hidden" animate="show" custom={2} variants={fadeUp}>
                <AndroidManualSteps />
              </motion.div>
            )}
          </>
        )}

        {/* iOS */}
        {!isStandalone && device === 'ios' && (
          <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp}>
            <IOSSteps />
          </motion.div>
        )}

        {/* Desktop */}
        {!isStandalone && device === 'desktop' && (
          <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp}>
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                <Monitor className="w-12 h-12 text-muted-foreground" />
                <div>
                  <p className="font-heading font-bold text-lg text-foreground">
                    모바일 전용 앱이에요
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    스마트폰에서 이 페이지를 열면 홈 화면에 설치할 수 있어요.
                    데스크탑에서는 웹 버전을 이용해 주세요.
                  </p>
                </div>
                <Link href="/login">
                  <Button variant="outline" className="mt-2">
                    웹에서 계속하기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Unknown / loading */}
        {device === 'unknown' && (
          <motion.div initial="hidden" animate="show" custom={1} variants={fadeUp}>
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                <Smartphone className="w-12 h-12 text-primary animate-pulse" />
                <p className="text-sm text-muted-foreground">기기 확인 중...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Bottom link */}
        {!isStandalone && (
          <motion.div
            initial="hidden"
            animate="show"
            custom={4}
            variants={fadeUp}
            className="text-center pt-2"
          >
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              설치 없이 웹에서 계속하기 →
            </Link>
          </motion.div>
        )}
      </div>

      {/* Footer heart */}
      <motion.div
        initial="hidden"
        animate="show"
        custom={5}
        variants={fadeUp}
        className="mt-12 flex items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Heart className="w-3 h-3 text-primary" />
        <span className="font-heading font-semibold">경조사 관리 대장</span>
      </motion.div>
    </div>
  );
}

function IOSSteps() {
  const steps = [
    {
      icon: <Share2 className="w-5 h-5 text-primary" />,
      title: 'Safari에서 열기',
      desc: '이 페이지를 Safari 브라우저로 열어주세요. (Chrome·카카오톡 내장 브라우저 불가)',
    },
    {
      icon: (
        <div className="flex items-center justify-center w-5 h-5">
          <Share2 className="w-5 h-5 text-primary" />
        </div>
      ),
      title: '공유 버튼 탭',
      desc: '화면 아래 중앙의 공유 버튼(네모에 화살표)을 탭하세요.',
    },
    {
      icon: <Plus className="w-5 h-5 text-primary" />,
      title: '홈 화면에 추가',
      desc: '스크롤을 내려 "홈 화면에 추가"를 탭한 뒤 "추가"를 누르세요.',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-primary" />
          iPhone · iPad (Safari)
        </CardTitle>
        <CardDescription>아래 단계를 따라 설치하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {i + 1}
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{step.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AndroidManualSteps() {
  const steps = [
    {
      title: 'Chrome에서 메뉴 열기',
      desc: '주소창 오른쪽 끝의 점 세 개(⋮) 아이콘을 탭하세요.',
    },
    {
      title: '홈 화면에 추가 선택',
      desc: '메뉴에서 "홈 화면에 추가" 또는 "앱 설치"를 탭하세요.',
    },
    {
      title: '설치 확인',
      desc: '팝업에서 "추가" 또는 "설치"를 탭하면 완료됩니다.',
    },
  ];

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">수동 설치 방법</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs">
              {i + 1}
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{step.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
