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
  Tags
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
import { useParams } from "next/navigation";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
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
    toast({ title: "تمت الإضافة", description: `تم إضافة ${product.name} إلى سلة التسوق.` });
  };

  if (productLoading && id !== 'default') {
    return (
      <div className="flex min-h-screen bg-background">
        <main className="flex-1 pb-24">
          <Header />
          <div className="container p-6 space-y-6">
            <Skeleton className="aspect-square w-full rounded-[32px]" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!product && id !== 'default') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h2 className="text-xl font-bold text-muted-foreground font-black">عذراً، المنتج غير موجود 🏍️</h2>
      </div>
    );
  }

  const rawImages = product?.images || [];
  const images = rawImages.length > 0 ? rawImages.filter((img: string) => img && img.trim() !== "") : ["https://picsum.photos/seed/placeholder/800/800"];
  if (images.length === 0) images.push("https://picsum.photos/seed/placeholder/800/800");

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 pb-24">
        <Header />
        
        <div className="container mx-auto p-0 md:p-6 lg:p-10 max-w-7xl">
          {product ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
              {/* Product Images Section */}
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-700">
                 <div className="relative aspect-square w-full max-h-[50vh] md:max-h-[70vh] overflow-hidden md:rounded-[40px] bg-muted shadow-2xl border border-white/20">
                   <Image 
                    src={images[activeImage]} 
                    alt={product.name} 
                    fill 
                    className="object-cover transition-all duration-500 hover:scale-105" 
                    priority
                   />
                   <div className="absolute top-6 left-6 flex flex-col gap-3">
                      <button 
                        onClick={() => setIsFavorite(!isFavorite)}
                        className="h-12 w-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-xl shadow-xl hover:bg-white transition-all active:scale-90"
                      >
                        <Heart className={cn("h-6 w-6 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-slate-400")} />
                      </button>
                      <button className="h-12 w-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-xl shadow-xl hover:bg-white transition-all active:scale-90">
                        <Share2 className="h-5 w-5 text-slate-600" />
                      </button>
                   </div>
                 </div>
                 
                 {/* Image Thumbnails */}
                 {images.length > 1 && (
                    <div className="flex gap-4 px-6 md:px-0 overflow-x-auto no-scrollbar pb-2">
                      {images.map((img: string, i: number) => (
                        <button 
                          key={i} 
                          onClick={() => setActiveImage(i)}
                          className={cn(
                            "relative h-20 w-20 md:h-24 md:w-24 shrink-0 overflow-hidden rounded-2xl border-4 transition-all duration-300 shadow-sm",
                            i === activeImage ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-white hover:border-primary/40'
                          )}
                        >
                          <Image src={img} alt={`Thumb ${i}`} fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                 )}
              </div>

              {/* Product Info Section */}
              <div className="flex flex-col gap-8 p-6 md:p-0 animate-in fade-in slide-in-from-left-4 duration-700">
                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1.5 rounded-full text-[10px] md:text-xs uppercase tracking-widest">
                        {product.category || "إكسسوارات"}
                      </Badge>
                      <div className="flex items-center gap-1 text-orange-400 font-black bg-orange-50 px-3 py-1 rounded-full text-xs">
                         <Star className="h-4 w-4 fill-current" />
                         <span>4.9</span>
                         <span className="text-[10px] text-muted-foreground font-bold mr-1">(120 تقييم)</span>
                      </div>
                   </div>
                   
                   <h1 className="text-3xl md:text-5xl font-black leading-tight text-foreground tracking-tight">{product.name}</h1>
                   
                   <div className="flex flex-col gap-2 pt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl md:text-6xl font-black text-primary tracking-tighter">
                          {displayPrice?.toLocaleString()}
                        </span>
                        <span className="text-xl md:text-2xl text-muted-foreground font-black">د.ع</span>
                      </div>
                      {isWholesale && (
                         <div className="flex">
                           <Badge variant="outline" className="rounded-full border-primary text-primary bg-primary/5 gap-1.5 font-black px-4 py-1">
                              <Tags className="h-4 w-4" /> سعر الجملة للشركات
                           </Badge>
                         </div>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <p className="text-destructive font-black text-sm animate-pulse">🔥 متبقي {product.stock} قطع فقط!</p>
                      )}
                   </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="font-black text-lg md:text-xl flex items-center gap-2">
                      <div className="h-1.5 w-6 rounded-full bg-primary" /> التفاصيل والوصف
                    </h4>
                    <p className="text-muted-foreground leading-relaxed font-medium text-sm md:text-base whitespace-pre-line bg-muted/20 p-6 rounded-[28px] border-2 border-dashed border-muted">
                      {product.description || "لا يوجد وصف متوفر لهذا المنتج حالياً."}
                    </p>
                 </div>

                 <div className="grid grid-cols-3 gap-3 md:gap-6 py-2">
                   <div className="flex flex-col items-center gap-3 text-center p-4 rounded-[28px] bg-white border shadow-sm transition-transform hover:scale-105">
                     <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shadow-inner">
                        <ShieldCheck className="h-7 w-7" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-tighter opacity-80 leading-tight">ضمان جودة<br/>أصلي 100%</span>
                   </div>
                   <div className="flex flex-col items-center gap-3 text-center p-4 rounded-[28px] bg-white border shadow-sm transition-transform hover:scale-105">
                     <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                        <Truck className="h-7 w-7" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-tighter opacity-80 leading-tight">توصيل لكافة<br/>المحافظات</span>
                   </div>
                   <div className="flex flex-col items-center gap-3 text-center p-4 rounded-[28px] bg-white border shadow-sm transition-transform hover:scale-105">
                     <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-inner">
                        <RotateCcw className="h-7 w-7" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-tighter opacity-80 leading-tight">سهولة التبديل<br/>والإرجاع</span>
                   </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="sticky bottom-20 md:relative md:bottom-0 flex flex-col sm:flex-row items-center gap-4 bg-white/80 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none p-4 md:p-0 rounded-t-[32px] md:rounded-none shadow-[0_-20px_40px_rgba(0,0,0,0.05)] md:shadow-none z-30">
                    <div className="flex items-center gap-4 rounded-full border-4 border-primary/5 p-1 bg-muted/30 h-16 px-6 w-full sm:w-auto justify-between sm:justify-center">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-xl hover:bg-primary hover:text-white transition-all active:scale-90"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <span className="text-2xl font-black w-10 text-center text-primary">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-xl hover:bg-primary hover:text-white transition-all active:scale-90"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>

                    <Button 
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="w-full h-16 rounded-full text-xl font-black shadow-2xl shadow-primary/30 gap-3 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <ShoppingCart className="h-7 w-7" />
                      {product.stock === 0 ? "نفذت الكمية" : "إضافة للسلة الآن"}
                    </Button>
                 </div>
              </div>
            </div>
          ) : null}

          {/* Related Products Section */}
          {product && (
            <section className="p-6 md:p-0 md:mt-20 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl md:text-3xl font-black tracking-tight">منتجات مشابهة قد تهمك</h3>
                <Button variant="ghost" className="rounded-full font-black text-primary px-6">عرض الكل</Button>
              </div>
              <div className="flex gap-6 overflow-x-auto no-scrollbar -mx-6 px-6 pb-10">
                {relatedLoading ? (
                  Array(4).fill(0).map((_, i) => <Skeleton key={i} className="min-w-[200px] h-[320px] rounded-[32px]" />)
                ) : relatedProducts.map((p: any) => (
                  <div key={p.id} className="min-w-[200px] md:min-w-[250px]">
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
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
