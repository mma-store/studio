
'use client';

import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Wrench, 
  ArrowUpRight,
  Download,
  Calendar,
  Filter,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { StatsCard } from "@/components/admin/stats-card";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const db = useFirestore();
  
  // Memoizing queries to prevent infinite fetch loops
  const ordersQuery = useMemo(() => query(collection(db, 'orders')), [db]);
  const expensesQuery = useMemo(() => query(collection(db, 'expenses')), [db]);
  const repairsQuery = useMemo(() => query(collection(db, 'repairOrders')), [db]);
  const usersQuery = useMemo(() => query(collection(db, 'users')), [db]);

  const { data: orders, loading: ordersLoading } = useCollection(ordersQuery);
  const { data: expenses, loading: expensesLoading } = useCollection(expensesQuery);
  const { data: repairs, loading: repairsLoading } = useCollection(repairsQuery);
  const { data: users } = useCollection(usersQuery);

  // حساب الإحصائيات الحقيقية
  const stats = useMemo(() => {
    const totalSales = orders.reduce((acc, o: any) => acc + (o.total || 0), 0);
    const totalPaid = orders.reduce((acc, o: any) => acc + (o.paidAmount || 0), 0);
    const totalExpenses = expenses.reduce((acc, e: any) => acc + (e.amount || 0), 0);
    const totalDebts = users.reduce((acc, u: any) => acc + (u.currentBalance || 0), 0);
    
    const workshopIncome = repairs.reduce((acc, r: any) => acc + (r.laborCost || 0), 0);
    const estimatedProfit = (totalSales * 0.2) + workshopIncome - totalExpenses;

    return {
      totalSales,
      totalExpenses,
      totalDebts,
      ordersCount: orders.length,
      repairsCount: repairs.length,
      estimatedProfit
    };
  }, [orders, expenses, repairs, users]);

  // تحضير بيانات الرسم البياني من مبيعات الأسبوع الفعلي
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
        const dayIndex = date.getDay(); // 0 is Sunday
        salesByDay[dayIndex] += (o.total || 0);
        profitByDay[dayIndex] += (o.total || 0) * 0.2; // Estimated 20% profit margin
      }
    });

    return days.map((day, i) => ({
      name: day,
      sales: salesByDay[i],
      profit: profitByDay[i]
    }));
  }, [orders]);

  if (ordersLoading || expensesLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">التقارير والتحليلات الحقيقية</h1>
          <p className="text-muted-foreground font-medium text-sm">تحليل دقيق بناءً على البيانات المسجلة فعلياً في النظام.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl border-2 font-bold h-11 gap-2">
              <Calendar className="h-4 w-4" /> تصفية التاريخ
           </Button>
           <Button className="rounded-xl font-bold h-11 shadow-lg shadow-primary/20 gap-2 px-8">
             <Download className="h-5 w-5" /> تصدير التقرير المالي
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="إجمالي المبيعات" 
          value={`${stats.totalSales.toLocaleString()} د.ع`} 
          icon={DollarSign} 
          trend={{ value: "مباشر", isUp: true }}
          color="green"
        />
        <StatsCard 
          title="صافي الأرباح المقدر" 
          value={`${stats.estimatedProfit.toLocaleString()} د.ع`} 
          icon={TrendingUp} 
          trend={{ value: "بعد المصاريف", isUp: true }}
          color="blue"
        />
        <StatsCard 
          title="عدد الطلبات" 
          value={stats.ordersCount.toString()} 
          icon={ShoppingCart} 
          color="orange"
        />
        <StatsCard 
          title="إنتاجية الورشة" 
          value={`${stats.repairsCount} مهمة`} 
          icon={Wrench} 
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-[32px] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
          <CardHeader className="p-8 pb-0">
             <CardTitle className="text-xl font-black">أداء المبيعات الأسبوعي</CardTitle>
             <CardDescription className="font-medium">مقارنة بين إجمالي المبيعات وصافي الأرباح (آخر 7 أيام فعلياً).</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] p-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-2xl bg-white dark:bg-card p-4 shadow-2xl border border-border">
                          <p className="text-xs font-black text-muted-foreground uppercase mb-2">{payload[0].payload.name}</p>
                          <div className="space-y-1">
                             <p className="text-sm font-bold flex items-center justify-between gap-4">المبيعات: <span className="text-primary font-black">{payload[0].value?.toLocaleString()} د.ع</span></p>
                             <p className="text-sm font-bold flex items-center justify-between gap-4">الأرباح: <span className="text-green-600 font-black">{payload[1].value?.toLocaleString()} د.ع</span></p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={4} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
           <Card className="rounded-[32px] p-8 bg-red-600 text-white border-none shadow-xl relative overflow-hidden group">
              <div className="relative z-10 space-y-2">
                 <p className="text-xs font-black uppercase tracking-widest opacity-80">إجمالي الديون</p>
                 <h3 className="text-4xl font-black leading-tight">{stats.totalDebts.toLocaleString()} د.ع</h3>
                 <p className="text-sm opacity-90 font-medium">مبالغ مستحقة على الزبائن بالآجل.</p>
                 <Link href="/admin/finance/debts">
                    <Button className="mt-4 rounded-full bg-white text-red-600 font-black hover:bg-white/90">مشاهدة قائمة الديون</Button>
                 </Link>
              </div>
              <DollarSign className="absolute -right-6 -bottom-6 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform" />
           </Card>

           <Card className="rounded-[32px] p-8 bg-slate-900 text-white border-none shadow-xl relative overflow-hidden group">
              <div className="relative z-10 space-y-2">
                 <p className="text-xs font-black uppercase tracking-widest opacity-80">إجمالي المصاريف</p>
                 <h3 className="text-4xl font-black leading-tight">{stats.totalExpenses.toLocaleString()} د.ع</h3>
                 <p className="text-sm opacity-90 font-medium">إيجار، رواتب، ونثريات المجمع.</p>
                 <Link href="/admin/finance/expenses">
                    <Button className="mt-4 rounded-full bg-white text-slate-900 font-black hover:bg-white/90">عرض سجل المصاريف</Button>
                 </Link>
              </div>
              <TrendingDown className="absolute -right-6 -bottom-6 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform" />
           </Card>
        </div>
      </div>
    </div>
  );
}
