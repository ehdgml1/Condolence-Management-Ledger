'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Wedding, Profile, EventMember } from '@/lib/types';

interface WeddingContextType {
  wedding: Wedding;
  profile: Profile;
  members: EventMember[];
}

const WeddingContext = createContext<WeddingContextType | null>(null);

export function WeddingProvider({
  wedding,
  profile,
  members,
  children,
}: {
  wedding: Wedding;
  profile: Profile;
  members: EventMember[];
  children: ReactNode;
}) {
  return (
    <WeddingContext.Provider value={{ wedding, profile, members }}>
      {children}
    </WeddingContext.Provider>
  );
}

export function useWedding() {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within WeddingProvider');
  }
  return context;
}
