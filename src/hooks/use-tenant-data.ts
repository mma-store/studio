'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';

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
    const tenantsRef = collection(db, 'tenants');
    const q = query(tenantsRef, where('slug', '==', slug), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data() as TenantData;
        if (data.status !== 'active') {
          setError('هذا المتجر غير نشط حالياً.');
          setTenant(null);
        } else {
          setTenant({ ...data, tenantId: snapshot.docs[0].id });
          setError(null);
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

    return () => unsubscribe();
  }, [db, slug]);

  return { tenant, loading, error };
}