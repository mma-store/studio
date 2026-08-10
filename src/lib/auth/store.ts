"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User, Auth } from "firebase/auth";
import { doc, getDoc, Firestore } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";
import { UserProfile } from "@/lib/types/roles";

/**
 * Custom hook for authentication state.
 * Updated to use centralized initializeFirebase for consistency.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { auth, firestore } = initializeFirebase();
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const docRef = doc(firestore, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, loading };
}
