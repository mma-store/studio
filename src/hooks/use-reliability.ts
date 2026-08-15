
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { logger } from '@/lib/reliability/logger-service';
import { errorEmitter } from '@/firebase/error-emitter';

export type HealthStatus = 'excellent' | 'degraded' | 'offline';

export function useReliability() {
  const db = useFirestore();
  const { tenantId, user } = useUser();
  const [isOnline, setIsOnline] = useState(true);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('excellent');

  useEffect(() => {
    if (db) logger.setFirestore(db);

    const handleOnline = () => {
      setIsOnline(true);
      setHealthStatus('excellent');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHealthStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    // Consolidated permission error logging
    const handlePermissionError = (error: any) => {
      logger.log({
        tenantId,
        userId: user?.uid || null,
        page: window.location.pathname,
        action: 'PERMISSION_DENIED',
        severity: 'error',
        message: `وصول غير مصرح: ${error.context?.path}`,
        details: error.context
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [db, tenantId, user]);

  return { isOnline, healthStatus };
}
