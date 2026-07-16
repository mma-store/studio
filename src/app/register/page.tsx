
"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDocs, collection, query, where, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { User, Phone, Lock, Loader2, Store, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const LOGO_URL = "https://up6.cc/2026/07/178308238964931.png";

  const [formData, setFormData] = useState({
    displayName: "",
    phoneNumber: "",
    password: "",
  });

  const cleanPhone = (p: string) => p.replace(/\s/g, '').replace(/^(\+964|0)/, '');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const purePhone = cleanPhone(formData.phoneNumber);
      const fakeEmail = `${purePhone}@platform.store`;

      // البحث عن رقم الهاتف في سجلات الموظفين المضافة مسبقاً
      const usersRef = collection(db, "users");
      const phoneQuery = query(usersRef, where("phoneNumber", "in", [purePhone, `0${purePhone}`]));
      const querySnapshot = await getDocs(phoneQuery);
      
      let assignedRole = 'retail_customer';
      let existingData: any = null;
      let existingDocId: string | null = null;
      let tenantId = 'MMA001';

      if (!querySnapshot.empty) {
        existingDocId = querySnapshot.docs[0].id;
        existingData = querySnapshot.docs[0].data();
        assignedRole = existingData.role;
        tenantId = existingData.tenantId || 'MMA001';
        await deleteDoc(doc(db, "users", existingDocId!));
      }

      // التحقق من أرقام المدير العام الماستر
      const MASTER_PHONES = ['7858833838', '07858833838', '7703687932', '07703687932'];
      if (MASTER_PHONES.includes(purePhone) || MASTER_PHONES.includes(`0${purePhone}`)) {
        assignedRole = 'super_admin';
        tenantId = 'PLATFORM_OWNER';
      }

      const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, formData.password);
      const user = userCredential.user;

      const finalUserData = {
        uid: user.uid,
        tenantId,
        displayName: formData.displayName || existingData?.displayName || "المدير العام",
        phoneNumber: `0${purePhone}`,
        email: fakeEmail,
        role: assignedRole,
        currentBalance: existingData?.currentBalance || 0,
        totalPaid: existingData?.totalPaid || 0,
        createdAt: Date.now(),
        lastLogin: Date.now()
      };

      await setDoc(doc(db, "users", user.uid), finalUserData);

      toast({ 
        title: "تم إنشاء الحساب", 
        description: assignedRole === 'super_admin' ? "مرحباً بك يا مدير المنصة." : "مرحباً بك في المنصة." 
      });

      if (assignedRole === 'super_admin') {
        router.push("/super-admin");
      } else if (['owner', 'admin'].includes(assignedRole)) {
        router.push("/admin");
      } else {
        router.push("/");
      }
      
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "خطأ في التسجيل", 
        description: error.code === 'auth/email-already-in-use' ? "رقم الهاتف مسجل مسبقاً." : "فشل إنشاء الحساب." 
      });
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
            <CardTitle className="text-3xl font-black text-foreground">إنشاء حساب جديد</CardTitle>
            <CardDescription className="font-medium text-muted-foreground">انضم إلى مجتمع الأعمال العراقي</CardDescription>
          </div>
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
               <ArrowRight className="h-5 w-5" />
            </div>
          </Link>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-muted-foreground/20"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-xs font-bold uppercase tracking-widest">أو كزبون</span>
            <div className="flex-grow border-t border-muted-foreground/20"></div>
          </div>

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
            <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg mt-4" disabled={loading}>
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
