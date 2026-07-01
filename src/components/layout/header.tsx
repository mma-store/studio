
"use client";

import { Bell, Search, ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";

export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground">
              MMA
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/search">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-muted">
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
                  <p className="font-bold">لا توجد إشعارات جديدة حالياً</p>
               </div>
            </SheetContent>
          </Sheet>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-muted">
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
