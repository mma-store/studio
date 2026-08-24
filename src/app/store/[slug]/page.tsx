
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
import { Search, SlidersHorizontal, ChevronLeft, Zap, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="pb-32 animate-in fade-in duration-500" dir="rtl">
      <StoreHeader tenant={tenant} />
      
      <main className="container mx-auto px-4 space-y-10 mt-6 max-w-4xl">
        {/* Universal Search */}
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40" />
          <input 
            type="text" 
            placeholder="ابحث عن منتج أو قسم..." 
            className="w-full h-16 rounded-[24px] border-none shadow-sm pr-12 pl-12 font-bold text-base focus:ring-2 transition-all bg-white/50 backdrop-blur-sm"
          />
          <button className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
            <SlidersHorizontal className="h-4 w-4" style={{ color: 'var(--store-primary)' }} />
          </button>
        </div>

        {/* Dynamic Hero Slider */}
        <section className="relative overflow-hidden rounded-[40px] shadow-lg">
          {bannersLoading ? (
            <Skeleton className="aspect-[2.4/1] w-full" />
          ) : banners.length > 0 ? (
            <Carousel opts={{ loop: true, direction: 'rtl' }}>
              <CarouselContent>
                {banners.map((b: any) => (
                  <CarouselItem key={b.id}>
                    <div className="relative aspect-[2.4/1] w-full group">
                       <Image src={b.image} alt={b.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-10 flex flex-col justify-end text-white">
                          <h2 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">{b.title}</h2>
                          <p className="text-sm md:text-lg font-bold opacity-90 max-w-md line-clamp-2">{b.subtitle}</p>
                          <Button className="mt-6 w-fit h-12 px-8 rounded-full bg-white text-black hover:bg-white/90 font-black text-xs uppercase tracking-widest shadow-xl">اكتشف الآن</Button>
                       </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <div className="aspect-[2.4/1] bg-muted/20 flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-[40px] opacity-40">
               <Package className="h-12 w-12" />
               <p className="font-black text-sm">لا توجد عروض ترويجية حالياً</p>
            </div>
          )}
        </section>

        {/* Circular Categories */}
        <section className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tight">الأقسام الرئيسية</h3>
              <Link href={`/store/${slug}/catalog`} className="text-xs font-black opacity-40 hover:opacity-100 flex items-center gap-1 transition-all">
                عرض الكل <ChevronLeft className="h-3 w-3" />
              </Link>
           </div>
           <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
              {categoriesLoading ? (
                Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-24 rounded-full shrink-0" />)
              ) : categories.map((cat: any) => (
                <StoreCategoryItem key={cat.id} slug={slug} category={cat} />
              ))}
           </div>
        </section>

        {/* Featured Products Grid */}
        <section className="space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500" /> منتجات مختارة لك
              </h3>
              <Link href={`/store/${slug}/catalog`} className="text-xs font-black opacity-40 hover:opacity-100 transition-all">مشاهدة الجميع</Link>
           </div>
           
           {featuredLoading ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
               {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-[32px]" />)}
             </div>
           ) : featuredProducts.length > 0 ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
               {featuredProducts.map((p: any) => (
                 <StoreProductCard key={p.id} slug={slug} product={p} />
               ))}
             </div>
           ) : (
             <div className="py-20 text-center opacity-20">
                <Package className="h-16 w-16 mx-auto mb-4" />
                <p className="font-black text-xl">لا توجد منتجات مميزة مضافة</p>
             </div>
           )}
        </section>
      </main>

      <StoreBottomNav slug={slug} />
    </div>
  );
}
