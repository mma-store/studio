'use client';

import { useState } from "react";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Phone, ArrowLeft, ScrollText } from "lucide-react";
import Link from "next/link";
import { normalizePhoneNumber, getInternalEmail } from "@/lib/auth-utils";

/**
 * @fileOverview صفحة تسجيل الدخول الموحدة.
 * تعتمد على التوثيق فقط، وتترك حل الهوية للـ AdminLayout.
 */
export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    const rawPhoneInput = phoneNumber.trim();
    const trimmedPassword = password.trim();
    const purePhone = normalizePhoneNumber(rawPhoneInput);
    
    if (!purePhone || purePhone.length < 9) {
      toast({ variant: "destructive", title: "رقم هاتف غير صالح" });
      setLoading(false);
      return;
    }

    // تجربة كافة التنسيقات التاريخية للبريد الإلكتروني الداخلي (Resilient Login)
    const emailAttempts = [
      getInternalEmail(purePhone), 
      `${purePhone}@mma.store`,    
      `${purePhone}@platform.store`, 
      `0${purePhone}@dubsar.platform`
    ];

    let success = false;
    let lastError = "";

    try {
      for (const attemptEmail of emailAttempts) {
        try {
          await signInWithEmailAndPassword(auth, attemptEmail, trimmedPassword);
          success = true;
          break; 
        } catch (err: any) {
          lastError = err.code;
          if (err.code === 'auth/network-request-failed') throw err;
          continue;
        }
      }

      if (success) {
        toast({ title: "تم التوثيق بنجاح", description: "جاري التعرف على متجرك..." });
        // التحويل للـ Admin؛ سيقوم الـ Layout بحل الهوية المرجعية وتوجيه التاجر لمتجره
        router.push("/admin");
      } else {
        const msg = lastError === 'auth/wrong-password' ? "كلمة المرور غير صحيحة." : "رقم الهاتف غير مسجل أو البيانات خاطئة.";
        toast({ variant: "destructive", title: "فشل الدخول", description: msg });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في الاتصال", description: "يرجى التحقق من الإنترنت والمحاولة ثانية." });
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
        
        <CardContent className="px-10 pb-12">
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
      </Card>
    </div>
  );
}
