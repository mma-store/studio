
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function StoreBottomNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const baseUrl = `/store/${slug}`;

  const NAV_ITEMS = [
    { label: "الرئيسية", icon: Home, href: `${baseUrl}` },
    { label: "الأقسام", icon: LayoutGrid, href: `${baseUrl}/catalog` },
    { label: "طلباتي", icon: ClipboardList, href: `${baseUrl}/orders` },
    { label: "حسابي", icon: User, href: `/profile` },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md h-18 bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-black/5 flex items-center justify-around px-4">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== baseUrl && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-300 px-4 py-2 rounded-2xl",
              isActive ? "text-primary" : "text-slate-400"
            )}
          >
            <div className={cn(
              "transition-all duration-300",
              isActive && "scale-110"
            )}>
              <Icon className="h-6 w-6" />
            </div>
            <span className={cn("text-[10px] font-black", isActive ? "opacity-100" : "opacity-0 h-0")}>
              {item.label}
            </span>
            {isActive && <div className="h-1 w-1 rounded-full bg-primary mt-0.5" />}
          </Link>
        );
      })}
    </nav>
  );
}
