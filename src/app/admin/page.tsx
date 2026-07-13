
'use client';

import { StatsCard } from "@/components/admin/stats-card";
import { 
  BadgeDollarSign, 
  ShoppingCart, 
  Users, 
  Wrench, 
  ArrowUpRight, 
  Package, 
  MoreVertical,
  Loader2,
  PlusCircle,
  Settings,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const DATA = [
  { name: "سبت", sales: 0 },
  { name: "أحد", sales: 0 },
  { name: "اثنين", sales: 0 },
  { name: "ثلاثاء", sales: 0 },
  { name: "أربعاء", sales: 0 },
  { name: "خميس", sales: 0 },
  { name: "جمعة", sales: 0 },
];

export default function AdminDashboard() {
  const db = useFirestore();
  const { tenantId, profile } = useUser();
  
  const recentOrdersQuery = useMemo(() => 
    query(collection(db, 'orders'), where('tenantId', '==', tenantId), orderBy('createdAt', 'desc'), limit(5)), 
  [db, tenantId]);
  const { data: recentOrders, loading: ordersLoading } = useCollection(recentOrdersQuery);

  const lowStockQuery = useMemo(() => 
    query(collection(db, 'products'), where('tenantId', '==', tenantId), orderBy('stock', 'asc'), limit(4)), 
  [db, tenantId]);
  const { data: lowStockProducts, loading: stockLoading } = useCollection(lowStockQuery);

  const allOrdersQuery = useMemo(() => query(collection(db, 'orders'), where('tenantId', '==', tenantId)), [db, tenantId]);
  const { data: allOrders } = useCollection(allOrdersQuery);

  const allUsersQuery = useMemo(() => query(collection(db, 'users'), where('tenantId', '==', tenantId)), [db, tenantId]);
  const { data: allUsers } = useCollection(allUsersQuery);

  const totalSales = useMemo(() => {
    return allOrders.reduce((acc, order: any) => acc + (order.total || 0), 0);
  }, [allOrders]);

  const isNewStore = useMemo(() => {
    return allOrders.length === 0 && lowStockProducts.length === 0;
  }, [allOrders, lowStockProducts]);

  if (isNewStore && !ordersLoading && !stockLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-[40px] shadow-sm border space-y-6">
           <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-bounce">
              <Rocket className="h-12 w-12" />
           </div>
           <div className="space-y-2">
              <h1 className="text-4xl font-black">أهلاً بك في متجرك الجديد!</h1>
              <p className="text-muted-foreground font-medium text-lg max-w-lg mx-auto">
                لقد قمت بتأسيس متجرك بنجاح. اتبع الخطوات التالية للبدء في البيع واستخدام لوحة التحكم.
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl pt-8">
              <Link href="/admin/products" className="group">
                 <div className="p-8 rounded-[32px] bg-muted/30 border-2 border-transparent hover:border-primary/20 transition-all text-right space-y-4">
                    <PlusCircle className="h-10 w-10 text-primary" />
                    <h3 className="font-black text-xl">أضف منتجاتك</h3>
                    <p className="text-xs text-muted-foreground font-bold">ابدأ بإضافة الأصناف المتوفرة في مخزنك لتتمكن من بيعها.</p>
                 </div>
              </Link>
              <Link href="/admin/settings" className="group">
                 <div className="p-8 rounded-[32px] bg-muted/30 border-2 border-transparent hover:border-primary/20 transition-all text-right space-y-4">
                    <Settings className="h-10 w-10 text-blue-600" />
                    <h3 className="font-black text-xl">ضبط الإعدادات</h3>
                    <p className="text-xs text-muted-foreground font-bold">أضف رقم الواتساب، الشعار، وعنوان المحل لتظهر في فواتيرك.</p>
                 </div>
              </Link>
              <Link href="/admin/pos" className="group">
                 <div className="p-8 rounded-[32px] bg-primary text-white transition-all hover:scale-[1.02] shadow-xl shadow-primary/20 text-right space-y-4">
                    <BadgeDollarSign className="h-10 w-10" />
                    <h3 className="font-black text-xl">ابدأ البيع (POS)</h3>
                    <p className="text-xs opacity-80 font-bold">استخدم واجهة نقطة البيع لبيع المنتجات وإصدار الفواتير فوراً.</p>
                 </div>
              </Link>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground font-medium text-sm">مرحباً {profile?.displayName}، إليك ملخص أداء متجرك اليوم.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/admin/reports">
             <Button variant="outline" className="rounded-xl border-2 font-bold h-11 px-6">تصدير التقارير</Button>
           </Link>
           <Link href="/admin/pos">
             <Button className="rounded-xl font-bold h-11 px-8 shadow-lg shadow-primary/20">إضافة طلب POS</Button>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="إجمالي المبيعات" 
          value={`${totalSales.toLocaleString()} د.ع`} 
          icon={BadgeDollarSign} 
          trend={{ value: "مباشر", isUp: true }}
          color="green"
        />
        <StatsCard 
          title="الطلبات المعلقة" 
          value={allOrders.filter((o: any) => o.status === 'pending').length.toString()} 
          icon={ShoppingCart} 
          color="orange"
        />
        <StatsCard 
          title="العملاء" 
          value={allUsers.length.toString()} 
          icon={Users} 
          color="purple"
        />
        <StatsCard 
          title="المخزون الحرج" 
          value={lowStockProducts.filter((p: any) => p.stock < 5).length.toString()} 
          icon={Package} 
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 rounded-[32px] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
             <div className="space-y-1">
               <CardTitle className="text-xl font-black">نظرة عامة على المبيعات</CardTitle>
               <CardDescription className="font-medium">تحليل المبيعات الأسبوعي</CardDescription>
             </div>
             <Button variant="ghost" size="icon" className="rounded-xl"><MoreVertical className="h-5 w-5" /></Button>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-2xl bg-white dark:bg-card p-4 shadow-xl border border-border">
                          <p className="text-xs font-black text-muted-foreground uppercase mb-1">{payload[0].payload.name}</p>
                          <p className="text-lg font-black text-primary">{payload[0].value?.toLocaleString()} د.ع</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="sales" 
                  fill="hsl(var(--primary))" 
                  radius={[8, 8, 8, 8]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 rounded-[32px] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
             <div className="space-y-1">
               <CardTitle className="text-xl font-black">تنبيهات المخزون</CardTitle>
               <CardDescription className="font-medium">منتجات أوشكت على النفاد</CardDescription>
             </div>
             <Link href="/admin/inventory">
               <Button variant="link" className="text-primary font-bold">مشاهدة الكل</Button>
             </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {stockLoading ? (
               Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
            ) : lowStockProducts.length > 0 ? (
              lowStockProducts.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white dark:bg-card border flex items-center justify-center">
                         <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                         <p className="text-sm font-bold truncate max-w-[120px]">{p.name}</p>
                         <p className="text-[10px] text-muted-foreground font-bold">{p.storageLocation || 'مخزن رئيسي'}</p>
                      </div>
                   </div>
                   <div className="text-left">
                      <p className={cn("text-xs font-black", p.stock === 0 ? "text-destructive" : "text-orange-600")}>
                        {p.stock === 0 ? "نفذت" : `تبقي ${p.stock} قطعة`}
                      </p>
                      <Badge variant="outline" className={cn("text-[8px] h-4 rounded-full border-none px-2", p.stock === 0 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700")}>
                        {p.stock === 0 ? "خارج المخزون" : "منخفض"}
                      </Badge>
                   </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground text-xs py-10 font-bold">كافة المنتجات متوفرة بكثرة ✅</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
