'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createWedding } from '@/actions/wedding';
import { Heart, Bookmark, Sparkles, Plus, X, ArrowLeft } from 'lucide-react';
import type { EventType } from '@/lib/types';

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const fromEvents = searchParams.get('from') === 'events';
  const typeParam = searchParams.get('type');
  const initialType = (typeParam === 'wedding' || typeParam === 'condolence') ? typeParam : null;
  const [step, setStep] = useState(initialType ? 1 : 0);
  const [eventType, setEventType] = useState<EventType>(initialType || 'wedding');
  const [role, setRole] = useState<'bride' | 'groom'>('groom');
  const [memberNames, setMemberNames] = useState<string[]>(['']);
  const [groomName, setGroomName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('role', role);
    formData.set('event_type', eventType);
    if (eventType === 'condolence') {
      formData.set('groom_name', groomName);
      formData.set('member_names', memberNames.filter(n => n.trim()).join(','));
    }
    startTransition(async () => {
      const result = await createWedding(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  const addMember = () => setMemberNames(prev => [...prev, '']);
  const removeMember = (index: number) => setMemberNames(prev => prev.filter((_, i) => i !== index));
  const updateMember = (index: number, value: string) => {
    setMemberNames(prev => prev.map((n, i) => i === index ? value : n));
  };

  const titles: Record<number, { title: string; desc: string }> = {
    0: { title: '어떤 행사인가요?', desc: '행사 유형을 선택해주세요' },
    1: eventType === 'wedding'
      ? { title: '결혼을 축하합니다!', desc: '본인의 역할을 선택해주세요' }
      : { title: '경조사 정보', desc: '대표 이름과 가족 멤버를 입력해주세요' },
    2: { title: '행사 정보', desc: eventType === 'wedding' ? '결혼식 세부 정보를 입력해주세요' : '경조사 세부 정보를 입력해주세요' },
  };

  const current = titles[step] || titles[0];

  return (
    <div className={`min-h-screen ${eventType === 'condolence' ? 'bg-formal-gradient' : 'bg-romantic-gradient'} flex items-center justify-center p-4`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {fromEvents && (
          <div className="mb-4">
            <Link href="/events">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-1" />
                이벤트 목록으로
              </Button>
            </Link>
          </div>
        )}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="font-heading text-2xl">{current.title}</CardTitle>
            <CardDescription>{current.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <AnimatePresence mode="wait">
                {/* Step 0: Event type selection */}
                {step === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setEventType('wedding')}
                        className={`p-5 rounded-xl border-2 text-center transition-all ${
                          eventType === 'wedding'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-3xl mb-2">💒</div>
                        <div className="font-medium">결혼식</div>
                        <p className="text-xs text-muted-foreground mt-1">축의금 관리</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEventType('condolence')}
                        className={`p-5 rounded-xl border-2 text-center transition-all ${
                          eventType === 'condolence'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-3xl mb-2">🙏</div>
                        <div className="font-medium">경조사</div>
                        <p className="text-xs text-muted-foreground mt-1">부조금 관리</p>
                      </button>
                    </div>
                    <Button type="button" className="w-full" onClick={() => setStep(1)}>
                      다음
                    </Button>
                  </motion.div>
                )}

                {/* Step 1A: Wedding role selection */}
                {step === 1 && eventType === 'wedding' && (
                  <motion.div
                    key="step1a"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('groom')}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          role === 'groom'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-2xl mb-1">🤵</div>
                        <div className="font-medium">신랑</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('bride')}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          role === 'bride'
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-2xl mb-1">👰</div>
                        <div className="font-medium">신부</div>
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">
                        이전
                      </Button>
                      <Button type="button" className="flex-1" onClick={() => setStep(2)}>
                        다음
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 1B: Condolence - representative + members */}
                {step === 1 && eventType === 'condolence' && (
                  <motion.div
                    key="step1b"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="groom_name">대표 이름</Label>
                      <Input
                        id="groom_name"
                        name="groom_name"
                        placeholder="대표자 이름"
                        required
                        value={groomName}
                        onChange={(e) => setGroomName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>가족 멤버 (소속 구분)</Label>
                      <p className="text-xs text-muted-foreground">부조금을 구분할 멤버를 추가하세요 (예: 아버지측, 어머니측)</p>
                      {memberNames.map((name, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={name}
                            onChange={(e) => updateMember(i, e.target.value)}
                            placeholder={`멤버 ${i + 1} 이름`}
                          />
                          {memberNames.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeMember(i)}>
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={addMember} className="w-full">
                        <Plus className="w-4 h-4 mr-1" />
                        멤버 추가
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">
                        이전
                      </Button>
                      <Button type="button" className="flex-1" onClick={() => {
                        if (eventType === 'condolence' && !groomName.trim()) {
                          setError('대표 이름을 입력해주세요');
                          return;
                        }
                        setError(null);
                        setStep(2);
                      }}>
                        다음
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Date + venue (common) */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {eventType === 'wedding' ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="groom_name">신랑 이름</Label>
                          <Input id="groom_name" name="groom_name" placeholder="신랑 이름을 입력하세요" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bride_name">신부 이름</Label>
                          <Input id="bride_name" name="bride_name" placeholder="신부 이름을 입력하세요" required />
                        </div>
                      </>
                    ) : (
                      <>
                        <input type="hidden" name="groom_name" value={groomName} />
                        <input type="hidden" name="member_names" value={memberNames.filter(n => n.trim()).join(',')} />
                      </>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="wedding_date">{eventType === 'wedding' ? '결혼식 날짜' : '행사 날짜'}</Label>
                      <Input id="wedding_date" name="wedding_date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue">{eventType === 'wedding' ? '예식장' : '장소'}</Label>
                      <Input id="venue" name="venue" placeholder={eventType === 'wedding' ? '예식장 이름 (선택사항)' : '장소 (선택사항)'} />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                        이전
                      </Button>
                      <Button type="submit" className="flex-1" disabled={isPending}>
                        {eventType === 'condolence' ? <Bookmark className="w-4 h-4 mr-2" /> : <Heart className="w-4 h-4 mr-2" />}
                        {isPending ? '생성 중...' : '시작하기'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
