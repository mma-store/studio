
"use client";

import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, ChevronLeft, Package, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const ORDERS = [
  { 
    id: "#MMA-2451", 
    date: "12 أكتوبر 2023", 
    status: "processing", 
    statusText: "قيد المعالجة", 
    total: "145,000",
    itemsCount: 2
  },
  { 
    id: "#MMA-2120", 
    date: "05 أكتوبر 2023", 
    status: "delivered", 
    statusText: "تم التسليم", 
    total: "85,000",
    itemsCount: 1
  },
  { 
    id: "#MMA-1980", 
    date: "28 سبتمبر 2023", 
    status: "delivered", 
    statusText: "تم التسليم", 
    total: "25,000",
    itemsCount: 1
  },
];

export default function OrdersPage() {
  return (
    <div className="flex min-h-screen bg-[#FDF8F5]">
      <main className="flex-1 pb-24">
        <Header />
        
        <div className="container p-6 space-y-6">
          <h1 className="text-3xl font-black tracking-tight">طلباتي</h1>

          <div className="space-y-4">
            {ORDERS.map((order) => (
              <div key={order.id} className="bg-white p-5 rounded-[28px] shadow-sm border border-transparent hover:border-primary/20 transition-all flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Package className="h-5 w-5 text-primary" />
                       <span className="font-black text-sm">{order.id}</span>
                    </div>
                    <Badge className={
                      order.status === 'processing' 
                        ? "bg-blue-100 text-blue-700 border-none" 
                        : "bg-green-100 text-green-700 border-none"
                    }>
                       {order.status === 'processing' ? <Clock className="h-3 w-3 mr-1" /> : <CheckCircle2 className="h-3 w-3 mr-1" />}
                       {order.statusText}
                    </Badge>
                 </div>

                 <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>التاريخ: {order.date}</span>
                    <span>عدد المنتجات: {order.itemsCount}</span>
                 </div>

                 <div className="h-px bg-muted" />

                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-[10px] text-muted-foreground font-bold">إجمالي المبلغ</p>
                       <p className="text-xl font-black text-primary">{order.total} د.ع</p>
                    </div>
                    <Button variant="outline" className="rounded-full border-2 border-primary/20 text-xs font-bold px-6">
                       تفاصيل الطلب
                    </Button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
