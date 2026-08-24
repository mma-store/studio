
'use client';

import { use, useMemo } from "react";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useTenantData } from "@/hooks/use-tenant-data";
import { StoreHeader } from "@/components/store/store-header";
import { StoreBottomNav } from "@/components/store/store-bottom-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, CheckCircle2, ChevronLeft, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const statusMap: any = {
  pending: { label: "جديد", color: "bg-orange-100 text-orange-700", icon: Clock },
  processing: { label: "قيد المعالجة", color: "bg-blue-100 text-blue-700", icon: Package },
  preparing: { label: "قيد التجهيز", color: "bg-purple-100 text-purple-700", icon: Package },
  ready: { label: "جاهز", color: "bg-indigo-100 text-indigo-700", icon: CheckCircle2 },
  shipped: { label: "تم التوصيل", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  cancelled: { label: "ملغي", color: "bg-red-100 text-red-700", icon: Clock },
};

export default function StoreOrdersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { tenant, loading: tenantLoading } = useTenantData(slug);
  const { user } = useUser();
  const db = useFirestore();

  const ordersQuery = useMemo(() => {
    if (!tenant || !user) return null;
    return query(
      collection(db, 'orders'),
      where('tenantId', '==', tenant.tenantId),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, tenant, user]);

  const { data: orders, loading } = useCollection(ordersQuery);

  if (tenantLoading) return null;

  return (
    <div className="pb-32 min-h-screen bg-background" dir="rtl">
      <StoreHeader tenant={tenant} />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
        <h1 className="text-3xl font-black tracking-tight">طلباتي</h1>

        {loading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-[32px]" />)
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order: any) => {
              const status = statusMap[order.status] || statusMap.pending;
              const Icon = status.icon;
              return (
                <div key={order.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5 space-y-4 hover:shadow-md transition-shadow cursor-pointer group">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary"><Package className="h-5 w-5" /></div>
                         <div><p className="font-black text-sm">{order.orderNumber}</p><p className="text-[10px] font-bold opacity-40 uppercase">{new Date(order.createdAt).toLocaleDateString("ar-EG")}</p></div>
                      </div>
                      <Badge className={cn("rounded-full border-none font-black text-[9px] gap-1.5 px-3 py-1", status.color)}>
                         <Icon className="h-3 w-3" /> {status.label}
                      </Badge>
                   </div>

                   <div className="flex flex-wrap gap-2 pt-2">
                      {order.items?.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="bg-muted/30 px-3 py-1.5 rounded-full text-[10px] font-bold">
                           {item.name} × {item.quantity}
                        </div>
                      ))}
                      {order.items?.length > 3 && <div className="px-3 py-1.5 rounded-full text-[10px] font-bold opacity-40">+{order.items.length - 3} أخرى</div>}
                   </div>

                   <div className="h-px bg-black/5" />

                   <div className="flex items-center justify-between pt-2">
                      <div><p className="text-[10px] font-bold opacity-40 uppercase">إجمالي الطلب</p><p className="text-xl font-black text-primary">{order.total?.toLocaleString()} <span className="text-xs">د.ع</span></p></div>
                      <div className="h-10 w-10 rounded-full border-2 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all"><ChevronLeft className="h-5 w-5" /></div>
                   </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center opacity-30">
             <Package className="h-16 w-16 mx-auto mb-4" />
             <p className="font-black text-xl">لا توجد طلبات سابقة في هذا المتجر</p>
          </div>
        )}
      </main>

      <StoreBottomNav slug={slug} />
    </div>
  );
}
