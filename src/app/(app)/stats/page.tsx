import { calculateStats } from '@/lib/utils';
import { getGuests } from '@/actions/guests';
import { getWeddingSession } from '@/lib/get-wedding-session';
import { getEventMembers } from '@/actions/event-members';
import { StatsPageContent } from './stats-content';

export default async function StatsPage() {
  const { wedding } = await getWeddingSession();
  const [guests, members] = await Promise.all([
    getGuests(wedding.id),
    getEventMembers(wedding.id),
  ]);
  const memberNames = members.map(m => m.name);
  const stats = calculateStats(guests, memberNames);

  return <StatsPageContent wedding={wedding} stats={stats} guests={guests} members={members} />;
}
