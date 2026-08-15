
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * @fileOverview مستمع مركزي لأخطاء Firestore.
 * تم تحسينه ليكون أقل حدة في بيئة التطوير للعمليات غير الحرجة.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      const path = error.context?.path || '';
      const operation = error.context?.operation || '';
      
      if (process.env.NODE_ENV === 'development') {
        // تسجيل صامت للأخطاء المعروفة التي لا يجب أن تعطل التطبيق
        if (path.includes('plans') || path.includes('slugs')) {
          console.warn(`[Silent Permission Denied] Path: ${path}, Op: ${operation}`);
          return;
        }

        console.group('🔥 Firestore Security Diagnostic');
        console.error('Path:', path);
        console.error('Operation:', operation);
        console.groupEnd();
        
        // رمي الخطأ للعمليات الحرجة فقط لضمان انتباه المطور
        if (['create', 'update', 'delete', 'write'].includes(operation)) {
          throw error;
        }
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, []);

  return null;
}
