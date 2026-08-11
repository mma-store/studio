'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/lib/types/roles';
import { normalizePhoneNumber } from '@/lib/auth-utils';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

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
        
        const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (err) => {
          // الصمت عن الخطأ هنا لتجنب حلقة الانهيار في الواجهة
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

  // التحقق من الهوية الماستر
  const emailPrefix = user?.email?.split('@')[0] || '';
  const purePhone = profile?.phoneNumber ? normalizePhoneNumber(profile.phoneNumber) : '';
  
  const isSuperAdmin = 
    profile?.role === 'super_admin' || 
    MASTER_RAW_PHONES.includes(emailPrefix) || 
    MASTER_RAW_PHONES.includes(purePhone);

  // الأولوية لـ tenantId المتجر الحقيقي إذا وجد، وإلا نستخدم معرف المنصة للسوبر أدمن
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
