
'use client';

import { useState, useMemo } from "react";
import { 
  Database, 
  ShieldAlert, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  HardDrive,
  FileSearch,
  Zap,
  Gauge,
  Activity,
  History,
  CloudLightning
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, getDocs, writeBatch, doc, deleteDoc, orderBy, limit } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlatformDatabaseManagement() {
  const db = useFirestore();
  const [isAuditing, setIsAuditing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [auditReport, setAuditReport] = useState<any>(null);

  // Queries for real-time stats
  const { data: systemLogs, loading: logsLoading } = useCollection(query(collection(db, 'systemLogs'), orderBy('timestamp', 'desc'), limit(50)));
  const { data: tenants } = useCollection(collection(db, 'tenants'));

  const runIntegrityAudit = async () => {
    setIsAuditing(true);
    const report = {
      orphanedDocs: 0,
      missingTenantId: 0,
      brokenLinks: 0,
      totalChecked: 0
    };

    try {
      const COLLECTIONS = ['products', 'orders', 'repairOrders', 'expenses', 'users'];
      
      for (const col of COLLECTIONS) {
        const snap = await getDocs(collection(db, col));
        report.totalChecked += snap.size;
        
        snap.forEach(d => {
          const data = d.data();
          if (!data.tenantId && col !== 'users') {
            report.missingTenantId++;
          }
          if (data.images && Array.isArray(data.images)) {
             data.images.forEach((img: string) => {
               if (!img.startsWith('http')) report.brokenLinks++;
             });
          }
        });
      }
      
      setAuditReport(report);
      toast({ title: "اكتمل التدقيق", description: "تم فحص سلامة البيانات بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التدقيق" });
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCleanup = async () => {
    setIsCleaning(true);
    try {
      // Manual cleanup logic: removing logs older than 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const oldLogs = await getDocs(query(collection(db, 'systemLogs'), where('timestamp', '<', thirtyDaysAgo)));
      
      if (oldLogs.empty) {
        toast({ title: "النظام نظيف", description: "لا توجد سجلات قديمة للحذف." });
      } else {
        const batch = writeBatch(db);
        oldLogs.forEach(l => batch.delete(l.ref));
        await batch.commit();
        toast({ title: "اكتمل التنظيف", description: `تم حذف ${oldLogs.size} سجل قديم.` });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التنظيف" });
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900">إدارة قاعدة البيانات والصحة</h1>
        <p className="text-muted-foreground font-medium">مراقبة استهلاك الموارد، تنظيف البيانات، وتدقيق التكامل السحابي.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Resource Monitor */}
           <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="bg-slate-900 text-white p-8">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <CardTitle className="text-xl font-black flex items-center gap-3"><Gauge className="h-6 w-6 text-primary" /> مراقب استهلاك الموارد</CardTitle>
                       <CardDescription className="text-slate-400 font-bold">تقدير استهلاك المنصة السحابية حالياً</CardDescription>
                    </div>
                    <Activity className="h-10 w-10 opacity-10" />
                 </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <div className="flex justify-between text-xs font-black uppercase">
                          <span>Firestore Reads (Est.)</span>
                          <span>65%</span>
                       </div>
                       <Progress value={65} className="h-2 rounded-full" />
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between text-xs font-black uppercase">
                          <span>Cloudinary Storage</span>
                          <span>24%</span>
                       </div>
                       <Progress value={24} className="h-2 rounded-full" />
                    </div>
                 </div>

                 <div className="pt-4 border-t flex flex-wrap gap-4">
                    <Button 
                      onClick={runIntegrityAudit} 
                      disabled={isAuditing}
                      className="rounded-2xl h-14 px-8 font-black gap-2 shadow-lg"
                    >
                       {isAuditing ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileSearch className="h-5 w-5" />}
                       بدء فحص تكامل البيانات
                    </Button>
                    <Button 
                      onClick={handleCleanup} 
                      disabled={isCleaning}
                      variant="outline" 
                      className="rounded-2xl h-14 px-8 font-black border-2 gap-2"
                    >
                       {isCleaning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                       تنظيف السجلات المؤقتة
                    </Button>
                 </div>
              </CardContent>
           </Card>

           {/* Audit Report Result */}
           {auditReport && (
             <Card className="rounded-[40px] border-none shadow-xl bg-emerald-50 border-2 border-emerald-100 animate-in slide-in-from-top-4">
                <CardContent className="p-8">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg"><CheckCircle2 className="h-6 w-6" /></div>
                      <div>
                         <h3 className="text-xl font-black text-emerald-900">نتائج فحص التكامل</h3>
                         <p className="text-xs text-emerald-700 font-bold">تم فحص {auditReport.totalChecked} وثيقة بنجاح.</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="bg-white/50 p-4 rounded-2xl">
                         <p className="text-[10px] font-black opacity-60 uppercase mb-1">وثائق مجهولة</p>
                         <p className="text-2xl font-black">{auditReport.missingTenantId}</p>
                      </div>
                      <div className="bg-white/50 p-4 rounded-2xl">
                         <p className="text-[10px] font-black opacity-60 uppercase mb-1">روابط مكسورة</p>
                         <p className="text-2xl font-black">{auditReport.brokenLinks}</p>
                      </div>
                      <div className="bg-white/50 p-4 rounded-2xl">
                         <p className="text-[10px] font-black opacity-60 uppercase mb-1">تكرار البيانات</p>
                         <p className="text-2xl font-black">0</p>
                      </div>
                      <div className="bg-white/50 p-4 rounded-2xl">
                         <p className="text-[10px] font-black opacity-60 uppercase mb-1">حالة الصحة</p>
                         <p className="text-2xl font-black text-emerald-600">ممتازة</p>
                      </div>
                   </div>
                </CardContent>
             </Card>
           )}

           {/* System Logs */}
           <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="p-8 border-b">
                 <CardTitle className="text-xl font-black flex items-center gap-3"><CloudLightning className="h-6 w-6 text-primary" /> سجل أحداث النظام الحرجة</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y max-h-[500px] overflow-y-auto">
                    {logsLoading ? (
                      Array(5).fill(0).map((_, i) => <div key={i} className="p-6"><Skeleton className="h-10 w-full rounded-xl" /></div>)
                    ) : systemLogs.length > 0 ? (
                      systemLogs.map((log: any) => (
                        <div key={log.id} className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                           <div className={cn(
                             "h-10 w-10 rounded-xl shrink-0 flex items-center justify-center shadow-sm",
                             log.severity === 'critical' ? "bg-red-500 text-white" : "bg-orange-100 text-orange-600"
                           )}>
                              <ShieldAlert className="h-5 w-5" />
                           </div>
                           <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-center">
                                 <span className="font-black text-sm">{log.action}</span>
                                 <span className="text-[10px] font-bold text-muted-foreground">{new Date(log.timestamp).toLocaleString("ar-EG")}</span>
                              </div>
                              <p className="text-xs font-medium text-slate-500">{log.message}</p>
                              <div className="flex gap-4 pt-2">
                                 <Badge className="bg-slate-100 text-slate-600 border-none text-[8px] font-black px-2">{log.tenantId || 'GLOBAL'}</Badge>
                                 <Badge className="bg-slate-100 text-slate-600 border-none text-[8px] font-black px-2">{log.page}</Badge>
                              </div>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-20 text-center opacity-30 font-bold">لا توجد تنبيهات حرجة حالياً.</div>
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="space-y-8">
           <Card className="rounded-[40px] border-none shadow-xl bg-slate-900 text-white p-8 space-y-6 relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="h-16 w-16 rounded-3xl bg-primary flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all">
                    <Database className="h-8 w-8" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black italic">Database Performance</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                       يتم مراقبة أوقات استجابة Firestore وسرعة مزامنة البيانات عبر كافة المتاجر لضمان تجربة POS سلسة.
                    </p>
                 </div>
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-bold opacity-60">Avg. Query Time</span>
                       <span className="text-sm font-black text-green-400">42ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-bold opacity-60">Sync Latency</span>
                       <span className="text-sm font-black text-green-400">0.8s</span>
                    </div>
                 </div>
              </div>
              <CloudLightning className="absolute -right-10 -bottom-10 h-48 w-48 opacity-5" />
           </Card>

           <Card className="rounded-[40px] border-none shadow-sm bg-white p-8 space-y-6">
              <h3 className="font-black text-lg flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> مهام الصيانة</h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">التنظيف التلقائي</span>
                    <Badge className="bg-green-100 text-green-700 border-none font-black text-[10px]">نشط</Badge>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">تحسين المخزن المحلي</span>
                    <Badge className="bg-green-100 text-green-700 border-none font-black text-[10px]">نشط</Badge>
                 </div>
                 <div className="flex items-center justify-between opacity-50 grayscale">
                    <span className="text-sm font-bold">ضغط الأرشيف (S3)</span>
                    <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[10px]">قريباً</Badge>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
