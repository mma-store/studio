'use client';

import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Star, 
  ChevronLeft,
  Settings2,
  TrendingUp,
  Tags
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where, limit, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Home() {
  const db = useFirestore();
  const [activeBanner, setActiveBanner] = useState(0);

  const bannersQuery = useMemo(() => query(collection(db, 'banners'), where('isActive', '==', true)), [db]);
  const typesQuery = useMemo(() => collection(db, 'motorcycleTypes'), [db]);
  const categoriesQuery = useMemo(() => query(collection(db, 'categories'), limit(6)), [db]);
  const featuredQuery = useMemo(() => query(collection(db, 'products'), where('isFeatured', '==', true), limit(8)), [db]);
  const newArrivalsQuery = useMemo(() => query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(12)), [db]);
  const offersQuery = useMemo(() => collection(db, 'offers'), [db]);

  const { data: banners, loading: bannersLoading } = useCollection(bannersQuery);
  const { data: types, loading: typesLoading } = useCollection(typesQuery);
  const { data: categories, loading: categoriesLoading } = useCollection(categoriesQuery);
  const { data: featuredProducts, loading: featuredLoading } = useCollection(featuredQuery);
  const { data: newArrivals, loading: newLoading } = useCollection(newArrivalsQuery);
  const { data: offers, loading: offersLoading } = useCollection(offersQuery);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setActiveBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  return (
    <div className="flex min-h-screen bg-[#FDF8F5] text-foreground transition-colors">
      <main className="flex-1 pb-24 overflow-x-hidden">
        <Header />
        
        <div className="container mx-auto space-y-6 md:space-y-10 py-4 px-4 max-w-7xl">
          {/* Hero Banner Section */}
          <section className="relative">
            <div className="relative aspect-[16/9] sm:aspect-[2.4/1] w-full overflow-hidden rounded-[24px] md:rounded-[40px] shadow-lg bg-muted border">
              {bannersLoading ? (
                <Skeleton className="h-full w-full" />
              ) : banners.length > 0 ? (
                banners.map((banner: any, idx) => (
                  <div 
                    key={banner.id}
                    className={cn(
                      "absolute inset-0 transition-all duration-1000 ease-in-out",
                      idx === activeBanner ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
                    )}
                  >
                    <Image 
                      src={banner.image || "https://picsum.photos/seed/banner/1200/600"} 
                      alt={banner.title}
                      fill
                      className="object-cover"
                      priority={idx === 0}
                    />
                    <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-center gap-2 bg-gradient-to-r from-black/70 via-black/20 to-transparent">
                      <h2 className="text-2xl md:text-6xl font-black text-white max-w-[280px] md:max-w-2xl leading-tight drop-shadow-xl">
                        {banner.title}
                      </h2>
                      <p className="text-xs md:text-xl text-white/90 font-medium max-w-[200px] md:max-w-lg line-clamp-2">
                        {banner.subtitle}
                      </p>
                      <Link href={banner.link || "/catalog"}>
                        <Button size="lg" className="w-fit mt-4 rounded-full font-black px-8 h-10 md:h-14 text-sm md:text-lg shadow-2xl">
                          اكتشف الآن
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground bg-muted/20 gap-2">
                   <Zap className="h-10 w-10 opacity-20" />
                   <p className="font-black text-lg">مجمع محمد علاء للدرجات</p>
                </div>
              )}
            </div>
          </section>

          {/* Motorcycle Types */}
          <section className="space-y-4">
            <h3 className="text-lg md:text-2xl font-black flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" /> أنواع الدراجات
            </h3>
            <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-2 px-1">
              {typesLoading ? (
                Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-16 md:h-24 md:w-24 rounded-full shrink-0" />)
              ) : types.map((type: any) => (
                <div key={type.id} className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer">
                  <div className="relative h-16 w-16 md:h-24 md:w-24 rounded-full border-2 border-primary/5 p-1 group-hover:border-primary transition-all duration-300 bg-white shadow-sm hover:shadow-md">
                    <div className="relative h-full w-full overflow-hidden rounded-full">
                      <Image src={type.image || "https://picsum.photos/seed/type/200/200"} alt={type.name} fill className="object-cover transition-transform group-hover:scale-110" />
                    </div>
                  </div>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-tighter opacity-80 group-hover:opacity-100">{type.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Categories Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg md:text-2xl font-black flex items-center gap-3">
                <Settings2 className="h-6 w-6 text-primary" /> تسوق حسب الفئة
              </h3>
              <Link href="/catalog" className="text-primary font-black text-sm hover:underline">عرض الكل</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-5">
              {categoriesLoading ? (
                Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-28 md:h-36 rounded-2xl" />)
              ) : categories.map((cat: any) => (
                <Link key={cat.id} href={`/catalog/${cat.id}`} className="group relative h-28 md:h-36 overflow-hidden rounded-3xl shadow-sm border bg-white">
                  <Image src={cat.image || "https://picsum.photos/seed/cat/300/300"} alt={cat.name} fill className="object-cover opacity-40 group-hover:opacity-60 transition-all duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                    <span className="font-black text-sm md:text-base leading-tight drop-shadow-sm group-hover:text-primary transition-colors">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured Products */}
          <section className="space-y-4">
            <h3 className="text-lg md:text-2xl font-black flex items-center gap-3">
              <Zap className="h-6 w-6 text-primary" /> مختاراتنا المميزة
            </h3>
            <div className="flex gap-4 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 overflow-x-auto no-scrollbar pb-6 px-1">
              {featuredLoading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="min-w-[170px] md:min-w-0 h-64 rounded-[32px]" />)
              ) : featuredProducts.map((p: any) => (
                <div key={p.id} className="min-w-[170px] md:min-w-0">
                  <ProductCard 
                    id={p.id}
                    name={p.name}
                    category={p.category}
                    price={p.retailPrice.toLocaleString()}
                    image={p.images?.[0]}
                    inStock={p.stock > 0}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Special Offers */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offersLoading ? (
              <Skeleton className="h-44 w-full rounded-[32px]" />
            ) : offers.map((offer: any) => (
              <div key={offer.id} className="relative overflow-hidden rounded-[32px] bg-slate-900 p-6 md:p-10 text-white group cursor-pointer shadow-xl">
                 <div className="relative z-10 space-y-3">
                    <Badge className="bg-primary hover:bg-primary border-none font-black px-4 py-1">عرض حصري</Badge>
                    <h3 className="text-2xl md:text-4xl font-black leading-none">{offer.title}</h3>
                    <p className="text-xs md:text-lg opacity-80 font-medium max-w-[240px] md:max-w-md">{offer.description}</p>
                    <Button variant="secondary" className="rounded-full font-black px-8 mt-4 transition-transform group-hover:scale-105">استفد من العرض</Button>
                 </div>
                 {offer.image && <Image src={offer.image} alt={offer.title} fill className="object-cover opacity-20 group-hover:scale-110 transition-transform duration-1000" />}
                 <div className="absolute -right-8 -bottom-8 h-32 w-32 bg-primary/20 rounded-full blur-3xl" />
              </div>
            ))}
          </section>

          {/* New Arrivals */}
          <section className="space-y-4">
            <h3 className="text-lg md:text-2xl font-black flex items-center gap-3">
              <Star className="h-6 w-6 text-primary" /> أحدث المنتجات المضافة
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-6">
              {newLoading ? (
                Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-[32px]" />)
              ) : newArrivals.map((p: any) => (
                <ProductCard 
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  category={p.category}
                  price={p.retailPrice.toLocaleString()}
                  image={p.images?.[0]}
                  inStock={p.stock > 0}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}