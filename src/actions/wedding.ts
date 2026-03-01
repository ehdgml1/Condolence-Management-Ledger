'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { weddings, profiles, eventMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUser, requireWeddingAccess } from '@/lib/db/auth-helper';
import type { EventType, ProfileRole } from '@/lib/types';
import { setActiveWeddingId } from '@/lib/active-event';

export async function createWedding(formData: FormData) {
  const userId = await getAuthUser();
  if (!userId) return { error: '로그인이 필요합니다' };

  const eventType = (((formData.get('event_type') as string) || 'wedding') as EventType);
  const groomName = formData.get('groom_name') as string;
  const brideName = formData.get('bride_name') as string;
  const weddingDate = formData.get('wedding_date') as string;
  const venue = formData.get('venue') as string;
  const role = formData.get('role') as ProfileRole;

  if (!groomName?.trim()) {
    return { error: eventType === 'wedding' ? '신랑 이름을 입력해주세요' : '대표 이름을 입력해주세요' };
  }
  if (eventType === 'wedding' && !brideName?.trim()) {
    return { error: '신부 이름을 입력해주세요' };
  }

  const wedding = await db.insert(weddings).values({
    bride_name: eventType === 'wedding' ? brideName.trim() : null,
    groom_name: groomName.trim(),
    wedding_date: weddingDate || null,
    venue: venue?.trim() || null,
    owner_id: userId,
    event_type: eventType,
  }).returning().get();

  // Create event_members
  if (eventType === 'wedding') {
    await db.insert(eventMembers).values([
      { wedding_id: wedding.id, name: '신랑', display_name: groomName.trim(), sort_order: 0 },
      { wedding_id: wedding.id, name: '신부', display_name: brideName.trim(), sort_order: 1 },
    ]).run();
  } else {
    // Condolence: always include the representative as the first member
    const repName = groomName.trim();
    const allMembers: { wedding_id: string; name: string; display_name: string; sort_order: number }[] = [
      { wedding_id: wedding.id, name: repName, display_name: repName, sort_order: 0 },
    ];

    const memberNames = (formData.get('member_names') as string || '').split(',').filter(n => n.trim());
    for (let i = 0; i < memberNames.length; i++) {
      const name = memberNames[i].trim();
      // Skip if same name as representative (avoid duplicate)
      if (name === repName) continue;
      allMembers.push({
        wedding_id: wedding.id,
        name,
        display_name: name,
        sort_order: allMembers.length,
      });
    }

    await db.insert(eventMembers).values(allMembers).run();
  }

  // Create profile
  const profileRole: ProfileRole = eventType === 'wedding' ? (role || 'groom' as ProfileRole) : 'groom';
  const profileName = eventType === 'wedding'
    ? (role === 'bride' ? brideName.trim() : groomName.trim())
    : groomName.trim();

  await db.insert(profiles).values({
    user_id: userId,
    wedding_id: wedding.id,
    name: profileName,
    role: profileRole,
  }).run();

  revalidatePath('/', 'layout');
  await setActiveWeddingId(wedding.id);
  redirect('/dashboard');
}

export async function updateWedding(formData: FormData) {
  const userId = await getAuthUser();
  if (!userId) return { error: '로그인이 필요합니다' };

  const weddingId = formData.get('wedding_id') as string;
  const brideName = formData.get('bride_name') as string;
  const groomName = formData.get('groom_name') as string;
  const weddingDate = formData.get('wedding_date') as string;
  const venue = formData.get('venue') as string;

  try { await requireWeddingAccess(weddingId); } catch { return { error: '접근 권한이 없습니다' }; }
  const existing = await db.select().from(weddings).where(eq(weddings.id, weddingId)).get();
  if (!existing) return { error: '이벤트를 찾을 수 없습니다' };

  await db.update(weddings)
    .set({
      bride_name: existing.event_type === 'wedding' ? (brideName?.trim() || null) : null,
      groom_name: groomName.trim(),
      wedding_date: weddingDate || null,
      venue: venue?.trim() || null,
    })
    .where(eq(weddings.id, weddingId))
    .run();

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function joinWeddingByCode(shareCode: string) {
  const userId = await getAuthUser();
  if (!userId) return { error: '로그인이 필요합니다' };

  const wedding = await db.select().from(weddings).where(eq(weddings.share_code, shareCode)).get();
  if (!wedding) return { error: '유효하지 않은 초대 코드입니다' };

  const existing = await db.select().from(profiles)
    .where(and(eq(profiles.user_id, userId), eq(profiles.wedding_id, wedding.id)))
    .get();

  if (existing) {
    await setActiveWeddingId(wedding.id);
    redirect('/dashboard');
  }

  await db.insert(profiles).values({
    user_id: userId,
    wedding_id: wedding.id,
    name: '파트너',
    role: (wedding.event_type === 'condolence' ? 'planner' : 'bride') as ProfileRole,
  }).run();

  revalidatePath('/', 'layout');
  await setActiveWeddingId(wedding.id);
  redirect('/dashboard');
}
