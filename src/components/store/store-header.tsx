
'use client';

import { ShoppingBag, Bell, MapPin, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";

export function StoreHeader({ tenant }: { tenant: any }) {
  const { totalItems } = useCart();
  const LOGO_PLACEHOLDER = "https://up6.cc/2026/07/178308238964931.png";
  const baseUrl = `/store/${tenant?.slug}`;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5 px-4 h-24 no-print">
      <div className="container mx-auto h-full flex items-center justify-between max-w-4xl">
        <div className="flex items-center gap-4">
           <Link href={baseUrl}>
             <div className="relative h-14 w-14 rounded-2xl overflow-hidden shadow-sm border bg-white group transition-all hover:scale-105 active:scale-95">
                <Image 
                  src={tenant?.logo || LOGO_PLACEHOLDER} 
                  alt={tenant?.businessName} 
                  fill 
                  className="object-contain p-2"
                />
             </div>
           </Link>
           <div className="flex flex-col">
              <h1 className="text-xl font-black leading-none tracking-tight">{tenant?.businessName}</h1>
              <div className="flex items-center gap-1 opacity-50 mt-1.5">
                 <MapPin className="h-3 w-3" />
                 <span className="text-[10px] font-bold">{tenant?.address || 'الموقع غير محدد'}</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-2">
           <Link href={`${baseUrl}/search`}>
              <button className="h-12 w-12 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
                 <Search className="h-6 w-6" />
              </button>
           </Link>
           <Link href={`${baseUrl}/cart`}>
             <button className="h-12 w-12 flex items-center justify-center rounded-full bg-black/5 relative hover:bg-black/10 transition-all active:scale-90">
                <ShoppingBag className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-primary text-white text-[11px] font-black flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in duration-300">
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
