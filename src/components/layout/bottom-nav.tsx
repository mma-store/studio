
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Wrench, Settings, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "الرئيسية", icon: Home, href: "/" },
  { label: "المتجر", icon: ShoppingBag, href: "/catalog" },
  { label: "البحث", icon: Search, href: "/search" },
  { label: "الورشة", icon: Wrench, href: "/workshop" },
  { label: "الإعدادات", icon: Settings, href: "/settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/80 px-4 pb-safe backdrop-blur-lg md:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-200",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className={cn(
              "rounded-full px-5 py-1 transition-all",
              isActive && "bg-primary/10"
            )}>
              <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
