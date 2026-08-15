
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * @fileOverview مستمع مركزي لأخطاء أذونات Firestore.
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
        
        // منع انهيار الواجهة في الحالات غير الحرجة لمنع تجمد التطبيق
        // 1. باقات الاشتراك (معلومات ترويجية غير حاسمة للدخول)
        // 2. عمليات القراءة البسيطة (Get/List) التي قد تفشل بسبب المزامنة أو عدم التوثيق اللحظي
        if (path.includes('plans') || operation === 'get' || operation === 'list') {
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
