
"use client";

import { Bell, Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4 px-4">
        <div className="flex flex-1 items-center gap-4 md:flex-initial">
          <div className="relative w-full max-w-[400px]">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="ابحث عن قطع غيار، دراجة..." 
              className="h-10 rounded-full bg-muted/50 pr-10 focus:bg-background md:w-[300px] lg:w-[400px]"
            />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
              2
            </span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full border md:hidden">
            <User className="h-5 w-5" />
          </Button>
          <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary md:flex">
             <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
