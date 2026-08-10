'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore,
  initializeFirestore,
  memoryLocalCache
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

export function initializeFirebase() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    // استخدام initializeFirestore بدلاً من getFirestore للتحكم في الكاش
    // الذاكرة المؤقتة (Memory Cache) تمنع أخطاء Assertion Failed المرتبطة بـ IndexedDB في البيئات السحابية
    firestore = initializeFirestore(app, {
      localCache: memoryLocalCache(),
    });
    auth = getAuth(app);
  } else {
    app = getApps()[0];
    try {
      // محاولة الحصول على النسخة الحالية
      firestore = getFirestore(app);
    } catch (e) {
      // في حال وجود تعارض في الإعدادات، يتم إعادة التهيئة بالكاش في الذاكرة
      firestore = initializeFirestore(app, {
        localCache: memoryLocalCache(),
      });
    }
    auth = getAuth(app);
  }
  return { app, firestore, auth };
}

export { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';
