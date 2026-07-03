
'use client';

import { useState, useEffect, useMemo, useRef } from "react";
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
  Printer
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
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, writeBatch, doc, increment } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function POSPage() {
  const db = useFirestore();
  const { profile } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; type: 'retail' | 'wholesale'; id?: string }>({ name: "زبون نقدي", type: 'retail' });
  const [discount, setDiscount] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);

  const productsQuery = useMemo(() => query(collection(db, 'products'), orderBy('name')), [db]);
  const { data: products, loading } = useCollection(productsQuery);
  
  const categoriesQuery = useMemo(() => collection(db, 'categories'), [db]);
  const { data: categories } = useCollection(categoriesQuery);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let filtered = products;
    
    if (selectedCategory) {
      filtered = filtered.filter((p: any) => p.category === selectedCategory);
    }
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((p: any) => 
        (p.name?.toLowerCase() || "").includes(lowerQuery) || 
        (p.barcode || "").includes(lowerQuery)
      );
    }
    
    return filtered;
  }, [products, searchQuery, selectedCategory]);

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
        if (delta > 0 && newQty > item.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setProcessingOrder(true);
    const batch = writeBatch(db);
    
    const orderNumber = `POS-${Date.now().toString().slice(-6)}`;
    const orderData = {
      orderNumber,
      customerName: selectedCustomer.name,
      customerType: selectedCustomer.type,
      items: cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: selectedCustomer.type === 'wholesale' ? (item.wholesalePrice || item.retailPrice) : item.retailPrice,
        quantity: item.quantity
      })),
      subtotal,
      discount,
      total,
      createdAt: Date.now(),
      status: 'delivered',
      source: 'pos'
    };

    const newOrderRef = doc(collection(db, "orders"));
    batch.set(newOrderRef, orderData);

    cart.forEach(item => {
      const productRef = doc(db, "products", item.id);
      batch.update(productRef, { 
        stock: increment(-item.quantity),
        updatedAt: Date.now()
      });
    });

    const auditRef = doc(collection(db, "auditLogs"));
    batch.set(auditRef, {
      userId: profile?.uid || "pos",
      userName: profile?.displayName || "نقطة بيع",
      action: "إتمام عملية بيع POS",
      target: orderNumber,
      details: `إجمالي المبلغ: ${total.toLocaleString()} د.ع`,
      timestamp: Date.now()
    });

    batch.commit()
      .then(() => {
        toast({ title: "تم بنجاح", description: "تم تسجيل البيع وتحديث المخزون." });
        setCart([]);
        setDiscount(0);
        setIsCheckoutOpen(false);
      })
      .catch(async (err) => {
        const perr = new FirestorePermissionError({ path: "orders/pos", operation: "write" });
        errorEmitter.emit('permission-error', perr);
      })
      .finally(() => setProcessingOrder(false));
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background -m-4 md:-m-8">
      <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="البحث بالاسم أو الباركود..." 
              className="h-14 rounded-2xl pr-12 text-lg shadow-sm border-none bg-white dark:bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-14 w-14 rounded-2xl border-none shadow-sm bg-white dark:bg-card">
            <Barcode className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2 shrink-0">
           <Button 
            variant={selectedCategory === null ? "default" : "outline"} 
            className="rounded-full font-black px-8 shrink-0"
            onClick={() => setSelectedCategory(null)}
           >
             الكل
           </Button>
           {categories?.map((cat: any) => (
             <Button 
              key={cat.id} 
              variant={selectedCategory === cat.name ? "default" : "outline"} 
              className="rounded-full font-bold px-8 bg-white dark:bg-card border-none shadow-sm shrink-0"
              onClick={() => setSelectedCategory(cat.name)}
             >
               {cat.name}
             </Button>
           ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
           {loading ? (
             Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-56 rounded-[32px]" />)
           ) : filteredProducts.length > 0 ? (
             filteredProducts.map((p: any) => (
             <Card 
              key={p.id} 
              className={cn(
                "group cursor-pointer overflow-hidden rounded-[32px] border-none shadow-sm hover:shadow-md transition-all active:scale-95 bg-white dark:bg-card",
                p.stock <= 0 && "opacity-50 grayscale"
              )}
              onClick={() => addToCart(p)}
             >
               <div className="relative aspect-square w-full">
                  <Image src={p.images?.[0] || "https://picsum.photos/seed/pos/300/300"} alt={p.name} fill className="object-cover" />
                  <div className="absolute top-2 left-2">
                     <Badge className={cn("rounded-full text-[10px] font-black", p.stock > 5 ? "bg-green-500" : "bg-red-500")}>
                        {p.stock} قطعة
                     </Badge>
                  </div>
               </div>
               <CardContent className="p-4 space-y-1">
                  <h3 className="font-bold text-sm line-clamp-1">{p.name}</h3>
                  <p className="text-primary font-black text-lg">{p.retailPrice?.toLocaleString()} د.ع</p>
               </CardContent>
             </Card>
           ))) : (
             <div className="col-span-full h-48 flex flex-col items-center justify-center opacity-30">
                <Package className="h-12 w-12 mb-2" />
                <p className="font-black">لا توجد منتجات</p>
             </div>
           )}
        </div>
      </div>

      <div className="w-full lg:w-[420px] flex flex-col bg-white dark:bg-card border-r shadow-2xl z-20">
        <div className="p-6 border-b shrink-0 space-y-4">
           <h2 className="text-2xl font-black flex items-center gap-2"><ShoppingCart className="h-6 w-6 text-primary" /> الفاتورة</h2>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="w-full h-16 rounded-2xl justify-between border-2 border-primary/10 bg-primary/5 font-bold px-4">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
                          <User className="h-5 w-5" />
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] uppercase font-black opacity-60">نوع العميل</p>
                          <p className="text-base">{selectedCustomer.name}</p>
                       </div>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-40" />
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 rounded-2xl p-2" align="end">
                 <DropdownMenuItem className="rounded-xl h-14 font-bold cursor-pointer" onClick={() => setSelectedCustomer({ name: "زبون نقدي", type: 'retail' })}>زبون نقدي (مفرد)</DropdownMenuItem>
                 <DropdownMenuItem className="rounded-xl h-14 font-bold cursor-pointer text-primary" onClick={() => setSelectedCustomer({ name: "عميل جملة (VIP)", type: 'wholesale' })}>عميل جملة (VIP)</DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/5">
           {cart.map((item) => (
             <div key={item.id} className="flex gap-3 p-3 rounded-2xl bg-white dark:bg-card shadow-sm border border-transparent hover:border-primary/10 transition-all">
                <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border">
                   <Image src={item.images?.[0] || ""} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                   <h4 className="text-xs font-black truncate">{item.name}</h4>
                   <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-primary">
                        {(selectedCustomer.type === 'wholesale' ? (item.wholesalePrice || item.retailPrice) : item.retailPrice).toLocaleString()} د.ع
                      </span>
                      <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                         <button onClick={() => updateQuantity(item.id, -1)} className="h-6 w-6 bg-white rounded shadow-sm flex items-center justify-center"><Minus className="h-3 w-3" /></button>
                         <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                         <button onClick={() => updateQuantity(item.id, 1)} className="h-6 w-6 bg-primary text-white rounded shadow-sm flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                      </div>
                   </div>
                </div>
                <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-destructive p-2"><Trash2 className="h-4 w-4" /></button>
             </div>
           ))}
        </div>

        <div className="p-8 bg-white dark:bg-card border-t shadow-lg shrink-0 space-y-6">
           <div className="space-y-2">
              <div className="flex justify-between font-bold text-muted-foreground"><span>المجموع:</span><span>{subtotal.toLocaleString()} د.ع</span></div>
              <div className="flex justify-between font-black text-primary text-3xl"><span>الإجمالي:</span><span>{total.toLocaleString()} د.ع</span></div>
           </div>
           <Button 
            disabled={cart.length === 0} 
            className="w-full h-20 rounded-3xl text-2xl font-black gap-4 shadow-xl active:scale-95"
            onClick={() => setIsCheckoutOpen(true)}
           >
              <Zap className="h-8 w-8" /> إتمام البيع
           </Button>
        </div>
      </div>

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white dark:bg-card w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden">
              <div className="p-8 border-b bg-primary text-white flex items-center justify-between">
                 <h3 className="text-2xl font-black">تأكيد العملية</h3>
                 <button onClick={() => setIsCheckoutOpen(false)}><X className="h-8 w-8" /></button>
              </div>
              <div className="p-10 space-y-8 text-center">
                 <p className="text-sm font-bold opacity-60 uppercase">المبلغ الإجمالي</p>
                 <p className="text-6xl font-black text-primary">{total.toLocaleString()} <span className="text-xl">د.ع</span></p>
                 <div className="grid gap-4">
                    <Button disabled={processingOrder} className="h-18 rounded-2xl text-xl font-black gap-3" onClick={handleCompleteSale}>
                       {processingOrder ? <Loader2 className="h-6 w-6 animate-spin" /> : <Printer className="h-6 w-6" />} تأكيد وطباعة
                    </Button>
                    <Button variant="ghost" onClick={() => setIsCheckoutOpen(false)}>إلغاء</Button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
