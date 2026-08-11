
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * @fileOverview مستمع مركزي لأخطاء أذونات Firestore.
 * يقوم برمي الخطأ السياقي ليظهر في شاشة التطوير (Next.js Error Overlay)
 * مما يساعد المطور على معرفة القاعدة التي تسببت في الرفض بدقة.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      const path = error.context?.path || '';
      
      // في بيئة التطوير، نقوم برمي الخطأ ليظهر بشكل مرئي للمطور
      // مع كافة التفاصيل السياقية (المسار، العملية، البيانات)
      if (process.env.NODE_ENV === 'development') {
        console.group('🔥 Firestore Permission Denied');
        console.error('Path:', error.context?.path);
        console.error('Operation:', error.context?.operation);
        console.error('Data:', error.context?.requestResourceData);
        console.groupEnd();
        
        // لا نريد تعطيل التطبيق بالكامل إذا فشل تحميل "الباقات" (plans)
        // فهي معلومات ترويجية وليست حرجة لعمل النظام الأساسي
        if (path.includes('plans')) {
          return;
        }
        
        // رمي الخطأ ليظهر في واجهة Next.js للحالات الحرجة الأخرى
        throw error;
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, []);

  return null;
}
