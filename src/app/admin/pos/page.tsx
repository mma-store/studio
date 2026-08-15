'use client';

import { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  Barcode, 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingCart,
  User,
  ChevronDown,
  Loader2,
  Package,
  Zap,
  Printer,
  CreditCard,
  Banknote,
  UserPlus,
  Save
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
import { collection, query, orderBy, writeBatch, doc, increment, addDoc, getDoc, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useRouter, useSearchParams } from "next/navigation";
import { logger } from "@/lib/reliability/logger-service";

interface CartViewProps {
  cart: any[];
  selectedCustomer: any;
  customerSearch: string;
  setCustomerSearch: (s: string) => void;
  setSelectedCustomer: (c: any) => void;
  updateQuantity: (id: string, d: number) => void;
  removeFromCart: (id: string) => void;
  total: number;
  allUsers: any[];
  onCheckout: () => void;
  onAddNewCustomer: () => void;
  isEditing: boolean;
}

function CartView({ cart, selectedCustomer, customerSearch, setCustomerSearch, setSelectedCustomer, updateQuantity, removeFromCart, total, allUsers, onCheckout, onAddNewCustomer, isEditing }: CartViewProps) {
  
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return allUsers?.slice(0, 10) || [];
    return allUsers?.filter(u => 
      u.displayName?.toLowerCase().includes(customerSearch.toLowerCase()) || 
      u.phoneNumber?.includes(customerSearch)
    ).slice(0, 10);
  }, [allUsers, customerSearch]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
           <h2 className="text-lg font-black flex items-center gap-2">
             <ShoppingCart className="h-5 w-5 text-primary" /> 
             {isEditing ? 'تعديل قائمة سابقة' : 'قائمة جديدة'}
           </h2>
           <Button variant="ghost" size="icon" onClick={onAddNewCustomer} className="rounded-full bg-primary/10 text-primary">
              <UserPlus className="h-4 w-4" />
           </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full h-11 rounded-xl justify-between border-primary/20 bg-primary/5 px-3">
              <div className="flex items-center gap-2 truncate">
                <User className="h-4 w-4 text-primary" />
                <div className="flex flex-col items-start">
                   <span className="text-xs font-black truncate">{selectedCustomer.name}</span>
                   <span className="text-[9px] opacity-60 font-bold">{selectedCustomer.type === 'wholesale' ? 'جملة' : 'مفرد'}</span>
                </div>
              </div>
              <ChevronDown className="h-3 w-3 opacity-40" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 rounded-2xl p-2" align="start">
            <div className="p-2">
               <Input 
                 placeholder="ابحث عن زبون..." 
                 className="h-10 rounded-xl mb-2 bg-muted/50 border-none font-bold"
                 value={customerSearch}
                 onChange={(e) => setCustomerSearch(e.target.value)}
               />
            </div>
            <DropdownMenuItem 
              className="rounded-xl font-bold py-3"
              onClick={() => setSelectedCustomer({ name: "زبون نقدي", type: 'retail' })}
            >
              زبون نقدي عام
            </DropdownMenuItem>
            {filteredCustomers.map((u: any) => (
              <DropdownMenuItem 
                key={u.id} 
                className="rounded-xl py-3 flex flex-col items-start gap-0.5"
                onClick={() => setSelectedCustomer({ id: u.id, name: u.displayName, type: u.role === 'wholesale_customer' ? 'wholesale' : 'retail' })}
              >
                <span className="font-black text-sm">{u.displayName}</span>
                <span className="text-[10px] opacity-60 font-medium">{u.phoneNumber}</span>
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
          <div key={item.id} className="flex gap-2 p-2 rounded-xl bg-white dark:bg-card border shadow-sm group">
            <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border bg-muted">
              {item.image && <Image src={item.image} alt="" fill className="object-cover" />}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="text-[11px] font-black truncate leading-none mb-1">{item.name}</h4>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-primary">{item.price.toLocaleString()} د.ع</span>
                <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-0.5">
                  <button onClick={() => updateQuantity(item.id, -1)} className="h-6 w-6 bg-white rounded shadow-sm flex items-center justify-center text-foreground"><Minus className="h-3 w-3" /></button>
                  <span className="text-[11px] font-black w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="h-6 w-6 bg-primary text-white rounded shadow-sm flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
            </div>
            <button onClick={() => removeFromCart(item.id)} className="text-destructive/40 hover:text-destructive p-1 transition-colors self-start"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white dark:bg-card border-t shadow-lg space-y-3">
        <div className="flex justify-between font-black text-primary text-2xl">
          <span>الإجمالي:</span>
          <span>{total.toLocaleString()}</span>
        </div>
        <Button 
          disabled={cart.length === 0} 
          className={cn("w-full h-14 rounded-xl text-lg font-black gap-2 shadow-xl shadow-primary/20", isEditing ? "bg-orange-600" : "bg-primary")}
          onClick={onCheckout}
        >
          {isEditing ? <Save className="h-5 w-5" /> : <Zap className="h-5 w-5" />} 
          {isEditing ? 'حفظ تعديلات القائمة' : 'تأكيد وإصدار الفاتورة'}
        </Button>
      </div>
    </div>
  );
}

export default function POSPage() {
  const db = useFirestore();
  const { tenantId, user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editOrderId = searchParams.get('edit');
  
  const [searchQuery, setSearchQuery] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; type: 'retail' | 'wholesale'; id?: string }>({ name: "زبون نقدي", type: 'retail' });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit' | 'partial'>('cash');
  const [printSize, setPrintSize] = useState<'58mm' | '80mm' | 'A4'>('80mm');

  // SECURE: Scope all collection queries by tenantId
  const productsQuery = useMemo(() => {
    if (!tenantId) return null;
    return query(collection(db, 'products'), where('tenantId', '==', tenantId), orderBy('name'));
  }, [db, tenantId]);
  
  const categoriesQuery = useMemo(() => {
    if (!tenantId) return null;
    return query(collection(db, 'categories'), where('tenantId', '==', tenantId), orderBy('name'));
  }, [db, tenantId]);
  
  const usersQuery = useMemo(() => {
    if (!tenantId) return null;
    return query(collection(db, 'users'), where('tenantId', '==', tenantId), orderBy('displayName'));
  }, [db, tenantId]);

  const { data: products, loading } = useCollection(productsQuery);
  const { data: categories } = useCollection(categoriesQuery);
  const { data: allUsers } = useCollection(usersQuery);

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

  const total = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        price: selectedCustomer.type === 'wholesale' ? (product.wholesalePrice || product.retailPrice) : product.retailPrice,
        quantity: 1, 
        image: product.images?.[0] || ""
      }];
    });
  };

  const handleCompleteSale = async () => {
    if (!tenantId) return;
    setProcessingOrder(true);
    const batch = writeBatch(db);
    const orderNumber = `POS-${Date.now().toString().slice(-6)}`;
    const orderRef = doc(collection(db, "orders"));

    const orderData = {
      tenantId,
      orderNumber,
      userId: selectedCustomer.id || null,
      customerName: selectedCustomer.name,
      items: cart,
      total,
      paidAmount,
      unpaidAmount: total - paidAmount,
      createdAt: Date.now(),
      status: 'delivered',
      source: 'pos',
      paymentMethod,
    };

    try {
      batch.set(orderRef, orderData);
      
      cart.forEach(item => {
        batch.update(doc(db, "products", item.id), { stock: increment(-item.quantity) });
      });

      if (selectedCustomer.id && (total - paidAmount) > 0) {
        batch.update(doc(db, "users", selectedCustomer.id), { currentBalance: increment(total - paidAmount) });
      }

      await batch.commit();
      
      localStorage.removeItem(`pos_draft_cart_${tenantId}`);
      setCart([]);
      setIsCheckoutOpen(false);
      toast({ title: "تم إتمام البيع بنجاح" });
      router.push(`/admin/print/invoice/${orderRef.id}?size=${printSize}`);
    } catch (e) {
      logger.log({
        tenantId,
        userId: user?.uid || null,
        page: '/admin/pos',
        action: 'POS_SALE_FAILED',
        severity: 'critical',
        message: 'فشل إتمام عملية البيع في الـ POS.',
        details: e
      });
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ الطلب، يرجى المحاولة لاحقاً." });
    } finally {
      setProcessingOrder(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background -m-4 md:-m-8" dir="rtl">
      <div className="flex-1 flex flex-col p-3 md:p-6 overflow-y-auto">
        <div className="flex gap-2 mb-4 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="ابحث بالاسم أو الباركود..." 
              className="h-12 rounded-xl pr-10 text-lg shadow-sm border-none bg-white font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 w-12 rounded-xl border-none shadow-sm bg-white">
            <Barcode className="h-6 w-6 text-primary" />
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 shrink-0 pb-1">
           <Button variant={selectedCategory === null ? "default" : "outline"} className="rounded-full font-black px-6" onClick={() => setSelectedCategory(null)}>الكل</Button>
           {categories?.map((cat: any) => (
             <Button key={cat.id} variant={selectedCategory === cat.name ? "default" : "outline"} className="rounded-full font-bold px-6 bg-white border-none shadow-sm" onClick={() => setSelectedCategory(cat.name)}>{cat.name}</Button>
           ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
           {loading ? (
             Array(10).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />)
           ) : filteredProducts.map((p: any) => (
             <Card key={p.id} className="group cursor-pointer overflow-hidden rounded-[24px] border-none shadow-sm hover:shadow-xl transition-all active:scale-95 bg-white" onClick={() => addToCart(p)}>
               <div className="relative aspect-square w-full bg-muted">
                  {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" />}
                  <div className="absolute top-2 left-2"><Badge className="bg-green-500 rounded-full text-[10px] font-black">{p.stock} متوفر</Badge></div>
               </div>
               <CardContent className="p-3">
                  <h3 className="font-black text-xs line-clamp-1">{p.name}</h3>
                  <p className="text-primary font-black text-base">{p.retailPrice?.toLocaleString()} د.ع</p>
               </CardContent>
             </Card>
           ))}
        </div>
      </div>

      <div className="hidden lg:flex w-[350px] xl:w-[400px] flex-col bg-white border-r shadow-2xl z-20">
        <CartView 
          cart={cart}
          selectedCustomer={selectedCustomer}
          customerSearch={customerSearch}
          setCustomerSearch={setCustomerSearch}
          setSelectedCustomer={setSelectedCustomer}
          updateQuantity={(id, d) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))}
          removeFromCart={(id) => setCart(prev => prev.filter(i => i.id !== id))}
          total={total}
          allUsers={allUsers || []}
          onCheckout={() => setIsCheckoutOpen(true)}
          onAddNewCustomer={() => {}}
          isEditing={!!editOrderId}
        />
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="rounded-[40px] max-w-lg p-0 overflow-hidden border-none">
           <DialogHeader className="p-8 bg-primary text-white space-y-2">
              <DialogTitle className="text-2xl font-black text-right">تأكيد العملية</DialogTitle>
              <DialogDescription className="text-white/80 font-bold text-right">حدد طريقة الدفع لإصدار الفاتورة النهائية.</DialogDescription>
           </DialogHeader>
           <div className="p-8 space-y-6 text-right">
              <div className="grid grid-cols-3 gap-3">
                 {[{id:'cash',label:'نقدي',icon:Banknote},{id:'credit',label:'آجل',icon:CreditCard}].map(m=>(
                   <button key={m.id} onClick={()=>{setPaymentMethod(m.id as any); setPaidAmount(m.id==='cash'?total:0)}} className={cn("p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2", paymentMethod===m.id?"border-primary bg-primary/5 text-primary shadow-xl":"border-muted opacity-50")}>
                      <m.icon className="h-7 w-7" /><span className="font-black text-[10px]">{m.label}</span>
                   </button>
                 ))}
              </div>
              <div className="space-y-3">
                 <Label className="font-black text-sm">قياس الفاتورة</Label>
                 <div className="grid grid-cols-3 gap-2">{['58mm','80mm','A4'].map(s=>(<button key={s} onClick={()=>setPrintSize(s as any)} className={cn("h-11 rounded-xl font-black text-xs border transition-all", printSize===s?"bg-slate-900 text-white shadow-lg":"bg-muted/30 border-transparent")}>{s}</button>))}</div>
              </div>
              <div className="bg-primary/5 p-6 rounded-[32px] space-y-2 border border-primary/10">
                 <div className="flex justify-between text-sm font-bold opacity-60"><span>الإجمالي:</span><span>{total.toLocaleString()} د.ع</span></div>
                 <div className="flex justify-between text-xl font-black text-primary"><span>المطلوب:</span><span>{(total - paidAmount).toLocaleString()} د.ع</span></div>
              </div>
              <Button disabled={processingOrder} className="w-full h-16 rounded-[24px] text-xl font-black gap-3 shadow-2xl" onClick={handleCompleteSale}>
                 {processingOrder ? <Loader2 className="h-6 w-6 animate-spin" /> : <Printer className="h-6 w-6" />} تأكيد وحفظ الفاتورة
              </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}