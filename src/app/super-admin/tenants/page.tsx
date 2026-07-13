
'use client';

import { useState, useMemo } from "react";
import { 
  Store, 
  Search, 
  ShieldCheck, 
  ShieldX, 
  ExternalLink, 
  MoreVertical,
  Phone,
  Calendar,
  Loader2,
  Trash2,
  Edit3,
  ChevronRight,
  Filter,
  ArrowUpDown,
  CreditCard,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function TenantsManagementPage() {
  const db = useFirestore();
  const [search, setSearch] = useState("");
  
  const tenantsQuery = useMemo(() => query(collection(db, 'tenants'), orderBy('createdAt', 'desc')), [db]);
  const { data: tenants, loading } = useCollection(tenantsQuery);

  const filtered = tenants.filter((t: any) => 
    t.businessName?.toLowerCase().includes(search.toLowerCase()) || 
    t.slug?.toLowerCase().includes(search.toLowerCase()) ||
    t.ownerName?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (tenantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await updateDoc(doc(db, 'tenants', tenantId), { status: newStatus });
      toast({ title: "تم تحديث حالة المتجر", description: `المتجر الآن ${newStatus === 'active' ? 'نشط' : 'معطل'}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في التحديث" });
    }
  };

  const extendTrial = async (tenantId: string, currentEndDate: number) => {
    const newEndDate = (currentEndDate || Date.now()) + (7 * 24 * 60 * 60 * 1000);
    try {
      await updateDoc(doc(db, 'tenants', tenantId), { 
        trialEndDate: newEndDate,
        status: 'trial' 
      });
      toast({ title: "تم تمديد الفترة", description: "تم إضافة 7 أيام إضافية للفترة التجريبية." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900">إدارة المشتركين (Tenants)</h1>
          <p className="text-muted-foreground font-medium">التحكم في كافة المتاجر المشتركة، مراجعة اشتراكاتهم، وإدارة حالات الوصول.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl border-2 font-bold h-11 gap-2">
              <Filter className="h-4 w-4" /> تصفية النتائج
           </Button>
           <Button className="rounded-xl font-black h-11 px-8 shadow-lg shadow-primary/20">تصدير بيانات المشتركين</Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="بحث باسم المتجر، المالك، أو الرابط..." 
            className="h-14 rounded-2xl pr-12 border-none shadow-sm bg-white text-lg font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-[32px] border-none bg-white shadow-sm overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="text-right py-6 px-6 font-black text-xs uppercase tracking-widest text-slate-500">المتجر والمالك</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest text-slate-500">الرابط</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest text-slate-500">الباقة</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest text-slate-500">تاريخ الانتهاء</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest text-slate-500">الحالة</TableHead>
              <TableHead className="text-left px-6 font-black text-xs uppercase tracking-widest text-slate-500">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="px-6 py-4"><Skeleton className="h-12 w-full rounded-2xl" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((tenant: any) => (
                <TableRow key={tenant.id} className="hover:bg-slate-50/80 transition-colors group">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner">
                          {tenant.businessName?.[0]}
                       </div>
                       <div className="flex flex-col">
                          <span className="font-black text-sm text-slate-800">{tenant.businessName}</span>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                             <User className="h-3 w-3" /> {tenant.ownerName || 'بدون مالك'}
                             <span className="mx-1">•</span>
                             <Phone className="h-3 w-3" /> <span dir="ltr">{tenant.phone}</span>
                          </div>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-primary font-bold">
                     <Link href={`/store/${tenant.slug}`} target="_blank" className="hover:underline">/{tenant.slug}</Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full border-blue-200 text-blue-700 font-bold text-[10px] px-3 bg-blue-50/50">
                       {tenant.subscriptionPlan?.toUpperCase() || 'TRIAL'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] font-bold text-muted-foreground">
                    {tenant.trialEndDate ? new Date(tenant.trialEndDate).toLocaleDateString("ar-EG") : '---'}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "rounded-full border-none font-black text-[10px] px-3",
                      tenant.status === 'active' ? "bg-green-100 text-green-700" : 
                      tenant.status === 'trial' ? "bg-blue-100 text-blue-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {tenant.status === 'active' ? 'نشط' : tenant.status === 'trial' ? 'تجريبي' : 'معطل'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left px-6">
                     <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn("rounded-xl h-9 w-9", tenant.status === 'active' ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50")}
                          onClick={() => toggleStatus(tenant.id, tenant.status)}
                          title={tenant.status === 'active' ? 'تعطيل المتجر' : 'تفعيل المتجر'}
                        >
                          {tenant.status === 'active' ? <ShieldX className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-xl h-9 w-9 text-orange-600 hover:bg-orange-50"
                          onClick={() => extendTrial(tenant.id, tenant.trialEndDate)}
                          title="تمديد الفترة التجريبية (7 أيام)"
                        >
                           <Calendar className="h-4 w-4" />
                        </Button>

                        <Link href={`/super-admin/tenants/${tenant.id}`}>
                           <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 text-primary hover:bg-primary/5">
                              <Edit3 className="h-4 w-4" />
                           </Button>
                        </Link>
                     </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center opacity-30 font-black">لا توجد متاجر مطابقة للبحث</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
