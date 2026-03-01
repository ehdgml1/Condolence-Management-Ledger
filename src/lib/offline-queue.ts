'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface QueuedMutation {
  id: string;
  actionName: string;
  args: unknown[];
  timestamp: number;
  retryCount: number;
}

const DB_NAME = 'wedding-offline-queue';
const DB_VERSION = 1;
const STORE_NAME = 'mutations';

// --- IndexedDB helpers ---

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllMutations(): Promise<QueuedMutation[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.getAll();
    request.onsuccess = () => resolve(request.result as QueuedMutation[]);
    request.onerror = () => reject(request.error);
  });
}

async function putMutation(mutation: QueuedMutation): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(mutation);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function deleteMutation(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// --- Public API ---

/**
 * Enqueue a failed mutation for later retry.
 */
export async function enqueueMutation(
  actionName: string,
  args: unknown[]
): Promise<void> {
  const mutation: QueuedMutation = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    actionName,
    args,
    timestamp: Date.now(),
    retryCount: 0,
  };
  await putMutation(mutation);
}

/**
 * Check if an error is a network connectivity failure.
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('failed to fetch') ||
      msg.includes('network request failed') ||
      msg.includes('load failed') ||
      msg.includes('networkerror')
    );
  }
  return false;
}

// Registry for action handlers so the queue can replay them
type ActionHandler = (...args: unknown[]) => Promise<unknown>;
const actionRegistry = new Map<string, ActionHandler>();

/**
 * Register a server action so it can be replayed from the offline queue.
 * Call this once per action at module level.
 */
export function registerAction(name: string, handler: ActionHandler): void {
  actionRegistry.set(name, handler);
}

/**
 * Replay all queued mutations in order.
 */
export async function replayQueue(
  onProgress?: (remaining: number) => void
): Promise<{ replayed: number; failed: number }> {
  const mutations = await getAllMutations();
  let replayed = 0;
  let failed = 0;

  for (const mutation of mutations) {
    const handler = actionRegistry.get(mutation.actionName);
    if (!handler) {
      // No handler registered; skip but keep in queue
      failed++;
      continue;
    }
    try {
      await handler(...mutation.args);
      await deleteMutation(mutation.id);
      replayed++;
    } catch (err) {
      if (isNetworkError(err)) {
        // Still offline; stop replaying
        break;
      }
      // Non-network error: increment retry count, keep in queue up to 5 tries
      const updated: QueuedMutation = {
        ...mutation,
        retryCount: mutation.retryCount + 1,
      };
      if (updated.retryCount >= 5) {
        await deleteMutation(mutation.id);
      } else {
        await putMutation(updated);
      }
      failed++;
    }
    if (onProgress) {
      const remaining = (await getAllMutations()).length;
      onProgress(remaining);
    }
  }

  return { replayed, failed };
}

// --- Hook ---

export interface OfflineQueueState {
  queuedCount: number;
  isOnline: boolean;
  syncNow: () => Promise<void>;
  isSyncing: boolean;
}

export function useOfflineQueue(): OfflineQueueState {
  const [isOnline, setIsOnline] = useState(true);
  const [queuedCount, setQueuedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasSynced = useRef(false);

  const refreshCount = useCallback(async () => {
    try {
      const mutations = await getAllMutations();
      setQueuedCount(mutations.length);
    } catch {
      // IndexedDB not available in SSR or private mode
    }
  }, []);

  useEffect(() => {
    // Detect initial state on mount
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
    }
    refreshCount();

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Poll queue count every 10 seconds
    const interval = setInterval(refreshCount, 10_000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [refreshCount]);

  const syncNow = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await replayQueue(async (remaining) => {
        setQueuedCount(remaining);
      });
      await refreshCount();
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && queuedCount > 0 && !hasSynced.current) {
      hasSynced.current = true;
      syncNow().finally(() => {
        hasSynced.current = false;
      });
    }
  }, [isOnline, queuedCount, syncNow]);

  return { queuedCount, isOnline, syncNow, isSyncing };
}
