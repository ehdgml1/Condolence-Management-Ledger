'use client';

import type { Guest } from '@/lib/types';

// Realtime removed (was Supabase-specific). Data changes are handled by
// revalidatePath in server actions.
export function useRealtimeGuests(
  _weddingId: string,
  _onInsert?: (guest: Guest) => void,
  _onUpdate?: (guest: Guest) => void,
  _onDelete?: (oldGuest: { id: string }) => void
) {
  // no-op
}
