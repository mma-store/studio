
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, User, ScrollText, WifiOff, Monitor } from "lucide-react";
import Link from "next/link";
import { LocalAuthService } from "@/services/local-auth-service";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [isLocalMode, setIsLocalMode] = useState(true);

  useEffect(() => {
    // التأكد من وجود مستخدم أدمن عند أول تشغيل
    LocalAuthService.ensureOwnerExists();
  }, []);

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await LocalAuthService.login(username, pin);
      if (user) {
        // حفظ الجلسة محلياً (يمكن استخدام Context أو localStorage للتطبيق التجريبي)
        localStorage.setItem('dubsar_session', JSON.stringify(user));
        toast({ title: "تم الدخول بنجاح", description: `مرحباً ${user.displayName}` });
        router.push("/admin");
      } else {
        toast({ variant: "destructive", title: "بيانات خاطئة", description: "اسم المستخدم أو الـ PIN غير صحيح." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في النظام المحلي" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] p-4 relative overflow-hidden" dir="rtl">
      <Card className="w-full max-w-md rounded-[48px] border-none shadow-2xl overflow-hidden bg-white relative z-10">
        <CardHeader className="space-y-4 pt-12 pb-6 text-center">
          <div className="mx-auto flex flex-col items-center gap-2">
             <div className="h-16 w-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-xl">
                <ScrollText className="h-10 w-10" />
             </div>
             <span className="text-3xl font-black text-primary tracking-tighter">دوبسار DUBSAR 2.0</span>
          </div>
          <CardDescription className="font-bold flex items-center justify-center gap-2 text-emerald-600">
             <Monitor className="h-4 w-4" /> نظام الإدارة المكتبي المحلي
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-10 pb-12">
          <form onSubmit={handleLocalLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400 text-right block">اسم المستخدم</Label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input 
                  placeholder="admin" 
                  className="h-14 rounded-2xl pr-12 bg-slate-50 border-none font-black" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-black text-xs mr-2 uppercase tracking-widest text-slate-400 text-right block">رمز الدخول (PIN)</Label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                <Input 
                  type="password" 
                  placeholder="••••" 
                  className="h-14 rounded-2xl pr-12 bg-slate-50 border-none font-black text-center tracking-[1em]" 
                  value={pin} 
                  onChange={(e) => setPin(e.target.value)} 
                  required 
                  maxLength={8}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-16 rounded-[24px] font-black text-lg gap-2 shadow-2xl mt-4 bg-primary" 
              disabled={loading}
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "دخول للنظام (Offline)"}
            </Button>
            
            <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
               <WifiOff className="h-3 w-3" />
               <span>لا يتطلب اتصالاً بالإنترنت</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
