
'use client';

import { 
  Globe, 
  Shield, 
  Smartphone,
  Palette,
  Link as LinkIcon,
  Loader2,
  Save,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  Briefcase,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useDoc } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import Image from "next/image";

export default function PlatformSettingsPage() {
  const db = useFirestore();
  const settingsRef = doc(db, 'settings', 'platform');
  const { data: settings, loading } = useDoc<any>(settingsRef);
  
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({
    platformName: "بوابة الأعمال",
    platformLogo: "https://up6.cc/2026/07/178308238964931.png",
    defaultCurrency: "IQD",
    trialDurationDays: 14,
    supportEmail: "support@platform.store",
    supportPhone: "9647858833838",
    whatsappNumber: "9647858833838",
    socialLinks: {
      facebook: "",
      instagram: ""
    }
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        ...formData,
        ...settings
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(settingsRef, formData, { merge: true });
      toast({ title: "تم الحفظ", description: "تم تحديث إعدادات المنصة بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ الإعدادات." });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-20" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">إعدادات المنصة</h1>
          <p className="text-muted-foreground font-medium text-base">تخصيص الهوية العامة، الخيارات الافتراضية، ومعلومات التواصل.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="rounded-2xl font-black h-14 shadow-2xl shadow-primary/30 gap-3 px-10 text-lg">
          {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
          حفظ التغييرات العامة
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
              <CardTitle className="flex items-center gap-3 text-2xl font-black">
                <Globe className="h-7 w-7 text-primary" /> الهوية والعلامة التجارية
              </CardTitle>
              <CardDescription className="font-bold text-sm">تحديد الاسم والشعار الذي يظهر في كافة واجهات المنصة.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <Label className="font-black text-xs mr-1 uppercase tracking-widest opacity-60">اسم المنصة</Label>
                    <Input value={formData.platformName} onChange={(e) => setFormData({...formData, platformName: e.target.value})} className="rounded-2xl h-14 bg-muted/30 border-none font-bold text-lg px-6" />
                 </div>
                 <div className="space-y-2">
                    <Label className="font-black text-xs mr-1 uppercase tracking-widest opacity-60">العملة الافتراضية</Label>
                    <Input value={formData.defaultCurrency} onChange={(e) => setFormData({...formData, defaultCurrency: e.target.value})} className="rounded-2xl h-14 bg-muted/30 border-none font-bold text-lg px-6" />
                 </div>
              </div>
              
              <div className="space-y-4 pt-4">
                 <Label className="font-black text-xs uppercase tracking-widest opacity-60">رابط الشعار الرئيسي (Logo URL)</Label>
                 <div className="flex gap-4 items-center">
                    <Input value={formData.platformLogo} onChange={(e) => setFormData({...formData, platformLogo: e.target.value})} className="rounded-2xl h-14 bg-muted/30 border-none font-mono text-xs px-6 flex-1" dir="ltr" />
                    <div className="h-20 w-40 relative border rounded-2xl p-2 bg-slate-50">
                       <Image src={formData.platformLogo} alt="Preview" fill className="object-contain" />
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-muted/30 p-8 border-b">
              <CardTitle className="flex items-center gap-3 text-2xl font-black">
                <Briefcase className="h-7 w-7 text-primary" /> سياسات الاشتراك والتجربة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="max-w-sm">
                  <div className="space-y-2">
                    <Label className="font-black text-xs mr-1 opacity-60">مدة الفترة التجريبية (بالأيام)</Label>
                    <div className="relative">
                       <Clock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                       <Input type="number" value={formData.trialDurationDays} onChange={(e) => setFormData({...formData, trialDurationDays: Number(e.target.value)})} className="rounded-2xl h-14 bg-muted/30 border-none font-black text-2xl pr-12 text-center" />
                    </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-primary" /> قنوات الدعم
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                 <div className="space-y-2">
                    <Label className="font-black text-[10px] opacity-40">البريد الإلكتروني</Label>
                    <div className="relative">
                       <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                       <Input value={formData.supportEmail} onChange={(e) => setFormData({...formData, supportEmail: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-none font-bold pr-10" dir="ltr" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="font-black text-[10px] opacity-40">رقم الهاتف</Label>
                    <div className="relative">
                       <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                       <Input value={formData.supportPhone} onChange={(e) => setFormData({...formData, supportPhone: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-none font-bold pr-10" dir="ltr" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="font-black text-[10px] opacity-40">واتساب الاشتراكات</Label>
                    <div className="relative">
                       <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                       <Input value={formData.whatsappNumber} onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})} className="h-11 rounded-xl bg-muted/30 border-none font-bold pr-10" dir="ltr" />
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="rounded-[40px] border-none shadow-xl bg-slate-900 text-white p-10 overflow-hidden relative">
              <div className="relative z-10 space-y-4">
                 <Shield className="h-10 w-10 text-primary" />
                 <h3 className="text-xl font-black">أمان المنصة</h3>
                 <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    يتم تطبيق هذه الإعدادات على مستوى السيرفر وتؤثر على سلوك كافة الحسابات الجديدة.
                 </p>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
