
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
    console.log(`📡 FETCHING_TENANT_FOR_SLUG: ${slug}`);

    // البحث عن الـ Slug في سجل الروابط العالمي
    const slugRef = doc(db, 'slugs', slug);

    const unsubscribeSlug = onSnapshot(slugRef, async (slugSnap) => {
      if (slugSnap.exists()) {
        const { tenantId } = slugSnap.data();
        console.log(`✅ SLUG_RESOLVED: ${slug} -> ${tenantId}`);
        
        // جلب بيانات المتجر الحقيقية
        const tenantRef = doc(db, 'tenants', tenantId);
        
        try {
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
            console.error("❌ TENANT_DOC_MISSING");
            setError('بيانات المتجر غير موجودة.');
            setTenant(null);
          }
        } catch (err) {
          console.error("❌ TENANT_FETCH_ERROR:", err);
          setError('فشل الوصول لبيانات المتجر.');
          setTenant(null);
        }
      } else {
        console.warn(`⚠️ SLUG_NOT_FOUND: ${slug}`);
        setError('عذراً، هذا المتجر غير موجود على منصة دوبسار.');
        setTenant(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("❌ SLUG_LISTENER_ERROR:", err);
      setError('حدث خطأ في مزامنة البيانات.');
      setLoading(false);
    });

    return () => unsubscribeSlug();
  }, [db, slug]);

  return { tenant, loading, error };
}
