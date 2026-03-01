'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { guests } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireWeddingAccess, requireGuestAccess } from '@/lib/db/auth-helper';
import type { Guest, QuickEntryData, GroupName, PaymentMethod } from '@/lib/types';

const VALID_GROUPS: GroupName[] = ['가족', '친척', '친구', '직장', '기타'];
const VALID_PAYMENT_METHODS: PaymentMethod[] = ['cash', 'transfer'];

export async function quickAddGift(
  weddingId: string,
  data: QuickEntryData & { envelope_number?: number; gift_received?: boolean },
) {
  try { await requireWeddingAccess(weddingId); } catch { return { error: '접근 권한이 없습니다' }; }

  if (!data.name?.trim()) return { error: '이름을 입력해주세요' };
  if (data.gift_amount < 0) return { error: '금액은 0 이상이어야 합니다' };
  if (!data.side?.trim()) return { error: '소속을 선택해주세요' };
  if (!VALID_GROUPS.includes(data.group_name)) return { error: '올바른 관계를 선택해주세요' };
  if (!VALID_PAYMENT_METHODS.includes(data.payment_method)) return { error: '올바른 결제 방식을 선택해주세요' };

  const guest = await db.insert(guests).values({
    wedding_id: weddingId,
    name: data.name.trim(),
    side: data.side,
    group_name: data.group_name,
    gift_amount: data.gift_amount,
    attended: data.attended,
    payment_method: data.payment_method,
    envelope_number: data.envelope_number ?? null,
    gift_received: data.gift_received ?? false,
  }).returning().get();

  revalidatePath('/gifts');
  revalidatePath('/dashboard');
  revalidatePath('/stats');
  return { data: guest as Guest };
}

export async function updateGiftAmount(guestId: string, amount: number) {
  try { await requireGuestAccess(guestId); } catch { return { error: '접근 권한이 없습니다' }; }

  if (amount < 0) return { error: '금액은 0 이상이어야 합니다' };

  await db.update(guests).set({ gift_amount: amount }).where(eq(guests.id, guestId)).run();

  revalidatePath('/gifts');
  revalidatePath('/dashboard');
  revalidatePath('/stats');
  return { success: true };
}
