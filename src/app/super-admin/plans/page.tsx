
'use client';

import { useState } from "react";
import { 
  ShieldCheck, 
  Plus, 
  Check, 
  Edit2, 
  Trash2, 
  Zap, 
  Star, 
  Rocket,
  Save,
  Loader2
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

const DEFAULT_PLANS = [
  {
    id: "trial",
    name: "الفترة التجريبية",
    price: "0",
    duration: "14 يوم",
    features: ["1 متجر إلكتروني", "حتى 10 منتجات", "نظام POS أساسي", "تقارير مبسطة"],
    color: "bg-slate-100 text-slate-700",
    icon: Clock => <Clock className="h-6 w-6" />
  },
  {
    id: "business",
    name: "باقة الأعمال",
    price: "15,000",
    duration: "شهري",
    features: ["منتجات غير محدودة", "إدارة المخزن بالكامل", "نظام الورشة والـ AI", "إدارة الديون", "3 حسابات موظفين"],
    color: "bg-blue-600 text-white",
    isPopular: true,
    icon: Zap => <Zap className="h-6 w-6" />
  },
  {
    id: "enterprise",
    name: "باقة المؤسسات",
    price: "35,000",
    duration: "شهري",
    features: ["دومين خاص", "دعم فني مخصص", "إدارة فروع متعددة", "تقارير مالية متقدمة", "حسابات موظفين غير محدودة"],
    color: "bg-[#0A192F] text-white",
    icon: Rocket => <Rocket className="h-6 w-6" />
  }
];

export default function PlansManagementPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black">إدارة خطط الاشتراك</h1>
          <p className="text-muted-foreground font-medium text-sm">تحديد أسعار الباقات والميزات المتاحة لكل فئة من التجار.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 font-black gap-2 shadow-lg shadow-primary/20 px-8">
               <Plus className="h-5 w-5" /> إضافة باقة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px] max-w-md">
            <DialogHeader><DialogTitle className="text-2xl font-black text-right">إنشاء باقة جديدة</DialogTitle></DialogHeader>
            <div className="space-y-5 pt-4 text-right">
               <div className="space-y-2">
                  <Label className="font-bold">اسم الباقة</Label>
                  <Input placeholder="مثلاً: الباقة الذهبية" className="rounded-xl h-12 bg-muted/20 border-none font-bold" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">السعر (د.ع)</Label>
                    <Input type="number" placeholder="20,000" className="rounded-xl h-12 bg-muted/20 border-none font-black text-center" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">المدة</Label>
                    <Input placeholder="شهري" className="rounded-xl h-12 bg-muted/20 border-none text-center" />
                  </div>
               </div>
               <div className="space-y-2">
                  <Label className="font-bold">الميزات (فواصل بالأسطر)</Label>
                  <textarea className="w-full h-32 rounded-2xl bg-muted/20 border-none p-4 text-sm font-medium" placeholder="ميزة 1&#10;ميزة 2..." />
               </div>
               <DialogFooter>
                  <Button className="w-full h-14 rounded-2xl font-black text-lg">حفظ ونشر الباقة</Button>
               </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        {DEFAULT_PLANS.map((plan) => (
          <Card key={plan.id} className={cn(
            "rounded-[48px] border-none shadow-sm flex flex-col overflow-hidden relative transition-all hover:shadow-2xl hover:scale-[1.02]",
            plan.id === 'business' ? "ring-4 ring-primary/20" : ""
          )}>
            {plan.isPopular && (
              <div className="absolute top-6 left-[-35px] bg-primary text-white text-[10px] font-black py-1.5 px-10 -rotate-45 shadow-lg">مميزة</div>
            )}
            <CardHeader className={cn("p-10 text-center space-y-4", plan.color)}>
               <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner backdrop-blur-md text-white">
                  {plan.id === 'trial' ? <Clock className="h-8 w-8" /> : 
                   plan.id === 'business' ? <Zap className="h-8 w-8" /> : <Rocket className="h-8 w-8" />}
               </div>
               <div className="space-y-1">
                  <h3 className="text-xl font-black">{plan.name}</h3>
                  <p className="text-xs font-bold opacity-70">مناسبة لـ {plan.id === 'trial' ? 'الجدد' : 'الطموحين'}</p>
               </div>
            </CardHeader>
            <CardContent className="p-10 flex-1 space-y-8">
               <div className="text-center">
                  <div className="flex items-baseline justify-center gap-2">
                     <span className="text-4xl font-black">{plan.price}</span>
                     <span className="text-xs font-bold text-muted-foreground">د.ع / {plan.duration}</span>
                  </div>
               </div>
               <div className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                       <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3" strokeWidth={4} />
                       </div>
                       {feature}
                    </div>
                  ))}
               </div>
            </CardContent>
            <CardFooter className="p-10 pt-0 flex gap-2">
               <Button variant="outline" className="flex-1 rounded-2xl h-12 font-bold"><Edit2 className="h-4 w-4" /></Button>
               <Button variant="ghost" className="rounded-2xl h-12 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Clock(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )
}
