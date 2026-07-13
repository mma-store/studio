
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
import { Loader2, Lock, Phone, Mail, HelpCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const LOGO_URL = "https://up6.cc/2026/07/178308238964931.png";
  const MASTER_ADMIN_PHONE = "07858833838";
  
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
      const userCredential = await signInWithEmailAndPassword(auth, fakeEmail, password);
      const user = userCredential.user;
      
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userData = userSnap.data();

      toast({ title: "تم تسجيل الدخول", description: "مرحباً بك مجدداً." });
      
      const isMasterAdmin = ['7858833838', '07858833838'].includes(purePhone);
      
      if (isMasterAdmin || userData?.role === 'super_admin') {
        router.push("/super-admin");
      } else if (userData?.role && !['retail_customer', 'wholesale_customer'].includes(userData.role)) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("phoneNumber", "in", [purePhone, `0${purePhone}`]));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            if (userData.tempPassword === password) {
              toast({ title: "تفعيل الحساب...", description: "جاري إنشاء حسابك الرسمي للمرة الأولى." });
              
              const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, password);
              const newUser = userCredential.user;

              await setDoc(doc(db, "users", newUser.uid), {
                ...userData,
                uid: newUser.uid,
                email: fakeEmail,
                lastLogin: Date.now(),
                tempPassword: null
              });

              toast({ title: "تم التفعيل بنجاح" });
              
              if (['7858833838', '07858833838'].includes(purePhone)) {
                router.push("/super-admin");
              } else {
                router.push("/admin");
              }
              return;
            }
          }
        } catch (innerError) {
          console.error("Auto-provisioning failed:", innerError);
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
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] p-4 relative overflow-hidden">
      <Card className="w-full max-w-md rounded-[40px] border-none shadow-2xl overflow-hidden bg-white">
        <CardHeader className="space-y-4 pt-12 pb-6 text-center">
          <div className="mx-auto relative h-28 w-64">
            <Image src={LOGO_URL} alt="Platform" fill className="object-contain" priority />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black">بوابة الأعمال</CardTitle>
            <CardDescription className="font-medium">سجل دخولك لإدارة المنصة أو متجرك</CardDescription>
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
                  <div className="flex justify-between items-center px-1">
                    <Label className="font-bold">كلمة المرور</Label>
                    <a 
                      href={`https://wa.me/9647858833838?text=${encodeURIComponent('أهلاً مدير المنصة، نسيت كلمة المرور الخاصة بحسابي.')}`}
                      target="_blank"
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <HelpCircle className="h-3 w-3" /> نسيت كلمة المرور؟
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl pr-12 bg-muted/20 border-none" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg mt-2" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "دخول إلى النظام"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold mr-1">البريد الإلكتروني</Label>
                  <Input type="email" placeholder="user@example.com" className="h-14 rounded-2xl px-6 bg-muted/20 border-none" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
          <p className="text-sm text-muted-foreground font-medium">ليس لديك متجر بعد؟ <Link href="/onboarding" className="text-primary font-bold hover:underline">أنشئ متجرك الآن</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}
