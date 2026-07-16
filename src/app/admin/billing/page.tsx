
'use client';

import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  History, 
  ArrowUpRight, 
  Zap, 
  ShieldCheck, 
  Download,
  Calendar,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useSubscription } from "@/hooks/use-subscription";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillingPage() {
  const { tenantId } = useUser();
  const db = useFirestore();
  const subscription = useSubscription(tenantId);
  
  const invoicesQuery = useMemo(() => query(
    collection(db, 'subscriptionInvoices'),
    where('tenantId', '==', tenantId),
    orderBy('issueDate', 'desc')
  ), [db, tenantId]);
  
  const { data: invoices, loading: invoicesLoading } = useCollection(invoicesQuery);
  const { data: products } = useCollection(query(collection(db, 'products'), where('tenantId', '==', tenantId)));
  const { data: staff } = useCollection(query(collection(db, 'users'), where('tenantId', '==', tenantId), where('role', '!=', 'retail_customer'), where('role', '!=', 'wholesale_customer')));

  if (subscription.loading) return <div className="p-8"><Skeleton className="h-[400px] w-full rounded-[40px]" /></div>;

  const productUsage = (products.length / (subscription.limits.maxProducts || 1)) * 100;
  const staffUsage = (staff.length / (subscription.limits.maxEmployees || 1)) * 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">الاشتراك والفوترة</h1>
        <p className="text-muted-foreground font-medium">إدارة باقة الاشتراك، استهلاك الموارد، وتاريخ المدفوعات.</p>
      </div>

      {/* Subscription Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className={cn(
          "lg:col-span-2 rounded-[40px] border-none shadow-sm overflow-hidden",
          subscription.isExpired ? "bg-red-50" : "bg-white"
        )}>
          <CardHeader className="p-8 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black">الباقة الحالية: {subscription.plan.toUpperCase()}</CardTitle>
                <CardDescription className="font-bold">
                  {subscription.isExpired ? 'الاشتراك منتهي الصلاحية' : `ينتهي الاشتراك خلال ${subscription.daysRemaining} يوم`}
                </CardDescription>
              </div>
              <Badge className={cn(
                "rounded-full px-4 py-1 font-black text-xs uppercase tracking-widest",
                subscription.status === 'active' ? "bg-green-100 text-green-700" : 
                subscription.status === 'trial' ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
              )}>
                {subscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <div className="flex justify-between text-xs font-black uppercase">
                     <span>استهلاك المنتجات</span>
                     <span>{products.length} / {subscription.limits.maxProducts || '∞'}</span>
                  </div>
                  <Progress value={productUsage} className="h-2 rounded-full" />
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between text-xs font-black uppercase">
                     <span>عدد الموظفين</span>
                     <span>{staff.length} / {subscription.limits.maxEmployees || '∞'}</span>
                  </div>
                  <Progress value={staffUsage} className="h-2 rounded-full" />
               </div>
            </div>

            <div className="flex flex-wrap gap-3">
               {subscription.limits.features.map(f => (
                 <div key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 text-primary text-[10px] font-black border border-primary/10">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {f.replace('_', ' ').toUpperCase()}
                 </div>
               ))}
            </div>

            <div className="pt-4 flex gap-4">
               <Button className="rounded-2xl h-14 px-10 font-black text-lg shadow-xl shadow-primary/20 gap-2 bg-primary">
                  <Zap className="h-5 w-5" /> ترقية الاشتراك
               </Button>
               <Button variant="outline" className="rounded-2xl h-14 px-8 font-black border-2" asChild>
                  <a href="https://wa.me/9647858833838" target="_blank">تواصل مع الدعم</a>
               </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[40px] border-none shadow-xl bg-slate-900 text-white p-10 relative overflow-hidden group">
           <div className="relative z-10 space-y-6">
              <div className="h-16 w-16 rounded-3xl bg-primary flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                 <CreditCard className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black">الدفع السريع</h3>
                 <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    يمكنك تجديد اشتراكك عبر تحويل المبلغ إلى المحفظة السحابية للمنصة وإرسال صورة الوصل للدعم الفني.
                 </p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                 <p className="text-[10px] font-black uppercase opacity-40">زين كاش / آسي حوالة</p>
                 <p className="text-lg font-mono font-black">07858833838</p>
              </div>
           </div>
           <ShieldCheck className="absolute -right-10 -bottom-10 h-40 w-40 opacity-5" />
        </Card>
      </div>

      {/* Invoice History */}
      <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
         <CardHeader className="p-8 border-b">
            <CardTitle className="text-xl font-black flex items-center gap-3">
               <History className="h-6 w-6 text-primary" /> سجل الفواتير والمدفوعات
            </CardTitle>
         </CardHeader>
         <CardContent className="p-0">
            <Table>
               <TableHeader>
                  <TableRow className="bg-muted/30">
                     <TableHead className="text-right py-6 px-8">رقم الفاتورة</TableHead>
                     <TableHead className="text-right">الباقة</TableHead>
                     <TableHead className="text-right">المبلغ</TableHead>
                     <TableHead className="text-right">التاريخ</TableHead>
                     <TableHead className="text-right">الحالة</TableHead>
                     <TableHead className="text-left px-8">إجراءات</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {invoicesLoading ? (
                    Array(3).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={6} className="p-6"><Skeleton className="h-10 w-full rounded-xl" /></TableCell></TableRow>)
                  ) : invoices.length > 0 ? (
                    invoices.map((inv: any) => (
                      <TableRow key={inv.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="px-8 font-black text-sm">{inv.invoiceNumber}</TableCell>
                        <TableCell className="font-bold text-xs uppercase">{inv.planName}</TableCell>
                        <TableCell className="font-black text-primary">{inv.amountIQD?.toLocaleString()} د.ع</TableCell>
                        <TableCell className="text-xs font-medium opacity-60">{new Date(inv.issueDate).toLocaleDateString("ar-EG")}</TableCell>
                        <TableCell>
                           <Badge className={cn(
                             "rounded-full px-3 py-0.5 font-black text-[9px] uppercase",
                             inv.status === 'paid' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                           )}>
                              {inv.status}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-left px-8">
                           <Button variant="ghost" size="icon" className="rounded-xl text-primary"><Download className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="p-20 text-center opacity-30 font-black">لا توجد فواتير سابقة.</TableCell>
                    </TableRow>
                  )}
               </TableBody>
            </Table>
         </CardContent>
      </Card>
    </div>
  );
}
