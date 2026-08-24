
'use client';

import Image from "next/image";
import Link from "next/link";
import { Plus, Heart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { toast } from "@/hooks/use-toast";
import { getOptimizedUrl } from "@/lib/cloudinary";

export function StoreProductCard({ slug, product }: { slug: string, product: any }) {
  const { addToCart } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
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
    <Link href={`/product/${product.id}`} className="block">
      <div className="group bg-white rounded-[32px] p-2 shadow-sm border border-black/5 hover:shadow-xl transition-all duration-500 overflow-hidden relative">
         <div className="relative aspect-square rounded-[26px] overflow-hidden bg-muted/30">
            <Image 
              src={getOptimizedUrl(product.images?.[0], { thumbnail: true })} 
              alt={product.name} 
              fill 
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
               <Heart className="h-4 w-4 text-slate-400" />
            </button>
         </div>
         
         <div className="p-3 space-y-1">
            <h4 className="text-xs font-black line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h4>
            <p className="text-[10px] font-bold text-slate-400">{product.category}</p>
            
            <div className="flex items-center justify-between pt-2">
               <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black text-primary">{product.retailPrice?.toLocaleString()}</span>
                  <span className="text-[8px] font-bold opacity-40">د.ع</span>
               </div>
               <button 
                onClick={handleAdd}
                className="h-8 w-8 rounded-xl bg-black text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                style={{ backgroundColor: 'var(--store-primary)' }}
               >
                  <Plus className="h-4 w-4" />
               </button>
            </div>
         </div>
      </div>
    </Link>
  );
}
