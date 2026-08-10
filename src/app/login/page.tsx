
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
import { Loader2, Lock, Phone, ArrowLeft, ScrollText } from "lucide-react";
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
    setLoading(true);
    
    const purePhone = normalizePhoneNumber(phoneNumber);
    
    // قائمة بكافة احتمالات البريد الإلكتروني الداخلي لضمان التوافق مع كافة نسخ النظام
    const emailAttempts = [
      getInternalEmail(purePhone),           // 7xxxxxxxx@dubsar.platform (القياسي الحالي)
      getInternalEmail(`0${purePhone}`),     // 07xxxxxxxx@dubsar.platform (القياسي البديل)
      `${purePhone}@mma.store`,              // 7xxxxxxxx@mma.store (القديم)
      `0${purePhone}@mma.store`              // 07xxxxxxxx@mma.store (القديم جداً)
    ];

    try {
      let userCredential = null;
      let lastError = null;

      // محاولة تسجيل الدخول بكافة التنسيقات الممكنة
      for (const attemptEmail of emailAttempts) {
        try {
          userCredential = await signInWithEmailAndPassword(auth, attemptEmail, password);
          if (userCredential) break; // نجاح الدخول
        } catch (err: any) {
          lastError = err;
          // نمر للمحاولة التالية فقط إذا كان الخطأ متعلقاً ببيانات الاعتماد
          if (err.code !== 'auth/invalid-credential' && err.code !== 'auth/user-not-found') {
            break; 
          }
        }
      }

      if (!userCredential) {
        throw lastError || new Error("Auth failed");
      }
      
      const user = userCredential.user;

      // محاولة استباقية لمعرفة الوجهة وتحديث بيانات المستخدم
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        // تحديث سجل الدخول في الخلفية
        updateDoc(userRef, { 
          lastLogin: Date.now(),
          phoneNumber: userData.phoneNumber?.startsWith('0') ? userData.phoneNumber : `0${purePhone}`
        }).catch(() => {});
        
        const isMaster = purePhone === '7858833838' || purePhone === '7703687932';
        
        if (userData.role === 'super_admin' || isMaster) {
          router.push("/super-admin");
        } else if (['owner', 'admin', 'sales_employee', 'workshop_technician', 'warehouse_employee'].includes(userData.role)) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        // إذا نجح Auth وفشل Firestore، نرسله لـ /admin ليقوم الـ Layout بالمعالجة
        router.push("/admin");
      }
      
      toast({ title: "تم تسجيل الدخول بنجاح" });
    } catch (error: any) {
      console.error("Login Error:", error);
      let message = "تأكد من رقم الهاتف وكلمة المرور.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        message = "بيانات الدخول غير صحيحة.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "محاولات كثيرة خاطئة. تم قفل الحساب مؤقتاً.";
      }
      toast({ variant: "destructive", title: "فشل الدخول", description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      
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
          <CardDescription className="font-medium text-slate-500">سجل دخولك لإدارة تجارتك سحابياً</CardDescription>
        </CardHeader>
        
        <CardContent className="px-10">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400">رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input type="tel" placeholder="07XXXXXXXXX" className="h-14 rounded-2xl pr-12 bg-slate-50 border-none text-left font-black" dir="ltr" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl pr-12 bg-slate-50 border-none" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
            <Button type="submit" className="w-full h-16 rounded-[24px] font-black text-lg gap-2 shadow-2xl mt-4 bg-primary" disabled={loading}>
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "دخول إلى النظام"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="pb-12 pt-6 flex flex-col gap-4 text-center">
          <p className="text-sm text-slate-500 font-bold">ليس لديك حساب؟ <Link href="/register" className="text-secondary font-black hover:underline">ابدأ مع دوبسار الآن</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}
