'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { guests } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireWeddingAccess, requireGuestAccess } from '@/lib/db/auth-helper';

export async function updateMealTickets(guestId: string, mealTickets: number) {
  try { await requireGuestAccess(guestId); } catch { return { error: '접근 권한이 없습니다' }; }

  if (mealTickets < 0) return { error: '식권 수는 0 이상이어야 합니다' };

  await db.update(guests).set({ meal_tickets: mealTickets }).where(eq(guests.id, guestId)).run();

  revalidatePath('/meals');
  return { success: true };
}

export async function getMealStats(weddingId: string) {
  try { await requireWeddingAccess(weddingId); } catch { return { totalTickets: 0, totalAttended: 0 }; }

  const data = await db.select({ meal_tickets: guests.meal_tickets, attended: guests.attended })
    .from(guests)
    .where(eq(guests.wedding_id, weddingId))
    .all();

  const totalTickets = data.reduce((sum, g) => sum + (g.meal_tickets || 0), 0);
  const totalAttended = data.filter((g) => g.attended).length;

  return { totalTickets, totalAttended };
}
