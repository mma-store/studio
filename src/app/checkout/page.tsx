
"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Phone, Truck, Store, CreditCard, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CheckoutPage() {
  const [method, setMethod] = useState("delivery");

  return (
    <div className="flex min-h-screen bg-[#FDF8F5]">
      <main className="flex-1 pb-40">
        <div className="p-6 flex items-center gap-4 bg-white border-b sticky top-0 z-30">
          <Link href="/cart">
             <Button variant="ghost" size="icon" className="rounded-full bg-muted/50">
                <ChevronLeft className="h-6 w-6 rotate-180" />
             </Button>
          </Link>
          <h1 className="text-2xl font-black">الدفع والشحن</h1>
        </div>

        <div className="container p-4 space-y-6">
          {/* Customer Info */}
          <section className="bg-white p-6 rounded-[32px] shadow-sm space-y-4">
             <h3 className="text-lg font-black flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                معلومات الاتصال
             </h3>
             <div className="grid gap-4">
                <div className="space-y-2">
                   <Label className="font-bold mr-1">الاسم الكامل</Label>
                   <Input placeholder="أدخل اسمك الكامل" className="rounded-2xl h-12 bg-muted/30 border-none" />
                </div>
                <div className="space-y-2">
                   <Label className="font-bold mr-1">رقم الهاتف</Label>
                   <Input placeholder="07XXXXXXXXX" className="rounded-2xl h-12 bg-muted/30 border-none text-left" dir="ltr" />
                </div>
             </div>
          </section>

          {/* Delivery Method */}
          <section className="bg-white p-6 rounded-[32px] shadow-sm space-y-4">
             <h3 className="text-lg font-black flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                طريقة الاستلام
             </h3>
             <RadioGroup defaultValue="delivery" className="grid gap-4" onValueChange={setMethod}>
                <Label
                  htmlFor="delivery"
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${method === 'delivery' ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5" />
                    <div>
                      <p className="font-bold">توصيل للمنزل</p>
                      <p className="text-xs text-muted-foreground">التوصيل خلال 24-48 ساعة</p>
                    </div>
                  </div>
                  <RadioGroupItem value="delivery" id="delivery" />
                </Label>

                <Label
                  htmlFor="pickup"
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${method === 'pickup' ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <div className="flex items-center gap-3">
                    <Store className="h-5 w-5" />
                    <div>
                      <p className="font-bold">استلام من المجمع</p>
                      <p className="text-xs text-muted-foreground">بغداد، شارع الصناعة</p>
                    </div>
                  </div>
                  <RadioGroupItem value="pickup" id="pickup" />
                </Label>
             </RadioGroup>
          </section>

          {/* Address (If delivery) */}
          {method === 'delivery' && (
            <section className="bg-white p-6 rounded-[32px] shadow-sm space-y-4 animate-in slide-in-from-top-2">
               <h3 className="text-lg font-black flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  عنوان التوصيل
               </h3>
               <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold mr-1">المحافظة / المنطقة</Label>
                    <Input placeholder="مثال: بغداد، الكرادة" className="rounded-2xl h-12 bg-muted/30 border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold mr-1">أقرب نقطة دالة</Label>
                    <Input placeholder="مثال: قرب ساحة كهرمانة" className="rounded-2xl h-12 bg-muted/30 border-none" />
                  </div>
               </div>
            </section>
          )}

          {/* Payment Method */}
          <section className="bg-white p-6 rounded-[32px] shadow-sm space-y-4">
             <h3 className="text-lg font-black flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                طريقة الدفع
             </h3>
             <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border-2 border-primary">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white">
                   <span className="font-black text-xs">COD</span>
                </div>
                <div>
                   <p className="font-bold">الدفع عند الاستلام</p>
                   <p className="text-xs text-muted-foreground">ادفع نقداً عند استلام طلبك</p>
                </div>
             </div>
          </section>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
         <div className="container">
            <div className="flex items-center justify-between mb-4">
               <span className="text-lg font-bold">الإجمالي النهائي:</span>
               <span className="text-2xl font-black text-primary underline decoration-primary/20 underline-offset-8">145,000 د.ع</span>
            </div>
            <Button className="w-full h-14 rounded-full text-lg font-black shadow-lg shadow-primary/20">
              تأكيد الطلب الآن
            </Button>
         </div>
      </div>
    </div>
  );
}
