
'use client';

import { use, useState } from "react";
import { useCart } from "@/context/cart-context";
import { useTenantData } from "@/hooks/use-tenant-data";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, doc, writeBatch, increment } from "firebase/firestore";
import { StoreHeader } from "@/components/store/store-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Truck, Store, Loader2, CheckCircle2 } from "lucide-react";

export default function StoreCheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { tenant, loading: tenantLoading } = useTenantData(slug);
  const { cart, subtotal, clearCart } = useCart();
  const { user, profile } = useUser();
  const db = useFirestore();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("delivery");

  const deliveryFee = method === "delivery" ? 5000 : 0;
  const total = subtotal + deliveryFee;

  if (tenantLoading) return null;

  async function handleOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى تسجيل الدخول لمتابعة الطلب." });
      router.push("/login");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const orderNumber = `${tenant?.businessName?.[0]}-${Date.now().toString().slice(-6)}`;

    const orderData = {
      tenantId: tenant?.tenantId,
      orderNumber,
      userId: user.uid,
      customerName: formData.get("name"),
      phoneNumber: formData.get("phone"),
      address: formData.get("address"),
      deliveryMethod: method,
      items: cart,
      total,
      subtotal,
      deliveryFee,
      status: "pending",
      createdAt: Date.now(),
      source: 'web'
    };

    try {
      const batch = writeBatch(db);
      const orderRef = doc(collection(db, "orders"));
      batch.set(orderRef, orderData);

      // Inventory deduction
      cart.forEach(item => {
        const pRef = doc(db, "products", item.id);
        batch.update(pRef, { stock: increment(-item.quantity) });
      });

      await batch.commit();
      
      toast({ title: "تم إرسال طلبك بنجاح!" });
      clearCart();
      router.push(`/store/${slug}/orders`);
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إرسال الطلب." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-32 min-h-screen bg-background" dir="rtl">
      <StoreHeader tenant={tenant} />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-10">
        <h1 className="text-3xl font-black tracking-tight">إتمام الطلب</h1>

        <form onSubmit={handleOrder} className="space-y-8">
           <section className="bg-white rounded-[32px] p-8 shadow-sm border space-y-6">
              <h3 className="text-xl font-black flex items-center gap-3"><Phone className="h-6 w-6 text-primary" /> معلومات التواصل</h3>
              <div className="grid gap-6">
                 <div className="space-y-2">
                    <Label className="font-bold mr-1">الاسم الكامل</Label>
                    <Input name="name" defaultValue={profile?.displayName} required className="h-14 rounded-2xl bg-muted/30 border-none px-6 font-bold" />
                 </div>
                 <div className="space-y-2">
                    <Label className="font-bold mr-1">رقم الهاتف</Label>
                    <Input name="phone" defaultValue={profile?.phoneNumber} required className="h-14 rounded-2xl bg-muted/30 border-none px-6 font-black text-left" dir="ltr" />
                 </div>
              </div>
           </section>

           <section className="bg-white rounded-[32px] p-8 shadow-sm border space-y-6">
              <h3 className="text-xl font-black flex items-center gap-3"><Truck className="h-6 w-6 text-primary" /> خيارات التوصيل</h3>
              <RadioGroup value={method} onValueChange={setMethod} className="grid grid-cols-2 gap-4">
                 <Label className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 ${method === 'delivery' ? 'border-primary bg-primary/5' : 'border-muted opacity-50'}`}>
                    <Truck className="h-8 w-8" />
                    <span className="font-black text-xs">توصيل منزلي</span>
                    <RadioGroupItem value="delivery" className="sr-only" />
                 </Label>
                 <Label className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center gap-3 ${method === 'pickup' ? 'border-primary bg-primary/5' : 'border-muted opacity-50'}`}>
                    <Store className="h-8 w-8" />
                    <span className="font-black text-xs">استلام من المجمع</span>
                    <RadioGroupItem value="pickup" className="sr-only" />
                 </Label>
              </RadioGroup>

              {method === 'delivery' && (
                <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                   <Label className="font-bold mr-1">عنوان التوصيل الكامل</Label>
                   <Input name="address" required placeholder="المحافظة، المنطقة، أقرب نقطة دالة..." className="h-14 rounded-2xl bg-muted/30 border-none px-6 font-bold" />
                </div>
              )}
           </section>

           <section className="bg-slate-900 text-white rounded-[40px] p-10 space-y-6 shadow-2xl">
              <div className="space-y-4">
                 <div className="flex justify-between text-sm opacity-60 font-bold"><span>مجموع المشتريات:</span><span>{subtotal.toLocaleString()} د.ع</span></div>
                 <div className="flex justify-between text-sm opacity-60 font-bold"><span>رسوم التوصيل:</span><span>{deliveryFee.toLocaleString()} د.ع</span></div>
                 <div className="h-px bg-white/10" />
                 <div className="flex justify-between items-baseline">
                    <span className="text-xl font-black uppercase tracking-widest">الإجمالي النهائي</span>
                    <span className="text-4xl font-black text-primary">{total.toLocaleString()} <span className="text-xs">د.ع</span></span>
                 </div>
              </div>
              <Button disabled={loading} type="submit" className="w-full h-20 rounded-[28px] text-2xl font-black gap-4 shadow-xl active:scale-95 transition-all">
                 {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <CheckCircle2 className="h-8 w-8" />} تأكيد طلب الشراء
              </Button>
           </section>
        </form>
      </main>
    </div>
  );
}
