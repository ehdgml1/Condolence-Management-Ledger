'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { eventMembers, guests, weddings } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { asc } from 'drizzle-orm';
import { requireWeddingAccess } from '@/lib/db/auth-helper';
import type { EventMember } from '@/lib/types';

export async function getEventMembers(weddingId: string): Promise<EventMember[]> {
  try { await requireWeddingAccess(weddingId); } catch { return []; }

  const members = await db.select().from(eventMembers)
    .where(eq(eventMembers.wedding_id, weddingId))
    .orderBy(asc(eventMembers.sort_order))
    .all() as EventMember[];

  // Auto-fix: for condolence events, ensure the representative is included as a member
  const wedding = await db.select().from(weddings).where(eq(weddings.id, weddingId)).get();
  if (wedding && wedding.event_type === 'condolence') {
    const repName = wedding.groom_name;
    const hasRep = members.some(m => m.name === repName);
    if (!hasRep) {
      // Insert representative as the first member
      const inserted = await db.insert(eventMembers).values({
        wedding_id: weddingId,
        name: repName,
        display_name: repName,
        sort_order: -1,
      }).returning().get() as EventMember;
      members.unshift(inserted);
    }
  }

  return members;
}

export async function createEventMember(
  weddingId: string,
  data: { name: string; display_name: string; sort_order?: number }
) {
  try { await requireWeddingAccess(weddingId); } catch { return { error: '접근 권한이 없습니다' }; }

  if (!data.name?.trim()) return { error: '멤버 이름을 입력해주세요' };
  if (!data.display_name?.trim()) return { error: '표시 이름을 입력해주세요' };

  // Check for duplicate name
  const existing = await db.select().from(eventMembers)
    .where(and(eq(eventMembers.wedding_id, weddingId), eq(eventMembers.name, data.name.trim())))
    .get();

  if (existing) return { error: '이미 같은 이름의 멤버가 있습니다' };

  const member = await db.insert(eventMembers).values({
    wedding_id: weddingId,
    name: data.name.trim(),
    display_name: data.display_name.trim(),
    sort_order: data.sort_order ?? 0,
  }).returning().get();

  revalidatePath('/', 'layout');
  return { data: member as EventMember };
}

export async function updateEventMember(
  memberId: string,
  data: Partial<{ name: string; display_name: string; sort_order: number }>
) {
  try {
    const member = await db.select({ wedding_id: eventMembers.wedding_id }).from(eventMembers).where(eq(eventMembers.id, memberId)).get();
    if (!member) return { error: '멤버를 찾을 수 없습니다' };
    await requireWeddingAccess(member.wedding_id);
  } catch { return { error: '접근 권한이 없습니다' }; }

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.display_name !== undefined) updateData.display_name = data.display_name.trim();
  if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;

  const member = await db.update(eventMembers).set(updateData).where(eq(eventMembers.id, memberId)).returning().get();

  revalidatePath('/', 'layout');
  return { data: member as EventMember };
}

export async function deleteEventMember(memberId: string) {
  const member = await db.select({ name: eventMembers.name, wedding_id: eventMembers.wedding_id })
    .from(eventMembers)
    .where(eq(eventMembers.id, memberId))
    .get();

  if (!member) return { error: '멤버를 찾을 수 없습니다' };
  try { await requireWeddingAccess(member.wedding_id); } catch { return { error: '접근 권한이 없습니다' }; }

  // Prevent deletion of the representative in condolence events
  const wedding = await db.select().from(weddings).where(eq(weddings.id, member.wedding_id)).get();
  if (wedding?.event_type === 'condolence' && member.name === wedding.groom_name) {
    return { error: '대표자는 삭제할 수 없습니다' };
  }

  const countResult = await db.select({ count: sql<number>`count(*)` })
    .from(guests)
    .where(and(eq(guests.wedding_id, member.wedding_id), eq(guests.side, member.name)))
    .get();

  const guestCount = countResult?.count ?? 0;
  if (guestCount > 0) {
    return { error: `이 멤버에 소속된 ${guestCount}명의 인원이 있어 삭제할 수 없습니다. 먼저 인원을 다른 멤버로 이동해주세요.` };
  }

  await db.delete(eventMembers).where(eq(eventMembers.id, memberId)).run();

  revalidatePath('/', 'layout');
  return { success: true };
}
