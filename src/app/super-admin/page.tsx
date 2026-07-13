
'use client';

import { 
  Store, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Activity,
  Globe,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function SuperAdminDashboard() {
  const db = useFirestore();

  // Platform-wide queries (No tenant filtering)
  const tenantsQuery = useMemo(() => query(collection(db, 'tenants')), [db]);
  const usersQuery = useMemo(() => query(collection(db, 'users')), [db]);
  const productsQuery = useMemo(() => query(collection(db, 'products'), limit(1000)), [db]);
  const ordersQuery = useMemo(() => query(collection(db, 'orders'), limit(1000)), [db]);

  const { data: tenants, loading: tLoading } = useCollection(tenantsQuery);
  const { data: users, loading: uLoading } = useCollection(usersQuery);
  const { data: products } = useCollection(productsQuery);
  const { data: orders } = useCollection(ordersQuery);

  const stats = useMemo(() => ({
    totalTenants: tenants.length,
    activeTenants: tenants.filter((t: any) => t.status === 'active').length,
    totalUsers: users.length,
    totalProducts: products.length,
    totalOrders: orders.length,
    platformRevenue: orders.reduce((acc, o: any) => acc + (o.total || 0), 0)
  }), [tenants, users, products, orders]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">إدارة المنصة (Super Admin)</h1>
        <p className="text-muted-foreground font-medium">نظرة شاملة على أداء كافة المتاجر والمشتركين.</p>
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
          title="إجمالي المنتجات" 
          value={stats.totalProducts.toString()} 
          icon={Package} 
          color="orange"
        />
        <StatsCard 
          title="حجم مبيعات المنصة" 
          value={`${stats.platformRevenue.toLocaleString()} د.ع`} 
          icon={TrendingUp} 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-[32px] border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b p-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black">أحدث المتاجر المنضمة</CardTitle>
                <CardDescription className="font-bold">متابعة الاشتراكات الجديدة</CardDescription>
              </div>
              <Link href="/super-admin/tenants">
                 <Button variant="outline" className="rounded-xl font-bold">عرض الكل</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y">
                {tLoading ? (
                  Array(5).fill(0).map((_, i) => <div key={i} className="p-6"><Skeleton className="h-10 w-full" /></div>)
                ) : tenants.slice(0, 5).map((tenant: any) => (
                  <div key={tenant.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400">
                           {tenant.businessName?.[0]}
                        </div>
                        <div>
                           <p className="font-black text-slate-800">{tenant.businessName}</p>
                           <p className="text-[10px] text-muted-foreground font-bold">@{tenant.slug}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <Badge className={tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                           {tenant.status === 'active' ? 'نشط' : 'معطل'}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground">{new Date(tenant.createdAt).toLocaleDateString("ar-EG")}</span>
                     </div>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border-none shadow-sm bg-slate-900 text-white overflow-hidden">
           <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-3"><Activity className="h-6 w-6 text-primary" /> حالة النظام</CardTitle>
           </CardHeader>
           <CardContent className="p-8 pt-0 space-y-6">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold opacity-60">قواعد البيانات</span>
                    <Badge className="bg-emerald-500 text-white border-none">مستقر</Badge>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold opacity-60">نظام الملفات</span>
                    <Badge className="bg-emerald-500 text-white border-none">متصل</Badge>
                 </div>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase opacity-40">تنبيهات المنصة</p>
                 <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p className="text-[10px] font-bold">لا يوجد متاجر متأخرة عن الدفع حالياً.</p>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
