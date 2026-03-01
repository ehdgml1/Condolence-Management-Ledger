import { getGuests } from '@/actions/guests';
import { getWeddingSession } from '@/lib/get-wedding-session';
import { GuestsPageContent } from './guests-content';

export default async function GuestsPage() {
  const { wedding } = await getWeddingSession();
  const guests = await getGuests(wedding.id);

  return <GuestsPageContent initialGuests={guests} weddingId={wedding.id} />;
}
