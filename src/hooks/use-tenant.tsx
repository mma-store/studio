
'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useUser } from '@/firebase';

/**
 * @fileOverview Centralized Tenant Context.
 * The absolute source of truth for the current tenant identity.
 */

interface TenantContextType {
  tenantId: string | null;
  isLoading: boolean;
  isLinkedToStore: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useUser();

  const value = useMemo(() => ({
    tenantId: profile?.tenantId || null,
    isLoading: loading,
    isLinkedToStore: !!profile?.tenantId && profile.tenantId !== 'GUEST'
  }), [profile, loading]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
