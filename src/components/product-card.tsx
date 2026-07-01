"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  rating?: number;
  inStock?: boolean;
}

export function ProductCard({ id, name, price, image, category, rating = 4.8, inStock = true }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    
    addToCart({
      id,
      name,
      price: parseInt(price.replace(/,/g, '')),
      quantity: 1,
      image: image || "https://picsum.photos/seed/placeholder/300/300"
    });
    
    toast({ 
      title: "تمت الإضافة", 
      description: `تم إضافة ${name} إلى السلة بنجاح.`,
      duration: 2000
    });
  };

  return (
    <Card className="group relative overflow-hidden rounded-[24px] md:rounded-[32px] border-none bg-white dark:bg-card shadow-sm hover:shadow-xl transition-all duration-500 w-full animate-in fade-in slide-in-from-bottom-2">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/product/${id}`}>
          <Image
            src={image || "https://picsum.photos/seed/placeholder/400/400"}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        
        <div className="absolute top-2 left-2 md:top-3 md:left-3">
          {!inStock ? (
            <Badge variant="destructive" className="border-none text-[8px] md:text-[10px] px-2 py-0.5 rounded-full font-black uppercase shadow-lg">
              نفذت
            </Badge>
          ) : (
             <Badge variant="secondary" className="bg-white/90 backdrop-blur-md text-black border-none text-[8px] md:text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm">
                جديد
             </Badge>
          )}
        </div>

        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-2 right-2 md:top-3 md:right-3 h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-md hover:bg-white transition-all active:scale-90 z-20"
        >
          <Heart className={cn("h-4 w-4 md:h-5 md:w-5 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
        </button>
      </div>

      <CardContent className="p-3 md:p-5 space-y-1.5 md:space-y-2">
        <div className="flex items-center justify-between text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest">
          <span className="truncate max-w-[65%]">{category}</span>
          <div className="flex items-center gap-0.5 text-orange-400">
            <Star className="h-2.5 w-2.5 md:h-3 md:w-3 fill-current" />
            <span>{rating}</span>
          </div>
        </div>

        <Link href={`/product/${id}`}>
          <h3 className="font-bold text-xs md:text-base line-clamp-1 leading-tight group-hover:text-primary transition-colors duration-300">
            {name}
          </h3>
        </Link>

        <div className="flex items-center justify-between pt-1 md:pt-2">
          <div className="flex flex-col -space-y-1">
            <span className="text-sm md:text-xl font-black text-primary tracking-tighter">{price}</span>
            <span className="text-[8px] md:text-[10px] text-muted-foreground font-bold">د.ع</span>
          </div>
          
          <Button 
            size="icon" 
            disabled={!inStock}
            className="rounded-2xl h-8 w-8 md:h-11 md:w-11 shadow-lg shadow-primary/20 active:scale-90 transition-all"
            onClick={handleQuickAdd}
          >
            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}