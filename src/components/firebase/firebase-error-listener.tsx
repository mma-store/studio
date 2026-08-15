
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * @fileOverview مستمع مركزي لأخطاء أذونات Firestore.
 * تم تحديثه ليمنع انهيار الواجهة في حالات القراءة غير الحرجة.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      const path = error.context?.path || '';
      const operation = error.context?.operation || '';
      
      if (process.env.NODE_ENV === 'development') {
        console.group('🔥 Firestore Permission Event');
        console.warn('Path:', path);
        console.warn('Operation:', operation);
        console.groupEnd();
        
        // منع انهيار الواجهة (Error Overlay) لكافة عمليات القراءة
        // هذا يسمح للتطبيق بالاستمرار حتى لو فشلت قراءة الباقات أو الملفات الشخصية مؤقتاً
        if (operation === 'get' || operation === 'list' || path.includes('plans')) {
          return;
        }
        
        // رمي الخطأ فقط للعمليات الحرجة (مثل الكتابة والحذف) لضمان انتباه المطور
        throw error;
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, []);

  return null;
}
