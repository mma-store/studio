
'use client';

import { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Coins, 
  User, 
  Calendar, 
  Loader2,
  Trash2,
  TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, addDoc, doc, deleteDoc, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

const EXPENSE_CATEGORIES = [
  "إيجار المحل",
  "رواتب الموظفين",
  "كهرباء ومولد",
  "إنترنت واتصالات",
  "صيانة دورية",
  "مشتريات مكتبية",
  "ضيافة وبوفيه",
  "أخرى"
];

export default function ExpensesPage() {
  const db = useFirestore();
  const { profile, tenantId } = useUser();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const expensesQuery = useMemo(() => query(
    collection(db, 'expenses'), 
    where('tenantId', '==', tenantId),
    orderBy('timestamp', 'desc')
  ), [db, tenantId]);
  const { data: expenses, loading } = useCollection(expensesQuery);

  const totalExpenses = useMemo(() => expenses.reduce((acc, e) => acc + (e.amount || 0), 0), [expenses]);

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addDoc(collection(db, 'expenses'), {
        tenantId,
        category: formData.get('category'),
        amount: Number(formData.get('amount')),
        notes: formData.get('notes'),
        employeeName: profile?.displayName || "مدير",
        timestamp: Date.now()
      });
      setIsAddOpen(false);
      toast({ title: "تم التسجيل", description: "تم تسجيل المصروف بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحفظ." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذا السجل؟")) return;
    await deleteDoc(doc(db, 'expenses', id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black">المصاريف النثرية</h1>
          <p className="text-muted-foreground font-medium">تتبع كافة التكاليف والمصاريف التشغيلية للمجمع.</p>
        </div>
        <div className="bg-red-50 text-red-700 px-6 py-4 rounded-[28px] border border-red-100 flex items-center gap-4 shadow-sm">
           <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-6 w-6" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase opacity-60">إجمالي المصاريف</p>
              <h3 className="text-2xl font-black">{totalExpenses.toLocaleString()} د.ع</h3>
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث في المصاريف..." className="h-12 rounded-xl pr-10 border-none shadow-sm bg-white" />
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-12 px-8 font-black gap-2 shadow-lg">
              <Plus className="h-5 w-5" /> تسجيل مصروف
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px] max-w-md">
            <DialogHeader><DialogTitle className="text-2xl font-black">مصروف جديد</DialogTitle></DialogHeader>
            <form onSubmit={handleAddExpense} className="space-y-5 pt-4">
               <div className="space-y-2">
                 <Label className="font-bold">التصنيف</Label>
                 <Select name="category" required>
                    <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-none">
                       <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                       {EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c} className="rounded-xl">{c}</SelectItem>)}
                    </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">المبلغ</Label>
                 <Input name="amount" type="number" required placeholder="0.00" className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">ملاحظات</Label>
                 <Input name="notes" placeholder="تفاصيل إضافية..." className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <DialogFooter>
                 <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl font-black text-lg">
                   {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "حفظ المصروف"}
                 </Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-[32px] overflow-hidden bg-white shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-right py-5 px-6">الفئة</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الموظف</TableHead>
              <TableHead className="text-left px-6">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               Array(5).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-10 w-full rounded-xl" /></TableCell></TableRow>)
            ) : expenses.map((e: any) => (
              <TableRow key={e.id} className="hover:bg-muted/5 transition-colors">
                <TableCell className="font-black text-sm px-6">{e.category}</TableCell>
                <TableCell className="font-black text-red-600">{e.amount?.toLocaleString()} د.ع</TableCell>
                <TableCell className="text-xs text-muted-foreground font-bold">{new Date(e.timestamp).toLocaleDateString("ar-EG")}</TableCell>
                <TableCell className="text-xs font-medium">{e.employeeName}</TableCell>
                <TableCell className="text-left px-6">
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-red-50" onClick={() => handleDelete(e.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
