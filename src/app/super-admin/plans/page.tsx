
'use client';

import { useState } from "react";
import { 
  ShieldCheck, 
  Plus, 
  Check, 
  Edit2, 
  Trash2, 
  Zap, 
  Rocket,
  Save,
  Loader2,
  Clock,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const INITIAL_PLANS = [
  {
    id: "trial",
    name: "الباقة التجريبية",
    price: "0",
    duration: "14 يوم",
    features: ["1 متجر إلكتروني", "حتى 10 منتجات", "نظام POS أساسي", "تقارير مبسطة"],
    color: "bg-slate-100 text-slate-700",
    isActive: true
  },
  {
    id: "business",
    name: "باقة الأعمال",
    price: "15,000",
    duration: "شهري",
    features: ["منتجات غير محدودة", "إدارة المخزن بالكامل", "نظام الورشة والـ AI", "إدارة الديون", "3 حسابات موظفين"],
    color: "bg-primary text-white",
    isActive: true,
    isPopular: true
  },
  {
    id: "enterprise",
    name: "باقة المؤسسات",
    price: "35,000",
    duration: "شهري",
    features: ["دومين خاص", "دعم فني مخصص", "إدارة فروع متعددة", "تقارير مالية متقدمة", "حسابات موظفين غير محدودة"],
    color: "bg-[#0A192F] text-white",
    isActive: true
  }
];

export default function PlansManagementPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePlan = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsAddOpen(false);
      toast({ title: "تم الحفظ", description: "تم تحديث خطة الاشتراك بنجاح." });
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900">إدارة خطط الاشتراك</h1>
          <p className="text-muted-foreground font-medium text-sm">تحديد أسعار الباقات والميزات المتاحة لكل فئة من التجار.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-12 font-black gap-2 shadow-xl shadow-primary/20 px-10">
               <Plus className="h-5 w-5" /> إضافة باقة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[40px] max-w-md p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-8 bg-primary text-white space-y-0 flex flex-row items-center justify-between">
               <div>
                  <DialogTitle className="text-2xl font-black text-right">إنشاء باقة جديدة</DialogTitle>
                  <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">SaaS Plan Architect</p>
               </div>
               <button onClick={() => setIsAddOpen(false)}><X className="h-6 w-6" /></button>
            </DialogHeader>
            <div className="p-8 space-y-6 text-right">
               <div className="space-y-2">
                  <Label className="font-black text-xs uppercase tracking-widest opacity-60">اسم الباقة</Label>
                  <Input placeholder="مثلاً: الباقة الذهبية" className="rounded-2xl h-14 bg-muted/30 border-none font-bold px-6" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase tracking-widest opacity-60">السعر (د.ع)</Label>
                    <Input type="number" placeholder="25,000" className="rounded-2xl h-14 bg-muted/30 border-none font-black text-center text-xl text-primary" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase tracking-widest opacity-60">المدة</Label>
                    <Input placeholder="شهري" className="rounded-2xl h-14 bg-muted/30 border-none text-center font-black" />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label className="font-black text-xs uppercase tracking-widest opacity-60">الميزات (فواصل بالأسطر)</Label>
                  <textarea 
                    className="w-full h-32 rounded-[24px] bg-muted/30 border-none p-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" 
                    placeholder="ميزة 1&#10;ميزة 2..." 
                  />
               </div>
               <Button onClick={handleSavePlan} disabled={isSaving} className="w-full h-16 rounded-[24px] font-black text-xl shadow-2xl shadow-primary/20">
                  {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : "حفظ ونشر الباقة"}
               </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {INITIAL_PLANS.map((plan) => (
          <Card key={plan.id} className={cn(
            "rounded-[48px] border-none shadow-sm flex flex-col overflow-hidden relative transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] bg-white",
            plan.id === 'business' ? "ring-4 ring-primary/10" : ""
          )}>
            {plan.isPopular && (
              <div className="absolute top-8 left-[-40px] bg-primary text-white text-[9px] font-black py-1.5 px-12 -rotate-45 shadow-lg tracking-widest">المفضلة</div>
            )}
            <CardHeader className={cn("p-12 text-center space-y-6", plan.color)}>
               <div className="h-20 w-20 bg-white/20 rounded-[28px] flex items-center justify-center mx-auto shadow-inner backdrop-blur-md text-white">
                  {plan.id === 'trial' ? <Clock className="h-10 w-10" /> : 
                   plan.id === 'business' ? <Zap className="h-10 w-10" /> : <Rocket className="h-10 w-10" />}
               </div>
               <div className="space-y-1">
                  <h3 className="text-2xl font-black">{plan.name}</h3>
                  <Badge variant="outline" className="rounded-full border-white/20 text-white/80 font-bold text-[9px] tracking-widest uppercase">{plan.id}</Badge>
               </div>
            </CardHeader>
            <CardContent className="p-12 flex-1 space-y-10">
               <div className="text-center">
                  <div className="flex items-baseline justify-center gap-2">
                     <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                     <span className="text-xs font-bold text-muted-foreground">د.ع / {plan.duration}</span>
                  </div>
               </div>
               <div className="space-y-5">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-sm font-bold text-slate-600">
                       <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                          <Check className="h-3.5 w-3.5" strokeWidth={4} />
                       </div>
                       {feature}
                    </div>
                  ))}
               </div>
            </CardContent>
            <CardFooter className="p-10 pt-0 flex gap-3">
               <Button variant="outline" className="flex-1 rounded-2xl h-14 font-black border-2 gap-2"><Edit2 className="h-4 w-4" /> تعديل</Button>
               <Button variant="ghost" className="rounded-2xl h-14 w-14 text-red-500 bg-red-50 hover:bg-red-100"><Trash2 className="h-5 w-5" /></Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
