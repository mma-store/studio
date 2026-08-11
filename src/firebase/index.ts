'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore,
  enableNetwork,
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

// استخدام متغير عالمي لمنع إعادة التهيئة المتكررة في بيئة Next.js
let cachedApp: FirebaseApp;
let cachedFirestore: Firestore;
let cachedAuth: Auth;

export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      cachedApp = initializeApp(firebaseConfig);
      cachedFirestore = getFirestore(cachedApp);
      cachedAuth = getAuth(cachedApp);
    } else {
      cachedApp = getApps()[0];
      cachedFirestore = getFirestore(cachedApp);
      cachedAuth = getAuth(cachedApp);
    }
    
    // التأكد من تفعيل الشبكة
    enableNetwork(cachedFirestore).catch(() => {});
    
    return { app: cachedApp, firestore: cachedFirestore, auth: cachedAuth };
  }
  
  // للطرف السيرفر (SSR)
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return { 
    app, 
    firestore: getFirestore(app), 
    auth: getAuth(app) 
  };
}

export { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';
