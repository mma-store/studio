
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { logger } from '@/lib/reliability/logger-service';
import { errorEmitter } from '@/firebase/error-emitter';
import { onSnapshotsInSync } from 'firebase/firestore';

export type HealthStatus = 'excellent' | 'degraded' | 'offline';

export function useReliability() {
  const db = useFirestore();
  const { tenantId, user } = useUser();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('excellent');

  useEffect(() => {
    if (db) logger.setFirestore(db);

    const handleOnline = () => {
      setIsOnline(true);
      setHealthStatus('excellent');
      logger.log({
        tenantId,
        userId: user?.uid || null,
        page: window.location.pathname,
        action: 'NETWORK_RECONNECTED',
        severity: 'info',
        message: 'تم استعادة الاتصال بالإنترنت بنجاح.'
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHealthStatus('offline');
      logger.log({
        tenantId,
        userId: user?.uid || null,
        page: window.location.pathname,
        action: 'NETWORK_DISCONNECTED',
        severity: 'warning',
        message: 'انقطع الاتصال بالإنترنت، النظام يعمل في وضع الأوفلاين.'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    // Listen for Firestore sync events
    const unsubscribeSync = onSnapshotsInSync(db, () => {
      setIsSyncing(false);
      setLastSync(new Date());
    });

    // Listen for permission errors
    const handlePermissionError = (error: any) => {
      logger.log({
        tenantId,
        userId: user?.uid || null,
        page: window.location.pathname,
        action: 'PERMISSION_DENIED',
        severity: 'error',
        errorCode: error.context?.operation,
        message: `محاولة وصول غير مصرح بها: ${error.context?.path}`,
        details: error.context
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeSync();
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [db, tenantId, user]);

  return { isOnline, isSyncing, lastSync, healthStatus };
}
