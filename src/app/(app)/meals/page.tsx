import { getGuests } from '@/actions/guests';
import { getWeddingSession } from '@/lib/get-wedding-session';
import { MealsPageContent } from './meals-content';

export default async function MealsPage() {
  const { wedding } = await getWeddingSession();
  const guests = await getGuests(wedding.id);

  return <MealsPageContent guests={guests} />;
}
