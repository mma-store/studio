
'use client';

import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  MapPin, 
  Heart, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  Moon, 
  Sun,
  ShieldCheck,
  Headphones,
  Lock,
  Camera,
  LayoutDashboard,
  Loader2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, profile, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: url
      });
      toast({ title: "تم التحديث", description: "تم تغيير صورة الملف الشخصي بنجاح." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل رفع الصورة." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const MENU_ITEMS = [
    { label: "المعلومات الشخصية", icon: User, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "عناوين التوصيل", icon: MapPin, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
    { label: "تغيير كلمة المرور", icon: Lock, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
    { label: "قائمة المفضلة", icon: Heart, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10" },
    { label: "الأمان والخصوصية", icon: ShieldCheck, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
    { label: "مركز المساعدة", icon: Headphones, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
  ];

  if (loading) return (
    <div className="flex min-h-screen bg-[#FDF8F5] dark:bg-background">
      <main className="flex-1 pb-24">
        <Header />
        <div className="container p-6 space-y-8 flex flex-col items-center">
           <Skeleton className="h-28 w-28 rounded-full" />
           <Skeleton className="h-8 w-48" />
           <Skeleton className="h-4 w-32" />
           <div className="w-full space-y-4 pt-10">
              <Skeleton className="h-16 w-full rounded-3xl" />
              <Skeleton className="h-64 w-full rounded-3xl" />
           </div>
        </div>
      </main>
    </div>
  );

  if (!user) {
    return (
      <div className="flex min-h-screen bg-[#FDF8F5] dark:bg-background">
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6">
           <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-primary" />
           </div>
           <h2 className="text-2xl font-black text-foreground">أهلاً بك في مجمع محمد علاء</h2>
           <p className="text-muted-foreground font-medium text-balance">يرجى تسجيل الدخول للوصول إلى كافة المميزات والطلبات الخاصة بك.</p>
           <Link href="/login" className="w-full">
              <Button className="w-full h-14 rounded-full text-lg font-black shadow-lg shadow-primary/20">تسجيل الدخول</Button>
           </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  const isAdminOrStaff = profile && ['admin', 'sales_employee', 'workshop_technician', 'warehouse_employee'].includes(profile.role);

  return (
    <div className="flex min-h-screen bg-[#FDF8F5] dark:bg-background transition-colors duration-300">
      <main className="flex-1 pb-24">
        <Header />
        
        <div className="container p-6 space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-4 pt-4">
             <div className="relative group">
                <Avatar className="h-28 w-28 border-4 border-white dark:border-slate-800 shadow-xl">
                  <AvatarImage src={profile?.photoURL || user?.photoURL || ""} />
                  <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">
                    {profile?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-1 right-1 h-8 w-8 bg-primary rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                   {isUploading ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Camera className="h-4 w-4 text-white" />}
                   <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploading} />
                </label>
             </div>
             <div className="text-center">
                <h2 className="text-2xl font-black text-foreground">{profile?.displayName || "مستخدم جديد"}</h2>
                <p className="text-sm text-muted-foreground font-medium">{user.email}</p>
                <div className="mt-2">
                   <Badge variant="outline" className="rounded-full bg-primary/5 border-primary/20 text-primary px-4 font-bold">
                      {profile?.role === 'wholesale_customer' ? 'عميل جملة' : 
                       profile?.role === 'admin' ? 'مدير النظام' : 
                       profile?.role === 'workshop_technician' ? 'فني ورشة' : 'عميل مفرد'}
                   </Badge>
                </div>
             </div>
          </div>

          {isAdminOrStaff && (
             <Link href="/admin">
                <div className="bg-primary p-5 rounded-[28px] shadow-lg shadow-primary/20 flex items-center justify-between text-white group overflow-hidden relative">
                   <div className="relative z-10 flex items-center gap-4">
                      <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                         <LayoutDashboard className="h-6 w-6" />
                      </div>
                      <div>
                         <p className="font-black text-lg">لوحة الإدارة</p>
                         <p className="text-xs text-white/80">الدخول إلى نظام الإدارة والتقارير</p>
                      </div>
                   </div>
                   <ChevronLeft className="h-6 w-6 relative z-10 transition-transform group-hover:-translate-x-1" />
                   <div className="absolute -right-5 -bottom-5 h-24 w-24 bg-white/10 rounded-full blur-xl" />
                </div>
             </Link>
          )}

          <div className="bg-white dark:bg-card p-4 rounded-[28px] shadow-sm flex items-center justify-between border">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600">
                   {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </div>
                <span className="font-bold text-foreground">الوضع الليلي</span>
             </div>
             <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
          </div>

          <div className="bg-white dark:bg-card overflow-hidden rounded-[32px] shadow-sm border">
             {MENU_ITEMS.map((item, idx) => (
               <button 
                key={idx} 
                onClick={() => toast({ title: "قريباً", description: `ميزة ${item.label} ستتوفر في التحديث القادم.` })}
                className={`w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors ${idx !== MENU_ITEMS.length - 1 ? 'border-b border-muted/50 dark:border-border' : ''}`}
               >
                  <div className="flex items-center gap-4">
                     <div className={`h-10 w-10 flex items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
                        <item.icon className="h-5 w-5" />
                     </div>
                     <span className="font-bold text-sm text-foreground">{item.label}</span>
                  </div>
                  <ChevronLeft className="h-5 w-5 text-muted-foreground" />
               </button>
             ))}
          </div>

          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full h-14 rounded-full text-destructive font-black gap-2 hover:bg-destructive/5 hover:text-destructive transition-all"
          >
             <LogOut className="h-5 w-5" />
             تسجيل الخروج
          </Button>
          
          <div className="text-center pt-16 pb-8 opacity-60" dir="ltr">
             <div className="flex justify-center mb-4">
                <div className="h-8 w-14 bg-muted rounded-xl flex items-center justify-center font-black italic tracking-tighter text-muted-foreground text-xs">MMA</div>
             </div>
             <p className="text-[9px] text-muted-foreground font-black tracking-[0.4em] uppercase mb-1">System v2.1</p>
             <p className="text-[11px] font-bold text-muted-foreground">
                Developed by <span className="text-primary">Hussein Salah</span>
             </p>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
