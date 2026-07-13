
'use client';

import { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Receipt, 
  User, 
  Banknote, 
  Calendar, 
  Printer,
  Loader2,
  Filter
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, addDoc, doc, writeBatch, increment, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function ReceiptVouchersPage() {
  const db = useFirestore();
  const { profile, tenantId } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // FIXED: Server-side tenant filtering for receipt vouchers
  const vouchersQuery = useMemo(() => query(
    collection(db, 'receiptVouchers'), 
    where('tenantId', '==', tenantId),
    orderBy('timestamp', 'desc')
  ), [db, tenantId]);
  const { data: vouchers, loading } = useCollection(vouchersQuery);

  // FIXED: Server-side tenant filtering for users (customers) selection
  const usersQuery = useMemo(() => query(
    collection(db, 'users'),
    where('tenantId', '==', tenantId)
  ), [db, tenantId]);
  const { data: users } = useCollection(usersQuery);

  const filtered = vouchers.filter((v: any) => 
    v.customerName?.toLowerCase().includes(search.toLowerCase()) || 
    v.voucherNumber?.includes(search)
  );

  const handleAddVoucher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const userId = formData.get('userId') as string;
    const amount = Number(formData.get('amount'));
    const customer = users.find(u => u.id === userId);

    try {
      const batch = writeBatch(db);
      const voucherNumber = `RV-${Date.now().toString().slice(-6)}`;
      const voucherData = {
        tenantId,
        voucherNumber,
        userId,
        customerName: customer?.displayName || "غير معروف",
        amount,
        paymentMethod: formData.get('method'),
        notes: formData.get('notes'),
        employeeId: profile?.uid,
        employeeName: profile?.displayName,
        timestamp: Date.now()
      };

      const voucherRef = doc(collection(db, 'receiptVouchers'));
      batch.set(voucherRef, voucherData);

      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        currentBalance: increment(-amount),
        totalPaid: increment(amount),
        lastPaymentDate: Date.now()
      });

      const transactionRef = doc(collection(db, "financialTransactions"));
      batch.set(transactionRef, {
        tenantId,
        userId,
        type: 'payment',
        amount: -amount,
        referenceId: voucherRef.id,
        description: `وصل قبض رقم ${voucherNumber}`,
        timestamp: Date.now()
      });

      await batch.commit();
      setIsAddOpen(false);
      toast({ title: "تم الحفظ", description: "تم تسجيل وصل القبض وتحديث حساب العميل." });
      router.push(`/admin/print/receipt/${voucherRef.id}?size=80mm`);
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ الوصل." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">وصلات القبض</h1>
          <p className="text-muted-foreground font-medium">إدارة مبالغ الديون المستلمة من العملاء.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 font-bold gap-2 shadow-lg">
              <Plus className="h-5 w-5" /> إنشاء وصل قبض
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px] max-w-lg">
            <DialogHeader><DialogTitle className="text-2xl font-black">وصل قبض جديد</DialogTitle></DialogHeader>
            <form onSubmit={handleAddVoucher} className="space-y-5 pt-4">
               <div className="space-y-2">
                 <Label className="font-bold">العميل</Label>
                 <Select name="userId" required>
                    <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-none">
                       <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                       {users.filter(u => u.currentBalance > 0).map((u: any) => (
                          <SelectItem key={u.id} value={u.id} className="rounded-xl">
                             {u.displayName} (ذمة: {u.currentBalance?.toLocaleString()} د.ع)
                          </SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">المبلغ المستلم</Label>
                 <Input name="amount" type="number" required placeholder="0.00" className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <div className="space-y-2">
                  <Label className="font-bold">طريقة الدفع</Label>
                  <Select name="method" defaultValue="cash">
                    <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-none">
                      <SelectValue placeholder="اختر الطريقة" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                       <SelectItem value="cash">نقداً</SelectItem>
                       <SelectItem value="transfer">تحويل</SelectItem>
                       <SelectItem value="check">صك</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">ملاحظات</Label>
                 <Input name="notes" placeholder="اختياري..." className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <DialogFooter>
                 <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl font-black text-lg">
                   {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "حفظ وطباعة الوصل"}
                 </Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="بحث برقم الوصل أو اسم العميل..." 
            className="h-12 rounded-xl pr-10 border-none shadow-sm bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-[32px] overflow-hidden bg-white shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-right py-5 px-6">رقم الوصل</TableHead>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الموظف</TableHead>
              <TableHead className="text-left px-6">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="px-6 text-left"><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((v: any) => (
                <TableRow key={v.id} className="hover:bg-muted/5 transition-colors">
                  <TableCell className="font-black text-sm px-6">{v.voucherNumber}</TableCell>
                  <TableCell className="font-bold">{v.customerName}</TableCell>
                  <TableCell className="font-black text-green-600">{v.amount?.toLocaleString()} د.ع</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-bold">
                    {new Date(v.timestamp).toLocaleString("ar-EG")}
                  </TableCell>
                  <TableCell className="text-xs font-medium">{v.employeeName}</TableCell>
                  <TableCell className="text-left px-6">
                    <Button variant="ghost" size="icon" className="rounded-xl text-primary" onClick={() => router.push(`/admin/print/receipt/${v.id}?size=80mm`)}>
                      <Printer className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 opacity-30 font-bold">لا يوجد وصلات قبض حالياً.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
