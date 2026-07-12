
'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { useAuth } from "@/firebase";

const ADMIN_PHONES = ['7858833838', '07858833838'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, tenantId } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else {
        // Strict SaaS Auth Check
        const isMasterAdmin = profile?.phoneNumber && ADMIN_PHONES.includes(profile.phoneNumber.replace(/\s/g, '').replace(/^\+964/, ''));
        const isMerchant = profile && ['owner', 'admin', 'sales_employee', 'workshop_technician', 'warehouse_employee'].includes(profile.role);
        
        if ((isMerchant || isMasterAdmin) && tenantId) {
          setIsAuthorized(true);
        } else {
          // If logged in but not a merchant or has no tenant, they are just a customer
          router.replace('/');
        }
      }
    }
  }, [user, profile, loading, router, tenantId]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-8 gap-8">
         <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-white shadow-2xl animate-bounce">
            <span className="text-3xl font-black italic">M</span>
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
          <div className="h-24 w-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F8F9FA] dark:bg-background/95 overflow-hidden">
        <AdminSidebar />
        <SidebarInset className="flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto max-w-7xl w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
