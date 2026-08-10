
'use client';

import { useMemo } from 'react';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';

export type PlanLimits = {
  maxProducts: number;
  maxEmployees: number;
  maxOrdersPerMonth: number;
  features: string[];
};

export function useSubscription(tenantId: string | null) {
  const db = useFirestore();
  
  const tenantRef = useMemo(() => tenantId ? doc(db, 'tenants', tenantId) : null, [db, tenantId]);
  const { data: tenant, loading: tenantLoading } = useDoc<any>(tenantRef);

  // Fetch all plans to find the match or dynamic details
  const plansQuery = useMemo(() => query(collection(db, 'plans'), where('active', '==', true)), [db]);
  const { data: allPlans } = useCollection(plansQuery);

  const currentPlan = useMemo(() => {
    if (!tenant) return null;
    return allPlans.find(p => p.id === tenant.subscriptionPlanId);
  }, [allPlans, tenant]);

  const planName = currentPlan?.name || tenant?.subscriptionPlan || 'trial';
  const status = tenant?.status || 'trial';
  
  const limits = useMemo(() => {
    if (currentPlan) {
      return {
        maxProducts: currentPlan.maxProducts || 9999,
        maxEmployees: currentPlan.maxEmployees || 99,
        maxOrdersPerMonth: 99999,
        features: currentPlan.features || []
      } as PlanLimits;
    }
    // Fallback for trials or legacy
    return {
      maxProducts: 10,
      maxEmployees: 1,
      maxOrdersPerMonth: 50,
      features: ['storefront', 'pos']
    } as PlanLimits;
  }, [currentPlan]);

  const isExpired = useMemo(() => {
    if (!tenantId || tenantId === 'PLATFORM_OWNER') return false;
    
    // Explicit suspended status
    if (status === 'suspended' || status === 'cancelled') return true;
    
    const now = Date.now();
    
    // Check trial expiration
    if (status === 'trial') {
      return tenant?.trialEndDate ? now > tenant.trialEndDate : false;
    }

    // Check subscription period expiration
    if (tenant?.currentPeriodEnd) {
      return now > tenant.currentPeriodEnd;
    }
    
    return false;
  }, [tenant, status, tenantId]);

  const daysRemaining = useMemo(() => {
    const expiryDate = status === 'trial' ? tenant?.trialEndDate : tenant?.currentPeriodEnd;
    if (!expiryDate) return 0;
    const diff = expiryDate - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [tenant, status]);

  return {
    tenant,
    planName,
    status,
    limits,
    isExpired,
    daysRemaining,
    loading: tenantLoading,
    canAddProduct: (currentCount: number) => !isExpired && currentCount < (limits.maxProducts),
    canAddEmployee: (currentCount: number) => !isExpired && currentCount < (limits.maxEmployees),
    isTrial: status === 'trial',
  };
}
