
'use client';

import { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Truck, 
  Package, 
  ShoppingCart, 
  Trash2, 
  Save, 
  Loader2,
  Printer
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
import { collection, query, orderBy, doc, writeBatch, increment, addDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function PurchasesPage() {
  const db = useFirestore();
  const { profile } = useUser();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const suppliersQuery = useMemo(() => query(collection(db, 'suppliers'), orderBy('name')), [db]);
  const { data: suppliers } = useCollection(suppliersQuery);

  const productsQuery = useMemo(() => query(collection(db, 'products')), [db]);
  const { data: products } = useCollection(productsQuery);

  const purchasesQuery = useMemo(() => query(collection(db, 'purchases'), orderBy('timestamp', 'desc')), [db]);
  const { data: purchases, loading } = useCollection(purchasesQuery);

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode?.includes(searchTerm)
  ).slice(0, 5);

  const total = cart.reduce((acc, item) => acc + (item.cost * item.quantity), 0);

  const addItem = (product: any) => {
    if (cart.find(i => i.id === product.id)) return;
    setCart([...cart, { ...product, cost: product.purchasePrice || 0, quantity: 1 }]);
    setSearchTerm("");
  };

  const removeItem = (id: string) => setCart(cart.filter(i => i.id !== id));

  const handleSavePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const supplierId = formData.get('supplierId') as string;
    const supplier = suppliers.find(s => s.id === supplierId);
    const paidAmount = Number(formData.get('paidAmount')) || 0;
    const unpaidAmount = total - paidAmount;

    try {
      const batch = writeBatch(db);
      const invoiceNo = `PUR-${Date.now().toString().slice(-6)}`;
      
      const purchaseRef = doc(collection(db, 'purchases'));
      batch.set(purchaseRef, {
        invoiceNumber: invoiceNo,
        supplierId,
        supplierName: supplier?.name || "غير معروف",
        items: cart,
        total,
        paidAmount,
        unpaidAmount,
        timestamp: Date.now(),
        employeeId: profile?.uid,
        employeeName: profile?.displayName
      });

      // Update Inventory
      cart.forEach(item => {
        const productRef = doc(db, 'products', item.id);
        batch.update(productRef, { 
          stock: increment(item.quantity),
          purchasePrice: item.cost
        });
      });

      // Update Supplier Balance
      if (supplierId && unpaidAmount > 0) {
        const supplierRef = doc(db, 'suppliers', supplierId);
        batch.update(supplierRef, { balance: increment(unpaidAmount) });
        
        // Ledger Entry
        const transactionRef = doc(collection(db, "financialTransactions"));
        batch.set(transactionRef, {
          userId: supplierId,
          type: 'purchase',
          amount: unpaidAmount,
          description: `فاتورة شراء رقم ${invoiceNo}`,
          timestamp: Date.now()
        });
      }

      await batch.commit();
      setIsAddOpen(false);
      setCart([]);
      toast({ title: "تم الحفظ", description: "تمت إضافة المشتريات وتحديث المخزون." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ الفاتورة." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">فواتير الشراء</h1>
          <p className="text-muted-foreground font-medium">تسجيل المشتريات الجديدة وتحديث كميات المخزن.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 font-bold gap-2 shadow-lg">
              <Plus className="h-5 w-5" /> إضافة فاتورة شراء
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px] max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-2xl font-black">شراء جديد (تجهيز مخزن)</DialogTitle></DialogHeader>
            <form onSubmit={handleSavePurchase} className="space-y-6 pt-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label className="font-bold">المورد</Label>
                    <Select name="supplierId" required>
                       <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-none">
                          <SelectValue placeholder="اختر المورد" />
                       </SelectTrigger>
                       <SelectContent className="rounded-2xl">
                          {suppliers.map((s: any) => (
                             <SelectItem key={s.id} value={s.id} className="rounded-xl">{s.name}</SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label className="font-bold">المبلغ المدفوع حالياً</Label>
                    <Input name="paidAmount" type="number" defaultValue="0" className="rounded-xl h-12 bg-muted/20 border-none" />
                 </div>
               </div>

               <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="ابحث عن منتج لإضافته للفاتورة..." 
                    className="h-14 rounded-2xl pr-12 bg-muted/20 border-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border z-50 p-2">
                       {filteredProducts.map(p => (
                         <button key={p.id} type="button" onClick={() => addItem(p)} className="w-full text-right p-3 hover:bg-muted/50 rounded-xl flex items-center justify-between">
                            <span className="font-bold">{p.name}</span>
                            <span className="text-xs opacity-50">{p.barcode}</span>
                         </button>
                       ))}
                    </div>
                  )}
               </div>

               <div className="border rounded-[28px] overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                       <TableRow>
                          <TableHead className="text-right">المنتج</TableHead>
                          <TableHead className="text-right">سعر التكلفة</TableHead>
                          <TableHead className="text-right">الكمية</TableHead>
                          <TableHead className="text-right">الإجمالي</TableHead>
                          <TableHead />
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {cart.map((item, idx) => (
                         <TableRow key={item.id}>
                            <TableCell className="font-bold text-xs">{item.name}</TableCell>
                            <TableCell>
                               <Input 
                                type="number" 
                                value={item.cost} 
                                onChange={(e) => {
                                  const newCart = [...cart];
                                  newCart[idx].cost = Number(e.target.value);
                                  setCart(newCart);
                                }}
                                className="h-9 w-24 bg-muted/30 border-none rounded-lg"
                               />
                            </TableCell>
                            <TableCell>
                               <Input 
                                type="number" 
                                value={item.quantity} 
                                onChange={(e) => {
                                  const newCart = [...cart];
                                  newCart[idx].quantity = Number(e.target.value);
                                  setCart(newCart);
                                }}
                                className="h-9 w-20 bg-muted/30 border-none rounded-lg"
                               />
                            </TableCell>
                            <TableCell className="font-black">{(item.cost * item.quantity).toLocaleString()} د.ع</TableCell>
                            <TableCell>
                               <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(item.id)}>
                                  <Trash2 className="h-4 w-4" />
                               </Button>
                            </TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                  </Table>
               </div>

               <div className="flex justify-between items-center p-6 bg-primary/5 rounded-[28px]">
                  <span className="text-lg font-black">إجمالي الفاتورة:</span>
                  <span className="text-3xl font-black text-primary">{total.toLocaleString()} د.ع</span>
               </div>

               <DialogFooter>
                 <Button type="submit" disabled={isSaving || cart.length === 0} className="w-full h-14 rounded-2xl font-black text-lg">
                   {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} حفظ واستلام المخزون
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
              <TableHead className="text-right py-5 px-6">رقم الفاتورة</TableHead>
              <TableHead className="text-right">المورد</TableHead>
              <TableHead className="text-right">المبلغ الكلي</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-left px-6">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="px-6"><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : purchases.map((p: any) => (
              <TableRow key={p.id} className="hover:bg-muted/5 transition-colors">
                <TableCell className="font-black text-sm px-6">{p.invoiceNumber}</TableCell>
                <TableCell className="font-bold">{p.supplierName}</TableCell>
                <TableCell className="font-black text-primary">{p.total?.toLocaleString()} د.ع</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(p.timestamp).toLocaleDateString("ar-EG")}</TableCell>
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
