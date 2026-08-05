
'use client';

import { useState, useMemo } from "react";
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Loader2, 
  RefreshCw,
  CheckCircle2,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, where, addDoc, doc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const PERMISSIONS = [
  { id: "products.read", label: "قراءة المنتجات" },
  { id: "products.write", label: "إضافة وتعديل المنتجات" },
  { id: "orders.read", label: "قراءة الطلبات" },
  { id: "orders.write", label: "تحديث حالة الطلبات" },
  { id: "customers.read", label: "قراءة بيانات العملاء" },
  { id: "inventory.read", label: "متابعة المخزون" }
];

export default function ApiKeysPage() {
  const db = useFirestore();
  const { tenantId } = useUser();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const keysQuery = useMemo(() => 
    tenantId ? query(collection(db, 'apiKeys'), where('tenantId', '==', tenantId), orderBy('createdAt', 'desc')) : null,
  [db, tenantId]);
  const { data: apiKeys, loading } = useCollection(keysQuery);

  const handleGenerateKey = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedPerms.length === 0) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى اختيار صلاحية واحدة على الأقل." });
      return;
    }

    setIsSaving(true);
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    
    // Generate a secure random key
    const rawKey = `sk_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;

    try {
      await addDoc(collection(db, 'apiKeys'), {
        tenantId,
        name,
        key: rawKey, // In production, hash this. This is for demonstration.
        permissions: selectedPerms,
        status: 'active',
        createdAt: Date.now(),
        expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
        lastUsed: null
      });

      setGeneratedKey(rawKey);
      toast({ title: "تم إنشاء المفتاح", description: "يرجى نسخ المفتاح الآن، لن تتمكن من رؤيته مرة أخرى." });
      setSelectedPerms([]);
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الإنشاء" });
    } finally {
      setIsSaving(false);
    }
  };

  const revokeKey = async (id: string) => {
    if (!confirm("هل أنت متأكد من تعطيل هذا المفتاح؟ التطبيقات التي تستخدمه ستتوقف عن العمل فوراً.")) return;
    await updateDoc(doc(db, 'apiKeys', id), { status: 'revoked' });
    toast({ title: "تم تعطيل المفتاح" });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ" });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900">مفاتيح الربط (API Keys)</h1>
          <p className="text-muted-foreground font-medium">إدارة وصول التطبيقات الخارجية لبيانات متجرك بشكل آمن.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(o) => { setIsAddOpen(o); if(!o) setGeneratedKey(null); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-12 font-black gap-2 shadow-xl shadow-primary/20 px-8">
               <Plus className="h-5 w-5" /> إنشاء مفتاح جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[40px] max-w-lg p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-8 bg-slate-900 text-white">
               <DialogTitle className="text-2xl font-black">تهيئة مفتاح API</DialogTitle>
               <DialogDescription className="text-slate-400 font-bold">حدد اسماً للمفتاح والصلاحيات المطلوبة.</DialogDescription>
            </DialogHeader>
            
            {generatedKey ? (
              <div className="p-8 space-y-6 text-right">
                 <div className="p-6 rounded-3xl bg-amber-50 border-2 border-dashed border-amber-200 space-y-4">
                    <div className="flex items-center gap-2 text-amber-700 font-black">
                       <AlertCircle className="h-5 w-5" /> تنبيه أمني هام
                    </div>
                    <p className="text-xs font-bold text-amber-600 leading-relaxed">
                       انسخ هذا المفتاح الآن واحفظه في مكان آمن. لن يظهر لك هذا الرمز مرة أخرى لأسباب أمنية.
                    </p>
                    <div className="flex gap-2">
                       <Input readOnly value={generatedKey} className="h-12 rounded-xl bg-white border-none font-mono text-xs text-left" dir="ltr" />
                       <Button size="icon" className="h-12 w-12 rounded-xl" onClick={() => copyToClipboard(generatedKey)}><Copy className="h-4 w-4" /></Button>
                    </div>
                 </div>
                 <Button onClick={() => setIsAddOpen(false)} className="w-full h-14 rounded-2xl font-black">فهمت، لقد قمت بحفظه</Button>
              </div>
            ) : (
              <form onSubmit={handleGenerateKey} className="p-8 space-y-6 text-right">
                <div className="space-y-2">
                   <Label className="font-black text-xs uppercase opacity-60">اسم المفتاح (للتمييز)</Label>
                   <Input name="name" required placeholder="مثلاً: تطبيق الموبايل، نظام المحاسبة..." className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
                </div>
                
                <div className="space-y-4">
                   <Label className="font-black text-xs uppercase opacity-60">الصلاحيات الممنوحة</Label>
                   <div className="grid grid-cols-1 gap-3">
                      {PERMISSIONS.map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
                           <Checkbox 
                            id={p.id} 
                            checked={selectedPerms.includes(p.id)} 
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedPerms([...selectedPerms, p.id]);
                              else setSelectedPerms(selectedPerms.filter(s => s !== p.id));
                            }}
                           />
                           <label htmlFor={p.id} className="text-sm font-bold cursor-pointer flex-1">{p.label}</label>
                        </div>
                      ))}
                   </div>
                </div>

                <Button disabled={isSaving} type="submit" className="w-full h-16 rounded-[24px] font-black text-lg gap-2 shadow-2xl">
                   {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
                   إنشاء المفتاح السري
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
         {loading ? (
           Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[32px]" />)
         ) : apiKeys.length > 0 ? (
           apiKeys.map((apiKey: any) => (
             <Card key={apiKey.id} className="rounded-[32px] border-none shadow-sm overflow-hidden bg-white hover:shadow-md transition-all group">
                <CardContent className="p-6 flex items-center justify-between">
                   <div className="flex items-center gap-5">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                        apiKey.status === 'active' ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"
                      )}>
                         <Key className="h-7 w-7" />
                      </div>
                      <div className="space-y-1">
                         <div className="flex items-center gap-3">
                            <h3 className="font-black text-lg text-slate-800">{apiKey.name}</h3>
                            <Badge className={cn(
                              "rounded-full border-none font-black text-[9px] px-3",
                              apiKey.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                            )}>{apiKey.status === 'active' ? 'نشط' : 'معطل'}</Badge>
                         </div>
                         <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> تم الإنشاء: {new Date(apiKey.createdAt).toLocaleDateString("ar-EG")}</span>
                            <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> آخر استخدام: {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleString("ar-EG") : 'لم يستخدم بعد'}</span>
                         </div>
                         <div className="flex flex-wrap gap-1.5 pt-1">
                            {apiKey.permissions?.map((p: string) => (
                              <span key={p} className="bg-slate-50 text-slate-500 text-[8px] font-black px-2 py-0.5 rounded-md border border-slate-100 uppercase tracking-tighter">
                                 {p.replace('.', ':')}
                              </span>
                            ))}
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => copyToClipboard(apiKey.id)}><Copy className="h-4 w-4" /></Button>
                      {apiKey.status === 'active' && (
                        <Button variant="ghost" size="icon" className="rounded-xl text-red-500 hover:bg-red-50" onClick={() => revokeKey(apiKey.id)}>
                           <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                   </div>
                </CardContent>
             </Card>
           ))
         ) : (
           <div className="h-64 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-[40px] border-2 border-dashed gap-4">
              <Lock className="h-16 w-16 opacity-10" />
              <p className="font-black text-xl">لا توجد مفاتيح ربط مفعلة</p>
           </div>
         )}
      </div>

      <Card className="rounded-[40px] border-none bg-slate-900 text-white p-10 overflow-hidden relative group">
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="h-20 w-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shrink-0 group-hover:rotate-12 transition-transform">
               <Key className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-4 text-center md:text-right">
               <h3 className="text-3xl font-black italic">Next Steps for Developers</h3>
               <p className="text-slate-400 font-medium leading-relaxed max-w-xl">
                  استخدم مفاتيح الربط لتشغيل عمليات متجرك من الخارج. يمكنك بناء لوحات تحكم مخصصة، أو ربط متجرك ببرامج المحاسبة مثل Odoo أو Quickbooks.
               </p>
               <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-full font-black px-10 h-12" onClick={() => window.location.href='/admin/developer/docs'}>استعرض الدليل التقني</Button>
            </div>
         </div>
      </Card>
    </div>
  );
}

function Badge({ className, children }: any) {
  return (
    <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-black border", className)}>
      {children}
    </span>
  );
}
