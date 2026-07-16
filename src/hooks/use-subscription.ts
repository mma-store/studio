
'use client';

import { useMemo, useEffect } from 'react';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, updateDoc, where } from 'firebase/firestore';

export type PlanLimits = {
  maxProducts: number;
  maxEmployees: number;
  maxOrdersPerMonth: number;
  features: string[];
};

// Fallback limits if no plan is found in DB
const FALLBACK_PLAN_LIMITS: Record<string, PlanLimits> = {
  trial: {
    maxProducts: 10,
    maxEmployees: 1,
    maxOrdersPerMonth: 50,
    features: ['storefront', 'pos'],
  },
  starter: {
    maxProducts: 50,
    maxEmployees: 3,
    maxOrdersPerMonth: 200,
    features: ['storefront', 'pos', 'basic_reports'],
  },
  business: {
    maxProducts: 9999,
    maxEmployees: 10,
    maxOrdersPerMonth: 9999,
    features: ['storefront', 'advanced_reports', 'pos', 'workshop', 'employee_roles'],
  },
  enterprise: {
    maxProducts: 99999,
    maxEmployees: 99,
    maxOrdersPerMonth: 99999,
    features: ['all'],
  },
};

export function useSubscription(tenantId: string) {
  const db = useFirestore();
  
  // Fetch tenant doc
  const tenantRef = useMemo(() => tenantId ? doc(db, 'tenants', tenantId) : null, [db, tenantId]);
  const { data: tenant, loading: tenantLoading } = useDoc<any>(tenantRef);

  // Fetch all plans to get limits dynamically
  const { data: allPlans } = useCollection(query(collection(db, 'plans')));

  const currentPlanData = useMemo(() => {
    if (!tenant) return null;
    return allPlans.find(p => p.id === tenant.subscriptionPlanId || p.name === tenant.subscriptionPlan);
  }, [allPlans, tenant]);

  const plan = tenant?.subscriptionPlan || 'trial';
  const status = tenant?.status || 'trial';
  
  // Resolve limits: DB Plan -> Hardcoded Fallback
  const limits = useMemo(() => {
    if (currentPlanData) {
      return {
        maxProducts: currentPlanData.maxProducts || 0,
        maxEmployees: currentPlanData.maxEmployees || 0,
        maxOrdersPerMonth: currentPlanData.maxOrdersPerMonth || 999,
        features: [
          currentPlanData.posEnabled ? 'pos' : '',
          currentPlanData.reportsEnabled ? 'reports' : '',
          currentPlanData.workshopEnabled ? 'workshop' : '',
          currentPlanData.onlineStoreEnabled ? 'storefront' : '',
          currentPlanData.customDomainEnabled ? 'custom_domain' : '',
          currentPlanData.prioritySupport ? 'priority_support' : '',
        ].filter(Boolean)
      } as PlanLimits;
    }
    return FALLBACK_PLAN_LIMITS[plan] || FALLBACK_PLAN_LIMITS.trial;
  }, [currentPlanData, plan]);

  const isExpired = useMemo(() => {
    if (tenantId === 'MMA001') return false; // Grandfathered
    if (status === 'expired' || status === 'suspended' || status === 'cancelled') return true;
    
    // Check Date
    const expiryDate = tenant?.trialEndDate || tenant?.currentPeriodEnd;
    if (expiryDate && Date.now() > expiryDate) return true;
    
    return false;
  }, [tenant, status, tenantId]);

  // Auto-update status if expired on the client side (simple trigger)
  useEffect(() => {
    if (tenant && !tenantLoading && !isExpired && status !== 'expired') {
      const expiryDate = tenant.trialEndDate || tenant.currentPeriodEnd;
      if (expiryDate && Date.now() > expiryDate) {
        updateDoc(doc(db, 'tenants', tenant.tenantId), { status: 'expired' });
      }
    }
  }, [tenant, tenantLoading, isExpired, status, db]);

  const daysRemaining = useMemo(() => {
    const expiryDate = tenant?.trialEndDate || tenant?.currentPeriodEnd;
    if (!expiryDate) return 0;
    const diff = expiryDate - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [tenant]);

  return {
    tenant,
    plan,
    status,
    limits,
    isExpired,
    daysRemaining,
    loading: tenantLoading,
    canAddProduct: (currentCount: number) => !isExpired && currentCount < (limits.maxProducts || 9999),
    canAddEmployee: (currentCount: number) => !isExpired && currentCount < (limits.maxEmployees || 9999),
    canAccessFeature: (feature: string) => {
      if (isExpired) return false;
      if (limits.features.includes('all')) return true;
      return limits.features.includes(feature);
    },
    isTrial: status === 'trial',
  };
}
