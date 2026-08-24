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

  // توجيه التاجر إذا كان يملك متجراً بالفعل
  useEffect(() => {
    if (!identityLoading && profile?.tenantId && profile.tenantId !== 'PENDING_ESTABLISHMENT') {
      router.replace('/admin');
    }
  }, [identityLoading, profile, router]);

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ variant: "destructive", title: "غير مصرح", description: "يرجى إنشاء حساب أولاً." });
      router.push('/register');
      return;
    }

    setLoading(true);
    try {
      const slug = formData.businessName.trim().toLowerCase().replace(/\s+/g, '-');
      const newTenantId = `T-${Date.now().toString().slice(-6)}`;
      const now = Date.now();

      // 1. التحقق من السلوج
      const slugRef = doc(db, "slugs", slug);
      const slugSnap = await getDoc(slugRef);
      if (slugSnap.exists()) {
        toast({ variant: "destructive", title: "الرابط محجوز", description: "يرجى اختيار اسم متجر آخر." });
        setLoading(false);
        return;
      }

      // 2. عملية التأسيس الموحدة
      const batch = writeBatch(db);

      // إنشاء المتجر
      batch.set(doc(db, "tenants", newTenantId), {
        tenantId: newTenantId,
        businessName: formData.businessName.trim(),
        ownerUid: user.uid,
        ownerName: formData.ownerName.trim(),
        slug: slug,
        address: formData.address,
        status: 'active',
        subscriptionPlan: 'trial',
        createdAt: now
      });

      // حجز الرابط
      batch.set(slugRef, { tenantId: newTenantId, createdAt: now });

      // تحديث البروفايل بالـ tenantId الجديد
      const updatedProfile = {
        ...profile,
        tenantId: newTenantId,
        displayName: formData.ownerName.trim(),
        updatedAt: now
      };

      batch.update(doc(db, "accountProfiles", user.uid), { tenantId: newTenantId, displayName: formData.ownerName.trim() });
      batch.update(doc(db, "users", user.uid), { tenantId: newTenantId, displayName: formData.ownerName.trim() });

      await batch.commit();
      
      toast({ title: "تم إطلاق المتجر!", description: "أهلاً بك في لوحة تحكم دوبسار." });
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
           <CardDescription className="font-bold">أدخل بيانات متجرك للبدء في البيع فوراً</CardDescription>
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

function Store(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" /></svg>
  );
}
