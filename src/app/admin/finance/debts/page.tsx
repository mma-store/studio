
'use client';

import { useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  TrendingUp, 
  ArrowUpRight,
  BadgeDollarSign,
  AlertCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CustomerDebtsPage() {
  const db = useFirestore();
  const [search, setSearch] = useState("");

  const customersQuery = useMemo(() => query(collection(db, 'users'), where('currentBalance', '>', 0), orderBy('currentBalance', 'desc')), [db]);
  const { data: customers, loading } = useCollection(customersQuery);

  const filtered = customers.filter((c: any) => 
    c.displayName?.toLowerCase().includes(search.toLowerCase()) || 
    c.phoneNumber?.includes(search)
  );

  const totalDebts = useMemo(() => customers.reduce((acc, c) => acc + (c.currentBalance || 0), 0), [customers]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black">ديون العملاء</h1>
          <p className="text-muted-foreground font-medium">متابعة الأرصدة المستحقة والذمم المالية للزبائن.</p>
        </div>
        <div className="bg-red-50 text-red-700 px-6 py-4 rounded-[28px] border border-red-100 flex items-center gap-4 shadow-sm">
           <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center">
              <BadgeDollarSign className="h-6 w-6" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">إجمالي الديون المستحقة</p>
              <h3 className="text-2xl font-black">{totalDebts.toLocaleString()} د.ع</h3>
           </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="بحث باسم العميل أو الهاتف..." 
          className="h-12 rounded-xl pr-10 border-none shadow-sm bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-[32px] overflow-hidden bg-white shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-right py-5 px-6">العميل</TableHead>
              <TableHead className="text-right">رقم الهاتف</TableHead>
              <TableHead className="text-right">إجمالي المدفوع</TableHead>
              <TableHead className="text-right">الدين الحالي</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-left px-6">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="px-6"><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((c: any) => (
                <TableRow key={c.id} className="hover:bg-muted/5 transition-colors">
                  <TableCell className="font-black text-sm px-6">{c.displayName}</TableCell>
                  <TableCell className="font-bold text-xs" dir="ltr">{c.phoneNumber}</TableCell>
                  <TableCell className="font-medium text-xs">{(c.totalPaid || 0).toLocaleString()} د.ع</TableCell>
                  <TableCell className="font-black text-red-600">{c.currentBalance?.toLocaleString()} د.ع</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "rounded-full border-none font-black text-[10px]",
                      c.currentBalance > 500000 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                    )}>
                      {c.currentBalance > 500000 ? "دين مرتفع" : "دين معتدل"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left px-6">
                    <div className="flex gap-2">
                       <Link href={`/admin/finance/statements/${c.id}`}>
                          <Button variant="ghost" size="sm" className="rounded-xl font-bold gap-2 text-primary">
                             <FileText className="h-4 w-4" /> كشف حساب
                          </Button>
                       </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 opacity-30 font-bold">لا توجد ديون مستحقة حالياً ✅</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
