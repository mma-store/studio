
'use client';

import { useState, useMemo } from "react";
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Edit2, 
  ShieldCheck, 
  Loader2, 
  ExternalLink,
  History,
  CheckCircle2,
  XCircle,
  Zap,
  Globe,
  Settings2,
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
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, where, addDoc, doc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const EVENTS = [
  { id: "order.created", label: "طلب جديد" },
  { id: "order.updated", label: "تحديث حالة الطلب" },
  { id: "customer.created", label: "زبون جديد" },
  { id: "product.created", label: "إضافة منتج" },
  { id: "inventory.updated", label: "تحديث المخزون" },
  { id: "payment.completed", label: "اكتمال دفع فاتورة" }
];

export default function WebhooksPage() {
  const db = useFirestore();
  const { tenantId } = useUser();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [editingWebhook, setEditingWebhook] = useState<any>(null);

  const webhooksQuery = useMemo(() => 
    tenantId ? query(collection(db, 'webhooks'), where('tenantId', '==', tenantId), orderBy('createdAt', 'desc')) : null,
  [db, tenantId]);
  const { data: webhooks, loading } = useCollection(webhooksQuery);

  const handleAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedEvents.length === 0) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى اختيار حدث واحد على الأقل." });
      return;
    }

    setIsSaving(true);
    const fd = new FormData(e.currentTarget);
    const url = fd.get('url') as string;
    
    const webhookData = {
      tenantId,
      url,
      events: selectedEvents,
      enabled: true,
      secret: `whsec_${Math.random().toString(36).substring(7)}`,
      status: 'active',
      updatedAt: Date.now(),
      lastDelivery: null,
      retryCount: 0
    };

    try {
      if (editingWebhook) {
        await updateDoc(doc(db, 'webhooks', editingWebhook.id), webhookData);
        toast({ title: "تم التحديث" });
      } else {
        await addDoc(collection(db, 'webhooks'), { ...webhookData, createdAt: Date.now() });
        toast({ title: "تم تفعيل الـ Webhook" });
      }
      setIsAddOpen(false);
      setEditingWebhook(null);
      setSelectedEvents([]);
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm("هل تريد حذف هذا التنبيه البرمجي؟")) return;
    await deleteDoc(doc(db, 'webhooks', id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900">التنبيهات الفورية (Webhooks)</h1>
          <p className="text-muted-foreground font-medium">أرسل بيانات حية لسيرفرك الخاص عند حدوث أي عملية في المتجر.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(o) => { setIsAddOpen(o); if(!o) setEditingWebhook(null); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-12 font-black gap-2 shadow-xl shadow-primary/20 px-8">
               <Plus className="h-5 w-5" /> إضافة رابط تنبيه
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[40px] max-w-lg p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-8 bg-slate-900 text-white">
               <DialogTitle className="text-2xl font-black">إعداد Webhook</DialogTitle>
               <DialogDescription className="text-slate-400 font-bold">أدخل رابط الـ URL الذي سيستقبل طلبات POST.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAction} className="p-8 space-y-6 text-right">
               <div className="space-y-2">
                  <Label className="font-black text-xs uppercase opacity-60">رابط الاستلام (Payload URL)</Label>
                  <Input name="url" required type="url" placeholder="https://api.yourdomain.com/webhook" className="rounded-xl h-12 bg-muted/30 border-none font-mono text-xs text-left px-6" dir="ltr" defaultValue={editingWebhook?.url} />
               </div>
               
               <div className="space-y-4">
                  <Label className="font-black text-xs uppercase opacity-60">الأحداث التي تهمك</Label>
                  <div className="grid grid-cols-2 gap-3">
                     {EVENTS.map(ev => (
                       <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
                          <Checkbox 
                           id={ev.id} 
                           checked={selectedEvents.includes(ev.id)} 
                           onCheckedChange={(checked) => {
                             if (checked) setSelectedEvents([...selectedEvents, ev.id]);
                             else setSelectedEvents(selectedEvents.filter(s => s !== ev.id));
                           }}
                          />
                          <label htmlFor={ev.id} className="text-[11px] font-black cursor-pointer flex-1">{ev.label}</label>
                       </div>
                     ))}
                  </div>
               </div>

               <Button disabled={isSaving} type="submit" className="w-full h-16 rounded-[24px] font-black text-lg gap-2 shadow-2xl">
                  {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6" />}
                  {editingWebhook ? 'حفظ التعديلات' : 'تفعيل التنبيهات'}
               </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="space-y-6">
            {loading ? (
              Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-[32px]" />)
            ) : webhooks.length > 0 ? (
              webhooks.map((wh: any) => (
                <Card key={wh.id} className="rounded-[32px] border-none shadow-sm overflow-hidden bg-white group">
                   <CardContent className="p-8 space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                               <Globe className="h-5 w-5" />
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-none font-black text-[9px] px-3 py-0.5">نشط</Badge>
                         </div>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => deleteWebhook(wh.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                         </div>
                      </div>
                      
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">ENDPOINT URL</p>
                         <p className="font-mono text-[11px] text-primary truncate" dir="ltr">{wh.url}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed">
                         {wh.events?.map((ev: string) => (
                           <span key={ev} className="text-[9px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">{ev}</span>
                         ))}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                         <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                            <History className="h-3.5 w-3.5" />
                            آخر إرسال: {wh.lastDelivery ? new Date(wh.lastDelivery).toLocaleString("ar-EG") : 'لا يوجد'}
                         </div>
                         <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                      </div>
                   </CardContent>
                </Card>
              ))
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-[40px] border-2 border-dashed gap-4">
                 <Webhook className="h-16 w-16 opacity-10" />
                 <p className="font-black text-xl">لا يوجد Webhooks مضافة</p>
              </div>
            )}
         </div>

         <div className="space-y-8">
            <Card className="rounded-[40px] border-none shadow-xl bg-slate-900 text-white p-10 overflow-hidden relative">
               <div className="relative z-10 space-y-6">
                  <div className="h-16 w-16 bg-primary rounded-3xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform">
                     <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-3xl font-black italic">Event-Driven SaaS</h3>
                     <p className="text-slate-400 font-medium leading-relaxed">
                        الـ Webhooks تسمح لنظامك الخارجي "بالاستماع" لمتجرك. بمجرد حدوث عملية بيع في الـ POS، سنقوم بإرسال إشعار فوري لسيرفرك ليقوم بتحديث نظام المحاسبة الخاص بك آلياً.
                     </p>
                     <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                        <div className="flex items-center gap-3">
                           <Lock className="h-5 w-5 text-primary" />
                           <p className="text-xs font-black">تحقق من التوقيع (HMAC Signature)</p>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                           نقوم بتوقيع كل طلب باستخدام مفتاح سري خاص بك لضمان أن البيانات قادمة فعلاً من منصتنا.
                        </p>
                     </div>
                  </div>
               </div>
            </Card>

            <Card className="rounded-[40px] border-none shadow-sm bg-white p-8 space-y-6">
               <h3 className="font-black text-lg flex items-center gap-2 text-slate-800"><History className="h-5 w-5 text-primary" /> سجل التسليم الأخير</h3>
               <div className="space-y-4">
                  <p className="text-center text-xs opacity-30 font-bold py-10">لا توجد سجلات تسليم حديثة لتظهر هنا.</p>
               </div>
            </Card>
         </div>
      </div>
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
