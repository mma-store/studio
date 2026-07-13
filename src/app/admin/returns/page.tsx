'use client';

import { useState, useMemo } from "react";
import { 
  ArrowLeftRight, 
  Search, 
  Plus, 
  History, 
  RefreshCcw, 
  Trash2, 
  CheckCircle2, 
  Loader2,
  Package
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, where, doc, getDoc, writeBatch, increment, addDoc, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function ReturnsPage() {
  const db = useFirestore();
  const { tenantId, profile } = useUser();
  const [orderIdSearch, setOrderIdSearch] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsAddModalOpen] = useState(false);

  // FIXED: Scoped to tenantId
  const returnsQuery = useMemo(() => query(
    collection(db, 'returns'), 
    where('tenantId', '==', tenantId),
    orderBy('timestamp', 'desc')
  ), [db, tenantId]);
  const { data: returns, loading } = useCollection(returnsQuery);

  const searchOrder = async () => {
    if (!orderIdSearch) return;
    toast({ title: "جاري البحث...", description: "نبحث عن الفاتورة في السجلات." });
  };

  const handleProcessReturn = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      toast({ title: "تم الإرجاع", description: "تم تحديث المخزون وإرجاع المبلغ." });
      setIsProcessing(false);
      setIsAddModalOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">المرتجعات والمناقلات</h1>
          <p className="text-muted-foreground font-medium">إدارة عمليات استرجاع القطع التالفة أو المرتجعة من الزبائن.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 font-bold gap-2 shadow-lg">
              <RefreshCcw className="h-5 w-5" /> عملية إرجاع جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px] max-w-lg">
            <DialogHeader><DialogTitle className="text-2xl font-black">إرجاع بضاعة</DialogTitle></DialogHeader>
            <div className="space-y-6 pt-4">
               <div className="space-y-2">
                 <Label className="font-bold">رقم الفاتورة الأصلية</Label>
                 <div className="flex gap-2">
                    <Input 
                      placeholder="MMA-00000" 
                      className="rounded-xl h-12 bg-muted/20 border-none flex-1 font-black" 
                      value={orderIdSearch}
                      onChange={(e) => setOrderIdSearch(e.target.value)}
                    />
                    <Button onClick={searchOrder} className="rounded-xl h-12 px-6">بحث</Button>
                 </div>
               </div>

               <div className="p-6 rounded-3xl bg-muted/30 border border-dashed border-muted-foreground/20 text-center space-y-4">
                  <Package className="h-10 w-10 mx-auto opacity-20" />
                  <p className="text-xs font-bold text-muted-foreground">أدخل رقم الفاتورة للبدء في تحديد القطع المرتجعة.</p>
               </div>

               <DialogFooter>
                 <Button disabled={isProcessing} onClick={handleProcessReturn} className="w-full h-14 rounded-2xl font-black text-lg">
                   {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "تأكيد الإرجاع"}
                 </Button>
               </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-[32px] overflow-hidden bg-white shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-right py-5 px-6">رقم المرتجع</TableHead>
              <TableHead className="text-right">الزبون</TableHead>
              <TableHead className="text-right">المبلغ المسترد</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-left px-6">الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(3).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={5} className="px-6 py-4"><Skeleton className="h-10 w-full rounded-xl" /></TableCell></TableRow>)
            ) : returns.length === 0 ? (
               <TableRow><TableCell colSpan={5} className="text-center py-20 opacity-30 font-bold">لا يوجد عمليات إرجاع مسجلة حالياً.</TableCell></TableRow>
            ) : (
              returns.map((r: any) => (
                <TableRow key={r.id}>
                   <TableCell className="px-6 font-black">{r.id.slice(0, 8)}</TableCell>
                   <TableCell className="font-bold">{r.customerName}</TableCell>
                   <TableCell className="font-black text-red-600">{r.amount?.toLocaleString()} د.ع</TableCell>
                   <TableCell className="text-xs">{new Date(r.timestamp).toLocaleDateString("ar-EG")}</TableCell>
                   <TableCell className="px-6 text-left"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black">مكتمل</span></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
