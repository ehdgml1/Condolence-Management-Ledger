'use client';

import { useState, useCallback, useOptimistic } from 'react';
import type { Guest } from '@/lib/types';
import { useRealtimeGuests } from './use-realtime';

type GuestAction =
  | { type: 'add'; guest: Guest }
  | { type: 'update'; guest: Guest }
  | { type: 'delete'; id: string };

export function useGuests(initialGuests: Guest[], weddingId: string) {
  const [guests, setGuests] = useState(initialGuests);
  const [optimisticGuests, addOptimistic] = useOptimistic(
    guests,
    (state: Guest[], action: GuestAction) => {
      switch (action.type) {
        case 'add':
          return [...state, action.guest];
        case 'update':
          return state.map((g) => (g.id === action.guest.id ? action.guest : g));
        case 'delete':
          return state.filter((g) => g.id !== action.id);
        default:
          return state;
      }
    }
  );

  const handleInsert = useCallback((guest: Guest) => {
    setGuests((prev) => {
      if (prev.some((g) => g.id === guest.id)) return prev;
      return [...prev, guest];
    });
  }, []);

  const handleUpdate = useCallback((guest: Guest) => {
    setGuests((prev) => prev.map((g) => (g.id === guest.id ? guest : g)));
  }, []);

  const handleDelete = useCallback((old: { id: string }) => {
    setGuests((prev) => prev.filter((g) => g.id !== old.id));
  }, []);

  useRealtimeGuests(weddingId, handleInsert, handleUpdate, handleDelete);

  return {
    guests: optimisticGuests,
    setGuests,
    addOptimistic,
  };
}
