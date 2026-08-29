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
  settings?: {
    storeTheme?: {
      primary: string;
      secondary: string;
      background: string;
      card: string;
      textPrimary: string;
      textSecondary: string;
    }
  };
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
    // 1. Resolve slug to tenantId from 'slugs' collection
    const slugRef = doc(db, 'slugs', slug);

    const unsubscribeSlug = onSnapshot(slugRef, async (slugSnap) => {
      try {
        if (slugSnap.exists()) {
          const { tenantId } = slugSnap.data();
          
          // 2. Fetch actual tenant data
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
          setError('عذراً، هذا المتجر غير موجود.');
          setTenant(null);
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ في جلب البيانات.');
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
