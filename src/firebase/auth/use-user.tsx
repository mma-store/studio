
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/lib/types/roles';

// أرقام المدير العام الماستر للطوارئ والتهيئة
const MASTER_SUPER_ADMINS = ['7858833838', '07858833838', '7703687932', '07703687932'];

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
        const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);
          } else {
            setProfile(null);
          }
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

  // منطق التحقق من السوبر أدمن
  const purePhone = profile?.phoneNumber?.replace(/\s/g, '').replace(/^(\+964|0)/, '') || '';
  const isSuperAdmin = profile?.role === 'super_admin' || MASTER_SUPER_ADMINS.includes(purePhone) || MASTER_SUPER_ADMINS.includes(`0${purePhone}`);

  return { 
    user, 
    profile, 
    loading, 
    isSuperAdmin,
    // السوبر أدمن لا يتقيد بـ MMA001 افتراضياً، بل ببيئة الإدارة العامة
    tenantId: isSuperAdmin ? (profile?.tenantId || 'PLATFORM_OWNER') : (profile?.tenantId || 'MMA001') 
  };
}
