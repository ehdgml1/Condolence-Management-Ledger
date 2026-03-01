'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { guests } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireWeddingAccess, requireGuestAccess } from '@/lib/db/auth-helper';
import type { Guest, GuestFormData, GroupName, PaymentMethod } from '@/lib/types';

const VALID_GROUPS: GroupName[] = ['가족', '친척', '친구', '직장', '기타'];
const VALID_PAYMENT_METHODS: PaymentMethod[] = ['cash', 'transfer'];

function validateGuestData(formData: Partial<GuestFormData>): string | null {
  if (formData.name !== undefined && !formData.name.trim()) return '이름을 입력해주세요';
  if (formData.gift_amount !== undefined && formData.gift_amount < 0) return '금액은 0 이상이어야 합니다';
  if (formData.meal_tickets !== undefined && formData.meal_tickets < 0) return '식권 수는 0 이상이어야 합니다';
  if (formData.side !== undefined && !formData.side.trim()) return '소속을 선택해주세요';
  if (formData.group_name !== undefined && !VALID_GROUPS.includes(formData.group_name)) return '올바른 관계를 선택해주세요';
  if (formData.payment_method !== undefined && !VALID_PAYMENT_METHODS.includes(formData.payment_method)) return '올바른 결제 방식을 선택해주세요';
  return null;
}

export async function getGuests(weddingId: string): Promise<Guest[]> {
  try { await requireWeddingAccess(weddingId) } catch { return [] }

  return await db.select().from(guests)
    .where(eq(guests.wedding_id, weddingId))
    .orderBy(desc(guests.created_at))
    .all() as Guest[];
}

export async function getGuest(guestId: string): Promise<Guest | null> {
  try { const { guest } = await requireGuestAccess(guestId); return guest as Guest } catch { return null }
}

export async function createGuest(weddingId: string, formData: GuestFormData) {
  try { await requireWeddingAccess(weddingId) } catch { return { error: '접근 권한이 없습니다' } }

  const validationError = validateGuestData(formData);
  if (validationError) return { error: validationError };

  const guest = await db.insert(guests).values({
    wedding_id: weddingId,
    name: formData.name.trim(),
    side: formData.side,
    group_name: formData.group_name,
    relationship: formData.relationship?.trim() || null,
    phone: formData.phone?.trim() || null,
    gift_amount: formData.gift_amount || 0,
    meal_tickets: formData.meal_tickets || 0,
    attended: formData.attended,
    memo: formData.memo?.trim() || null,
    payment_method: formData.payment_method ?? 'cash',
    envelope_number: formData.envelope_number ?? null,
    gift_received: formData.gift_received ?? false,
    gift_returned: formData.gift_returned ?? false,
  }).returning().get();

  revalidatePath('/guests');
  revalidatePath('/dashboard');
  revalidatePath('/stats');
  return { data: guest as Guest };
}

export async function updateGuest(guestId: string, formData: Partial<GuestFormData>) {
  try { await requireGuestAccess(guestId) } catch { return { error: '접근 권한이 없습니다' } }

  const validationError = validateGuestData(formData);
  if (validationError) return { error: validationError };

  const updateData: Record<string, unknown> = {};
  if (formData.name !== undefined) updateData.name = formData.name.trim();
  if (formData.side !== undefined) updateData.side = formData.side;
  if (formData.group_name !== undefined) updateData.group_name = formData.group_name;
  if (formData.relationship !== undefined) updateData.relationship = formData.relationship?.trim() || null;
  if (formData.phone !== undefined) updateData.phone = formData.phone?.trim() || null;
  if (formData.gift_amount !== undefined) updateData.gift_amount = formData.gift_amount;
  if (formData.meal_tickets !== undefined) updateData.meal_tickets = formData.meal_tickets;
  if (formData.attended !== undefined) updateData.attended = formData.attended;
  if (formData.memo !== undefined) updateData.memo = formData.memo?.trim() || null;
  if (formData.payment_method !== undefined) updateData.payment_method = formData.payment_method;
  if (formData.envelope_number !== undefined) updateData.envelope_number = formData.envelope_number;
  if (formData.gift_received !== undefined) updateData.gift_received = formData.gift_received;
  if (formData.gift_returned !== undefined) updateData.gift_returned = formData.gift_returned;

  const guest = await db.update(guests).set(updateData).where(eq(guests.id, guestId)).returning().get();

  revalidatePath('/guests');
  revalidatePath('/dashboard');
  revalidatePath('/stats');
  return { data: guest as Guest };
}

export async function deleteGuest(guestId: string) {
  try { await requireGuestAccess(guestId) } catch { return { error: '접근 권한이 없습니다' } }

  await db.delete(guests).where(eq(guests.id, guestId)).run();

  revalidatePath('/guests');
  revalidatePath('/dashboard');
  revalidatePath('/stats');
  return { success: true };
}

export async function updateGuestThanked(guestId: string, thanked: boolean) {
  try { await requireGuestAccess(guestId) } catch { return { error: '접근 권한이 없습니다' } }

  await db.update(guests).set({ thanked }).where(eq(guests.id, guestId)).run();

  revalidatePath('/thanks');
  return { success: true };
}

export async function updateGuestGiftReturned(guestId: string, giftReturned: boolean) {
  try { await requireGuestAccess(guestId) } catch { return { error: '접근 권한이 없습니다' } }

  await db.update(guests).set({ gift_returned: giftReturned }).where(eq(guests.id, guestId)).run();

  revalidatePath('/thanks');
  return { success: true };
}

export async function bulkCreateGuests(weddingId: string, guestList: GuestFormData[]) {
  try { await requireWeddingAccess(weddingId) } catch { return { error: '접근 권한이 없습니다' } }

  if (guestList.length > 500) return { error: '한 번에 최대 500명까지 등록할 수 있습니다' };

  for (const g of guestList) {
    const validationError = validateGuestData(g);
    if (validationError) return { error: `${g.name || '항목'}: ${validationError}` };
  }

  const guestsToInsert = guestList.map((g) => ({
    wedding_id: weddingId,
    name: g.name.trim(),
    side: g.side,
    group_name: g.group_name,
    relationship: g.relationship?.trim() || null,
    phone: g.phone?.trim() || null,
    gift_amount: g.gift_amount || 0,
    meal_tickets: g.meal_tickets || 0,
    attended: g.attended,
    memo: g.memo?.trim() || null,
    payment_method: g.payment_method ?? 'cash',
    envelope_number: g.envelope_number ?? null,
    gift_received: g.gift_received ?? false,
    gift_returned: g.gift_returned ?? false,
  }));

  const data = await db.insert(guests).values(guestsToInsert).returning().all();

  revalidatePath('/guests');
  revalidatePath('/dashboard');
  revalidatePath('/stats');
  return { data: data as Guest[] };
}
