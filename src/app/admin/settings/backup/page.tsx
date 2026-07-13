
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
  Store
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
  const [isMigrating, setIsMigrating] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const backupLogsQuery = useMemo(() => query(
    collection(db, 'auditLogs'), 
    where('tenantId', '==', tenantId),
    orderBy('timestamp', 'desc'),
    limit(10)
  ), [db, tenantId]);
  
  const { data: logs, loading: logsLoading } = useCollection(backupLogsQuery);
  const backupHistory = logs.filter((l: any) => l.action?.includes('نسخ') || l.action?.includes('استعادة') || l.action?.includes('هجرة') || l.action?.includes('Seed') || l.action?.includes('توليد'));

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

  const handleSeedDemoStore = async () => {
    setIsSeedingDemo(true);
    const DEMO_TENANT = "DEMO_STORE";
    const batch = writeBatch(db);
    const now = Date.now();

    try {
      // 1. Create Demo Tenant
      const tenantRef = doc(db, "tenants", DEMO_TENANT);
      batch.set(tenantRef, {
        tenantId: DEMO_TENANT,
        businessName: "المتجر التجريبي (Demo)",
        slug: "demo-store",
        logo: "https://up6.cc/2026/07/178308238964931.png",
        phone: "07800000000",
        whatsapp: "07800000000",
        address: "بغداد، المنصور",
        status: "active",
        subscriptionPlan: "business",
        createdAt: now
      });

      // 2. Sample Categories
      const cats = ["محركات", "زيوت", "إطارات", "إكسسوارات"];
      cats.forEach(name => {
        const catRef = doc(collection(db, "categories"));
        batch.set(catRef, { tenantId: DEMO_TENANT, name, itemsCount: 3, createdAt: now });
      });

      // 3. Sample Products
      const sampleProds = [
        { name: "خوذة رياضية احترافية", price: 125000, cat: "إكسسوارات", stock: 12 },
        { name: "زيت محرك 10W40 أصلي", price: 15000, cat: "زيوت", stock: 45 },
        { name: "طقم سفايف هوندا", price: 35000, cat: "محركات", stock: 8 }
      ];

      sampleProds.forEach(p => {
        const prodRef = doc(collection(db, "products"));
        batch.set(prodRef, {
          tenantId: DEMO_TENANT,
          name: p.name,
          retailPrice: p.price,
          purchasePrice: p.price * 0.7,
          stock: p.stock,
          category: p.cat,
          isFeatured: true,
          createdAt: now
        });
      });

      // 4. Sample Banners
      const bannerRef = doc(collection(db, "banners"));
      batch.set(bannerRef, {
        tenantId: DEMO_TENANT,
        title: "أهلاً بكم في المتجر التجريبي",
        subtitle: "استكشف ميزات منصة MMA الآن",
        image: "https://picsum.photos/seed/demo/1200/500",
        isActive: true,
        createdAt: now
      });

      await batch.commit();
      toast({ title: "تم توليد المتجر التجريبي", description: "يمكنك الآن استكشاف demo-store." });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التوليد" });
    } finally {
      setIsSeedingDemo(false);
    }
  };

  const handleSeedTEST001 = async () => {
    setIsSeeding(true);
    const TEST_TENANT = "TEST001";
    const batch = writeBatch(db);

    try {
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

      await batch.commit();
      toast({ title: "اكتمل التوليد", description: "تم إنشاء بيانات معزولة لـ TEST001." });
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

      await batch.commit();
      toast({ title: "اكتملت الهجرة", description: `تم تفعيل رابط mma-store.` });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الهجرة" });
    } finally {
      setIsMigrating(false);
    }
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
      toast({ title: "تمت الاستعادة بنجاح", description: "تم تحديث بيانات النظام بالكامل." });
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
          <h1 className="text-3xl font-black tracking-tight">إدارة البيانات والسحاب</h1>
          <p className="text-muted-foreground font-medium text-sm">تأمين بيانات المجمع وإدارتها في بيئة متعددة المتاجر.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleSeedDemoStore} 
            disabled={isSeedingDemo} 
            variant="outline"
            className="rounded-2xl font-black h-14 gap-2 border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
          >
            {isSeedingDemo ? <Loader2 className="h-5 w-5 animate-spin" /> : <Store className="h-5 w-5" />}
            توليد المتجر التجريبي (Demo)
          </Button>
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
                       <input type="file" accept=".json" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
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
                               log.action?.includes('Seed') || log.action?.includes('توليد') ? "bg-purple-50 text-purple-600" :
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
