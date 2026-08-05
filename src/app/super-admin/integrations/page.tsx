
'use client';

import { useState, useMemo } from "react";
import { 
  Puzzle, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  ShieldCheck, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Eye,
  Settings2,
  BarChart3,
  ExternalLink
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
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "payments", label: "Payments" },
  { id: "delivery", label: "Delivery" },
  { id: "messaging", label: "Messaging" },
  { id: "ai", label: "AI Services" },
  { id: "accounting", label: "Accounting" },
  { id: "marketing", label: "Marketing" }
];

export default function PlatformIntegrationsManagement() {
  const db = useFirestore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingInt, setEditingInt] = useState<any>(null);

  const { data: integrations, loading } = useCollection(query(collection(db, 'integrations'), orderBy('createdAt', 'desc')));
  const { data: adoptions } = useCollection(collection(db, 'tenantIntegrations'));

  const handleAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const fd = new FormData(e.currentTarget);
    
    const data = {
      name: fd.get('name'),
      category: fd.get('category'),
      provider: fd.get('provider'),
      description: fd.get('description'),
      logo: fd.get('logo'),
      enabled: fd.get('enabled') === 'on',
      status: fd.get('status'),
      requiredConfiguration: (fd.get('config') as string).split('\n').filter(f => f.trim()),
      updatedAt: Date.now()
    };

    try {
      if (editingInt) {
        await updateDoc(doc(db, 'integrations', editingInt.id), data);
        toast({ title: "تم التحديث بنجاح" });
      } else {
        await addDoc(collection(db, 'integrations'), { ...data, createdAt: Date.now() });
        toast({ title: "تمت الإضافة بنجاح" });
      }
      setIsAddOpen(false);
      setEditingInt(null);
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  const getAdoptionCount = (id: string) => {
    return adoptions.filter(a => a.integrationId === id && a.enabled).length;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900">مركز إدارة التكامل</h1>
          <p className="text-muted-foreground font-medium text-sm">إدارة الخدمات الخارجية المتاحة لكافة المتاجر على المنصة.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(o) => { setIsAddOpen(o); if(!o) setEditingInt(null); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-12 font-black gap-2 shadow-xl shadow-primary/20 px-10">
               <Plus className="h-5 w-5" /> إضافة تكامل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[40px] max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-8 bg-slate-900 text-white">
               <DialogTitle className="text-2xl font-black">إدارة مزود الخدمة</DialogTitle>
               <DialogDescription className="text-slate-400 font-bold">أدخل بيانات التكامل التقنية.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAction} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto text-right">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-black text-xs opacity-60">اسم الخدمة</Label>
                    <Input name="name" defaultValue={editingInt?.name} required placeholder="ZainCash, SMS.iq..." className="rounded-xl h-12 bg-muted/20 border-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-xs opacity-60">الفئة</Label>
                    <Select name="category" defaultValue={editingInt?.category || 'payments'}>
                       <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none"><SelectValue /></SelectTrigger>
                       <SelectContent className="rounded-2xl">
                          {CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                       </SelectContent>
                    </Select>
                  </div>
               </div>
               
               <div className="space-y-2">
                  <Label className="font-black text-xs opacity-60">رابط الشعار</Label>
                  <Input name="logo" defaultValue={editingInt?.logo} placeholder="https://..." className="rounded-xl h-12 bg-muted/20 border-none font-mono text-xs" />
               </div>

               <div className="space-y-2">
                  <Label className="font-black text-xs opacity-60">وصف الخدمة</Label>
                  <textarea name="description" defaultValue={editingInt?.description} className="w-full h-24 rounded-2xl bg-muted/20 border-none p-4 text-xs font-bold" />
               </div>

               <div className="space-y-2">
                  <Label className="font-black text-xs opacity-60">الحقول المطلوبة (بالأسطر)</Label>
                  <textarea 
                    name="config" 
                    defaultValue={editingInt?.requiredConfiguration?.join('\n')}
                    placeholder="API_KEY&#10;MERCHANT_ID..." 
                    className="w-full h-32 rounded-2xl bg-muted/20 border-none p-4 font-mono text-xs" 
                  />
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-black text-xs opacity-60">الحالة</Label>
                    <Select name="status" defaultValue={editingInt?.status || 'active'}>
                       <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none"><SelectValue /></SelectTrigger>
                       <SelectContent className="rounded-2xl">
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="beta">Beta</SelectItem>
                          <SelectItem value="coming_soon">Coming Soon</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                     <input type="checkbox" name="enabled" defaultChecked={editingInt ? editingInt.enabled : true} className="h-5 w-5 rounded-lg" />
                     <Label className="font-black">مفعل عالمياً</Label>
                  </div>
               </div>

               <Button disabled={isSaving} type="submit" className="w-full h-16 rounded-[24px] font-black text-lg gap-2 shadow-2xl">
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                  حفظ التكامل
               </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-[40px] border-none bg-white shadow-sm overflow-hidden border">
         <Table>
            <TableHeader>
               <TableRow className="bg-slate-50/50">
                  <TableHead className="text-right py-6 px-8 font-black text-[10px] uppercase">التكامل</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase">الفئة</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase">عدد المتاجر</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase">الحالة</TableHead>
                  <TableHead className="text-left px-8 font-black text-[10px] uppercase">إجراءات</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {loading ? (
                 Array(4).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={5} className="px-8 py-4"><Skeleton className="h-12 w-full rounded-2xl" /></TableCell></TableRow>)
               ) : integrations.map((int: any) => (
                 <TableRow key={int.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 relative overflow-hidden shrink-0">
                             {int.logo && <Image src={int.logo} alt={int.name} fill className="object-contain p-2" />}
                          </div>
                          <div>
                             <p className="font-black text-sm text-slate-800">{int.name}</p>
                             <p className="text-[10px] font-bold text-muted-foreground">{int.provider || 'External Provider'}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="rounded-full border-slate-200 text-slate-500 font-black text-[9px] px-3">{int.category}</Badge>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 opacity-30" />
                          <span className="font-black text-sm">{getAdoptionCount(int.id)}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge className={cn(
                         "rounded-full border-none font-black text-[9px] px-3 py-1",
                         int.enabled ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                       )}>
                          {int.enabled ? 'نشط' : 'معطل'}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-left px-8">
                       <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => { setEditingInt(int); setIsAddOpen(true); }}><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="rounded-xl text-red-500" onClick={() => { if(confirm('حذف؟')) deleteDoc(doc(db, 'integrations', int.id)) }}><Trash2 className="h-4 w-4" /></Button>
                       </div>
                    </TableCell>
                 </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
    </div>
  );
}
