
'use client';

import { useState, useMemo } from "react";
import { 
  Search, 
  Barcode, 
  Trash2, 
  Minus, 
  Plus, 
  X, 
  ShoppingCart,
  User,
  ChevronDown,
  Loader2,
  Package,
  Zap,
  Printer,
  CreditCard,
  Banknote,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, writeBatch, doc, increment } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// مكون السلة المستقل لمنع رندر لانهائي
interface CartViewProps {
  cart: any[];
  selectedCustomer: any;
  setSelectedCustomer: (c: any) => void;
  updateQuantity: (id: string, d: number) => void;
  removeFromCart: (id: string) => void;
  total: number;
  allUsers: any[];
  onCheckout: () => void;
}

function CartView({ cart, selectedCustomer, setSelectedCustomer, updateQuantity, removeFromCart, total, allUsers, onCheckout }: CartViewProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b space-y-3">
        <h2 className="text-lg font-black flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" /> الفاتورة
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full h-11 rounded-xl justify-between border-primary/20 bg-primary/5 px-3">
              <div className="flex items-center gap-2 truncate">
                <User className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold truncate">{selectedCustomer.name}</span>
              </div>
              <ChevronDown className="h-3 w-3 opacity-40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 rounded-xl" align="start">
            <DropdownMenuItem onClick={() => setSelectedCustomer({ name: "زبون نقدي", type: 'retail' })}>زبون نقدي عام</DropdownMenuItem>
            {allUsers?.map((u: any) => (
              <DropdownMenuItem 
                key={u.id} 
                onClick={() => setSelectedCustomer({ id: u.id, name: u.displayName, type: u.role === 'wholesale_customer' ? 'wholesale' : 'retail' })}
              >
                {u.displayName} ({u.role === 'wholesale_customer' ? 'جملة' : 'مفرد'})
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/5">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <ShoppingCart className="h-12 w-12 mb-2" />
            <p className="text-xs font-black">السلة فارغة</p>
          </div>
        ) : cart.map((item) => (
          <div key={item.id} className="flex gap-2 p-2 rounded-xl bg-white dark:bg-card border shadow-sm">
            <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border bg-muted">
              {item.images?.[0] && <Image src={item.images[0]} alt="" fill className="object-cover" />}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="text-[11px] font-black truncate">{item.name}</h4>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] font-black text-primary">
                  {(selectedCustomer.type === 'wholesale' ? (item.wholesalePrice || item.retailPrice) : item.retailPrice).toLocaleString()} د.ع
                </span>
                <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-0.5">
                  <button onClick={() => updateQuantity(item.id, -1)} className="h-5 w-5 bg-white rounded shadow-sm flex items-center justify-center text-foreground"><Minus className="h-3 w-3" /></button>
                  <span className="text-[10px] font-black w-3 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="h-5 w-5 bg-primary text-white rounded shadow-sm flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
            </div>
            <button onClick={() => removeFromCart(item.id)} className="text-destructive/50 hover:text-destructive p-1"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white dark:bg-card border-t shadow-lg space-y-3">
        <div className="flex justify-between font-black text-primary text-xl">
          <span>الإجمالي:</span>
          <span>{total.toLocaleString()} د.ع</span>
        </div>
        <Button 
          disabled={cart.length === 0} 
          className="w-full h-12 rounded-xl text-sm font-black gap-2 shadow-lg"
          onClick={onCheckout}
        >
          <Zap className="h-4 w-4" /> إتمام العملية
        </Button>
      </div>
    </div>
  );
}

export default function POSPage() {
  const db = useFirestore();
  const { profile } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; type: 'retail' | 'wholesale'; id?: string }>({ name: "زبون نقدي", type: 'retail' });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'partial'>('cash');

  const productsQuery = useMemo(() => query(collection(db, 'products'), orderBy('name')), [db]);
  const { data: products, loading } = useCollection(productsQuery);
  
  const categoriesQuery = useMemo(() => query(collection(db, 'categories'), orderBy('name')), [db]);
  const { data: categories } = useCollection(categoriesQuery);

  const { data: allUsers } = useCollection(query(collection(db, 'users'), orderBy('displayName')));

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let filtered = products;
    if (selectedCategory) filtered = filtered.filter((p: any) => p.category === selectedCategory);
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((p: any) => 
        (p.name?.toLowerCase() || "").includes(lowerQuery) || 
        (p.barcode || "").includes(lowerQuery)
      );
    }
    return filtered;
  }, [products, searchQuery, selectedCategory]);

  const total = useMemo(() => {
    return cart.reduce((acc, item) => {
      const retail = item.retailPrice || 0;
      const wholesale = item.wholesalePrice || retail;
      const price = selectedCustomer.type === 'wholesale' ? wholesale : retail;
      return acc + (price * (item.quantity || 1));
    }, 0);
  }, [cart, selectedCustomer.type]);

  const addToCart = (product: any) => {
    if ((product.stock || 0) <= 0) {
      toast({ variant: "destructive", title: "نفذ المخزون", description: "هذا المنتج غير متوفر." });
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast({ variant: "destructive", title: "تنبيه", description: "وصلت للحد الأقصى للمخزون." });
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (delta > 0 && newQty > item.stock) {
          toast({ variant: "destructive", title: "تنبيه", description: "الكمية المطلوبة غير متوفرة بالكامل." });
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.id !== productId));
  };

  const handleOpenCheckout = () => {
    setPaidAmount(total);
    setPaymentMethod('cash');
    setIsCheckoutOpen(true);
    setIsCartSheetOpen(false);
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    if (paymentMethod !== 'cash' && selectedCustomer.name === "زبون نقدي") {
      toast({ variant: "destructive", title: "خطأ", description: "يجب اختيار عميل مسجل للبيع بالآجل." });
      return;
    }

    setProcessingOrder(true);
    const batch = writeBatch(db);
    const orderNumber = `POS-${Date.now().toString().slice(-6)}`;
    const unpaidAmount = total - paidAmount;

    const orderData = {
      orderNumber,
      userId: selectedCustomer.id || null,
      customerName: selectedCustomer.name,
      customerType: selectedCustomer.type,
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: selectedCustomer.type === 'wholesale' ? (item.wholesalePrice || item.retailPrice) : item.retailPrice,
        quantity: item.quantity
      })),
      total,
      paidAmount,
      unpaidAmount,
      createdAt: Date.now(),
      status: 'delivered',
      source: 'pos',
      paymentMethod
    };

    const newOrderRef = doc(collection(db, "orders"));
    batch.set(newOrderRef, orderData);

    cart.forEach(item => {
      batch.update(doc(db, "products", item.id), { stock: increment(-item.quantity) });
    });

    if (selectedCustomer.id && unpaidAmount > 0) {
      batch.update(doc(db, "users", selectedCustomer.id), {
        currentBalance: increment(unpaidAmount),
        updatedAt: Date.now()
      });
      batch.set(doc(collection(db, "financialTransactions")), {
        userId: selectedCustomer.id,
        type: 'sale',
        amount: unpaidAmount,
        referenceId: newOrderRef.id,
        description: `فاتورة رقم ${orderNumber}`,
        timestamp: Date.now()
      });
    }

    batch.commit()
      .then(() => {
        toast({ title: "تم بنجاح", description: `تم حفظ الطلب برقم ${orderNumber}` });
        setCart([]);
        setIsCheckoutOpen(false);
      })
      .catch((err) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: "orders/pos", operation: "write" })))
      .finally(() => setProcessingOrder(false));
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background -m-4 md:-m-8">
      {/* Products Grid Section */}
      <div className="flex-1 flex flex-col p-3 md:p-4 lg:p-6 overflow-y-auto">
        <div className="flex gap-2 mb-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="البحث بالاسم أو الباركود..." 
              className="h-10 rounded-xl pr-9 text-sm shadow-sm border-none bg-white dark:bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-10 w-10 shrink-0 rounded-xl border-none shadow-sm bg-white dark:bg-card p-0">
            <Barcode className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 shrink-0 pb-1">
           <Button 
            variant={selectedCategory === null ? "default" : "outline"} 
            size="sm"
            className="rounded-full font-black px-5"
            onClick={() => setSelectedCategory(null)}
           >
             الكل
           </Button>
           {categories?.map((cat: any) => (
             <Button 
              key={cat.id} 
              variant={selectedCategory === cat.name ? "default" : "outline"} 
              size="sm"
              className="rounded-full font-bold px-5 bg-white dark:bg-card border-none shadow-sm"
              onClick={() => setSelectedCategory(cat.name)}
             >
               {cat.name}
             </Button>
           ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
           {loading ? (
             Array(10).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)
           ) : filteredProducts.length > 0 ? (
             filteredProducts.map((p: any) => (
             <Card 
              key={p.id} 
              className={cn(
                "group cursor-pointer overflow-hidden rounded-2xl border-none shadow-sm hover:shadow-md transition-all active:scale-95 bg-white dark:bg-card",
                p.stock <= 0 && "opacity-50 grayscale"
              )}
              onClick={() => addToCart(p)}
             >
               <div className="relative aspect-square w-full bg-muted">
                  {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}
                  <div className="absolute top-1.5 left-1.5">
                     <Badge className={cn("rounded-full text-[9px] font-black px-1.5 h-4", p.stock > 5 ? "bg-green-500" : "bg-red-500")}>
                        {p.stock}
                     </Badge>
                  </div>
               </div>
               <CardContent className="p-2 space-y-0.5">
                  <h3 className="font-bold text-[10px] line-clamp-1">{p.name}</h3>
                  <p className="text-primary font-black text-sm">{p.retailPrice?.toLocaleString()} د.ع</p>
               </CardContent>
             </Card>
           ))) : (
             <div className="col-span-full h-48 flex flex-col items-center justify-center opacity-20">
                <Package className="h-10 w-10 mb-2" />
                <p className="text-sm font-black">لا توجد منتجات</p>
             </div>
           )}
        </div>
      </div>

      {/* Cart Desktop Sidebar */}
      <div className="hidden lg:flex w-[320px] xl:w-[380px] flex-col bg-white dark:bg-card border-r shadow-xl z-20">
        <CartView 
          cart={cart}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          total={total}
          allUsers={allUsers || []}
          onCheckout={handleOpenCheckout}
        />
      </div>

      {/* Mobile Floating Cart Summary */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white dark:bg-card border-t shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40">
        <div className="flex items-center justify-between gap-3">
          <Sheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="flex-1 h-11 rounded-xl bg-primary/5 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-lg">{cart.length}</span>}
                  </div>
                  <span className="text-xs font-black">عرض الفاتورة</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-black text-primary">{total.toLocaleString()}</span>
                  <ChevronUp className="h-4 w-4 opacity-30" />
                </div>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-[32px] p-0 overflow-hidden border-none">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-lg font-black text-right">مراجعة الفاتورة</SheetTitle>
              </SheetHeader>
              <CartView 
                cart={cart}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                total={total}
                allUsers={allUsers || []}
                onCheckout={handleOpenCheckout}
              />
            </SheetContent>
          </Sheet>
          <Button 
            disabled={cart.length === 0} 
            className="h-11 px-6 rounded-xl font-black shadow-lg"
            onClick={handleOpenCheckout}
          >
            دفع
          </Button>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="rounded-[28px] max-w-lg p-0 overflow-hidden border-none shadow-2xl">
           <DialogHeader className="p-6 border-b bg-primary text-white flex flex-row items-center justify-between space-y-0">
              <DialogTitle className="text-xl font-black">تأكيد الدفع</DialogTitle>
              <button onClick={() => setIsCheckoutOpen(false)} aria-label="إغلاق"><X className="h-6 w-6" /></button>
           </DialogHeader>
           <DialogDescription className="sr-only">اختر طريقة الدفع ومراجعة إجمالي الفاتورة والمبلغ المتبقي.</DialogDescription>
           
           <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-3">
                 {[
                   { id: 'cash', label: 'نقدي كامل', icon: Banknote },
                   { id: 'credit', label: 'بالآجل', icon: CreditCard },
                   { id: 'partial', label: 'واصل جزئي', icon: Plus }
                 ].map((m) => (
                   <button 
                    key={m.id}
                    onClick={() => { 
                      setPaymentMethod(m.id as any); 
                      if(m.id !== 'partial') setPaidAmount(m.id === 'cash' ? total : 0); 
                    }}
                    className={cn("p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2", paymentMethod === m.id ? "border-primary bg-primary/5 text-primary" : "border-muted opacity-60")}
                   >
                      <m.icon className="h-6 w-6" />
                      <span className="font-black text-[10px]">{m.label}</span>
                   </button>
                 ))}
              </div>

              {paymentMethod === 'partial' && (
                <div className="space-y-2">
                   <Label className="font-black text-sm">المبلغ الواصل</Label>
                   <Input 
                    type="number" 
                    value={paidAmount} 
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="h-12 rounded-xl text-xl font-black text-center bg-muted/20 border-none"
                   />
                </div>
              )}

              <div className="bg-muted/30 p-4 rounded-2xl space-y-2">
                 <div className="flex justify-between text-xs font-bold"><span>المجموع:</span><span>{total.toLocaleString()} د.ع</span></div>
                 <div className="flex justify-between text-sm font-black text-green-600"><span>الواصل:</span><span>{paidAmount.toLocaleString()} د.ع</span></div>
                 <div className="h-px bg-muted" />
                 <div className="flex justify-between text-sm font-black text-red-600"><span>المتبقي:</span><span>{(total - paidAmount).toLocaleString()} د.ع</span></div>
              </div>

              <div className="grid gap-3">
                 <Button disabled={processingOrder} className="h-14 rounded-xl text-base font-black gap-2" onClick={handleCompleteSale}>
                    {processingOrder ? <Loader2 className="h-5 w-5 animate-spin" /> : <Printer className="h-5 w-5" />} تأكيد وحفظ
                 </Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
