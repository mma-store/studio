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
  status: 'active' | 'suspended' | 'expired';
  settings?: any;
}

export function useTenantData(slug: string) {
  const db = useFirestore();
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    // التحقق من الرابط عبر سجل الروابط (Slug Registry) للوصول المباشر والآمن
    const slugRef = doc(db, 'slugs', slug);

    const unsubscribeSlug = onSnapshot(slugRef, async (slugSnap) => {
      if (slugSnap.exists()) {
        const { tenantId } = slugSnap.data();
        
        // جلب بيانات المتجر بناءً على المعرف الحقيقي
        const tenantRef = doc(db, 'tenants', tenantId);
        
        try {
          const tenantSnap = await getDoc(tenantRef);
          if (tenantSnap.exists()) {
            const data = tenantSnap.data() as TenantData;
            if (data.status !== 'active' && data.status !== 'trial') {
              setError('هذا المتجر غير نشط حالياً.');
              setTenant(null);
            } else {
              setTenant({ ...data, tenantId: tenantSnap.id });
              setError(null);
            }
          } else {
            setError('المعذرة، المتجر المطلوب غير موجود.');
            setTenant(null);
          }
        } catch (err) {
          setError('فشل الوصول لبيانات المتجر.');
          setTenant(null);
        }
      } else {
        setError('المعذرة، المتجر المطلوب غير موجود.');
        setTenant(null);
      }
      setLoading(false);
    }, (err) => {
      setError('حدث خطأ في الاتصال بالسيرفر.');
      setLoading(false);
    });

    return () => unsubscribeSlug();
  }, [db, slug]);

  return { tenant, loading, error };
}
