
'use client';

import { 
  Store, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Activity,
  ShieldCheck,
  AlertTriangle,
  Clock,
  DollarSign,
  ArrowUpRight,
  MousePointer2,
  Calendar,
  Cpu
} from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, limit, orderBy, where } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { cn } from "@/lib/utils";

export default function SuperAdminDashboard() {
  const db = useFirestore();

  // Real-time Queries for Stats
  const { data: tenants, loading: tLoading } = useCollection(query(collection(db, 'tenants')));
  const { data: users, loading: uLoading } = useCollection(query(collection(db, 'users')));
  const { data: orders, loading: oLoading } = useCollection(query(collection(db, 'orders')));
  const { data: products, loading: pLoading } = useCollection(query(collection(db, 'products')));

  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    return {
      totalTenants: tenants.length,
      activeTenants: tenants.filter((t: any) => t.status === 'active').length,
      trialTenants: tenants.filter((t: any) => t.status === 'trial').length,
      suspendedTenants: tenants.filter((t: any) => t.status === 'suspended').length,
      expiredTenants: tenants.filter((t: any) => t.status === 'expired' || (t.trialEndDate && t.trialEndDate < Date.now())).length,
      totalUsers: users.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((acc, o: any) => acc + (o.total || 0), 0),
      newStoresThisMonth: tenants.filter((t: any) => t.createdAt >= startOfMonth).length
    };
  }, [tenants, users, orders, products]);

  const recentStores = useMemo(() => 
    [...tenants].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5),
  [tenants]);

  if (tLoading || uLoading || oLoading || pLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
           {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-[32px]" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-[40px]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">نظام إدارة المنصة</h1>
        <p className="text-muted-foreground font-medium">مرحباً بك في مركز التحكم السحابي. راقب نمو وأداء كافة المتاجر المشتركة.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="إجمالي المتاجر" 
          value={stats.totalTenants.toString()} 
          icon={Store} 
          color="primary"
          trend={{ value: `${stats.newStoresThisMonth} هذا الشهر`, isUp: true }}
        />
        <StatsCard 
          title="الحسابات النشطة" 
          value={stats.activeTenants.toString()} 
          icon={ShieldCheck} 
          color="green"
        />
        <StatsCard 
          title="إجمالي المستخدمين" 
          value={stats.totalUsers.toString()} 
          icon={Users} 
          color="blue"
        />
        <StatsCard 
          title="حجم التداول" 
          value={`${stats.totalRevenue.toLocaleString()} د.ع`} 
          icon={TrendingUp} 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        <div className="lg:col-span-4 space-y-8">
           <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="p-8 border-b flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-xl font-black">أحدث المتاجر المنضمة</CardTitle>
                    <CardDescription className="font-bold">متابعة الاشتراكات الجديدة والشركاء الجدد.</CardDescription>
                 </div>
                 <Link href="/super-admin/tenants">
                    <Button variant="outline" className="rounded-xl font-bold border-2">عرض الكل</Button>
                 </Link>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y">
                    {recentStores.map((tenant: any) => (
                      <div key={tenant.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all group">
                         <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary group-hover:scale-110 transition-transform">
                               {tenant.businessName?.[0]}
                            </div>
                            <div>
                               <p className="font-black text-slate-800">{tenant.businessName}</p>
                               <p className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">ID: {tenant.tenantId}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            <div className="text-left hidden md:block">
                               <Badge variant="outline" className="rounded-full border-primary/20 text-primary font-black text-[9px] px-3">{tenant.subscriptionPlan || 'trial'}</Badge>
                            </div>
                            <Badge className={cn(
                              "rounded-full px-3 py-1 font-black text-[10px]",
                              tenant.status === 'active' ? 'bg-green-100 text-green-700' : 
                              tenant.status === 'trial' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            )}>
                               {tenant.status === 'active' ? 'نشط' : tenant.status === 'trial' ? 'تجريبي' : tenant.status === 'suspended' ? 'معلق' : 'منتهي'}
                            </Badge>
                            <Link href={`/super-admin/tenants/${tenant.id}`}>
                               <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary"><ArrowUpRight className="h-4 w-4" /></Button>
                            </Link>
                         </div>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <Card className="rounded-[40px] border-none shadow-sm bg-slate-900 text-white p-10 overflow-hidden relative">
              <div className="relative z-10 space-y-6">
                 <div className="h-16 w-16 bg-primary rounded-3xl flex items-center justify-center shadow-2xl">
                    <Cpu className="h-8 w-8 text-white" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-3xl font-black italic">Platform Performance</h3>
                    <p className="text-slate-400 font-medium leading-relaxed max-w-md">
                       إجمالي الموارد المستخدمة عبر كافة المتاجر المشتركة في النظام السحابي.
                    </p>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                       <p className="text-[10px] font-black uppercase opacity-40 mb-1">المنتجات</p>
                       <p className="text-xl font-black">{stats.totalProducts.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                       <p className="text-[10px] font-black uppercase opacity-40 mb-1">الطلبات</p>
                       <p className="text-xl font-black">{stats.totalOrders.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                       <p className="text-[10px] font-black uppercase opacity-40 mb-1">المستخدمين</p>
                       <p className="text-xl font-black">{stats.totalUsers.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                       <p className="text-[10px] font-black uppercase opacity-40 mb-1">الاستقرار</p>
                       <p className="text-xl font-black text-green-400">99.9%</p>
                    </div>
                 </div>
              </div>
              <MousePointer2 className="absolute -right-10 -bottom-10 h-64 w-64 opacity-5 rotate-12" />
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-8">
           <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="p-8 pb-4">
                 <CardTitle className="text-lg font-black flex items-center gap-3">
                    <Activity className="h-5 w-5 text-primary" /> حالة المتاجر
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                 <div className="space-y-6">
                    {[
                      { label: "متاجر نشطة", count: stats.activeTenants, color: "bg-green-500" },
                      { label: "في الفترة التجريبية", count: stats.trialTenants, color: "bg-blue-500" },
                      { label: "معلقة إدارياً", count: stats.suspendedTenants, color: "bg-orange-500" },
                      { label: "اشتراكات منتهية", count: stats.expiredTenants, color: "bg-red-500" }
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                         <div className="flex justify-between text-xs font-black">
                            <span className="text-slate-500">{item.label}</span>
                            <span className="text-slate-900">{item.count} متجر</span>
                         </div>
                         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full transition-all duration-1000", item.color)}
                              style={{ width: `${(item.count / (stats.totalTenants || 1)) * 100}%` }}
                            />
                         </div>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="p-8">
                 <CardTitle className="text-lg font-black flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" /> اشتراكات تنتهي قريباً
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-4">
                 {tenants.filter((t: any) => t.trialEndDate && t.trialEndDate > Date.now() && (t.trialEndDate - Date.now()) < 5 * 24 * 60 * 60 * 1000).slice(0, 3).map((t: any) => (
                   <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-100">
                      <div className="text-right">
                         <p className="text-xs font-black text-slate-800">{t.businessName}</p>
                         <p className="text-[10px] font-bold text-orange-600">ينتهي خلال {Math.ceil((t.trialEndDate - Date.now()) / (24 * 60 * 60 * 1000))} أيام</p>
                      </div>
                      <Link href={`/super-admin/tenants/${t.id}`}>
                        <Button size="sm" variant="ghost" className="h-7 text-[10px] font-black">إدارة</Button>
                      </Link>
                   </div>
                 ))}
                 {stats.expiredTenants > 0 && (
                   <div className="p-4 rounded-2xl border-2 border-dashed border-red-200 bg-red-50/30 flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <p className="text-[10px] font-bold text-red-700 leading-tight">يوجد {stats.expiredTenants} متجر منتهي الصلاحية بحاجة للمتابعة.</p>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
