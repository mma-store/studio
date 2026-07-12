
'use client';

import { 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Wrench, 
  ShoppingBag, 
  Warehouse, 
  ShieldAlert,
  Loader2,
  Plus,
  Edit2,
  Save,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, where, orderBy, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const roleMap = {
  admin: { label: "مدير نظام", icon: ShieldCheck, color: "bg-red-100 text-red-700" },
  owner: { label: "صاحب المتجر", icon: ShieldCheck, color: "bg-purple-100 text-purple-700" },
  sales_employee: { label: "موظف مبيعات", icon: ShoppingBag, color: "bg-blue-100 text-blue-700" },
  workshop_technician: { label: "فني ورشة", icon: Wrench, color: "bg-green-100 text-green-700" },
  warehouse_employee: { label: "أمين مخزن", icon: Warehouse, color: "bg-orange-100 text-orange-700" },
};

export default function EmployeesPage() {
  const db = useFirestore();
  const { tenantId } = useUser();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const staffQuery = useMemo(() => query(
    collection(db, 'users'), 
    where('tenantId', '==', tenantId),
    where('role', 'in', ['admin', 'owner', 'sales_employee', 'workshop_technician', 'warehouse_employee']),
    orderBy('createdAt', 'desc')
  ), [db, tenantId]);
  const { data: staff, loading } = useCollection(staffQuery);

  const cleanPhone = (p: string) => p.replace(/\s/g, '').replace(/^(\+964|0)/, '');

  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const purePhone = cleanPhone(formData.get('phone') as string);
    
    try {
      await addDoc(collection(db, 'users'), {
        tenantId,
        displayName: formData.get('name'),
        phoneNumber: `0${purePhone}`, 
        role: formData.get('role'),
        tempPassword: formData.get('password'),
        createdAt: Date.now()
      });
      setIsAddOpen(false);
      toast({ title: "تم تسجيل الموظف", description: "يمكن للموظف الآن تسجيل الدخول مباشرة بنفس الرقم وكلمة السر." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الإضافة" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEmployee) return;
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const purePhone = cleanPhone(formData.get('phone') as string);
    
    try {
      await updateDoc(doc(db, 'users', editingEmployee.id), {
        displayName: formData.get('name'),
        phoneNumber: `0${purePhone}`,
        role: formData.get('role'),
        updatedAt: Date.now()
      });
      setIsEditOpen(false);
      setEditingEmployee(null);
      toast({ title: "تم تحديث البيانات" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التعديل" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد إزالة هذا الموظف نهائياً؟")) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      toast({ title: "تم الحذف" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحذف" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">إدارة فريق العمل</h1>
          <p className="text-muted-foreground font-medium text-sm">إضافة الموظفين وتعيين كلمات سر لهم للدخول الفوري.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 font-bold gap-2 shadow-lg shadow-primary/20">
              <UserPlus className="h-5 w-5" /> إضافة موظف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px]">
            <DialogHeader><DialogTitle className="text-2xl font-black">موظف جديد</DialogTitle></DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-5 pt-4">
               <div className="space-y-2">
                  <Label className="font-bold">الاسم الكامل</Label>
                  <Input name="name" required placeholder="اسم الموظف..." className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <div className="space-y-2">
                  <Label className="font-bold">رقم الهاتف</Label>
                  <Input name="phone" required placeholder="07XXXXXXXXX" className="rounded-xl h-12 bg-muted/20 border-none text-left" dir="ltr" />
               </div>
               <div className="space-y-2">
                  <Label className="font-bold">كلمة سر الدخول</Label>
                  <Input name="password" required type="text" placeholder="اكتب رمزاً للموظف..." className="rounded-xl h-12 bg-muted/20 border-none text-left font-black" />
                  <p className="text-[10px] text-muted-foreground font-bold px-1">هذه الكلمة سيستخدمها الموظف للدخول لأول مرة.</p>
               </div>
               <div className="space-y-2">
                  <Label className="font-bold">الدور الوظيفي</Label>
                  <Select name="role" defaultValue="sales_employee">
                    <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-none">
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                       <SelectItem value="admin">مدير نظام</SelectItem>
                       <SelectItem value="sales_employee">موظف مبيعات (صلاحيات كاملة)</SelectItem>
                       <SelectItem value="workshop_technician">فني ورشة</SelectItem>
                       <SelectItem value="warehouse_employee">أمين مخزن</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <DialogFooter>
                  <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl font-black text-lg">
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "حفظ الموظف وتفعيل دخوله"}
                  </Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-[32px] border-none bg-white dark:bg-card shadow-sm overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/30">
              <TableHead className="text-right font-black text-xs uppercase py-6 px-6">الموظف</TableHead>
              <TableHead className="text-right font-black text-xs uppercase">الدور</TableHead>
              <TableHead className="text-right font-black text-xs uppercase">رقم الهاتف</TableHead>
              <TableHead className="text-right font-black text-xs uppercase">كلمة السر</TableHead>
              <TableHead className="text-left font-black text-xs uppercase px-6">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><Skeleton className="h-10 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="px-6 text-left"><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : staff.map((member: any) => {
              const roleConfig = roleMap[member.role as keyof typeof roleMap] || { label: member.role, icon: ShieldAlert, color: "bg-muted text-muted-foreground" };
              const Icon = roleConfig.icon;
              return (
                <TableRow key={member.id} className="hover:bg-muted/5 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                        {member.displayName?.[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-sm">{member.displayName}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">{member.email || 'حساب مفعل'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("rounded-full border-none font-bold text-[10px] gap-1.5 px-3 py-1", roleConfig.color)}>
                       <Icon className="h-3.5 w-3.5" />
                       {roleConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-sm" dir="ltr">{member.phoneNumber}</TableCell>
                  <TableCell className="font-mono text-xs opacity-50">{member.tempPassword || '******'}</TableCell>
                  <TableCell className="text-left px-6">
                    <div className="flex items-center justify-end gap-2">
                       <Button variant="ghost" size="icon" className="rounded-xl text-blue-600" onClick={() => { setEditingEmployee(member); setIsEditOpen(true); }}>
                          <Edit2 className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" className="rounded-xl text-destructive" onClick={() => handleDelete(member.id)}>
                          <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-[32px]">
          <DialogHeader><DialogTitle className="text-2xl font-black">تعديل الموظف</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateEmployee} className="space-y-5 pt-4">
             <div className="space-y-2">
                <Label className="font-bold">الاسم الكامل</Label>
                <Input name="name" defaultValue={editingEmployee?.displayName} required className="rounded-xl h-12 bg-muted/20 border-none" />
             </div>
             <div className="space-y-2">
                <Label className="font-bold">رقم الهاتف</Label>
                <Input name="phone" defaultValue={editingEmployee?.phoneNumber} required className="rounded-xl h-12 bg-muted/20 border-none text-left" dir="ltr" />
             </div>
             <div className="space-y-2">
                <Label className="font-bold">الدور الوظيفي</Label>
                <Select name="role" defaultValue={editingEmployee?.role}>
                  <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                     <SelectItem value="admin">مدير نظام</SelectItem>
                     <SelectItem value="sales_employee">موظف مبيعات</SelectItem>
                     <SelectItem value="workshop_technician">فني ورشة</SelectItem>
                     <SelectItem value="warehouse_employee">أمين مخزن</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <DialogFooter>
                <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl font-black text-lg gap-2">
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} حفظ التعديلات
                </Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
