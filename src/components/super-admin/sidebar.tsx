
"use client";

import * as React from "react";
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  ShieldCheck, 
  Settings,
  LogOut,
  BarChart3,
  Database,
  Globe,
  LifeBuoy
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { toast } from "@/hooks/use-toast";

const LOGO_URL = "https://up6.cc/2026/07/178308238964931.png";

const SUPER_ADMIN_MENU = [
  {
    label: "المنصة",
    items: [
      { title: "نظرة عامة", icon: LayoutDashboard, href: "/super-admin" },
      { title: "المتاجر المشتركة", icon: Store, href: "/super-admin/tenants" },
      { title: "كافة المستخدمين", icon: Users, href: "/super-admin/users" },
    ]
  },
  {
    label: "الاشتراكات والمالية",
    items: [
      { title: "خطط الاشتراك", icon: ShieldCheck, href: "/super-admin/plans" },
      { title: "التقارير العامة", icon: BarChart3, href: "/super-admin/analytics" },
    ]
  },
  {
    label: "إعدادات المنصة",
    items: [
      { title: "المواقع العامة", icon: Globe, href: "/" },
      { title: "الدعم الفني", icon: LifeBuoy, href: "/super-admin/support" },
      { title: "قاعدة البيانات", icon: Database, href: "/super-admin/database" },
      { title: "الإعدادات", icon: Settings, href: "/super-admin/settings" },
    ]
  }
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في تسجيل الخروج" });
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-l bg-slate-900 text-white">
      <SidebarHeader className="h-28 flex flex-col items-center justify-center border-b border-white/10 px-6 bg-slate-950">
        <Link href="/super-admin" className="flex flex-col items-center gap-2">
          <div className="relative h-12 w-32 shrink-0">
            <Image src={LOGO_URL} alt="Platform" fill className="object-contain" />
          </div>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Platform Admin</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-4">
        {SUPER_ADMIN_MENU.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-widest text-white/40 group-data-[collapsible=icon]:hidden mt-4 mb-2 text-right">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        className={cn(
                          "h-11 px-4 transition-all hover:bg-white/5 text-right flex-row-reverse justify-start gap-3",
                          isActive ? "bg-primary text-white" : "text-white/70"
                        )}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-white/50")} />
                          <span className="font-bold text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-4 space-y-4">
        <div className="px-4 py-3 bg-white/5 rounded-[20px] border border-white/10 group-data-[collapsible=icon]:hidden text-left" dir="ltr">
           <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Infrastructure</p>
           <p className="text-xs font-black text-white">Developed by: <span className="text-primary">Hussein Salah</span></p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="h-11 px-4 text-red-400 hover:bg-red-500/10 hover:text-red-400 w-full flex-row-reverse gap-3"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-bold group-data-[collapsible=icon]:hidden">تسجيل الخروج</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
