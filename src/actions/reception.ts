'use server';

import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';
import { weddings, eventMembers, guests } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { asc } from 'drizzle-orm';
import type { GroupName } from '@/lib/types';

const VALID_GROUPS: GroupName[] = ['가족', '친척', '친구', '직장', '기타'];

export async function getWeddingByCode(code: string) {
  return await db.select({
    id: weddings.id,
    bride_name: weddings.bride_name,
    groom_name: weddings.groom_name,
    wedding_date: weddings.wedding_date,
    share_code: weddings.share_code,
    event_type: weddings.event_type,
  }).from(weddings).where(eq(weddings.share_code, code)).get() ?? null;
}

export async function getEventMembersByWeddingId(weddingId: string) {
  return await db.select({ name: eventMembers.name, display_name: eventMembers.display_name })
    .from(eventMembers)
    .where(eq(eventMembers.wedding_id, weddingId))
    .orderBy(asc(eventMembers.sort_order))
    .all();
}

export async function addReceptionGuest(
  weddingId: string,
  data: { name: string; side: string; group_name: GroupName; envelope_number: number },
  pin: string,
) {
  const { success } = checkRateLimit(`reception:${weddingId}`, 10, 5 * 60 * 1000);
  if (!success) {
    return { error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' };
  }

  const wedding = await db.select({ share_code: weddings.share_code })
    .from(weddings)
    .where(eq(weddings.id, weddingId))
    .get();

  if (!wedding) return { error: '웨딩 정보를 찾을 수 없습니다' };

  const expectedPin = wedding.share_code.slice(-4).toUpperCase();
  if (!pin || pin.toUpperCase() !== expectedPin) {
    return { error: '인증번호가 올바르지 않습니다' };
  }

  if (!data.name?.trim()) return { error: '이름을 입력해주세요' };
  if (!data.side?.trim()) return { error: '소속을 선택해주세요' };
  if (!VALID_GROUPS.includes(data.group_name)) return { error: '올바른 관계를 선택해주세요' };

  const guest = await db.insert(guests).values({
    wedding_id: weddingId,
    name: data.name.trim(),
    side: data.side,
    group_name: data.group_name,
    gift_amount: 0,
    gift_received: true,
    attended: true,
    payment_method: 'cash',
    envelope_number: data.envelope_number,
  }).returning().get();

  return { data: guest };
}

export async function getReceptionCount(weddingId: string) {
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(guests)
    .where(eq(guests.wedding_id, weddingId))
    .get();
  return result?.count ?? 0;
}
