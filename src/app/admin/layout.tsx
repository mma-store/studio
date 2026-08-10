
'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { useAuth } from "@/firebase";
import { ShieldAlert, LogOut, AlertCircle, Zap, Clock } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import Link from "next/link";
import { ReliabilityProvider } from "@/components/reliability/reliability-provider";

const MASTER_PHONES = ['7858833838', '7703687932'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, tenantId, isSuperAdmin } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const subscription = useSubscription(tenantId);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else {
        const purePhone = profile?.phoneNumber?.replace(/\s/g, '').replace(/^(\+964|0)/, '');
        const isMasterAdmin = purePhone && MASTER_PHONES.includes(purePhone);
        const isMerchant = profile && ['owner', 'admin', 'sales_employee', 'workshop_technician', 'warehouse_employee'].includes(profile.role);
        
        if (isSuperAdmin || isMasterAdmin || (isMerchant && tenantId)) {
          setIsAuthorized(true);
        } else {
          router.replace('/');
        }
      }
    }
  }, [user, profile, loading, router, tenantId, isSuperAdmin]);

  if (loading || (tenantId && subscription.loading)) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-8 gap-8">
         <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-white shadow-2xl animate-bounce">
            <span className="text-3xl font-black italic">P</span>
         </div>
         <div className="w-full max-w-4xl space-y-6">
            <Skeleton className="h-[400px] w-full rounded-[40px]" />
         </div>
      </div>
    );
  }

  if (!isAuthorized && user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50" dir="rtl">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="h-24 w-24 bg-red-100 text-red-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black">وصول غير مصرح به</h1>
            <p className="text-muted-foreground font-medium">حسابك غير مرتبط بمتجر نشط أو لا يمتلك صلاحيات الإدارة.</p>
          </div>
          <Button onClick={() => signOut(auth)} className="w-full h-14 rounded-2xl font-black gap-2">
             <LogOut className="h-5 w-5" /> تسجيل الخروج
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <ReliabilityProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-[#F8F9FA] dark:bg-background/95 overflow-hidden">
          <AdminSidebar />
          <SidebarInset className="flex flex-col min-w-0">
            <AdminHeader />
            
            {!isSuperAdmin && (
              <div className="px-6 py-2">
                {subscription.isExpired ? (
                  <div className="bg-red-600 text-white px-6 py-4 rounded-[28px] flex items-center justify-between animate-in slide-in-from-top duration-500 shadow-xl shadow-red-600/20">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center"><AlertCircle className="h-6 w-6" /></div>
                        <div>
                          <p className="font-black text-sm">انتهت صلاحية الاشتراك!</p>
                          <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">يرجى تجديد الاشتراك لتجنب توقف الخدمات وحذف البيانات المؤقتة.</p>
                        </div>
                     </div>
                     <Button variant="secondary" size="lg" className="rounded-2xl font-black gap-2" asChild>
                        <Link href="/admin/billing"><Zap className="h-4 w-4" /> جدد الآن</Link>
                     </Button>
                  </div>
                ) : subscription.isTrial && (
                  <div className="bg-primary/5 text-primary px-6 py-3 rounded-2xl flex items-center justify-between border border-primary/10 shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><Clock className="h-4 w-4" /></div>
                        <p className="text-xs font-black">أنت في الفترة التجريبية: متبقي لك <span className="text-lg underline underline-offset-4">{subscription.daysRemaining}</span> أيام للوصول الكامل.</p>
                     </div>
                     <Link href="/admin/billing" className="text-[10px] font-black uppercase tracking-widest bg-primary text-white px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors">اشترك الآن</Link>
                  </div>
                )}
              </div>
            )}

            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
              <div className="mx-auto max-w-7xl w-full">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ReliabilityProvider>
  );
}
