
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/lib/types/roles';

/**
 * @fileOverview المحرك المركزي للهوية (Identity Engine).
 * يضمن الربط الدقيق بين Auth UID وبين سجلات Firestore.
 */
export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      
      if (firebaseUser) {
        setProfileLoading(true);
        const profileRef = doc(db, 'users', firebaseUser.uid);
        
        // استخدام onSnapshot لضمان المزامنة اللحظية
        const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setProfileLoading(false);
          setLoading(false);
        }, (err) => {
          console.error("Critical Profile Sync Error:", err);
          setProfileLoading(false);
          setLoading(false);
        });
        
        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setProfileLoading(false);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, db]);

  // منطق تحديد رتبة السوبر أدمن
  const isSuperAdmin = profile?.role === 'super_admin' || 
    (user?.email && (user.email.includes('7858833838') || user.email.includes('7703687932')));

  return { 
    user, 
    profile, 
    loading: authLoading || profileLoading || loading,
    isSuperAdmin,
    tenantId: profile?.tenantId || null,
    isAuthenticated: !!user
  };
}
