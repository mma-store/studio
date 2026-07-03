
'use client';

import { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Truck, 
  Package, 
  ShoppingCart, 
  Trash2, 
  Save, 
  Loader2,
  Printer,
  ArrowUpRight,
  Filter,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function PurchasesPage() {
  const db = useFirestore();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const purchasesQuery = useMemo(() => query(collection(db, 'purchases'), orderBy('timestamp', 'desc')), [db]);
  const { data: purchases, loading } = useCollection(purchasesQuery);

  const filtered = purchases.filter((p: any) => 
    p.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || 
    p.supplierName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">فواتير الشراء والتجهيز</h1>
          <p className="text-muted-foreground font-medium">إدخال بضاعة جديدة للمخزن وإدارة حسابات الموردين.</p>
        </div>
        
        <Link href="/admin/purchases/new">
          <Button className="rounded-xl h-12 px-8 font-black gap-2 shadow-xl shadow-primary/20">
            <Plus className="h-6 w-6" /> فاتورة شراء جديدة
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="بحث برقم الفاتورة أو اسم المورد..." 
            className="h-14 rounded-2xl pr-12 border-none shadow-sm bg-white text-lg font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-14 rounded-2xl bg-white border-none shadow-sm px-8 font-black gap-2">
           <Filter className="h-5 w-5" /> تصفية النتائج
        </Button>
      </div>

      <div className="rounded-[32px] border-none bg-white shadow-sm overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-right py-6 px-6 font-black uppercase text-xs">رقم الفاتورة</TableHead>
              <TableHead className="text-right font-black uppercase text-xs">المورد</TableHead>
              <TableHead className="text-right font-black uppercase text-xs">المبلغ الكلي</TableHead>
              <TableHead className="text-right font-black uppercase text-xs">المسدد</TableHead>
              <TableHead className="text-right font-black uppercase text-xs">التاريخ</TableHead>
              <TableHead className="text-left px-6 font-black uppercase text-xs">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="px-6 text-left"><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-muted/5 transition-colors group">
                  <TableCell className="font-black text-sm px-6 text-primary">{p.invoiceNumber}</TableCell>
                  <TableCell className="font-bold">{p.supplierName}</TableCell>
                  <TableCell className="font-black">{p.total?.toLocaleString()} د.ع</TableCell>
                  <TableCell>
                    <Badge variant={p.unpaidAmount === 0 ? "default" : "outline"} className={p.unpaidAmount === 0 ? "bg-green-100 text-green-700 border-none" : "text-orange-700 border-orange-200"}>
                      {p.paidAmount?.toLocaleString()} د.ع
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] font-bold text-muted-foreground">{new Date(p.timestamp).toLocaleString("ar-EG")}</TableCell>
                  <TableCell className="text-left px-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl text-primary"
                        onClick={() => router.push(`/admin/print/purchase/${p.id}?size=A4`)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center opacity-30">
                  <Truck className="h-16 w-16 mx-auto mb-4" />
                  <p className="font-black text-xl">لا توجد سجلات مشتريات</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
