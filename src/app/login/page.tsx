
"use client";

import { useState } from "react";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Chrome, Mail, Lock, Loader2, ArrowRight, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const LOGO_URL = "https://up6.cc/2026/07/178308238964931.png";
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // نفس دالة التطهير لضمان المطابقة
  const cleanPhoneForAuth = (p: string) => p.replace(/\s/g, '').replace(/^(\+964|0)/, '');

  const handlePhonePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const purePhone = cleanPhoneForAuth(phoneNumber);
      const fakeEmail = `${purePhone}@mma.store`;
      
      await signInWithEmailAndPassword(auth, fakeEmail, password);
      toast({ title: "تم تسجيل الدخول", description: "مرحباً بك مجدداً في مجمع محمد علاء." });
      
      // التوجه بناءً على الرقم (إذا كان الأدمن)
      if (purePhone === '7858833838') {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "خطأ في الدخول", 
        description: "رقم الهاتف أو كلمة المرور غير صحيحة." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: "البريد أو كلمة المرور غير صحيحة." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] p-4 relative overflow-hidden">
      <Card className="w-full max-w-md rounded-[40px] border-none shadow-2xl overflow-hidden bg-white">
        <CardHeader className="space-y-4 pt-12 pb-6 text-center">
          <div className="mx-auto relative h-24 w-56">
            <Image src={LOGO_URL} alt="MMA" fill className="object-contain" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black">مجمع محمد علاء</CardTitle>
            <CardDescription className="font-medium">سجل دخولك للوصول إلى خدماتنا</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 px-8">
          <Tabs defaultValue="phone" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-muted/30 mb-6 p-1">
              <TabsTrigger value="phone" className="rounded-lg font-bold">رقم الهاتف</TabsTrigger>
              <TabsTrigger value="email" className="rounded-lg font-bold">البريد</TabsTrigger>
            </TabsList>

            <TabsContent value="phone" className="space-y-4">
              <form onSubmit={handlePhonePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold mr-1">رقم الهاتف</Label>
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input type="tel" placeholder="07XXXXXXXXX" className="h-14 rounded-2xl pr-12 bg-muted/20 border-none text-left font-black" dir="ltr" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold mr-1">كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl pr-12 bg-muted/20 border-none" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg mt-2" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "تسجيل الدخول"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold mr-1">البريد الإلكتروني</Label>
                  <Input type="email" placeholder="admin@mma.com" className="h-14 rounded-2xl px-6 bg-muted/20 border-none" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold mr-1">كلمة المرور</Label>
                  <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl px-6 bg-muted/20 border-none" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-lg mt-2" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "دخول"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="pb-10 pt-4 flex flex-col gap-4 text-center">
          <p className="text-sm text-muted-foreground font-medium">ليس لديك حساب؟ <Link href="/register" className="text-primary font-bold hover:underline">إنشاء حساب جديد</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}
