'use client';

import Link from 'next/link';
import { useState, useEffect, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateWedding } from '@/actions/wedding';
import { deleteEvent } from '@/actions/events';
import { signOutAction } from '@/actions/auth';
import { createEventMember, updateEventMember, deleteEventMember } from '@/actions/event-members';
import {
  Share2, Download, LogOut,
  Copy, Check, Heart, Bookmark, Calendar, MapPin, QrCode, Calculator, MessageSquare, Settings2, Users, X
} from 'lucide-react';
import { toast } from 'sonner';
import type { Wedding, Profile, Guest, EventMember } from '@/lib/types';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import { formatKoreanDate } from '@/lib/utils';

interface SettingsPageContentProps {
  wedding: Wedding;
  profile: Profile;
  guests: Guest[];
  members: EventMember[];
}

export function SettingsPageContent({ wedding: initialWedding, guests, members }: SettingsPageContentProps) {
  const labels = EVENT_TYPE_LABELS[initialWedding.event_type || 'wedding'];
  const [wedding, setWedding] = useState(initialWedding);
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [partnerCopied, setPartnerCopied] = useState(false);
  const [receptionCopied, setReceptionCopied] = useState(false);

  const [memberList, setMemberList] = useState<EventMember[]>(members);
  const [newMemberName, setNewMemberName] = useState('');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Edit form state
  const [brideName, setBrideName] = useState(wedding.bride_name ?? '');
  const [groomName, setGroomName] = useState(wedding.groom_name);
  const [weddingDate, setWeddingDate] = useState(wedding.wedding_date || '');
  const [venue, setVenue] = useState(wedding.venue || '');

  const [shareUrl, setShareUrl] = useState('');
  const [receptionUrl, setReceptionUrl] = useState('');

  useEffect(() => {
    setShareUrl(`${window.location.origin}/invite/${wedding.share_code}`);
    setReceptionUrl(`${window.location.origin}/reception/${wedding.share_code}`);
  }, [wedding.share_code]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setPartnerCopied(true);
    toast.success('공유 링크가 복사되었습니다');
    setTimeout(() => setPartnerCopied(false), 2000);
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append('wedding_id', wedding.id);
    formData.append('bride_name', brideName);
    formData.append('groom_name', groomName);
    formData.append('wedding_date', weddingDate);
    formData.append('venue', venue);

    startTransition(async () => {
      const result = await updateWedding(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setWedding((prev) => ({
        ...prev,
        bride_name: brideName || null,
        groom_name: groomName,
        wedding_date: weddingDate || null,
        venue: venue || null,
      }));
      toast.success('저장되었습니다');
      setIsEditing(false);
    });
  };

  const handleExportCsv = () => {
    function escapeCsvCell(cell: string): string {
      let escaped = cell.replace(/"/g, '""');
      if (/^[=+\-@\t\r]/.test(escaped)) {
        escaped = "'" + escaped;
      }
      return `"${escaped}"`;
    }

    const isCondolence = wedding.event_type === 'condolence';
    const headers = isCondolence
      ? ['이름', '소속', '그룹', '관계', '연락처', labels.gift, '참석', '감사', '메모']
      : ['이름', '소속', '그룹', '관계', '연락처', labels.gift, '식권', '참석', '감사', '메모'];
    const rows = guests.map((g) => isCondolence
      ? [
          g.name,
          g.side,
          g.group_name,
          g.relationship || '',
          g.phone || '',
          g.gift_amount.toString(),
          g.attended ? 'O' : 'X',
          g.thanked ? 'O' : 'X',
          g.memo || '',
        ]
      : [
          g.name,
          g.side,
          g.group_name,
          g.relationship || '',
          g.phone || '',
          g.gift_amount.toString(),
          g.meal_tickets.toString(),
          g.attended ? 'O' : 'X',
          g.thanked ? 'O' : 'X',
          g.memo || '',
        ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
      .join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${labels.gift}_${wedding.groom_name}${wedding.bride_name ? `_${wedding.bride_name}` : ''}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('CSV 파일이 다운로드되었습니다');
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  return (
    <div className="py-6 space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-heading text-2xl font-bold">설정</h1>
      </motion.div>

      {/* Event Type */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              이벤트 유형
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{initialWedding.event_type === 'wedding' ? '💒' : '🙏'}</span>
              <div>
                <p className="font-medium">{initialWedding.event_type === 'wedding' ? '결혼식' : '경조사'}</p>
                <p className="text-xs text-muted-foreground">
                  {initialWedding.event_type === 'wedding' ? '축의금 관리' : '부조금 관리'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/events" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  이벤트 전환
                </Button>
              </Link>
              {initialWedding.owner_id === initialWedding.owner_id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm('이 이벤트를 삭제하시겠습니까? 모든 데이터가 삭제됩니다.')) {
                      startTransition(async () => {
                        const result = await deleteEvent(initialWedding.id);
                        if (result.error) {
                          toast.error(result.error);
                        } else {
                          window.location.href = '/events';
                        }
                      });
                    }
                  }}
                  disabled={isPending}
                >
                  삭제
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Member Management */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              멤버 관리
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {labels.guest} 등록 시 소속을 구분하는 멤버입니다
            </p>

            {/* Existing members */}
            <div className="space-y-2">
              {memberList.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  {editingMemberId === member.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 h-9 text-sm"
                        placeholder="멤버 이름"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!editingName.trim()) return;
                          startTransition(async () => {
                            const result = await updateEventMember(member.id, {
                              name: editingName.trim(),
                              display_name: editingName.trim(),
                            });
                            if (result.error) {
                              toast.error(result.error);
                            } else if (result.data) {
                              setMemberList(prev => prev.map(m =>
                                m.id === member.id ? result.data! : m
                              ));
                              toast.success('수정되었습니다');
                            }
                            setEditingMemberId(null);
                          });
                        }}
                        disabled={isPending}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingMemberId(null)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 text-sm font-medium px-3 py-1.5 rounded-lg bg-muted/50">
                        {member.display_name}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingMemberId(member.id);
                          setEditingName(member.display_name);
                        }}
                      >
                        수정
                      </Button>
                      {!(wedding.event_type === 'condolence' && member.name === wedding.groom_name) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (!confirm(`"${member.display_name}" 멤버를 삭제하시겠습니까?`)) return;
                            startTransition(async () => {
                              const result = await deleteEventMember(member.id);
                              if (result.error) {
                                toast.error(result.error);
                              } else {
                                setMemberList(prev => prev.filter(m => m.id !== member.id));
                                toast.success('삭제되었습니다');
                              }
                            });
                          }}
                          disabled={isPending}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add new member */}
            <div className="flex gap-2">
              <Input
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="새 멤버 이름"
                className="flex-1 h-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!newMemberName.trim()) return;
                    startTransition(async () => {
                      const result = await createEventMember(initialWedding.id, {
                        name: newMemberName.trim(),
                        display_name: newMemberName.trim(),
                        sort_order: memberList.length,
                      });
                      if (result.error) {
                        toast.error(result.error);
                      } else if (result.data) {
                        setMemberList(prev => [...prev, result.data!]);
                        setNewMemberName('');
                        toast.success('멤버가 추가되었습니다');
                      }
                    });
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!newMemberName.trim()) return;
                  startTransition(async () => {
                    const result = await createEventMember(initialWedding.id, {
                      name: newMemberName.trim(),
                      display_name: newMemberName.trim(),
                      sort_order: memberList.length,
                    });
                    if (result.error) {
                      toast.error(result.error);
                    } else if (result.data) {
                      setMemberList(prev => [...prev, result.data!]);
                      setNewMemberName('');
                      toast.success('멤버가 추가되었습니다');
                    }
                  });
                }}
                disabled={isPending || !newMemberName.trim()}
              >
                추가
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Wedding Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {wedding.event_type === 'condolence'
                  ? <Bookmark className="w-4 h-4 text-primary" />
                  : <Heart className="w-4 h-4 text-primary" />}
                {wedding.event_type === 'wedding' ? '결혼식 정보' : '경조사 정보'}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? '취소' : '수정'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditing ? (
              <div className="space-y-3">
                <div className={initialWedding.event_type === 'wedding' ? 'grid grid-cols-2 gap-3' : undefined}>
                  <div className="space-y-1">
                    <Label className="text-xs">{initialWedding.event_type === 'wedding' ? '신랑' : '대표'}</Label>
                    <Input value={groomName} onChange={(e) => setGroomName(e.target.value)} />
                  </div>
                  {initialWedding.event_type === 'wedding' && (
                    <div className="space-y-1">
                      <Label className="text-xs">신부</Label>
                      <Input value={brideName} onChange={(e) => setBrideName(e.target.value)} />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{`${labels.event} 날짜`}</Label>
                  <Input type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{initialWedding.event_type === 'wedding' ? '예식장' : '장소'}</Label>
                  <Input value={venue} onChange={(e) => setVenue(e.target.value)} placeholder={initialWedding.event_type === 'wedding' ? '예식장 이름' : '장소'} />
                </div>
                <Button onClick={handleSave} disabled={isPending} className="w-full">
                  {isPending ? '저장 중...' : '저장'}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-heading text-lg">
                  {wedding.event_type === 'wedding' && wedding.bride_name
                    ? `${wedding.groom_name} ♥ ${wedding.bride_name}`
                    : wedding.groom_name}
                </p>
                {wedding.wedding_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {formatKoreanDate(wedding.wedding_date)}
                  </div>
                )}
                {wedding.venue && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {wedding.venue}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Share */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" />
              파트너 공유
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              아래 링크를 파트너에게 보내면 함께 관리할 수 있습니다.
            </p>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="text-xs" />
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                {partnerCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              초대 코드: <span className="font-mono font-bold">{wedding.share_code}</span>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reception Helper Link */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <QrCode className="w-4 h-4 text-primary" />
              접수 도우미 링크
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              접수 도우미에게 이 링크를 공유하세요 (가입 불필요)
            </p>
            <div className="flex gap-2">
              <Input
                value={receptionUrl}
                readOnly
                className="text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  await navigator.clipboard.writeText(receptionUrl);
                  setReceptionCopied(true);
                  toast.success('접수 도우미 링크가 복사되었습니다');
                  setTimeout(() => setReceptionCopied(false), 2000);
                }}
              >
                {receptionCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Export */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <Button variant="outline" className="w-full" onClick={handleExportCsv}>
              <Download className="w-4 h-4 mr-2" />
              CSV 내보내기
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Thank You Messages */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Link href="/thanks">
          <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">감사 인사</p>
                  <p className="text-xs text-muted-foreground">{`${labels.guest}에게 감사 메시지 보내기`}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* Settlement */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link href="/settlement">
          <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calculator className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{initialWedding.event_type === 'wedding' ? '양가 정산' : '정산'}</p>
                  <p className="text-xs text-muted-foreground">{`${labels.event} 비용과 ${labels.gift} 정산`}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          variant="ghost"
          className="w-full text-muted-foreground"
          onClick={handleSignOut}
          disabled={isPending}
        >
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </Button>
      </motion.div>

      <p className="text-center text-xs text-muted-foreground pt-4">
        {`${labels.gift} 관리 대장 v1.0`}
      </p>
    </div>
  );
}
