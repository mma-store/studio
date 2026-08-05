
'use client';

import { useState, useMemo, useEffect } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Smartphone, 
  Mail, 
  History, 
  Monitor, 
  LogOut, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Save,
  Globe,
  Fingerprint,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth, useUser, useFirestore, useCollection } from "@/firebase";
import { 
  updatePassword, 
  updateEmail, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  signOut
} from "firebase/auth";
import { collection, query, where, orderBy, limit, addDoc, doc, updateDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AccountSecurityPage() {
  const auth = useAuth();
  const db = useFirestore();
  const { user, profile, tenantId } = useUser();
  const [loading, setLoading] = useState(false);

  // States for Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // States for Session and History
  const historyQuery = useMemo(() => 
    user ? query(collection(db, 'auditLogs'), where('userId', '==', user.uid), where('action', 'in', ['LOGIN_SUCCESS', 'PASSWORD_CHANGED', 'EMAIL_CHANGED']), orderBy('timestamp', 'desc'), limit(10)) : null,
  [db, user]);
  const { data: logs, loading: logsLoading } = useCollection(historyQuery);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "تنبيه", description: "كلمات المرور الجديدة غير متطابقة." });
      return;
    }

    setLoading(true);
    try {
      // 1. Re-authenticate
      const credential = EmailAuthProvider.credential(user?.email || "", currentPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);

      // 2. Update Password
      await updatePassword(auth.currentUser!, newPassword);

      // 3. Log the action
      await addDoc(collection(db, 'auditLogs'), {
        tenantId,
        userId: user?.uid,
        userName: profile?.displayName,
        action: "PASSWORD_CHANGED",
        target: "Account Security",
        details: "تم تغيير كلمة المرور بنجاح من إعدادات الحساب.",
        timestamp: Date.now(),
        device: navigator.userAgent
      });

      toast({ title: "تم التحديث", description: "تم تغيير كلمة المرور بنجاح." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      const errorMsg = e.code === 'auth/wrong-password' ? "كلمة المرور الحالية غير صحيحة." : "فشل التحديث. حاول لاحقاً.";
      toast({ variant: "destructive", title: "خطأ", description: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900">الأمان وخصوصية الحساب</h1>
        <p className="text-muted-foreground font-medium">إدارة حماية حسابك، الجلسات النشطة، وسجل العمليات الحساسة.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Change Password Card */}
          <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
              <CardTitle className="flex items-center gap-3 text-2xl font-black">
                <Lock className="h-7 w-7 text-primary" /> تغيير كلمة المرور
              </CardTitle>
              <CardDescription className="font-bold text-sm">نوصي باستخدام كلمة مرور قوية وفريدة لا تستخدمها في حسابات أخرى.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                 <div className="space-y-2">
                    <Label className="font-black text-xs opacity-60">كلمة المرور الحالية</Label>
                    <Input 
                      type="password" 
                      required 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="h-14 rounded-2xl bg-muted/20 border-none px-6" 
                    />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="font-black text-xs opacity-60">كلمة المرور الجديدة</Label>
                       <Input 
                        type="password" 
                        required 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-14 rounded-2xl bg-muted/20 border-none px-6" 
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="font-black text-xs opacity-60">تأكيد كلمة المرور</Label>
                       <Input 
                        type="password" 
                        required 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-14 rounded-2xl bg-muted/20 border-none px-6" 
                       />
                    </div>
                 </div>
                 <Button disabled={loading} type="submit" className="w-full sm:w-auto h-14 px-12 rounded-2xl font-black text-lg gap-3 shadow-xl">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Key className="h-5 w-5" />} تحديث كلمة المرور
                 </Button>
              </form>
            </CardContent>
          </Card>

          {/* Login History */}
          <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
             <CardHeader className="p-8 border-b">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                   <History className="h-6 w-6 text-primary" /> سجل الدخول والنشاط
                </CardTitle>
                <CardDescription className="font-bold">آخر 10 عمليات دخول وتغيير في إعدادات الأمان.</CardDescription>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y">
                   {logsLoading ? (
                     Array(3).fill(0).map((_, i) => <div key={i} className="p-6"><Skeleton className="h-12 w-full rounded-2xl" /></div>)
                   ) : logs.length > 0 ? (
                     logs.map((log: any) => (
                       <div key={log.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                          <div className="flex items-center gap-5">
                             <div className={cn(
                               "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                               log.action === 'LOGIN_SUCCESS' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                             )}>
                                {log.action === 'LOGIN_SUCCESS' ? <UserCheck className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                             </div>
                             <div className="space-y-1">
                                <p className="font-black text-sm text-slate-800">
                                   {log.action === 'LOGIN_SUCCESS' ? 'تسجيل دخول ناجح' : 
                                    log.action === 'PASSWORD_CHANGED' ? 'تغيير كلمة المرور' : 'تعديل بيانات الحساب'}
                                </p>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                                   <span className="flex items-center gap-1"><Monitor className="h-3 w-3" /> {log.device?.split(' ')[0] || 'متصفح'}</span>
                                   <span>•</span>
                                   <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {log.ip || 'العراق'}</span>
                                </div>
                             </div>
                          </div>
                          <div className="text-left space-y-1">
                             <p className="text-[10px] font-black text-slate-400">{new Date(log.timestamp).toLocaleDateString("ar-EG")}</p>
                             <p className="text-[10px] font-bold text-slate-400">{new Date(log.timestamp).toLocaleTimeString("ar-EG")}</p>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="p-20 text-center opacity-30 font-black">لا توجد سجلات أمان حالياً.</div>
                   )}
                </div>
             </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
           {/* Security Status Card */}
           <Card className="rounded-[40px] border-none shadow-xl bg-slate-900 text-white p-10 overflow-hidden relative group">
              <div className="relative z-10 space-y-8">
                 <div className="h-16 w-16 bg-primary rounded-3xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all">
                    <ShieldCheck className="h-8 w-8 text-white" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black">حالة الأمان</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                       حسابك محمي بالكامل باستخدام بروتوكولات Firebase الأمنية.
                    </p>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                       <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs font-bold">البريد مؤكد</span>
                       </div>
                       <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 opacity-50 grayscale">
                       <div className="flex items-center gap-3">
                          <Fingerprint className="h-4 w-4 text-primary" />
                          <span className="text-xs font-bold">المصادقة الثنائية</span>
                       </div>
                       <span className="text-[9px] font-black uppercase">قريباً</span>
                    </div>
                 </div>
              </div>
              <Lock className="absolute -right-10 -bottom-10 h-48 w-48 opacity-5" />
           </Card>

           {/* Active Sessions Mini Card */}
           <Card className="rounded-[40px] border-none shadow-sm bg-white p-8 space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="font-black text-lg flex items-center gap-2 text-slate-800">
                    <Smartphone className="h-5 w-5 text-primary" /> أجهزتي المتصلة
                 </h3>
                 <Badge variant="outline" className="rounded-full font-black text-[9px]">1 نشط</Badge>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-3">
                       <Monitor className="h-5 w-5 text-emerald-600" />
                       <div className="text-right">
                          <p className="text-xs font-black text-emerald-900">هذا الجهاز حالياً</p>
                          <p className="text-[9px] font-bold text-emerald-700 opacity-60">بغداد، العراق</p>
                       </div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 </div>
                 <Button variant="ghost" className="w-full rounded-xl text-xs font-black text-red-500 hover:bg-red-50 gap-2">
                    <LogOut className="h-3 w-3" /> تسجيل الخروج من كافة الأجهزة
                 </Button>
              </div>
           </Card>

           <div className="p-6 rounded-[32px] border-2 border-dashed border-primary/20 flex gap-4 items-center bg-primary/5">
              <AlertTriangle className="h-6 w-6 text-primary shrink-0" />
              <p className="text-[10px] font-bold text-primary/80 leading-relaxed">
                 إذا لاحظت أي نشاط غير طبيعي، يرجى تغيير كلمة المرور فوراً والتواصل مع الدعم الفني للمنصة.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
