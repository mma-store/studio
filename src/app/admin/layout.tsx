'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScrollText, Loader2 } from "lucide-react";
import { ReliabilityProvider } from "@/components/reliability/reliability-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isAuthenticated } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }

      // الصلاحيات الإدارية المسموح بها في لوحة التحكم
      const allowedRoles = ['owner', 'admin', 'sales_employee', 'workshop_technician', 'warehouse_employee'];
      
      // التاجر يجب أن يمتلك ملفاً شخصياً ودوراً إدارياً ومعرف متجر
      const hasAdminProfile = profile && allowedRoles.includes(profile.role) && profile.tenantId;
      
      if (hasAdminProfile) {
        setIsAuthorized(true);
      } else {
        // إذا كان مستخدماً موثقاً ولكن بدون بروفايل كامل، نوجهه للتأسيس أو الواجهة
        if (!profile || !profile.tenantId) {
          router.replace('/onboarding');
        } else {
          router.replace('/');
        }
      }
    }
  }, [isAuthenticated, profile, loading, router]);

  // شاشة انتظار جمالية ومؤمنة
  if (loading || (isAuthenticated && !isAuthorized)) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#FDF8F5] p-8 gap-8">
         <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-white shadow-2xl animate-bounce">
            <ScrollText className="h-10 w-10" />
         </div>
         <div className="text-center space-y-4">
            <h2 className="text-2xl font-black text-primary animate-pulse">جارٍ تأمين اتصالك بالمتجر</h2>
            <p className="text-muted-foreground font-bold max-w-xs mx-auto">نحن نتحقق من هويتك وصلاحياتك السحابية لضمان أمن بياناتك.</p>
            <div className="flex justify-center pt-4">
               <Loader2 className="h-6 w-6 animate-spin text-primary opacity-30" />
            </div>
         </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <ReliabilityProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-[#FDF8F5] dark:bg-background/95 overflow-hidden" dir="rtl">
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
