
'use client';

import { useState, useMemo, useEffect } from "react";
import { 
  Search, Barcode, Trash2, Minus, Plus, ShoppingCart, User, 
  ChevronDown, Loader2, Package, Zap, Printer, CreditCard, Banknote, UserPlus, Save 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useUser } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { InventoryService } from "@/services/inventory-service";
import { POSService } from "@/services/pos-service";
import { useRouter } from "next/navigation";

export default function POSPage() {
  const { profile } = useUser();
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState({ name: "زبون نقدي", type: 'retail', id: undefined });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);

  useEffect(() => {
    loadLocalData();
  }, []);

  const loadLocalData = async () => {
    try {
      const [p, c] = await Promise.all([
        InventoryService.getProducts(),
        InventoryService.getCategories()
      ]);
      setProducts(p);
      setCategories(c);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: any) => 
      (p.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
      (p.barcode || "").includes(searchQuery)
    );
  }, [products, searchQuery]);

  const total = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        price: product.retailPrice,
        quantity: 1, 
        image: product.imageUrl || ""
      }];
    });
  };

  const handleCompleteSale = async () => {
    setProcessing(true);
    try {
      const result = await POSService.processSale(cart, selectedCustomer, { paidAmount, method: 'cash' }, profile);
      toast({ title: "تم البيع وحفظ الفاتورة محلياً", description: `رقم القائمة: ${result.invoiceNo}` });
      setCart([]);
      setIsCheckoutOpen(false);
      loadLocalData(); // Refresh stock
    } catch (e) {
      toast({ variant: "destructive", title: "فشل إتمام العملية محلياً" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background -m-4 md:-m-8" dir="rtl">
      <div className="flex-1 flex flex-col p-3 md:p-6 overflow-y-auto">
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="بحث بمنتجات SQLite..." className="h-12 rounded-xl pr-10 bg-white font-bold" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
           {loading ? (
             Array(10).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square rounded-3xl" />)
           ) : filteredProducts.map((p: any) => (
             <Card key={p.id} className="group cursor-pointer overflow-hidden rounded-[24px] border-none shadow-sm hover:shadow-xl transition-all active:scale-95 bg-white" onClick={() => addToCart(p)}>
               <div className="relative aspect-square w-full bg-muted">
                  {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />}
                  <div className="absolute top-2 left-2"><Badge className="bg-green-500 rounded-full text-[10px] font-black">{p.stockQuantity} متوفر</Badge></div>
               </div>
               <CardContent className="p-3">
                  <h3 className="font-black text-xs line-clamp-1">{p.name}</h3>
                  <p className="text-primary font-black text-base">{p.retailPrice?.toLocaleString()} د.ع</p>
               </CardContent>
             </Card>
           ))}
        </div>
      </div>

      <div className="hidden lg:flex w-[400px] flex-col bg-white border-r shadow-2xl z-20">
         <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2"><ShoppingCart className="text-primary" /> فاتورة محلية</h2>
            <Badge variant="outline" className="font-black">DUBSAR 2.0</Badge>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 rounded-2xl bg-muted/20 border">
                 <div><p className="font-black text-xs">{item.name}</p><p className="text-[10px] font-bold text-primary">{item.price.toLocaleString()} × {item.quantity}</p></div>
                 <p className="font-black">{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
         </div>
         <div className="p-6 bg-slate-50 border-t space-y-4">
            <div className="flex justify-between text-2xl font-black text-primary"><span>الإجمالي:</span><span>{total.toLocaleString()}</span></div>
            <Button disabled={cart.length === 0} className="w-full h-16 rounded-2xl text-xl font-black shadow-xl" onClick={() => setIsCheckoutOpen(true)}>تأكيد البيع (F10)</Button>
         </div>
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="rounded-[40px] max-w-sm">
           <DialogHeader><DialogTitle className="text-2xl font-black text-right">إصدار فاتورة</DialogTitle></DialogHeader>
           <div className="space-y-6 py-4" dir="rtl">
              <div className="bg-primary/5 p-6 rounded-3xl text-center"><p className="text-xs font-bold opacity-60">المبلغ المطلوب</p><p className="text-3xl font-black text-primary">{total.toLocaleString()} د.ع</p></div>
              <Button disabled={processing} className="w-full h-16 rounded-[24px] text-xl font-black" onClick={handleCompleteSale}>{processing ? <Loader2 className="animate-spin" /> : "حفظ وطباعة"}</Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
