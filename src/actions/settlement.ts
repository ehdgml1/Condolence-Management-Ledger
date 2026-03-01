'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { weddingCosts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireWeddingAccess } from '@/lib/db/auth-helper';
import type { WeddingCost } from '@/lib/types';

export async function getWeddingCosts(weddingId: string): Promise<WeddingCost[]> {
  try { await requireWeddingAccess(weddingId); } catch { return []; }

  return await db.select().from(weddingCosts)
    .where(eq(weddingCosts.wedding_id, weddingId))
    .orderBy(desc(weddingCosts.created_at))
    .all() as WeddingCost[];
}

export async function createWeddingCost(
  weddingId: string,
  data: { category: string; description: string; amount: number; paid_by: string }
) {
  try { await requireWeddingAccess(weddingId); } catch { return { error: '접근 권한이 없습니다' }; }

  if (!data.category?.trim()) return { error: '카테고리를 입력해주세요' };
  if (data.amount < 0) return { error: '금액은 0 이상이어야 합니다' };
  if (!data.paid_by?.trim()) return { error: '부담 구분을 선택해주세요' };

  const cost = await db.insert(weddingCosts).values({
    wedding_id: weddingId,
    category: data.category.trim(),
    description: data.description.trim(),
    amount: data.amount,
    paid_by: data.paid_by,
  }).returning().get();

  revalidatePath('/settlement');
  return { data: cost as WeddingCost };
}

export async function updateWeddingCost(
  costId: string,
  data: Partial<{ category: string; description: string; amount: number; paid_by: string }>
) {
  try {
    const cost = await db.select({ wedding_id: weddingCosts.wedding_id }).from(weddingCosts).where(eq(weddingCosts.id, costId)).get();
    if (!cost) return { error: '항목을 찾을 수 없습니다' };
    await requireWeddingAccess(cost.wedding_id);
  } catch { return { error: '접근 권한이 없습니다' }; }

  if (data.category !== undefined && !data.category.trim()) return { error: '카테고리를 입력해주세요' };
  if (data.amount !== undefined && data.amount < 0) return { error: '금액은 0 이상이어야 합니다' };
  if (data.paid_by !== undefined && !data.paid_by.trim()) return { error: '부담 구분을 선택해주세요' };

  const updateData: Record<string, unknown> = {};
  if (data.category !== undefined) updateData.category = data.category.trim();
  if (data.description !== undefined) updateData.description = data.description.trim();
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.paid_by !== undefined) updateData.paid_by = data.paid_by;

  const cost = await db.update(weddingCosts).set(updateData).where(eq(weddingCosts.id, costId)).returning().get();

  revalidatePath('/settlement');
  return { data: cost as WeddingCost };
}

export async function deleteWeddingCost(costId: string) {
  try {
    const cost = await db.select({ wedding_id: weddingCosts.wedding_id }).from(weddingCosts).where(eq(weddingCosts.id, costId)).get();
    if (!cost) return { error: '항목을 찾을 수 없습니다' };
    await requireWeddingAccess(cost.wedding_id);
  } catch { return { error: '접근 권한이 없습니다' }; }

  await db.delete(weddingCosts).where(eq(weddingCosts.id, costId)).run();

  revalidatePath('/settlement');
  return { success: true };
}
