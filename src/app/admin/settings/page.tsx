
'use client';

import { 
  Store, 
  Globe, 
  Phone, 
  MapPin, 
  Save, 
  Palette,
  Loader2,
  Camera,
  LayoutDashboard,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useUser } from "@/firebase";
import { doc, updateDoc, getDoc, writeBatch } from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Image from "next/image";

export default function AdminSettingsPage() {
  const db = useFirestore();
  const { tenantId, user } = useUser();
  const tenantRef = useMemo(() => tenantId ? doc(db, 'tenants', tenantId) : null, [db, tenantId]);
  const { data: tenant, loading } = useDoc<any>(tenantRef);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<any>({
    businessName: "",
    slug: "",
    phone: "",
    address: "",
    logo: "",
    settings: {
      storeTheme: {
        primary: "#1A365D",
        secondary: "#C05621",
        background: "#FDF8F5",
        card: "#FFFFFF",
      }
    }
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        businessName: tenant.businessName || "",
        slug: tenant.slug || "",
        phone: tenant.phone || "",
        address: tenant.address || "",
        logo: tenant.logo || "",
        settings: {
          ...tenant.settings,
          storeTheme: tenant.settings?.storeTheme || formData.settings.storeTheme
        }
      });
    }
  }, [tenant]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setFormData({ ...formData, logo: url });
      toast({ title: "تم رفع الشعار بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الرفع" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!tenantRef) return;
    setIsSaving(true);
    try {
      await updateDoc(tenantRef, formData);
      toast({ title: "تم الحفظ بنجاح", description: "تم تحديث هوية متجرك الإلكتروني." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-20" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground">إعدادات المتجر الإلكتروني</h1>
          <p className="text-muted-foreground font-medium">تحكم في الهوية البصرية، الشعار، والروابط العامة لمتجرك.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="rounded-2xl font-black h-14 shadow-2xl shadow-primary/30 gap-3 px-10 text-lg">
          {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
          حفظ الهوية الجديدة
        </Button>
      </div>

      <Tabs defaultValue="identity" className="space-y-8">
        <TabsList className="bg-white p-1.5 rounded-[24px] h-16 border shadow-sm w-full md:w-fit">
          <TabsTrigger value="identity" className="rounded-2xl px-10 font-black text-sm data-[state=active]:bg-primary data-[state=active]:text-white">هوية المتجر</TabsTrigger>
          <TabsTrigger value="design" className="rounded-2xl px-10 font-black text-sm data-[state=active]:bg-primary data-[state=active]:text-white">الألوان والتصميم</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="space-y-8 animate-in slide-in-from-bottom-4">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
                 <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                    <CardTitle className="text-xl font-black flex items-center gap-3"><Store className="h-6 w-6 text-primary" /> المعلومات العامة</CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label className="font-black text-xs opacity-60">اسم المتجر العام</Label>
                          <Input value={formData.businessName} onChange={(e)=>setFormData({...formData, businessName: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none font-bold" />
                       </div>
                       <div className="space-y-2">
                          <Label className="font-black text-xs opacity-60">رابط المتجر (Slug)</Label>
                          <div className="relative">
                             <Globe className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
                             <Input readOnly value={formData.slug} className="h-14 rounded-2xl bg-muted/20 border-none pr-12 font-black" dir="ltr" />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label className="font-black text-xs opacity-60">العنوان الرسمي</Label>
                       <Input value={formData.address} onChange={(e)=>setFormData({...formData, address: e.target.value})} className="h-14 rounded-2xl bg-muted/30 border-none font-bold" />
                    </div>
                 </CardContent>
              </Card>

              <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white flex flex-col items-center justify-center p-10">
                 <Label className="font-black text-xs opacity-60 mb-6 uppercase tracking-widest text-center">شعار المتجر (Logo)</Label>
                 <div className="relative h-48 w-48 rounded-[40px] bg-muted/30 border-4 border-dashed flex items-center justify-center overflow-hidden group">
                    {formData.logo ? (
                      <Image src={formData.logo} alt="Logo" fill className="object-contain p-6" />
                    ) : (
                      <Store className="h-16 w-16 opacity-10" />
                    )}
                    <button 
                      onClick={() => logoInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                    >
                       {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
                       <span className="font-black text-[10px]">تغيير الشعار</span>
                    </button>
                    <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                 </div>
                 <p className="mt-6 text-[10px] font-bold text-muted-foreground text-center max-w-xs leading-relaxed">يفضل استخدام صورة بخلفية شفافة (PNG) وبأبعاد مربعة 500x500 بكسل.</p>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="design" className="space-y-8 animate-in slide-in-from-bottom-4">
           <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white max-w-4xl">
              <CardHeader className="bg-slate-900 text-white p-8">
                 <CardTitle className="text-xl font-black flex items-center gap-3"><Palette className="h-6 w-6 text-primary" /> ألوان وهوية المتجر</CardTitle>
                 <CardDescription className="text-slate-400">تحكم في كيفية ظهور متجرك للزبائن.</CardDescription>
              </CardHeader>
              <CardContent className="p-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <div className="space-y-3">
                          <Label className="font-black text-xs opacity-60">اللون الرئيسي (الأزرار والروابط)</Label>
                          <div className="flex gap-4 items-center">
                             <Input type="color" value={formData.settings.storeTheme.primary} onChange={(e)=>setFormData({...formData, settings: {...formData.settings, storeTheme: {...formData.settings.storeTheme, primary: e.target.value}}})} className="h-14 w-24 p-1 rounded-xl cursor-pointer" />
                             <Input value={formData.settings.storeTheme.primary} onChange={(e)=>setFormData({...formData, settings: {...formData.settings, storeTheme: {...formData.settings.storeTheme, primary: e.target.value}}})} className="h-14 flex-1 rounded-2xl bg-muted/30 border-none font-mono text-center" />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <Label className="font-black text-xs opacity-60">لون الخلفية العامة</Label>
                          <div className="flex gap-4 items-center">
                             <Input type="color" value={formData.settings.storeTheme.background} onChange={(e)=>setFormData({...formData, settings: {...formData.settings, storeTheme: {...formData.settings.storeTheme, background: e.target.value}}})} className="h-14 w-24 p-1 rounded-xl cursor-pointer" />
                             <Input value={formData.settings.storeTheme.background} onChange={(e)=>setFormData({...formData, settings: {...formData.settings, storeTheme: {...formData.settings.storeTheme, background: e.target.value}}})} className="h-14 flex-1 rounded-2xl bg-muted/30 border-none font-mono text-center" />
                          </div>
                       </div>
                    </div>

                    <div className="p-8 rounded-[32px] bg-slate-50 border-2 border-dashed flex flex-col items-center justify-center text-center gap-4">
                       <div className="h-16 w-16 bg-white rounded-2xl shadow-xl flex items-center justify-center" style={{ color: formData.settings.storeTheme.primary }}>
                          <CheckCircle2 className="h-8 w-8" />
                       </div>
                       <div className="space-y-1">
                          <p className="font-black text-lg">معاينة مباشرة</p>
                          <p className="text-xs text-muted-foreground font-bold leading-relaxed">سيتم تطبيق هذه الألوان على كافة صفحات المتجر الإلكتروني الخاص بك فور الحفظ.</p>
                       </div>
                       <Button variant="outline" className="rounded-xl border-2 font-black" asChild>
                          <a href={`/store/${formData.slug}`} target="_blank">رؤية المتجر المباشر <ExternalLink className="mr-2 h-4 w-4" /></a>
                       </Button>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
