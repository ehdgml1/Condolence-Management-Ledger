import type { NextAuthConfig } from 'next-auth';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 365 * 24 * 60 * 60, // 365 days (for remember-me)
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    jwt({ token, user }: { token: Record<string, unknown>; user?: { id?: string; rememberMe?: boolean } }) {
      if (user) {
        token.id = user.id;
        token.rememberMe = (user as { rememberMe?: boolean }).rememberMe ?? true;
        token.loginAt = Date.now();
      }

      // Invalidate non-remember sessions after 7 days
      if (!token.rememberMe && token.loginAt) {
        if (Date.now() - (token.loginAt as number) > SEVEN_DAYS) {
          return {} as Record<string, unknown>;
        }
      }

      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session({ session, token }: { session: any; token: any }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Populated in auth.ts with Credentials
} satisfies NextAuthConfig;
