import { cookies } from 'next/headers';

const COOKIE_NAME = 'active-wedding-id';
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function getActiveWeddingId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function setActiveWeddingId(weddingId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, weddingId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
}

export async function clearActiveWeddingId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
