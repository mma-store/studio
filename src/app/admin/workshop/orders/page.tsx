
'use client';

import { 
  Wrench, 
  Search, 
  Filter, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";

const statusConfig = {
  received: { label: "تم الاستلام", color: "bg-blue-100 text-blue-700 border-blue-200" },
  inspection: { label: "قيد الفحص", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  waiting_parts: { label: "انتظار قطع", color: "bg-orange-100 text-orange-700 border-orange-200" },
  in_progress: { label: "قيد التصليح", color: "bg-purple-100 text-purple-700 border-purple-200" },
  quality_check: { label: "فحص الجودة", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  ready: { label: "جاهز للاستلام", color: "bg-green-100 text-green-700 border-green-200" },
  delivered: { label: "تم التسليم", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled: { label: "ملغي", color: "bg-red-100 text-red-700 border-red-200" },
};

export default function WorkshopOrdersPage() {
  const db = useFirestore();
  const [search, setSearch] = useState("");
  const repairOrdersQuery = useMemo(() => query(collection(db, 'repairOrders'), orderBy('createdAt', 'desc')), [db]);
  const { data: orders, loading } = useCollection(repairOrdersQuery);

  const filtered = orders.filter((o: any) => 
    o.customerName?.toLowerCase().includes(search.toLowerCase()) || 
    o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o.bikeModel?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">أوامر التصليح</h1>
          <p className="text-muted-foreground font-medium text-sm">السجل الكامل لكافة الدراجات التي دخلت ورشة الصيانة.</p>
        </div>
        <Link href="/admin/workshop/new">
          <Button className="rounded-xl h-11 font-bold gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-5 w-5" /> إضافة مهمة صيانة
          </Button>
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="بحث باسم العميل، رقم الطلب، أو موديل الدراجة..." 
            className="h-14 rounded-2xl bg-white border-none shadow-sm pr-12 text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-14 rounded-2xl bg-white border-none shadow-sm px-8 font-black gap-2">
           <Filter className="h-5 w-5" /> الفلاتر
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-56 rounded-[32px]" />)
        ) : filtered.length > 0 ? (
          filtered.map((order: any) => (
            <Link key={order.id} href={`/admin/workshop/${order.id}`}>
               <Card className="rounded-[32px] border-none shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                     <Badge className={cn("rounded-full px-3 py-1 font-bold text-[10px] shadow-none border", statusConfig[order.status as keyof typeof statusConfig]?.color)}>
                        {statusConfig[order.status as keyof typeof statusConfig]?.label}
                     </Badge>
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{order.orderNumber}</span>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div>
                        <h3 className="font-black text-lg">{order.bikeBrand} {order.bikeModel}</h3>
                        <p className="text-sm font-bold text-muted-foreground">{order.customerName}</p>
                     </div>
                     <div className="flex items-center justify-between text-xs text-muted-foreground font-medium pt-2 border-t">
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {new Date(order.createdAt).toLocaleDateString("ar-EG")}</span>
                        <span className="font-black text-primary">{order.totalAmount?.toLocaleString()} د.ع</span>
                     </div>
                     <div className="flex justify-end pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="rounded-full text-xs font-black gap-2">
                           عرض التفاصيل <ChevronRight className="h-3 w-3 rotate-180" />
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full h-64 flex flex-col items-center justify-center opacity-30 gap-4">
             <Wrench className="h-16 w-16" strokeWidth={1} />
             <p className="font-black text-xl">لا توجد نتائج بحث</p>
          </div>
        )}
      </div>
    </div>
  );
}
