import { getGuests } from '@/actions/guests';
import { getTemplates } from '@/actions/thanks';
import { getWeddingSession } from '@/lib/get-wedding-session';
import { ThanksPageContent } from './thanks-content';

export default async function ThanksPage() {
  const { wedding } = await getWeddingSession();

  const [guests, templates] = await Promise.all([
    getGuests(wedding.id),
    getTemplates(wedding.id),
  ]);

  return (
    <ThanksPageContent
      guests={guests}
      templates={templates}
      weddingId={wedding.id}
      wedding={wedding}
    />
  );
}
