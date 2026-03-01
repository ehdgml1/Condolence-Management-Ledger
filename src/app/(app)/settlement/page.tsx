import { getGuests } from '@/actions/guests';
import { getWeddingCosts } from '@/actions/settlement';
import { getWeddingSession } from '@/lib/get-wedding-session';
import { SettlementContent } from './settlement-content';

export default async function SettlementPage() {
  const { wedding } = await getWeddingSession();

  const [guests, costs] = await Promise.all([
    getGuests(wedding.id),
    getWeddingCosts(wedding.id),
  ]);

  return (
    <SettlementContent
      wedding={wedding}
      guests={guests}
      initialCosts={costs}
    />
  );
}
