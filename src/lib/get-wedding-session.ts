import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { profiles, weddings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getActiveWeddingId } from '@/lib/active-event';
import type { Profile, Wedding } from '@/lib/types';

export interface WeddingSession {
  user: { id: string; email: string };
  profile: Profile;
  wedding: Wedding;
}

export async function getWeddingSession(): Promise<WeddingSession> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;
  const activeWeddingId = await getActiveWeddingId();

  if (!activeWeddingId) {
    redirect('/events');
  }

  // Verify access
  const profile = await db.select().from(profiles)
    .where(and(eq(profiles.user_id, userId), eq(profiles.wedding_id, activeWeddingId)))
    .get();

  if (!profile) {
    redirect('/events');
  }

  const wedding = await db.select().from(weddings).where(eq(weddings.id, activeWeddingId)).get();
  if (!wedding) {
    redirect('/events');
  }

  return {
    user: { id: userId, email: session.user.email! },
    profile: profile as Profile,
    wedding: wedding as Wedding,
  };
}
