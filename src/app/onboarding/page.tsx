'use client';

import { useState, useEffect } from "react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
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

export default function OnboardingPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { user: currentUser, profile, loading: userLoading } = useUser();
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

  useEffect(() => {
    if (!userLoading && profile && profile.tenantId) {
      router.replace('/admin');
    }
  }, [profile, userLoading, router]);

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
      const purePhone = normalizePhoneNumber(formData.phoneNumber.trim());
      const email = getInternalEmail(purePhone);
      const slug = generateSlug(formData.businessName);
      const now = Date.now();

      // 1. إدارة الهوية (Auth)
      let targetUser = auth.currentUser;
      
      if (!targetUser) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password.trim());
          targetUser = userCredential.user;
        } catch (authError: any) {
          if (authError.code === 'auth/email-already-in-use') {
            const loginRes = await signInWithEmailAndPassword(auth, email, formData.password.trim());
            targetUser = loginRes.user;
          } else {
            throw authError;
          }
        }
      }

      if (!targetUser) throw new Error("فشل تحديد الهوية");

      // 2. التحقق من الرابط (Slug) - معالجة صامتة للأذونات
      const slugRef = doc(db, "slugs", slug);
      let isSlugAvailable = true;

      try {
        const slugSnap = await getDoc(slugRef);
        if (slugSnap.exists()) {
          // إذا كان الرابط موجوداً ولكن لمالك آخر، فهو محجوز
          if (slugSnap.data().ownerUid !== targetUser.uid) {
            isSlugAvailable = false;
          }
        }
      } catch (err: any) {
        // في نظام SaaS، رفض الأذونات عند القراءة يعني غالباً أن الوثيقة موجودة ولكن ليست لك.
        // نعتبر هذا الرابط محجوزاً دون إظهار خطأ تقني في الواجهة.
        if (err.code === 'permission-denied') {
          isSlugAvailable = false;
        } else {
          // الأخطاء التقنية الأخرى (مثل الشبكة) يتم تمريرها
          throw err;
        }
      }

      if (!isSlugAvailable) {
        toast({ 
          variant: "destructive", 
          title: "الاسم محجوز", 
          description: "اسم هذا المتجر مستخدم بالفعل من قبل تاجر آخر، يرجى اختيار اسم مختلف." 
        });
        setLoading(false);
        return;
      }

      // 3. التأسيس الذري (Atomic Onboarding)
      const batch = writeBatch(db);
      const tenantId = `T-${Date.now().toString().slice(-6)}`;
      
      batch.set(doc(db, "tenants", tenantId), {
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
        createdAt: now,
        settings: { defaultPrintSize: "80mm", notificationsEnabled: true }
      });

      batch.set(doc(db, "slugs", slug), {
        tenantId,
        businessName: formData.businessName.trim(),
        ownerUid: targetUser.uid,
        createdAt: now
      });

      batch.set(doc(db, "users", targetUser.uid), {
        uid: targetUser.uid,
        tenantId,
        displayName: formData.ownerName.trim(),
        phoneNumber: `0${purePhone}`,
        email,
        role: "owner",
        accountType: "merchant",
        createdAt: now,
        status: "active"
      }, { merge: true });

      await batch.commit();

      toast({ title: "تم التأسيس بنجاح", description: "أهلاً بك في منصة دوبسار." });
      router.push("/admin");
      
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في التأسيس", description: error.message || "حدث خطأ غير متوقع." });
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
                  <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest text-right block">اسم المتجر</Label>
                  <Input name="businessName" value={formData.businessName} onChange={handleChange} required placeholder="مثال: مجمع بابل" className="h-14 rounded-2xl bg-slate-50 border-none font-black px-6 text-right" />
                </div>
                <div className="space-y-2">
                   <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest text-right block">المدير المسؤول</Label>
                   <Input name="ownerName" value={formData.ownerName} onChange={handleChange} required placeholder="الاسم الكامل" className="h-14 rounded-2xl bg-slate-50 border-none font-black px-6 text-right" />
                </div>
                <div className="space-y-2">
                   <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest text-right block">عنوان المحل</Label>
                   <Input name="address" value={formData.address} onChange={handleChange} required placeholder="المدينة، المنطقة" className="h-14 rounded-2xl bg-slate-50 border-none font-black px-6 text-right" />
                </div>
                <div className="space-y-2">
                   <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest text-right block">نوع العمل</Label>
                   <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 font-black appearance-none outline-none text-right">
                     <option value="retail">تجارة مفرد</option>
                     <option value="wholesale">تجارة جملة</option>
                     <option value="workshop">ورشة وصيانة</option>
                   </select>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-6 animate-in slide-in-from-left-4 duration-500">
                <div className="space-y-2">
                   <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest text-right block">رقم الهاتف للدخول</Label>
                   <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required placeholder="07XXXXXXXXX" className="h-14 rounded-2xl bg-slate-50 border-none text-left font-black px-6" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest text-right block">كلمة السر</Label>
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
