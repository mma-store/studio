
'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "@/components/super-admin/sidebar";
import { SuperAdminHeader } from "@/components/super-admin/header";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { useAuth } from "@/firebase";
import { ShieldAlert, LogOut } from "lucide-react";

// تم تحديث أرقام المدير العام للمنصة (الرقم الشخصي الجديد)
const MASTER_SUPER_ADMINS = ['7858833838', '07858833838'];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else {
        const purePhone = profile?.phoneNumber?.replace(/\s/g, '').replace(/^(\+964|0)/, '');
        const isMaster = purePhone && MASTER_SUPER_ADMINS.includes(purePhone);
        const isExplicitSuper = profile?.role === 'super_admin';

        if (isMaster || isExplicitSuper) {
          setIsAuthorized(true);
        } else {
          router.replace('/admin'); // توجيه التجار للوحة التحكم الخاصة بهم
        }
      }
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-900 gap-6">
         <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-2xl shadow-primary/20" />
         <div className="text-center space-y-2">
            <p className="text-white font-black text-xl">جاري التحقق من الهوية العليا</p>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Master Identity Verification</p>
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
            <h1 className="text-2xl font-black text-slate-900">منطقة محظورة</h1>
            <p className="text-muted-foreground font-medium">هذه المنطقة مخصصة حصراً لمدير المنصة العام. تم تسجيل محاولة الدخول.</p>
          </div>
          <div className="grid gap-3 pt-4">
             <Button onClick={() => router.replace('/admin')} className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                العودة لمتجري
             </Button>
             <Button variant="ghost" onClick={() => signOut(auth)} className="font-bold text-red-600">تسجيل الخروج</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F8FAFC] dark:bg-slate-950 overflow-hidden" dir="rtl">
        <SuperAdminSidebar />
        <SidebarInset className="flex flex-col min-w-0">
          <SuperAdminHeader />
          <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto bg-slate-50/50">
            <div className="mx-auto max-w-7xl w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
