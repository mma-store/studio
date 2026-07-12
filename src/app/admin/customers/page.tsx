
'use client';

import { 
  Users, 
  Search, 
  UserPlus, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone,
  ArrowUpRight,
  Tags,
  BadgeDollarSign,
  Loader2,
  Edit2,
  Trash2,
  Save,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, addDoc, doc, deleteDoc, updateDoc, where } from "firebase/firestore";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function CustomersManagementPage() {
  const db = useFirestore();
  const { tenantId } = useUser();
  
  // FIXED: Server-side tenant filtering to prevent data leakage
  const customersQuery = useMemo(() => query(
    collection(db, 'users'), 
    where('tenantId', '==', tenantId),
    where('role', 'in', ['retail_customer', 'wholesale_customer']),
    orderBy('createdAt', 'desc')
  ), [db, tenantId]);
  
  const { data: customers, loading } = useCollection(customersQuery);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filtered = customers.filter((c: any) => 
    (c.displayName?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (c.phoneNumber || "").includes(search)
  );

  const normalizePhone = (p: string) => p.replace(/\s/g, '').replace(/^0/, '');

  const handleAddCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const phone = normalizePhone(formData.get('phone') as string);
    try {
      await addDoc(collection(db, 'users'), {
        tenantId, // Tag with tenantId
        displayName: formData.get('name'),
        phoneNumber: phone,
        email: `${phone}@mma.store`,
        role: formData.get('role'),
        createdAt: Date.now(),
        currentBalance: 0,
        totalPaid: 0
      });
      setIsAddOpen(false);
      toast({ title: "تمت الإضافة", description: "تم إضافة العميل الجديد بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إضافة العميل." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await updateDoc(doc(db, 'users', editingCustomer.id), {
        displayName: formData.get('name'),
        phoneNumber: normalizePhone(formData.get('phone') as string),
        role: formData.get('role'),
        updatedAt: Date.now()
      });
      setIsEditOpen(false);
      setEditingCustomer(null);
      toast({ title: "تم التحديث", description: "تم تعديل بيانات العميل بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل التحديث." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العميل نهائياً؟ سيتم مسح كافة سجلاته.")) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      toast({ title: "تم الحذف", description: "تمت إزالة العميل من النظام." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحذف." });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">إدارة العملاء</h1>
          <p className="text-muted-foreground font-medium text-sm">متابعة سجلات الزبائن، أنواع العضوية، وإحصائيات الشراء.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl font-bold h-11 shadow-lg shadow-primary/20 gap-2">
              <UserPlus className="h-5 w-5" /> إضافة عميل يدوياً
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px]">
            <DialogHeader><DialogTitle className="text-2xl font-black">عميل جديد</DialogTitle></DialogHeader>
            <form onSubmit={handleAddCustomer} className="space-y-5 pt-4">
               <div className="space-y-2">
                  <Label className="font-bold">الاسم الكامل</Label>
                  <Input name="name" required placeholder="علي محمد..." className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <div className="space-y-2">
                  <Label className="font-bold">رقم الهاتف</Label>
                  <Input name="phone" required placeholder="07XXXXXXXXX" className="rounded-xl h-12 bg-muted/20 border-none text-left" dir="ltr" />
               </div>
               <div className="space-y-2">
                  <Label className="font-bold">نوع العميل</Label>
                  <Select name="role" defaultValue="retail_customer">
                    <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-none">
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                       <SelectItem value="retail_customer" className="rounded-xl">عميل مفرد (نقدي)</SelectItem>
                       <SelectItem value="wholesale_customer" className="rounded-xl">عميل جملة (شركة)</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <DialogFooter>
                  <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl font-black text-lg">
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "حفظ بيانات العميل"}
                  </Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="بحث باسم العميل أو رقم الهاتف..." 
            className="h-14 rounded-2xl bg-white dark:bg-card pr-12 border-none shadow-sm text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-[32px] border-none bg-white dark:bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-right font-black text-xs uppercase tracking-widest py-6 px-6">العميل</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">نوع الحساب</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">رقم الهاتف</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">الدين الحالي</TableHead>
              <TableHead className="text-left font-black text-xs uppercase tracking-widest px-6">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><Skeleton className="h-12 w-48 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="px-6 text-left"><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((customer: any) => (
                <TableRow key={customer.id} className="hover:bg-muted/5 transition-colors group">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                        {customer.displayName?.[0] || <Users className="h-5 w-5" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-sm">{customer.displayName || 'بدون اسم'}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">{customer.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "rounded-full px-4 py-1 border-none font-black text-[10px]",
                      customer.role === 'wholesale_customer' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                    )}>
                       {customer.role === 'wholesale_customer' ? 'عميل جملة' : 'عميل مفرد'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-sm" dir="ltr">{customer.phoneNumber || 'غير مسجل'}</TableCell>
                  <TableCell className="font-black text-primary">{(customer.currentBalance || 0).toLocaleString()} د.ع</TableCell>
                  <TableCell className="text-left px-6">
                    <div className="flex items-center justify-end gap-2">
                       <Button variant="ghost" size="icon" className="rounded-xl text-blue-600 hover:bg-blue-50" onClick={() => { setEditingCustomer(customer); setIsEditOpen(true); }}>
                          <Edit2 className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="rounded-xl text-destructive hover:bg-red-50" onClick={() => handleDeleteCustomer(customer.id)}>
                          <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center opacity-30 font-black">لا يوجد عملاء مضافين حالياً</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-[32px]">
          <DialogHeader><DialogTitle className="text-2xl font-black">تعديل بيانات العميل</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateCustomer} className="space-y-5 pt-4">
             <div className="space-y-2">
                <Label className="font-bold">الاسم الكامل</Label>
                <Input name="name" defaultValue={editingCustomer?.displayName} required className="rounded-xl h-12 bg-muted/20 border-none" />
             </div>
             <div className="space-y-2">
                <Label className="font-bold">رقم الهاتف</Label>
                <Input name="phone" defaultValue={editingCustomer?.phoneNumber} required className="rounded-xl h-12 bg-muted/20 border-none text-left" dir="ltr" />
             </div>
             <div className="space-y-2">
                <Label className="font-bold">نوع الحساب</Label>
                <Select name="role" defaultValue={editingCustomer?.role}>
                  <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                     <SelectItem value="retail_customer">عميل مفرد</SelectItem>
                     <SelectItem value="wholesale_customer">عميل جملة</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <DialogFooter>
                <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl font-black text-lg gap-2">
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} حفظ التغييرات
                </Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
