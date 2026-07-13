
'use client';

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc, query, where, getDocs, writeBatch } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Store, User, Phone, MapPin, Briefcase, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
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
      
      // 1. Check if slug exists
      const slugQuery = query(collection(db, "tenants"), where("slug", "==", slug));
      const slugSnap = await getDocs(slugQuery);
      if (!slugSnap.empty) {
        toast({ variant: "destructive", title: "اسم المتجر مستخدم", description: "يرجى اختيار اسم متجر آخر." });
        setLoading(false);
        return;
      }

      // 2. Create Auth User
      const purePhone = formData.phoneNumber.replace(/\s/g, '').replace(/^(\+964|0)/, '');
      const email = `${purePhone}@platform.store`;
      const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password);
      const user = userCredential.user;

      // 3. Prepare Batch Creation
      const batch = writeBatch(db);
      const tenantId = `T-${Date.now().toString().slice(-6)}`;
      
      // A. Create Tenant
      const tenantRef = doc(db, "tenants", tenantId);
      batch.set(tenantRef, {
        tenantId,
        businessName: formData.businessName,
        slug,
        ownerName: formData.ownerName,
        phone: formData.phoneNumber,
        address: formData.address,
        businessType: formData.businessType,
        status: "active",
        subscriptionPlan: "trial",
        createdAt: Date.now()
      });

      // B. Create Owner Profile
      const userRef = doc(db, "users", user.uid);
      batch.set(userRef, {
        uid: user.uid,
        tenantId,
        displayName: formData.ownerName,
        phoneNumber: formData.phoneNumber,
        email,
        role: "owner",
        createdAt: Date.now()
      });

      // C. Create Default Settings
      const settingsRef = doc(db, "auditLogs", `initial-${tenantId}`); // Just a log entry for now as placeholder for settings logic
      batch.set(settingsRef, {
        tenantId,
        action: "تأسيس المتجر",
        details: `تم إنشاء متجر ${formData.businessName} بنجاح.`,
        timestamp: Date.now()
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
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
      
      <Card className="w-full max-w-2xl rounded-[40px] border-none shadow-2xl overflow-hidden bg-white">
        <CardHeader className="space-y-4 pt-12 pb-6 text-center">
          <div className="mx-auto relative h-20 w-48">
            <Image src={LOGO_URL} alt="Platform" fill className="object-contain" priority />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black">ابدأ تجارتك اليوم</CardTitle>
            <CardDescription className="font-medium text-lg">أنت على بعد خطوات من امتلاك نظام مبيعات وموقع إلكتروني متكامل.</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-8 pb-10">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 mb-10">
             {[1, 2].map((s) => (
               <div key={s} className="flex items-center gap-2">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center font-black transition-all",
                    step >= s ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  )}>{step > s ? <CheckCircle2 className="h-6 w-6" /> : s}</div>
                  <span className={cn("text-xs font-bold", step >= s ? "text-primary" : "text-muted-foreground")}>
                    {s === 1 ? "بيانات النشاط" : "بيانات الدخول"}
                  </span>
                  {s === 1 && <div className="w-12 h-0.5 bg-muted mx-2" />}
               </div>
             ))}
          </div>

          <form onSubmit={handleOnboarding} className="space-y-6">
            {step === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label className="font-bold flex items-center gap-2"><Store className="h-4 w-4 text-primary" /> اسم المحل / المجمع</Label>
                  <Input name="businessName" value={formData.businessName} onChange={handleChange} required placeholder="مثال: مجمع السلام" className="h-14 rounded-2xl bg-muted/20 border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold flex items-center gap-2"><User className="h-4 w-4 text-primary" /> اسم صاحب العمل</Label>
                  <Input name="ownerName" value={formData.ownerName} onChange={handleChange} required placeholder="الاسم الكامل" className="h-14 rounded-2xl bg-muted/20 border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> العنوان</Label>
                  <Input name="address" value={formData.address} onChange={handleChange} required placeholder="المدينة، المنطقة" className="h-14 rounded-2xl bg-muted/20 border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary" /> نوع النشاط</Label>
                  <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full h-14 rounded-2xl bg-muted/20 border-none px-4 font-bold appearance-none outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="motorcycle_parts">قطع غيار دراجات</option>
                    <option value="car_parts">قطع غيار سيارات</option>
                    <option value="general_store">متجر عام</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-6 animate-in slide-in-from-left-4 duration-500">
                <div className="space-y-2">
                  <Label className="font-bold flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> رقم الهاتف</Label>
                  <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required placeholder="07XXXXXXXXX" className="h-14 rounded-2xl bg-muted/20 border-none text-left font-black" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold flex items-center gap-2">رمز الدخول (كلمة السر)</Label>
                  <Input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="h-14 rounded-2xl bg-muted/20 border-none text-left" dir="ltr" />
                </div>
              </div>
            )}

            <div className="pt-6 flex gap-4">
              {step === 2 && (
                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="h-14 rounded-2xl font-bold px-8">سابق</Button>
              )}
              <Button 
                type={step === 1 ? "button" : "submit"} 
                onClick={() => step === 1 && setStep(2)}
                disabled={loading}
                className="flex-1 h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-[1.01]"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    {step === 1 ? "المتابعة للخطوة الأخيرة" : "إنشاء متجري والبدء الآن"}
                    <ArrowRight className={cn("h-5 w-5", step === 2 && "hidden")} />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/30 p-6 text-center">
           <p className="w-full text-xs text-muted-foreground font-medium">
             بالنقر على "إنشاء متجري"، أنت توافق على شروط الخدمة وسياسة الخصوصية.
           </p>
        </CardFooter>
      </Card>
    </div>
  );
}
