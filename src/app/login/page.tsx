
"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Phone, HelpCircle, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const MASTER_PHONES = ['7858833838', '07858833838', '7703687932', '07703687932'];

export default function LoginPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const LOGO_URL = "https://up6.cc/2026/07/178308238964931.png";
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const cleanPhone = (p: string) => p.replace(/\s/g, '').replace(/^(\+964|0)/, '');

  const handlePhonePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const purePhone = cleanPhone(phoneNumber);
    const fakeEmail = `${purePhone}@platform.store`;

    try {
      // محاولة تسجيل الدخول العادي
      const userCredential = await signInWithEmailAndPassword(auth, fakeEmail, password);
      const user = userCredential.user;
      
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userData = userSnap.data();

      toast({ title: "تم تسجيل الدخول", description: "مرحباً بك مجدداً." });
      
      const isMasterAdmin = MASTER_PHONES.includes(purePhone) || MASTER_PHONES.includes(`0${purePhone}`);
      
      if (isMasterAdmin || userData?.role === 'super_admin') {
        router.push("/super-admin");
      } else if (userData?.role && !['retail_customer', 'wholesale_customer'].includes(userData.role)) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      // منطق التفعيل التلقائي للمدراء الجدد أو عند نسيان كلمة المرور لمطابقة الـ tempPassword
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        const isMaster = MASTER_PHONES.includes(purePhone) || MASTER_PHONES.includes(`0${purePhone}`);
        
        // إذا كان الرقم هو رقم الماستر الجديد، نسمح له بإنشاء الحساب بكلمة السر الجديدة
        if (isMaster && password === '2004#223') {
            try {
                toast({ title: "تحديث حساب المدير...", description: "جاري تهيئة صلاحيات الوصول العليا." });
                
                // نحاول إنشاء حساب جديد إذا لم يكن موجوداً، أو تحديثه
                let user;
                try {
                    const res = await createUserWithEmailAndPassword(auth, fakeEmail, password);
                    user = res.user;
                } catch (createErr: any) {
                    // إذا كان الحساب موجوداً أصلاً في Auth ولكن كلمة المرور غير صحيحة، هنا تكمن مشكلة أمنية في المتصفح 
                    // لذا نفترض أن المستخدم يريد الدخول بالرقم والماستر باسوورد
                    throw new Error("يرجى استخدام رابط استعادة كلمة المرور إذا كنت قد سجلت مسبقاً.");
                }

                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    tenantId: 'PLATFORM_OWNER',
                    displayName: "المدير العام",
                    phoneNumber: `0${purePhone}`,
                    email: fakeEmail,
                    role: 'super_admin',
                    lastLogin: Date.now(),
                    createdAt: Date.now()
                }, { merge: true });

                toast({ title: "تم التفعيل بنجاح" });
                router.push("/super-admin");
                return;
            } catch (innerErr: any) {
                toast({ variant: "destructive", title: "خطأ", description: innerErr.message });
            }
        }
      }
      
      toast({ 
        variant: "destructive", 
        title: "خطأ في الدخول", 
        description: "تأكد من رقم الهاتف وكلمة المرور." 
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      
      <Card className="w-full max-w-md rounded-[48px] border-none shadow-[0_40px_100px_rgba(10,25,47,0.1)] overflow-hidden bg-white relative z-10">
        <div className="p-8 pt-10">
           <Link href="/">
              <Button variant="ghost" size="sm" className="rounded-full gap-2 font-bold mb-6">
                 <ArrowLeft className="h-4 w-4 rotate-180" /> العودة للمنصة
              </Button>
           </Link>
        </div>

        <CardHeader className="space-y-4 pt-0 pb-6 text-center">
          <div className="mx-auto relative h-20 w-44">
            <Image src={LOGO_URL} alt="Platform" fill className="object-contain" priority />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black text-primary">بوابة الأعمال</CardTitle>
            <CardDescription className="font-medium text-slate-500">سجل دخولك لإدارة نظامك السحابي</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 px-10">
          <Tabs defaultValue="phone" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-14 rounded-2xl bg-slate-50 mb-8 p-1.5">
              <TabsTrigger value="phone" className="rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">رقم الهاتف</TabsTrigger>
              <TabsTrigger value="email" className="rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">البريد</TabsTrigger>
            </TabsList>

            <TabsContent value="phone" className="space-y-4">
              <form onSubmit={handlePhonePasswordLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400">رقم الهاتف</Label>
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <Input type="tel" placeholder="07XXXXXXXXX" className="h-14 rounded-2xl pr-12 bg-slate-50 border-none text-left font-black focus-visible:ring-primary/20" dir="ltr" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-400">كلمة المرور</Label>
                    <a 
                      href={`https://wa.me/9647858833838?text=${encodeURIComponent('أهلاً مدير المنصة، نسيت كلمة المرور الخاصة بحسابي.')}`}
                      target="_blank"
                      className="text-[10px] font-black text-secondary hover:underline flex items-center gap-1"
                    >
                      <HelpCircle className="h-3 w-3" /> نسيت كلمة المرور؟
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl pr-12 bg-slate-50 border-none focus-visible:ring-primary/20" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full h-16 rounded-[24px] font-black text-lg gap-2 shadow-2xl shadow-primary/20 mt-4 bg-primary hover:bg-primary/90 transition-all active:scale-95" disabled={loading}>
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "دخول إلى النظام"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleEmailLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400">البريد الإلكتروني</Label>
                  <Input type="email" placeholder="user@example.com" className="h-14 rounded-2xl px-6 bg-slate-50 border-none focus-visible:ring-primary/20" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400">كلمة المرور</Label>
                  <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl px-6 bg-slate-50 border-none focus-visible:ring-primary/20" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full h-16 rounded-[24px] font-black text-lg shadow-2xl shadow-primary/20 mt-4 bg-primary hover:bg-primary/90" disabled={loading}>
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "دخول"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="pb-12 pt-6 flex flex-col gap-4 text-center">
          <p className="text-sm text-slate-500 font-bold">ليس لديك متجر بعد؟ <Link href="/onboarding" className="text-secondary font-black hover:underline">أنشئ متجرك الآن</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}
