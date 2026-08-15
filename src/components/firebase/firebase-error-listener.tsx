
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * @fileOverview مستمع مركزي لأخطاء أذونات Firestore.
 * تم تحديثه ليمنع انهيار الواجهة في حالات القراءة غير الحرجة (مثل الباقات).
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      const path = error.context?.path || '';
      const operation = error.context?.operation || '';
      
      if (process.env.NODE_ENV === 'development') {
        // تسجيل الخطأ في وحدة التحكم للتشخيص دون إيقاف التطبيق
        console.group('🔥 Firestore Permission Event');
        console.warn('Path:', path);
        console.warn('Operation:', operation);
        console.groupEnd();
        
        // استثناء: لا تظهر شاشة الخطأ الحمراء لقائمة الباقات أو عمليات القراءة البسيطة
        // هذا يضمن بقاء المستخدم في صفحة الدخول حتى لو فشلت قراءة الخلفية
        if (operation === 'get' || operation === 'list' || path.includes('plans')) {
          return;
        }
        
        // رمي الخطأ للعمليات الحرجة فقط (كتابة، حذف) لضمان انتباه المطور
        throw error;
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, []);

  return null;
}
