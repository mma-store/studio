
"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Phone, Truck, Store, ChevronLeft, Loader2, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/context/cart-context";

export default function CheckoutPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { cart, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [method, setMethod] = useState("delivery");
  const [loading, setLoading] = useState(false);

  const deliveryFee = method === "delivery" ? 5000 : 0;
  const total = subtotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FDF8F5]">
         <ShoppingCart className="h-20 w-20 opacity-20 mb-4" />
         <h2 className="text-2xl font-black">السلة فارغة</h2>
         <p className="text-muted-foreground mb-6">لا يمكنك إتمام الطلب بدون منتجات.</p>
         <Link href="/"><Button className="rounded-full px-10">العودة للمتجر</Button></Link>
      </div>
    );
  }

  async function handlePlaceOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) {
      toast({ title: "تنبيه", description: "يرجى تسجيل الدخول أولاً لإتمام الطلب." });
      router.push("/login");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const customerName = formData.get("customerName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const orderNumber = `MMA-${Date.now().toString().slice(-5)}`;
    
    const orderData = {
      orderNumber,
      userId: user.uid,
      customerName,
      phoneNumber,
      deliveryMethod: method,
      address: formData.get("address") || "",
      landmark: formData.get("landmark") || "",
      items: cart.map(item => ({
         productId: item.id,
         name: item.name,
         price: item.price,
         quantity: item.quantity
      })),
      subtotal,
      deliveryFee,
      total: total,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await addDoc(collection(db, "orders"), orderData);
      
      const itemsList = cart.map(item => `- ${item.name} (عدد: ${item.quantity})`).join("\n");
      const message = `*طلب جديد من مجمع محمد علاء* 🏍️\n\n` +
                      `*رقم الطلب:* ${orderNumber}\n` +
                      `*الاسم:* ${customerName}\n` +
                      `*الهاتف:* ${phoneNumber}\n` +
                      `*طريقة الاستلام:* ${method === 'delivery' ? 'توصيل منزلي' : 'استلام من المجمع'}\n` +
                      `*المنتجات:*\n${itemsList}\n\n` +
                      `*المجموع الكلي:* ${total.toLocaleString()} د.ع\n\n` +
                      `شكراً لطلبكم! سيتم التواصل معكم لتأكيد الطلب.`;

      const whatsappUrl = `https://wa.me/9647858833838?text=${encodeURIComponent(message)}`;
      
      toast({ title: "تم بنجاح", description: "تم استلام طلبك، جاري توجيهك للواتساب للتأكيد." });
      
      clearCart();
      window.open(whatsappUrl, '_blank');
      router.push("/orders");
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في إتمام الطلب، حاول مرة أخرى." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#FDF8F5]">
      <main className="flex-1 pb-40">
        <div className="p-6 flex items-center gap-4 bg-white border-b sticky top-0 z-30">
          <Link href="/cart">
             <Button variant="ghost" size="icon" className="rounded-full bg-muted/50">
                <ChevronLeft className="h-6 w-6 rotate-180" />
             </Button>
          </Link>
          <h1 className="text-2xl font-black">إتمام الطلب</h1>
        </div>

        <form id="checkout-form" onSubmit={handlePlaceOrder} className="container p-4 space-y-6">
          <section className="bg-white p-6 rounded-[28px] shadow-sm border space-y-4">
             <h3 className="text-lg font-black flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" /> معلومات التواصل
             </h3>
             <div className="grid gap-4">
                <div className="space-y-2">
                   <Label className="font-bold">الاسم الكامل</Label>
                   <Input name="customerName" required placeholder="مثال: علي محمد" className="rounded-xl h-12 bg-muted/30 border-none" />
                </div>
                <div className="space-y-2">
                   <Label className="font-bold">رقم الهاتف</Label>
                   <Input name="phoneNumber" required placeholder="07XXXXXXXXX" className="rounded-xl h-12 bg-muted/30 border-none text-left" dir="ltr" />
                </div>
             </div>
          </section>

          <section className="bg-white p-6 rounded-[28px] shadow-sm border space-y-4">
             <h3 className="text-lg font-black flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> طريقة الاستلام
             </h3>
             <RadioGroup defaultValue="delivery" className="grid gap-4" onValueChange={setMethod}>
                <Label
                  htmlFor="delivery"
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${method === 'delivery' ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5" />
                    <div><p className="font-bold">توصيل منزلي</p><p className="text-[10px] text-muted-foreground">خلال 24 ساعة</p></div>
                  </div>
                  <RadioGroupItem value="delivery" id="delivery" />
                </Label>
                <Label
                  htmlFor="pickup"
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${method === 'pickup' ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <div className="flex items-center gap-3">
                    <Store className="h-5 w-5" />
                    <div><p className="font-bold">استلام من المجمع</p><p className="text-[10px] text-muted-foreground">بغداد، الكرادة</p></div>
                  </div>
                  <RadioGroupItem value="pickup" id="pickup" />
                </Label>
             </RadioGroup>
          </section>

          {method === 'delivery' && (
            <section className="bg-white p-6 rounded-[28px] shadow-sm border space-y-4">
               <h3 className="text-lg font-black flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> عنوان التوصيل
               </h3>
               <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">المنطقة</Label>
                    <Input name="address" required placeholder="مثال: المنصور، شارع 14 رمضان" className="rounded-xl h-12 bg-muted/30 border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">أقرب نقطة دالة</Label>
                    <Input name="landmark" placeholder="مثال: قرب مطعم البركة" className="rounded-xl h-12 bg-muted/30 border-none" />
                  </div>
               </div>
            </section>
          )}
        </form>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t rounded-t-[32px] shadow-2xl z-40">
         <div className="container space-y-4">
            <div className="flex items-center justify-between text-xl">
               <span className="font-black">الإجمالي:</span>
               <span className="font-black text-primary">{total.toLocaleString()} د.ع</span>
            </div>
            <Button 
              type="submit" 
              form="checkout-form" 
              className="w-full h-14 rounded-full text-lg font-black shadow-lg"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "تأكيد الطلب الآن"}
            </Button>
         </div>
      </div>
    </div>
  );
}
