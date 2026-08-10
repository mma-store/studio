
'use client';

import { useState, useMemo } from "react";
import { 
  Plus, 
  Check, 
  Edit2, 
  Trash2, 
  Zap, 
  Rocket,
  Save,
  Loader2,
  X,
  Package,
  Users,
  Star,
  Settings2,
  CheckCircle2,
  AlertCircle
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
import { collection, query, orderBy, addDoc, doc, updateDoc, deleteDoc, where, getDocs } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

export default function PlansManagementPage() {
  const db = useFirestore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const plansQuery = useMemo(() => query(collection(db, 'plans'), orderBy('displayOrder', 'asc')), [db]);
  const { data: plans, loading } = useCollection(plansQuery);

  const handleAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    const planData = {
      name: formData.get('name'),
      description: formData.get('description'),
      monthlyPrice: Number(formData.get('monthlyPrice')),
      yearlyPrice: Number(formData.get('yearlyPrice')),
      currency: "IQD",
      trialDays: Number(formData.get('trialDays')),
      maxProducts: Number(formData.get('maxProducts')),
      maxEmployees: Number(formData.get('maxEmployees')),
      displayOrder: Number(formData.get('displayOrder')),
      highlighted: formData.get('highlighted') === 'on',
      active: formData.get('active') === 'on',
      features: (formData.get('features') as string).split('\n').filter(f => f.trim()),
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

  const handleDelete = async (plan: any) => {
    // Check if any merchant is using this plan
    const tenantsRef = collection(db, 'tenants');
    const q = query(tenantsRef, where('subscriptionPlanId', '==', plan.id));
    const snap = await getDocs(q);

    if (!snap.empty) {
      toast({ 
        variant: "destructive", 
        title: "لا يمكن الحذف", 
        description: "توجد متاجر مفعلة على هذه الباقة حالياً. يمكنك تعطيلها (Deactivate) بدلاً من الحذف." 
      });
      return;
    }

    if (!confirm("هل أنت متأكد من حذف هذه الباقة نهائياً؟")) return;
    await deleteDoc(doc(db, 'plans', plan.id));
    toast({ title: "تم الحذف" });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900">إدارة خطط الاشتراك</h1>
          <p className="text-muted-foreground font-medium text-sm">تحديد أسعار الباقات، الفترات التجريبية، والقيود التقنية لكل فئة.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={(o) => { setIsAddOpen(o); if(!o) setEditingPlan(null); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-12 font-black gap-2 shadow-xl shadow-primary/20 px-10">
               <Plus className="h-5 w-5" /> إضافة باقة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[40px] max-w-3xl p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-8 bg-slate-900 text-white">
               <DialogTitle className="text-2xl font-black text-right">{editingPlan ? 'تعديل بيانات الباقة' : 'إنشاء باقة اشتراك جديدة'}</DialogTitle>
               <DialogDescription className="text-slate-400 font-bold">حدد الخصائص المالية والتقنية للباقة.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAction} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-right">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <Label className="font-black text-xs uppercase opacity-60">اسم الباقة (بالعربية)</Label>
                       <Input name="name" defaultValue={editingPlan?.name} required placeholder="مثلاً: الباقة الاحترافية" className="rounded-2xl h-14 bg-muted/30 border-none font-bold px-6" />
                    </div>
                    <div className="space-y-2">
                       <Label className="font-black text-xs uppercase opacity-60">وصف قصير</Label>
                       <Input name="description" defaultValue={editingPlan?.description} required placeholder="مثلاً: للشركات المتوسطة" className="rounded-2xl h-14 bg-muted/30 border-none px-6" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="font-black text-xs uppercase opacity-60">السعر الشهري (د.ع)</Label>
                          <Input name="monthlyPrice" type="number" defaultValue={editingPlan?.monthlyPrice} required className="rounded-2xl h-14 bg-muted/30 border-none font-black text-center text-xl text-primary" />
                       </div>
                       <div className="space-y-2">
                          <Label className="font-black text-xs uppercase opacity-60">السعر السنوي (د.ع)</Label>
                          <Input name="yearlyPrice" type="number" defaultValue={editingPlan?.yearlyPrice} required className="rounded-2xl h-14 bg-muted/30 border-none font-black text-center text-xl text-emerald-600" />
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="font-black text-xs uppercase opacity-60">الأيام التجريبية</Label>
                          <Input name="trialDays" type="number" defaultValue={editingPlan?.trialDays || 0} required className="rounded-2xl h-14 bg-muted/30 border-none font-black text-center" />
                       </div>
                       <div className="space-y-2">
                          <Label className="font-black text-xs uppercase opacity-60">ترتيب العرض</Label>
                          <Input name="displayOrder" type="number" defaultValue={editingPlan?.displayOrder || 0} required className="rounded-2xl h-14 bg-muted/30 border-none font-black text-center" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="font-black text-xs uppercase opacity-60">حد المنتجات</Label>
                          <Input name="maxProducts" type="number" defaultValue={editingPlan?.maxProducts || 999} required className="rounded-2xl h-14 bg-muted/30 border-none font-black text-center" />
                       </div>
                       <div className="space-y-2">
                          <Label className="font-black text-xs uppercase opacity-60">حد الموظفين</Label>
                          <Input name="maxEmployees" type="number" defaultValue={editingPlan?.maxEmployees || 1} required className="rounded-2xl h-14 bg-muted/30 border-none font-black text-center" />
                       </div>
                    </div>
                    <div className="flex items-center gap-8 pt-4">
                       <div className="flex items-center gap-3">
                          <Switch name="active" defaultChecked={editingPlan ? editingPlan.active : true} />
                          <Label className="font-black">مفعلة</Label>
                       </div>
                       <div className="flex items-center gap-3">
                          <Switch name="highlighted" defaultChecked={editingPlan?.highlighted} />
                          <Label className="font-black">تمييز (Recommended)</Label>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="space-y-2">
                  <Label className="font-black text-xs uppercase tracking-widest opacity-60">قائمة المميزات (سطر لكل ميزة)</Label>
                  <textarea 
                    name="features"
                    defaultValue={editingPlan?.features?.join('\n')}
                    className="w-full h-40 rounded-[24px] bg-muted/30 border-none p-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" 
                    placeholder="نظام POS متكامل&#10;تقارير يومية&#10;متجر إلكتروني..." 
                  />
               </div>
               
               <Button type="submit" disabled={isSaving} className="w-full h-16 rounded-[24px] font-black text-xl shadow-2xl shadow-primary/20">
                  {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6 ml-2" />}
                  {editingPlan ? 'حفظ التعديلات' : 'نشر الخطة الآن'}
               </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-[500px] rounded-[48px]" />)
        ) : plans.map((plan) => (
          <Card key={plan.id} className={cn(
            "rounded-[48px] border-none shadow-sm flex flex-col overflow-hidden relative transition-all duration-500 hover:shadow-2xl bg-white",
            !plan.active && "opacity-60 grayscale",
            plan.highlighted && "ring-4 ring-primary ring-offset-4"
          )}>
            <CardHeader className={cn("p-12 text-center space-y-4 bg-slate-50")}>
               <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
                  {plan.monthlyPrice === 0 ? <Star className="h-8 w-8" /> : plan.highlighted ? <Rocket className="h-8 w-8" /> : <Zap className="h-8 w-8" />}
               </div>
               <div className="space-y-1">
                  <h3 className="text-2xl font-black">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground font-bold">{plan.description}</p>
               </div>
            </CardHeader>
            <CardContent className="p-12 flex-1 space-y-8">
               <div className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                     <span className="text-4xl font-black">{plan.monthlyPrice.toLocaleString()}</span>
                     <span className="text-xs font-bold text-muted-foreground">د.ع / شهرياً</span>
                  </div>
                  <p className="text-[10px] font-black text-emerald-600 mt-1">أو {plan.yearlyPrice.toLocaleString()} د.ع / سنوياً</p>
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
                       <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                       {feature}
                    </div>
                  ))}
               </div>
            </CardContent>
            <CardFooter className="p-10 pt-0 flex gap-3">
               <Button variant="outline" className="flex-1 rounded-2xl h-14 font-black border-2 gap-2" onClick={() => handleEdit(plan)}><Edit2 className="h-4 w-4" /> تعديل</Button>
               <Button variant="ghost" className="rounded-2xl h-14 w-14 text-red-500 bg-red-50 hover:bg-red-100" onClick={() => handleDelete(plan)}><Trash2 className="h-5 w-5" /></Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
