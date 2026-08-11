'use client';

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, writeBatch, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, ArrowLeft, ScrollText } from "lucide-react";
import Link from "next/link";
import { normalizePhoneNumber, getInternalEmail } from "@/lib/auth-utils";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function OnboardingPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateSlug = (name: string) => {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^\u0621-\u064A\u0660-\u0669a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    
    setLoading(true);

    try {
      const slug = generateSlug(formData.businessName);
      const purePhone = normalizePhoneNumber(formData.phoneNumber.trim());
      const email = getInternalEmail(purePhone);
      const trimmedPassword = formData.password.trim();
      
      // 1. التحقق من توافر الرابط عبر السجل العالمي (slugs) لتجنب أخطاء الأذونات
      const slugRef = doc(db, "slugs", slug);
      let slugSnap;
      try {
        slugSnap = await getDoc(slugRef);
      } catch (err: any) {
        if (err.code === 'permission-denied') {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `slugs/${slug}`,
            operation: 'get'
          }));
        }
        throw err;
      }
      
      if (slugSnap.exists()) {
        toast({ variant: "destructive", title: "اسم المتجر مستخدم", description: "يرجى اختيار اسم متجر آخر." });
        setLoading(false);
        return;
      }

      // 2. إدارة حساب المستخدم
      let targetUser = auth.currentUser;
      
      if (!targetUser) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, trimmedPassword);
          targetUser = userCredential.user;
        } catch (authError: any) {
          if (authError.code === 'auth/email-already-in-use') {
            toast({ variant: "destructive", title: "الحساب موجود مسبقاً", description: "رقم الهاتف هذا مسجل لدينا، يرجى تسجيل الدخول أولاً ثم إكمال التأسيس." });
            setLoading(false);
            return;
          }
          throw authError;
        }
      }

      // 3. كتابة البيانات (Batch)
      const batch = writeBatch(db);
      const tenantId = `T-${Date.now().toString().slice(-6)}`;
      const now = Date.now();
      
      const tenantRef = doc(db, "tenants", tenantId);
      const tenantData = {
        tenantId,
        businessName: formData.businessName.trim(),
        slug,
        ownerName: formData.ownerName.trim(),
        ownerUid: targetUser.uid,
        phone: `0${purePhone}`,
        address: formData.address.trim(),
        businessType: formData.businessType,
        status: "trial",
        subscriptionPlan: "trial",
        trialStartDate: now,
        trialEndDate: now + (14 * 24 * 60 * 60 * 1000),
        createdAt: now,
        settings: { defaultPrintSize: "80mm", notificationsEnabled: true }
      };
      batch.set(tenantRef, tenantData);

      // حجز الرابط في السجل العالمي
      const slugRegistryRef = doc(db, "slugs", slug);
      batch.set(slugRegistryRef, {
        tenantId,
        businessName: formData.businessName.trim(),
        createdAt: now
      });

      const userRef = doc(db, "users", targetUser.uid);
      const userData = {
        uid: targetUser.uid,
        tenantId,
        displayName: formData.ownerName.trim(),
        phoneNumber: `0${purePhone}`,
        email,
        role: "owner",
        accountType: "merchant",
        createdAt: now,
        status: "active"
      };
      batch.set(userRef, userData);

      try {
        await batch.commit();
      } catch (err: any) {
        if (err.code === 'permission-denied') {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `tenants/${tenantId} or users/${targetUser.uid}`,
            operation: 'create',
            requestResourceData: { tenantData, userData }
          }));
        }
        throw err;
      }

      toast({ title: "مبروك! تم تأسيس متجرك", description: "جاري توجيهك إلى لوحة التحكم." });
      router.push("/admin");
      
    } catch (error: any) {
      console.error("Onboarding Error:", error);
      toast({ variant: "destructive", title: "فشل التأسيس", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] p-4 relative overflow-hidden">
      <Card className="w-full max-w-2xl rounded-[48px] border-none shadow-2xl overflow-hidden bg-white">
        <div className="p-8 pt-10">
           <Link href="/"><Button variant="ghost" size="sm" className="rounded-full gap-2 font-bold mb-4"><ArrowLeft className="h-4 w-4 rotate-180" /> العودة</Button></Link>
        </div>
        <CardHeader className="space-y-4 pt-0 pb-6 text-center">
          <div className="mx-auto flex flex-col items-center gap-2">
             <div className="h-16 w-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-xl">
                <ScrollText className="h-10 w-10" />
             </div>
             <h2 className="text-3xl font-black text-primary tracking-tighter">تأسيس متجر دوبسار</h2>
          </div>
          <CardDescription className="font-medium text-lg text-slate-500">ابدأ تجارتك السحابية اليوم بهوية عراقية أصيلة.</CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-10">
          <form onSubmit={handleOnboarding} className="space-y-6">
            {step === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest">اسم المتجر</Label>
                  <Input name="businessName" value={formData.businessName} onChange={handleChange} required placeholder="مثال: مجمع بابل" className="h-14 rounded-2xl bg-slate-50 border-none font-black px-6" />
                </div>
                <div className="space-y-2">
                   <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest">المدير المسؤول</Label>
                   <Input name="ownerName" value={formData.ownerName} onChange={handleChange} required placeholder="الاسم الكامل" className="h-14 rounded-2xl bg-slate-50 border-none font-black px-6" />
                </div>
                <div className="space-y-2">
                   <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest">عنوان المحل</Label>
                   <Input name="address" value={formData.address} onChange={handleChange} required placeholder="المدينة، المنطقة" className="h-14 rounded-2xl bg-slate-50 border-none font-black px-6" />
                </div>
                <div className="space-y-2">
                   <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest">نوع العمل</Label>
                   <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 font-black appearance-none outline-none">
                     <option value="retail">تجارة مفرد</option>
                     <option value="wholesale">تجارة جملة</option>
                     <option value="workshop">ورشة وصيانة</option>
                   </select>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-6 animate-in slide-in-from-left-4 duration-500">
                <div className="space-y-2">
                   <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest">رقم الهاتف للدخول</Label>
                   <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required placeholder="07XXXXXXXXX" className="h-14 rounded-2xl bg-slate-50 border-none text-left font-black px-6" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest">كلمة السر</Label>
                  <Input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="h-14 rounded-2xl bg-slate-50 border-none text-left px-6" dir="ltr" />
                </div>
              </div>
            )}

            <div className="pt-8 flex gap-4">
              {step === 2 && <Button type="button" variant="ghost" onClick={() => setStep(1)} className="h-16 rounded-2xl font-black px-10" disabled={loading}>سابق</Button>}
              <Button 
                type="submit"
                disabled={loading}
                className="flex-1 h-16 rounded-[24px] font-black text-xl gap-3 shadow-2xl bg-primary"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                  <>{step === 1 ? "المتابعة للخطوة الأخيرة" : "تأسيس المتجر الآن"}<ArrowRight className={step === 2 ? "hidden" : "h-6 w-6 rotate-180"} /></>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}