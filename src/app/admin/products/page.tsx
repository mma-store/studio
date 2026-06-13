
'use client';

import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Image as ImageIcon,
  ArrowUpDown,
  Download,
  Trash2,
  Edit2,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function ProductsManagementPage() {
  const db = useFirestore();
  const productsQuery = useMemo(() => query(collection(db, 'products'), orderBy('createdAt', 'desc')), [db]);
  const { data: products, loading } = useCollection(productsQuery);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.barcode?.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">إدارة المنتجات</h1>
          <p className="text-muted-foreground font-medium text-sm">إضافة، تعديل، وحذف قطع الغيار والاكسسوارات.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl border-2 font-bold h-11 gap-2">
             <Download className="h-4 w-4" /> تصدير Excel
           </Button>
           <Button className="rounded-xl font-bold h-11 shadow-lg shadow-primary/20 gap-2">
             <Plus className="h-5 w-5" /> إضافة منتج جديد
           </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="بحث بالاسم، الباركود، أو الفئة..." 
            className="h-12 rounded-xl bg-white dark:bg-card pr-10 border-none shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 rounded-xl border-none shadow-sm bg-white dark:bg-card px-6 gap-2 font-bold">
           <Filter className="h-4 w-4" /> تصفية
        </Button>
        <Button variant="outline" className="h-12 rounded-xl border-none shadow-sm bg-white dark:bg-card px-6 gap-2 font-bold">
           <ArrowUpDown className="h-4 w-4" /> ترتيب حسب
        </Button>
      </div>

      <div className="rounded-[32px] border-none bg-white dark:bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[50px]"><Checkbox className="rounded-md border-2" /></TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest py-5">المنتج</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">التصنيف</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">السعر (مفرد)</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">المخزون</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">الحالة</TableHead>
              <TableHead className="text-left font-black text-xs uppercase tracking-widest">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><div className="flex items-center gap-3"><Skeleton className="h-12 w-12 rounded-xl" /><Skeleton className="h-4 w-32" /></div></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-muted/5 transition-colors group">
                  <TableCell><Checkbox className="rounded-md border-2" /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 py-1">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-muted shadow-inner">
                        <Image 
                          src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/100/100`} 
                          alt={p.name} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm leading-tight">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">{p.barcode || 'لا يوجد باركود'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-full bg-muted/50 text-[10px] font-bold px-3">{p.category}</Badge>
                  </TableCell>
                  <TableCell className="font-black text-primary">{p.retailPrice?.toLocaleString()} د.ع</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                       <span className={cn("font-bold text-sm", p.stock < 10 ? "text-destructive" : "")}>{p.stock} قطعة</span>
                       <span className="text-[10px] text-muted-foreground font-medium">{p.storageLocation || 'غير محدد'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "rounded-full px-3 py-1 border-none font-bold text-[10px]",
                      p.status === 'available' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                       {p.status === 'available' ? 'متوفر' : 'غير متوفر'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-muted"><MoreHorizontal className="h-5 w-5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48">
                        <DropdownMenuLabel className="font-bold">الإجراءات</DropdownMenuLabel>
                        <DropdownMenuItem className="rounded-xl gap-2 font-medium cursor-pointer"><Eye className="h-4 w-4" /> عرض التفاصيل</DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl gap-2 font-medium cursor-pointer"><Edit2 className="h-4 w-4" /> تعديل المنتج</DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl gap-2 font-medium cursor-pointer text-destructive"><Trash2 className="h-4 w-4" /> حذف المنتج</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 opacity-20" />
                    <p className="font-bold">لا توجد منتجات مطابقة للبحث</p>
                    <Button onClick={() => setSearchQuery("")} variant="link" className="text-primary font-bold">مسح البحث</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Placeholder */}
      <div className="flex items-center justify-between px-2 pt-4">
         <p className="text-xs text-muted-foreground font-bold">عرض 1-10 من أصل {filteredProducts.length} منتج</p>
         <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl border-2 font-bold px-4" disabled>السابق</Button>
            <Button variant="outline" size="sm" className="rounded-xl border-2 font-bold px-4">التالي</Button>
         </div>
      </div>
    </div>
  );
}
