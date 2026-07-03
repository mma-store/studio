
'use client';

import * as React from "react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  Bike, 
  Box, 
  ClipboardList, 
  Users, 
  Wrench, 
  UserSquare2, 
  BadgeDollarSign, 
  BarChart3, 
  Image as ImageIcon, 
  Tags, 
  Bell, 
  Settings,
  ChevronRight,
  LogOut,
  Monitor,
  ShieldCheck,
  History,
  Receipt,
  Wallet
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
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { toast } from "@/hooks/use-toast";

const ADMIN_MENU = [
  {
    label: "الرئيسية",
    items: [
      { title: "لوحة التحكم", icon: LayoutDashboard, href: "/admin" },
      { title: "نقطة البيع (POS)", icon: Monitor, href: "/admin/pos" },
      { title: "التقارير", icon: BarChart3, href: "/admin/reports" },
    ]
  },
  {
    label: "المالية والديون",
    items: [
      { title: "وصلات القبض", icon: Receipt, href: "/admin/finance/receipts" },
      { title: "ديون العملاء", icon: Wallet, href: "/admin/finance/debts" },
    ]
  },
  {
    label: "المتجر",
    items: [
      { title: "المنتجات", icon: ShoppingBag, href: "/admin/products" },
      { title: "الأقسام", icon: Layers, href: "/admin/categories" },
      { title: "أنواع الدراجات", icon: Bike, href: "/admin/motorcycle-types" },
      { title: "المخزون", icon: Box, href: "/admin/inventory" },
    ]
  },
  {
    label: "الورشة",
    items: [
      { title: "نظرة عامة", icon: LayoutDashboard, href: "/admin/workshop" },
      { title: "أوامر التصليح", icon: Wrench, href: "/admin/workshop/orders" },
      { title: "إضافة مهمة", icon: ClipboardList, href: "/admin/workshop/new" },
    ]
  },
  {
    label: "المبيعات والعملاء",
    items: [
      { title: "الطلبات", icon: ClipboardList, href: "/admin/orders" },
      { title: "العملاء", icon: Users, href: "/admin/customers" },
      { title: "الموظفين", icon: ShieldCheck, href: "/admin/employees" },
    ]
  },
  {
    label: "التسويق",
    items: [
      { title: "البنرات الترويجية", icon: ImageIcon, href: "/admin/banners" },
      { title: "العروض الخاصة", icon: Tags, href: "/admin/offers" },
    ]
  },
  {
    label: "النظام",
    items: [
      { title: "سجل العمليات", icon: History, href: "/admin/audit-log" },
      { title: "الإشعارات", icon: Bell, href: "/admin/notifications" },
      { title: "الإعدادات", icon: Settings, href: "/admin/settings" },
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "تم تسجيل الخروج" });
      router.push("/login");
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في تسجيل الخروج" });
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-l bg-card dark:bg-card">
      <SidebarHeader className="h-16 flex items-center justify-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
            <span className="text-xl font-black italic">M</span>
          </div>
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-black leading-none">مجمع محمد علاء</span>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">الإدارة العليا</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-4">
        {ADMIN_MENU.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 group-data-[collapsible=icon]:hidden mt-4 mb-2">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        className={cn(
                          "h-11 px-4 transition-all hover:bg-muted",
                          isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground"
                        )}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted-foreground")} />
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

      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="h-11 px-4 text-destructive hover:bg-destructive/10 hover:text-destructive w-full"
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
