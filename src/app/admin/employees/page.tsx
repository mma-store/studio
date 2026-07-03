
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
  Mail,
  Phone,
  Plus
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
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, deleteDoc, doc, addDoc } from "firebase/firestore";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const roleMap = {
  admin: { label: "مدير نظام", icon: ShieldCheck, color: "bg-red-100 text-red-700" },
  sales_employee: { label: "موظف مبيعات", icon: ShoppingBag, color: "bg-blue-100 text-blue-700" },
  workshop_technician: { label: "فني ورشة", icon: Wrench, color: "bg-green-100 text-green-700" },
  warehouse_employee: { label: "أمين مخزن", icon: Warehouse, color: "bg-orange-100 text-orange-700" },
};

export default function EmployeesPage() {
  const db = useFirestore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const staffQuery = useMemo(() => query(
    collection(db, 'users'), 
    where('role', 'in', ['admin', 'sales_employee', 'workshop_technician', 'warehouse_employee']),
    orderBy('createdAt', 'desc')
  ), [db]);
  const { data: staff, loading } = useCollection(staffQuery);

  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      const phone = formData.get('phone') as string;
      await addDoc(collection(db, 'users'), {
        displayName: formData.get('name'),
        email: `${phone}@mma.staff`,
        phoneNumber: phone,
        role: formData.get('role'),
        createdAt: Date.now()
      });
      setIsAddOpen(false);
      toast({ title: "تمت الإضافة", description: "تم إضافة الموظف بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إضافة الموظف." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد إزالة هذا الموظف من النظام؟")) return;
    await deleteDoc(doc(db, 'users', id));
    toast({ title: "تم الحذف" });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">إدارة فريق العمل</h1>
          <p className="text-muted-foreground font-medium text-sm">إدارة حسابات الموظفين والصلاحيات في المجمع.</p>
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
                  <Label className="font-bold">الدور الوظيفي</Label>
                  <Select name="role" defaultValue="sales_employee">
                    <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-none">
                      <SelectValue placeholder="اختر الدور" />
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
                  <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl font-black text-lg">
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "حفظ بيانات الموظف"}
                  </Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-[32px] border-none bg-white dark:bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/30">
              <TableHead className="text-right font-black text-xs uppercase py-6 px-6 text-foreground">الموظف</TableHead>
              <TableHead className="text-right font-black text-xs uppercase text-foreground">الدور الوظيفي</TableHead>
              <TableHead className="text-right font-black text-xs uppercase text-foreground">رقم الهاتف</TableHead>
              <TableHead className="text-right font-black text-xs uppercase text-foreground">تاريخ التعيين</TableHead>
              <TableHead className="text-left font-black text-xs uppercase px-6 text-foreground">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><Skeleton className="h-12 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="px-6 text-left"><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : staff.length > 0 ? (
              staff.map((member: any) => {
              const roleConfig = roleMap[member.role as keyof typeof roleMap] || { label: member.role, icon: ShieldAlert, color: "bg-muted text-muted-foreground" };
              const Icon = roleConfig.icon;
              return (
                <TableRow key={member.id} className="hover:bg-muted/5 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                        {member.displayName?.[0] || 'E'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-sm">{member.displayName}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">{member.email}</span>
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
                  <TableCell className="text-muted-foreground text-xs font-bold">
                    {new Date(member.createdAt).toLocaleDateString("ar-EG")}
                  </TableCell>
                  <TableCell className="text-left px-6">
                    <Button variant="ghost" size="icon" className="rounded-xl text-destructive hover:bg-red-50" onClick={() => handleDelete(member.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center opacity-30 font-bold">لا يوجد موظفين مضافين حالياً.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
