'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { profiles, weddings, guests, thankTemplates, weddingCosts, eventMembers } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getAuthUser } from '@/lib/db/auth-helper';
import { setActiveWeddingId } from '@/lib/active-event';
import type { Wedding } from '@/lib/types';

export interface UserEvent {
  wedding: Wedding;
  role: string;
}

export async function getUserEvents(): Promise<UserEvent[]> {
  const userId = await getAuthUser();
  if (!userId) return [];

  const userProfiles = await db.select().from(profiles).where(eq(profiles.user_id, userId)).all();
  if (userProfiles.length === 0) return [];

  const weddingIds = userProfiles.map(p => p.wedding_id);
  const userWeddings = await db.select().from(weddings).where(inArray(weddings.id, weddingIds)).all();

  const results: UserEvent[] = [];
  for (const profile of userProfiles) {
    const wedding = userWeddings.find(w => w.id === profile.wedding_id);
    if (wedding) {
      results.push({ wedding: wedding as Wedding, role: profile.role });
    }
  }
  return results;
}

export async function switchEvent(weddingId: string) {
  const userId = await getAuthUser();
  if (!userId) redirect('/login');

  // Verify user has access to this wedding
  const profile = await db.select().from(profiles)
    .where(and(eq(profiles.user_id, userId), eq(profiles.wedding_id, weddingId)))
    .get();

  if (!profile) {
    return { error: '접근 권한이 없습니다' };
  }

  await setActiveWeddingId(weddingId);
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function deleteEvent(weddingId: string) {
  const userId = await getAuthUser();
  if (!userId) return { error: '로그인이 필요합니다' };

  // Only owner can delete
  const wedding = await db.select().from(weddings)
    .where(and(eq(weddings.id, weddingId), eq(weddings.owner_id, userId)))
    .get();

  if (!wedding) {
    return { error: '삭제 권한이 없습니다' };
  }

  // Delete all related data (cascade)
  await db.delete(guests).where(eq(guests.wedding_id, weddingId)).run();
  await db.delete(thankTemplates).where(eq(thankTemplates.wedding_id, weddingId)).run();
  await db.delete(weddingCosts).where(eq(weddingCosts.wedding_id, weddingId)).run();
  await db.delete(eventMembers).where(eq(eventMembers.wedding_id, weddingId)).run();
  await db.delete(profiles).where(eq(profiles.wedding_id, weddingId)).run();
  await db.delete(weddings).where(eq(weddings.id, weddingId)).run();

  revalidatePath('/', 'layout');
  return { success: true };
}
