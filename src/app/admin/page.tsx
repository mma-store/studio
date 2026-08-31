
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
  Share2,
  ShieldCheck
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
import { useMemo, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { LicenseManager, LicenseStatus } from "@/core/license/license-manager";

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
  const [license, setLicense] = useState<LicenseStatus | null>(null);
  
  useEffect(() => {
    LicenseManager.verifyStatus().then(setLicense);
  }, []);

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

  const currentSlug = profile?.slug || "";
  const storeUrl = typeof window !== 'undefined' ? `${window.location.origin}/store/${currentSlug}` : '';

  const copyStoreLink = () => {
    if (!currentSlug) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى إعداد رابط المتجر من الإعدادات أولاً." });
      return;
    }
    navigator.clipboard.writeText(storeUrl);
    toast({ title: "تم نسخ الرابط", description: "يمكنك الآن مشاركته مع عملائك." });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* 2.0 Header - License Status */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-black tracking-tight text-foreground">لوحة التحكم</h1>
             {license?.isValid && (
               <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[10px] gap-1 px-3">
                 <ShieldCheck className="h-3 w-3" /> DUBSAR 2.0 ACTIVATED
               </Badge>
             )}
          </div>
          <p className="text-muted-foreground font-medium text-sm">مرحباً {profile?.displayName}، إليك ملخص أداء متجرك المحلي.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/admin/pos">
             <Button className="rounded-xl font-bold h-11 px-8 shadow-lg shadow-primary/20 bg-primary text-white">نقطة بيع POS</Button>
           </Link>
        </div>
      </div>

      {/* Cloud Storefront Add-on Status */}
      <Card className="rounded-[40px] border-none shadow-sm bg-white overflow-hidden">
         <CardContent className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Globe className="h-7 w-7" />
               </div>
               <div>
                  <h3 className="font-black text-lg">المتجر الإلكتروني (إضافة سحابية)</h3>
                  <p className="text-xs text-muted-foreground font-bold" dir="ltr">{currentSlug ? storeUrl : 'لم يتم الإعداد بعد'}</p>
               </div>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" size="sm" className="rounded-xl font-black" onClick={copyStoreLink}><Copy className="h-4 w-4 ml-2" /> نسخ</Button>
               <Link href={currentSlug ? `/store/${currentSlug}` : "/admin/settings"}>
                  <Button size="sm" className="rounded-xl font-black">فتح المتجر <ExternalLink className="h-4 w-4 mr-2" /></Button>
               </Link>
            </div>
         </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <StatsCard 
           title="إجمالي المبيعات (محلي)" 
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
         <StatsCard 
           title="المخزون" 
           value="0" 
           icon={Package} 
           color="blue"
         />
         <StatsCard 
           title="العملاء" 
           value="0" 
           icon={Users} 
           color="purple"
         />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 rounded-[32px] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
             <div className="space-y-1">
               <CardTitle className="text-xl font-black">أداء المبيعات الأسبوعي</CardTitle>
               <CardDescription className="font-medium">تحليل محلي فوري من الجهاز</CardDescription>
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
                        <div className="rounded-2xl bg-white dark:bg-card p-4 shadow-xl border border-border text-right" dir="rtl">
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
