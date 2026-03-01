import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { profiles, weddings } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { EventSelectorContent } from './event-selector-content';
import type { Wedding } from '@/lib/types';

export default async function EventsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;
  const userProfiles = await db.select().from(profiles).where(eq(profiles.user_id, userId)).all();

  if (userProfiles.length === 0) {
    redirect('/onboarding');
  }

  const weddingIds = userProfiles.map(p => p.wedding_id);
  const userWeddings = await db.select().from(weddings).where(inArray(weddings.id, weddingIds)).all();

  const events: { wedding: Wedding; role: string }[] = [];
  for (const profile of userProfiles) {
    const wedding = userWeddings.find(w => w.id === profile.wedding_id);
    if (wedding) {
      events.push({ wedding: wedding as Wedding, role: profile.role });
    }
  }

  if (events.length === 0) {
    redirect('/onboarding');
  }

  return <EventSelectorContent events={events} />;
}
