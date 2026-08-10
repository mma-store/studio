
"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Phone, HelpCircle, ArrowLeft, Mail, ScrollText } from "lucide-react";
import Link from "next/link";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";

const MASTER_RAW_PHONES = ['7858833838', '7703687932'];
const BOOTSTRAP_PASSWORD = '2004#223';

export default function LoginPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const cleanPhone = (p: string) => p.replace(/\s+/g, '').replace(/[-+]/g, '').replace(/^(\+964|00964|0)/, '');

  const handlePhonePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const purePhone = cleanPhone(phoneNumber);
    const fakeEmail = `${purePhone}@platform.store`;
    const isMasterPhone = MASTER_RAW_PHONES.includes(purePhone);

    try {
      // 1. محاولة تسجيل الدخول (Authentication Only)
      const userCredential = await signInWithEmailAndPassword(auth, fakeEmail, password);
      const user = userCredential.user;

      // 2. تحديد الوجهة فوراً بناءً على رقم الهاتف (Speed Optimization)
      if (isMasterPhone) {
        // تحديث الرتبة في الخلفية دون انتظار (Fire and Forget)
        const userRef = doc(db, "users", user.uid);
        setDoc(userRef, {
          uid: user.uid,
          role: 'super_admin',
          tenantId: 'PLATFORM_OWNER',
          phoneNumber: `0${purePhone}`,
          email: fakeEmail,
          displayName: "المدير العام",
          updatedAt: Date.now()
        }, { merge: true }).catch(() => {}); // تجاهل أخطاء الأذونات اللحظية هنا

        toast({ title: "مرحباً بك يا مدير دوبسار" });
        router.push("/super-admin");
        return;
      }

      // للمستخدمين العاديين، نحاول جلب الملف الشخصي بسرعة للتوجيه الصحيح
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        if (userData && ['owner', 'admin', 'sales_employee', 'workshop_technician', 'warehouse_employee'].includes(userData.role)) {
          updateDoc(userRef, { lastLogin: Date.now() }).catch(() => {});
          toast({ title: "تم تسجيل الدخول للوحة الإدارة" });
          router.push("/admin");
        } else {
          toast({ title: "تم تسجيل الدخول بنجاح" });
          router.push("/");
        }
      } catch (firestoreErr) {
        // في حال فشل Firestore بسبب الأذونات اللحظية، نعتمد على الحالة الافتراضية
        console.warn("Firestore sync delayed, redirecting to home.");
        router.push("/");
      }
      
    } catch (error: any) {
      console.error("Login Auth Error:", error.code);

      if (isMasterPhone && password === BOOTSTRAP_PASSWORD && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
        toast({ title: "جاري تهيئة حساب المدير العام لأول مرة..." });
        router.push("/onboarding");
        return;
      }

      let message = "تأكد من رقم الهاتف وكلمة المرور.";
      if (error.code === 'auth/wrong-password') message = "كلمة المرور غير صحيحة.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') message = "بيانات الدخول غير صحيحة.";
      if (error.code === 'auth/too-many-requests') message = "محاولات كثيرة خاطئة. تم قفل الحساب مؤقتاً.";

      toast({ variant: "destructive", title: "فشل الدخول", description: message });
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({ title: "تم إرسال الرابط", description: "يرجى التحقق من بريدك الإلكتروني." });
      setIsResetOpen(false);
    } catch (e: any) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إرسال رابط الاستعادة." });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      
      <Card className="w-full max-w-md rounded-[48px] border-none shadow-[0_40px_100px_rgba(26,54,93,0.1)] overflow-hidden bg-white relative z-10">
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
             <div className="flex flex-col">
                <span className="text-3xl font-black text-primary tracking-tighter">دوبسار DUBSAR</span>
                <span className="text-[10px] font-black text-secondary uppercase tracking-[0.4em] opacity-80 leading-none">Business Portal</span>
             </div>
          </div>
          <CardDescription className="font-medium text-slate-500">سجل دخولك لإدارة تجارتك سحابياً</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-10">
          <Tabs defaultValue="phone" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-14 rounded-2xl bg-slate-50 mb-8 p-1.5">
              <TabsTrigger value="phone" className="rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:text-primary">رقم الهاتف</TabsTrigger>
              <TabsTrigger value="email" className="rounded-xl font-black text-sm data-[state=active]:bg-white data-[state=active]:text-primary">البريد</TabsTrigger>
            </TabsList>

            <TabsContent value="phone" className="space-y-4">
              <form onSubmit={handlePhonePasswordLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400">رقم الهاتف</Label>
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <Input type="tel" placeholder="07XXXXXXXXX" className="h-14 rounded-2xl pr-12 bg-slate-50 border-none text-left font-black" dir="ltr" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-400">كلمة المرور</Label>
                    <button type="button" onClick={() => setIsResetOpen(true)} className="text-[10px] font-black text-secondary hover:underline flex items-center gap-1">
                      <HelpCircle className="h-3 w-3" /> نسيت؟
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                    <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl pr-12 bg-slate-50 border-none" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full h-16 rounded-[24px] font-black text-lg gap-2 shadow-2xl mt-4 bg-primary" disabled={loading}>
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "دخول إلى النظام"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleEmailLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400">البريد الإلكتروني</Label>
                  <Input type="email" placeholder="user@example.com" className="h-14 rounded-2xl px-6 bg-slate-50 border-none" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label className="font-black text-xs uppercase tracking-widest text-slate-400">كلمة المرور</Label>
                    <button type="button" onClick={() => setIsResetOpen(true)} className="text-[10px] font-black text-secondary hover:underline flex items-center gap-1">
                      <HelpCircle className="h-3 w-3" /> نسيت؟
                    </button>
                  </div>
                  <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl px-6 bg-slate-50 border-none" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full h-16 rounded-[24px] font-black text-lg shadow-2xl mt-4 bg-primary" disabled={loading}>
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "دخول"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="pb-12 pt-6 flex flex-col gap-4 text-center">
          <p className="text-sm text-slate-500 font-bold">ليس لديك حساب؟ <Link href="/onboarding" className="text-secondary font-black hover:underline">ابدأ مع دوبسار الآن</Link></p>
        </CardFooter>
      </Card>

      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="rounded-[32px] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">استعادة كلمة المرور</DialogTitle>
            <DialogDescription className="text-xs font-bold">أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-6 pt-4">
             <div className="space-y-2">
                <Label className="font-bold">البريد الإلكتروني</Label>
                <div className="relative">
                   <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                   <Input 
                    required 
                    type="email" 
                    placeholder="example@mail.com" 
                    className="h-14 rounded-2xl pr-12 bg-muted/20 border-none font-bold" 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                   />
                </div>
             </div>
             <Button disabled={resetLoading} type="submit" className="w-full h-14 rounded-2xl font-black text-lg gap-2">
                {resetLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />} إرسال الرابط
             </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
