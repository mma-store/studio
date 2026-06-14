
'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Chrome, Mail, Lock, Loader2, ArrowRight, Phone, KeyRound } from "lucide-react";
import Link from "next/link";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: ConfirmationResult;
  }
}

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Email Auth State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showOtpInput, setShowOtpOtpInput] = useState(false);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  }, [auth]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "تم تسجيل الدخول", description: "مرحباً بك مجدداً." });
      router.push("/");
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "خطأ في الدخول", 
        description: "تأكد من صحة البيانات." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+964${phoneNumber.replace(/^0/, '')}`;
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      window.confirmationResult = confirmationResult;
      setShowOtpOtpInput(true);
      toast({ title: "تم إرسال الكود", description: "يرجى إدخال الرمز المرسل لهاتفك." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل إرسال كود التحقق." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await window.confirmationResult.confirm(verificationCode);
      toast({ title: "تم تسجيل الدخول", description: "مرحباً بك مجدداً." });
      router.push("/");
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "كود التحقق غير صحيح." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تسجيل الدخول عبر جوجل." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] p-4 relative overflow-hidden">
      <div id="recaptcha-container"></div>
      
      <Card className="w-full max-w-md rounded-[40px] border-none shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 bg-white">
        <CardHeader className="space-y-4 pt-10 pb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg rotate-3">
            <span className="text-3xl font-black italic">M</span>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black">مرحباً بك</CardTitle>
            <CardDescription className="font-medium">سجل دخولك للوصول إلى كافة خدماتنا</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 px-8">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-muted/30 mb-6 p-1">
              <TabsTrigger value="email" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">البريد الإلكتروني</TabsTrigger>
              <TabsTrigger value="phone" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">رقم الهاتف</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold mr-1">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      type="email" 
                      placeholder="name@example.com" 
                      className="h-14 rounded-2xl pr-12 bg-muted/20 border-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold mr-1">كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="h-14 rounded-2xl pr-12 bg-muted/20 border-none"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "دخول"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
              {!showOtpInput ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold mr-1">رقم الهاتف</Label>
                    <div className="relative">
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        type="tel" 
                        placeholder="07XXXXXXXXX" 
                        className="h-14 rounded-2xl pr-12 bg-muted/20 border-none text-left"
                        dir="ltr"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg" disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "إرسال كود التحقق"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold mr-1">رمز التحقق (OTP)</Label>
                    <div className="relative">
                      <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        type="text" 
                        placeholder="000000" 
                        className="h-14 rounded-2xl pr-12 bg-muted/20 border-none text-center tracking-[1em] font-black"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg" disabled={loading}>
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "تأكيد الكود والدخول"}
                  </Button>
                  <Button variant="link" className="w-full" onClick={() => setShowOtpOtpInput(false)}>تغيير رقم الهاتف</Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-muted-foreground font-bold">أو تابع عبر</span></div>
          </div>

          <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-black gap-3" onClick={handleGoogleLogin}>
            <Chrome className="h-5 w-5 text-red-500" />
            الدخول عبر جوجل
          </Button>
        </CardContent>
        
        <CardFooter className="pb-10 pt-4 flex flex-col gap-4">
          <p className="text-center text-sm text-muted-foreground font-medium">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">إنشاء حساب جديد</Link>
          </p>
          <Button variant="ghost" className="rounded-full gap-2 text-xs font-bold" asChild>
             <Link href="/">تخطي والعودة للرئيسية <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
