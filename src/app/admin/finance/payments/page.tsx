
'use client';

import { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Banknote, 
  User, 
  Calendar, 
  Printer,
  Loader2,
  Trash2
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
import { collection, query, orderBy, doc, writeBatch, increment } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function PaymentVouchersPage() {
  const db = useFirestore();
  const { profile } = useUser();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const vouchersQuery = useMemo(() => query(collection(db, 'paymentVouchers'), orderBy('timestamp', 'desc')), [db]);
  const { data: vouchers, loading } = useCollection(vouchersQuery);

  const suppliersQuery = useMemo(() => query(collection(db, 'suppliers')), [db]);
  const { data: suppliers } = useCollection(suppliersQuery);

  const handleAddVoucher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const supplierId = formData.get('supplierId') as string;
    const amount = Number(formData.get('amount'));
    const supplier = suppliers.find(s => s.id === supplierId);

    try {
      const batch = writeBatch(db);
      const voucherNo = `PV-${Date.now().toString().slice(-6)}`;
      
      const voucherRef = doc(collection(db, 'paymentVouchers'));
      batch.set(voucherRef, {
        voucherNumber: voucherNo,
        targetId: supplierId,
        targetName: supplier?.name || "جهة أخرى",
        amount,
        paymentMethod: formData.get('method'),
        notes: formData.get('notes'),
        timestamp: Date.now(),
        employeeName: profile?.displayName || "مدير"
      });

      // Update Supplier Balance (Reduce debt we owe them)
      if (supplierId) {
        const supplierRef = doc(db, 'suppliers', supplierId);
        batch.update(supplierRef, { balance: increment(-amount) });
        
        // Ledger
        const transactionRef = doc(collection(db, "financialTransactions"));
        batch.set(transactionRef, {
          userId: supplierId,
          type: 'payment_out',
          amount: -amount,
          description: `سند صرف رقم ${voucherNo}`,
          timestamp: Date.now()
        });
      }

      await batch.commit();
      setIsAddOpen(false);
      toast({ title: "تم الصرف", description: "تم تسجيل سند الصرف وتحديث الحساب." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">سندات الصرف</h1>
          <p className="text-muted-foreground font-medium">إدارة المبالغ المدفوعة للموردين والمصاريف الكبرى.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 font-bold gap-2 shadow-lg">
              <Plus className="h-5 w-5" /> إنشاء سند صرف
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px] max-w-lg">
            <DialogHeader><DialogTitle className="text-2xl font-black">سند صرف جديد</DialogTitle></DialogHeader>
            <form onSubmit={handleAddVoucher} className="space-y-5 pt-4">
               <div className="space-y-2">
                 <Label className="font-bold">المستلم (المورد)</Label>
                 <Select name="supplierId">
                    <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-none">
                       <SelectValue placeholder="اختر المورد أو اترك فارغاً للمصاريف" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                       {suppliers.map((s: any) => (
                          <SelectItem key={s.id} value={s.id} className="rounded-xl">
                             {s.name} (دينه: {s.balance?.toLocaleString()} د.ع)
                          </SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">المبلغ المصروف</Label>
                 <Input name="amount" type="number" required placeholder="0.00" className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <div className="space-y-2">
                  <Label className="font-bold">طريقة الصرف</Label>
                  <Select name="method" defaultValue="cash">
                    <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-none">
                      <SelectValue placeholder="اختر الطريقة" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                       <SelectItem value="cash">نقداً</SelectItem>
                       <SelectItem value="transfer">تحويل بنكي</SelectItem>
                       <SelectItem value="check">صك</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">ملاحظات / السبب</Label>
                 <Input name="notes" placeholder="مثلاً: دفعة من حساب فاتورة..." className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <DialogFooter>
                 <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl font-black text-lg">
                   {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "حفظ وطباعة السند"}
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
              <TableHead className="text-right py-5 px-6">رقم السند</TableHead>
              <TableHead className="text-right">المستلم</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-left px-6">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               Array(5).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell></TableRow>)
            ) : vouchers.map((v: any) => (
              <TableRow key={v.id} className="hover:bg-muted/5 transition-colors">
                <TableCell className="font-black text-sm px-6">{v.voucherNumber}</TableCell>
                <TableCell className="font-bold">{v.targetName}</TableCell>
                <TableCell className="font-black text-red-600">{v.amount?.toLocaleString()} د.ع</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(v.timestamp).toLocaleDateString("ar-EG")}</TableCell>
                <TableCell className="text-left px-6">
                  <Button variant="ghost" size="icon" className="text-primary"><Printer className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
