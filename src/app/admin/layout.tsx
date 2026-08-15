'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScrollText, ShieldAlert, RefreshCw } from "lucide-react";
import { ReliabilityProvider } from "@/components/reliability/reliability-provider";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, isAuthenticated, error } = useUser();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      // Ensure we have a resolved identity with a valid tenantId (not GUEST)
      if (profile?.tenantId && profile.tenantId !== 'GUEST') {
        setReady(true);
      } else if (profile && (!profile.tenantId || profile.tenantId === 'GUEST')) {
        // User exists but needs to setup their store
        router.replace('/onboarding');
      }
    }
  }, [isAuthenticated, profile, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FDF8F5] gap-6">
         <div className="h-20 w-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl animate-pulse">
            <ScrollText className="h-10 w-10" />
         </div>
         <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-primary">جاري تأمين اتصالك بالمتجر...</h2>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">Identity Resolution Layer</p>
         </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-red-50 p-6 text-center gap-6" dir="rtl">
         <div className="h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-red-600" />
         </div>
         <div className="space-y-2">
            <h1 className="text-2xl font-black text-red-900">حدث خلل في التحقق من الهوية</h1>
            <p className="text-sm font-bold text-red-700 max-w-md mx-auto">{error}</p>
         </div>
         <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 h-14 px-10 rounded-2xl gap-2 font-black shadow-xl">
            <RefreshCw className="h-5 w-5" /> إعادة محاولة الاتصال
         </Button>
      </div>
    );
  }

  // Prevent rendering operational components until tenantId is ready in the context
  if (!ready) return null;

  return (
    <ReliabilityProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-[#FDF8F5] dark:bg-background/95 overflow-hidden" dir="rtl">
          <AdminSidebar />
          <SidebarInset className="flex flex-col min-w-0">
            <AdminHeader />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
              <div className="mx-auto max-w-7xl w-full relative">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ReliabilityProvider>
  );
}