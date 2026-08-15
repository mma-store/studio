
'use client';

import { useState, useEffect } from 'react';
import { onSnapshotsInSync } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export type SyncState = 'online' | 'offline' | 'syncing';

export function useSyncStatus() {
  const db = useFirestore();
  const [status, setStatus] = useState<SyncState>('online');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const updateStatus = () => setStatus(navigator.onLine ? 'online' : 'offline');
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();

    // Singleton listener for sync events to prevent SDK Internal Assertion errors
    const unsubscribe = onSnapshotsInSync(db, () => {
      setLastSync(new Date());
    });

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      unsubscribe();
    };
  }, [db]);

  return { status, lastSync };
}
