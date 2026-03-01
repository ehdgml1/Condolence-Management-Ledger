'use client';

import { useActionState, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signup } from '@/actions/auth';
import { Heart, Bookmark } from 'lucide-react';

export default function SignupPage() {
  const [passwordError, setPasswordError] = useState('');
  const searchParams = useSearchParams();
  const eventType = searchParams.get('type') || '';

  const isCondolence = eventType === 'condolence';
  const bgClass = isCondolence ? 'bg-formal-gradient' : 'bg-romantic-gradient';
  const IconComponent = isCondolence ? Bookmark : Heart;
  const description =
    eventType === 'wedding'
      ? '결혼식 축의금 관리를 시작하세요'
      : eventType === 'condolence'
        ? '경조사 부조금 관리를 시작하세요'
        : '경조사 관리를 시작하세요';
  const [state, formAction, isPending] = useActionState(
    async (_prevState: { error: string } | null, formData: FormData) => {
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      if (password !== confirmPassword) {
        setPasswordError('비밀번호가 일치하지 않습니다');
        return null;
      }
      setPasswordError('');

      const result = await signup(formData);
      return result ?? null;
    },
    null
  );

  return (
    <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="font-heading text-2xl">회원가입</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="event_type" value={eventType} />
              {(state?.error || passwordError) && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {state?.error || passwordError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="8자 이상"
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? '가입 중...' : '회원가입'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                로그인
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
