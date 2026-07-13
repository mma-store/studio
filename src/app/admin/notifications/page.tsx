'use client';

import { 
  Bell, 
  Send, 
  Users, 
  Target, 
  Smartphone,
  CheckCircle2,
  Clock,
  History,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, addDoc, query, orderBy, limit, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsPage() {
  const db = useFirestore();
  const { profile, tenantId } = useUser();
  const [isSending, setIsSending] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");

  // FIXED: Scoped to tenantId
  const historyQuery = useMemo(() => query(
    collection(db, 'notifications'), 
    where('tenantId', '==', tenantId),
    orderBy('timestamp', 'desc'), 
    limit(10)
  ), [db, tenantId]);
  const { data: history, loading } = useCollection(historyQuery);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await addDoc(collection(db, 'notifications'), {
        tenantId,
        title,
        message,
        target,
        senderName: profile?.displayName || "مدير",
        timestamp: Date.now(),
        status: 'sent'
      });
      toast({ title: "تم الإرسال", description: "تم حفظ الإشعار وإرساله للمستهدفين." });
      setTitle("");
      setMessage("");
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إرسال الإشعار." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight">مركز الإشعارات</h1>
        <p className="text-muted-foreground font-medium text-sm">إرسال تنبيهات مباشرة وعروض ترويجية لهواتف العملاء.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="rounded-[32px] border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 p-8 border-b border-primary/5">
              <CardTitle className="flex items-center gap-3 text-xl font-black">
                <Send className="h-6 w-6 text-primary" /> إرسال إشعار جديد
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSend} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="font-bold">عنوان الإشعار</Label>
                       <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: خصم جديد في المجمع!" className="rounded-xl h-12 bg-muted/30 border-none" />
                    </div>
                    <div className="space-y-2">
                       <Label className="font-bold">الفئة المستهدفة</Label>
                       <Select value={target} onValueChange={setTarget}>
                          <SelectTrigger className="rounded-xl h-12 bg-muted/30 border-none">
                             <SelectValue placeholder="اختر الجمهور" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl p-2">
                             <SelectItem value="all" className="rounded-xl">كافة العملاء</SelectItem>
                             <SelectItem value="retail" className="rounded-xl">عملاء المفرد</SelectItem>
                             <SelectItem value="wholesale" className="rounded-xl">عملاء الجملة</SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="font-bold">محتوى الرسالة</Label>
                    <Textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="اكتب نص الإشعار هنا..." className="rounded-2xl bg-muted/30 border-none min-h-[120px]" />
                 </div>
                 <Button disabled={isSending} className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-95">
                    {isSending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                    إرسال الإشعار الآن
                 </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[32px] border-none shadow-sm overflow-hidden bg-slate-900 text-white">
             <CardHeader>
                <CardTitle className="text-lg font-black flex items-center gap-2">
                   <Target className="h-5 w-5 text-primary" /> إحصائيات الوصول
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase opacity-60">إجمالي السجلات</p>
                      <p className="text-2xl font-black">{history.length}</p>
                   </div>
                   <Users className="h-8 w-8 opacity-20" />
                </div>
             </CardContent>
          </Card>

          <Card className="rounded-[32px] border-none shadow-sm">
             <CardHeader>
                <CardTitle className="text-lg font-black flex items-center gap-2">
                   <History className="h-5 w-5 text-primary" /> آخر الإرسالات
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                {loading ? (
                  Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
                ) : history.length > 0 ? (
                  history.map((notif: any) => (
                    <div key={notif.id} className="p-4 rounded-2xl bg-muted/30 space-y-2 border-r-4 border-primary">
                       <p className="text-sm font-bold truncate">{notif.title}</p>
                       <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(notif.timestamp).toLocaleDateString("ar-EG")}</span>
                          <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3 w-3" /> {notif.status}</span>
                       </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs opacity-30 font-bold">لا يوجد تاريخ إرسال.</p>
                )}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
