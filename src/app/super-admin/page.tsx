
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
  CheckCircle2,
  XCircle,
  DollarSign
} from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, limit, orderBy } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Area,
  AreaChart
} from "recharts";

export default function SuperAdminDashboard() {
  const db = useFirestore();

  // Platform-wide queries
  const tenantsQuery = useMemo(() => query(collection(db, 'tenants'), orderBy('createdAt', 'desc')), [db]);
  const usersQuery = useMemo(() => query(collection(db, 'users')), [db]);
  const ordersQuery = useMemo(() => query(collection(db, 'orders'), limit(1000)), [db]);

  const { data: tenants, loading: tLoading } = useCollection(tenantsQuery);
  const { data: users, loading: uLoading } = useCollection(usersQuery);
  const { data: orders } = useCollection(ordersQuery);

  const stats = useMemo(() => ({
    totalTenants: tenants.length,
    activeTenants: tenants.filter((t: any) => t.status === 'active').length,
    trialTenants: tenants.filter((t: any) => t.status === 'trial').length,
    expiredTenants: tenants.filter((t: any) => t.status === 'expired').length,
    totalUsers: users.length,
    totalOrders: orders.length,
    platformRevenue: orders.reduce((acc, o: any) => acc + (o.total || 0), 0)
  }), [tenants, users, orders]);

  const recentStores = tenants.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">نظرة عامة على المنصة</h1>
        <p className="text-muted-foreground font-medium">مراقبة أداء المتاجر والنمو الإجمالي لنظام SaaS.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="إجمالي المتاجر" 
          value={stats.totalTenants.toString()} 
          icon={Store} 
          color="blue"
        />
        <StatsCard 
          title="المتاجر النشطة" 
          value={stats.activeTenants.toString()} 
          icon={ShieldCheck} 
          color="green"
        />
        <StatsCard 
          title="فترة تجريبية" 
          value={stats.trialTenants.toString()} 
          icon={Clock} 
          color="orange"
        />
        <StatsCard 
          title="حجم التداول الكلي" 
          value={`${stats.platformRevenue.toLocaleString()} د.ع`} 
          icon={TrendingUp} 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[32px] border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="p-8 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black">أحدث المتاجر المنضمة</CardTitle>
                <CardDescription className="font-bold">متابعة الاشتراكات الجديدة والنمو</CardDescription>
              </div>
              <Link href="/super-admin/tenants">
                 <Button variant="outline" className="rounded-xl font-bold">إدارة كافة المتاجر</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y">
                {tLoading ? (
                  Array(5).fill(0).map((_, i) => <div key={i} className="p-6"><Skeleton className="h-12 w-full rounded-2xl" /></div>)
                ) : recentStores.length > 0 ? (
                  recentStores.map((tenant: any) => (
                    <div key={tenant.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary">
                             {tenant.businessName?.[0]}
                          </div>
                          <div>
                             <p className="font-black text-slate-800">{tenant.businessName}</p>
                             <p className="text-[10px] text-muted-foreground font-bold">@{tenant.slug} • {tenant.ownerName}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="text-left hidden md:block">
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">الباقة</p>
                             <Badge variant="outline" className="rounded-full border-primary/20 text-primary font-bold text-[10px]">{tenant.subscriptionPlan || 'trial'}</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                             <Badge className={cn(
                               "rounded-full px-3 py-1 font-black text-[10px]",
                               tenant.status === 'active' ? 'bg-green-100 text-green-700' : 
                               tenant.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                               'bg-red-100 text-red-700'
                             )}>
                                {tenant.status === 'active' ? 'نشط' : tenant.status === 'trial' ? 'تجريبي' : 'منتهي'}
                             </Badge>
                             <Link href={`/super-admin/tenants/${tenant.id}`}>
                                <Button variant="ghost" size="icon" className="rounded-xl"><TrendingUp className="h-4 w-4" /></Button>
                             </Link>
                          </div>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center opacity-30 font-bold">لا يوجد متاجر مسجلة حالياً.</div>
                )}
             </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[32px] border-none shadow-sm bg-slate-900 text-white overflow-hidden relative">
             <CardHeader className="p-8 pb-4">
                <CardTitle className="text-lg font-black flex items-center gap-3">
                   <Activity className="h-5 w-5 text-primary" /> توزيع الحالات
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 pt-0 space-y-6">
                <div className="space-y-4">
                   {[
                     { label: "نشط", count: stats.activeTenants, color: "bg-green-500" },
                     { label: "تجربة", count: stats.trialTenants, color: "bg-blue-500" },
                     { label: "منتهي", count: stats.expiredTenants, color: "bg-red-500" }
                   ].map((item, i) => (
                     <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                           <span className="opacity-60">{item.label}</span>
                           <span>{item.count} متجر</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                           <div 
                             className={cn("h-full rounded-full", item.color)} 
                             style={{ width: `${(item.count / stats.totalTenants) * 100 || 0}%` }}
                           />
                        </div>
                     </div>
                   ))}
                </div>

                <div className="pt-6 border-t border-white/10">
                   <div className="flex items-center gap-3 text-orange-400">
                      <AlertTriangle className="h-5 w-5" />
                      <div>
                         <p className="text-xs font-black">تنبيهات المنصة</p>
                         <p className="text-[10px] font-bold opacity-60">يوجد {stats.expiredTenants} متاجر بحاجة للمتابعة.</p>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-sm bg-white overflow-hidden">
             <CardHeader className="p-6 border-b">
                <CardTitle className="text-sm font-black flex items-center gap-2">
                   <Users className="h-4 w-4 text-primary" /> نشاط المستخدمين
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-muted-foreground">إجمالي الحسابات:</span>
                   <span className="font-black text-lg">{stats.totalUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-muted-foreground">متوسط الطلبات/متجر:</span>
                   <span className="font-black text-lg">{(stats.totalOrders / (stats.totalTenants || 1)).toFixed(1)}</span>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Button({ className, variant, size, children, ...props }: any) {
  const variants: any = {
    default: "bg-primary text-white hover:bg-primary/90",
    outline: "border-2 border-slate-200 bg-white hover:bg-slate-50",
    ghost: "hover:bg-slate-100",
  };
  const sizes: any = {
    default: "h-11 px-6 py-2",
    sm: "h-9 px-4",
    icon: "h-10 w-10",
  };
  return (
    <button className={cn("inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50", variants[variant || 'default'], sizes[size || 'default'], className)} {...props}>
      {children}
    </button>
  );
}
