
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
    const updateOnlineStatus = () => {
      setStatus(navigator.onLine ? 'online' : 'offline');
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial check
    updateOnlineStatus();

    // Firestore's onSnapshotsInSync fires when all local changes 
    // have been successfully acknowledged by the server.
    const unsubscribe = onSnapshotsInSync(db, () => {
      setLastSync(new Date());
      // If we are online, after a snapshot sync we can assume we are stable
      if (navigator.onLine) {
        setStatus('online');
      }
    });

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      unsubscribe();
    };
  }, [db]);

  return { status, lastSync };
}
