
'use client';

import { use, useMemo } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where, limit, orderBy } from "firebase/firestore";
import { useTenantData } from "@/hooks/use-tenant-data";
import { StoreHeader } from "@/components/store/store-header";
import { StoreBottomNav } from "@/components/store/store-bottom-nav";
import { StoreCategoryItem } from "@/components/store/store-category-item";
import { StoreProductCard } from "@/components/store/store-product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, ChevronLeft, Zap } from "lucide-react";

export default function StoreHomePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const db = useFirestore();
  const { tenant, loading: tenantLoading } = useTenantData(slug);

  const bannersQuery = useMemo(() => 
    tenant ? query(collection(db, 'banners'), where('tenantId', '==', tenant.tenantId), where('isActive', '==', true)) : null, 
  [db, tenant]);
  
  const categoriesQuery = useMemo(() => 
    tenant ? query(collection(db, 'categories'), where('tenantId', '==', tenant.tenantId), limit(8)) : null, 
  [db, tenant]);
  
  const featuredQuery = useMemo(() => 
    tenant ? query(collection(db, 'products'), where('tenantId', '==', tenant.tenantId), where('isFeatured', '==', true), limit(12)) : null, 
  [db, tenant]);

  const { data: banners, loading: bannersLoading } = useCollection(bannersQuery);
  const { data: categories, loading: categoriesLoading } = useCollection(categoriesQuery);
  const { data: featuredProducts, loading: featuredLoading } = useCollection(featuredQuery);

  if (tenantLoading) return null;

  return (
    <div className="pb-32">
      <StoreHeader tenant={tenant} />
      
      <main className="container mx-auto px-4 space-y-8 mt-4 max-w-2xl">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40" />
          <input 
            type="text" 
            placeholder="ابحث عن القهوة المناسبة..." 
            className="w-full h-14 rounded-2xl border-none shadow-sm pr-12 pl-12 font-bold text-sm focus:ring-2 transition-all"
            style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
          />
          <button className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
            <SlidersHorizontal className="h-4 w-4" style={{ color: 'var(--store-primary)' }} />
          </button>
        </div>

        {/* Hero Slider */}
        <section className="relative overflow-hidden rounded-[32px] shadow-sm">
          {bannersLoading ? (
            <Skeleton className="aspect-[2/1] w-full" />
          ) : banners.length > 0 ? (
            <Carousel opts={{ loop: true, direction: 'rtl' }}>
              <CarouselContent>
                {banners.map((b: any) => (
                  <CarouselItem key={b.id}>
                    <div className="relative aspect-[2/1] w-full">
                       <Image src={b.image} alt={b.title} fill className="object-cover" />
                       <div className="absolute inset-0 bg-black/20 p-6 flex flex-col justify-center text-white">
                          <h2 className="text-2xl font-black mb-2">{b.title}</h2>
                          <p className="text-xs font-bold opacity-90">{b.subtitle}</p>
                          <button className="mt-4 w-fit px-6 py-2 rounded-full bg-white text-black font-black text-[10px]">اطلب الآن</button>
                       </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <div className="aspect-[2/1] bg-muted/20 flex items-center justify-center italic text-xs">لا توجد عروض حالياً</div>
          )}
        </section>

        {/* Categories Circle List */}
        <section className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">الأقسام</h3>
              <Link href={`/store/${slug}/catalog`} className="text-xs font-bold opacity-60 flex items-center gap-1">
                عرض الكل <ChevronLeft className="h-3 w-3" />
              </Link>
           </div>
           <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {categoriesLoading ? (
                Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-20 rounded-full shrink-0" />)
              ) : categories.map((cat: any) => (
                <StoreCategoryItem key={cat.id} slug={slug} category={cat} />
              ))}
           </div>
        </section>

        {/* Popular Section */}
        <section className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">شائع</h3>
              <Link href={`/store/${slug}/catalog`} className="text-xs font-bold opacity-60 flex items-center gap-1">
                عرض الكل <ChevronLeft className="h-3 w-3" />
              </Link>
           </div>
           <div className="grid grid-cols-2 gap-4">
              {featuredLoading ? (
                Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-[32px]" />)
              ) : featuredProducts.slice(0, 2).map((p: any) => (
                <StoreProductCard key={p.id} slug={slug} product={p} />
              ))}
           </div>
        </section>

        {/* Featured Selection */}
        <section className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-black flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" /> مختارات مميزة
              </h3>
              <Link href={`/store/${slug}/catalog`} className="text-xs font-bold opacity-60">عرض الكل</Link>
           </div>
           <div className="grid grid-cols-2 gap-4">
              {featuredProducts.slice(2).map((p: any) => (
                <StoreProductCard key={p.id} slug={slug} product={p} />
              ))}
           </div>
        </section>
      </main>

      <StoreBottomNav slug={slug} />
    </div>
  );
}
