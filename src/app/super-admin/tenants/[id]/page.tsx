
'use client';

import { use, useMemo } from "react";
import { 
  Building2, 
  User, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  History,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Database,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, collection, query, where, orderBy, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function TenantDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const db = useFirestore();
  const router = useRouter();

  // جلب بيانات المتجر
  const tenantRef = useMemo(() => doc(db, 'tenants', id), [db, id]);
  const { data: tenant, loading: tLoading } = useDoc<any>(tenantRef);

  // جلب إحصائيات المتجر
  const productsQuery = useMemo(() => query(collection(db, 'products'), where('tenantId', '==', tenant?.tenantId || id)), [db, tenant]);
  const ordersQuery = useMemo(() => query(collection(db, 'orders'), where('tenantId', '==', tenant?.tenantId || id)), [db, tenant]);
  const staffQuery = useMemo(() => query(collection(db, 'users'), where('tenantId', '==', tenant?.tenantId || id)), [db, tenant]);
  const logsQuery = useMemo(() => query(collection(db, 'auditLogs'), where('tenantId', '==', tenant?.tenantId || id), orderBy('timestamp', 'desc'), limit(10)), [db, tenant]);

  const { data: products } = useCollection(productsQuery);
  const { data: orders } = useCollection(ordersQuery);
  const { data: staff } = useCollection(staffQuery);
  const { data: logs } = useCollection(logsQuery);

  if (tLoading) return <div className="p-10 text-center"><Skeleton className="h-[600px] w-full rounded-[40px]" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-xl bg-white shadow-sm" onClick={() => router.back()}>
          <ChevronRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-slate-900">{tenant?.businessName}</h1>
          <p className="text-muted-foreground font-medium">مراجعة تقرير الأداء الشامل للمتجر والاشتراك.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
           <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                 <CardTitle className="text-xl font-black flex items-center gap-3">
                    <User className="h-6 w-6 text-primary" /> بيانات المالك
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center"><User className="h-5 w-5 opacity-40" /></div>
                       <div><p className="text-[10px] font-black text-muted-foreground uppercase">الاسم الكامل</p><p className="font-bold">{tenant?.ownerName}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center"><Phone className="h-5 w-5 opacity-40" /></div>
                       <div><p className="text-[10px] font-black text-muted-foreground uppercase">رقم الهاتف</p><p className="font-bold" dir="ltr">{tenant?.phone}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center"><MapPin className="h-5 w-5 opacity-40" /></div>
                       <div><p className="text-[10px] font-black text-muted-foreground uppercase">العنوان</p><p className="font-bold">{tenant?.address}</p></div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-slate-900 text-white">
              <CardHeader className="p-8 pb-4">
                 <CardTitle className="text-lg font-black flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-primary" /> حالة الاشتراك
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-8">
                 <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-slate-400">الباقة الحالية:</span>
                       <Badge className="bg-primary text-white font-black">{tenant?.subscriptionPlan || 'trial'}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-slate-400">تاريخ الانتهاء:</span>
                       <span className="text-sm font-black">{tenant?.trialEndDate ? new Date(tenant.trialEndDate).toLocaleDateString("ar-EG") : '---'}</span>
                    </div>
                 </div>
                 <Button className="w-full h-14 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90">تحديث الخطة أو التمديد</Button>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 rounded-[32px] bg-white border shadow-sm space-y-4">
                 <Package className="h-8 w-8 text-blue-600" />
                 <div><p className="text-[10px] font-black uppercase text-slate-400">المنتجات</p><p className="text-3xl font-black">{products.length}</p></div>
              </div>
              <div className="p-8 rounded-[32px] bg-white border shadow-sm space-y-4">
                 <ShoppingCart className="h-8 w-8 text-emerald-600" />
                 <div><p className="text-[10px] font-black uppercase text-slate-400">إجمالي المبيعات</p><p className="text-3xl font-black">{orders.length}</p></div>
              </div>
              <div className="p-8 rounded-[32px] bg-white border shadow-sm space-y-4">
                 <Users className="h-8 w-8 text-purple-600" />
                 <div><p className="text-[10px] font-black uppercase text-slate-400">الموظفين</p><p className="text-3xl font-black">{staff.length}</p></div>
              </div>
           </div>

           <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="p-8 border-b">
                 <CardTitle className="text-xl font-black flex items-center gap-3">
                    <History className="h-6 w-6 text-primary" /> آخر العمليات في المتجر
                 </CardTitle>
                 <CardDescription className="font-bold">سجل يوضح تحركات المتجر والعمليات الإدارية.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y">
                    {logs.length > 0 ? logs.map((log: any) => (
                      <div key={log.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                               {log.action?.[0]}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-800">{log.action}</p>
                               <p className="text-[10px] text-muted-foreground font-medium">{new Date(log.timestamp).toLocaleString("ar-EG")}</p>
                            </div>
                         </div>
                         <span className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase">{log.userName || 'System'}</span>
                      </div>
                    )) : (
                      <div className="p-20 text-center opacity-30 font-bold">لا يوجد سجل عمليات حالياً.</div>
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
