'use client';

import { useTransition } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { joinWeddingByCode } from '@/actions/wedding';
import { Heart, Users, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { formatKoreanDate } from '@/lib/utils';

interface InviteContentProps {
  wedding: {
    id: string;
    bride_name: string | null;
    groom_name: string;
    wedding_date: string | null;
    venue: string | null;
    event_type: 'wedding' | 'condolence' | null;
  };
  code: string;
  isLoggedIn: boolean;
}

export function InviteContent({ wedding, code, isLoggedIn }: InviteContentProps) {
  const [isPending, startTransition] = useTransition();
  const isCondolence = wedding.event_type === 'condolence';

  const handleJoin = () => {
    startTransition(async () => {
      const result = await joinWeddingByCode(code);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isCondolence ? 'bg-formal-gradient' : 'bg-romantic-gradient'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {isCondolence ? (
                <Bookmark className="w-6 h-6 text-primary" />
              ) : (
                <Heart className="w-6 h-6 text-primary" />
              )}
            </div>
            <CardTitle className="font-heading text-xl">
              {isCondolence || !wedding.bride_name
                ? wedding.groom_name
                : `${wedding.groom_name} & ${wedding.bride_name}`}
            </CardTitle>
            <CardDescription>
              {wedding.event_type === 'condolence'
                ? '경조사 관리에 초대되었습니다'
                : '결혼식 축의금 관리에 초대되었습니다'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wedding.wedding_date && (
              <p className="text-sm text-center text-muted-foreground">
                {formatKoreanDate(wedding.wedding_date)}
                {wedding.venue && ` · ${wedding.venue}`}
              </p>
            )}

            {isLoggedIn ? (
              <Button onClick={handleJoin} disabled={isPending} className="w-full">
                <Users className="w-4 h-4 mr-2" />
                {isPending ? '참여 중...' : '함께 관리하기'}
              </Button>
            ) : (
              <div className="space-y-2">
                <Link href={`/signup?next=/invite/${code}`}>
                  <Button className="w-full">회원가입 후 참여하기</Button>
                </Link>
                <Link href={`/login?next=/invite/${code}`}>
                  <Button variant="outline" className="w-full">로그인 후 참여하기</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
