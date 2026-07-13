
'use client';

import { useMemo } from "react";
import { History, User, Clock, ShieldAlert, Store, Rocket, CreditCard } from "lucide-react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function PlatformAuditLogPage() {
  const db = useFirestore();
  
  // Platform-wide audit log for all global actions
  const logsQuery = useMemo(() => query(
    collection(db, 'auditLogs'), 
    orderBy('timestamp', 'desc'), 
    limit(100)
  ), [db]);
  
  const { data: logs, loading } = useCollection(logsQuery);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-slate-900">سجل نشاط المنصة</h1>
        <p className="text-muted-foreground font-medium">تتبع كافة العمليات الإدارية، تسجيل المتاجر، وتغييرات النظام الكبرى.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array(10).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[28px]" />)
        ) : logs.length > 0 ? (
          logs.map((log: any) => {
            const isStoreAction = log.action?.includes('متجر') || log.action?.includes('تأسيس');
            const isFinanceAction = log.action?.includes('اشتراك') || log.action?.includes('باقة');
            
            return (
              <div key={log.id} className="flex items-center gap-5 p-6 bg-white border rounded-[32px] shadow-sm hover:shadow-md transition-all group border-transparent hover:border-primary/20">
                <div className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110",
                  isStoreAction ? "bg-blue-50 text-blue-600" :
                  isFinanceAction ? "bg-emerald-50 text-emerald-600" :
                  "bg-slate-50 text-slate-600"
                )}>
                  {isStoreAction ? <Store className="h-7 w-7" /> : 
                   isFinanceAction ? <CreditCard className="h-7 w-7" /> : <ShieldAlert className="h-7 w-7" />}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <span className="font-black text-lg text-slate-800">{log.action}</span>
                       <Badge className="bg-muted text-muted-foreground border-none font-bold text-[10px]">{log.tenantId || 'GLOBAL'}</Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-black flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString("ar-EG")}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <User className="h-3.5 w-3.5 opacity-50" />
                      <span>القائم بالعملية: <span className="text-slate-900 font-black">{log.userName || log.userId || 'النظام'}</span></span>
                    </div>
                    {log.target && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <Rocket className="h-3.5 w-3.5 opacity-50" />
                        <span>الهدف: <span className="text-primary font-black">{log.target}</span></span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    {log.details}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-96 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-[40px] gap-4 border-2 border-dashed">
            <History className="h-20 w-20 opacity-10" />
            <p className="font-black text-xl">سجل النشاط فارغ تماماً</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ className, children }: any) {
  return (
    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-black border", className)}>
      {children}
    </span>
  );
}
