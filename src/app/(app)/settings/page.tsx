import { getGuests } from '@/actions/guests';
import { getEventMembers } from '@/actions/event-members';
import { getWeddingSession } from '@/lib/get-wedding-session';
import { SettingsPageContent } from './settings-content';

export default async function SettingsPage() {
  const { wedding, profile } = await getWeddingSession();
  const [guests, members] = await Promise.all([
    getGuests(wedding.id),
    getEventMembers(wedding.id),
  ]);

  return (
    <SettingsPageContent
      wedding={wedding}
      profile={profile}
      guests={guests}
      members={members}
    />
  );
}
