
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
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        setProfileLoading(true);
        const profileRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setProfileLoading(false);
          setLoading(false);
        }, (err) => {
          // If Firestore denies permission but we know it's a master admin via phone/email, 
          // we handle it in the derived state below.
          setProfileLoading(false);
          setLoading(false);
        });
        
        return () => unsubscribeProfile();
      } else {
        setUser(null);
        setProfile(null);
        setProfileLoading(false);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, db]);

  // منطق التحقق الصارم من هوية المدير العام (Super Admin)
  // نعتمد على رقم الهاتف أو بادئة الإيميل لضمان الوصول حتى لو فشل Firestore لحظياً
  const emailPrefix = user?.email?.split('@')[0] || '';
  const purePhoneFromProfile = profile?.phoneNumber?.replace(/\s/g, '').replace(/^(\+964|00964|0)/, '') || '';
  
  const isSuperAdmin = 
    profile?.role === 'super_admin' || 
    MASTER_RAW_PHONES.includes(emailPrefix) || 
    MASTER_RAW_PHONES.includes(purePhoneFromProfile);

  // السوبر أدمن ينتمي دائماً لـ PLATFORM_OWNER ليتجاوز قيود المستأجرين (Tenants)
  const resolvedTenantId = isSuperAdmin ? 'PLATFORM_OWNER' : (profile?.tenantId || null);

  return { 
    user, 
    profile, 
    loading: loading || profileLoading,
    isSuperAdmin,
    tenantId: resolvedTenantId
  };
}
