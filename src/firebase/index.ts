'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

export function initializeFirebase() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    // العودة إلى استخدام getFirestore القياسي لضمان أقصى درجات الاستقرار.
    // الأخطاء من نوع (Assertion Failed) غالباً ما تنتج عن تعارض في إعدادات localCache
    // داخل المتصفحات في بيئات التطوير السحابية.
    firestore = getFirestore(app);
    auth = getAuth(app);
  } else {
    app = getApps()[0];
    firestore = getFirestore(app);
    auth = getAuth(app);
  }
  return { app, firestore, auth };
}

export { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';
