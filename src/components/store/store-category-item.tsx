
'use client';

import Image from "next/image";
import Link from "next/link";

export function StoreCategoryItem({ slug, category }: { slug: string, category: any }) {
  return (
    <Link href={`/store/${slug}/catalog?cat=${category.name}`} className="flex flex-col items-center gap-2 group shrink-0">
      <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all shadow-sm bg-white p-1">
         <div className="relative h-full w-full rounded-full overflow-hidden bg-muted">
            <Image 
              src={category.image || "https://picsum.photos/seed/cat/200/200"} 
              alt={category.name} 
              fill 
              className="object-cover group-hover:scale-110 transition-transform"
            />
         </div>
      </div>
      <span className="text-[10px] font-black text-center whitespace-nowrap opacity-80">{category.name}</span>
    </Link>
  );
}
