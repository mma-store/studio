
'use client';

import { useState, useMemo, useRef, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Trash2, 
  Save, 
  Loader2,
  Barcode,
  UserPlus,
  ArrowRight,
  Package,
  AlertCircle,
  TrendingUp,
  X,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, doc, writeBatch, increment, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function NewPurchaseInvoicePage() {
  const db = useFirestore();
  const router = useRouter();
  const { profile } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");

  // Dialogs
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [priceChangeDialog, setPriceChangeDialog] = useState<{ open: boolean; product: any; newCost: number } | null>(null);

  const suppliersQuery = useMemo(() => query(collection(db, 'suppliers'), orderBy('name')), [db]);
  const productsQuery = useMemo(() => query(collection(db, 'products'), orderBy('name')), [db]);
  
  const { data: suppliers } = useCollection(suppliersQuery);
  const { data: products } = useCollection(productsQuery);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter((p: any) => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.barcode?.includes(searchTerm)
    ).slice(0, 10);
  }, [products, searchTerm]);

  const total = useMemo(() => cart.reduce((acc, item) => acc + (item.cost * item.quantity), 0), [cart]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      
      const item = {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        cost: product.purchasePrice || 0,
        originalCost: product.purchasePrice || 0,
        retailPrice: product.retailPrice || 0,
        wholesalePrice: product.wholesalePrice || 0,
        quantity: 1
      };
      
      return [...prev, item];
    });
    setSearchTerm("");
  };

  const updateItem = (id: string, updates: any) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        // Detect cost change
        if (updates.cost !== undefined && updates.cost !== i.originalCost && updates.cost > 0) {
           setPriceChangeDialog({ open: true, product: i, newCost: updates.cost });
        }
        return { ...i, ...updates };
      }
      return i;
    }));
  };

  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  const handleSaveInvoice = async () => {
    if (cart.length === 0) return;
    if (!selectedSupplierId) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى اختيار المورد." });
      return;
    }

    setIsSaving(true);
    const batch = writeBatch(db);
    const invoiceNumber = `PUR-${Date.now().toString().slice(-6)}`;
    const supplier = suppliers.find((s: any) => s.id === selectedSupplierId);
    const unpaidAmount = total - paidAmount;

    try {
      const invoiceRef = doc(collection(db, "purchases"));
      const invoiceData = {
        invoiceNumber,
        supplierId: selectedSupplierId,
        supplierName: supplier?.name || "غير معروف",
        items: cart,
        total,
        paidAmount,
        unpaidAmount,
        notes,
        timestamp: Date.now(),
        employeeId: profile?.uid,
        employeeName: profile?.displayName || "مدير",
      };

      batch.set(invoiceRef, invoiceData);

      // Update Inventory & Product Prices
      cart.forEach(item => {
        const productRef = doc(db, "products", item.id);
        batch.update(productRef, {
          stock: increment(item.quantity),
          purchasePrice: item.cost,
          retailPrice: item.retailPrice,
          wholesalePrice: item.wholesalePrice,
          lastPurchasePrice: item.cost,
          lastPurchaseDate: Date.now()
        });
      });

      // Update Supplier Balance
      if (unpaidAmount !== 0) {
        const supplierRef = doc(db, "suppliers", selectedSupplierId);
        batch.update(supplierRef, { balance: increment(unpaidAmount) });
        
        // Register Ledger Transaction
        batch.set(doc(collection(db, "financialTransactions")), {
          userId: selectedSupplierId,
          type: 'purchase',
          amount: unpaidAmount,
          referenceId: invoiceRef.id,
          description: `فاتورة شراء رقم ${invoiceNumber}`,
          timestamp: Date.now()
        });
      }

      // If there's a payment, register in cash shifts (if needed) or just audit
      if (paidAmount > 0) {
        batch.set(doc(collection(db, "expenses")), {
          category: "مشتريات بضاعة",
          amount: paidAmount,
          notes: `دفعة لفاتورة شراء ${invoiceNumber}`,
          employeeName: profile?.displayName || "مدير",
          timestamp: Date.now()
        });
      }

      await batch.commit();
      toast({ title: "تم الحفظ", description: "تم استلام البضاعة وتحديث المخزون بنجاح." });
      router.push(`/admin/print/purchase/${invoiceRef.id}?size=A4`);
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ الفاتورة." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-xl bg-white shadow-sm" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black">فاتورة شراء جديدة</h1>
            <p className="text-muted-foreground font-medium">تجهيز بضاعة وتحديث أرصدة الموردين.</p>
          </div>
        </div>
        <Button 
          onClick={handleSaveInvoice} 
          disabled={isSaving || cart.length === 0} 
          className="rounded-xl h-12 px-10 font-black shadow-xl shadow-primary/20 gap-2"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          تأكيد واستلام البضاعة
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Item Search */}
          <Card className="rounded-[32px] border-none shadow-sm overflow-visible">
            <CardContent className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <Input 
                  placeholder="ابحث عن بضاعة بالاسم أو الباركود..." 
                  className="h-16 rounded-2xl pr-14 border-none bg-muted/30 text-xl font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border z-50 overflow-hidden">
                    {filteredProducts.length > 0 ? (
                      <div className="divide-y max-h-[300px] overflow-y-auto">
                        {filteredProducts.map((p: any) => (
                          <button key={p.id} onClick={() => addToCart(p)} className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors text-right">
                             <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center font-black">P</div>
                                <div><p className="font-black text-sm">{p.name}</p><p className="text-[10px] text-muted-foreground font-bold">{p.barcode}</p></div>
                             </div>
                             <div className="text-left">
                                <p className="font-black text-primary">{p.purchasePrice?.toLocaleString()} د.ع</p>
                                <p className="text-[10px] font-bold text-muted-foreground">متوفر: {p.stock} قطعة</p>
                             </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center space-y-4">
                         <AlertCircle className="h-12 w-12 mx-auto text-orange-500 opacity-20" />
                         <p className="font-bold text-muted-foreground">هذا الصنف غير موجود في المخزن.</p>
                         <Button variant="outline" className="rounded-full font-black px-8" onClick={() => setIsNewProductOpen(true)}>إضافة صنف جديد كلياً</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card className="rounded-[32px] border-none shadow-sm overflow-hidden min-h-[400px]">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-right py-4 px-6 font-black text-xs uppercase">المنتج</TableHead>
                  <TableHead className="text-right font-black text-xs uppercase">الكمية</TableHead>
                  <TableHead className="text-right font-black text-xs uppercase">سعر التكلفة</TableHead>
                  <TableHead className="text-right font-black text-xs uppercase">الإجمالي</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                       <div className="opacity-20 flex flex-col items-center gap-2">
                          <Package className="h-12 w-12" />
                          <p className="font-black">الفاتورة فارغة</p>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : cart.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-muted/5">
                    <TableCell className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className="font-black text-sm">{item.name}</span>
                          <span className="text-[10px] text-muted-foreground font-bold">{item.barcode}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => updateItem(item.id, { quantity: Math.max(1, Number(e.target.value)) })}
                        className="w-20 h-10 rounded-xl bg-muted/30 border-none font-black text-center" 
                       />
                    </TableCell>
                    <TableCell>
                       <Input 
                        type="number" 
                        value={item.cost} 
                        onChange={(e) => updateItem(item.id, { cost: Number(e.target.value) })}
                        className={cn(
                          "w-28 h-10 rounded-xl bg-muted/30 border-none font-black text-center",
                          item.cost !== item.originalCost && "text-orange-600 ring-2 ring-orange-100"
                        )} 
                       />
                    </TableCell>
                    <TableCell className="font-black text-sm">{(item.cost * item.quantity).toLocaleString()} د.ع</TableCell>
                    <TableCell className="text-left px-6">
                       <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[32px] border-none shadow-sm">
             <CardHeader className="bg-primary/5 p-6 border-b border-primary/10">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" /> تفاصيل التجهيز
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                   <Label className="font-black text-xs uppercase tracking-widest opacity-60">المورد</Label>
                   <div className="flex gap-2">
                      <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                         <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-black text-lg">
                            <SelectValue placeholder="اختر المورد" />
                         </SelectTrigger>
                         <SelectContent className="rounded-2xl p-2">
                            {suppliers?.map((s: any) => (
                               <SelectItem key={s.id} value={s.id} className="rounded-xl font-bold">
                                  {s.name} (دينه: {s.balance?.toLocaleString()} د.ع)
                               </SelectItem>
                            ))}
                         </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-2" onClick={() => setIsAddSupplierOpen(true)}>
                         <UserPlus className="h-6 w-6" />
                      </Button>
                   </div>
                </div>

                <div className="space-y-2">
                   <Label className="font-black text-xs uppercase tracking-widest opacity-60">المبلغ المدفوع (نقد)</Label>
                   <Input 
                    type="number" 
                    value={paidAmount} 
                    onChange={(e) => setPaidAmount(Number(e.target.value))} 
                    className="h-14 rounded-2xl bg-muted/30 border-none font-black text-2xl text-center text-primary" 
                   />
                </div>

                <div className="space-y-2">
                   <Label className="font-black text-xs uppercase tracking-widest opacity-60">ملاحظات الفاتورة</Label>
                   <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="مثلاً: بضاعة صيفية، عرض خاص..." className="h-14 rounded-2xl bg-muted/30 border-none font-bold" />
                </div>
             </CardContent>
          </Card>

          <Card className="rounded-[40px] border-none shadow-xl bg-slate-900 text-white p-8 space-y-6">
             <div className="space-y-4">
                <div className="flex justify-between items-center opacity-60 font-bold text-xs uppercase tracking-widest">
                   <span>إجمالي البضاعة</span>
                   <span>{total.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between items-center text-primary font-black">
                   <span className="text-sm">المسدد الآن:</span>
                   <span className="text-xl">-{paidAmount.toLocaleString()} د.ع</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center">
                   <span className="font-black text-lg">المتبقي (دين):</span>
                   <span className="font-black text-4xl">{(total - paidAmount).toLocaleString()}</span>
                </div>
             </div>
             <p className="text-[10px] text-white/40 font-bold leading-relaxed">
                * عند حفظ الفاتورة، سيتم زيادة المخزون تلقائياً وإضافة المبلغ المتبقي كذمة مالية للمورد المختار.
             </p>
          </Card>
        </div>
      </div>

      {/* Supplier Change Dialog */}
      <Dialog open={!!priceChangeDialog} onOpenChange={() => setPriceChangeDialog(null)}>
        <DialogContent className="rounded-[32px] max-w-md p-0 overflow-hidden border-none shadow-2xl">
           <DialogHeader className="p-8 bg-orange-600 text-white space-y-2">
              <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-2"><TrendingUp className="h-6 w-6" /></div>
              <DialogTitle className="text-2xl font-black">تغير في سعر التكلفة!</DialogTitle>
              <DialogDescription className="text-white/80 font-bold">لقد قمت بإدخال سعر شراء يختلف عن المسجل مسبقاً.</DialogDescription>
           </DialogHeader>
           <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-muted/50 p-4 rounded-2xl space-y-1">
                    <p className="text-[10px] font-black opacity-50 uppercase">التكلفة القديمة</p>
                    <p className="text-lg font-black">{priceChangeDialog?.product?.originalCost?.toLocaleString()} د.ع</p>
                 </div>
                 <div className="bg-orange-50 p-4 rounded-2xl space-y-1 border border-orange-100 text-orange-700">
                    <p className="text-[10px] font-black opacity-50 uppercase">التكلفة الجديدة</p>
                    <p className="text-lg font-black">{priceChangeDialog?.newCost?.toLocaleString()} د.ع</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="font-black text-sm">تعديل أسعار البيع المقترحة:</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <Label className="font-bold text-xs opacity-60">سعر المفرد</Label>
                       <Input 
                        type="number" 
                        value={priceChangeDialog?.product?.retailPrice} 
                        onChange={(e) => updateItem(priceChangeDialog!.product.id, { retailPrice: Number(e.target.value) })}
                        className="h-12 rounded-xl bg-muted/20 border-none font-black text-center" 
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="font-bold text-xs opacity-60">سعر الجملة</Label>
                       <Input 
                        type="number" 
                        value={priceChangeDialog?.product?.wholesalePrice} 
                        onChange={(e) => updateItem(priceChangeDialog!.product.id, { wholesalePrice: Number(e.target.value) })}
                        className="h-12 rounded-xl bg-muted/20 border-none font-black text-center" 
                       />
                    </div>
                 </div>
              </div>

              <div className="grid gap-3">
                 <Button className="h-14 rounded-2xl font-black text-lg shadow-lg" onClick={() => setPriceChangeDialog(null)}>اعتماد الأسعار الجديدة</Button>
                 <Button variant="ghost" className="font-bold text-muted-foreground" onClick={() => setPriceChangeDialog(null)}>الإبقاء على أسعار البيع الحالية</Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>

      {/* New Supplier Dialog */}
      <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
        <DialogContent className="rounded-[32px] max-w-sm">
           <DialogHeader><DialogTitle className="text-2xl font-black">مورد جديد</DialogTitle></DialogHeader>
           <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = fd.get('name') as string;
              const res = await addDoc(collection(db, 'suppliers'), {
                name,
                phone: fd.get('phone'),
                address: fd.get('address'),
                balance: 0,
                createdAt: Date.now()
              });
              setSelectedSupplierId(res.id);
              setIsAddSupplierOpen(false);
              toast({ title: "تمت الإضافة", description: `تم تسجيل المورد ${name} بنجاح.` });
           }} className="space-y-4 pt-4">
              <div className="space-y-2"><Label className="font-bold">اسم الشركة / المورد</Label><Input name="name" required className="h-12 rounded-xl bg-muted/20 border-none" /></div>
              <div className="space-y-2"><Label className="font-bold">رقم الهاتف</Label><Input name="phone" className="h-12 rounded-xl bg-muted/20 border-none text-left" dir="ltr" /></div>
              <div className="space-y-2"><Label className="font-bold">العنوان</Label><Input name="address" className="h-12 rounded-xl bg-muted/20 border-none" /></div>
              <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-lg">حفظ المورد</Button>
           </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
