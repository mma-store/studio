'use client';

import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Search, 
  Barcode, 
  UserPlus, 
  Trash2, 
  Minus, 
  Plus, 
  CreditCard, 
  Printer, 
  X, 
  ShoppingCart,
  User,
  Tags,
  Zap,
  ChevronDown,
  Loader2,
  Package
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
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, addDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function POSPage() {
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; type: 'retail' | 'wholesale'; id?: string }>({ name: "زبون نقدي", type: 'retail' });
  const [discount, setDiscount] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const productsQuery = useMemo(() => query(collection(db, 'products'), orderBy('name')), [db]);
  const { data: products, loading } = useCollection(productsQuery);
  
  const categoriesQuery = useMemo(() => collection(db, 'categories'), [db]);
  const { data: categories } = useCollection(categoriesQuery);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery) return products;
    const lowerQuery = searchQuery.toLowerCase();
    return products.filter((p: any) => 
      (p.name?.toLowerCase() || "").includes(lowerQuery) || 
      (p.barcode || "").includes(lowerQuery)
    );
  }, [products, searchQuery]);

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const retail = item.retailPrice || 0;
      const wholesale = item.wholesalePrice || retail;
      const price = selectedCustomer.type === 'wholesale' ? wholesale : retail;
      return acc + (price * (item.quantity || 1));
    }, 0);
  }, [cart, selectedCustomer.type]);
  
  const total = Math.max(0, subtotal - discount);

  const addToCart = (product: any) => {
    if (!product) return;
    if ((product.stock || 0) <= 0) {
      toast({ variant: "destructive", title: "نفذ المخزون", description: "لا يمكن إضافة منتج غير متوفر حالياً." });
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= (product.stock || 0)) {
           toast({ variant: "destructive", title: "تجاوز المخزون", description: "لا يمكن إضافة كمية أكبر من المتوفر." });
           return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (delta > 0 && newQty > (item.stock || 0)) {
          toast({ variant: "destructive", title: "تجاوز المخزون", description: "وصلت للحد الأقصى للمخزون." });
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setProcessingOrder(true);
    try {
      const orderData = {
        orderNumber: `POS-${Date.now().toString().slice(-6)}`,
        customerName: selectedCustomer.name,
        customerType: selectedCustomer.type,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name || "منتج غير مسمى",
          price: selectedCustomer.type === 'wholesale' ? (item.wholesalePrice || item.retailPrice || 0) : (item.retailPrice || 0),
          quantity: item.quantity
        })),
        subtotal,
        discount,
        total,
        paymentMethod: 'cash',
        createdAt: Date.now(),
        status: 'delivered',
        source: 'pos'
      };

      await addDoc(collection(db, "orders"), orderData);
      toast({ title: "تم بنجاح", description: "تم تسجيل العملية وطباعة الفاتورة." });
      setCart([]);
      setDiscount(0);
      setIsCheckoutOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تسجيل العملية في النظام." });
    } finally {
      setProcessingOrder(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden gap-0 bg-background -m-4 md:-m-8">
      {/* Products Section */}
      <div className="flex-1 flex flex-col min-w-0 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              ref={searchInputRef}
              placeholder="البحث بالاسم أو الباركود (F2)..." 
              className="h-12 md:h-14 rounded-2xl pr-12 text-base md:text-lg shadow-sm border-none bg-white dark:bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 w-full sm:w-14 md:h-14 rounded-2xl border-none shadow-sm bg-white dark:bg-card flex items-center justify-center">
            <Barcode className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2 shrink-0">
           <Button variant="default" className="rounded-full font-black px-6 md:px-8">الكل</Button>
           {categories?.map((cat: any) => (
             <Button key={cat.id} variant="outline" className="rounded-full font-bold px-6 md:px-8 bg-white dark:bg-card border-none shadow-sm shrink-0">{cat.name}</Button>
           ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-10">
           {loading ? (
             Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-48 md:h-56 rounded-[28px]" />)
           ) : filteredProducts.length > 0 ? (
             filteredProducts.map((p: any) => (
             <Card 
              key={p.id} 
              className={cn(
                "group cursor-pointer overflow-hidden rounded-[24px] md:rounded-[32px] border-none shadow-sm hover:shadow-md transition-all active:scale-95 bg-white dark:bg-card",
                (p.stock || 0) <= 0 && "opacity-60 grayscale"
              )}
              onClick={() => addToCart(p)}
             >
               <div className="relative aspect-square w-full overflow-hidden bg-muted/50">
                  <Image 
                    src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/300/300`} 
                    alt={p.name || "Product"} 
                    fill 
                    className="object-cover" 
                  />
                  <div className="absolute top-2 left-2">
                     <Badge variant={(p.stock || 0) > 5 ? "secondary" : "destructive"} className="rounded-full text-[8px] md:text-[10px] px-2 font-black">
                        {(p.stock || 0) > 0 ? `${p.stock} قطعة` : 'نفذت'}
                     </Badge>
                  </div>
               </div>
               <CardContent className="p-3 md:p-4 space-y-1">
                  <h3 className="font-bold text-xs md:text-sm leading-tight line-clamp-1">{p.name || "منتج"}</h3>
                  <div className="flex items-center justify-between">
                     <p className="text-primary font-black text-sm md:text-lg">{(p.retailPrice || 0).toLocaleString()} <span className="text-[10px]">د.ع</span></p>
                     <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Plus className="h-4 w-4 md:h-5 md:w-5" />
                     </div>
                  </div>
               </CardContent>
             </Card>
           ))) : (
             <div className="col-span-full h-48 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <Package className="h-12 w-12 mb-2" />
                <p className="font-bold text-sm">لا توجد منتجات</p>
             </div>
           )}
        </div>
      </div>

      {/* Cart Section - Collapsible in Mobile? No, just stack for now with height limit */}
      <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col bg-white dark:bg-card border-t lg:border-t-0 lg:border-r shadow-2xl z-20 h-full max-h-[60vh] lg:max-h-full">
        <div className="p-4 md:p-6 border-b shrink-0">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-black flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                الفاتورة
              </h2>
              <Button variant="ghost" size="icon" className="rounded-full text-destructive" onClick={() => setCart([])}>
                <Trash2 className="h-5 w-5" />
              </Button>
           </div>
           
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="w-full h-14 md:h-16 rounded-2xl justify-between border-2 border-primary/10 bg-primary/5 font-bold px-4">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
                          <User className="h-4 w-4 md:h-5 md:w-5" />
                       </div>
                       <div className="text-right">
                          <p className="text-[8px] md:text-[10px] uppercase font-black opacity-60">العميل</p>
                          <p className="text-sm md:text-base">{selectedCustomer.name}</p>
                       </div>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-40" />
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 md:w-80 rounded-[24px] p-2" align="end">
                 <DropdownMenuItem className="rounded-xl gap-3 h-12 md:h-14 font-bold cursor-pointer" onClick={() => setSelectedCustomer({ name: "زبون نقدي", type: 'retail' })}>
                    زبون نقدي (مفرد)
                 </DropdownMenuItem>
                 <DropdownMenuItem className="rounded-xl gap-3 h-12 md:h-14 font-bold cursor-pointer text-primary" onClick={() => setSelectedCustomer({ name: "شركة النور للقطع", type: 'wholesale' })}>
                    جملة - شركة النور
                 </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5 no-scrollbar">
           {cart.length > 0 ? (
             cart.map((item) => (
               <div key={item.id} className="flex gap-3 p-3 md:p-4 rounded-2xl bg-white dark:bg-card shadow-sm border border-transparent hover:border-primary/10 transition-all">
                  <div className="relative h-12 w-12 md:h-16 md:w-16 shrink-0 overflow-hidden rounded-xl bg-muted border">
                     <Image src={item.images?.[0] || `https://picsum.photos/seed/${item.id}/150/150`} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                     <h4 className="text-[10px] md:text-xs font-black truncate">{item.name || "منتج"}</h4>
                     <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm font-black text-primary">
                          {(selectedCustomer.type === 'wholesale' ? (item.wholesalePrice || item.retailPrice) : item.retailPrice).toLocaleString()} د.ع
                        </span>
                        <div className="flex items-center gap-2 bg-muted/40 rounded-lg p-1">
                           <button onClick={() => updateQuantity(item.id, -1)} className="h-6 w-6 flex items-center justify-center rounded bg-white shadow-sm"><Minus className="h-3 w-3" /></button>
                           <span className="text-[10px] font-black w-4 text-center">{item.quantity}</span>
                           <button onClick={() => updateQuantity(item.id, 1)} className="h-6 w-6 flex items-center justify-center rounded bg-primary text-white shadow-sm"><Plus className="h-3 w-3" /></button>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
               </div>
             ))
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-20 gap-4">
                <ShoppingCart className="h-16 w-16" />
                <p className="font-black">الفاتورة فارغة</p>
             </div>
           )}
        </div>

        <div className="p-4 md:p-8 bg-white dark:bg-card border-t shadow-lg shrink-0 space-y-4 md:space-y-6">
           <div className="space-y-2 text-sm md:text-base">
              <div className="flex justify-between font-bold">
                 <span className="text-muted-foreground">المجموع:</span>
                 <span>{subtotal.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between font-bold text-destructive">
                 <span>الخصم:</span>
                 <span>-{discount.toLocaleString()} د.ع</span>
              </div>
           </div>
           
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted-foreground uppercase">إجمالي المبلغ:</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl md:text-5xl font-black text-primary tracking-tighter">{total.toLocaleString()}</span>
                <span className="text-sm md:text-xl font-black text-primary">د.ع</span>
              </div>
           </div>

           <Button 
            disabled={cart.length === 0}
            className="w-full h-16 md:h-20 rounded-3xl text-xl md:text-2xl font-black gap-4 shadow-xl active:scale-95"
            onClick={() => setIsCheckoutOpen(true)}
           >
              <Zap className="h-6 w-6 md:h-8 md:w-8" />
              تأكيد البيع
           </Button>
        </div>
      </div>

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white dark:bg-card w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="p-6 md:p-8 border-b bg-primary text-white flex items-center justify-between">
                 <h3 className="text-2xl font-black">إتمام العملية</h3>
                 <button onClick={() => setIsCheckoutOpen(false)}><X className="h-8 w-8" /></button>
              </div>
              <div className="p-6 md:p-8 space-y-6 md:space-y-8">
                 <div className="text-center">
                    <p className="text-xs md:text-sm font-bold opacity-60 uppercase">المبلغ المطلوب استلامه</p>
                    <p className="text-4xl md:text-6xl font-black text-primary mt-2">{total.toLocaleString()} <span className="text-xl">د.ع</span></p>
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    <Button 
                      disabled={processingOrder}
                      className="w-full h-14 md:h-18 rounded-2xl font-black text-lg md:text-xl gap-3" 
                      onClick={handleCompleteSale}
                    >
                       {processingOrder ? <Loader2 className="h-6 w-6 animate-spin" /> : <Printer className="h-6 w-6" />}
                       تأكيد وطباعة الفاتورة
                    </Button>
                    <Button variant="outline" className="w-full h-14 rounded-2xl font-bold" onClick={() => setIsCheckoutOpen(false)}>إلغاء</Button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}