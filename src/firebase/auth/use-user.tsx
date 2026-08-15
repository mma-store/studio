'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile, AccountType, UserRole } from '@/lib/types/roles';

/**
 * @fileOverview محرك حل الهوية المرن (Resilient Identity Engine).
 * يدعم التراجع التلقائي (Fallback) لضمان عدم انقطاع الخدمة عن التجار.
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

      // 1. محاولة قراءة البروفايل المرجعي (Canonical Profile)
      const profileRef = doc(db, 'accountProfiles', firebaseUser.uid);
      
      const unsubscribeProfile = onSnapshot(profileRef, 
        async (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
            setIdentitySource('canonical');
            setLoading(false);
          } else {
            // 2. البحث في السجلات القديمة (Migration/Fallback)
            try {
              const legacyRef = doc(db, 'users', firebaseUser.uid);
              const legacySnap = await getDoc(legacyRef);
              
              if (legacySnap.exists()) {
                const legacyData = legacySnap.data();
                const resolvedProfile: UserProfile = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || legacyData.email || "",
                  displayName: legacyData.displayName || "User",
                  accountType: (legacyData.role === 'super_admin' ? 'super_admin' : 'merchant') as AccountType,
                  role: (legacyData.role || 'owner') as UserRole,
                  tenantId: legacyData.tenantId || null,
                  status: legacyData.status || 'active',
                  createdAt: legacyData.createdAt || Date.now()
                };
                
                setProfile(resolvedProfile);
                setIdentitySource('legacy');
                
                // محاولة ترقية السجل في الخلفية دون تعطيل المستخدم
                setDoc(profileRef, resolvedProfile, { merge: true }).catch(() => {
                  console.warn("Silent background migration failed (likely permissions)");
                });
              } else {
                setProfile(null);
                setIdentitySource('none');
              }
            } catch (err) {
              console.error("Legacy Lookup Failed:", err);
              // لا نضع خطأ هنا لنسمح لصفحة التأسيس بالعمل
            }
            setLoading(false);
          }
        }, 
        async (err) => {
          // 3. معالجة فشل الأذونات (Graceful Degradation)
          // إذا فشل الـ Snapshot (غالباً بسبب قواعد الأمان الجديدة)، نحاول قراءة Users مباشرة
          if (err.code === 'permission-denied') {
            try {
              const legacyRef = doc(db, 'users', firebaseUser.uid);
              const legacySnap = await getDoc(legacyRef);
              if (legacySnap.exists()) {
                setProfile(legacySnap.data() as UserProfile);
                setIdentitySource('legacy');
              }
            } catch (innerErr) {
              console.error("Critical identity resolution failure:", innerErr);
              setError("فشل التحقق من الأمان. يرجى إعادة تسجيل الدخول.");
            }
          } else {
            setError("فشل الاتصال بخادم الهوية.");
          }
          setLoading(false);
        }
      );

      return () => unsubscribeProfile();
    });

    return () => unsubscribeAuth();
  }, [auth, db]);

  const isSuperAdmin = profile?.accountType === 'super_admin' || profile?.role === 'super_admin' || profile?.role === 'super_admin';

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
