
'use client';

import Image from "next/image";
import Link from "next/link";
import { Plus, Heart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { toast } from "@/hooks/use-toast";
import { getOptimizedUrl } from "@/lib/cloudinary";

export function StoreProductCard({ slug, product }: { slug: string, product: any }) {
  const { addToCart } = useCart();
  const productUrl = `/store/${slug}/product/${product.id}`;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.retailPrice,
      quantity: 1,
      image: product.images?.[0] || ""
    });
    toast({ title: "تمت الإضافة", description: product.name });
  };

  return (
    <Link href={productUrl} className="block">
      <div className="group bg-white rounded-[32px] p-2 shadow-sm border border-black/5 hover:shadow-xl transition-all duration-500 overflow-hidden relative h-full flex flex-col">
         <div className="relative aspect-square rounded-[26px] overflow-hidden bg-muted/30">
            <Image 
              src={getOptimizedUrl(product.images?.[0], { thumbnail: true })} 
              alt={product.name} 
              fill 
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <button 
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
               <Heart className="h-4 w-4 text-slate-400" />
            </button>
         </div>
         
         <div className="p-3 space-y-1 flex-1 flex flex-col justify-between">
            <div>
               <h4 className="text-xs font-black line-clamp-2 group-hover:text-primary transition-colors min-h-[2rem]">{product.name}</h4>
               <p className="text-[10px] font-bold text-slate-400 mt-1">{product.category}</p>
            </div>
            
            <div className="flex items-center justify-between pt-3">
               <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black text-primary">{product.retailPrice?.toLocaleString()}</span>
                  <span className="text-[8px] font-bold opacity-40">د.ع</span>
               </div>
               <button 
                onClick={handleAdd}
                className="h-9 w-9 rounded-xl bg-black text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform hover:scale-105"
                style={{ backgroundColor: 'var(--store-primary)' }}
               >
                  <Plus className="h-5 w-5" />
               </button>
            </div>
         </div>
      </div>
    </Link>
  );
}
