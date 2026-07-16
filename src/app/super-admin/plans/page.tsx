
'use client';

import { useState, useMemo } from "react";
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
  X,
  Package,
  Users,
  HardDrive,
  Cpu,
  Star
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
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

export default function PlansManagementPage() {
  const db = useFirestore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const plansQuery = useMemo(() => query(collection(db, 'plans'), orderBy('price')), [db]);
  const { data: plans, loading } = useCollection(plansQuery);

  const handleAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    const planData = {
      name: formData.get('name'),
      price: Number(formData.get('price')),
      billingCycle: formData.get('billingCycle'),
      maxProducts: Number(formData.get('maxProducts')),
      maxEmployees: Number(formData.get('maxEmployees')),
      features: (formData.get('features') as string).split('\n').filter(f => f.trim()),
      isPOS: formData.get('isPOS') === 'on',
      isWorkshop: formData.get('isWorkshop') === 'on',
      isReports: formData.get('isReports') === 'on',
      isActive: true,
      updatedAt: Date.now()
    };

    try {
      if (editingPlan) {
        await updateDoc(doc(db, 'plans', editingPlan.id), planData);
        toast({ title: "تم التحديث", description: "تم حفظ تعديلات الباقة بنجاح." });
      } else {
        await addDoc(collection(db, 'plans'), { ...planData, createdAt: Date.now() });
        toast({ title: "تم الإنشاء", description: "تمت إضافة باقة اشتراك جديدة للمنصة." });
      }
      setIsAddOpen(false);
      setEditingPlan(null);
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد أرشفة هذه الباقة؟ لن تظهر للمشتركين الجدد.")) return;
    await updateDoc(doc(db, 'plans', id), { isActive: false });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900">إدارة خطط الاشتراك</h1>
          <p className="text-muted-foreground font-medium text-sm">تحديد أسعار الباقات والميزات والقيود المتاحة لكل فئة.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={(o) => { setIsAddOpen(o); if(!o) setEditingPlan(null); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-12 font-black gap-2 shadow-xl shadow-primary/20 px-10">
               <Plus className="h-5 w-5" /> إضافة باقة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[40px] max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-8 bg-primary text-white space-y-0">
               <div className="flex justify-between items-center w-full">
                  <div>
                     <DialogTitle className="text-2xl font-black text-right">{editingPlan ? 'تعديل باقة' : 'إنشاء باقة جديدة'}</DialogTitle>
                     <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">SaaS Plan Architect</p>
                  </div>
                  <button onClick={() => setIsAddOpen(false)}><X className="h-6 w-6" /></button>
               </div>
            </DialogHeader>
            <form onSubmit={handleAction} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-right">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase opacity-60">اسم الباقة</Label>
                    <Input name="name" defaultValue={editingPlan?.name} required placeholder="مثلاً: باقة الأعمال" className="rounded-2xl h-14 bg-muted/30 border-none font-bold px-6" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-black text-xs uppercase opacity-60">السعر (د.ع)</Label>
                      <Input name="price" type="number" defaultValue={editingPlan?.price} required placeholder="15,000" className="rounded-2xl h-14 bg-muted/30 border-none font-black text-center text-xl text-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-xs uppercase opacity-60">الدورة</Label>
                      <Input name="billingCycle" defaultValue={editingPlan?.billingCycle || 'شهري'} required className="rounded-2xl h-14 bg-muted/30 border-none text-center font-black" />
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase opacity-60">الحد الأقصى للمنتجات</Label>
                    <Input name="maxProducts" type="number" defaultValue={editingPlan?.maxProducts} required placeholder="999" className="rounded-2xl h-14 bg-muted/30 border-none font-black text-center" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-xs uppercase opacity-60">الحد الأقصى للموظفين</Label>
                    <Input name="maxEmployees" type="number" defaultValue={editingPlan?.maxEmployees} required placeholder="3" className="rounded-2xl h-14 bg-muted/30 border-none font-black text-center" />
                  </div>
               </div>

               <div className="space-y-4 pt-4 border-t">
                  <Label className="font-black text-sm uppercase opacity-60">الميزات المتاحة</Label>
                  <div className="grid grid-cols-3 gap-4">
                     {[
                       { id: 'isPOS', label: 'نظام POS', icon: Cpu },
                       { id: 'isReports', label: 'تقارير مالية', icon: Rocket },
                       { id: 'isWorkshop', label: 'نظام الورشة', icon: Zap }
                     ].map(m => (
                       <div key={m.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20">
                          <div className="flex items-center gap-2">
                             <m.icon className="h-4 w-4 opacity-40" />
                             <span className="text-xs font-bold">{m.label}</span>
                          </div>
                          <Switch name={m.id} defaultChecked={editingPlan ? editingPlan[m.id] : true} />
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-2">
                  <Label className="font-black text-xs uppercase tracking-widest opacity-60">الميزات النصية (فواصل بالأسطر)</Label>
                  <textarea 
                    name="features"
                    defaultValue={editingPlan?.features?.join('\n')}
                    className="w-full h-32 rounded-[24px] bg-muted/30 border-none p-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" 
                    placeholder="ميزة 1&#10;ميزة 2..." 
                  />
               </div>
               
               <Button type="submit" disabled={isSaving} className="w-full h-16 rounded-[24px] font-black text-xl shadow-2xl shadow-primary/20">
                  {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6 ml-2" />}
                  {editingPlan ? 'حفظ التعديلات' : 'نشر الباقة الآن'}
               </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-96 rounded-[48px]" />)
        ) : plans.map((plan) => (
          <Card key={plan.id} className={cn(
            "rounded-[48px] border-none shadow-sm flex flex-col overflow-hidden relative transition-all duration-500 hover:shadow-2xl bg-white",
            !plan.isActive && "opacity-60 grayscale"
          )}>
            <CardHeader className={cn("p-12 text-center space-y-6 bg-slate-50")}>
               <div className="h-20 w-20 bg-primary/10 rounded-[28px] flex items-center justify-center mx-auto shadow-inner text-primary">
                  {plan.price > 25000 ? <Rocket className="h-10 w-10" /> : <Zap className="h-10 w-10" />}
               </div>
               <div className="space-y-1">
                  <h3 className="text-2xl font-black">{plan.name}</h3>
                  <Badge variant="outline" className="rounded-full border-primary/20 text-primary font-bold text-[9px] uppercase">{plan.isActive ? 'نشطة' : 'مؤرشفة'}</Badge>
               </div>
            </CardHeader>
            <CardContent className="p-12 flex-1 space-y-10">
               <div className="text-center">
                  <div className="flex items-baseline justify-center gap-2">
                     <span className="text-5xl font-black tracking-tighter">{plan.price.toLocaleString()}</span>
                     <span className="text-xs font-bold text-muted-foreground">د.ع / {plan.billingCycle}</span>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                     <Package className="h-4 w-4 opacity-40" />
                     <span>حتى {plan.maxProducts.toLocaleString()} منتج</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                     <Users className="h-4 w-4 opacity-40" />
                     <span>حتى {plan.maxEmployees} موظفين</span>
                  </div>
                  {plan.features?.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                       <Check className="h-4 w-4 text-emerald-500" strokeWidth={4} />
                       {feature}
                    </div>
                  ))}
               </div>
            </CardContent>
            <CardFooter className="p-10 pt-0 flex gap-3">
               <Button variant="outline" className="flex-1 rounded-2xl h-14 font-black border-2 gap-2" onClick={() => handleEdit(plan)}><Edit2 className="h-4 w-4" /> تعديل</Button>
               <Button variant="ghost" className="rounded-2xl h-14 w-14 text-red-500 bg-red-50 hover:bg-red-100" onClick={() => handleDelete(plan.id)}><Trash2 className="h-5 w-5" /></Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
