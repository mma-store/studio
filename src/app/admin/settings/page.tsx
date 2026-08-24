
'use client';

import { 
  Store, 
  Globe, 
  Phone, 
  MapPin, 
  Save, 
  Shield, 
  MessageCircle,
  Smartphone,
  Palette,
  BellRing,
  Link as LinkIcon,
  CreditCard,
  Cloud,
  CheckCircle2,
  Loader2,
  Printer,
  ExternalLink
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useUser } from "@/firebase";
import { doc, updateDoc, getDoc, writeBatch, collection } from "firebase/firestore";

export default function AdminSettingsPage() {
  const db = useFirestore();
  const { tenantId, user, profile } = useUser();
  
  const tenantRef = useMemo(() => tenantId ? doc(db, 'tenants', tenantId) : null, [db, tenantId]);
  const { data: tenant, loading } = useDoc<any>(tenantRef);
  
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({
    businessName: "",
    slug: "",
    phone: "",
    whatsapp: "",
    address: "",
    settings: {
      printerName: "POS-80",
      defaultPrintSize: "80mm",
      notificationsEnabled: true,
      stockAlertsEnabled: true,
    }
  });

  const [originalSlug, setOriginalSlug] = useState("");

  useEffect(() => {
    if (tenant) {
      const initialData = {
        businessName: tenant.businessName || "",
        slug: tenant.slug || "",
        phone: tenant.phone || "",
        whatsapp: tenant.whatsapp || "",
        address: tenant.address || "",
        settings: {
          printerName: tenant.settings?.printerName || "POS-80",
          defaultPrintSize: tenant.settings?.defaultPrintSize || "80mm",
          notificationsEnabled: tenant.settings?.notificationsEnabled ?? true,
          stockAlertsEnabled: tenant.settings?.stockAlertsEnabled ?? true,
        }
      };
      setFormData(initialData);
      setOriginalSlug(tenant.slug || "");
    }
  }, [tenant]);

  const sanitizeSlug = (val: string) => {
    return val.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0621-\u064A-]/g, '');
  };

  const handleSave = async () => {
    if (!tenantRef || !tenantId || !user) return;
    setIsSaving(true);

    try {
      const newSlug = sanitizeSlug(formData.slug);
      
      // Check if slug changed and if new slug is available
      if (newSlug !== originalSlug && newSlug !== "") {
        const slugRef = doc(db, "slugs", newSlug);
        const slugSnap = await getDoc(slugRef);
        
        if (slugSnap.exists() && slugSnap.data().tenantId !== tenantId) {
          toast({ variant: "destructive", title: "الرابط محجوز", description: "هذا الرابط مستخدم من قبل متجر آخر، يرجى اختيار اسم مختلف." });
          setIsSaving(false);
          return;
        }

        // Execute batch update for slug change
        const batch = writeBatch(db);
        
        // 1. Update Tenant doc
        batch.update(tenantRef, { ...formData, slug: newSlug });
        
        // 2. Add new slug entry
        batch.set(doc(db, "slugs", newSlug), {
          tenantId,
          slug: newSlug,
          active: true,
          updatedAt: Date.now()
        });

        // 3. Delete old slug entry if exists
        if (originalSlug) {
          batch.delete(doc(db, "slugs", originalSlug));
        }

        // 4. Update Profile
        batch.update(doc(db, "accountProfiles", user.uid), { slug: newSlug });
        batch.update(doc(db, "users", user.uid), { slug: newSlug });

        await batch.commit();
        setOriginalSlug(newSlug);
      } else {
        // Normal update if slug didn't change
        await updateDoc(tenantRef, formData);
      }

      toast({ title: "تم الحفظ", description: "تم تحديث إعدادات متجرك بنجاح." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ الإعدادات." });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto opacity-20" /></div>;

  const storeFullUrl = typeof window !== 'undefined' ? `${window.location.origin}/store/${formData.slug}` : "";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground">الإعدادات والربط</h1>
          <p className="text-muted-foreground font-medium text-base">إدارة معلومات المجمع، الأمان، وتفضيلات المظهر والخدمات السحابية.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="rounded-2xl font-black h-14 shadow-2xl shadow-primary/30 gap-3 px-10 text-lg">
          {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
          حفظ كافة التغييرات
        </Button>
      </div>

      <Tabs defaultValue="store" className="space-y-8">
        <TabsList className="bg-white dark:bg-card p-1.5 rounded-[24px] h-16 border shadow-sm w-full md:w-fit overflow-x-auto no-scrollbar">
          <TabsTrigger value="store" className="rounded-2xl px-10 font-black text-sm data-[state=active]:bg-primary data-[state=active]:text-white transition-all">معلومات المجمع</TabsTrigger>
          <TabsTrigger value="printing" className="rounded-2xl px-10 font-black text-sm data-[state=active]:bg-primary data-[state=active]:text-white transition-all">إعدادات الطباعة</TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-2xl px-10 font-black text-sm data-[state=active]:bg-primary data-[state=active]:text-white transition-all">الخدمات السحابية</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-2xl px-10 font-black text-sm data-[state=active]:bg-primary data-[state=active]:text-white transition-all">الإشعارات</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-8 animate-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="rounded-[40px] border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-primary/5 p-8 border-b border-primary/5">
                <CardTitle className="flex items-center gap-3 text-2xl font-black">
                  <Store className="h-7 w-7 text-primary" /> المعلومات الأساسية والرابط
                </CardTitle>
                <CardDescription className="font-bold text-sm">البيانات الرسمية ورابط المتجر الذي يظهر للعملاء.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="font-black text-sm mr-1 uppercase tracking-widest opacity-60">اسم المجمع التجاري</Label>
                  <Input value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} className="rounded-2xl h-14 bg-muted/30 border-none font-bold text-lg px-6" />
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-sm mr-1 uppercase tracking-widest opacity-60">رابط المتجر المخصص (URL Slug)</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                       <Input 
                        value={formData.slug} 
                        onChange={(e) => setFormData({...formData, slug: sanitizeSlug(e.target.value)})} 
                        placeholder="my-store-name"
                        className="rounded-2xl h-14 bg-muted/30 border-none font-black text-left pl-4 pr-12" 
                        dir="ltr"
                       />
                       <Globe className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                     <code className="text-[10px] font-bold text-blue-700 truncate" dir="ltr">{storeFullUrl}</code>
                     <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black" onClick={() => window.open(storeFullUrl, '_blank')}>
                        معاينة <ExternalLink className="mr-1 h-3 w-3" />
                     </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-black text-sm mr-1 opacity-60">رقم الهاتف الأساسي</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="rounded-2xl h-14 bg-muted/30 border-none text-left font-black" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-sm mr-1 opacity-60">رقم الواتساب (للطلبات)</Label>
                    <Input value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} className="rounded-2xl h-14 bg-muted/30 border-none text-left font-black" dir="ltr" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[40px] border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 p-8 border-b">
                <CardTitle className="flex items-center gap-3 text-2xl font-black">
                  <MapPin className="h-7 w-7 text-primary" /> الموقع والتواصل
                </CardTitle>
                <CardDescription className="font-bold text-sm">عناوين الفروع وروابط حسابات التواصل الاجتماعي.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="font-black text-sm mr-1 opacity-60">العنوان الرئيسي</Label>
                  <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="rounded-2xl h-14 bg-muted/30 border-none font-bold px-6" />
                </div>
                <div className="p-6 rounded-3xl bg-slate-50 border-2 border-dashed flex flex-col items-center justify-center text-center gap-2">
                   <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                      <LinkIcon className="h-6 w-6 text-slate-400" />
                   </div>
                   <p className="text-sm font-bold text-slate-500">ميزات الربط الاجتماعي ستتوفر قريباً</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="printing" className="space-y-8 animate-in slide-in-from-bottom-4">
           <Card className="rounded-[40px] border-none shadow-sm max-w-2xl overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-8">
                <CardTitle className="flex items-center gap-3 text-2xl font-black">
                  <Printer className="h-7 w-7 text-primary" /> إعدادات الطابعات
                </CardTitle>
                <CardDescription className="text-slate-400">تحديد الطابعة الافتراضية والقياسات المستخدمة في الفواتير.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="space-y-2">
                    <Label className="font-black">اسم الطابعة في النظام (System Printer Name)</Label>
                    <Input 
                      value={formData.settings.printerName} 
                      onChange={(e) => setFormData({...formData, settings: {...formData.settings, printerName: e.target.value}})} 
                      placeholder="مثلاً: XP-80C أو Thermal-Printer"
                      className="rounded-xl h-12 bg-muted/30 border-none font-mono"
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="font-black">القياس الافتراضي للطباعة</Label>
                    <div className="grid grid-cols-3 gap-3">
                       {['58mm', '80mm', 'A4'].map(size => (
                         <button 
                          key={size}
                          onClick={() => setFormData({...formData, settings: {...formData.settings, defaultPrintSize: size}})}
                          className={`h-12 rounded-xl font-black border-2 transition-all ${formData.settings.defaultPrintSize === size ? 'border-primary bg-primary/5 text-primary' : 'border-muted'}`}
                         >
                            {size}
                         </button>
                       ))}
                    </div>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="notifications" className="animate-in slide-in-from-bottom-4">
           <Card className="rounded-[40px] border-none shadow-sm max-w-3xl">
              <CardHeader className="p-8">
                <CardTitle className="flex items-center gap-3 text-2xl font-black">
                  <BellRing className="h-7 w-7 text-primary" /> تفضيلات الإشعارات
                </CardTitle>
                <CardDescription className="font-bold text-sm">التحكم في متى وكيف يتم إخطار الإدارة والعملاء.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-8">
                 <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/20 hover:bg-muted/40 transition-colors">
                    <div className="space-y-1">
                       <p className="font-black text-lg">إشعارات الطلبات الجديدة</p>
                       <p className="text-sm text-muted-foreground font-medium">إرسال إشعار فوري للمدراء عند استلام طلب شراء جديد.</p>
                    </div>
                    <Switch checked={formData.settings.notificationsEnabled} onCheckedChange={(c) => setFormData({...formData, settings: {...formData.settings, notificationsEnabled: c}})} className="scale-110 data-[state=checked]:bg-primary" />
                 </div>
                 <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/20 hover:bg-muted/40 transition-colors">
                    <div className="space-y-1">
                       <p className="font-black text-lg">تنبيهات انخفاض المخزون</p>
                       <p className="text-sm text-muted-foreground font-medium">تنبيه المسؤولين عند وصول أي منتج للحد الأدنى (أقل من 5 قطع).</p>
                    </div>
                    <Switch checked={formData.settings.stockAlertsEnabled} onCheckedChange={(c) => setFormData({...formData, settings: {...formData.settings, stockAlertsEnabled: c}})} className="scale-110 data-[state=checked]:bg-primary" />
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
