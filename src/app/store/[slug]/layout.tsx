
'use client';

import { use, useEffect, useState } from "react";
import { useTenantData } from "@/hooks/use-tenant-data";
import { Loader2 } from "lucide-react";

export default function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { tenant, loading } = useTenantData(slug);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-slate-200" />
      </div>
    );
  }

  const theme = tenant?.storeTheme || {
    primary: "#1A365D",
    secondary: "#C05621",
    background: "#FDF8F5",
    card: "#FFFFFF",
    textPrimary: "#1A202C",
    textSecondary: "#718096"
  };

  return (
    <div 
      className="min-h-screen font-almarai transition-colors duration-500"
      style={{ 
        backgroundColor: theme.background,
        color: theme.textPrimary,
        // Custom CSS Variables for components to use
        "--store-primary": theme.primary,
        "--store-secondary": theme.secondary,
        "--store-bg": theme.background,
        "--store-card": theme.card,
        "--store-text": theme.textPrimary,
        "--store-text-muted": theme.textSecondary,
      } as React.CSSProperties}
    >
      <style jsx global>{`
        :root {
          --store-primary: ${theme.primary};
          --store-secondary: ${theme.secondary};
        }
        .store-primary-bg { background-color: ${theme.primary}; }
        .store-primary-text { color: ${theme.primary}; }
        .store-card { background-color: ${theme.card}; }
        .btn-store {
          background-color: ${theme.primary};
          color: white;
        }
        .btn-store:hover {
          opacity: 0.9;
        }
      `}</style>
      {children}
    </div>
  );
}
