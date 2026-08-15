
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile, AccountType, UserRole } from '@/lib/types/roles';

/**
 * @fileOverview Canonical Identity Resolver.
 * Uses UID-keyed lookup as the single source of truth.
 */
export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [identitySource, setIdentitySource] = useState<'canonical' | 'legacy' | 'none'>('none');
  const [diagnostic, setDiagnostic] = useState<any>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        setDiagnostic(null);
        return;
      }

      setLoading(true);
      setError(null);

      const diag = {
        authUid: firebaseUser.uid,
        authEmail: firebaseUser.email,
        steps: ["Auth Detected"]
      };

      // 1. Direct UID read from Account Profiles
      const profileRef = doc(db, 'accountProfiles', firebaseUser.uid);
      
      const unsubscribeProfile = onSnapshot(profileRef, 
        async (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setProfile(data);
            setIdentitySource('canonical');
            diag.steps.push("Canonical Profile Resolved");
            setLoading(false);
          } else {
            diag.steps.push("Canonical Missing, checking Legacy...");
            try {
              const legacyRef = doc(db, 'users', firebaseUser.uid);
              const legacySnap = await getDoc(legacyRef);
              
              if (legacySnap.exists()) {
                const legacyData = legacySnap.data();
                const resolvedProfile: UserProfile = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || legacyData.email || "",
                  displayName: legacyData.displayName || "User",
                  accountType: (legacyData.accountType || (legacyData.role === 'super_admin' ? 'super_admin' : 'merchant')) as AccountType,
                  role: (legacyData.role || 'owner') as UserRole,
                  tenantId: legacyData.tenantId || null,
                  status: legacyData.status || 'active',
                  createdAt: legacyData.createdAt || Date.now()
                };
                
                setProfile(resolvedProfile);
                setIdentitySource('legacy');
                diag.steps.push("Legacy Found, Migrating...");
                
                // Atomic migration
                setDoc(profileRef, resolvedProfile, { merge: true }).catch(console.warn);
              } else {
                setProfile(null);
                setIdentitySource('none');
                diag.steps.push("No Profile Found");
              }
            } catch (err: any) {
              setError(`فشل استرجاع الهوية: ${err.code}`);
            }
            setLoading(false);
          }
        }, 
        (err) => {
          // If permission denied to profile, it's a critical error
          setError(`خطأ أمني: Firestore رفض الوصول لهويتك. (${err.code})`);
          setLoading(false);
        }
      );

      return () => unsubscribeProfile();
    });

    return () => unsubscribeAuth();
  }, [auth, db]);

  const isSuperAdmin = profile?.accountType === 'super_admin' || profile?.role === 'super_admin';

  return { 
    user, 
    profile, 
    loading,
    error,
    isSuperAdmin,
    identitySource,
    tenantId: profile?.tenantId || null,
    isAuthenticated: !!user,
    diagnostic
  };
}
