
'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ReliabilityProvider } from "@/components/reliability/reliability-provider";
import { Loader2, ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // التحقق من الجلسة المحلية (DUBSAR 2.0 Local Auth)
    const sessionStr = localStorage.getItem('dubsar_session');
    if (sessionStr) {
      setUser(JSON.parse(sessionStr));
      setReady(true);
    } else {
      router.replace('/login');
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FDF8F5]">
         <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary opacity-20" />
            <p className="font-black text-primary">تحميل البيئة المحلية...</p>
         </div>
      </div>
    );
  }

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
