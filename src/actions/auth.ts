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

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    await signIn('credentials', {
      email,
      password,
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
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!password || password.length < 8) {
    return { error: '비밀번호는 8자 이상이어야 합니다' };
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
  const eventType = formData.get('event_type') as string;
  const redirectUrl = eventType ? `/onboarding?type=${eventType}` : '/onboarding';
  redirect(redirectUrl);
}

export async function signOutAction() {
  await clearActiveWeddingId();
  await signOut({ redirect: false });
  revalidatePath('/', 'layout');
  redirect('/');
}
