'use client';

import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Star, Settings2, Loader2, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, use } from "react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where, limit, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantData } from "@/hooks/use-tenant-data";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export default function TenantStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const db = useFirestore();
  const { tenant, loading: tenantLoading, error } = useTenantData(slug);

  const bannersQuery = useMemo(() => 
    tenant ? query(collection(db, 'banners'), where('tenantId', '==', tenant.tenantId), where('isActive', '==', true)) : null, 
  [db, tenant]);
  
  const categoriesQuery = useMemo(() => 
    tenant ? query(collection(db, 'categories'), where('tenantId', '==', tenant.tenantId), limit(6)) : null, 
  [db, tenant]);
  
  const featuredQuery = useMemo(() => 
    tenant ? query(collection(db, 'products'), where('tenantId', '==', tenant.tenantId), where('isFeatured', '==', true), limit(8)) : null, 
  [db, tenant]);

  const { data: banners, loading: bannersLoading } = useCollection(bannersQuery);
  const { data: categories, loading: categoriesLoading } = useCollection(categoriesQuery);
  const { data: featuredProducts, loading: featuredLoading } = useCollection(featuredQuery);

  if (tenantLoading) return (
    <div className="flex h-screen items-center justify-center">
       <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
    </div>
  );

  if (error || !tenant) return (
    <div className="flex h-screen flex-col items-center justify-center p-8 text-center gap-4">
       <Store className="h-20 w-20 opacity-10" />
       <h1 className="text-2xl font-black">{error || 'المتجر غير متاح'}</h1>
       <Link href="/"><Button className="rounded-full px-10">العودة للمنصة</Button></Link>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FDF8F5] dark:bg-background text-foreground transition-colors">
      <main className="flex-1 pb-24 overflow-x-hidden">
        <Header logo={tenant.logo} storeName={tenant.businessName} slug={tenant.slug} />
        
        <div className="container mx-auto space-y-6 md:space-y-10 py-4 px-4 max-w-7xl">
          {/* Hero Slider */}
          <section className="relative">
            <div className="relative w-full overflow-hidden rounded-[40px] shadow-2xl bg-muted border border-border/50">
              {bannersLoading ? <Skeleton className="aspect-[2.4/1] w-full" /> : banners.length > 0 ? (
                <Carousel opts={{ align: "start", loop: true, direction: "rtl" }} className="w-full">
                  <CarouselContent>
                    {banners.map((banner: any) => (
                      <CarouselItem key={banner.id}>
                        <div className="relative aspect-[16/9] sm:aspect-[2.4/1] w-full overflow-hidden">
                          <Image src={banner.image} alt={banner.title} fill className="object-cover" priority />
                          <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-center gap-2">
                            <h2 className="text-2xl md:text-6xl font-black text-white max-w-2xl leading-tight drop-shadow-lg">{banner.title}</h2>
                            <p className="text-xs md:text-xl text-white/90 font-bold max-w-lg line-clamp-2">{banner.subtitle}</p>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              ) : (
                <div className="aspect-[2.4/1] w-full flex flex-col items-center justify-center bg-muted/20 gap-2">
                   <p className="font-black text-lg">{tenant.businessName}</p>
                </div>
              )}
            </div>
          </section>

          {/* Categories */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg md:text-2xl font-black flex items-center gap-3">
                <Settings2 className="h-6 w-6 text-primary" /> الأقسام
              </h3>
              <Link href={`/store/${tenant.slug}/catalog`} className="text-primary font-black text-sm hover:underline">عرض الكل</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {categoriesLoading ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />) : categories.map((cat: any) => (
                <Link key={cat.id} href={`/store/${tenant.slug}/catalog?cat=${cat.name}`} className="group relative h-28 overflow-hidden rounded-3xl shadow-sm border bg-white dark:bg-card">
                  <Image src={cat.image || "https://picsum.photos/seed/cat/300/300"} alt={cat.name} fill className="object-cover opacity-40 group-hover:opacity-60 transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                    <span className="font-black text-sm leading-tight group-hover:text-primary transition-colors">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured */}
          <section className="space-y-4">
            <h3 className="text-lg md:text-2xl font-black flex items-center gap-3"><Zap className="h-6 w-6 text-primary" /> مختارات مميزة</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {featuredLoading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-[32px]" />) : featuredProducts.map((p: any) => (
                <ProductCard key={p.id} id={p.id} name={p.name} category={p.category} price={p.retailPrice.toLocaleString()} image={p.images?.[0]} inStock={p.stock > 0} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <BottomNav slug={tenant.slug} />
    </div>
  );
}