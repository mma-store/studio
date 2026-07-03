
"use client";

import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Input } from "@/components/ui/input";
import { Search, History, TrendingUp, X, ChevronLeft, Package, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const db = useFirestore();
  
  const productsQuery = useMemo(() => query(collection(db, 'products'), orderBy('name')), [db]);
  const { data: products, loading } = useCollection(productsQuery);

  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return products.filter((p: any) => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.includes(searchTerm)
    );
  }, [products, searchTerm]);

  return (
    <div className="flex min-h-screen bg-background text-foreground" dir="rtl">
      <main className="flex-1 pb-24">
        <div className="p-4 bg-white dark:bg-card border-b flex flex-col gap-4 sticky top-0 z-30 shadow-sm">
           <div className="flex items-center gap-4">
             <Link href="/">
               <Button variant="ghost" size="icon" className="rounded-full bg-muted/50">
                  <ChevronLeft className="h-6 w-6" />
               </Button>
             </Link>
             <h1 className="text-xl font-black">البحث عن المنتجات</h1>
           </div>
           <div className="relative">
              <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input 
                autoFocus
                placeholder="ابحث عن قطع غيار، دراجة، أو باركود..." 
                className="h-14 rounded-2xl bg-muted/30 pr-12 pl-12 border-none focus:bg-white focus:ring-2 focus:ring-primary/20 text-lg font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full bg-muted text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
           </div>
        </div>

        <div className="container p-6 space-y-8 animate-in fade-in duration-500">
          {!searchTerm ? (
            <>
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="font-black text-sm flex items-center gap-2">
                      <History className="h-4 w-4 text-primary" />
                      عمليات البحث المقترحة
                   </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                   {["فلتر هوندا", "خوذة", "إطارات", "زيوت", "سكوتر"].map((item) => (
                     <Badge 
                      key={item} 
                      variant="secondary" 
                      className="px-5 py-2 rounded-full cursor-pointer hover:bg-primary hover:text-white border-none transition-all font-bold"
                      onClick={() => setSearchTerm(item)}
                     >
                        {item}
                     </Badge>
                   ))}
                </div>
              </section>

              <section className="space-y-4">
                 <h3 className="font-black text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    الأكثر طلباً الآن
                 </h3>
                 <div className="grid gap-3">
                    {["دراجة CBR 600", "تعديل محرك", "إكسسوارات"].map((item, i) => (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 cursor-pointer hover:bg-muted/40 transition-all border border-transparent hover:border-primary/10"
                        onClick={() => setSearchTerm(item)}
                      >
                         <span className="font-bold text-sm">{item}</span>
                         <Search className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                 </div>
              </section>
            </>
          ) : (
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-muted-foreground">نتائج البحث عن: <span className="text-primary">{searchTerm}</span></p>
                  <p className="text-[10px] font-black uppercase opacity-50">{filteredResults.length} نتيجة</p>
               </div>
               
               {loading ? (
                 Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
               ) : filteredResults.length > 0 ? (
                 <div className="grid gap-4">
                    {filteredResults.map((p: any) => (
                      <Link key={p.id} href={`/product/${p.id}`}>
                        <div className="flex gap-4 p-3 bg-white dark:bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all group">
                           <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-muted shrink-0 border">
                              <Image src={p.images?.[0] || "https://picsum.photos/seed/p/200/200"} alt={p.name} fill className="object-cover" />
                           </div>
                           <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                              <h4 className="font-black text-sm truncate group-hover:text-primary transition-colors">{p.name}</h4>
                              <p className="text-[10px] text-muted-foreground font-bold">{p.category}</p>
                              <p className="text-primary font-black text-base">{p.retailPrice?.toLocaleString()} د.ع</p>
                           </div>
                           <div className="flex items-center px-2">
                              <ArrowRight className="h-5 w-5 text-muted-foreground rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
                           </div>
                        </div>
                      </Link>
                    ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center pt-20 text-center gap-4 opacity-30">
                    <Package className="h-20 w-20" strokeWidth={1} />
                    <h3 className="text-xl font-black">لا توجد نتائج</h3>
                    <p className="text-sm font-medium max-w-xs">جرب البحث بكلمة مختلفة أو تصفح الأقسام.</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
