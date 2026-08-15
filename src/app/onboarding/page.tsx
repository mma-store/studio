
'use client';

import { useState, useEffect } from "react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { doc, writeBatch, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ScrollText, AlertCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { UserProfile } from "@/lib/types/roles";

/**
 * @fileOverview تأسيس المتجر الذكي (Idempotent Onboarding).
 * يستخدم معمارية البروفايل المرجعي لضمان عدم تكرار المتاجر.
 */
export default function OnboardingPage() {
  const db = useFirestore();
  const router = useRouter();
  const { user, profile, loading: identityLoading, tenantId } = useUser();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    address: "",
    businessType: "retail",
  });

  // 🛡️ التأسيس الذكي: إذا كان المستخدم يملك متجراً بالفعل، لا نسمح له بالبقاء هنا
  useEffect(() => {
    if (!identityLoading && user && profile?.tenantId) {
      toast({ title: "لديك متجر بالفعل", description: "جاري نقلك للوحة التحكم..." });
      router.replace('/admin');
    }
  }, [identityLoading, user, profile, router]);

  const generateSlug = (name: string) => {
    return name.trim().toLowerCase().replace(/[^\u0621-\u064A\u0660-\u0669a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-");
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    
    setLoading(true);

    try {
      const slug = generateSlug(formData.businessName);
      const now = Date.now();

      // 1. التحقق من حجز الرابط (Idempotency)
      const slugRef = doc(db, "slugs", slug);
      const slugSnap = await getDoc(slugRef);
      
      if (slugSnap.exists()) {
        const existingData = slugSnap.data();
        if (existingData.ownerUid !== user.uid) {
          toast({ variant: "destructive", title: "الاسم محجوز", description: "هذا الاسم مستخدم من قبل متجر آخر." });
          setLoading(false);
          return;
        }
        // إذا كان الرابط محجوزاً لنفس المستخدم، نعتبر العملية استكمالاً بدلاً من تكرار
      }

      // 2. إنشاء المتجر والبروفايل في عملية ذرية واحدة (Atomic Batch)
      const batch = writeBatch(db);
      const newTenantId = tenantId || `T-${Date.now().toString().slice(-6)}`;
      
      // أ) وثيقة المتجر
      batch.set(doc(db, "tenants", newTenantId), {
        tenantId: newTenantId,
        businessName: formData.businessName.trim(),
        slug,
        ownerName: formData.ownerName.trim(),
        ownerUid: user.uid,
        phone: user.phoneNumber || "",
        address: formData.address.trim(),
        businessType: formData.businessType,
        status: "active",
        createdAt: now
      }, { merge: true });

      // ب) سجل الرابط
      batch.set(doc(db, "slugs", slug), {
        tenantId: newTenantId,
        ownerUid: user.uid,
        createdAt: now
      }, { merge: true });

      // ج) البروفايل المرجعي (المصدر الوحيد للحقيقة)
      const accountProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: formData.ownerName.trim(),
        accountType: 'merchant',
        role: 'owner',
        tenantId: newTenantId,
        status: 'active',
        createdAt: now,
        updatedAt: now
      };
      
      batch.set(doc(db, "accountProfiles", user.uid), accountProfile);
      
      // د) التوافق التاريخي مع مجموعة users
      batch.set(doc(db, "users", user.uid), accountProfile, { merge: true });

      await batch.commit();
      toast({ title: "تم تأسيس المتجر بنجاح!" });
      router.replace("/admin");
      
    } catch (error: any) {
      console.error("Onboarding Error:", error);
      toast({ variant: "destructive", title: "فشل التأسيس", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (identityLoading) return (
    <div className="h-screen flex items-center justify-center">
       <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] p-4">
      <Card className="w-full max-w-2xl rounded-[48px] border-none shadow-2xl overflow-hidden bg-white">
        <div className="p-8"><Link href="/"><Button variant="ghost" className="rounded-full gap-2 font-bold"><ArrowLeft className="h-4 w-4 rotate-180" /> العودة للمنصة</Button></Link></div>
        <CardHeader className="text-center pb-6">
           <div className="mx-auto h-16 w-16 bg-primary rounded-3xl flex items-center justify-center text-white mb-4 shadow-xl">
              <ScrollText className="h-10 w-10" />
           </div>
           <h2 className="text-3xl font-black text-primary">تأسيس متجر جديد</h2>
           <CardDescription className="font-bold">أدخل بيانات متجرك للبدء في البيع فوراً</CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-10">
          <form onSubmit={handleOnboarding} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-black text-xs mr-2 opacity-60">اسم المتجر</Label>
                <Input name="businessName" required value={formData.businessName} onChange={(e)=>setFormData({...formData, businessName: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black" placeholder="مثال: مجمع السلام" />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-xs mr-2 opacity-60">المدير المسؤول</Label>
                <Input name="ownerName" required value={formData.ownerName} onChange={(e)=>setFormData({...formData, ownerName: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black" placeholder="اسم صاحب المتجر" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="font-black text-xs mr-2 opacity-60">العنوان</Label>
                <Input name="address" required value={formData.address} onChange={(e)=>setFormData({...formData, address: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black" placeholder="المحافظة، المنطقة، أقرب نقطة دالة" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="font-black text-xs mr-2 opacity-60">نوع العمل</Label>
                <select 
                  name="businessType" 
                  className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 font-black outline-none appearance-none" 
                  value={formData.businessType}
                  onChange={(e)=>setFormData({...formData, businessType: e.target.value})}
                >
                  <option value="retail">متجر قطع غيار (مفرد)</option>
                  <option value="wholesale">تجارة جملة</option>
                  <option value="workshop">ورشة صيانة فقط</option>
                  <option value="mixed">مجمع متكامل (مبيعات + ورشة)</option>
                </select>
              </div>
            </div>
            
            <Button type="submit" disabled={loading} className="w-full h-18 rounded-[28px] font-black text-xl shadow-2xl bg-primary hover:bg-primary/90 gap-3">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
              تأسيس وإطلاق المتجر
            </Button>
            
            <p className="text-center text-[10px] text-muted-foreground font-bold px-10 leading-relaxed">
              بالنقر على تأسيس المتجر، أنت توافق على شروط الخدمة وتلتزم بتقديم بيانات تجارية صحيحة.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
