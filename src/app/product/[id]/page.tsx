
"use client";

import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Share2, 
  Minus, 
  Plus, 
  ShoppingCart, 
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const images = [
    "https://picsum.photos/seed/pdet1/800/800",
    "https://picsum.photos/seed/pdet2/800/800",
    "https://picsum.photos/seed/pdet3/800/800"
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 pb-24">
        <Header />
        
        <div className="container p-0 md:p-4">
          {/* Mobile Product Gallery */}
          <div className="relative aspect-square w-full md:hidden bg-muted">
            <Image 
              src={images[activeImage]} 
              alt="Product" 
              fill 
              className="object-cover transition-all duration-500" 
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
               <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-md"
               >
                 <Heart className={isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"} />
               </button>
               <button className="h-10 w-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-md">
                 <Share2 className="h-5 w-5 text-muted-foreground" />
               </button>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`h-2 rounded-full transition-all ${i === activeImage ? 'w-8 bg-primary' : 'w-2 bg-white/50'}`} 
                />
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:p-6">
            {/* Desktop Gallery Hidden on Mobile */}
            <div className="hidden md:flex flex-col gap-4">
               <div className="relative aspect-square w-full overflow-hidden rounded-[32px] bg-muted shadow-lg">
                 <Image src={images[activeImage]} alt="Product" fill className="object-cover" />
               </div>
               <div className="flex gap-4">
                 {images.map((img, i) => (
                   <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={`relative h-24 w-24 overflow-hidden rounded-2xl border-4 transition-all ${i === activeImage ? 'border-primary' : 'border-transparent'}`}
                   >
                     <Image src={img} alt="Thumb" fill className="object-cover" />
                   </button>
                 ))}
               </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-6 p-6 md:p-0">
               <div className="space-y-2">
                 <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">هوندا أصلي</Badge>
                    <div className="flex items-center gap-1 text-orange-400 font-bold">
                       <Star className="h-4 w-4 fill-current" />
                       <span>4.9</span>
                       <span className="text-xs text-muted-foreground font-normal">(120 مراجعة)</span>
                    </div>
                 </div>
                 <h1 className="text-3xl font-black leading-tight text-foreground">فلتر زيت محرك رياضي عالي الأداء - V-TWIN</h1>
                 <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-4xl font-black text-primary">35,000</span>
                    <span className="text-xl text-muted-foreground font-bold">د.ع</span>
                 </div>
               </div>

               <div className="h-px bg-border/50" />

               <div className="space-y-4">
                  <h4 className="font-bold">الوصف</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    تم تصميم فلتر الزيت هذا خصيصاً للمحركات عالية الأداء لتوفير أقصى قدر من الحماية وكفاءة التصفية. مصنوع من مواد عالية الجودة تضمن عمر أطول للمحرك وأداء مثالي في جميع الظروف الجوية.
                  </p>
               </div>

               <div className="grid grid-cols-3 gap-4 py-4">
                 <div className="flex flex-col items-center gap-2 text-center p-3 rounded-2xl bg-muted/30">
                   <ShieldCheck className="h-6 w-6 text-green-600" />
                   <span className="text-[10px] font-bold">ضمان أصلي</span>
                 </div>
                 <div className="flex flex-col items-center gap-2 text-center p-3 rounded-2xl bg-muted/30">
                   <Truck className="h-6 w-6 text-blue-600" />
                   <span className="text-[10px] font-bold">توصيل سريع</span>
                 </div>
                 <div className="flex flex-col items-center gap-2 text-center p-3 rounded-2xl bg-muted/30">
                   <RotateCcw className="h-6 w-6 text-orange-600" />
                   <span className="text-[10px] font-bold">إرجاع خلال 7 أيام</span>
                 </div>
               </div>

               <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-4 rounded-full border-2 border-primary/20 p-1 bg-muted/10 h-14 px-6 w-full sm:w-auto justify-between sm:justify-center">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-sm"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-xl font-black w-8 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-8 w-8 flex items-center justify-center rounded-full bg-primary text-white shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <Button className="w-full h-14 rounded-full text-lg font-black shadow-lg shadow-primary/20 gap-3">
                    <ShoppingCart className="h-6 w-6" />
                    إضافة إلى السلة
                  </Button>
               </div>
            </div>
          </div>

          {/* Related Products */}
          <section className="p-6 space-y-4">
            <h3 className="text-xl font-black">منتجات قد تعجبك</h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="min-w-[180px]">
                  <ProductCard 
                    id={`rel-${i}`}
                    name="زيت محرك اصطناعي 10W40"
                    category="زيوت"
                    price="15,000"
                    image={`https://picsum.photos/seed/rel_${i}/400/400`}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
