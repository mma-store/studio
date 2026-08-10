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
import { ShieldAlert, LogOut, ScrollText } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { ReliabilityProvider } from "@/components/reliability/reliability-provider";

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
        return;
      }

      // التحقق من الصلاحيات الإدارية
      const allowedRoles = ['owner', 'admin', 'sales_employee', 'workshop_technician', 'warehouse_employee'];
      const hasAdminRole = profile && allowedRoles.includes(profile.role);
      
      if (isSuperAdmin || (hasAdminRole && tenantId)) {
        setIsAuthorized(true);
      } else {
        // ننتظر قليلاً للتأكد من المزامنة قبل التوجيه النهائي
        const timer = setTimeout(() => {
          if (!profile) {
            router.replace('/onboarding');
          } else {
            router.replace('/');
          }
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, profile, loading, router, tenantId, isSuperAdmin]);

  // حالة التحميل الأولية
  if (loading || (user && !profile && !isAuthorized)) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#FDF8F5] p-8 gap-8">
         <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-white shadow-2xl animate-bounce">
            <ScrollText className="h-10 w-10" />
         </div>
         <div className="w-full max-w-4xl space-y-6 text-center">
            <Skeleton className="h-64 w-full rounded-[40px] opacity-20" />
            <p className="text-primary font-black animate-pulse text-lg">جارٍ التحقق من هويتك وصلاحيات المتجر...</p>
         </div>
      </div>
    );
  }

  // إذا انتهى التحميل ولم يكن مصرحاً له
  if (!isAuthorized && user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50" dir="rtl">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="h-24 w-24 bg-red-100 text-red-600 rounded-[32px] flex items-center justify-center mx-auto">
            <ShieldAlert className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-primary">عذراً، لا تمتلك صلاحية الدخول</h1>
            <p className="text-muted-foreground font-medium">حسابك غير مرتبط بمتجر إداري أو صلاحياتك لا تسمح بالوصول لهذه اللوحة.</p>
          </div>
          <div className="flex flex-col gap-3">
             <Button onClick={() => router.push('/onboarding')} className="w-full h-14 rounded-2xl font-black bg-primary">تأسيس متجر جديد</Button>
             <Button onClick={() => signOut(auth)} variant="outline" className="w-full h-14 rounded-2xl font-black">تسجيل الخروج</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ReliabilityProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-[#FDF8F5] dark:bg-background/95 overflow-hidden">
          <AdminSidebar />
          <SidebarInset className="flex flex-col min-w-0">
            <AdminHeader />
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
