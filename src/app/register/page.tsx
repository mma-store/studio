
"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { User, Phone, Lock, Loader2, Store, ArrowRight, ScrollText } from "lucide-react";
import Link from "next/link";
import { normalizePhoneNumber, getInternalEmail } from "@/lib/auth-utils";

export default function RegisterPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    phoneNumber: "",
    password: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const trimmedPhone = formData.phoneNumber.trim();
      const purePhone = normalizePhoneNumber(trimmedPhone);
      
      if (!purePhone || purePhone.length < 9) {
        toast({ variant: "destructive", title: "رقم هاتف غير صالح" });
        setLoading(false);
        return;
      }

      const email = getInternalEmail(purePhone);

      const userCredential = await createUserWithEmailAndPassword(auth, email, formData.password.trim());
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        tenantId: 'GUEST',
        displayName: formData.displayName.trim(),
        phoneNumber: `0${purePhone}`,
        email,
        role: 'retail_customer',
        createdAt: Date.now()
      });

      toast({ title: "تم إنشاء الحساب بنجاح" });
      router.push("/");
      
    } catch (error: any) {
      let message = "فشل إنشاء الحساب.";
      if (error.code === 'auth/email-already-in-use') {
        message = "رقم الهاتف مسجل مسبقاً.";
      } else if (error.code === 'auth/weak-password') {
        message = "كلمة المرور ضعيفة جداً.";
      }
      
      toast({ 
        variant: "destructive", 
        title: "خطأ في التسجيل", 
        description: message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] p-4 relative overflow-hidden">
      <Card className="w-full max-w-md rounded-[40px] border-none shadow-2xl overflow-hidden bg-white">
        <CardHeader className="space-y-4 pt-12 pb-6 text-center">
          <div className="mx-auto flex flex-col items-center gap-2">
             <div className="h-16 w-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-xl">
                <ScrollText className="h-10 w-10" />
             </div>
             <CardTitle className="text-3xl font-black text-primary tracking-tighter">إنشاء حساب جديد</CardTitle>
          </div>
          <CardDescription className="font-medium text-muted-foreground">انضم إلى مجتمع دوبسار العراقي</CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 space-y-6">
          <Link href="/onboarding">
            <div className="p-4 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 flex items-center justify-between group hover:scale-[1.02] transition-transform">
               <div className="flex items-center gap-3">
                  <Store className="h-6 w-6" />
                  <div className="text-right">
                    <p className="font-black text-sm">أنا صاحب عمل</p>
                    <p className="text-[10px] opacity-80">أريد إنشاء متجر وإدارة مبيعاتي</p>
                  </div>
               </div>
               <ArrowRight className="h-5 w-5 rotate-180" />
            </div>
          </Link>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold mr-1">الاسم الكامل</Label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="الاسم الكامل" className="h-14 rounded-2xl pr-12 bg-muted/20 border-none font-bold" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold mr-1">رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="tel" placeholder="07XXXXXXXXX" className="h-14 rounded-2xl pr-12 bg-muted/20 border-none text-left font-black" dir="ltr" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold mr-1">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl pr-12 bg-muted/20 border-none" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              </div>
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg mt-4 bg-primary" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "إنشاء الحساب"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="pb-10 pt-4 flex flex-col gap-4 text-center">
          <p className="text-sm text-muted-foreground font-medium">لديك حساب بالفعل؟ <Link href="/login" className="text-primary font-bold hover:underline">تسجيل الدخول</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}
