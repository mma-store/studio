
'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

export interface TenantData {
  tenantId: string;
  businessName: string;
  slug: string;
  logo?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  status: 'active' | 'suspended' | 'expired' | 'trial';
  settings?: any;
}

export function useTenantData(slug: string) {
  const db = useFirestore();
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // البحث عن الـ Slug في سجل الروابط العالمي
    const slugRef = doc(db, 'slugs', slug);

    const unsubscribeSlug = onSnapshot(slugRef, async (slugSnap) => {
      try {
        if (slugSnap.exists()) {
          const { tenantId } = slugSnap.data();
          
          // جلب بيانات المتجر الحقيقية
          const tenantRef = doc(db, 'tenants', tenantId);
          const tenantSnap = await getDoc(tenantRef);
          
          if (tenantSnap.exists()) {
            const data = tenantSnap.data() as TenantData;
            
            if (data.status === 'suspended') {
              setError('هذا المتجر معلق مؤقتاً.');
              setTenant(null);
            } else {
              setTenant({ ...data, tenantId: tenantSnap.id });
              setError(null);
            }
          } else {
            setError('بيانات المتجر غير موجودة.');
            setTenant(null);
          }
        } else {
          setError('عذراً، هذا المتجر غير موجود على منصة دوبسار.');
          setTenant(null);
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ في مزامنة البيانات.');
        setTenant(null);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      setError('فشل الاتصال بخدمة البيانات.');
      setLoading(false);
    });

    return () => unsubscribeSlug();
  }, [db, slug]);

  return { tenant, loading, error };
}
