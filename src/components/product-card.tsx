
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

export function ProductCard({ id, name, price, image, category, rating = 4.5, inStock = true }: ProductCardProps) {
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
    <Card className="group relative overflow-hidden rounded-[24px] border-none bg-card shadow-sm hover:shadow-md transition-all duration-300 w-full">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/product/${id}`}>
          <Image
            src={image || "https://picsum.photos/seed/placeholder/400/400"}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        
        <div className="absolute top-2 left-2">
          {!inStock && (
            <Badge variant="secondary" className="bg-destructive/10 text-destructive border-none text-[8px] px-2 py-0.5 rounded-full">
              نفذت الكمية
            </Badge>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 rounded-full bg-white/70 backdrop-blur-sm border-none shadow-sm hover:bg-white h-8 w-8"
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart className={cn("h-4 w-4 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
        </Button>
      </div>

      <CardContent className="p-3 space-y-1">
        <div className="flex items-center justify-between text-[8px] text-muted-foreground font-black uppercase tracking-wider">
          <span className="truncate max-w-[70%]">{category}</span>
          <div className="flex items-center gap-0.5 text-orange-400">
            <Star className="h-2 w-2 fill-current" />
            <span>{rating}</span>
          </div>
        </div>

        <Link href={`/product/${id}`}>
          <h3 className="font-bold text-xs line-clamp-1 leading-tight group-hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <span className="text-sm font-black text-primary">{price}</span>
            <span className="text-[8px] text-muted-foreground font-bold">د.ع</span>
          </div>
          
          <Button 
            size="icon" 
            disabled={!inStock}
            className="rounded-full h-8 w-8 shadow-sm active:scale-90 transition-all"
            onClick={handleQuickAdd}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
