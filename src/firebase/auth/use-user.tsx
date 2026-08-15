'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { UserProfile, AccountType, UserRole } from '@/lib/types/roles';

/**
 * @fileOverview محرك حل الهوية الرقمية (Canonical Identity Resolver).
 * يعتمد حصرياً على الـ UID الموثق للوصول المباشر للبيانات.
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

      // Diagnostic Data
      const diag = {
        authUid: firebaseUser.uid,
        authEmail: firebaseUser.email,
        steps: ["Auth Detected"] as string[]
      };

      // 1. القراءة المباشرة للبروفايل المرجعي باستخدام الـ UID
      // لا يتم استخدام Query هنا أبداً لتجنب مشاكل الأذونات
      const profileRef = doc(db, 'accountProfiles', firebaseUser.uid);
      
      const unsubscribeProfile = onSnapshot(profileRef, 
        async (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setProfile(data);
            setIdentitySource('canonical');
            diag.steps.push("Canonical Profile Resolved by UID");
            setLoading(false);
            setDiagnostic({...diag, steps: [...diag.steps, "Success"]});
          } else {
            diag.steps.push("Canonical Missing, checking Legacy...");
            // 2. ترحيل تلقائي (Automatic Reconciliation) من السجلات القديمة
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
                diag.steps.push("Legacy Data Found, migrating...");
                
                // إنشاء البروفايل المرجعي لمرة واحدة لضمان السرعة مستقبلاً
                setDoc(profileRef, resolvedProfile, { merge: true }).catch(e => console.warn("Migration deferred", e));
              } else {
                setProfile(null);
                setIdentitySource('none');
                diag.steps.push("No stored profile found");
              }
            } catch (err: any) {
              diag.steps.push(`Legacy Fallback Error: ${err.code}`);
              setError(`خطأ في استرجاع البيانات: ${err.code}`);
            }
            setLoading(false);
            setDiagnostic(diag);
          }
        }, 
        (err) => {
          diag.steps.push(`Firestore Permissions Refused: ${err.code}`);
          setError(`فشل التحقق من الأمان: Firestore رفض الوصول لهويتك. (Code: ${err.code})`);
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
