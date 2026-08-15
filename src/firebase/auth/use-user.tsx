
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile, AccountType, UserRole } from '@/lib/types/roles';

/**
 * @fileOverview محرك حل الهوية (Identity Resolution Engine).
 * المصدر الوحيد والنهائي للحقيقة بشأن هوية المستخدم وارتباطه بالمتجر.
 */
export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // 1. محاولة قراءة البروفايل المرجعي (Canonical Profile)
      const profileRef = doc(db, 'accountProfiles', firebaseUser.uid);
      
      const unsubscribeProfile = onSnapshot(profileRef, async (snap) => {
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
          setLoading(false);
        } else {
          // 2. إذا لم يوجد، نبحث في السجلات القديمة (Migration/Reconciliation)
          try {
            const legacyRef = doc(db, 'users', firebaseUser.uid);
            const legacySnap = await getDoc(legacyRef);
            
            if (legacySnap.exists()) {
              const legacyData = legacySnap.data();
              // بناء البروفايل المرجعي الجديد من البيانات القديمة
              const newProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || legacyData.email || "",
                displayName: legacyData.displayName || "User",
                accountType: (legacyData.role === 'super_admin' ? 'super_admin' : 'merchant') as AccountType,
                role: (legacyData.role || 'owner') as UserRole,
                tenantId: legacyData.tenantId || null,
                status: 'active',
                createdAt: legacyData.createdAt || Date.now()
              };
              
              // حفظ البروفايل الجديد فوراً لضمان عدم تكرار العملية
              await setDoc(profileRef, newProfile);
              setProfile(newProfile);
            } else {
              setProfile(null);
            }
          } catch (err: any) {
            console.error("Identity Resolution Error:", err);
            setError(err.message);
          }
          setLoading(false);
        }
      }, (err) => {
        console.error("Profile Sync Error:", err);
        setError("فشل الاتصال بسجل الهوية الرقمي.");
        setLoading(false);
      });

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
    tenantId: profile?.tenantId || null,
    isAuthenticated: !!user
  };
}
