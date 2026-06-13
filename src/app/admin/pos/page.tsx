
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
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// --- Components ---

export default function POSPage() {
  const db = useFirestore();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; type: 'retail' | 'wholesale' }>({ name: "زبون نقدي", type: 'retail' });
  const [discount, setDiscount] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Firestore Data
  const productsQuery = useMemo(() => query(collection(db, 'products'), orderBy('name')), [db]);
  const { data: products, loading } = useCollection(productsQuery);
  const categoriesQuery = useMemo(() => collection(db, 'categories'), [db]);
  const { data: categories } = useCollection(categoriesQuery);

  // Filtering
  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.barcode?.includes(searchQuery)
  );

  // Calculations
  const subtotal = cart.reduce((acc, item) => {
    const price = selectedCustomer.type === 'wholesale' ? (item.wholesalePrice || item.retailPrice) : item.retailPrice;
    return acc + (price * item.quantity);
  }, 0);
  const total = subtotal - discount;

  // Handlers
  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
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
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'F4' && cart.length > 0) {
        e.preventDefault();
        setIsCheckoutOpen(true);
      }
      if (e.key === 'F8') {
        e.preventDefault();
        setCart([]);
        setDiscount(0);
        setSelectedCustomer({ name: "زبون نقدي", type: 'retail' });
        toast({ title: "فاتورة جديدة", description: "تم تصفير السلة بنجاح." });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden gap-4 -m-4 md:-m-8">
      {/* Left Side: Products Grid (70%) */}
      <div className="flex-1 flex flex-col min-w-0 bg-muted/20 p-4 md:p-8">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              ref={searchInputRef}
              placeholder="بحث بالاسم أو الباركود (F2)..." 
              className="h-14 rounded-2xl pr-12 text-lg shadow-sm border-none bg-white dark:bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-14 w-14 rounded-2xl border-none shadow-sm bg-white dark:bg-card">
            <Barcode className="h-6 w-6" />
          </Button>
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
           <Button variant="default" className="rounded-full font-bold px-6">الكل</Button>
           {categories?.map((cat: any) => (
             <Button key={cat.id} variant="outline" className="rounded-full font-bold px-6 bg-white dark:bg-card border-none shadow-sm">{cat.name}</Button>
           ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
           <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {loading ? (
               Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-3xl" />)
             ) : filteredProducts.map((p: any) => (
               <Card 
                key={p.id} 
                className="group relative cursor-pointer overflow-hidden rounded-[28px] border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-card active:scale-95"
                onClick={() => addToCart(p)}
               >
                 <div className="relative aspect-square h-32 w-full overflow-hidden bg-muted/50">
                    <Image 
                      src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/300/300`} 
                      alt={p.name} 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute top-2 left-2">
                       <Badge variant={p.stock > 10 ? "secondary" : "destructive"} className="rounded-full text-[10px] px-2 font-bold shadow-sm">
                          {p.stock} قطعة
                       </Badge>
                    </div>
                 </div>
                 <CardContent className="p-4 space-y-1">
                    <h3 className="font-bold text-sm leading-tight line-clamp-2">{p.name}</h3>
                    <div className="flex items-end justify-between">
                       <p className="text-primary font-black text-base">{p.retailPrice?.toLocaleString()} <span className="text-[10px]">د.ع</span></p>
                       <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Plus className="h-4 w-4" />
                       </div>
                    </div>
                 </CardContent>
               </Card>
             ))}
           </div>
        </div>
      </div>

      {/* Right Side: Invoice Panel (30%) */}
      <div className="w-[400px] flex flex-col bg-white dark:bg-card border-r shadow-2xl z-20">
        {/* Customer & Header */}
        <div className="p-6 border-b space-y-4">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                الفاتورة الحالية
              </h2>
              <Button variant="ghost" size="icon" className="rounded-xl text-destructive" onClick={() => setCart([])}>
                <Trash2 className="h-5 w-5" />
              </Button>
           </div>
           
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="w-full h-12 rounded-2xl justify-between border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all font-bold group">
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center">
                          <User className="h-4 w-4" />
                       </div>
                       <div className="text-right">
                          <p className="text-xs leading-none mb-1 opacity-60">العميل الحالي</p>
                          <p className="text-sm">{selectedCustomer.name}</p>
                       </div>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50 transition-transform group-data-[state=open]:rotate-180" />
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 rounded-2xl p-2" align="end">
                 <div className="p-2 mb-2 relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="بحث عن عميل..." className="h-10 rounded-xl pr-10 border-none bg-muted/30" />
                 </div>
                 <DropdownMenuItem className="rounded-xl gap-2 h-12 font-bold cursor-pointer" onClick={() => setSelectedCustomer({ name: "زبون نقدي", type: 'retail' })}>
                    <User className="h-4 w-4" /> زبون نقدي (مفرد)
                 </DropdownMenuItem>
                 <DropdownMenuItem className="rounded-xl gap-2 h-12 font-bold cursor-pointer text-primary" onClick={() => setSelectedCustomer({ name: "شركة النور للقطع", type: 'wholesale' })}>
                    <Tags className="h-4 w-4" /> جملة - شركة النور
                 </DropdownMenuItem>
                 <div className="h-px bg-muted my-1" />
                 <Button variant="ghost" className="w-full rounded-xl gap-2 text-primary font-bold h-10 mt-1">
                    <UserPlus className="h-4 w-4" /> إضافة عميل جديد
                 </Button>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
           {cart.length > 0 ? (
             cart.map((item) => (
               <div key={item.id} className="flex gap-3 p-3 rounded-2xl bg-white dark:bg-card shadow-sm border border-transparent hover:border-primary/20 transition-all group animate-in slide-in-from-left-2">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted shadow-inner">
                     <Image src={item.images?.[0] || `https://picsum.photos/seed/${item.id}/100/100`} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                     <h4 className="text-xs font-bold leading-tight line-clamp-1">{item.name}</h4>
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-primary">
                          {(selectedCustomer.type === 'wholesale' ? (item.wholesalePrice || item.retailPrice) : item.retailPrice).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-0.5">
                           <button onClick={() => updateQuantity(item.id, -1)} className="h-6 w-6 flex items-center justify-center rounded-md bg-white shadow-sm active:scale-90"><Minus className="h-3 w-3" /></button>
                           <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                           <button onClick={() => updateQuantity(item.id, 1)} className="h-6 w-6 flex items-center justify-center rounded-md bg-primary text-white shadow-sm active:scale-90"><Plus className="h-3 w-3" /></button>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 p-1 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </button>
               </div>
             ))
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4">
                <ShoppingCart className="h-16 w-16" strokeWidth={1} />
                <p className="font-black text-lg">السلة فارغة</p>
             </div>
           )}
        </div>

        {/* Footer: Totals & Action */}
        <div className="p-6 bg-white dark:bg-card border-t shadow-[0_-10px_30px_rgba(0,0,0,0.05)] space-y-4">
           <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                 <span className="text-muted-foreground font-medium">المجموع الفرعي:</span>
                 <span className="font-bold">{subtotal.toLocaleString()} د.ع</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                 <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">الخصم:</span>
                    <Input 
                      type="number" 
                      value={discount} 
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="h-7 w-20 rounded-lg bg-muted/30 border-none text-xs font-black p-1 text-center"
                    />
                 </div>
                 <span className="font-bold text-destructive">-{discount.toLocaleString()} د.ع</span>
              </div>
           </div>
           
           <div className="h-px bg-muted" />

           <div className="flex items-center justify-between">
              <span className="text-lg font-black">الإجمالي النهائي:</span>
              <span className="text-3xl font-black text-primary underline decoration-primary/20 underline-offset-8">
                {total.toLocaleString()} <span className="text-sm">د.ع</span>
              </span>
           </div>

           <Button 
            disabled={cart.length === 0}
            className="w-full h-16 rounded-[24px] text-xl font-black gap-3 shadow-xl shadow-primary/20 group relative overflow-hidden"
            onClick={() => setIsCheckoutOpen(true)}
           >
              <Zap className="h-6 w-6 transition-transform group-hover:scale-125 group-hover:rotate-12" />
              إتمام العملية (F4)
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
           </Button>
        </div>
      </div>

      {/* Checkout Dialog */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-card w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b flex items-center justify-between bg-primary text-white">
                 <h3 className="text-2xl font-black">تأكيد الدفع</h3>
                 <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/20 text-white" onClick={() => setIsCheckoutOpen(false)}>
                    <X className="h-6 w-6" />
                 </Button>
              </div>
              <div className="p-8 space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <p className="text-sm font-bold opacity-60">المبلغ المطلوب</p>
                       <p className="text-4xl font-black text-primary">{total.toLocaleString()} <span className="text-sm">د.ع</span></p>
                    </div>
                    <div className="space-y-4">
                       <p className="text-sm font-bold opacity-60">طريقة الدفع</p>
                       <div className="flex items-center gap-3 p-4 rounded-3xl bg-primary/5 border-2 border-primary">
                          <CreditCard className="h-6 w-6 text-primary" />
                          <span className="font-black">نقداً (Cash)</span>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <p className="text-sm font-bold opacity-60">المبلغ المدفوع</p>
                    <Input 
                      placeholder="0.00" 
                      className="h-20 rounded-[28px] text-4xl font-black text-center bg-muted/20 border-none focus:ring-4 focus:ring-primary/10 transition-all" 
                      autoFocus
                    />
                 </div>

                 <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/30">
                    <p className="font-bold">المتبقي (الخردة):</p>
                    <p className="text-2xl font-black text-emerald-600">0 د.ع</p>
                 </div>

                 <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl border-2 font-black gap-2" onClick={() => setIsCheckoutOpen(false)}>
                       إلغاء
                    </Button>
                    <Button className="flex-2 h-14 rounded-2xl font-black gap-2 px-12" onClick={() => {
                      toast({ title: "تم بنجاح", description: "تم تسجيل الطلب وطباعة الفاتورة." });
                      setCart([]);
                      setIsCheckoutOpen(false);
                    }}>
                       <Printer className="h-5 w-5" /> تأكيد وطباعة الفاتورة
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

