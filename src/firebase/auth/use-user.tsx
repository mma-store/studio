'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/lib/types/roles';
import { normalizePhoneNumber } from '@/lib/auth-utils';

const MASTER_RAW_PHONES = ['7858833838', '7703687932'];

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const profileRef = doc(db, 'users', firebaseUser.uid);
        
        // استخدام onSnapshot لضمان تحديث الرتبة والـ tenantId فوراً
        const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (err) => {
          console.warn("Profile fetch failed:", err.message);
          setProfile(null);
          setLoading(false);
        });
        
        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, db]);

  // 1. تحديد ما إذا كان المستخدم سوبر أدمن
  const isSuperAdmin = profile?.role === 'super_admin' || 
    (user?.email && MASTER_RAW_PHONES.some(p => user.email!.includes(p)));

  // 2. حل معرف المتجر (Tenant ID)
  // الأولوية دائماً لمعرف المتجر الموجود في البروفايل لضمان الوصول للبيانات الصحيحة
  const resolvedTenantId = profile?.tenantId || (isSuperAdmin ? 'PLATFORM_OWNER' : null);

  return { 
    user, 
    profile, 
    loading,
    isSuperAdmin,
    tenantId: resolvedTenantId,
    isAuthenticated: !!user
  };
}
