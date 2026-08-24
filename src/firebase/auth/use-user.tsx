'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/lib/types/roles';

/**
 * @fileOverview Identity Resolver for 'saas-prod' Database.
 * يتم التحقق من الهوية من قاعدة البيانات الجديدة حصراً.
 */
export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UID الخاص بالـ Super Admin للوصول السريع
  const SUPER_ADMIN_UID = 'rQR8k4ZzIZVtvkQ2pUHNlvIDSI13';

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      // جلب البروفايل من قاعدة saas-prod الجديدة
      const profileRef = doc(db, 'accountProfiles', firebaseUser.uid);
      
      const unsubscribeProfile = onSnapshot(profileRef, 
        (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            // في حالة عدم وجود بروفايل (أثناء عملية التأسيس)
            setProfile(null);
          }
          setLoading(false);
        }, 
        (err) => {
          console.error("Identity Fetch Failed:", err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribeProfile();
    });

    return () => unsubscribeAuth();
  }, [auth, db]);

  const isSuperAdmin = user?.uid === SUPER_ADMIN_UID || profile?.role === 'super_admin' || profile?.accountType === 'super_admin';

  return { 
    user, 
    profile, 
    loading,
    error,
    isSuperAdmin,
    tenantId: profile?.tenantId || null,
    isAuthenticated: !!user
  };
}
