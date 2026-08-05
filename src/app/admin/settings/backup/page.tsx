
'use client';

import { useState, useMemo } from "react";
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCcw, 
  ShieldAlert, 
  History, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  HardDrive,
  Wand2,
  FlaskConical,
  Store,
  FileJson
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { useFirestore, useUser, useCollection } from "@/firebase";
import { collection, query, orderBy, limit, addDoc, getDocs, writeBatch, doc, where } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { 
  generateBackup, 
  downloadBackupFile, 
  validateBackup, 
  restoreFromBackup 
} from "@/lib/backup-utils";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function BackupPage() {
  const db = useFirestore();
  const { profile, tenantId } = useUser();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const backupLogsQuery = useMemo(() => query(
    collection(db, 'auditLogs'), 
    where('tenantId', '==', tenantId),
    orderBy('timestamp', 'desc'),
    limit(20)
  ), [db, tenantId]);
  
  const { data: logs, loading: logsLoading } = useCollection(backupLogsQuery);
  const backupHistory = logs.filter((l: any) => l.action?.includes('نسخ') || l.action?.includes('استعادة'));

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const backup = await generateBackup(db, profile?.displayName || "مدير", tenantId!);
      downloadBackupFile(backup);
      
      await addDoc(collection(db, 'auditLogs'), {
        tenantId,
        userId: profile?.uid || "admin",
        userName: profile?.displayName || "مدير",
        action: "تصدير نسخة احتياطية للمتجر",
        target: "بيانات المتجر",
        details: "تصدير يدوي لكافة السجلات والمنتجات",
        timestamp: Date.now()
      });

      toast({ title: "تم التصدير بنجاح", description: "تم تحميل ملف بيانات متجرك." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إنشاء النسخة الاحتياطية." });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setIsImporting(true);
    setRestoreProgress(0);

    try {
      const text = await selectedFile.text();
      const backup = JSON.parse(text);

      if (!validateBackup(backup)) throw new Error("ملف غير صالح");
      if (backup.tenantId && backup.tenantId !== tenantId) {
        throw new Error("هذا الملف ينتمي لمتجر آخر. لا يمكن استيراده هنا.");
      }

      await restoreFromBackup(db, backup, (p) => setRestoreProgress(p));
      
      await addDoc(collection(db, 'auditLogs'), {
        tenantId,
        userId: profile?.uid || "admin",
        userName: profile?.displayName || "مدير",
        action: "استعادة بيانات من نسخة احتياطية",
        target: "قاعدة البيانات",
        details: "استعادة شاملة للبيانات من ملف خارجي",
        timestamp: Date.now()
      });

      toast({ title: "تمت الاستعادة بنجاح" });
      setSelectedFile(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: "خطأ في الاستعادة", description: e.message });
    } finally {
      setIsImporting(false);
      setRestoreProgress(0);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">النسخ الاحتياطي والبيانات</h1>
          <p className="text-muted-foreground font-medium text-sm">قم بتأمين بيانات متجرك عبر تحميل نسخة محلية أو استعادتها.</p>
        </div>
        <Button 
          onClick={handleExport} 
          disabled={isExporting} 
          className="rounded-2xl font-black h-14 shadow-2xl shadow-primary/30 gap-3 px-10 text-lg"
        >
          {isExporting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Download className="h-6 w-6" />}
          تصدير بياناتي (.json)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 p-8 border-b border-primary/5">
              <CardTitle className="flex items-center gap-3 text-2xl font-black">
                <Upload className="h-7 w-7 text-primary" /> استيراد البيانات
              </CardTitle>
              <CardDescription className="font-bold text-sm">استرجاع بياناتك من ملف تم تصديره مسبقاً.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="p-6 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 hover:bg-muted/30 transition-all group relative">
                       <FileJson className={cn("h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors", selectedFile && "text-primary")} />
                       <div className="text-center">
                          <p className="font-black text-sm">{selectedFile ? selectedFile.name : "اختر ملف النسخة (.json)"}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">{selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "انقر للاختيار"}</p>
                       </div>
                       <input type="file" accept=".json" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                 </div>

                 <div className="flex flex-col justify-center space-y-4">
                    <AlertDialog>
                       <AlertDialogTrigger asChild>
                          <Button disabled={!selectedFile || isImporting} variant="outline" className="h-16 rounded-2xl border-2 border-red-200 text-red-600 font-black text-lg gap-3">
                             <RefreshCcw className="h-6 w-6" /> ابدأ الاستعادة
                          </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent className="rounded-[32px]">
                          <AlertDialogHeader>
                             <AlertDialogTitle className="text-2xl font-black flex items-center gap-2 text-red-600"><AlertTriangle className="h-6 w-6" /> تنبيه هام</AlertDialogTitle>
                             <AlertDialogDescription className="text-sm font-bold leading-relaxed pt-2">
                                استعادة البيانات ستقوم بدمج الملف المرفوع مع البيانات الحالية. يرجى التأكد من أنك رفعت الملف الصحيح الخاص بمتجرك.
                             </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-2">
                             <AlertDialogCancel className="rounded-xl font-bold">إلغاء</AlertDialogCancel>
                             <AlertDialogAction onClick={handleImport} className="rounded-xl font-black bg-red-600 hover:bg-red-700">تأكيد الاستعادة</AlertDialogAction>
                          </AlertDialogFooter>
                       </AlertDialogContent>
                    </AlertDialog>
                    
                    {isImporting && (
                      <div className="space-y-2 animate-in fade-in">
                         <div className="flex justify-between text-[10px] font-black uppercase">
                            <span>جاري معالجة البيانات...</span>
                            <span>{restoreProgress}%</span>
                         </div>
                         <Progress value={restoreProgress} className="h-2 rounded-full" />
                      </div>
                    )}
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[40px] border-none shadow-sm overflow-hidden">
             <CardHeader className="p-8 border-b">
                <CardTitle className="text-xl font-black flex items-center gap-3"><History className="h-6 w-6 text-primary" /> سجل النسخ والاستعادة</CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y">
                   {logsLoading ? (
                     Array(3).fill(0).map((_, i) => <div key={i} className="p-6"><Skeleton className="h-12 w-full rounded-2xl" /></div>)
                   ) : backupHistory.length > 0 ? (
                     backupHistory.map((log: any) => (
                       <div key={log.id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-colors">
                          <div className="flex items-center gap-4">
                             <div className={cn(
                               "h-10 w-10 rounded-xl flex items-center justify-center",
                               log.action?.includes('تصدير') ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                             )}>
                                {log.action?.includes('تصدير') ? <Download className="h-5 w-5" /> : <RefreshCcw className="h-5 w-5" />}
                             </div>
                             <div>
                                <p className="text-sm font-black">{log.action}</p>
                                <p className="text-[10px] text-muted-foreground font-bold">{new Date(log.timestamp).toLocaleString("ar-EG")}</p>
                             </div>
                          </div>
                          <div className="text-left">
                             <span className="text-[10px] font-black bg-muted px-3 py-1 rounded-full">{log.userName}</span>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="p-20 text-center opacity-30 font-bold">لا توجد عمليات سابقة.</div>
                   )}
                </div>
             </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="rounded-[40px] border-none shadow-xl bg-slate-900 text-white p-8 space-y-6 relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="h-16 w-16 rounded-3xl bg-primary flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all">
                    <HardDrive className="h-8 w-8 text-white" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black italic">نصيحة أمنية</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                       ننصح بتصدير نسخة احتياطية لبياناتك مرة واحدة على الأقل أسبوعياً والاحتفاظ بها في مكان آمن بعيداً عن المتصفح.
                    </p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
