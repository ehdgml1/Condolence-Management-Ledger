import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getGuest } from '@/actions/guests';
import { GuestDetailContent } from './guest-detail-content';

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect('/login');

  const guest = await getGuest(id);
  if (!guest) notFound();

  return <GuestDetailContent guest={guest} />;
}
