
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [isSending, setIsSending] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast({ title: "تم الإرسال", description: "جاري إرسال الإشعار إلى كافة المستخدمين المحددين عبر النظام." });
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
                       <Input required placeholder="مثال: خصم جديد في المجمع!" className="rounded-xl h-12 bg-muted/30 border-none" />
                    </div>
                    <div className="space-y-2">
                       <Label className="font-bold">الفئة المستهدفة</Label>
                       <Select defaultValue="all">
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
                    <Textarea required placeholder="اكتب نص الإشعار هنا..." className="rounded-2xl bg-muted/30 border-none min-h-[120px]" />
                 </div>
                 <div className="space-y-2">
                    <Label className="font-bold">رابط التوجيه (اختياري)</Label>
                    <Input placeholder="مثال: /catalog/products-id" className="rounded-xl h-12 bg-muted/30 border-none text-left" dir="ltr" />
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
                      <p className="text-[10px] font-black uppercase opacity-60">إجمالي المشتركين</p>
                      <p className="text-2xl font-black">1,450</p>
                   </div>
                   <Users className="h-8 w-8 opacity-20" />
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase opacity-60">نسبة فتح الإشعارات</p>
                      <p className="text-2xl font-black">24%</p>
                   </div>
                   <Smartphone className="h-8 w-8 opacity-20" />
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
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-2xl bg-muted/30 space-y-2 border-r-4 border-primary">
                     <p className="text-sm font-bold truncate">تخفيضات تصل لـ 50% على قطع الغيار</p>
                     <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> قبل يومين</span>
                        <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3 w-3" /> تم الوصول</span>
                     </div>
                  </div>
                ))}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
