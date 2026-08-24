
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
  Database,
  CreditCard,
  Puzzle,
  Terminal,
  Key,
  Webhook,
  FileText,
  Lock,
  ScrollText,
  Palette
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
    label: "متجري الإلكتروني",
    items: [
      { title: "تصميم المتجر", icon: Palette, href: "/admin/settings/design" },
      { title: "البنرات والعروض", icon: ImageIcon, href: "/admin/banners" },
      { title: "الإشعارات", icon: Bell, href: "/admin/notifications" },
    ]
  },
  {
    label: "النظام",
    items: [
      { title: "الأمان والحماية", icon: Lock, href: "/admin/settings/security" },
      { title: "الربط والتكامل", icon: Puzzle, href: "/admin/integrations" },
      { title: "الاشتراك والفوترة", icon: CreditCard, href: "/admin/billing" },
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
    <Sidebar collapsible="icon" className="border-l bg-primary text-white" side="right">
      <SidebarHeader className="h-28 flex flex-col items-center justify-center border-b border-white/10 px-6 bg-black/20">
        <Link href="/admin" className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
             <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-lg">
                <ScrollText className="h-6 w-6" />
             </div>
             <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-xl font-black tracking-tighter text-white">دوبسار</span>
                <span className="text-[8px] font-black text-secondary tracking-[0.3em] uppercase opacity-80 leading-none">DUBSAR</span>
             </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-6 px-3 custom-scrollbar overflow-y-auto">
        {ADMIN_MENU.map((group) => (
          <SidebarGroup key={group.label} className="mb-4">
            <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-widest text-white/40 group-data-[collapsible=icon]:hidden mb-3 text-right">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive}
                        className={cn(
                          "h-11 px-4 transition-all duration-300 rounded-xl hover:bg-white/5 text-right flex-row justify-start gap-4",
                          isActive ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "text-white/60"
                        )}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <item.icon className={cn("h-5 w-5 transition-transform duration-300", isActive ? "scale-110" : "opacity-50")} />
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

      <SidebarFooter className="border-t border-white/10 p-6 space-y-4 bg-black/20">
        <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/10 group-data-[collapsible=icon]:hidden text-right">
           <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Heritage Powered</p>
           <p className="text-[11px] font-black text-white/80 leading-tight">بوابة دوبسار</p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="h-11 px-4 text-red-300 hover:bg-red-500/10 hover:text-red-200 w-full flex-row gap-4 rounded-xl"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-black group-data-[collapsible=icon]:hidden text-sm">خروج آمن</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function Bell(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
