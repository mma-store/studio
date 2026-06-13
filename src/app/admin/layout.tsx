
'use client';

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/profile'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-8">
         <div className="w-full max-w-6xl space-y-8">
            <div className="flex items-center justify-between">
               <Skeleton className="h-12 w-48 rounded-xl" />
               <Skeleton className="h-12 w-12 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <Skeleton className="h-32 rounded-3xl" />
               <Skeleton className="h-32 rounded-3xl" />
               <Skeleton className="h-32 rounded-3xl" />
               <Skeleton className="h-32 rounded-3xl" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-3xl" />
         </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F8F9FA] dark:bg-background">
        <AdminSidebar />
        <SidebarInset className="flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
