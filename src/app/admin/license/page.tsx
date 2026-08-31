
'use client';

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Laptop, 
  History, 
  CheckCircle2, 
  HelpCircle,
  Loader2,
  RefreshCw,
  Rocket,
  Zap,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { LicenseManager, LicenseStatus } from "@/core/license/license-manager";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function LicensePage() {
  const [status, setStatus] = useState<LicenseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");

  useEffect(() => {
    checkLicense();
  }, []);

  const checkLicense = async () => {
    setLoading(true);
    const result = await LicenseManager.verifyStatus();
    setStatus(result);
    setLoading(false);
  };

  const handleActivate = async () => {
    if (!licenseKey) return;
    setActivating(true);
    try {
      const success = await LicenseManager.activate(licenseKey);
      if (success) {
        toast({ title: "تم التفعيل بنجاح", description: "أهلاً بك في DUBSAR 2.0 Professional" });
        await checkLicense();
      }
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التفعيل", description: "المفتاح غير صحيح أو مستخدم مسبقاً." });
    } finally {
      setActivating(false);
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-20" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900">ترخيص البرنامج (DUBSAR 2.0)</h1>
        <p className="text-muted-foreground font-medium">إدارة ملكية النسخة، تحديثات الأمان، والدعم الفني المباشر.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Current License Status */}
           <Card className={cn(
             "rounded-[40px] border-none shadow-sm overflow-hidden",
             status?.isValid ? "bg-emerald-50" : "bg-red-50"
           )}>
              <CardHeader className="p-10 border-b border-black/5 bg-white/50">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <CardTitle className="text-2xl font-black">
                          {status?.isValid ? 'النسخة مرخصة ومفعلة' : 'النسخة غير مفعلة (تجريبية)'}
                       </CardTitle>
                       <CardDescription className="font-bold">
                          {status?.isValid ? `باقة: ${status.type?.toUpperCase()}` : 'يرجى إدخال مفتاح الترخيص للبدء.'}
                       </CardDescription>
                    </div>
                    <div className={cn(
                      "h-16 w-16 rounded-3xl flex items-center justify-center shadow-lg",
                      status?.isValid ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                    )}>
                       {status?.isValid ? <ShieldCheck className="h-8 w-8" /> : <ShieldAlert className="h-8 w-8" />}
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase opacity-40">معرف الجهاز (Hardware ID)</p>
                       <p className="font-mono text-sm font-bold bg-white/50 p-3 rounded-xl border border-black/5">DB-20-X99-PRO-8821</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase opacity-40">تاريخ التفعيل</p>
                       <p className="font-bold text-sm">{status?.activatedAt ? new Date(status.activatedAt).toLocaleDateString("ar-EG") : '---'}</p>
                    </div>
                 </div>

                 {status?.isValid && (
                   <div className="flex flex-wrap gap-3">
                      {['تحديثات دائمة', 'دعم فني 24/7', 'ربط سحابي مجاني', 'مخزن محلي غير محدود'].map(f => (
                        <div key={f} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 text-emerald-700 text-xs font-black border border-emerald-100">
                           <CheckCircle2 className="h-4 w-4" />
                           {f}
                        </div>
                      ))}
                   </div>
                 )}
              </CardContent>
           </Card>

           {/* Activation Card */}
           {!status?.isValid && (
             <Card className="rounded-[40px] border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-10">
                   <CardTitle className="text-xl font-black flex items-center gap-3"><Key className="h-6 w-6 text-primary" /> تفعيل البرنامج</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-6">
                   <div className="space-y-3">
                      <Label className="font-black text-xs uppercase tracking-widest opacity-60">مفتاح الترخيص (License Key)</Label>
                      <Input 
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                        placeholder="XXXXX-XXXXX-XXXXX-XXXXX" 
                        className="h-16 rounded-2xl bg-muted/30 border-none font-mono text-xl text-center tracking-[0.2em]" 
                      />
                   </div>
                   <Button 
                    disabled={!licenseKey || activating} 
                    onClick={handleActivate}
                    className="w-full h-16 rounded-[24px] font-black text-xl gap-3 shadow-2xl shadow-primary/20"
                   >
                      {activating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Rocket className="h-6 w-6" />}
                      تفعيل النسخة الآن
                   </Button>
                </CardContent>
             </Card>
           )}
        </div>

        <div className="space-y-8">
           <Card className="rounded-[40px] border-none shadow-xl bg-slate-900 text-white p-10 overflow-hidden relative group">
              <div className="relative z-10 space-y-6">
                 <div className="h-16 w-16 bg-primary rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all">
                    <Zap className="h-8 w-8 text-white" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black italic">نظام الترخيص الدائم</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                       في DUBSAR 2.0، أنت تملك البرنامج. الترخيص لمرة واحدة فقط وبدون اشتراكات شهرية إجبارية للعمليات المحلية.
                    </p>
                 </div>
              </div>
           </Card>

           <Card className="rounded-[40px] border-none shadow-sm bg-white p-8 space-y-6">
              <h3 className="font-black text-lg flex items-center gap-2 text-slate-800"><History className="h-5 w-5 text-primary" /> سجل التراخيص</h3>
              <div className="space-y-4">
                 <p className="text-center text-xs opacity-30 font-bold py-10">لا توجد عمليات سابقة لتظهر هنا.</p>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
