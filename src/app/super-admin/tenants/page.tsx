
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
  User,
  BadgeCheck,
  CreditCard,
  Building2,
  ArrowUpDown,
  History,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function TenantsManagementPage() {
  const db = useFirestore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  const tenantsQuery = useMemo(() => query(collection(db, 'tenants'), orderBy('createdAt', 'desc')), [db]);
  const { data: tenants, loading } = useCollection(tenantsQuery);

  const filtered = useMemo(() => {
    return tenants.filter((t: any) => {
      const matchesSearch = t.businessName?.toLowerCase().includes(search.toLowerCase()) || 
                          t.slug?.toLowerCase().includes(search.toLowerCase()) ||
                          t.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
                          t.phone?.includes(search);
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesPlan = planFilter === "all" || t.subscriptionPlan === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [tenants, search, statusFilter, planFilter]);

  const updateTenantStatus = async (tenantId: string, newStatus: string) => {
    setIsProcessing(tenantId);
    try {
      await updateDoc(doc(db, 'tenants', tenantId), { status: newStatus });
      toast({ title: "تم التحديث", description: `حالة المتجر الآن: ${newStatus}` });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في التحديث" });
    } finally {
      setIsProcessing(null);
    }
  };

  const extendSubscription = async (tenantId: string, currentEndDate: number) => {
    const extraDays = 30 * 24 * 60 * 60 * 1000;
    const newEndDate = (currentEndDate || Date.now()) + extraDays;
    setIsProcessing(tenantId);
    try {
      await updateDoc(doc(db, 'tenants', tenantId), { 
        trialEndDate: newEndDate,
        status: 'active',
        subscriptionPlan: 'business'
      });
      toast({ title: "تم التمديد", description: "تم تفعيل الاشتراك لمدة 30 يوماً إضافية." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في التمديد" });
    } finally {
      setIsProcessing(null);
    }
  };

  const deleteTenant = async (tenantId: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف متجر "${name}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
    setIsProcessing(tenantId);
    try {
      await deleteDoc(doc(db, 'tenants', tenantId));
      toast({ title: "تم الحذف", description: "تم مسح بيانات المتجر من المنصة." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900">إدارة المشتركين</h1>
          <p className="text-muted-foreground font-medium">التحكم في كافة المتاجر المشتركة ومتابعة حالات اشتراكاتهم.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="بحث باسم المتجر، المالك، أو الرابط..." 
            className="h-14 rounded-2xl pr-12 border-none shadow-sm bg-white text-lg font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
           <SelectTrigger className="h-14 rounded-2xl bg-white border-none shadow-sm font-bold">
              <SelectValue placeholder="الحالة" />
           </SelectTrigger>
           <SelectContent className="rounded-2xl">
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="trial">تجريبي</SelectItem>
              <SelectItem value="suspended">معلق</SelectItem>
              <SelectItem value="expired">منتهي</SelectItem>
           </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={setPlanFilter}>
           <SelectTrigger className="h-14 rounded-2xl bg-white border-none shadow-sm font-bold">
              <SelectValue placeholder="الباقة" />
           </SelectTrigger>
           <SelectContent className="rounded-2xl">
              <SelectItem value="all">كل الباقات</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
           </SelectContent>
        </Select>
      </div>

      <div className="rounded-[40px] border-none bg-white shadow-sm overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="text-right py-6 px-8 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">المتجر والمالك</TableHead>
              <TableHead className="text-right font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">الرابط</TableHead>
              <TableHead className="text-right font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">الخطة</TableHead>
              <TableHead className="text-right font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">الحالة</TableHead>
              <TableHead className="text-right font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">الانتهاء</TableHead>
              <TableHead className="text-left px-8 font-black text-[10px] uppercase tracking-[0.2em] text-slate-500">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="px-8 py-4"><Skeleton className="h-12 w-full rounded-2xl" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((tenant: any) => (
                <TableRow key={tenant.id} className="hover:bg-slate-50/80 transition-colors border-b last:border-0 group">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className="h-14 w-14 rounded-[20px] bg-primary/5 flex items-center justify-center text-primary font-black shadow-inner border border-primary/10">
                          {tenant.businessName?.[0]}
                       </div>
                       <div className="flex flex-col">
                          <span className="font-black text-sm text-slate-800">{tenant.businessName}</span>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground mt-1">
                             <User className="h-3 w-3" /> {tenant.ownerName || 'بدون اسم'}
                             <span className="opacity-30">•</span>
                             <Phone className="h-3 w-3" /> <span dir="ltr">{tenant.phone}</span>
                          </div>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-primary font-bold">
                     <Link href={`/store/${tenant.slug}`} target="_blank" className="hover:underline flex items-center gap-1">
                        /{tenant.slug} <ExternalLink className="h-2.5 w-2.5" />
                     </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full border-primary/20 text-primary font-black text-[9px] px-3 py-0.5 bg-primary/5">
                       {tenant.subscriptionPlan?.toUpperCase() || 'TRIAL'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "rounded-full border-none font-black text-[9px] px-3 py-1",
                      tenant.status === 'active' ? "bg-emerald-100 text-emerald-700" : 
                      tenant.status === 'trial' ? "bg-blue-100 text-blue-700" : 
                      tenant.status === 'suspended' ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                    )}>
                      {tenant.status === 'active' ? 'نشط' : tenant.status === 'trial' ? 'تجريبي' : tenant.status === 'suspended' ? 'معلق' : 'معطل'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] font-bold text-slate-500">
                    {tenant.trialEndDate ? new Date(tenant.trialEndDate).toLocaleDateString("ar-EG") : 'غير محدد'}
                  </TableCell>
                  <TableCell className="text-left px-8">
                     <div className="flex items-center justify-end gap-2">
                        {isProcessing === tenant.id ? (
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        ) : (
                          <>
                            <Link href={`/super-admin/tenants/${tenant.id}`}>
                               <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-primary bg-primary/5 hover:bg-primary/10">
                                  <Building2 className="h-4 w-4" />
                               </Button>
                            </Link>

                            <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10"><MoreVertical className="h-5 w-5" /></Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="rounded-2xl p-2 w-56 shadow-2xl border-none">
                                  <DropdownMenuLabel className="font-black text-[10px] uppercase opacity-50 px-2 py-1">إدارة المتجر</DropdownMenuLabel>
                                  <DropdownMenuItem className="rounded-xl gap-2 font-bold cursor-pointer" onClick={() => updateTenantStatus(tenant.id, 'active')}>
                                     <ShieldCheck className="h-4 w-4 text-emerald-600" /> تفعيل المتجر
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-xl gap-2 font-bold cursor-pointer" onClick={() => updateTenantStatus(tenant.id, 'suspended')}>
                                     <ShieldX className="h-4 w-4 text-orange-600" /> تعليق مؤقت
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="rounded-xl gap-2 font-bold cursor-pointer" onClick={() => extendSubscription(tenant.id, tenant.trialEndDate)}>
                                     <BadgeCheck className="h-4 w-4 text-blue-600" /> تفعيل اشتراك (30 يوم)
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-xl gap-2 font-bold cursor-pointer">
                                     <Edit3 className="h-4 w-4 text-slate-600" /> تعديل البيانات
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="rounded-xl gap-2 font-bold cursor-pointer text-red-600" onClick={() => deleteTenant(tenant.id, tenant.businessName)}>
                                     <Trash2 className="h-4 w-4" /> حذف المتجر نهائياً
                                  </DropdownMenuItem>
                               </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
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
