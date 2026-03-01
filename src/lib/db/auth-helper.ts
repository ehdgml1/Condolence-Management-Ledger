import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { profiles, guests } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function getAuthUser(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function requireAuth(): Promise<string> {
  const userId = await getAuthUser();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

export async function requireWeddingAccess(weddingId: string): Promise<string> {
  const userId = await requireAuth();
  const profile = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.user_id, userId), eq(profiles.wedding_id, weddingId)))
    .get();
  if (!profile) throw new Error('Forbidden');
  return userId;
}

export async function requireGuestAccess(
  guestId: string
): Promise<{ userId: string; guest: typeof guests.$inferSelect }> {
  const userId = await requireAuth();
  const guest = await db.select().from(guests).where(eq(guests.id, guestId)).get();
  if (!guest) throw new Error('Not Found');
  const profile = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.user_id, userId), eq(profiles.wedding_id, guest.wedding_id)))
    .get();
  if (!profile) throw new Error('Forbidden');
  return { userId, guest };
}
