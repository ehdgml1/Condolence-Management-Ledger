'use client';

import { useState, useTransition, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useWedding } from '@/hooks/use-wedding';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import { bulkCreateGuests } from '@/actions/guests';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import type { GuestFormData, GroupName } from '@/lib/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 500;

interface CsvImportProps {
  onImport: () => void;
}

interface CsvRow {
  이름?: string;
  name?: string;
  소속?: string;
  side?: string;
  그룹?: string;
  group?: string;
  관계?: string;
  relationship?: string;
  연락처?: string;
  phone?: string;
  축의금?: string;
  부조금?: string;
  gift_amount?: string;
  참석?: string;
  attended?: string;
  메모?: string;
  memo?: string;
}

export function CsvImport({ onImport }: CsvImportProps) {
  const { wedding, members } = useWedding();
  const labels = EVENT_TYPE_LABELS[wedding.event_type || 'wedding'];
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [parsed, setParsed] = useState<GuestFormData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const validSides = members.map(m => m.name);
  const validGroups: GroupName[] = ['가족', '친척', '친구', '직장', '기타'];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('파일 크기는 5MB 이하여야 합니다');
      return;
    }

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length > MAX_ROWS) {
          toast.error(`최대 ${MAX_ROWS}명까지 가져올 수 있습니다`);
          return;
        }

        const guests: GuestFormData[] = [];
        const parseErrors: string[] = [];

        results.data.forEach((row, index) => {
          const name = row['이름'] || row['name'] || '';
          if (!name.trim()) {
            parseErrors.push(`${index + 2}번째 행: 이름이 비어있습니다`);
            return;
          }

          const sideRaw = row['소속'] || row['side'] || validSides[0] || '';
          const side = validSides.includes(sideRaw) ? sideRaw : (validSides[0] || '');

          const groupRaw = row['그룹'] || row['group'] || '기타';
          const groupName = validGroups.includes(groupRaw as GroupName) ? (groupRaw as GroupName) : '기타';

          guests.push({
            name: name.trim(),
            side,
            group_name: groupName,
            relationship: (row['관계'] || row['relationship'] || '').trim(),
            phone: (row['연락처'] || row['phone'] || '').trim(),
            gift_amount: parseInt(row['축의금'] || row['부조금'] || row['gift_amount'] || '0') || 0,
            meal_tickets: 0,
            attended: (row['참석'] || row['attended'] || '').toLowerCase() === 'true' || row['참석'] === 'O' || row['참석'] === 'o',
            memo: (row['메모'] || row['memo'] || '').trim(),
            payment_method: 'cash',
            envelope_number: null,
            gift_received: false,
            gift_returned: false,
          });
        });

        setParsed(guests);
        setErrors(parseErrors);
      },
      error: () => {
        toast.error('CSV 파일을 읽을 수 없습니다.');
      },
    });
  };

  const handleImport = () => {
    if (parsed.length === 0) return;

    startTransition(async () => {
      setProgress(10);
      const result = await bulkCreateGuests(wedding.id, parsed);
      setProgress(100);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`${parsed.length}명이 등록되었습니다.`);
      onImport();
      setParsed([]);
      setErrors([]);
      setProgress(0);
      setIsOpen(false);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-1" />
          CSV 가져오기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">CSV 가져오기</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>{`CSV 파일 컬럼: 이름, 소속(${validSides.join('/')}), 그룹, 관계, 연락처, ${labels.gift}, 참석(O/X), 메모`}</p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            variant="outline"
            className="w-full h-24 border-dashed"
            onClick={() => fileRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm">CSV 파일 선택</span>
            </div>
          </Button>

          {parsed.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-3 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm">{`${parsed.length}명의 ${labels.guest} 정보를 읽었습니다.`}</span>
              </CardContent>
            </Card>
          )}

          {errors.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-medium">경고</span>
                </div>
                <ul className="text-xs text-amber-800 space-y-1">
                  {errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {errors.length > 5 && <li>...외 {errors.length - 5}건</li>}
                </ul>
              </CardContent>
            </Card>
          )}

          {isPending && <Progress value={progress} className="h-2" />}

          <Button
            onClick={handleImport}
            disabled={parsed.length === 0 || isPending}
            className="w-full"
          >
            {isPending ? '등록 중...' : `${parsed.length}명 등록하기`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
