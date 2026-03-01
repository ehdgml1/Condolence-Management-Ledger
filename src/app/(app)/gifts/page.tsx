import { getGuests } from '@/actions/guests';
import { getWeddingSession } from '@/lib/get-wedding-session';
import { GiftsPageContent } from './gifts-content';

export default async function GiftsPage() {
  const { wedding } = await getWeddingSession();
  const guests = await getGuests(wedding.id);

  return <GiftsPageContent initialGuests={guests} weddingId={wedding.id} />;
}
