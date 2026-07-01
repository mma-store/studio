
'use client';

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
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Tags,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import { useState, useMemo, React } from "react";
import { ProductCard } from "@/components/product-card";
import { useFirestore, useDoc, useCollection, useUser } from "@/firebase";
import { doc, collection, query, where, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { toast } from "@/hooks/use-toast";
import { useParams, useRouter } from "next/navigation";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const db = useFirestore();
  const { profile } = useUser();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const productRef = useMemo(() => id && id !== 'default' ? doc(db, 'products', id) : null, [db, id]);
  const { data: product, loading: productLoading } = useDoc<any>(productRef);

  const relatedQuery = useMemo(() => 
    product ? query(collection(db, 'products'), where('category', '==', product.category), limit(4)) : null,
    [db, product]
  );
  const { data: relatedProducts, loading: relatedLoading } = useCollection(relatedQuery);

  const isWholesale = profile?.role === 'wholesale_customer';
  const displayPrice = isWholesale ? (product?.wholesalePrice || product?.retailPrice) : product?.retailPrice;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice || 0,
      quantity: quantity,
      image: product.images?.[0] || "https://picsum.photos/seed/placeholder/300/300"
    });
    toast({ title: "تمت الإضافة", description: `تم إضافة ${product.name} إلى السلة.` });
  };

  if (productLoading && id !== 'default') {
    return (
      <div className="flex min-h-screen bg-background">
        <main className="flex-1 pb-24">
          <div className="p-4 space-y-6">
            <Skeleton className="aspect-square w-full rounded-[32px]" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!product && id !== 'default') {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-black text-muted-foreground">المنتج غير موجود 🏍️</h2>
        <Button onClick={() => router.back()}>العودة للخلف</Button>
      </div>
    );
  }

  const rawImages = product?.images || [];
  const images = rawImages.length > 0 ? rawImages.filter((img: string) => img && img.trim() !== "") : ["https://picsum.photos/seed/placeholder/800/800"];

  return (
    <div className="flex min-h-screen bg-white dark:bg-background">
      <main className="flex-1 pb-32">
        {/* Mobile Custom Header */}
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white/10 backdrop-blur-md md:hidden">
           <button onClick={() => router.back()} className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-md border text-black">
              <ChevronRight className="h-6 w-6" />
           </button>
           <div className="flex gap-2">
              <button onClick={() => setIsFavorite(!isFavorite)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-md border">
                 <Heart className={cn("h-5 w-5", isFavorite ? "fill-red-500 text-red-500" : "text-slate-400")} />
              </button>
              <button className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-md border">
                 <Share2 className="h-5 w-5 text-slate-600" />
              </button>
           </div>
        </div>

        <div className="md:pt-0">
          <div className="hidden md:block"><Header /></div>
          
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-12">
              
              {/* Product Gallery Section */}
              <div className="relative">
                 <div className="relative aspect-square w-full md:rounded-[40px] overflow-hidden bg-muted flex items-center justify-center">
                    <Image 
                      src={images[activeImage]} 
                      alt={product.name} 
                      fill 
                      className="object-contain p-4 md:p-0" // Contain to show full part details
                      priority
                    />
                 </div>
                 
                 {/* Thumbnails Overlay */}
                 {images.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
                       <div className="flex gap-2 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-lg overflow-x-auto no-scrollbar max-w-full">
                          {images.map((img: string, i: number) => (
                            <button 
                              key={i} 
                              onClick={() => setActiveImage(i)}
                              className={cn(
                                "relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                                i === activeImage ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-60'
                              )}
                            >
                              <Image src={img} alt={`Thumb ${i}`} fill className="object-cover" />
                            </button>
                          ))}
                       </div>
                    </div>
                 )}
              </div>

              {/* Product Info Section */}
              <div className="p-6 md:p-10 space-y-6">
                 <div className="space-y-3">
                   <div className="flex items-center justify-between">
                      <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1 rounded-full text-[10px] uppercase tracking-widest">
                        {product.category || "قطع غيار"}
                      </Badge>
                      <div className="flex items-center gap-1 text-orange-400 font-black">
                         <Star className="h-4 w-4 fill-current" />
                         <span className="text-xs">4.8</span>
                      </div>
                   </div>
                   
                   <h1 className="text-2xl md:text-5xl font-black leading-tight text-foreground">{product.name}</h1>
                   
                   <div className="flex items-baseline gap-2 pt-2">
                      <span className="text-3xl md:text-6xl font-black text-primary tracking-tighter">
                        {displayPrice?.toLocaleString()}
                      </span>
                      <span className="text-sm md:text-xl text-muted-foreground font-black">د.ع</span>
                      {isWholesale && (
                         <Badge variant="outline" className="mr-2 rounded-full border-primary text-primary bg-primary/5 text-[10px] font-black">
                           سعر جملة
                         </Badge>
                      )}
                   </div>
                   
                   {product.stock <= 5 && product.stock > 0 && (
                      <p className="text-destructive font-black text-xs">⚠️ متبقي {product.stock} قطع فقط في المخزن!</p>
                   )}
                 </div>

                 <div className="grid grid-cols-3 gap-3 md:gap-6 border-y py-6">
                   <div className="flex flex-col items-center gap-2 text-center">
                     <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <ShieldCheck className="h-6 w-6" />
                     </div>
                     <span className="text-[9px] font-black uppercase opacity-60 leading-none">أصلي<br/>ضمان 100%</span>
                   </div>
                   <div className="flex flex-col items-center gap-2 text-center border-x">
                     <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Truck className="h-6 w-6" />
                     </div>
                     <span className="text-[9px] font-black uppercase opacity-60 leading-none">توصيل<br/>سريع وآمن</span>
                   </div>
                   <div className="flex flex-col items-center gap-2 text-center">
                     <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <RotateCcw className="h-6 w-6" />
                     </div>
                     <span className="text-[9px] font-black uppercase opacity-60 leading-none">سهولة<br/>الاسترجاع</span>
                   </div>
                 </div>

                 <div className="space-y-3">
                    <h4 className="font-black text-lg">الوصف والتفاصيل</h4>
                    <p className="text-muted-foreground leading-relaxed font-medium text-sm whitespace-pre-line bg-muted/20 p-4 rounded-2xl">
                      {product.description || "لا يوجد وصف متوفر لهذا المنتج حالياً. يرجى التواصل معنا لمزيد من المعلومات."}
                    </p>
                 </div>
              </div>
            </div>

            {/* Related Products */}
            <section className="p-6 md:mt-20 space-y-6">
              <h3 className="text-xl font-black tracking-tight">منتجات قد تهمك</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-4">
                {relatedLoading ? (
                  Array(4).fill(0).map((_, i) => <Skeleton key={i} className="min-w-[160px] h-48 rounded-[28px]" />)
                ) : relatedProducts.map((p: any) => (
                  <div key={p.id} className="min-w-[160px] md:min-w-[250px]">
                    <ProductCard 
                      id={p.id}
                      name={p.name}
                      category={p.category}
                      price={isWholesale ? (p.wholesalePrice || p.retailPrice).toLocaleString() : p.retailPrice.toLocaleString()}
                      image={p.images?.[0]}
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Floating Sticky Action Bar for Mobile/Desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-card/90 backdrop-blur-xl border-t p-4 md:p-6 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
         <div className="container mx-auto max-w-7xl flex items-center gap-4">
            <div className="flex items-center gap-4 rounded-full border bg-muted/30 h-12 md:h-14 px-4 shadow-inner">
               <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-primary hover:text-white transition-all"
               >
                  <Minus className="h-4 w-4" />
               </button>
               <span className="text-lg font-black w-6 text-center">{quantity}</span>
               <button 
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white shadow hover:bg-primary hover:text-white transition-all"
               >
                  <Plus className="h-4 w-4" />
               </button>
            </div>

            <Button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 h-12 md:h-14 rounded-full text-base md:text-lg font-black shadow-xl shadow-primary/20 gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              {product.stock === 0 ? "نفذت الكمية" : "إضافة للسلة"}
            </Button>
         </div>
      </div>

      <div className="md:hidden"><BottomNav /></div>
    </div>
  );
}
