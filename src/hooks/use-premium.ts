'use client';

const UNLIMITED_FEATURES = {
  maxGuests: Infinity,
  mealTickets: true,
  thankMessages: true,
};

export function usePremium() {
  return {
    isPremium: true,
    features: UNLIMITED_FEATURES,
    canAddGuest: (_currentCount: number) => true,
  };
}
