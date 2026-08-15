
'use client';

import { useState, useEffect } from "react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, writeBatch, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ScrollText, AlertCircle } from "lucide-react";
import Link from "next/link";
import { normalizePhoneNumber, getInternalEmail } from "@/lib/auth-utils";

/**
 * @fileOverview تأسيس المتجر الذكي (Idempotent Onboarding).
 */
export default function OnboardingPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { profile, tenantId, loading: identityLoading, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    phoneNumber: "",
    password: "",
    address: "",
    businessType: "retail",
  });

  // فحص ذكي: إذا كان المستخدم يملك متجراً بالفعل، لا نسمح له بالبقاء في هذه الصفحة
  useEffect(() => {
    if (!identityLoading && tenantId && tenantId !== 'GUEST') {
      router.replace('/admin');
    }
  }, [tenantId, identityLoading, router]);

  const generateSlug = (name: string) => {
    return name.trim().toLowerCase().replace(/[^\u0621-\u064A\u0660-\u0669a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-");
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && !user) {
      setStep(2);
      return;
    }
    
    setLoading(true);

    try {
      const purePhone = normalizePhoneNumber(formData.phoneNumber.trim() || profile?.phoneNumber || "");
      const email = getInternalEmail(purePhone);
      const slug = generateSlug(formData.businessName);
      const now = Date.now();

      // 1. إدارة الهوية
      let targetUid = user?.uid;
      
      if (!targetUid) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password.trim());
        targetUid = userCredential.user.uid;
      }

      // 2. التحقق من حجز الرابط (Idempotent Check)
      const slugRef = doc(db, "slugs", slug);
      const slugSnap = await getDoc(slugRef);
      
      if (slugSnap.exists() && slugSnap.data().ownerUid !== targetUid) {
        toast({ variant: "destructive", title: "الاسم محجوز", description: "اسم المتجر هذا مستخدم بالفعل من قبل شخص آخر." });
        setLoading(false);
        return;
      }

      // 3. إنشاء المتجر والبروفايل في عملية واحدة
      const batch = writeBatch(db);
      const newTenantId = `T-${Date.now().toString().slice(-6)}`;
      
      batch.set(doc(db, "tenants", newTenantId), {
        tenantId: newTenantId,
        businessName: formData.businessName.trim(),
        slug,
        ownerName: formData.ownerName.trim() || profile?.displayName || "المالك",
        ownerUid: targetUid,
        phone: `0${purePhone}`,
        address: formData.address.trim(),
        businessType: formData.businessType,
        status: "active",
        createdAt: now
      }, { merge: true });

      batch.set(doc(db, "slugs", slug), {
        tenantId: newTenantId,
        ownerUid: targetUid,
        createdAt: now
      });

      batch.set(doc(db, "users", targetUid), {
        uid: targetUid,
        tenantId: newTenantId,
        displayName: formData.ownerName.trim() || profile?.displayName || "المالك",
        phoneNumber: `0${purePhone}`,
        email,
        role: "owner",
        createdAt: now
      }, { merge: true });

      await batch.commit();
      toast({ title: "تم التأسيس بنجاح!" });
      router.push("/admin");
      
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] p-4">
      <Card className="w-full max-w-2xl rounded-[48px] border-none shadow-2xl overflow-hidden bg-white">
        <div className="p-8"><Link href="/"><Button variant="ghost" className="rounded-full gap-2 font-bold"><ArrowLeft className="h-4 w-4 rotate-180" /> العودة</Button></Link></div>
        <CardHeader className="text-center pb-6">
           <div className="mx-auto h-16 w-16 bg-primary rounded-3xl flex items-center justify-center text-white mb-4 shadow-xl"><ScrollText className="h-10 w-10" /></div>
           <h2 className="text-3xl font-black text-primary">تأسيس متجر جديد</h2>
           <CardDescription>ابدأ تجارتك السحابية اليوم</CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-10">
          <form onSubmit={handleOnboarding} className="space-y-6">
            {step === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="font-bold">اسم المتجر</Label><Input name="businessName" required value={formData.businessName} onChange={(e)=>setFormData({...formData, businessName: e.target.value})} className="h-12 rounded-2xl bg-slate-50 border-none px-6 font-black" /></div>
                <div className="space-y-2"><Label className="font-bold">المدير المسؤول</Label><Input name="ownerName" required value={formData.ownerName} onChange={(e)=>setFormData({...formData, ownerName: e.target.value})} className="h-12 rounded-2xl bg-slate-50 border-none px-6 font-black" /></div>
                <div className="space-y-2"><Label className="font-bold">العنوان</Label><Input name="address" required value={formData.address} onChange={(e)=>setFormData({...formData, address: e.target.value})} className="h-12 rounded-2xl bg-slate-50 border-none px-6 font-black" /></div>
                <div className="space-y-2"><Label className="font-bold">نوع العمل</Label>
                  <select name="businessType" className="w-full h-12 rounded-2xl bg-slate-50 border-none px-6 font-black outline-none" onChange={(e)=>setFormData({...formData, businessType: e.target.value})}>
                    <option value="retail">مفرد</option><option value="wholesale">جملة</option><option value="workshop">ورشة</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-6">
                <div className="space-y-2"><Label className="font-bold">رقم الهاتف</Label><Input name="phoneNumber" required placeholder="07XXXXXXXXX" className="h-12 rounded-2xl bg-slate-50 border-none text-left font-black" dir="ltr" onChange={(e)=>setFormData({...formData, phoneNumber: e.target.value})} /></div>
                <div className="space-y-2"><Label className="font-bold">كلمة السر</Label><Input type="password" name="password" required className="h-12 rounded-2xl bg-slate-50 border-none" onChange={(e)=>setFormData({...formData, password: e.target.value})} /></div>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full h-16 rounded-[24px] font-black text-xl shadow-2xl bg-primary">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (step === 1 && !user ? "المتابعة للخطوة الأخيرة" : "تأسيس المتجر الآن")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
