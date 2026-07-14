
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
  LifeBuoy,
  History,
  CreditCard,
  Building2
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
    label: "إدارة المنصة",
    items: [
      { title: "لوحة التحكم", icon: LayoutDashboard, href: "/super-admin" },
      { title: "المتاجر المشتركة", icon: Store, href: "/super-admin/tenants" },
      { title: "سجل النشاط العام", icon: History, href: "/super-admin/audit" },
    ]
  },
  {
    label: "المالية والاشتراكات",
    items: [
      { title: "خطط الاشتراك", icon: CreditCard, href: "/super-admin/plans" },
      { title: "تحليلات النمو", icon: BarChart3, href: "/super-admin/analytics" },
    ]
  },
  {
    label: "النظام والسيرفر",
    items: [
      { title: "قاعدة البيانات", icon: Database, href: "/super-admin/database" },
      { title: "دعم فني وتذاكر", icon: LifeBuoy, href: "/super-admin/support" },
      { title: "الإعدادات العامة", icon: Settings, href: "/super-admin/settings" },
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
    <Sidebar collapsible="icon" className="border-l bg-slate-950 text-white" side="right">
      <SidebarHeader className="h-28 flex flex-col items-center justify-center border-b border-white/5 px-6 bg-black/20">
        <Link href="/super-admin" className="flex flex-col items-center gap-2">
          <div className="relative h-12 w-36 shrink-0">
            <Image src={LOGO_URL} alt="Platform" fill className="object-contain brightness-0 invert" />
          </div>
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em] opacity-60 group-data-[collapsible=icon]:hidden">Master Portal</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-8 px-4">
        {SUPER_ADMIN_MENU.map((group) => (
          <SidebarGroup key={group.label} className="mb-6">
            <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-data-[collapsible=icon]:hidden mb-4 text-right">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        className={cn(
                          "h-12 px-4 transition-all duration-300 rounded-[18px] hover:bg-white/5 text-right flex-row justify-start gap-4",
                          isActive ? "bg-primary text-white shadow-2xl shadow-primary/40 scale-105" : "text-white/60"
                        )}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon className={cn("h-5 w-5 transition-transform duration-500", isActive ? "scale-110" : "opacity-40")} />
                          <span className="font-black text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
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

      <SidebarFooter className="border-t border-white/5 p-8 space-y-4 bg-black/10">
        <div className="px-5 py-4 bg-white/5 rounded-2xl border border-white/5 group-data-[collapsible=icon]:hidden text-right">
           <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Platform Identity</p>
           <p className="text-[11px] font-black text-white/80 leading-relaxed">بواسطة <span className="text-primary">حسين صلاح</span></p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="h-12 px-4 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full flex-row gap-4 rounded-2xl transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-black group-data-[collapsible=icon]:hidden text-sm">تسجيل الخروج الآمن</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
