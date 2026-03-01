import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { profiles, weddings, eventMembers } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { getActiveWeddingId } from '@/lib/active-event';
import { WeddingProvider } from '@/hooks/use-wedding';
import { AppShell } from '@/components/layout/AppShell';
import type { Wedding, Profile, EventMember } from '@/lib/types';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;
  const activeWeddingId = await getActiveWeddingId();

  if (!activeWeddingId) {
    redirect('/events');
  }

  // Verify access to active wedding
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

  let members = await db.select().from(eventMembers)
    .where(eq(eventMembers.wedding_id, wedding.id))
    .orderBy(asc(eventMembers.sort_order))
    .all();

  // Auto-fix: for condolence events, ensure the representative is included as a member
  if (wedding.event_type === 'condolence') {
    const repName = wedding.groom_name;
    const hasRep = members.some(m => m.name === repName);
    if (!hasRep) {
      const inserted = await db.insert(eventMembers).values({
        wedding_id: wedding.id,
        name: repName,
        display_name: repName,
        sort_order: -1,
      }).returning().get();
      members = [inserted, ...members];
    }
  }

  // Compute event name for AppShell header
  const eventName = wedding.event_type === 'wedding' && wedding.bride_name
    ? `${wedding.groom_name} ♥ ${wedding.bride_name}`
    : wedding.groom_name;

  return (
    <WeddingProvider wedding={wedding as Wedding} profile={profile as Profile} members={members as EventMember[]}>
      <AppShell eventType={wedding.event_type} eventName={eventName}>{children}</AppShell>
    </WeddingProvider>
  );
}
