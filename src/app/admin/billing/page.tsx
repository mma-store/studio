
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
  Loader2,
  Package,
  TrendingUp,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { useSubscription } from "@/hooks/use-subscription";
import { collection, query, where, orderBy, doc, getDocs } from "firebase/firestore";
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
  const { data: staff } = useCollection(query(collection(db, 'users'), where('tenantId', '==', tenantId), where('role', 'in', ['admin', 'owner', 'sales_employee', 'workshop_technician', 'warehouse_employee'])));

  // Dynamic Plans for upgrade
  const plansQuery = useMemo(() => query(collection(db, 'plans'), where('active', '==', true), orderBy('displayOrder', 'asc')), [db]);
  const { data: availablePlans } = useCollection(plansQuery);

  if (subscription.loading) return <div className="p-8"><Skeleton className="h-[400px] w-full rounded-[40px]" /></div>;

  const productUsage = (products.length / (subscription.limits.maxProducts || 1)) * 100;
  const staffUsage = (staff.length / (subscription.limits.maxEmployees || 1)) * 100;

  const WHATSAPP_NUMBER = "9647858833838";

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20" dir="rtl">
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
                <CardTitle className="text-2xl font-black">الباقة الحالية: {subscription.planName}</CardTitle>
                <CardDescription className="font-bold">
                  {subscription.isExpired ? 'الاشتراك منتهي الصلاحية' : `ينتهي الاشتراك خلال ${subscription.daysRemaining} يوم`}
                </CardDescription>
              </div>
              <Badge className={cn(
                "rounded-full px-4 py-1 font-black text-xs uppercase tracking-widest",
                subscription.status === 'active' ? "bg-green-100 text-green-700" : 
                subscription.status === 'trial' ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
              )}>
                {subscription.status === 'active' ? 'نشط' : subscription.status === 'trial' ? 'تجريبي' : 'منتهي'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-slate-400">استهلاك المنتجات</p>
                        <p className="text-2xl font-black">{products.length} <span className="text-xs text-muted-foreground">/ {subscription.limits.maxProducts || '∞'}</span></p>
                     </div>
                     <Package className="h-8 w-8 text-primary/20" />
                  </div>
                  <Progress value={productUsage} className="h-2.5 rounded-full" />
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-slate-400">عدد الموظفين</p>
                        <p className="text-2xl font-black">{staff.length} <span className="text-xs text-muted-foreground">/ {subscription.limits.maxEmployees || '∞'}</span></p>
                     </div>
                     <Users className="h-8 w-8 text-primary/20" />
                  </div>
                  <Progress value={staffUsage} className="h-2.5 rounded-full" />
               </div>
            </div>

            <div className="flex flex-wrap gap-3">
               {subscription.limits.features.map(f => (
                 <div key={f} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/5 text-primary text-xs font-black border border-primary/10">
                    <CheckCircle2 className="h-4 w-4" />
                    {f}
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[40px] border-none shadow-xl bg-slate-900 text-white p-10 relative overflow-hidden group">
           <div className="relative z-10 space-y-6">
              <div className="h-16 w-16 rounded-3xl bg-primary flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                 <CreditCard className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black italic">الدفع والاشتراك</h3>
                 <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    لتجديد اشتراكك أو ترقية الباقة، يرجى تحويل المبلغ عبر المحفظة الإلكترونية (زين كاش) ثم إرسال صورة الوصل للدعم الفني لتفعيل حسابك فوراً.
                 </p>
              </div>
              <div className="bg-white/5 p-5 rounded-3xl border border-white/10 space-y-2 text-center">
                 <p className="text-[10px] font-black uppercase opacity-40">رقم تحويل زين كاش</p>
                 <p className="text-2xl font-mono font-black text-primary tracking-widest">07858833838</p>
              </div>
              <Button className="w-full h-14 rounded-2xl font-black shadow-lg" asChild>
                 <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank">تأكيد الدفع عبر واتساب</a>
              </Button>
           </div>
           <ShieldCheck className="absolute -right-10 -bottom-10 h-40 w-40 opacity-5" />
        </Card>
      </div>

      {/* Upgrade Options */}
      <div className="space-y-8">
         <h2 className="text-2xl font-black flex items-center gap-3">
            <Zap className="h-6 w-6 text-primary" /> الخطط المتاحة للترقية
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availablePlans.map((plan: any) => (
              <Card key={plan.id} className={cn(
                "rounded-[40px] border-2 p-8 flex flex-col space-y-6 transition-all",
                plan.id === tenantId ? "border-primary bg-primary/5" : "border-slate-100 hover:border-primary/20"
              )}>
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <h3 className="font-black text-xl">{plan.name}</h3>
                       <p className="text-xs font-bold text-muted-foreground">{plan.description}</p>
                    </div>
                    {plan.highlighted && <Badge className="bg-primary text-white rounded-full text-[8px] font-black">RECOMMENDED</Badge>}
                 </div>
                 <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">{plan.monthlyPrice.toLocaleString()}</span>
                    <span className="text-xs font-bold opacity-60">د.ع / شهر</span>
                 </div>
                 <div className="space-y-3 flex-1">
                    {plan.features?.slice(0, 4).map((f: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold">
                         <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                         {f}
                      </div>
                    ))}
                 </div>
                 <Button className="w-full rounded-2xl h-12 font-black" variant={plan.id === tenantId ? "outline" : "default"} asChild>
                    <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('أريد الاشتراك في باقة: ' + plan.name)}`}>
                       {plan.id === tenantId ? 'باقتك الحالية' : 'اطلب هذه الباقة'}
                    </a>
                 </Button>
              </Card>
            ))}
         </div>
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
