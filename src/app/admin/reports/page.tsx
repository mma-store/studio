
'use client';

import { 
  DollarSign, 
  ShoppingCart, 
  Wrench, 
  TrendingUp,
  Download,
  Calendar,
  Loader2,
  TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Area,
  AreaChart
} from "recharts";
import { StatsCard } from "@/components/admin/stats-card";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useMemo } from "react";
import Link from "next/link";

export default function ReportsPage() {
  const db = useFirestore();
  const { tenantId } = useUser();
  
  const ordersQuery = useMemo(() => {
    if (!tenantId) return null;
    return query(collection(db, 'orders'), where('tenantId', '==', tenantId));
  }, [db, tenantId]);

  const expensesQuery = useMemo(() => {
    if (!tenantId) return null;
    return query(collection(db, 'expenses'), where('tenantId', '==', tenantId));
  }, [db, tenantId]);

  const repairsQuery = useMemo(() => {
    if (!tenantId) return null;
    return query(collection(db, 'repairOrders'), where('tenantId', '==', tenantId));
  }, [db, tenantId]);

  const usersQuery = useMemo(() => {
    if (!tenantId) return null;
    return query(collection(db, 'users'), where('tenantId', '==', tenantId));
  }, [db, tenantId]);

  const { data: orders, loading: ordersLoading } = useCollection(ordersQuery);
  const { data: expenses, loading: expensesLoading } = useCollection(expensesQuery);
  const { data: repairs, loading: repairsLoading } = useCollection(repairsQuery);
  const { data: users } = useCollection(usersQuery);

  const stats = useMemo(() => {
    const totalSales = orders.reduce((acc, o: any) => acc + (o.total || 0), 0);
    const totalExpenses = expenses.reduce((acc, e: any) => acc + (e.amount || 0), 0);
    const totalDebts = users.reduce((acc, u: any) => acc + (u.currentBalance || 0), 0);
    const workshopIncome = repairs.reduce((acc, r: any) => acc + (r.laborCost || 0), 0);
    const estimatedProfit = (totalSales * 0.2) + workshopIncome - totalExpenses;

    return { totalSales, totalExpenses, totalDebts, ordersCount: orders.length, repairsCount: repairs.length, estimatedProfit };
  }, [orders, expenses, repairs, users]);

  const chartData = useMemo(() => {
    const days = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    const salesByDay = new Array(7).fill(0);
    const profitByDay = new Array(7).fill(0);
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    orders.forEach((o: any) => {
      const date = new Date(o.createdAt);
      if (date >= oneWeekAgo) {
        const dayIndex = date.getDay();
        salesByDay[dayIndex] += (o.total || 0);
        profitByDay[dayIndex] += (o.total || 0) * 0.2;
      }
    });

    return days.map((day, i) => ({ name: day, sales: salesByDay[i], profit: profitByDay[i] }));
  }, [orders]);

  if (!tenantId || ordersLoading || expensesLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">التقارير والتحليلات</h1>
          <p className="text-muted-foreground font-medium text-sm">تحليل دقيق لأداء متجرك السحابي.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl border-2 font-bold h-11 gap-2 px-8">
             <Download className="h-5 w-5" /> تصدير التقرير
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="إجمالي المبيعات" value={`${stats.totalSales.toLocaleString()} د.ع`} icon={DollarSign} color="green" />
        <StatsCard title="صافي الأرباح" value={`${stats.estimatedProfit.toLocaleString()} د.ع`} icon={TrendingUp} color="blue" />
        <StatsCard title="عدد الطلبات" value={stats.ordersCount.toString()} icon={ShoppingCart} color="orange" />
        <StatsCard title="مهام الورشة" value={`${stats.repairsCount}`} icon={Wrench} color="purple" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-[32px] border-none shadow-sm bg-white">
          <CardHeader className="p-8 pb-0">
             <CardTitle className="text-xl font-black">أداء المبيعات الأسبوعي</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] p-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} dy={10} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={0.1} fill="hsl(var(--primary))" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={4} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
           <Card className="rounded-[32px] p-8 bg-red-600 text-white border-none shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                 <p className="text-xs font-black uppercase opacity-80">إجمالي الديون</p>
                 <h3 className="text-4xl font-black">{stats.totalDebts.toLocaleString()} د.ع</h3>
                 <Link href="/admin/finance/debts"><Button className="mt-4 rounded-full bg-white text-red-600 font-black">قائمة الديون</Button></Link>
              </div>
              <DollarSign className="absolute -right-6 -bottom-6 h-32 w-32 opacity-10" />
           </Card>

           <Card className="rounded-[32px] p-8 bg-slate-900 text-white border-none shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                 <p className="text-xs font-black uppercase opacity-80">إجمالي المصاريف</p>
                 <h3 className="text-4xl font-black">{stats.totalExpenses.toLocaleString()} د.ع</h3>
                 <Link href="/admin/finance/expenses"><Button className="mt-4 rounded-full bg-white text-slate-900 font-black">سجل المصاريف</Button></Link>
              </div>
              <TrendingDown className="absolute -right-6 -bottom-6 h-32 w-32 opacity-10" />
           </Card>
        </div>
      </div>
    </div>
  );
}
