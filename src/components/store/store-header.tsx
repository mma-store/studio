
'use client';

import { ShoppingBag, Bell, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";

export function StoreHeader({ tenant }: { tenant: any }) {
  const { totalItems } = useCart();
  const LOGO_PLACEHOLDER = "https://up6.cc/2026/07/178308238964931.png";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5 px-4 h-20">
      <div className="container mx-auto h-full flex items-center justify-between max-w-2xl">
        <div className="flex items-center gap-3">
           <div className="relative h-12 w-12 rounded-2xl overflow-hidden shadow-sm border bg-white">
              <Image 
                src={tenant?.logo || LOGO_PLACEHOLDER} 
                alt={tenant?.businessName} 
                fill 
                className="object-contain p-1"
              />
           </div>
           <div className="flex flex-col">
              <h1 className="text-lg font-black leading-none">{tenant?.businessName}</h1>
              <div className="flex items-center gap-1 opacity-50 mt-1">
                 <MapPin className="h-2.5 w-2.5" />
                 <span className="text-[9px] font-bold">{tenant?.address || 'الموقع غير محدد'}</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-1">
           <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
              <Bell className="h-5 w-5" />
           </button>
           <Link href={`/store/${tenant?.slug}/cart`}>
             <button className="h-10 w-10 flex items-center justify-center rounded-full bg-black/5 relative">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shadow-lg border-2 border-white">
                    {totalItems}
                  </span>
                )}
             </button>
           </Link>
        </div>
      </div>
    </header>
  );
}
