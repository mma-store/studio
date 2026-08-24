'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

/**
 * Singleton Firebase Instance Manager
 * تم ضبط المحرك ليرتبط حصرياً بقاعدة البيانات saas-prod في المشروع الجديد.
 */
let cachedApp: FirebaseApp | undefined;
let cachedFirestore: Firestore | undefined;
let cachedAuth: Auth | undefined;
let cachedStorage: FirebaseStorage | undefined;

// المعرف الخاص بقاعدة البيانات الجديدة التي أنشأتها
const DATABASE_ID = 'saas-prod';

export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!cachedApp) {
      const existingApps = getApps();
      cachedApp = existingApps.length ? existingApps[0] : initializeApp(firebaseConfig);
      
      // الربط الصريح بقاعدة البيانات saas-prod
      cachedFirestore = getFirestore(cachedApp, DATABASE_ID);
      cachedAuth = getAuth(cachedApp);
      cachedStorage = getStorage(cachedApp);

      console.log(`[Firebase Init] Connected to Project: ${firebaseConfig.projectId}, DB: ${DATABASE_ID}`);
    }
    
    return { 
      app: cachedApp, 
      firestore: cachedFirestore!, 
      auth: cachedAuth!,
      storage: cachedStorage!
    };
  }
  
  // SSR Path
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return { 
    app, 
    firestore: getFirestore(app, DATABASE_ID), 
    auth: getAuth(app),
    storage: getStorage(app)
  };
}

export { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';
