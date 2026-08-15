
'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScrollText, Loader2, ShieldAlert } from "lucide-react";
import { ReliabilityProvider } from "@/components/reliability/reliability-provider";

/**
 * @fileOverview حارس لوحة التحكم (Dashboard Guard).
 * يمنع الدخول أو التوجيه حتى اكتمال بناء الهوية الرقمية بالكامل.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isAuthenticated } = useUser();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<'LOADING' | 'AUTHORIZED' | 'UNAUTHORIZED'>('LOADING');

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
        setAuthStatus('UNAUTHORIZED');
        return;
      }

      // التحقق من اكتمال الملف الشخصي ووجود المتجر
      // الأدوار المسموح بها في لوحة التحكم الإدارية
      const allowedRoles = ['owner', 'admin', 'sales_employee', 'workshop_technician', 'warehouse_employee'];
      const hasValidProfile = profile && profile.tenantId && allowedRoles.includes(profile.role);

      if (hasValidProfile) {
        setAuthStatus('AUTHORIZED');
      } else {
        // إذا لم يتم العثور على متجر لهذا المستخدم الموثق
        router.replace('/onboarding');
        setAuthStatus('UNAUTHORIZED');
      }
    }
  }, [isAuthenticated, profile, loading, router]);

  // شاشة التحقق الآمنة (Branded Loading)
  if (loading || authStatus === 'LOADING') {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#FDF8F5] p-8 gap-8">
         <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-white shadow-2xl animate-bounce">
            <ScrollText className="h-10 w-10" />
         </div>
         <div className="text-center space-y-4">
            <h2 className="text-2xl font-black text-primary">جارٍ تأمين اتصالك بالمتجر</h2>
            <p className="text-muted-foreground font-bold max-w-xs mx-auto text-sm">نحن نتحقق من هويتك وصلاحياتك السحابية لضمان أمن بياناتك.</p>
            <div className="flex justify-center pt-4">
               <Loader2 className="h-6 w-6 animate-spin text-primary opacity-30" />
            </div>
         </div>
      </div>
    );
  }

  if (authStatus === 'UNAUTHORIZED') return null;

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
