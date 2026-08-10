"use client";

import { Bell, Search, ShoppingCart, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";

interface HeaderProps {
  logo?: string;
  storeName?: string;
  slug?: string;
}

export function Header({ logo, storeName, slug }: HeaderProps) {
  const { totalItems } = useCart();
  const homeHref = slug ? `/store/${slug}` : "/";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href={homeHref} className="flex items-center gap-3">
            {logo ? (
              <div className="relative h-14 w-40">
                <Image 
                  src={logo} 
                  alt={storeName || "متجر دوبسار"} 
                  fill 
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                 <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                    <ScrollText className="h-6 w-6" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xl font-black tracking-tighter text-primary">{storeName || 'دوبسار'}</span>
                    <span className="text-[8px] font-black text-secondary uppercase tracking-[0.3em] opacity-80 leading-none">DUBSAR STORE</span>
                 </div>
              </div>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href={slug ? `/store/${slug}/search` : "/search"}>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted text-foreground">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-muted text-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="rounded-r-[32px] w-[85%] sm:w-[400px]">
               <SheetHeader>
                  <SheetTitle className="text-2xl font-black text-right">الإشعارات</SheetTitle>
               </SheetHeader>
               <div className="flex flex-col items-center justify-center h-full text-center gap-4 opacity-30">
                  <Bell className="h-16 w-16" strokeWidth={1} />
                  <p className="font-bold text-foreground">لا توجد إشعارات جديدة حالياً</p>
               </div>
            </SheetContent>
          </Sheet>

          <Link href={slug ? `/store/${slug}/cart` : "/cart"}>
            <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-muted text-foreground">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white font-bold animate-in zoom-in duration-300">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}