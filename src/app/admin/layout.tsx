
'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScrollText, Loader2, ShieldAlert, Bug, ShieldCheck, AlertCircle } from "lucide-react";
import { ReliabilityProvider } from "@/components/reliability/reliability-provider";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isAuthenticated, tenantId, error } = useUser();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      // توجيه ذكي بناءً على البروفايل المرجعي
      if (profile) {
        if (profile.tenantId) {
          setReady(true);
        } else {
          // مستخدم موثق ولكن لا يملك متجر
          router.replace('/onboarding');
        }
      } else {
        // لا يوجد بروفايل على الإطلاق
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
      <div className="flex h-screen w-full flex-col items-center justify-center bg-red-50 p-6 text-center gap-4">
         <ShieldAlert className="h-16 w-16 text-red-600" />
         <h1 className="text-2xl font-black text-red-900">خطأ في تحديد الهوية</h1>
         <p className="text-sm font-bold text-red-700 max-w-md">{error}</p>
         <button onClick={() => window.location.reload()} className="mt-4 px-8 h-12 bg-red-600 text-white rounded-xl font-black">إعادة المحاولة</button>
      </div>
    );
  }

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
                
                {/* 🛡️ RESOLVE CURRENT ACCOUNT - DIAGNOSTIC OVERLAY (DEV ONLY) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-6 p-5 rounded-[28px] bg-slate-900 text-white shadow-2xl border-l-8 border-emerald-500 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3">
                          <Bug className="h-5 w-5 text-emerald-400" />
                          <span className="font-black text-sm tracking-tight">DIAGNOSTIC: resolveCurrentAccount()</span>
                       </div>
                       <BadgeCheck className="h-5 w-5 text-emerald-400" />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-[10px]">
                       <div className="space-y-1">
                          <p className="opacity-50 uppercase font-black">Auth UID</p>
                          <p className="truncate font-bold text-emerald-400">{user?.uid}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="opacity-50 uppercase font-black">Profile ID</p>
                          <p className={cn("truncate font-bold", profile?.uid === user?.uid ? "text-emerald-400" : "text-red-400")}>
                             {profile?.uid || 'MISSING'}
                          </p>
                       </div>
                       <div className="space-y-1">
                          <p className="opacity-50 uppercase font-black">Tenant ID</p>
                          <p className="truncate font-bold text-blue-400">{profile?.tenantId || 'NONE'}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="opacity-50 uppercase font-black">Account Role</p>
                          <p className="truncate font-bold text-orange-400">{profile?.role} / {profile?.accountType}</p>
                       </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4">
                       <div className="flex items-center gap-1.5 text-[9px] font-black">
                          <div className={cn("h-2 w-2 rounded-full", profile?.uid === user?.uid ? "bg-emerald-500" : "bg-red-500")} />
                          Auth Match
                       </div>
                       <div className="flex items-center gap-1.5 text-[9px] font-black">
                          <div className={cn("h-2 w-2 rounded-full", profile?.tenantId ? "bg-emerald-500" : "bg-red-500")} />
                          Tenant Resolved
                       </div>
                       <div className="flex items-center gap-1.5 text-[9px] font-black">
                          <div className={cn("h-2 w-2 rounded-full", profile?.status === 'active' ? "bg-emerald-500" : "bg-red-500")} />
                          Account Active
                       </div>
                    </div>
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
