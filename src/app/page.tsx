
"use client";

import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Star, 
  ArrowLeft,
  ChevronLeft,
  Settings2,
  TrendingUp,
  Tags
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const BANNERS = [
  {
    id: 1,
    title: "أفضل قطع الغيار الأصلية",
    subtitle: "خصم يصل إلى 25% على جميع فلاتر الزيت",
    image: "https://picsum.photos/seed/moto_banner1/1200/500",
    color: "bg-orange-600"
  },
  {
    id: 2,
    title: "تجهيزات السلامة المتطورة",
    subtitle: "مجموعة جديدة من الخوذ الاحترافية وصلت الآن",
    image: "https://picsum.photos/seed/moto_banner2/1200/500",
    color: "bg-blue-600"
  }
];

const TYPES = [
  { id: 1, name: "رياضية", image: "https://picsum.photos/seed/type1/200/200" },
  { id: 2, name: "كلاسيك", image: "https://picsum.photos/seed/type2/200/200" },
  { id: 3, name: "سكوتر", image: "https://picsum.photos/seed/type3/200/200" },
  { id: 4, name: "دفع رباعي", image: "https://picsum.photos/seed/type4/200/200" },
];

const CATEGORIES = [
  { name: "محركات", count: "120 منتج", image: "https://picsum.photos/seed/cat_eng/300/300" },
  { name: "إطارات", count: "45 منتج", image: "https://picsum.photos/seed/cat_tire/300/300" },
  { name: "صيانة", count: "80 منتج", image: "https://picsum.photos/seed/cat_tool/300/300" },
  { name: "إضاءة", count: "30 منتج", image: "https://picsum.photos/seed/cat_light/300/300" },
];

export default function Home() {
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FDF8F5] text-foreground">
      <main className="flex-1 pb-24">
        <Header />
        
        <div className="container space-y-8 animate-fade-in pb-10">
          {/* Hero Banner Section */}
          <section className="relative px-4 pt-6">
            <div className="relative h-[220px] md:h-[350px] w-full overflow-hidden rounded-[32px] shadow-2xl transition-all duration-1000">
              {BANNERS.map((banner, idx) => (
                <div 
                  key={banner.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${idx === activeBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <Image 
                    src={banner.image} 
                    alt={banner.title}
                    fill
                    className="object-cover"
                    priority={idx === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent p-6 flex flex-col justify-center gap-2">
                    <Badge className="w-fit bg-primary text-white border-none text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">
                      عرض حصري
                    </Badge>
                    <h2 className="text-2xl md:text-5xl font-black text-white max-w-xs leading-tight">
                      {banner.title}
                    </h2>
                    <p className="text-sm md:text-xl text-white/90 max-w-sm">
                      {banner.subtitle}
                    </p>
                    <Button className="w-fit mt-4 rounded-full bg-white text-black hover:bg-white/90 font-bold px-8 shadow-lg">
                      اكتشف الآن
                    </Button>
                  </div>
                </div>
              ))}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {BANNERS.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === activeBanner ? 'w-6 bg-primary' : 'w-1.5 bg-white/50'}`} 
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Motorcycle Types */}
          <section className="space-y-4 px-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-black tracking-tight">أنواع الدراجات</h3>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
              {TYPES.map((type) => (
                <div key={type.id} className="flex flex-col items-center gap-3 shrink-0 group cursor-pointer">
                  <div className="relative h-20 w-20 rounded-full border-2 border-primary/20 p-1 transition-all group-hover:border-primary">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-white shadow-inner">
                      <Image src={type.image} alt={type.name} fill className="object-cover" />
                    </div>
                  </div>
                  <span className="text-xs font-bold">{type.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Categories Grid */}
          <section className="space-y-4 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-black tracking-tight">التصنيفات المميزة</h3>
              </div>
              <Link href="/catalog">
                <Button variant="link" className="text-primary font-bold text-sm">
                  عرض الكل <ChevronLeft className="h-4 w-4 mr-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.map((cat) => (
                <div key={cat.name} className="relative h-40 overflow-hidden rounded-[24px] bg-white group cursor-pointer shadow-sm">
                  <Image 
                    src={cat.image} 
                    alt={cat.name} 
                    fill 
                    className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-4">
                    <h4 className="text-white font-black text-lg">{cat.name}</h4>
                    <p className="text-white/80 text-[10px] font-medium">{cat.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Products Scroll */}
          <section className="space-y-4 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-black tracking-tight">منتجات مختارة</h3>
              </div>
            </div>
            <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="min-w-[200px] md:min-w-[250px]">
                  <ProductCard 
                    id={`p-${i}`}
                    name="فلتر زيت محرك أصلي - هوندا"
                    category="محركات"
                    price="25,000"
                    image={`https://picsum.photos/seed/prod_${i}/500/500`}
                    isNew={i === 1}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Special Offers Section */}
          <section className="px-4">
             <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1A1A1A] to-primary p-8 text-white shadow-xl">
               <div className="relative z-10 flex flex-col gap-3">
                 <div className="flex items-center gap-2">
                    <Tags className="h-5 w-5 text-primary-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-widest">عرض اليوم</span>
                 </div>
                 <h3 className="text-3xl font-black max-w-[200px] leading-tight">باقة الصيانة الذهبية</h3>
                 <p className="text-sm text-white/80 max-w-xs">فحص كامل + تبديل زيت + فلاتر بخصم خاص جداً لفترة محدودة</p>
                 <Button className="w-fit mt-2 rounded-full bg-white text-primary font-bold hover:bg-white/90">
                   احجز الآن
                 </Button>
               </div>
               <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
               <div className="absolute -top-10 -right-10 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
             </div>
          </section>

          {/* New Arrivals Grid */}
          <section className="space-y-4 px-4">
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-black tracking-tight">أحدث الإكسسوارات</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[5, 6, 7, 8].map((i) => (
                <ProductCard 
                  key={i}
                  id={`p-${i}`}
                  name="خوذة احترافية مات بلاك - LS2"
                  category="ملابس وتجهيزات"
                  price="115,000"
                  image={`https://picsum.photos/seed/prod_${i}/500/500`}
                />
              ))}
            </div>
            <Button variant="outline" className="w-full rounded-full border-2 border-primary/20 font-bold text-primary py-6">
              مشاهدة المزيد من المنتجات
            </Button>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
