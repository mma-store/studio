
'use client';

import { use, useMemo, useState } from "react";
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
  Users,
  Settings2,
  Trash2,
  ShieldAlert,
  Loader2,
  Zap,
  LayoutDashboard,
  Clock,
  ArrowRightLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, collection, query, where, orderBy, limit, updateDoc, deleteDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function TenantDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const db = useFirestore();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Tenant Base Data
  const tenantRef = useMemo(() => doc(db, 'tenants', id), [db, id]);
  const { data: tenant, loading: tLoading } = useDoc<any>(tenantRef);

  // Store-specific metrics (Real-time counts)
  const { data: products } = useCollection(query(collection(db, 'products'), where('tenantId', '==', id)));
  const { data: orders } = useCollection(query(collection(db, 'orders'), where('tenantId', '==', id)));
  const { data: staff } = useCollection(query(collection(db, 'users'), where('tenantId', '==', id)));
  const { data: logs } = useCollection(query(collection(db, 'auditLogs'), where('tenantId', '==', id), orderBy('timestamp', 'desc'), limit(15)));

  const revenue = useMemo(() => orders.reduce((acc, o: any) => acc + (o.total || 0), 0), [orders]);

  const updateStatus = async (status: string) => {
    setIsSaving(true);
    try {
      await updateDoc(tenantRef, { status });
      toast({ title: "تم تحديث الحالة" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث" });
    } finally {
      setIsSaving(false);
    }
  };

  const updatePlan = async (subscriptionPlan: string) => {
    setIsSaving(true);
    try {
      await updateDoc(tenantRef, { subscriptionPlan });
      toast({ title: "تم تغيير الباقة" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التغيير" });
    } finally {
      setIsSaving(false);
    }
  };

  if (tLoading) return <div className="p-10 text-center"><Skeleton className="h-[600px] w-full rounded-[40px]" /></div>;
  if (!tenant) return <div className="p-20 text-center font-black">المتجر غير موجود ⚠️</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-xl bg-white shadow-sm" onClick={() => router.back()}>
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-3xl font-black text-slate-900">{tenant.businessName}</h1>
               <Badge className={cn(
                 "rounded-full px-3 py-1 font-black text-[10px]",
                 tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
               )}>{tenant.status}</Badge>
            </div>
            <p className="text-muted-foreground font-medium">معرف المتجر السحابي: {tenant.tenantId}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl border-2 font-bold h-11" onClick={() => router.push(`/store/${tenant.slug}`)} target="_blank">
             <ExternalLink className="h-4 w-4 ml-2" /> معاينة المتجر
           </Button>
           <Button variant="destructive" className="rounded-xl font-bold h-11" onClick={() => { if(confirm('هل تريد حذف المتجر بالكامل؟')) deleteDoc(tenantRef).then(()=>router.replace('/super-admin/tenants')) }}>
             <Trash2 className="h-4 w-4" />
           </Button>
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
                       <div><p className="text-[10px] font-black text-muted-foreground uppercase">الاسم الكامل</p><p className="font-bold">{tenant.ownerName}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center"><Phone className="h-5 w-5 opacity-40" /></div>
                       <div><p className="text-[10px] font-black text-muted-foreground uppercase">رقم الهاتف</p><p className="font-bold" dir="ltr">{tenant.phone}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center"><MapPin className="h-5 w-5 opacity-40" /></div>
                       <div><p className="text-[10px] font-black text-muted-foreground uppercase">العنوان</p><p className="font-bold">{tenant.address}</p></div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="p-8 pb-4 border-b">
                 <CardTitle className="text-lg font-black flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-primary" /> حالة الاشتراك
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase opacity-40">الباقة الحالية</Label>
                       <Select defaultValue={tenant.subscriptionPlan || 'trial'} onValueChange={updatePlan}>
                          <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-none font-bold">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                             <SelectItem value="trial">Trial (14 Days)</SelectItem>
                             <SelectItem value="starter">Starter Plan</SelectItem>
                             <SelectItem value="business">Business Plan</SelectItem>
                             <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase opacity-40">حالة المتجر</Label>
                       <Select defaultValue={tenant.status} onValueChange={updateStatus}>
                          <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-none font-bold">
                             <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                             <SelectItem value="active">Active</SelectItem>
                             <SelectItem value="suspended">Suspended</SelectItem>
                             <SelectItem value="expired">Expired</SelectItem>
                             <SelectItem value="trial">In Trial</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                    <div className="pt-4 flex items-center justify-between text-xs font-bold text-slate-500">
                       <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> تنتهي في:</span>
                       <span className="font-black text-slate-900">{tenant.trialEndDate ? new Date(tenant.trialEndDate).toLocaleDateString("ar-EG") : '---'}</span>
                    </div>
                 </div>
                 <Button disabled={isSaving} className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20">
                   {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} حفظ التغييرات
                 </Button>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-6 rounded-[32px] bg-white border shadow-sm space-y-2">
                 <Package className="h-5 w-5 text-blue-600" />
                 <p className="text-[10px] font-black uppercase text-slate-400">المنتجات</p>
                 <p className="text-2xl font-black">{products.length}</p>
              </div>
              <div className="p-6 rounded-[32px] bg-white border shadow-sm space-y-2">
                 <ShoppingCart className="h-5 w-5 text-emerald-600" />
                 <p className="text-[10px] font-black uppercase text-slate-400">الطلبات</p>
                 <p className="text-2xl font-black">{orders.length}</p>
              </div>
              <div className="p-6 rounded-[32px] bg-white border shadow-sm space-y-2">
                 <Users className="h-5 w-5 text-purple-600" />
                 <p className="text-[10px] font-black uppercase text-slate-400">الموظفين</p>
                 <p className="text-2xl font-black">{staff.length}</p>
              </div>
              <div className="p-6 rounded-[32px] bg-white border shadow-sm space-y-2">
                 <TrendingUp className="h-5 w-5 text-orange-600" />
                 <p className="text-[10px] font-black uppercase text-slate-400">المبيعات</p>
                 <p className="text-xl font-black">{revenue.toLocaleString()}</p>
              </div>
           </div>

           <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="p-8 border-b">
                 <CardTitle className="text-xl font-black flex items-center gap-3">
                    <History className="h-6 w-6 text-primary" /> سجل عمليات المتجر
                 </CardTitle>
                 <CardDescription className="font-bold">مراقبة التحركات والعمليات الإدارية داخل هذا المتجر حصراً.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y max-h-[500px] overflow-y-auto custom-scrollbar">
                    {logs.length > 0 ? logs.map((log: any) => (
                      <div key={log.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                               {log.action?.[0]}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-800">{log.action}</p>
                               <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                                  <span>{new Date(log.timestamp).toLocaleString("ar-EG")}</span>
                                  <span className="opacity-30">•</span>
                                  <span className="font-black text-primary uppercase">{log.userName || 'System'}</span>
                               </div>
                            </div>
                         </div>
                         <div className="text-left hidden md:block max-w-[250px]">
                            <p className="text-[10px] font-medium text-slate-500 italic truncate">{log.details}</p>
                         </div>
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

function ExternalLink(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  )
}
