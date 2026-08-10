
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
import { ShieldAlert, LogOut, AlertCircle, Zap, Clock, ScrollText } from "lucide-react";
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
    // الانتظار حتى يكتمل التحميل بالكامل قبل اتخاذ قرار التوجيه
    if (!loading) {
      if (!user) {
        router.replace('/login');
        return;
      }

      // تنظيف رقم الهاتف للتحقق الموحد
      const purePhone = profile?.phoneNumber?.replace(/\s+/g, '').replace(/[-+]/g, '').replace(/^(\+964|00964|0)/, '');
      const isMasterAdmin = purePhone && MASTER_PHONES.includes(purePhone);
      
      // الأدوار التي يسمح لها بدخول لوحة الإدارة
      const allowedRoles = ['owner', 'admin', 'sales_employee', 'workshop_technician', 'warehouse_employee'];
      const isMerchantStaff = profile && allowedRoles.includes(profile.role);
      
      // إذا كان سوبر أدمن أو موظف في متجر نشط
      if (isSuperAdmin || isMasterAdmin || (isMerchantStaff && tenantId)) {
        setIsAuthorized(true);
      } else {
        // إذا لم يكن لديه دور إداري، ننتظر قليلاً للتأكد من عدم وجود تأخير في Firestore
        const timer = setTimeout(() => {
          if (profile === null && !isMasterAdmin) {
             router.replace('/onboarding');
          } else if (profile && ['retail_customer', 'wholesale_customer'].includes(profile.role)) {
             router.replace('/');
          }
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user, profile, loading, router, tenantId, isSuperAdmin]);

  // شاشة التحميل الأولية
  if (loading || (tenantId && subscription.loading && !isSuperAdmin)) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#FDF8F5] p-8 gap-8">
         <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-white shadow-2xl animate-bounce">
            <ScrollText className="h-10 w-10" />
         </div>
         <div className="w-full max-w-4xl space-y-6 text-center">
            <Skeleton className="h-[400px] w-full rounded-[40px] opacity-20" />
            <p className="text-primary font-black animate-pulse">جاري المصادقة السحابية...</p>
         </div>
      </div>
    );
  }

  // إذا تم الدخول ولكن لم يتم التصريح (بعد انتهاء التحميل)
  if (!isAuthorized && user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50" dir="rtl">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="h-24 w-24 bg-red-100 text-red-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-primary">وصول غير مصرح به</h1>
            <p className="text-muted-foreground font-medium">حسابك غير مرتبط بمتجر نشط أو لا يمتلك صلاحيات إدارة.</p>
          </div>
          <Button onClick={() => signOut(auth)} className="w-full h-14 rounded-2xl font-black gap-2 shadow-lg bg-primary">
             <LogOut className="h-5 w-5" /> تسجيل الخروج والعودة
          </Button>
        </div>
      </div>
    );
  }

  // منع ظهور أي محتوى قبل اكتمال التحقق
  if (!isAuthorized) return null;

  return (
    <ReliabilityProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-[#FDF8F5] dark:bg-background/95 overflow-hidden">
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
                          <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">يرجى تجديد الاشتراك لتجنب توقف خدمات متجرك.</p>
                        </div>
                     </div>
                     <Button variant="secondary" size="lg" className="rounded-2xl font-black gap-2" asChild>
                        <Link href="/admin/billing"><Zap className="h-4 w-4" /> جدد الآن</Link>
                     </Button>
                  </div>
                ) : subscription.isTrial && (
                  <div className="bg-secondary/5 text-secondary px-6 py-3 rounded-2xl flex items-center justify-between border border-secondary/10 shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center"><Clock className="h-4 w-4" /></div>
                        <p className="text-xs font-black">أنت في الفترة التجريبية: متبقي لك <span className="text-lg underline underline-offset-4">{subscription.daysRemaining}</span> أيام للوصول الكامل.</p>
                     </div>
                     <Link href="/admin/billing" className="text-[10px] font-black uppercase tracking-widest bg-secondary text-white px-4 py-1.5 rounded-full hover:bg-secondary/90 transition-colors">اشترك الآن</Link>
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
