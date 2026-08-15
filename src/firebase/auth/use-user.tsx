'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile, AccountType, UserRole } from '@/lib/types/roles';

/**
 * @fileOverview محرك حل الهوية المرن (Resilient Identity Engine).
 * مجهز بأدوات تشخيصية متقدمة لكشف أخطاء الأذونات.
 */
export function useUser() {
  const auth = useAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [identitySource, setIdentitySource] = useState<'canonical' | 'legacy' | 'none'>('none');
  const [diagnostic, setDiagnostic] = useState<any>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        setDiagnostic(null);
        return;
      }

      setLoading(true);
      setError(null);

      // Diagnostic Start
      const diag = {
        authUid: firebaseUser.uid,
        authEmail: firebaseUser.email,
        steps: [] as string[]
      };
      diag.steps.push("Auth Authenticated");

      // 1. محاولة قراءة البروفايل المرجعي (Canonical Profile)
      const profileRef = doc(db, 'accountProfiles', firebaseUser.uid);
      
      const unsubscribeProfile = onSnapshot(profileRef, 
        async (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
            setIdentitySource('canonical');
            diag.steps.push("Canonical Profile Found");
            setLoading(false);
          } else {
            diag.steps.push("Canonical Profile Missing, trying Legacy...");
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
                diag.steps.push("Legacy Profile Found");
                
                // محاولة ترقية السجل في الخلفية دون تعطيل المستخدم
                setDoc(profileRef, resolvedProfile, { merge: true }).catch((e) => {
                  console.warn("Background migration deferred:", e.code);
                });
              } else {
                setProfile(null);
                setIdentitySource('none');
                diag.steps.push("No Profile Found Anywhere");
              }
            } catch (err: any) {
              diag.steps.push(`Legacy Lookup Error: ${err.code}`);
              setError(`خطأ أذونات (Legacy): ${err.code}`);
            }
            setLoading(false);
          }
          setDiagnostic(diag);
        }, 
        async (err) => {
          diag.steps.push(`Canonical Snapshot Error: ${err.code}`);
          
          if (err.code === 'permission-denied') {
            try {
              const legacyRef = doc(db, 'users', firebaseUser.uid);
              const legacySnap = await getDoc(legacyRef);
              if (legacySnap.exists()) {
                setProfile(legacySnap.data() as UserProfile);
                setIdentitySource('legacy');
                diag.steps.push("Permission Denied on Canonical, but Legacy Found");
              } else {
                diag.steps.push("Permission Denied on Canonical and Legacy Not Found");
                setError(`خطأ أذونات Firestore: يرجى التحقق من قواعد الأمان لمجموعة accountProfiles. (Code: ${err.code})`);
              }
            } catch (innerErr: any) {
              diag.steps.push(`Critical Permission Failure: ${innerErr.code}`);
              setError(`فشل التحقق من الأمان: Firestore رفض الوصول لهويتك. (Code: ${innerErr.code})`);
            }
          } else {
            setError(`فشل الاتصال بخادم الهوية: ${err.message}`);
          }
          setDiagnostic(diag);
          setLoading(false);
        }
      );

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
    identitySource,
    tenantId: profile?.tenantId || null,
    isAuthenticated: !!user,
    diagnostic
  };
}
