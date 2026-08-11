"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Phone, ArrowLeft, ScrollText, AlertCircle } from "lucide-react";
import Link from "next/link";
import { normalizePhoneNumber, getInternalEmail } from "@/lib/auth-utils";

export default function LoginPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    
    // 1. تنظيف البيانات المدخلة بشكل صارم
    const purePhone = normalizePhoneNumber(phoneNumber.trim());
    const trimmedPassword = password.trim();
    
    if (!purePhone || purePhone.length < 9) {
      toast({ 
        variant: "destructive", 
        title: "خطأ في الرقم", 
        description: "يرجى إدخال رقم هاتف صالح." 
      });
      setLoading(false);
      return;
    }

    // 2. توليد الهوية الرقمية الموحدة
    const email = getInternalEmail(purePhone);

    try {
      // 3. محاولة تسجيل الدخول
      const userCredential = await signInWithEmailAndPassword(auth, email, trimmedPassword);
      const user = userCredential.user;

      // 4. جلب الملف الشخصي والتحقق من الرتبة
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        await updateDoc(userRef, { lastLogin: Date.now() }).catch(() => {});

        toast({ title: "تم الدخول بنجاح" });

        // توجيه بناءً على الرتبة
        if (userData.role === 'super_admin') {
          router.push("/super-admin");
        } else if (['owner', 'admin', 'sales_employee', 'workshop_technician', 'warehouse_employee'].includes(userData.role)) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        // إذا كان موجوداً في Auth ولكن ليس لديه ملف (حالة نادرة)، نوجهه للتأسيس
        router.push("/onboarding");
      }
      
    } catch (error: any) {
      // تسجيل الخطأ داخلياً للمطور في بيئة التطوير
      if (process.env.NODE_ENV === 'development') {
        console.error("Login Failure Code:", error.code);
      }

      let errorMessage = "رقم الهاتف أو كلمة المرور غير صحيحة.";
      
      if (error.code === 'auth/too-many-requests') {
        errorMessage = "تم قفل الحساب مؤقتاً بسبب محاولات خاطئة متكررة.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "فشل الاتصال، تحقق من جودة الإنترنت.";
      }
      
      toast({ variant: "destructive", title: "فشل الدخول", description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] p-4 relative overflow-hidden">
      <Card className="w-full max-w-md rounded-[48px] border-none shadow-2xl overflow-hidden bg-white relative z-10">
        <div className="p-8 pt-10">
           <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-full gap-2 font-bold mb-6">
                 <ArrowLeft className="h-4 w-4 rotate-180" /> العودة للمنصة
              </Button>
           </Link>
        </div>

        <CardHeader className="space-y-4 pt-0 pb-6 text-center">
          <div className="mx-auto flex flex-col items-center gap-2">
             <div className="h-16 w-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-xl">
                <ScrollText className="h-10 w-10" />
             </div>
             <span className="text-3xl font-black text-primary tracking-tighter">دوبسار DUBSAR</span>
          </div>
          <CardDescription className="font-medium text-slate-500 italic">بوابتك للتجارة السحابية الذكية</CardDescription>
        </CardHeader>
        
        <CardContent className="px-10">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400 text-right block">رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input 
                  type="tel" 
                  placeholder="07XXXXXXXXX" 
                  className="h-14 rounded-2xl pr-12 bg-slate-50 border-none text-left font-black" 
                  dir="ltr" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400 text-right block">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-14 rounded-2xl pr-12 bg-slate-50 border-none" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-16 rounded-[24px] font-black text-lg gap-2 shadow-2xl mt-4 bg-primary" 
              disabled={loading}
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "دخول إلى النظام"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="pb-12 pt-6 flex flex-col gap-4 text-center">
          <p className="text-sm text-slate-500 font-bold">ليس لديك حساب؟ <Link href="/register" className="text-secondary font-black hover:underline">انضم إلينا الآن</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}
