'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScrollText, ShieldAlert, Bug, BadgeCheck, RefreshCw, AlertCircle } from "lucide-react";
import { ReliabilityProvider } from "@/components/reliability/reliability-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isAuthenticated, identitySource, error, diagnostic } = useUser();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading && !error) {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      if (profile?.tenantId) {
        setReady(true);
      } else if (profile && !profile.tenantId) {
        router.replace('/onboarding');
      } else if (!profile) {
        router.replace('/onboarding');
      }
    }
  }, [isAuthenticated, profile, loading, error, router]);

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
            <h1 className="text-2xl font-black text-red-900">حدث خلل في التحقق</h1>
            <p className="text-sm font-bold text-red-700 max-w-md mx-auto">{error}</p>
         </div>

         {process.env.NODE_ENV === 'development' && diagnostic && (
           <div className="max-w-xl w-full bg-slate-900 text-slate-300 p-6 rounded-3xl text-right font-mono text-xs space-y-4 shadow-2xl">
              <p className="text-primary font-black border-b border-white/10 pb-2">DIAGNOSTIC TRACE:</p>
              <div className="space-y-1">
                 <p>Auth UID: {diagnostic.authUid}</p>
                 <p>Auth Email: {diagnostic.authEmail}</p>
              </div>
              <div className="space-y-1 border-t border-white/10 pt-2">
                 <p className="text-white">Execution Steps:</p>
                 {diagnostic.steps.map((step: string, i: number) => (
                   <p key={i} className="flex gap-2">
                      <span className="opacity-30">[{i+1}]</span> {step}
                   </p>
                 ))}
              </div>
           </div>
         )}

         <div className="flex gap-3">
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 h-14 px-10 rounded-2xl gap-2 font-black shadow-xl">
               <RefreshCw className="h-5 w-5" /> إعادة محاولة الاتصال
            </Button>
            <Button variant="outline" onClick={() => router.push('/login')} className="h-14 px-8 rounded-2xl font-bold">تسجيل الدخول مجدداً</Button>
         </div>
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
                
                {/* 🛡️ IDENTITY DIAGNOSTIC BAR (DEV ONLY) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className={cn(
                    "mb-6 p-4 rounded-[24px] text-white shadow-xl flex items-center justify-between border-l-8 overflow-hidden",
                    identitySource === 'canonical' ? "bg-slate-900 border-emerald-500" : "bg-amber-900 border-orange-500"
                  )}>
                    <div className="flex items-center gap-4">
                       <div className={cn(
                         "h-10 w-10 rounded-xl flex items-center justify-center",
                         identitySource === 'canonical' ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"
                       )}>
                          <Bug className="h-5 w-5" />
                       </div>
                       <div>
                          <p className="font-black text-xs">DIAGNOSTIC: Identity Resolved ({identitySource})</p>
                          <p className="text-[10px] opacity-60 font-mono">UID: {user?.uid}</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase opacity-40 leading-none mb-1">Tenant Status</p>
                          <p className="text-xs font-bold text-emerald-400">ACTIVE: {profile?.tenantId}</p>
                       </div>
                       <BadgeCheck className={cn("h-6 w-6", identitySource === 'canonical' ? "text-emerald-400" : "text-orange-400")} />
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
