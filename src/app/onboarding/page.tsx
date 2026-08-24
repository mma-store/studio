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
import { Loader2, ShieldCheck, Store } from "lucide-react";

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

  // توجيه التاجر إذا كان يملك متجراً بالفعل في saas-prod
  useEffect(() => {
    if (!identityLoading && profile?.tenantId && profile.tenantId !== 'PENDING_ESTABLISHMENT') {
      router.replace('/admin');
    }
  }, [identityLoading, profile, router]);

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ variant: "destructive", title: "غير مصرح", description: "يرجى تسجيل الدخول أو إنشاء حساب أولاً." });
      router.push('/register');
      return;
    }

    setLoading(true);
    console.log("ONBOARDING_STARTED", { uid: user.uid, businessName: formData.businessName });

    try {
      const slug = formData.businessName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      const newTenantId = `T-${Date.now().toString().slice(-6)}`;
      const now = Date.now();

      // 1. التحقق من الرابط (Slug)
      const slugRef = doc(db, "slugs", slug);
      const slugSnap = await getDoc(slugRef);
      if (slugSnap.exists()) {
        toast({ variant: "destructive", title: "الرابط محجوز", description: "يرجى اختيار اسم متجر آخر." });
        setLoading(false);
        return;
      }

      // 2. عملية التأسيس الموحدة في saas-prod
      const batch = writeBatch(db);

      // إنشاء وثيقة المتجر
      batch.set(doc(db, "tenants", newTenantId), {
        tenantId: newTenantId,
        businessName: formData.businessName.trim(),
        ownerUid: user.uid,
        ownerName: formData.ownerName.trim(),
        slug: slug,
        address: formData.address,
        status: 'active',
        subscriptionPlan: 'trial',
        trialEndDate: now + (14 * 24 * 60 * 60 * 1000), // 14 يوم تجريبي
        createdAt: now
      });

      // حجز الرابط العالمي
      batch.set(slugRef, { tenantId: newTenantId, createdAt: now });

      // تحديث البروفايل بالـ tenantId الجديد وفك حالة الانتظار
      const updatedProfileRef = doc(db, "accountProfiles", user.uid);
      batch.update(updatedProfileRef, { 
        tenantId: newTenantId, 
        displayName: formData.ownerName.trim(),
        updatedAt: now
      });

      // تحديث نسخة المستخدم لضمان التوافق مع الكود
      const userRef = doc(db, "users", user.uid);
      batch.update(userRef, { 
        tenantId: newTenantId, 
        displayName: formData.ownerName.trim(),
        updatedAt: now
      });

      await batch.commit();
      
      console.log("ONBOARDING_SUCCESS", { tenantId: newTenantId });
      toast({ title: "تم إطلاق المتجر بنجاح!", description: "أهلاً بك في لوحة تحكم دوبسار." });
      
      // التوجيه فوراً للوحة الإدارة
      router.replace("/admin");
      
    } catch (error: any) {
      console.error('ONBOARDING_ERROR:', error);
      toast({ variant: "destructive", title: "فشل التأسيس", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (identityLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] p-4">
      <Card className="w-full max-w-2xl rounded-[48px] border-none shadow-2xl overflow-hidden bg-white">
        <CardHeader className="text-center pt-12 pb-6">
           <div className="mx-auto h-20 w-20 bg-primary rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl">
              <Store className="h-10 w-10" />
           </div>
           <h2 className="text-3xl font-black text-primary">تأسيس متجرك السحابي</h2>
           <CardDescription className="font-bold">أدخل بيانات متجرك للبدء في البيع فوراً على المشروع الجديد</CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-12">
          <form onSubmit={handleOnboarding} className="space-y-6">
            <div className="space-y-2">
              <Label className="font-black text-xs opacity-60 uppercase">اسم المتجر / المجمع</Label>
              <Input required value={formData.businessName} onChange={(e)=>setFormData({...formData, businessName: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none font-black text-lg" placeholder="مثال: مجمع السلام للتجارة" />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-xs opacity-60 uppercase">اسم المدير المسؤول</Label>
              <Input required value={formData.ownerName} onChange={(e)=>setFormData({...formData, ownerName: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" placeholder="الاسم الكامل" />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-xs opacity-60 uppercase">العنوان</Label>
              <Input required value={formData.address} onChange={(e)=>setFormData({...formData, address: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none" placeholder="المحافظة، المنطقة" />
            </div>
            
            <Button type="submit" disabled={loading} className="w-full h-20 rounded-[28px] font-black text-2xl bg-primary hover:bg-primary/90 text-white gap-3 shadow-2xl">
              {loading ? <Loader2 className="h-7 w-7 animate-spin" /> : <><ShieldCheck className="h-7 w-7" /> تأسيس وإطلاق المتجر الآن</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
