
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

  // Dynamic Queries - No more mock data
  const bannersQuery = useMemo(() => query(collection(db, 'banners'), where('isActive', '==', true)), [db]);
  const typesQuery = useMemo(() => collection(db, 'motorcycleTypes'), [db]);
  const categoriesQuery = useMemo(() => query(collection(db, 'categories'), limit(6)), [db]);
  const featuredQuery = useMemo(() => query(collection(db, 'products'), where('isFeatured', '==', true), limit(6)), [db]);
  const newArrivalsQuery = useMemo(() => query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(10)), [db]);
  const offersQuery = useMemo(() => collection(db, 'offers'), [db]);

  const { data: banners, loading: bannersLoading } = useCollection(bannersQuery);
  const { data: types, loading: typesLoading } = useCollection(typesQuery);
  const { data: categories, loading: categoriesLoading } = useCollection(categoriesQuery);
  const { data: featuredProducts, loading: featuredLoading } = useCollection(featuredQuery);
  const { data: newArrivals, loading: newLoading } = useCollection(newArrivalsQuery);
  const { data: offers, loading: offersLoading } = useCollection(offersQuery);

  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setActiveBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  return (
    <div className="flex min-h-screen bg-[#FDF8F5] text-foreground">
      <main className="flex-1 pb-24 overflow-x-hidden">
        <Header />
        
        <div className="container space-y-8 animate-fade-in pb-10 max-w-full overflow-x-hidden">
          {/* Hero Banner Section */}
          <section className="relative px-4 pt-4">
            <div className="relative h-[180px] md:h-[400px] w-full overflow-hidden rounded-[28px] shadow-lg bg-muted">
              {bannersLoading ? (
                <Skeleton className="h-full w-full" />
              ) : banners.length > 0 ? (
                banners.map((banner: any, idx) => (
                  <div 
                    key={banner.id}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-700",
                      idx === activeBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    )}
                  >
                    <Image 
                      src={banner.image || "https://picsum.photos/seed/moto_banner/1200/500"} 
                      alt={banner.title}
                      fill
                      className="object-cover"
                      priority={idx === 0}
                    />
                    <div className="absolute inset-0 p-5 flex flex-col justify-center gap-1 bg-gradient-to-r from-black/60 via-transparent to-transparent">
                      <h2 className="text-xl md:text-5xl font-black text-white max-w-[200px] md:max-w-md leading-tight">
                        {banner.title}
                      </h2>
                      <p className="text-xs md:text-xl text-white/80 line-clamp-1 md:line-clamp-none">
                        {banner.subtitle}
                      </p>
                      <Link href={banner.link || "/catalog"}>
                        <Button size="sm" className="w-fit mt-2 rounded-full font-bold px-6">
                          تسوق الآن
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-muted/20">
                   <p className="font-bold">أهلاً بك في مجمع محمد علاء</p>
                </div>
              )}
            </div>
          </section>

          {/* Motorcycle Types */}
          <section className="space-y-4 px-4 overflow-hidden">
            <h3 className="text-lg font-black flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> أنواع الدراجات
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {typesLoading ? (
                Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-16 rounded-full shrink-0" />)
              ) : types.map((type: any) => (
                <div key={type.id} className="flex flex-col items-center gap-2 shrink-0 group">
                  <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-full border-2 border-primary/10 p-1 group-hover:border-primary transition-all">
                    <div className="relative h-full w-full overflow-hidden rounded-full">
                      <Image src={type.image || `https://picsum.photos/seed/${type.id}/200/200`} alt={type.name} fill className="object-cover" />
                    </div>
                  </div>
                  <span className="text-[10px] font-black">{type.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Categories */}
          <section className="space-y-4 px-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" /> التصنيفات
              </h3>
              <Link href="/catalog" className="text-primary font-black text-xs">عرض الكل</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {categoriesLoading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
              ) : categories.map((cat: any) => (
                <Link key={cat.id} href={`/catalog/${cat.id}`}>
                  <div className="relative h-28 overflow-hidden rounded-2xl shadow-sm border bg-white group">
                    <Image src={cat.image} alt={cat.name} fill className="object-cover opacity-60 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 flex items-center justify-center p-2 text-center">
                      <span className="font-black text-sm drop-shadow-md">{cat.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured Products */}
          <section className="space-y-4 px-4">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" /> مختاراتنا لك
            </h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              {featuredLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="min-w-[160px] h-60 rounded-3xl" />)
              ) : featuredProducts.map((p: any) => (
                <div key={p.id} className="min-w-[160px] md:min-w-[220px]">
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
          <section className="px-4">
            {offersLoading ? (
              <Skeleton className="h-40 w-full rounded-3xl" />
            ) : offers.map((offer: any) => (
              <div key={offer.id} className="relative overflow-hidden rounded-[32px] bg-slate-900 p-8 text-white mb-4">
                 <div className="relative z-10 space-y-2">
                    <Badge className="bg-primary border-none">عرض خاص</Badge>
                    <h3 className="text-2xl font-black">{offer.title}</h3>
                    <p className="text-sm opacity-80">{offer.description}</p>
                 </div>
                 {offer.image && <Image src={offer.image} alt={offer.title} fill className="object-cover opacity-30" />}
              </div>
            ))}
          </section>

          {/* New Arrivals */}
          <section className="space-y-4 px-4">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" /> أحدث المنتجات
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newLoading ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-60 rounded-3xl" />)
              ) : newArrivals.map((p: any) => (
                <ProductCard 
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  category={p.category}
                  price={p.retailPrice.toLocaleString()}
                  image={p.images?.[0]}
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
