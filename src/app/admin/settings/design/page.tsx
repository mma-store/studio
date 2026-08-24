
'use client';

import { useState, useEffect, useMemo } from "react";
import { Palette, Save, Loader2, Smartphone, Monitor, Layout, Eye, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useDoc, useUser } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";

const COLOR_PRESETS = [
  { name: "القهوة المختصة", primary: "#1B3022", background: "#FDF8F5", secondary: "#C05621" },
  { name: "تقني رياضي", primary: "#000000", background: "#F8F9FA", secondary: "#3B82F6" },
  { name: "أصالة وجمال", primary: "#7C2D12", background: "#FFF5F5", secondary: "#F59E0B" },
];

export default function StoreDesignPage() {
  const db = useFirestore();
  const { tenantId } = useUser();
  const tenantRef = useMemo(() => tenantId ? doc(db, 'tenants', tenantId) : null, [db, tenantId]);
  const { data: tenant, loading } = useDoc<any>(tenantRef);

  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState({
    primary: "#1A365D",
    secondary: "#C05621",
    background: "#FDF8F5",
    card: "#FFFFFF",
    textPrimary: "#1A202C",
    textSecondary: "#718096"
  });

  useEffect(() => {
    if (tenant?.storeTheme) {
      setTheme(tenant.storeTheme);
    }
  }, [tenant]);

  const handleSave = async () => {
    if (!tenantRef) return;
    setIsSaving(true);
    try {
      await updateDoc(tenantRef, { storeTheme: theme });
      toast({ title: "تم حفظ التصميم", description: "سيتم تطبيق الألوان على متجرك الإلكتروني فوراً." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-10"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-20" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900">تصميم وهوية المتجر</h1>
          <p className="text-muted-foreground font-medium">خصص الألوان والمظهر العام لمتجرك الإلكتروني ليتناسب مع علامتك التجارية.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="rounded-2xl font-black h-14 px-10 gap-3 shadow-xl shadow-primary/20">
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          اعتماد التصميم
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="bg-primary/5 p-8 border-b">
                 <CardTitle className="text-xl font-black flex items-center gap-3"><Palette className="h-6 w-6 text-primary" /> لوحة الألوان</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                       <Label className="font-black text-xs opacity-60">اللون الرئيسي (الأزرار والروابط)</Label>
                       <div className="flex gap-2">
                          <Input type="color" value={theme.primary} onChange={(e) => setTheme({...theme, primary: e.target.value})} className="h-12 w-20 p-1 rounded-xl cursor-pointer" />
                          <Input value={theme.primary} onChange={(e) => setTheme({...theme, primary: e.target.value})} className="h-12 rounded-xl bg-muted/20 border-none font-mono" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label className="font-black text-xs opacity-60">لون الخلفية العامة</Label>
                       <div className="flex gap-2">
                          <Input type="color" value={theme.background} onChange={(e) => setTheme({...theme, background: e.target.value})} className="h-12 w-20 p-1 rounded-xl cursor-pointer" />
                          <Input value={theme.background} onChange={(e) => setTheme({...theme, background: e.target.value})} className="h-12 rounded-xl bg-muted/20 border-none font-mono" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label className="font-black text-xs opacity-60">لون البطاقات (Cards)</Label>
                       <div className="flex gap-2">
                          <Input type="color" value={theme.card} onChange={(e) => setTheme({...theme, card: e.target.value})} className="h-12 w-20 p-1 rounded-xl cursor-pointer" />
                          <Input value={theme.card} onChange={(e) => setTheme({...theme, card: e.target.value})} className="h-12 rounded-xl bg-muted/20 border-none font-mono" />
                       </div>
                    </div>
                 </div>

                 <div className="pt-6 border-t space-y-4">
                    <Label className="font-black text-xs opacity-60">قوالب جاهزة</Label>
                    <div className="grid grid-cols-1 gap-3">
                       {COLOR_PRESETS.map((p, i) => (
                         <button 
                          key={i} 
                          onClick={() => setTheme({...theme, primary: p.primary, background: p.background, secondary: p.secondary})}
                          className="flex items-center justify-between p-3 rounded-2xl border-2 border-transparent hover:border-primary transition-all bg-muted/20"
                         >
                            <span className="text-xs font-bold">{p.name}</span>
                            <div className="flex gap-1">
                               <div className="h-4 w-4 rounded-full" style={{ backgroundColor: p.primary }} />
                               <div className="h-4 w-4 rounded-full" style={{ backgroundColor: p.background }} />
                            </div>
                         </button>
                       ))}
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-2">
           <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white sticky top-24">
              <CardHeader className="p-8 border-b flex flex-row items-center justify-between bg-slate-900 text-white">
                 <div className="space-y-1">
                    <CardTitle className="text-xl font-black flex items-center gap-3"><Smartphone className="h-6 w-6 text-primary" /> معاينة المتجر</CardTitle>
                    <CardDescription className="text-slate-400 font-bold">هكذا سيظهر متجرك للزبائن على الهاتف.</CardDescription>
                 </div>
                 <div className="flex gap-2 bg-white/10 rounded-xl p-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-white/20"><Smartphone className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg opacity-40"><Monitor className="h-4 w-4" /></Button>
                 </div>
              </CardHeader>
              <CardContent className="p-0 bg-slate-200 flex justify-center">
                 {/* Simulated Phone UI */}
                 <div className="w-[375px] h-[600px] my-10 bg-white rounded-[40px] shadow-2xl border-[8px] border-slate-800 overflow-hidden relative flex flex-col" style={{ backgroundColor: theme.background }}>
                    {/* Header */}
                    <div className="h-16 border-b flex items-center justify-between px-6 bg-white/80 backdrop-blur-md">
                       <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center font-black text-[10px]">LOGO</div>
                          <span className="font-black text-xs">{tenant?.businessName || 'اسم المتجر'}</span>
                       </div>
                       <ShoppingBag className="h-5 w-5 opacity-40" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                       {/* Hero */}
                       <div className="aspect-[2/1] rounded-3xl bg-slate-800 p-6 flex flex-col justify-center text-white">
                          <h4 className="text-xl font-black leading-tight">ابدأ يومك بأرقى كوب قهوة</h4>
                          <button className="mt-3 w-fit px-4 py-1.5 rounded-full bg-white text-black font-black text-[8px]">اطلب الآن</button>
                       </div>

                       {/* Categories */}
                       <div className="space-y-3">
                          <div className="flex justify-between items-center"><span className="font-black text-xs">الأقسام</span><ChevronLeft className="h-3 w-3" /></div>
                          <div className="flex gap-4">
                             {[1,2,3,4].map(i => (
                               <div key={i} className="flex flex-col items-center gap-1.5">
                                  <div className="h-12 w-12 rounded-full bg-white shadow-sm border border-black/5" />
                                  <div className="h-1.5 w-8 bg-black/10 rounded-full" />
                               </div>
                             ))}
                          </div>
                       </div>

                       {/* Products */}
                       <div className="space-y-3">
                          <div className="flex justify-between items-center"><span className="font-black text-xs">شائع</span><ChevronLeft className="h-3 w-3" /></div>
                          <div className="grid grid-cols-2 gap-3">
                             {[1,2].map(i => (
                               <div key={i} className="rounded-3xl p-2 bg-white shadow-sm border border-black/5 space-y-2" style={{ backgroundColor: theme.card }}>
                                  <div className="aspect-square rounded-2xl bg-muted" />
                                  <div className="space-y-1 p-1">
                                     <div className="h-2 w-3/4 bg-black/10 rounded-full" />
                                     <div className="flex justify-between items-center pt-2">
                                        <div className="h-2.5 w-1/2 rounded-full" style={{ backgroundColor: theme.primary }} />
                                        <div className="h-6 w-6 rounded-lg" style={{ backgroundColor: theme.primary }} />
                                     </div>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Nav */}
                    <div className="h-16 bg-white/90 border-t rounded-t-[32px] flex items-center justify-around px-4">
                       {[Home, Layout, ClipboardList, User].map((Icon, i) => (
                         <div key={i} className={cn("p-2 rounded-xl", i === 0 ? "text-primary bg-primary/10" : "text-slate-300")} style={i === 0 ? { color: theme.primary, backgroundColor: `${theme.primary}10` } : {}}>
                            <Icon className="h-5 w-5" />
                         </div>
                       ))}
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

function Layout(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
    </svg>
  );
}
