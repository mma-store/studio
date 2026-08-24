
'use client';

import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ClipboardList, User, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import NextLink from "next/link";

export function StoreBottomNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const baseUrl = `/store/${slug}`;
  const { totalItems } = useCart();

  const NAV_ITEMS = [
    { label: "الرئيسية", icon: Home, href: `${baseUrl}` },
    { label: "الأقسام", icon: LayoutGrid, href: `${baseUrl}/catalog` },
    { label: "السلة", icon: ShoppingBag, href: `${baseUrl}/cart`, badge: totalItems },
    { label: "طلباتي", icon: ClipboardList, href: `${baseUrl}/orders` },
    { label: "حسابي", icon: User, href: `/profile` },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg h-20 bg-white/80 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 flex items-center justify-around px-4 no-print">
      {NAV_ITEMS.map((item) => {
        // Ensure active state only triggers for correct sub-paths
        const isActive = pathname === item.href || (item.href !== baseUrl && pathname?.startsWith(item.href));
        const Icon = item.icon;

        return (
          <NextLink
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 transition-all duration-300 px-4 py-2 rounded-2xl relative",
              isActive ? "text-primary scale-110" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <div className="relative">
              <Icon className={cn("h-6 w-6 transition-all", isActive && "stroke-[3px]")} />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={cn("text-[9px] font-black tracking-tight", isActive ? "opacity-100" : "opacity-0 h-0")}>
              {item.label}
            </span>
            {isActive && <div className="absolute -bottom-1 h-1 w-4 rounded-full bg-primary" />}
          </NextLink>
        );
      })}
    </nav>
  );
}
