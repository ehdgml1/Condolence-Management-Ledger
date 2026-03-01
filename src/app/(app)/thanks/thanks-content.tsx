'use client';

import { useState, useTransition, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatKRW, formatKoreanDateCompact } from '@/lib/utils';
import { DEFAULT_THANK_TEMPLATE, EVENT_TYPE_LABELS, getDefaultTemplate } from '@/lib/constants';
import { createTemplate } from '@/actions/thanks';
import { updateGuestThanked, updateGuestGiftReturned } from '@/actions/guests';
import {
  MessageSquare, Copy, Check, Plus, Gift, PackageCheck,
  Share2, ClipboardList, Eye, EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Guest, ThankTemplate, Wedding } from '@/lib/types';

interface ThanksPageContentProps {
  guests: Guest[];
  templates: ThankTemplate[];
  weddingId: string;
  wedding: Wedding;
}

// ---------------------------------------------------------------------------
// ThankYouCard – purely visual preview card (no canvas / html2canvas needed)
// ---------------------------------------------------------------------------
interface ThankYouCardProps {
  name: string;
  message: string;
  brideName: string | null;
  groomName: string;
  weddingDate: string | null;
  eventType?: 'wedding' | 'condolence';
}

function ThankYouCard({ name, message, brideName, groomName, weddingDate, eventType = 'wedding' }: ThankYouCardProps) {
  const isCondolence = eventType === 'condolence';
  const formattedDate = weddingDate
    ? formatKoreanDateCompact(weddingDate)
    : '';

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 400,
        minHeight: 240,
        background: isCondolence
          ? 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 50%, #f0f0f0 100%)'
          : 'linear-gradient(135deg, #fdf2f4 0%, #fff8f0 50%, #f9f3ff 100%)',
        border: isCondolence ? '1.5px solid #d0d0d0' : '1.5px solid #f0c4d0',
        borderRadius: 16,
        padding: '24px 28px',
        boxShadow: isCondolence
          ? '0 4px 24px rgba(100, 100, 100, 0.12)'
          : '0 4px 24px rgba(200, 120, 150, 0.12)',
        fontFamily: "'Noto Serif KR', serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative corner accents */}
      <div style={{
        position: 'absolute', top: 10, left: 10,
        fontSize: 18, opacity: 0.35, lineHeight: 1,
      }}>{isCondolence ? '◆' : '✿'}</div>
      <div style={{
        position: 'absolute', top: 10, right: 10,
        fontSize: 18, opacity: 0.35, lineHeight: 1,
      }}>{isCondolence ? '◆' : '✿'}</div>
      <div style={{
        position: 'absolute', bottom: 10, left: 10,
        fontSize: 14, opacity: 0.25, lineHeight: 1,
      }}>{isCondolence ? '◇' : '❀'}</div>
      <div style={{
        position: 'absolute', bottom: 10, right: 10,
        fontSize: 14, opacity: 0.25, lineHeight: 1,
      }}>{isCondolence ? '◇' : '❀'}</div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 22, marginBottom: 4, letterSpacing: 2 }}>{isCondolence ? '감사합니다' : '🌸 감사합니다 🌸'}</div>
        <div style={{
          height: 1,
          background: isCondolence
            ? 'linear-gradient(90deg, transparent, #999, transparent)'
            : 'linear-gradient(90deg, transparent, #e8a0b4, transparent)',
          margin: '0 auto',
          width: '80%',
        }} />
      </div>

      {/* Name */}
      <div style={{
        fontSize: 15,
        fontWeight: 700,
        color: isCondolence ? '#4a4a4a' : '#8b4460',
        marginBottom: 10,
        letterSpacing: 0.5,
      }}>
        {name}님
      </div>

      {/* Message body */}
      <div style={{
        fontSize: 12.5,
        color: '#5a4040',
        lineHeight: 1.8,
        whiteSpace: 'pre-wrap',
        marginBottom: 16,
        minHeight: 60,
      }}>
        {message}
      </div>

      {/* Footer divider */}
      <div style={{
        height: 1,
        background: isCondolence
          ? 'linear-gradient(90deg, transparent, #999, transparent)'
          : 'linear-gradient(90deg, transparent, #e8a0b4, transparent)',
        marginBottom: 10,
        width: '70%',
        margin: '0 auto 10px',
      }} />

      {/* Couple names & date */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: isCondolence ? '#555' : '#9b5a70', fontWeight: 600, letterSpacing: 1 }}>
          {brideName ? `${groomName} & ${brideName}` : groomName}
        </div>
        {formattedDate && (
          <div style={{ fontSize: 11, color: isCondolence ? '#777' : '#b07090', marginTop: 3, letterSpacing: 0.5 }}>
            {formattedDate}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function ThanksPageContent({
  guests,
  templates: initialTemplates,
  weddingId,
  wedding,
}: ThanksPageContentProps) {
  const labels = EVENT_TYPE_LABELS[wedding.event_type || 'wedding'];

  // Display-friendly variable tokens (brackets indicate replaceable variable)
  const DISPLAY_NAME = `[${labels.guest} 이름]`;
  const DISPLAY_AMOUNT = `[${labels.gift} 금액]`;

  const toDisplay = (raw: string) =>
    raw.replace(/\{\{name\}\}/g, DISPLAY_NAME).replace(/\{\{amount\}\}/g, DISPLAY_AMOUNT);

  const toRaw = (display: string) =>
    display.replaceAll(DISPLAY_NAME, '{{name}}').replaceAll(DISPLAY_AMOUNT, '{{amount}}');

  const [activeTab, setActiveTab] = useState<'thanks' | 'gifts'>('thanks');
  const [templates, setTemplates] = useState(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    templates[0]?.body || getDefaultTemplate(wedding.event_type || 'wedding')
  );
  const [guestList, setGuestList] = useState(guests);
  const [isPending, startTransition] = useTransition();
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState(toDisplay(getDefaultTemplate(wedding.event_type || 'wedding')));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showOnlyUnthanked, setShowOnlyUnthanked] = useState(false);
  const [previewGuest, setPreviewGuest] = useState<Guest | null>(null);
  const [showCardPreview, setShowCardPreview] = useState(true);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(!!navigator.share);
  }, []);

  const giftGuests = guestList.filter((g) => g.gift_amount > 0);
  const thankedCount = giftGuests.filter((g) => g.thanked).length;
  const returnedCount = giftGuests.filter((g) => g.gift_returned).length;
  const thanksProgressPercent = giftGuests.length > 0
    ? Math.round((thankedCount / giftGuests.length) * 100)
    : 0;
  const returnProgressPercent = giftGuests.length > 0
    ? Math.round((returnedCount / giftGuests.length) * 100)
    : 0;

  const visibleGiftGuests = showOnlyUnthanked
    ? giftGuests.filter((g) => !g.thanked)
    : giftGuests;

  const unthankedGuests = giftGuests.filter((g) => !g.thanked);

  // The guest shown in card preview: previewGuest or first unthanked or first gift guest
  const cardPreviewGuest =
    previewGuest ??
    unthankedGuests[0] ??
    giftGuests[0] ??
    null;

  const generateMessage = useCallback(
    (guest: Guest) =>
      selectedTemplate
        .replace(/\{\{name\}\}/g, guest.name)
        .replace(/\{\{amount\}\}/g, formatKRW(guest.gift_amount)),
    [selectedTemplate]
  );

  // Copy single guest message + mark thanked
  const copyMessage = async (guest: Guest) => {
    const message = generateMessage(guest);
    await navigator.clipboard.writeText(message);
    toast.success('메시지가 복사되었습니다');
    startTransition(async () => {
      await updateGuestThanked(guest.id, true);
      setGuestList((prev) =>
        prev.map((g) => (g.id === guest.id ? { ...g, thanked: true } : g))
      );
    });
  };

  // Web Share API – single guest
  const shareMessage = async (guest: Guest) => {
    const message = generateMessage(guest);
    try {
      await navigator.share({ text: message });
      // mark thanked after successful share
      startTransition(async () => {
        await updateGuestThanked(guest.id, true);
        setGuestList((prev) =>
          prev.map((g) => (g.id === guest.id ? { ...g, thanked: true } : g))
        );
      });
      toast.success(`${guest.name}님 메시지를 공유했습니다`);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast.error('공유에 실패했습니다');
      }
    }
  };

  // Copy ALL unthanked messages to clipboard
  const copyAllUnthanked = async () => {
    if (unthankedGuests.length === 0) {
      toast.info(`미발송 ${labels.guest}이 없습니다`);
      return;
    }
    const combined = unthankedGuests
      .map((g) => `▶ ${g.name}님\n${generateMessage(g)}`)
      .join('\n\n---\n\n');
    await navigator.clipboard.writeText(combined);
    toast.success(`미발송 ${unthankedGuests.length}명 메시지를 복사했습니다`);
  };

  // Web Share ALL unthanked (shares as one big text block)
  const shareAll = async () => {
    if (unthankedGuests.length === 0) {
      toast.info(`미발송 ${labels.guest}이 없습니다`);
      return;
    }
    const combined = unthankedGuests
      .map((g) => `▶ ${g.name}님\n${generateMessage(g)}`)
      .join('\n\n---\n\n');
    try {
      await navigator.share({ text: combined });
      toast.success('일괄 공유 완료');
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        // Fallback to clipboard
        await navigator.clipboard.writeText(combined);
        toast.success('공유가 지원되지 않아 클립보드에 복사했습니다');
      }
    }
  };

  const toggleGiftReturned = (guest: Guest) => {
    const next = !guest.gift_returned;
    startTransition(async () => {
      const result = await updateGuestGiftReturned(guest.id, next);
      if (!result?.error) {
        setGuestList((prev) =>
          prev.map((g) => (g.id === guest.id ? { ...g, gift_returned: next } : g))
        );
        toast.success(next ? '답례품 발송 완료로 변경됐습니다' : '답례품 미발송으로 변경됐습니다');
      }
    });
  };

  const markAllGiftReturned = () => {
    startTransition(async () => {
      const results = await Promise.all(
        giftGuests
          .filter((g) => !g.gift_returned)
          .map((g) => updateGuestGiftReturned(g.id, true))
      );
      const hasError = results.some((r) => r?.error);
      if (!hasError) {
        setGuestList((prev) =>
          prev.map((g) => (g.gift_amount > 0 ? { ...g, gift_returned: true } : g))
        );
        toast.success('전체 답례품 발송 완료로 변경됐습니다');
      }
    });
  };

  const handleCreateTemplate = () => {
    if (!newTitle.trim()) {
      toast.error('템플릿 이름을 입력해주세요');
      return;
    }
    startTransition(async () => {
      const result = await createTemplate(weddingId, newTitle.trim(), toRaw(newBody));
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.data) {
        setTemplates((prev) => [...prev, result.data!]);
        toast.success('템플릿이 저장되었습니다');
        setNewTitle('');
        setNewBody(toDisplay(getDefaultTemplate(wedding.event_type || 'wedding')));
        setIsDialogOpen(false);
      }
    });
  };

  return (
    <div className="py-6 space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading text-2xl font-bold">감사 인사</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {`${labels.gift}을 보내주신 분들께 감사 메시지를 보내세요`}
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('thanks')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'thanks'
              ? 'bg-white shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          감사 인사
        </button>
        <button
          onClick={() => setActiveTab('gifts')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'gifts'
              ? 'bg-white shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          답례품 관리
        </button>
      </div>

      {/* ================================================================
          TAB: 감사 인사
          ================================================================ */}
      {activeTab === 'thanks' && (
        <div className="space-y-4">

          {/* Progress */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between text-sm mb-2">
                <span>감사 인사: {thankedCount}/{giftGuests.length}명 완료</span>
                <span className="font-bold">{thanksProgressPercent}%</span>
              </div>
              <Progress value={thanksProgressPercent} className="h-2" />
            </CardContent>
          </Card>

          {/* Batch action bar */}
          {unthankedGuests.length > 0 && (
            <Card className={`border-0 shadow-sm bg-gradient-to-r ${wedding.event_type === 'condolence' ? 'from-gray-50 to-slate-50' : 'from-pink-50 to-rose-50'}`}>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  일괄 메시지 전송 — 미발송 {unthankedGuests.length}명
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAllUnthanked}
                    className={`text-xs ${wedding.event_type === 'condolence' ? 'border-gray-200 hover:bg-gray-50' : 'border-pink-200 hover:bg-pink-50'}`}
                  >
                    <ClipboardList className="w-3 h-3 mr-1" />
                    전체 메시지 복사
                  </Button>
                  {canShare && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareAll}
                      className={`text-xs ${wedding.event_type === 'condolence' ? 'border-gray-200 hover:bg-gray-50' : 'border-pink-200 hover:bg-pink-50'}`}
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      전체 공유
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Template selector */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">메시지 템플릿</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-3 h-3 mr-1" />
                      새 템플릿
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>새 템플릿 만들기</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label>템플릿 이름</Label>
                        <Input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="예: 기본 감사 메시지"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>메시지 내용</Label>
                        <Textarea
                          value={newBody}
                          onChange={(e) => setNewBody(e.target.value)}
                          rows={6}
                          placeholder={`${labels.guest} 이름, ${labels.gift} 금액이 자동으로 채워집니다`}
                        />
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="text-xs text-muted-foreground">탭하여 삽입:</span>
                          <button
                            type="button"
                            onClick={() => setNewBody((prev) => prev + DISPLAY_NAME)}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${wedding.event_type === 'condolence' ? 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100' : 'bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100'}`}
                          >
                            <Plus className="w-3 h-3" />
                            {`${labels.guest} 이름`}
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewBody((prev) => prev + DISPLAY_AMOUNT)}
                            className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 text-xs font-medium hover:bg-amber-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            {`${labels.gift} 금액`}
                          </button>
                        </div>
                      </div>
                      <Button
                        onClick={handleCreateTemplate}
                        disabled={isPending}
                        className="w-full"
                      >
                        저장
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge
                  variant={selectedTemplate === getDefaultTemplate(wedding.event_type || 'wedding') ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedTemplate(getDefaultTemplate(wedding.event_type || 'wedding'))}
                >
                  기본 템플릿
                </Badge>
                {templates.map((t) => (
                  <Badge
                    key={t.id}
                    variant={selectedTemplate === t.body ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedTemplate(t.body)}
                  >
                    {t.title}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mb-1.5">
                미리보기 — 실제 전송 시 이름과 금액이 자동으로 바뀝니다
              </p>
              <div className="bg-muted rounded-lg p-3 text-sm whitespace-pre-wrap">
                {selectedTemplate
                  .replace(/\{\{name\}\}/g, '홍길동')
                  .replace(/\{\{amount\}\}/g, formatKRW(100000))}
              </div>
            </CardContent>
          </Card>

          {/* Card Preview */}
          {giftGuests.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">카드 미리보기</CardTitle>
                  <button
                    onClick={() => setShowCardPreview((v) => !v)}
                    className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {showCardPreview ? (
                      <><EyeOff className="w-3 h-3" /> 접기</>
                    ) : (
                      <><Eye className="w-3 h-3" /> 펼치기</>
                    )}
                  </button>
                </div>
                {showCardPreview && (
                  <p className="text-xs text-muted-foreground">
                    {`${labels.guest} 이름을 탭하면 카드 미리보기가 바뀝니다`}
                  </p>
                )}
              </CardHeader>
              {showCardPreview && cardPreviewGuest && (
                <CardContent className="flex justify-center pb-4">
                  <ThankYouCard
                    name={cardPreviewGuest.name}
                    message={generateMessage(cardPreviewGuest)}
                    brideName={wedding.bride_name}
                    groomName={wedding.groom_name}
                    weddingDate={wedding.wedding_date}
                    eventType={wedding.event_type}
                  />
                </CardContent>
              )}
            </Card>
          )}

          {/* Filter row */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{visibleGiftGuests.length}명</p>
            <button
              onClick={() => setShowOnlyUnthanked((v) => !v)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                showOnlyUnthanked
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              전체 미발송
            </button>
          </div>

          {/* Guest list */}
          <div className="space-y-2">
            {visibleGiftGuests.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                {showOnlyUnthanked ? `미발송 ${labels.guest}이 없습니다` : `${labels.guest} 정보가 없습니다`}
              </p>
            )}
            {visibleGiftGuests.map((guest, i) => (
              <motion.div
                key={guest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className={`border-0 shadow-sm transition-colors ${
                    cardPreviewGuest?.id === guest.id ? 'ring-1 ring-pink-200' : ''
                  }`}
                >
                  <CardContent className="p-3 flex items-center justify-between gap-2">
                    {/* Avatar + name — clicking changes card preview */}
                    <button
                      className="flex items-center gap-2 min-w-0 text-left flex-1"
                      onClick={() => setPreviewGuest(guest)}
                      title="카드 미리보기"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        guest.thanked ? 'bg-green-100' : 'bg-muted'
                      }`}>
                        {guest.thanked ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate text-sm">{guest.name}</p>
                        <p className="text-xs text-muted-foreground">{formatKRW(guest.gift_amount)}</p>
                      </div>
                    </button>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        variant={guest.thanked ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => copyMessage(guest)}
                        disabled={isPending}
                        className="text-xs px-2"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        {guest.thanked ? '다시 복사' : '복사'}
                      </Button>
                      {canShare && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => shareMessage(guest)}
                          disabled={isPending}
                          className={`text-xs px-2 ${wedding.event_type === 'condolence' ? 'border-gray-200 hover:bg-gray-50' : 'border-pink-200 hover:bg-pink-50'}`}
                        >
                          <Share2 className="w-3 h-3 mr-1" />
                          공유
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================
          TAB: 답례품 관리  (unchanged)
          ================================================================ */}
      {activeTab === 'gifts' && (
        <div className="space-y-4">
          {/* Progress */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between text-sm mb-2">
                <span>답례품 발송: {returnedCount}/{giftGuests.length}명 완료</span>
                <span className="font-bold">{returnProgressPercent}%</span>
              </div>
              <Progress value={returnProgressPercent} className="h-2" />
            </CardContent>
          </Card>

          {/* Batch action */}
          {returnedCount < giftGuests.length && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllGiftReturned}
                disabled={isPending}
              >
                <PackageCheck className="w-3 h-3 mr-1" />
                전체 발송 완료
              </Button>
            </div>
          )}

          {/* Guest list */}
          <div className="space-y-2">
            {giftGuests.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                {`${labels.guest} 정보가 없습니다`}
              </p>
            )}
            {giftGuests.map((guest, i) => (
              <motion.div
                key={guest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        guest.gift_returned ? 'bg-green-100' : 'bg-muted'
                      }`}>
                        {guest.gift_returned ? (
                          <PackageCheck className="w-4 h-4 text-green-600" />
                        ) : (
                          <Gift className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate text-sm">{guest.name}</p>
                        <p className="text-xs text-muted-foreground">{formatKRW(guest.gift_amount)}</p>
                      </div>
                    </div>
                    <Button
                      variant={guest.gift_returned ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => toggleGiftReturned(guest)}
                      disabled={isPending}
                    >
                      {guest.gift_returned ? '발송 취소' : '답례품 발송'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
