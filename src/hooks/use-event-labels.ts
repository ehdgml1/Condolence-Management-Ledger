'use client';

import { useWedding } from './use-wedding';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import type { EventType } from '@/lib/types';

/**
 * @deprecated Prefer deriving labels directly from wedding.event_type using
 * EVENT_TYPE_LABELS[wedding.event_type || 'wedding'] to avoid hydration
 * mismatches between server and client rendering. This hook is kept only as
 * a convenience for components deep in the tree that lack access to the
 * wedding object or eventType prop.
 */
export function useEventLabels() {
  const { wedding } = useWedding();
  const eventType: EventType = wedding.event_type || 'wedding';
  return EVENT_TYPE_LABELS[eventType];
}
