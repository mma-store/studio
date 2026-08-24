'use client';

import { StatsCard } from "@/components/admin/stats-card";
import { 
  BadgeDollarSign, 
  ShoppingCart, 
  Users, 
  Wrench, 
  ArrowUpRight, 
  Package, 
  MoreVertical,
  Loader2,
  PlusCircle,
  Settings,
  Rocket,
  Globe,
  Copy,
  ExternalLink,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

const DATA = [
  { name: "سبت", sales: 120000 },
  { name: "أحد", sales: 180000 },
  { name: "اثنين", sales: 150000 },
  { name: "ثلاثاء", sales: 220000 },
  { name: "أربعاء", sales: 300000 },
  { name: "خميس", sales: 250000 },
  { name: "جمعة", sales: 100000 },
];

export default function AdminDashboard() {
  const db = useFirestore();
  const { tenantId, profile } = useUser();
  
  const recentOrdersQuery = useMemo(() => {
    if (!tenantId) return null;
    return query(collection(db, 'orders'), where('tenantId', '==', tenantId), orderBy('createdAt', 'desc'), limit(5));
  }, [db, tenantId]);
  
  const { data: recentOrders, loading: ordersLoading } = useCollection(recentOrdersQuery);

  const lowStockQuery = useMemo(() => {
    if (!tenantId) return null;
    return query(collection(db, 'products'), where('tenantId', '==', tenantId), orderBy('stock', 'asc'), limit(4));
  }, [db, tenantId]);
  
  const { data: lowStockProducts, loading: stockLoading } = useCollection(lowStockQuery);

  const storeUrl = typeof window !== 'undefined' ? `${window.location.origin}/store/${profile?.slug || ''}` : '';

  const copyStoreLink = () => {
    navigator.clipboard.writeText(storeUrl);
    toast({ title: "تم نسخ الرابط", description: "يمكنك الآن مشاركته مع عملائك." });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile?.businessName || 'متجري الإلكتروني',
          text: `تفضل بزيارة متجري الإلكتروني على منصة دوبسار:`,
          url: storeUrl,
        });
      } catch (err) {
        copyStoreLink();
      }
    } else {
      copyStoreLink();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground font-medium text-sm">مرحباً {profile?.displayName}، إليك ملخص أداء متجرك اليوم.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link href={`/store/${profile?.slug}`} target="_blank">
             <Button variant="outline" className="rounded-xl border-2 font-bold h-11 px-6 gap-2">
                <Globe className="h-4 w-4" /> عرض المتجر
             </Button>
           </Link>
           <Link href="/admin/pos">
             <Button className="rounded-xl font-bold h-11 px-8 shadow-lg shadow-primary/20">نقطة بيع POS</Button>
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <Card className="lg:col-span-2 rounded-[32px] border-none shadow-xl bg-primary text-white p-8 relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
                     <Rocket className="h-7 w-7" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black italic">متجرك الإلكتروني مفعّل!</h3>
                     <p className="text-xs text-white/70 font-medium">رابطك المباشر للطلبات الأونلاين.</p>
                  </div>
               </div>
               <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4">
                  <code className="text-xs font-mono font-bold truncate flex-1" dir="ltr">{storeUrl || '/store/...'}</code>
                  <div className="flex gap-2 shrink-0">
                     <Button onClick={copyStoreLink} size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-white/20"><Copy className="h-4 w-4" /></Button>
                     <Button onClick={handleShare} size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-white/20"><Share2 className="h-4 w-4" /></Button>
                     <Link href={`/store/${profile?.slug}`} target="_blank">
                        <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-white/20"><ExternalLink className="h-4 w-4" /></Button>
                     </Link>
                  </div>
               </div>
               <p className="text-[10px] font-bold opacity-60">* شارك الرابط مع زبائنك لزيادة مبيعاتك عبر الإنترنت.</p>
            </div>
            <Globe className="absolute -right-10 -bottom-10 h-48 w-48 opacity-10 group-hover:rotate-12 transition-transform duration-1000" />
         </Card>

         <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatsCard 
              title="إجمالي المبيعات" 
              value="0 د.ع" 
              icon={BadgeDollarSign} 
              color="green"
            />
            <StatsCard 
              title="الطلبات الجديدة" 
              value="0" 
              icon={ShoppingCart} 
              color="orange"
            />
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 rounded-[32px] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
             <div className="space-y-1">
               <CardTitle className="text-xl font-black">نظرة عامة على المبيعات</CardTitle>
               <CardDescription className="font-medium">تحليل المبيعات الأسبوعي</CardDescription>
             </div>
             <Button variant="ghost" size="icon" className="rounded-xl"><MoreVertical className="h-5 w-5" /></Button>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-2xl bg-white dark:bg-card p-4 shadow-xl border border-border">
                          <p className="text-xs font-black text-muted-foreground uppercase mb-1">{payload[0].payload.name}</p>
                          <p className="text-lg font-black text-primary">{payload[0].value?.toLocaleString()} د.ع</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="sales" 
                  fill="hsl(var(--primary))" 
                  radius={[8, 8, 8, 8]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 rounded-[32px] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
             <div className="space-y-1">
               <CardTitle className="text-xl font-black">تنبيهات المخزون</CardTitle>
               <CardDescription className="font-medium">منتجات أوشكت على النفاد</CardDescription>
             </div>
             <Link href="/admin/inventory">
               <Button variant="link" className="text-primary font-bold">مشاهدة الكل</Button>
             </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {stockLoading ? (
               Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
            ) : lowStockProducts.length > 0 ? (
              lowStockProducts.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white dark:bg-card border flex items-center justify-center">
                         <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                         <p className="text-sm font-bold truncate max-w-[120px]">{p.name}</p>
                         <p className="text-[10px] text-muted-foreground font-bold">{p.storageLocation || 'مخزن رئيسي'}</p>
                      </div>
                   </div>
                   <div className="text-left">
                      <p className={cn("text-xs font-black", p.stock === 0 ? "text-destructive" : "text-orange-600")}>
                        {p.stock === 0 ? "نفذت" : `تبقي ${p.stock} قطعة`}
                      </p>
                      <Badge variant="outline" className={cn("text-[8px] h-4 rounded-full border-none px-2", p.stock === 0 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700")}>
                        {p.stock === 0 ? "خارج المخزون" : "منخفض"}
                      </Badge>
                   </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground text-xs py-10 font-bold">كافة المنتجات متوفرة بكثرة ✅</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}