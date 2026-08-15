
'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore,
  onSnapshotsInSync
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Singleton Firebase Instance Manager
 * Ensures strict initialization and prevents internal SDK conflicts.
 */
let cachedApp: FirebaseApp | undefined;
let cachedFirestore: Firestore | undefined;
let cachedAuth: Auth | undefined;

export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (!cachedApp) {
      const existingApps = getApps();
      cachedApp = existingApps.length ? existingApps[0] : initializeApp(firebaseConfig);
      cachedFirestore = getFirestore(cachedApp);
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
    firestore: getFirestore(app), 
    auth: getAuth(app) 
  };
}

export { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { useUser } from './auth/use-user';
