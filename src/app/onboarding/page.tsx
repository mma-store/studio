'use client';

import { useState, useMemo } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, query, where, getDocs, writeBatch, orderBy, limit } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Store, User, Phone, MapPin, Briefcase, Loader2, ArrowRight, CheckCircle2, ArrowLeft, ScrollText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
      .toLowerCase()
      .replace(/[^\u0621-\u064A\u0660-\u0669a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-");
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = generateSlug(formData.businessName);
      
      const slugQuery = query(collection(db, "tenants"), where("slug", "==", slug));
      const slugSnap = await getDocs(slugQuery);
      if (!slugSnap.empty) {
        toast({ variant: "destructive", title: "اسم المتجر مستخدم", description: "يرجى اختيار اسم متجر آخر." });
        setLoading(false);
        return;
      }

      const plansQuery = query(collection(db, "plans"), where("active", "==", true), orderBy("monthlyPrice", "asc"), limit(1));
      const plansSnap = await getDocs(plansQuery);
      let trialDays = 14; 
      let trialPlanId = "";
      
      if (!plansSnap.empty) {
        const trialPlan = plansSnap.docs[0].data();
        trialDays = trialPlan.trialDays || 14;
        trialPlanId = plansSnap.docs[0].id;
      }

      const purePhone = formData.phoneNumber.replace(/\s/g, '').replace(/^(\+964|0)/, '');
      const email = `${purePhone}@platform.store`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password);
      const user = userCredential.user;

      const batch = writeBatch(db);
      const tenantId = `T-${Date.now().toString().slice(-6)}`;
      const now = Date.now();
      
      const tenantRef = doc(db, "tenants", tenantId);
      batch.set(tenantRef, {
        tenantId,
        businessName: formData.businessName,
        slug,
        ownerName: formData.ownerName,
        phone: formData.phoneNumber,
        address: formData.address,
        businessType: formData.businessType,
        status: "trial",
        subscriptionPlanId: trialPlanId,
        subscriptionPlan: "trial",
        trialStartDate: now,
        trialEndDate: now + trialDays * 24 * 60 * 60 * 1000,
        createdAt: now
      });

      const userRef = doc(db, "users", user.uid);
      batch.set(userRef, {
        uid: user.uid,
        tenantId,
        displayName: formData.ownerName,
        phoneNumber: formData.phoneNumber,
        email,
        role: "owner",
        createdAt: now
      });

      await batch.commit();
      toast({ title: "مبروك! تم تأسيس متجرك على دوبسار", description: "جاري توجيهك للوحة التحكم." });
      router.push("/admin");
      
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في التسجيل", description: error.message });
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
          <CardDescription className="font-medium text-lg text-slate-500">امتلك نظاماً سحابياً متكاملاً بهوية عراقية عريقة.</CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-10">
          <form onSubmit={handleOnboarding} className="space-y-6">
            {step === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest">اسم النشاط التجاري</Label>
                  <Input name="businessName" value={formData.businessName} onChange={handleChange} required placeholder="مثال: مجمع بابل" className="h-14 rounded-2xl bg-slate-50 border-none font-black px-6" />
                </div>
                <div className="space-y-2">
                   <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest">اسم صاحب العمل</Label>
                   <Input name="ownerName" value={formData.ownerName} onChange={handleChange} required placeholder="الاسم الكامل" className="h-14 rounded-2xl bg-slate-50 border-none font-black px-6" />
                </div>
                <div className="space-y-2">
                   <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest">العنوان</Label>
                   <Input name="address" value={formData.address} onChange={handleChange} required placeholder="المدينة، المنطقة" className="h-14 rounded-2xl bg-slate-50 border-none font-black px-6" />
                </div>
                <div className="space-y-2">
                   <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest">نوع النشاط</Label>
                   <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full h-14 rounded-2xl bg-slate-50 border-none px-6 font-black appearance-none outline-none">
                     <option value="retail">تجارة مفرد</option>
                     <option value="wholesale">تجارة جملة</option>
                     <option value="workshop">ورشة وصيانة</option>
                     <option value="general">متجر عام</option>
                   </select>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-6 animate-in slide-in-from-left-4 duration-500">
                <div className="space-y-2">
                   <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest">رقم الهاتف الأساسي</Label>
                   <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required placeholder="07XXXXXXXXX" className="h-14 rounded-2xl bg-slate-50 border-none text-left font-black px-6" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-xs mr-2 opacity-60 uppercase tracking-widest">كلمة سر اللوحة</Label>
                  <Input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="h-14 rounded-2xl bg-slate-50 border-none text-left px-6" dir="ltr" />
                </div>
              </div>
            )}

            <div className="pt-8 flex gap-4">
              {step === 2 && <Button type="button" variant="ghost" onClick={() => setStep(1)} className="h-16 rounded-2xl font-black px-10">سابق</Button>}
              <Button 
                type={step === 1 ? "button" : "submit"} 
                onClick={() => step === 1 && setStep(2)}
                disabled={loading}
                className="flex-1 h-16 rounded-[24px] font-black text-xl gap-3 shadow-2xl bg-primary"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                  <>{step === 1 ? "المتابعة" : "تأسيس المتجر الآن"}<ArrowRight className={cn("h-6 w-6", step === 2 && "hidden")} /></>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}