
'use client';

import { useMemo } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

export type PlanLimits = {
  maxProducts: number;
  maxOrders: number;
  features: string[];
};

const PLAN_LIMITS: Record<string, PlanLimits> = {
  trial: {
    maxProducts: 10,
    maxOrders: 50,
    features: ['storefront', 'basic_reports', 'pos'],
  },
  starter: {
    maxProducts: 50,
    maxOrders: 200,
    features: ['storefront', 'basic_reports', 'pos'],
  },
  business: {
    maxProducts: 9999,
    maxOrders: 9999,
    features: ['storefront', 'advanced_reports', 'pos', 'workshop', 'employee_roles'],
  },
  enterprise: {
    maxProducts: 99999,
    maxOrders: 99999,
    features: ['all'],
  },
};

export function useSubscription(tenantId: string) {
  const db = useFirestore();
  const tenantRef = useMemo(() => tenantId ? doc(db, 'tenants', tenantId) : null, [db, tenantId]);
  const { data: tenant, loading } = useDoc<any>(tenantRef);

  const plan = tenant?.subscriptionPlan || 'trial';
  const status = tenant?.status || 'trial';
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.trial;

  const isExpired = useMemo(() => {
    if (tenantId === 'MMA001') return false; // Grandfathered
    if (status === 'expired') return true;
    if (status === 'suspended') return true;
    if (tenant?.trialEndDate && Date.now() > tenant.trialEndDate) return true;
    return false;
  }, [tenant, status, tenantId]);

  const daysRemaining = useMemo(() => {
    if (!tenant?.trialEndDate) return 0;
    const diff = tenant.trialEndDate - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [tenant]);

  return {
    plan,
    status,
    limits,
    isExpired,
    daysRemaining,
    loading,
    canAddProduct: (currentCount: number) => !isExpired && currentCount < limits.maxProducts,
    canAccessFeature: (feature: string) => {
      if (isExpired) return false;
      if (limits.features.includes('all')) return true;
      return limits.features.includes(feature);
    },
    isTrial: plan === 'trial',
  };
}
