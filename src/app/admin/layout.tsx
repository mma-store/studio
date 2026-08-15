
'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScrollText, Loader2, ShieldAlert, Bug } from "lucide-react";
import { ReliabilityProvider } from "@/components/reliability/reliability-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isAuthenticated, tenantId } = useUser();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      // التحقق من الصلاحيات بعد اكتمال التحميل تماماً
      const allowedRoles = ['owner', 'admin', 'sales_employee', 'workshop_technician', 'warehouse_employee', 'super_admin'];
      const hasValidTenant = !!tenantId && tenantId !== 'GUEST';
      const hasValidRole = profile && allowedRoles.includes(profile.role);

      if (hasValidTenant && hasValidRole) {
        setAuthorized(true);
      } else {
        // إذا كان المستخدم موثقاً ولكن بدون متجر، نوجهه للتأسيس
        router.replace('/onboarding');
      }
    }
  }, [isAuthenticated, profile, loading, router, tenantId]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#FDF8F5] gap-8">
         <div className="h-20 w-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl animate-bounce">
            <ScrollText className="h-10 w-10" />
         </div>
         <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-primary">جاري تأمين اتصالك بالمتجر...</h2>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Master Identity Resolution</p>
         </div>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <ReliabilityProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-[#FDF8F5] dark:bg-background/95 overflow-hidden" dir="rtl">
          <AdminSidebar />
          <SidebarInset className="flex flex-col min-w-0">
            <AdminHeader />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
              <div className="mx-auto max-w-7xl w-full relative">
                {/* Diagnostic Diagnostic Diagnostic Diagnostic Diagnostic Diagnostic */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-6 p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-[10px] space-y-1 border-l-4 border-emerald-500 shadow-xl overflow-hidden relative group">
                    <div className="flex items-center gap-2 mb-2 text-white">
                       <Bug className="h-3 w-3" />
                       <span className="font-black">DIAGNOSTIC OVERLAY (DEV ONLY)</span>
                    </div>
                    <p>Auth UID: {user?.uid}</p>
                    <p>Profile UID: {profile?.uid}</p>
                    <p>Tenant ID: {tenantId}</p>
                    <p>Role: {profile?.role}</p>
                    <p>Match: {user?.uid === profile?.uid ? '✅ YES' : '❌ NO'}</p>
                  </div>
                )}
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ReliabilityProvider>
  );
}
