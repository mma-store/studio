'use client';

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, query, where, getDocs, writeBatch } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Store, User, Phone, MapPin, Briefcase, Loader2, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const LOGO_URL = "https://up6.cc/2026/07/178308238964931.png";

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    phoneNumber: "",
    password: "",
    address: "",
    businessType: "motorcycle_parts",
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

      const purePhone = formData.phoneNumber.replace(/\s/g, '').replace(/^(\+964|0)/, '');
      const email = `${purePhone}@platform.store`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password);
      const user = userCredential.user;

      const batch = writeBatch(db);
      const tenantId = `T-${Date.now().toString().slice(-6)}`;
      
      const trialDays = 14;
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

      const logRef = doc(collection(db, "auditLogs"));
      batch.set(logRef, {
        tenantId,
        action: "تأسيس المتجر (نسخة تجريبية)",
        details: `تم إنشاء متجر ${formData.businessName} بنجاح. تبدأ الفترة التجريبية الآن.`,
        timestamp: now
      });

      await batch.commit();
      
      toast({ title: "مبروك! تم إنشاء متجرك", description: "جاري توجيهك للوحة التحكم الخاصة بك." });
      router.push("/admin");
      
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "خطأ في التسجيل", 
        description: error.message || "حدث خطأ غير متوقع." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 h-2 w-full bg-primary" />
      
      <Card className="w-full max-w-2xl rounded-[48px] border-none shadow-[0_40px_100px_rgba(10,25,47,0.1)] overflow-hidden bg-white relative z-10">
        <div className="p-8 pt-10">
           <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-full gap-2 font-bold mb-4">
                 <ArrowLeft className="h-4 w-4 rotate-180" /> العودة للمنصة
              </Button>
           </Link>
        </div>

        <CardHeader className="space-y-4 pt-0 pb-6 text-center">
          <div className="mx-auto relative h-16 w-40">
            <Image src={LOGO_URL} alt="Platform" fill className="object-contain" priority />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black text-primary">ابدأ تجارتك السحابية</CardTitle>
            <CardDescription className="font-medium text-lg text-slate-500">أنت على بعد دقائق من امتلاك نظام مبيعات وموقع إلكتروني متكامل.</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-10 pb-10">
          {/* MD3 Stepper */}
          <div className="flex items-center justify-center gap-4 mb-12">
             {[1, 2].map((s) => (
               <div key={s} className="flex items-center gap-2">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center font-black transition-all shadow-sm",
                    step >= s ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                  )}>{step > s ? <CheckCircle2 className="h-6 w-6" /> : s}</div>
                  <span className={cn("text-xs font-black uppercase tracking-widest", step >= s ? "text-primary" : "text-slate-400")}>
                    {s === 1 ? "بيانات النشاط" : "بيانات الدخول"}
                  </span>
                  {s === 1 && <div className="w-16 h-1 bg-slate-100 rounded-full mx-2 overflow-hidden">
                      <div className={cn("h-full bg-primary transition-all duration-500", step > 1 ? "w-full" : "w-0")} />
                  </div>}
               </div>
             ))}
          </div>

          <form onSubmit={handleOnboarding} className="space-y-6">
            {step === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400">اسم المحل / المجمع</Label>
                  <div className="relative">
                    <Store className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <Input name="businessName" value={formData.businessName} onChange={handleChange} required placeholder="مثال: مجمع السلام" className="h-14 rounded-2xl pr-12 bg-slate-50 border-none font-black focus-visible:ring-primary/20" />
                  </div>
                </div>
                <div className="space-y-2">
                   <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400">اسم صاحب العمل</Label>
                   <div className="relative">
                     <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                     <Input name="ownerName" value={formData.ownerName} onChange={handleChange} required placeholder="الاسم الكامل" className="h-14 rounded-2xl pr-12 bg-slate-50 border-none font-black focus-visible:ring-primary/20" />
                   </div>
                </div>
                <div className="space-y-2">
                   <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400">العنوان</Label>
                   <div className="relative">
                     <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                     <Input name="address" value={formData.address} onChange={handleChange} required placeholder="المدينة، المنطقة" className="h-14 rounded-2xl pr-12 bg-slate-50 border-none font-black focus-visible:ring-primary/20" />
                   </div>
                </div>
                <div className="space-y-2">
                   <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400">نوع النشاط</Label>
                   <div className="relative">
                     <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                     <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full h-14 rounded-2xl pr-12 bg-slate-50 border-none px-4 font-black appearance-none outline-none focus:ring-2 focus:ring-primary/20">
                       <option value="motorcycle_parts">قطع غيار دراجات</option>
                       <option value="car_parts">قطع غيار سيارات</option>
                       <option value="general_store">متجر عام</option>
                     </select>
                   </div>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-6 animate-in slide-in-from-left-4 duration-500">
                <div className="space-y-2">
                   <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400">رقم الهاتف الأساسي</Label>
                   <div className="relative">
                     <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                     <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required placeholder="07XXXXXXXXX" className="h-14 rounded-2xl pr-12 bg-slate-50 border-none text-left font-black focus-visible:ring-primary/20" dir="ltr" />
                   </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400">رمز الدخول (كلمة السر)</Label>
                  <div className="relative">
                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <Input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="h-14 rounded-2xl pr-12 bg-slate-50 border-none text-left focus-visible:ring-primary/20" dir="ltr" />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-8 flex gap-4">
              {step === 2 && (
                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="h-16 rounded-2xl font-black px-10">سابق</Button>
              )}
              <Button 
                type={step === 1 ? "button" : "submit"} 
                onClick={() => step === 1 && setStep(2)}
                disabled={loading}
                className="flex-1 h-16 rounded-[24px] font-black text-xl gap-3 shadow-2xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-95 bg-primary"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                  <>
                    {step === 1 ? "المتابعة للخطوة الأخيرة" : "إنشاء متجري والبدء الآن"}
                    <ArrowRight className={cn("h-6 w-6", step === 2 && "hidden")} />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="bg-slate-50 p-8 text-center">
           <p className="w-full text-xs text-slate-500 font-black uppercase tracking-widest">
             * تحصل تلقائياً على 14 يوماً من الاستخدام التجريبي الكامل لكافة الميزات.
           </p>
        </CardFooter>
      </Card>
    </div>
  );
}