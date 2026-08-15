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

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // 1. Direct UID read from Account Profiles (Canonical Source)
      const profileRef = doc(db, 'accountProfiles', firebaseUser.uid);
      
      const unsubscribeProfile = onSnapshot(profileRef, 
        async (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
            setIdentitySource('canonical');
            setLoading(false);
          } else {
            // 2. Fallback to legacy 'users' collection
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
                // Migrate to canonical source silently
                setDoc(profileRef, resolvedProfile, { merge: true }).catch(console.warn);
              } else {
                setProfile(null);
                setIdentitySource('none');
              }
            } catch (err: any) {
              // Only treat as error if not a missing doc
              if (err.code !== 'permission-denied') {
                setError(`فشل استرجاع الهوية: ${err.code}`);
              } else {
                setIdentitySource('none');
              }
            }
            setLoading(false);
          }
        }, 
        (err) => {
          if (err.code === 'permission-denied') {
            // This happens if the rule is failing for the owner
            setError("خطأ أمني: Firestore رفض الوصول لملف هويتك. يرجى مراجعة القواعد.");
          } else {
            setError(`خطأ في المزامنة: ${err.message}`);
          }
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
    isAuthenticated: !!user
  };
}