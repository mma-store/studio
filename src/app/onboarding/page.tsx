
'use client';

import { useState, useEffect } from "react";
import { useFirestore, useUser } from "@/firebase";
import { doc, writeBatch, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ScrollText, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { UserProfile } from "@/lib/types/roles";

export default function OnboardingPage() {
  const db = useFirestore();
  const router = useRouter();
  const { user, profile, loading: identityLoading } = useUser();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    address: "",
  });

  // التحقق مما إذا كان المستخدم يملك متجراً بالفعل لتوجيهه للوحة التحكم
  useEffect(() => {
    if (!identityLoading && profile?.tenantId && profile.tenantId !== 'GUEST') {
      console.log('ONBOARDING: User already associated with tenant:', profile.tenantId);
      router.replace('/admin');
    }
  }, [identityLoading, profile, router]);

  const generateSlug = (name: string) => {
    return name.trim().toLowerCase()
      .replace(/[^\u0621-\u064A\u0660-\u0669a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ variant: "destructive", title: "خطأ في الجلسة", description: "يرجى تسجيل الدخول أولاً." });
      router.push('/login');
      return;
    }

    if (!formData.businessName || !formData.ownerName) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إكمال الحقول المطلوبة." });
      return;
    }
    
    setLoading(true);
    console.log('ONBOARDING: Starting establishment for UID:', user.uid);

    try {
      const slug = generateSlug(formData.businessName);
      if (!slug) throw new Error("اسم المتجر غير صالح لتوليد رابط.");

      const now = Date.now();
      const newTenantId = `T-${Date.now().toString().slice(-6)}`;

      // 1. التحقق من توفر الرابط (Slug)
      const slugRef = doc(db, "slugs", slug);
      const slugSnap = await getDoc(slugRef);
      
      if (slugSnap.exists()) {
        toast({ 
          variant: "destructive", 
          title: "الرابط محجوز", 
          description: "اسم المتجر هذا مستخدم بالفعل، يرجى اختيار اسم آخر." 
        });
        setLoading(false);
        return;
      }

      // 2. تنفيذ عملية كتابة ذرية (Atomic Batch) لضمان سلامة البيانات
      const batch = writeBatch(db);
      
      // إنشاء مستند المتجر (Tenant)
      const tenantRef = doc(db, "tenants", newTenantId);
      batch.set(tenantRef, {
        tenantId: newTenantId,
        businessName: formData.businessName.trim(),
        slug: slug,
        ownerName: formData.ownerName.trim(),
        ownerUid: user.uid,
        phone: user.phoneNumber || "",
        address: formData.address.trim(),
        status: "active",
        subscriptionPlan: "trial",
        createdAt: now,
        settings: {
          defaultPrintSize: "80mm",
          notificationsEnabled: true
        }
      });

      // حجز الرابط في السجل العالمي
      batch.set(slugRef, { 
        tenantId: newTenantId, 
        ownerUid: user.uid,
        createdAt: now 
      });

      // إنشاء ملف الهوية المرجعي
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: formData.ownerName.trim(),
        accountType: 'merchant',
        role: 'owner',
        tenantId: newTenantId,
        status: 'active',
        createdAt: now
      };

      // تحديث المجموعتين المرجعيتين لضمان التوافق
      batch.set(doc(db, "accountProfiles", user.uid), newProfile);
      batch.set(doc(db, "users", user.uid), newProfile);

      console.log('ONBOARDING: Committing batch to saas-prod...');
      await batch.commit();
      
      toast({ title: "تم التأسيس بنجاح!", description: "أهلاً بك في منصة دوبسار." });
      
      // توجيه فوري للوحة التحكم
      setTimeout(() => {
        router.replace("/admin");
      }, 500);
      
    } catch (error: any) {
      console.error('ONBOARDING_ERROR:', error);
      toast({ 
        variant: "destructive", 
        title: "فشل التأسيس", 
        description: error.code === 'permission-denied' 
          ? "لا تملك صلاحية الكتابة. تأكد من نشر Rules الجديدة." 
          : `حدث خطأ: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  if (identityLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FDF8F5] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">جاري التحقق من الهوية...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] p-4">
      <Card className="w-full max-w-2xl rounded-[48px] border-none shadow-2xl overflow-hidden bg-white">
        <div className="p-8">
          <Link href="/">
            <Button variant="ghost" className="rounded-full gap-2 font-bold text-muted-foreground">
              <ArrowLeft className="h-4 w-4 rotate-180" /> العودة للمنصة
            </Button>
          </Link>
        </div>
        
        <CardHeader className="text-center pb-6">
           <div className="mx-auto h-20 w-20 bg-primary rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-primary/20 rotate-3">
              <ScrollText className="h-10 w-10" />
           </div>
           <h2 className="text-3xl font-black text-primary tracking-tight">تأسيس متجرك السحابي</h2>
           <CardDescription className="font-bold text-slate-500">ابدأ رحلة النجاح مع "دوبسار" في خطوات بسيطة</CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-12">
          <form onSubmit={handleOnboarding} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-wider">اسم المتجر / المجمع</Label>
                <Input 
                  name="businessName" 
                  required 
                  value={formData.businessName} 
                  onChange={(e)=>setFormData({...formData, businessName: e.target.value})} 
                  className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-lg focus:ring-2 focus:ring-primary/20" 
                  placeholder="مثال: مجمع السلام" 
                />
              </div>
              
              <div className="space-y-2">
                <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-wider">اسم المدير المسؤول</Label>
                <Input 
                  name="ownerName" 
                  required 
                  value={formData.ownerName} 
                  onChange={(e)=>setFormData({...formData, ownerName: e.target.value})} 
                  className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-lg focus:ring-2 focus:ring-primary/20" 
                  placeholder="الاسم الكامل لصاحب العمل" 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-wider">عنوان المركز الرئيسي</Label>
                <Input 
                  name="address" 
                  required 
                  value={formData.address} 
                  onChange={(e)=>setFormData({...formData, address: e.target.value})} 
                  className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-bold" 
                  placeholder="المحافظة، المنطقة، أقرب نقطة دالة" 
                />
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-blue-50 border border-blue-100 flex gap-4 items-start">
               <AlertCircle className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
               <div className="space-y-1">
                  <p className="text-sm font-black text-blue-900">ملاحظة هامة</p>
                  <p className="text-xs font-bold text-blue-700 leading-relaxed">
                    بمجرد الضغط على الزر، سيتم حجز اسم المتجر وتفعيل هويتك كتاجر في مشروع Dubsar الجديد. يمكنك تعديل هذه البيانات لاحقاً من الإعدادات.
                  </p>
               </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-20 rounded-[28px] font-black text-2xl shadow-2xl bg-primary hover:bg-primary/90 text-white gap-3 transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="h-7 w-7 animate-spin" />
                  جاري بناء المتجر...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-7 w-7" />
                  تأسيس وإطلاق المتجر الآن
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
