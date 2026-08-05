
'use client';

import { useMemo, useState } from "react";
import { 
  Terminal, 
  Key, 
  Webhook, 
  Activity, 
  ShieldAlert, 
  Zap, 
  History, 
  Cpu, 
  Database,
  Search,
  Lock,
  Loader2,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatsCard } from "@/components/admin/stats-card";

export default function PlatformDeveloperDashboard() {
  const db = useFirestore();
  const [search, setSearch] = useState("");
  
  const { data: apiKeys, loading: keysLoading } = useCollection(query(collection(db, 'apiKeys')));
  const { data: webhooks, loading: whLoading } = useCollection(query(collection(db, 'webhooks')));
  const { data: logs, loading: logsLoading } = useCollection(query(collection(db, 'apiLogs'), orderBy('timestamp', 'desc'), limit(50)));

  const stats = useMemo(() => {
    return {
      totalKeys: apiKeys.length,
      activeKeys: apiKeys.filter((k: any) => k.status === 'active').length,
      totalWebhooks: webhooks.length,
      activeWebhooks: webhooks.filter((w: any) => w.enabled).length,
      totalRequestsToday: logs.length // Simplified for MVP
    };
  }, [apiKeys, webhooks, logs]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900">إدارة منصة المطورين</h1>
        <p className="text-muted-foreground font-medium">مراقبة استهلاك الـ API، أداء الـ Webhooks، وحماية موارد المنصة.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="مفاتيح الـ API" value={stats.totalKeys.toString()} icon={Key} color="blue" trend={{ value: "نشط", isUp: true }} />
        <StatsCard title="نقاط الـ Webhook" value={stats.totalWebhooks.toString()} icon={Webhook} color="purple" />
        <StatsCard title="طلبات الـ API اليوم" value={stats.totalRequestsToday.toString()} icon={Zap} color="orange" />
        <StatsCard title="كفاءة التسليم" value="99.8%" icon={TrendingUp} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="bg-slate-900 text-white p-8 border-b border-white/5">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <CardTitle className="text-xl font-black flex items-center gap-3">
                          <Activity className="h-6 w-6 text-primary" /> سجل الطلبات العالمي (API Logs)
                       </CardTitle>
                       <CardDescription className="text-slate-400 font-bold">تتبع حي لكافة محاولات الربط والاتصال.</CardDescription>
                    </div>
                    <Cpu className="h-10 w-10 opacity-10" />
                 </div>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y max-h-[600px] overflow-y-auto">
                    {logsLoading ? (
                      Array(5).fill(0).map((_, i) => <div key={i} className="p-6"><Skeleton className="h-12 w-full rounded-xl" /></div>)
                    ) : logs.length > 0 ? (
                      logs.map((log: any) => (
                        <div key={log.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                "h-11 w-11 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm",
                                log.statusCode >= 400 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                              )}>
                                 {log.statusCode}
                              </div>
                              <div>
                                 <p className="font-black text-sm text-slate-800 uppercase">{log.method} {log.endpoint}</p>
                                 <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                                    <span>Tenant: {log.tenantId}</span>
                                    <span>•</span>
                                    <span>{new Date(log.timestamp).toLocaleString("ar-EG")}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="text-left">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{log.duration}ms</p>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-20 text-center opacity-30 font-bold flex flex-col items-center gap-4">
                         <BarChart3 className="h-12 w-12" />
                         <p>بانتظار استقبال أول طلب API...</p>
                      </div>
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="space-y-8">
           <Card className="rounded-[40px] border-none shadow-xl bg-slate-900 text-white p-10 overflow-hidden relative group">
              <div className="relative z-10 space-y-6">
                 <div className="h-16 w-16 bg-primary rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all">
                    <Lock className="h-8 w-8 text-white" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black italic">Platform Security</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                       يتم مراقبة كافة مفاتيح الـ API بحثاً عن أنماط استخدام غير طبيعية. سيتم حظر أي مفتاح يتجاوز حدود الاستخدام العادل تلقائياً.
                    </p>
                 </div>
              </div>
              <ShieldAlert className="absolute -right-10 -bottom-10 h-48 w-48 opacity-5" />
           </Card>

           <Card className="rounded-[40px] border-none shadow-sm bg-white p-8 space-y-6">
              <h3 className="font-black text-lg flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary" /> إعدادات المطورين العامة</h3>
              <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-muted/20 space-y-3">
                    <Label className="text-[10px] font-black uppercase opacity-40">Rate Limit (Requests/Min)</Label>
                    <div className="flex gap-2">
                       <Input readOnly defaultValue="100" className="h-10 rounded-xl bg-white border-none font-black text-center" />
                       <Button size="sm" variant="outline" className="rounded-xl font-bold">تعديل</Button>
                    </div>
                 </div>
                 <div className="p-4 rounded-2xl bg-muted/20 space-y-3 opacity-50 grayscale cursor-not-allowed">
                    <Label className="text-[10px] font-black uppercase opacity-40">Webhook Retry Policy</Label>
                    <p className="text-[10px] font-bold">Exponential Backoff (Max 5 retries)</p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
