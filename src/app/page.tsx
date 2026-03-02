import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight, Download } from 'lucide-react';
import { HeroSection } from '@/components/landing/HeroSection';
import { AnimatedSection } from '@/components/landing/AnimatedSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero — client island (parallax scroll + entry animations) */}
      <HeroSection />

      {/* Features */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-3">
              당일 현장에서, 스마트하게
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              복잡한 엑셀 대신, 터치 몇 번으로 관리하세요.
            </p>
          </AnimatedSection>

          {/* Stagger-animated grid — client island */}
          <FeaturesGrid />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-romantic-gradient">
        <AnimatedSection className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 relative">
            <Heart className="w-8 h-8 text-primary" />
            <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
          </div>
          <h2 className="font-heading text-3xl font-bold mb-3">
            소중한 마음을 기록하세요
          </h2>
          <p className="text-muted-foreground mb-8">
            이제 스마트하게 시작하세요.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-base px-8 h-12 btn-primary-glow">
              무료로 시작하기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            <span className="font-heading font-bold text-foreground">
              경조사 관리 대장
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/install"
              className="flex items-center gap-1.5 text-primary hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              앱 설치하기
            </Link>
            <p>© {new Date().getFullYear()} 경조사 관리 대장. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
