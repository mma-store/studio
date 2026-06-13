
'use client';

import { 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  MessageCircle, 
  MoreVertical,
  Calendar,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  XCircle
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
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "قيد الانتظار", icon: Clock, color: "bg-orange-100 text-orange-700 border-orange-200" },
  confirmed: { label: "مؤكد", icon: CheckCircle2, color: "bg-blue-100 text-blue-700 border-blue-200" },
  preparing: { label: "جاري التجهيز", icon: Package, color: "bg-purple-100 text-purple-700 border-purple-200" },
  ready: { label: "جاهز للاستلام", icon: CheckCircle2, color: "bg-green-100 text-green-700 border-green-200" },
  shipped: { label: "تم الشحن", icon: Truck, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  delivered: { label: "تم التسليم", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled: { label: "ملغي", icon: XCircle, color: "bg-red-100 text-red-700 border-red-200" },
};

export default function OrdersManagementPage() {
  const db = useFirestore();
  const ordersQuery = useMemo(() => query(collection(db, 'orders'), orderBy('createdAt', 'desc')), [db]);
  const { data: orders, loading } = useCollection(ordersQuery);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">إدارة الطلبات</h1>
          <p className="text-muted-foreground font-medium text-sm">متابعة حالة المبيعات، تحديث حالات الشحن، وإصدار الفواتير.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="relative md:col-span-2">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="البحث برقم الطلب، اسم العميل، أو الهاتف..." 
              className="h-12 rounded-xl bg-white dark:bg-card pr-10 border-none shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
         <Button variant="outline" className="h-12 rounded-xl border-none shadow-sm bg-white dark:bg-card px-6 gap-2 font-bold">
            <Calendar className="h-4 w-4" /> التاريخ: اليوم
         </Button>
         <Button variant="outline" className="h-12 rounded-xl border-none shadow-sm bg-white dark:bg-card px-6 gap-2 font-bold">
            <Filter className="h-4 w-4" /> تصفية الحالة
         </Button>
      </div>

      <div className="rounded-[32px] border-none bg-white dark:bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-right font-black text-xs uppercase tracking-widest py-5">رقم الطلب</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">العميل</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">التاريخ</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">المبلغ الإجمالي</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">طريقة الاستلام</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">الحالة</TableHead>
              <TableHead className="text-left font-black text-xs uppercase tracking-widest">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-lg text-left" /></TableCell>
                </TableRow>
              ))
            ) : orders.length > 0 ? (
              orders.map((order: any) => {
                const status = (order.status || 'pending') as keyof typeof statusConfig;
                const config = statusConfig[status] || statusConfig.pending;
                const Icon = config.icon;

                return (
                  <TableRow key={order.id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="font-black text-sm">{order.id}</TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <span className="font-bold text-sm">أحمد محمد</span>
                          <span className="text-[10px] text-muted-foreground font-medium">07701234567</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-medium">
                       12/10/2023 <br /> 05:30 م
                    </TableCell>
                    <TableCell className="font-black text-primary">145,000 د.ع</TableCell>
                    <TableCell>
                       <Badge variant="outline" className="rounded-full gap-1 border-primary/20 text-primary text-[10px] font-bold">
                          <Truck className="h-3 w-3" /> توصيل منزلي
                       </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-full px-3 py-1 border font-bold text-[10px] gap-1.5 shadow-none", config.color)}>
                         <Icon className="h-3 w-3" />
                         {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Printer className="h-4 w-4" /></Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48">
                            <DropdownMenuLabel className="font-bold">تحديث الحالة</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-xl gap-2 font-medium cursor-pointer text-blue-600">تأكيد الطلب</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl gap-2 font-medium cursor-pointer text-purple-600">بدء التجهيز</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl gap-2 font-medium cursor-pointer text-emerald-600">تم التسليم</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl gap-2 font-medium cursor-pointer text-red-600">إلغاء الطلب</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <Package className="h-12 w-12 opacity-20" />
                    <p className="font-bold text-lg">لا توجد طلبات حالياً</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
