"use client";

import * as React from "react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  Box, 
  ClipboardList, 
  Users, 
  Wrench, 
  BarChart3, 
  Image as ImageIcon, 
  Settings,
  LogOut,
  Monitor,
  ShieldCheck,
  History,
  Receipt,
  Wallet,
  Truck,
  ArrowLeftRight,
  Banknote,
  Coins,
  Database
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

const ADMIN_MENU = [
  {
    label: "الرئيسية",
    items: [
      { title: "لوحة التحكم", icon: LayoutDashboard, href: "/admin" },
      { title: "نقطة البيع (POS)", icon: Monitor, href: "/admin/pos" },
      { title: "التقارير المالية", icon: BarChart3, href: "/admin/reports" },
    ]
  },
  {
    label: "المالية والحسابات",
    items: [
      { title: "وصلات القبض", icon: Receipt, href: "/admin/finance/receipts" },
      { title: "سندات الصرف", icon: Banknote, href: "/admin/finance/payments" },
      { title: "المصاريف العامة", icon: Coins, href: "/admin/finance/expenses" },
      { title: "ديون العملاء", icon: Wallet, href: "/admin/finance/debts" },
      { title: "الصندوق اليومي", icon: History, href: "/admin/finance/cash-register" },
    ]
  },
  {
    label: "المشتريات والمخزن",
    items: [
      { title: "المنتجات", icon: ShoppingBag, href: "/admin/products" },
      { title: "الأقسام", icon: Layers, href: "/admin/categories" },
      { title: "فواتير الشراء", icon: Truck, href: "/admin/purchases" },
      { title: "الموردين", icon: Users, href: "/admin/suppliers" },
      { title: "المخزون", icon: Box, href: "/admin/inventory" },
      { title: "المرتجعات", icon: ArrowLeftRight, href: "/admin/returns" },
    ]
  },
  {
    label: "الورشة",
    items: [
      { title: "نظرة عامة", icon: LayoutDashboard, href: "/admin/workshop" },
      { title: "أوامر التصليح", icon: Wrench, href: "/admin/workshop/orders" },
    ]
  },
  {
    label: "المبيعات والعملاء",
    items: [
      { title: "طلبات المتجر", icon: ClipboardList, href: "/admin/orders" },
      { title: "العملاء", icon: Users, href: "/admin/customers" },
      { title: "الموظفين", icon: ShieldCheck, href: "/admin/employees" },
    ]
  },
  {
    label: "النظام",
    items: [
      { title: "البنرات والعروض", icon: ImageIcon, href: "/admin/banners" },
      { title: "سجل العمليات", icon: History, href: "/admin/audit-log" },
      { title: "النسخ الاحتياطي", icon: Database, href: "/admin/settings/backup" },
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
      router.push("/login");
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في تسجيل الخروج" });
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-l bg-card">
      <SidebarHeader className="h-24 flex items-center justify-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="relative h-16 w-36 shrink-0">
            <Image 
              src={LOGO_URL} 
              alt="MMA" 
              fill 
              className="object-contain"
            />
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
