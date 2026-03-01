import { calculateStats } from '@/lib/utils';
import { getGuests } from '@/actions/guests';
import { getEventMembers } from '@/actions/event-members';
import { getWeddingSession } from '@/lib/get-wedding-session';
import { DashboardContent } from './dashboard-content';

export default async function DashboardPage() {
  const { wedding } = await getWeddingSession();
  const [guests, members] = await Promise.all([
    getGuests(wedding.id),
    getEventMembers(wedding.id),
  ]);
  const memberNames = members.map(m => m.name);
  const stats = calculateStats(guests, memberNames);

  return <DashboardContent wedding={wedding} stats={stats} guests={guests} members={members} />;
}
