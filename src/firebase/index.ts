
'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore,
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Singleton Firebase Instance Manager
 * Connecting explicitly to 'saas-prod' for the clean Multi-Tenant system.
 */
let cachedApp: FirebaseApp | undefined;
let cachedFirestore: Firestore | undefined;
let cachedAuth: Auth | undefined;

// The explicit ID for the new clean database created by the user
const DATABASE_ID = 'saas-prod';

export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!cachedApp) {
      const existingApps = getApps();
      cachedApp = existingApps.length ? existingApps[0] : initializeApp(firebaseConfig);
      // Explicitly connecting to the new clean database saas-prod
      cachedFirestore = getFirestore(cachedApp, DATABASE_ID);
      cachedAuth = getAuth(cachedApp);
    }
    
    return { 
      app: cachedApp, 
      firestore: cachedFirestore!, 
      auth: cachedAuth! 
    };
  }
  
  // SSR Path
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return { 
    app, 
    firestore: getFirestore(app, DATABASE_ID), 
    auth: getAuth(app) 
  };
}

export { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';
