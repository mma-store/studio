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
import { User, Phone, Lock, Loader2, ArrowRight } from "lucide-react";
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanPhone = formData.phoneNumber.replace(/\s/g, '');
      const fakeEmail = `${cleanPhone}@mma.store`;

      // 1. البحث عن رقم الهاتف في سجلات الموظفين المضافة مسبقاً
      const staffQuery = query(collection(db, "users"), where("phoneNumber", "==", cleanPhone));
      const staffSnapshot = await getDocs(staffQuery);
      
      let assignedRole = 'retail_customer'; // الدور الافتراضي
      
      // إذا وجدنا رقم الهاتف مسجل مسبقاً، نأخذ الدور الوظيفي المحدد له
      if (!staffSnapshot.empty) {
        const existingStaffDoc = staffSnapshot.docs[0];
        const staffData = existingStaffDoc.data();
        assignedRole = staffData.role;
        
        // إذا كان رقم الماستر أدمن
        if (cleanPhone === '07858833838') {
          assignedRole = 'admin';
        }

        // نقوم بحذف السجل المؤقت الذي أضافه الأدمن لنستبدله بالسجل الرسمي المرتبط بـ UID
        if (existingStaffDoc.id !== cleanPhone) { // تجنب حذف السجل إذا كان id هو نفسه الرقم
           await deleteDoc(doc(db, "users", existingStaffDoc.id));
        }
      } else if (cleanPhone === '07858833838') {
        assignedRole = 'admin';
      }

      // 2. إنشاء الحساب في Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, formData.password);
      const user = userCredential.user;

      // 3. حفظ بيانات المستخدم النهائية مع الدور الوظيفي الصحيح
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: formData.displayName,
        phoneNumber: cleanPhone,
        email: fakeEmail,
        role: assignedRole,
        createdAt: Date.now(),
        lastLogin: Date.now()
      });

      toast({ 
        title: "تم إنشاء الحساب بنجاح", 
        description: assignedRole === 'retail_customer' ? "مرحباً بك في عائلة مجمع محمد علاء." : `مرحباً بك زميلنا في الفريق بصلاحية: ${assignedRole}` 
      });

      // توجيه الموظفين للوحة الإدارة والزبائن للرئيسية
      const isAdminOrStaff = ['admin', 'sales_employee', 'workshop_technician', 'warehouse_employee'].includes(assignedRole);
      router.push(isAdminOrStaff ? "/admin" : "/");
      
    } catch (error: any) {
      console.error(error);
      toast({ 
        variant: "destructive", 
        title: "خطأ في التسجيل", 
        description: error.code === 'auth/phone-number-already-exists' ? "رقم الهاتف مسجل مسبقاً" : "فشل إنشاء الحساب، يرجى المحاولة مرة أخرى." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] p-4 relative overflow-hidden">
      <Card className="w-full max-w-md rounded-[40px] border-none shadow-2xl overflow-hidden bg-white">
        <CardHeader className="space-y-4 pt-12 pb-6 text-center">
          <div className="mx-auto relative h-24 w-56">
            <Image 
              src={LOGO_URL} 
              alt="مجمع محمد علاء" 
              fill 
              className="object-contain"
            />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black text-foreground">إنشاء حساب جديد</CardTitle>
            <CardDescription className="font-medium text-muted-foreground">انضم إلينا للحصول على أفضل خدمات الصيانة</CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold mr-1">الاسم الكامل</Label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="محمد علاء" 
                  className="h-14 rounded-2xl pr-12 bg-muted/20 border-none font-bold"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold mr-1">رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="tel" 
                  placeholder="07XXXXXXXXX" 
                  className="h-14 rounded-2xl pr-12 bg-muted/20 border-none text-left font-black"
                  dir="ltr"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
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
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-lg mt-4" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "إنشاء الحساب الآن"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="pb-10 pt-4 flex flex-col gap-4">
          <p className="text-center text-sm text-muted-foreground font-medium">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">تسجيل الدخول</Link>
          </p>
          <Button variant="ghost" className="rounded-full gap-2 text-xs font-bold" asChild>
             <Link href="/">تخطي والعودة للرئيسية <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </CardFooter>
      </Card>
      <div className="absolute -top-20 -left-20 h-64 w-64 bg-primary/10 rounded-full blur-[100px]" />
    </div>
  );
}
