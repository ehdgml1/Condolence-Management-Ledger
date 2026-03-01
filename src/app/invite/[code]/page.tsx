import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { weddings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { InviteContent } from './invite-content';

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const wedding = await db.select({
    id: weddings.id,
    bride_name: weddings.bride_name,
    groom_name: weddings.groom_name,
    wedding_date: weddings.wedding_date,
    venue: weddings.venue,
    event_type: weddings.event_type,
  }).from(weddings).where(eq(weddings.share_code, code)).get();

  if (!wedding) {
    redirect('/login?error=invalid-code');
  }

  const session = await auth();
  const isLoggedIn = !!session?.user;

  return <InviteContent wedding={wedding} code={code} isLoggedIn={isLoggedIn} />;
}
