'use client';

import { useState, useMemo } from "react";
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCcw, 
  ShieldAlert, 
  History, 
  FileJson, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Trash2,
  HardDrive,
  Wand2,
  FlaskConical
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
  restoreFromBackup, 
  BackupPackage 
} from "@/lib/backup-utils";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function BackupPage() {
  const db = useFirestore();
  const { profile, tenantId } = useUser();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const backupLogsQuery = useMemo(() => query(
    collection(db, 'auditLogs'), 
    where('tenantId', '==', tenantId),
    orderBy('timestamp', 'desc'),
    limit(10)
  ), [db, tenantId]);
  
  const { data: logs, loading: logsLoading } = useCollection(backupLogsQuery);
  const backupHistory = logs.filter((l: any) => l.action?.includes('نسخ') || l.action?.includes('استعادة') || l.action?.includes('هجرة') || l.action?.includes('Seed'));

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const backup = await generateBackup(db, profile?.displayName || "مدير");
      downloadBackupFile(backup);
      
      await addDoc(collection(db, 'auditLogs'), {
        tenantId,
        userId: profile?.uid || "admin",
        userName: profile?.displayName || "مدير",
        action: "تصدير نسخة احتياطية",
        target: "قاعدة البيانات كاملة",
        details: `حجم البيانات: ${Object.keys(backup.data).length} مجموعة`,
        timestamp: Date.now()
      });

      toast({ title: "تم التصدير بنجاح", description: "تم تحميل ملف النسخة الاحتياطية لجهازك." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إنشاء النسخة الاحتياطية." });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSeedTEST001 = async () => {
    setIsSeeding(true);
    const TEST_TENANT = "TEST001";
    const batch = writeBatch(db);

    try {
      // 1. Create Tenant with Slug
      const tenantRef = doc(db, "tenants", TEST_TENANT);
      batch.set(tenantRef, {
        tenantId: TEST_TENANT,
        businessName: "متجر الاختبار التجريبي",
        slug: "test-store",
        logo: "https://placehold.co/400x200?text=TEST001",
        phone: "07000000000",
        whatsapp: "07000000000",
        status: "active",
        createdAt: Date.now()
      });

      // 2. Create Sample Product
      const productRef = doc(collection(db, "products"));
      batch.set(productRef, {
        tenantId: TEST_TENANT,
        name: "منتج تجريبي معزول",
        barcode: "TEST-BAR-001",
        retailPrice: 15000,
        stock: 100,
        category: "قطع تجريبية",
        createdAt: Date.now()
      });

      // 3. Create Audit Log
      const logRef = doc(collection(db, "auditLogs"));
      batch.set(logRef, {
        tenantId: TEST_TENANT,
        action: "Seed Isolation Test",
        target: TEST_TENANT,
        details: "إنشاء بيانات اختبارية لغرض فحص العزل البرمجي",
        timestamp: Date.now()
      });

      await batch.commit();
      toast({ title: "اكتمل التوليد", description: "تم إنشاء بيانات معزولة تحت معرف TEST001 ورابط test-store." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التوليد" });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleMigrateToTenant = async () => {
    setIsMigrating(true);
    
    const COLLECTIONS = [
      'products', 'users', 'orders', 'repairOrders', 'expenses', 
      'suppliers', 'purchases', 'receiptVouchers', 'paymentVouchers', 
      'cashShifts', 'financialTransactions', 'categories', 'banners', 'offers', 'auditLogs'
    ];

    try {
      const batch = writeBatch(db);
      
      // Initialize MMA Tenant
      const mmaRef = doc(db, "tenants", "MMA001");
      batch.set(mmaRef, {
        tenantId: "MMA001",
        businessName: "مجمع محمد علاء",
        slug: "mma-store",
        logo: "https://up6.cc/2026/07/178308238964931.png",
        phone: "07858833838",
        whatsapp: "07858833838",
        status: "active",
        createdAt: Date.now()
      }, { merge: true });

      let totalUpdated = 0;
      for (const colName of COLLECTIONS) {
        const snap = await getDocs(collection(db, colName));
        const innerBatch = writeBatch(db);
        let count = 0;

        snap.docs.forEach(d => {
          if (!d.data().tenantId) {
            innerBatch.update(d.ref, { tenantId: 'MMA001' });
            count++;
          }
        });

        if (count > 0) {
          await innerBatch.commit();
          totalUpdated += count;
        }
      }

      await addDoc(collection(db, 'auditLogs'), {
        tenantId: 'MMA001',
        action: "هجرة بيانات ونظام التوجيه",
        details: `تم تحديث ${totalUpdated} سجل وتفعيل رابط mma-store`,
        timestamp: Date.now()
      });

      await batch.commit();
      toast({ title: "اكتملت الهجرة", description: `تم ربط البيانات بـ MMA001 وتفعيل الرابط الديناميكي.` });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الهجرة" });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setIsImporting(true);
    setRestoreProgress(0);

    try {
      const text = await selectedFile.text();
      const backup = JSON.parse(text);

      if (!validateBackup(backup)) {
        throw new Error("ملف غير صالح أو تالف");
      }

      await restoreFromBackup(db, backup, (p) => setRestoreProgress(p));

      await addDoc(collection(db, 'auditLogs'), {
        tenantId,
        userId: profile?.uid || "admin",
        userName: profile?.displayName || "مدير",
        action: "استعادة بيانات",
        target: "نسخة احتياطية",
        details: `تاريخ النسخة: ${new Date(backup.timestamp).toLocaleString("ar-EG")}`,
        timestamp: Date.now()
      });

      toast({ title: "تمت الاستعادة بنجاح", description: "تم تحديث بيانات النظام بالكامل." });
      setSelectedFile(null);
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "خطأ في الاستعادة", 
        description: e.message || "تأكد من أن الملف هو نسخة احتياطية صحيحة." 
      });
    } finally {
      setIsImporting(false);
      setRestoreProgress(0);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">إدارة البيانات والسحاب</h1>
          <p className="text-muted-foreground font-medium text-sm">تأمين بيانات المجمع وإدارتها في بيئة متعددة المتاجر.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleSeedTEST001} 
            disabled={isSeeding} 
            variant="outline"
            className="rounded-2xl font-black h-14 gap-2 border-2 border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            {isSeeding ? <Loader2 className="h-5 w-5 animate-spin" /> : <FlaskConical className="h-5 w-5" />}
            توليد بيانات TEST001
          </Button>
          <Button 
            onClick={handleMigrateToTenant} 
            disabled={isMigrating} 
            variant="outline"
            className="rounded-2xl font-black h-14 gap-2 border-2 text-primary hover:bg-primary/5"
          >
            {isMigrating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
            هجرة بيانات MMA001
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting} 
            className="rounded-2xl font-black h-14 shadow-2xl shadow-primary/30 gap-3 px-10 text-lg"
          >
            {isExporting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Download className="h-6 w-6" />}
            إنشاء نسخة (.json)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white dark:bg-card">
            <CardHeader className="bg-primary/5 p-8 border-b border-primary/5">
              <CardTitle className="flex items-center gap-3 text-2xl font-black">
                <ShieldAlert className="h-7 w-7 text-primary" /> معالجة البيانات
              </CardTitle>
              <CardDescription className="font-bold text-sm">استعادة البيانات من ملف خارجي. تحذير: قد يؤدي هذا للكتابة فوق البيانات الحالية.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="p-6 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 hover:bg-muted/30 transition-all group relative">
                       <Upload className={cn("h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors", selectedFile && "text-primary")} />
                       <div className="text-center">
                          <p className="font-black text-sm">{selectedFile ? selectedFile.name : "اختر ملف النسخة (.json)"}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">{selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "اسحب الملف هنا أو انقر للاختيار"}</p>
                       </div>
                       <input type="file" accept=".json" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    {selectedFile && (
                      <Button variant="ghost" onClick={() => setSelectedFile(null)} className="w-full rounded-xl text-xs font-bold text-destructive">إلغاء الملف المختار</Button>
                    )}
                 </div>

                 <div className="flex flex-col justify-center space-y-4">
                    <AlertDialog>
                       <AlertDialogTrigger asChild>
                          <Button disabled={!selectedFile || isImporting} variant="outline" className="h-16 rounded-2xl border-2 border-red-200 text-red-600 font-black text-lg gap-3 hover:bg-red-50">
                             <RefreshCcw className="h-6 w-6" /> ابدأ عملية الاستعادة
                          </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent className="rounded-[32px]">
                          <AlertDialogHeader>
                             <AlertDialogTitle className="text-2xl font-black flex items-center gap-2 text-red-600"><AlertTriangle className="h-6 w-6" /> تنبيه خطير!</AlertDialogTitle>
                             <AlertDialogDescription className="text-sm font-bold leading-relaxed pt-2">
                                أنت على وشك القيام بعملية استعادة بيانات شاملة. هذا الإجراء سيقوم بتعديل أو الكتابة فوق البيانات الحالية في النظام. يرجى التأكد من أنك قمت بعمل نسخة احتياطية للبيانات الحالية أولاً.
                             </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-2">
                             <AlertDialogCancel className="rounded-xl font-bold">تراجع عن القرار</AlertDialogCancel>
                             <AlertDialogAction onClick={handleImport} className="rounded-xl font-black bg-red-600 hover:bg-red-700">نعم، أنا متأكد من الاستعادة</AlertDialogAction>
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
                <CardTitle className="text-xl font-black flex items-center gap-3"><History className="h-6 w-6 text-primary" /> سجل العمليات الأخيرة</CardTitle>
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
                               log.action?.includes('تصدير') ? "bg-blue-50 text-blue-600" :
                               log.action?.includes('Seed') ? "bg-purple-50 text-purple-600" :
                               "bg-orange-50 text-orange-600"
                             )}>
                                {log.action?.includes('تصدير') ? <Download className="h-5 w-5" /> : 
                                 log.action?.includes('Seed') ? <FlaskConical className="h-5 w-5" /> :
                                 <RefreshCcw className="h-5 w-5" />}
                             </div>
                             <div>
                                <p className="text-sm font-black">{log.action}</p>
                                <p className="text-[10px] text-muted-foreground font-bold">{new Date(log.timestamp).toLocaleString("ar-EG")}</p>
                             </div>
                          </div>
                          <div className="text-left">
                             <span className="text-[10px] font-black bg-muted px-3 py-1 rounded-full">{log.userName || log.tenantId}</span>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="p-20 text-center opacity-30 font-bold">لا يوجد سجل عمليات نسخ سابقة.</div>
                   )}
                </div>
             </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="rounded-[40px] border-none shadow-xl bg-slate-900 text-white p-8 space-y-6 relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="h-16 w-16 rounded-3xl bg-primary flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                    <Database className="h-8 w-8 text-white" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black">جاهز لـ SaaS</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                       النظام الآن يدعم تعدد المتاجر. كافة البيانات مرتبطة بمعرف فريد لكل مشترك لضمان خصوصية تامة لكل متجر على حدة.
                    </p>
                 </div>
              </div>
              <HardDrive className="absolute -right-10 -bottom-10 h-40 w-40 opacity-5" />
           </Card>
        </div>
      </div>
    </div>
  );
}