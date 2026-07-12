
"use client";

import { 
  Search, 
  Filter, 
  MessageCircle, 
  MoreVertical,
  Calendar,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Store,
  Printer,
  Edit3
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
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, updateDoc, doc, serverTimestamp, writeBatch, increment, where } from "firebase/firestore";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

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
  const { profile, tenantId } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  const ordersQuery = useMemo(() => query(
    collection(db, 'orders'), 
    where('tenantId', '==', tenantId),
    orderBy('createdAt', 'desc')
  ), [db, tenantId]);
  const { data: orders, loading } = useCollection(ordersQuery);

  const filteredOrders = orders.filter((o: any) => 
    o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.phoneNumber?.includes(searchQuery)
  );

  const updateStatus = async (order: any, newStatus: string) => {
    if (order.status === newStatus) return;

    const batch = writeBatch(db);
    const orderRef = doc(db, "orders", order.id);

    batch.update(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });

    if (newStatus === 'cancelled' && order.status !== 'cancelled') {
      order.items?.forEach((item: any) => {
        if (item.productId) {
          const productRef = doc(db, "products", item.productId);
          batch.update(productRef, { stock: increment(item.quantity) });
        }
      });
    }
    
    batch.commit()
      .then(() => toast({ title: "تم التحديث", description: "تم تغيير حالة الطلب بنجاح." }))
      .catch((err) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: orderRef.path, operation: "update" })));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">سجل القوائم والطلبات</h1>
          <p className="text-muted-foreground font-medium text-sm">البحث، الطباعة، أو تعديل القوائم السابقة.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="relative md:col-span-3">
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="ابحث برقم القائمة أو اسم الزبون..." 
              className="h-14 rounded-2xl bg-white dark:bg-card pr-12 border-none shadow-sm text-lg font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
         <Button variant="outline" className="h-14 rounded-2xl border-none shadow-sm bg-white dark:bg-card px-6 gap-2 font-black">
            <Calendar className="h-5 w-5" /> مبيعات اليوم
         </Button>
      </div>

      <div className="rounded-[32px] border-none bg-white dark:bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-right font-black text-xs uppercase tracking-widest py-5 px-6 text-foreground">رقم القائمة</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest text-foreground">الزبون</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest text-foreground">المبلغ</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest text-foreground">التاريخ</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest text-foreground">الحالة</TableHead>
              <TableHead className="text-left font-black text-xs uppercase tracking-widest px-6 text-foreground">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell className="px-6 text-left"><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order: any) => {
                const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                const Icon = config.icon;

                return (
                  <TableRow key={order.id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="font-black text-sm px-6 text-primary">{order.orderNumber}</TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <span className="font-black text-sm">{order.customerName}</span>
                          <span className="text-[10px] text-muted-foreground font-bold">{order.phoneNumber || 'بدون هاتف'}</span>
                       </div>
                    </TableCell>
                    <TableCell className="font-black text-foreground">{order.total?.toLocaleString()} د.ع</TableCell>
                    <TableCell className="text-[10px] font-black text-muted-foreground">
                       {new Date(order.createdAt).toLocaleString("ar-EG")}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-full px-3 py-1 border font-black text-[9px] gap-1.5 shadow-none", config.color)}>
                         <Icon className="h-3 w-3" />
                         {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-xl h-9 w-9 text-blue-600 hover:bg-blue-50"
                          onClick={() => router.push(`/admin/print/invoice/${order.id}`)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-xl h-9 w-9 text-orange-600 hover:bg-orange-50"
                          onClick={() => router.push(`/admin/pos?edit=${order.id}`)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48 shadow-xl border-none">
                            <DropdownMenuLabel className="font-black text-[10px] uppercase opacity-50 p-2">خيارات الطلب</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-xl gap-2 font-bold cursor-pointer" onClick={() => router.push(`/admin/print/invoice/${order.id}?size=A4`)}>طباعة قياس A4</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl gap-2 font-bold cursor-pointer text-red-600" onClick={() => updateStatus(order, 'cancelled')}>إلغاء القائمة وإرجاع المخزن</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center opacity-30">
                  <Package className="h-16 w-16 mx-auto mb-4" />
                  <p className="font-black text-xl">لا توجد قوائم مطابقة للبحث</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
