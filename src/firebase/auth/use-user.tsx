'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/lib/types/roles';

// القائمة الموحدة والنهائية لأرقام المدير العام الماستر (بدون أصفار أو بادئات)
const MASTER_RAW_PHONES = ['7858833838', '7703687932'];

export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const profileRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (err) => {
          console.warn("Profile fetch restricted:", err.code);
          // في حال فشل Firestore، لا نزال نحتفظ ببيانات Auth الأساسية
          setLoading(false);
        });
        
        return () => unsubscribeProfile();
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, db]);

  // منطق التحقق الصارم من هوية المدير العام (Super Admin)
  // يعتمد على 3 طبقات: الرتبة في Firestore، رقم الهاتف، أو بادئة البريد الإلكتروني
  const emailPrefix = user?.email?.split('@')[0] || '';
  const purePhoneFromProfile = profile?.phoneNumber?.replace(/\s/g, '').replace(/^(\+964|0)/, '') || '';
  
  const isSuperAdmin = 
    profile?.role === 'super_admin' || 
    MASTER_RAW_PHONES.includes(emailPrefix) || 
    MASTER_RAW_PHONES.includes(purePhoneFromProfile);

  // السوبر أدمن ينتمي دائماً لـ PLATFORM_OWNER ليتجاوز قيود المستأجرين (Tenants)
  const resolvedTenantId = loading ? null : (isSuperAdmin ? 'PLATFORM_OWNER' : (profile?.tenantId || null));

  return { 
    user, 
    profile, 
    loading, 
    isSuperAdmin,
    tenantId: resolvedTenantId
  };
}
