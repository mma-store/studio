
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile } from '@/lib/types/roles';

const MASTER_RAW_PHONES = ['7858833838', '7703687932'];

/**
 * @fileOverview المحرك المركزي للهوية (Identity Engine).
 * يضمن ربط Firebase Auth UID بسجلات Firestore بشكل تفاعلي.
 */
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
        // مراقبة حية للملف الشخصي لضمان استلام الـ tenantId فوراً
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);
            
            // التشخيص في وضع التطوير
            if (process.env.NODE_ENV === 'development') {
              console.group('🛡️ Identity Diagnosis');
              console.log('Firebase UID:', firebaseUser.uid);
              console.log('Profile UID:', data.uid);
              console.log('Tenant ID:', data.tenantId);
              console.log('User Role:', data.role);
              console.groupEnd();
            }
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (err) => {
          console.error("Profile sync error:", err);
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

  // التحقق من صلاحيات المدير العام للمنصة
  const isSuperAdmin = profile?.role === 'super_admin' || 
    (user?.email && MASTER_RAW_PHONES.some(p => user.email!.includes(p)));

  // حل معرف المتجر (Tenant Resolution)
  // الأولوية 1: المعرف المسجل في البروفايل (للتجار والمدراء)
  // الأولوية 2: المعرف العام (للمدير العام إذا لم يكن يدير متجراً خاصاً)
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
