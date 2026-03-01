'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { clearActiveWeddingId } from '@/lib/active-event';
import { checkRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function login(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'unknown';
  const { success } = checkRateLimit(`login:${ip}`, 5, 60 * 1000);
  if (!success) {
    return { error: '너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요.' };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const rememberMe = formData.get('rememberMe') === 'on';

  try {
    await signIn('credentials', {
      email,
      password,
      rememberMe: String(rememberMe),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: '이메일 또는 비밀번호가 올바르지 않습니다' };
    }
    throw error;
  }

  revalidatePath('/', 'layout');
  redirect('/events');
}

export async function signup(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'unknown';
  const { success } = checkRateLimit(`signup:${ip}`, 3, 60 * 1000);
  if (!success) {
    return { error: '너무 많은 가입 시도입니다. 잠시 후 다시 시도해주세요.' };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!password || password.length < 8) {
    return { error: '비밀번호는 8자 이상이어야 합니다' };
  }

  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return { error: '비밀번호는 영문과 숫자를 모두 포함해야 합니다' };
  }

  // Check if email already exists
  const existing = await db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    return { error: '이미 사용 중인 이메일입니다' };
  }

  const password_hash = await bcrypt.hash(password, 12);
  await db.insert(users).values({ email, password_hash }).run();

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: '회원가입에 실패했습니다. 다시 시도해주세요.' };
    }
    throw error;
  }

  revalidatePath('/', 'layout');
  const VALID_EVENT_TYPES = ['wedding', 'condolence'];
  const eventType = formData.get('event_type') as string;
  const redirectUrl = (eventType && VALID_EVENT_TYPES.includes(eventType))
    ? `/onboarding?type=${eventType}`
    : '/onboarding';
  redirect(redirectUrl);
}

export async function signOutAction() {
  await clearActiveWeddingId();
  await signOut({ redirect: false });
  revalidatePath('/', 'layout');
  redirect('/');
}
