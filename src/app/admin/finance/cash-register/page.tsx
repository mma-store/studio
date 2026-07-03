
'use client';

import { useState, useMemo } from "react";
import { 
  Calculator, 
  History, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle,
  BadgeDollarSign,
  Loader2,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, limit, addDoc, doc, updateDoc, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function CashRegisterPage() {
  const db = useFirestore();
  const { profile } = useUser();
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [amount, setAmount] = useState(0);

  const shiftsQuery = useMemo(() => query(collection(db, 'cashShifts'), orderBy('openingTime', 'desc'), limit(10)), [db]);
  const { data: shifts, loading } = useCollection(shiftsQuery);

  const activeShift = shifts.find(s => s.status === 'open');

  const handleOpenShift = async () => {
    setIsOpening(true);
    try {
      await addDoc(collection(db, 'cashShifts'), {
        openingBalance: Number(amount),
        openingTime: Date.now(),
        openedBy: profile?.displayName || "مدير",
        status: 'open',
        expectedBalance: Number(amount)
      });
      toast({ title: "تم فتح الصندوق", description: "يمكنك الآن بدء عمليات البيع." });
      setAmount(0);
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل فتح الصندوق." });
    } finally {
      setIsOpening(false);
    }
  };

  const handleCloseShift = async () => {
    if (!activeShift) return;
    setIsClosing(true);
    try {
      await updateDoc(doc(db, 'cashShifts', activeShift.id), {
        actualBalance: Number(amount),
        closingTime: Date.now(),
        closedBy: profile?.displayName || "مدير",
        status: 'closed',
        difference: Number(amount) - (activeShift.expectedBalance || 0)
      });
      toast({ title: "تم إغلاق الصندوق", description: "تم إنهاء الوردية بنجاح." });
      setAmount(0);
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ" });
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black">الصندوق اليومي (جرد الوردية)</h1>
        <p className="text-muted-foreground font-medium">مراقبة حركة النقد الفعلي في المجمع ومطابقة الأرصدة.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          {!activeShift ? (
            <Card className="rounded-[40px] border-none shadow-xl bg-primary text-white p-8 space-y-6">
               <div className="h-16 w-16 rounded-3xl bg-white/20 flex items-center justify-center">
                  <Unlock className="h-8 w-8" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-black">فتح صندوق جديد</h3>
                  <p className="text-sm opacity-80 font-medium">أدخل المبلغ النقدي المتوفر حالياً في الدرج لبدء اليومية.</p>
               </div>
               <div className="space-y-4">
                  <Label className="text-xs font-black uppercase opacity-60">رصيد الافتتاح</Label>
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="h-16 rounded-2xl bg-white/10 border-none text-2xl font-black text-white text-center focus-visible:ring-white"
                  />
                  <Button 
                    onClick={handleOpenShift} 
                    disabled={isOpening}
                    className="w-full h-16 rounded-3xl bg-white text-primary hover:bg-white/90 text-xl font-black shadow-2xl"
                  >
                    {isOpening ? <Loader2 className="h-6 w-6 animate-spin" /> : "بدء الوردية الآن"}
                  </Button>
               </div>
            </Card>
          ) : (
            <Card className="rounded-[40px] border-none shadow-xl bg-slate-900 text-white p-8 space-y-6">
               <div className="flex items-center justify-between">
                  <div className="h-16 w-16 rounded-3xl bg-primary flex items-center justify-center shadow-lg">
                    <Lock className="h-8 w-8" />
                  </div>
                  <BadgeDollarSign className="h-10 w-10 opacity-10" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-black">إغلاق الصندوق</h3>
                  <p className="text-sm opacity-60 font-medium">يجب عد النقد الفعلي في الدرج وإدخاله هنا للمطابقة.</p>
               </div>
               <div className="bg-white/5 p-5 rounded-3xl border border-white/10 space-y-3">
                  <div className="flex justify-between text-xs opacity-60 font-bold"><span>رصيد الافتتاح:</span><span>{activeShift.openingBalance?.toLocaleString()} د.ع</span></div>
                  <div className="flex justify-between text-lg font-black text-primary"><span>المتوقع حالياً:</span><span>{activeShift.expectedBalance?.toLocaleString()} د.ع</span></div>
               </div>
               <div className="space-y-4">
                  <Label className="text-xs font-black uppercase opacity-60">النقد الفعلي (المعدود)</Label>
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="h-16 rounded-2xl bg-white/10 border-none text-2xl font-black text-white text-center"
                  />
                  <Button 
                    onClick={handleCloseShift} 
                    disabled={isClosing}
                    className="w-full h-16 rounded-3xl bg-red-600 hover:bg-red-700 text-white text-xl font-black shadow-2xl"
                  >
                    {isClosing ? <Loader2 className="h-6 w-6 animate-spin" /> : "إغلاق اليومية وجرد النقد"}
                  </Button>
               </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
           <Card className="rounded-[32px] border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30"><CardTitle className="text-lg font-black flex items-center gap-2"><History className="h-5 w-5" /> سجل الورديات السابقة</CardTitle></CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y">
                    {shifts.map((s: any) => (
                      <div key={s.id} className="p-6 flex items-center justify-between hover:bg-muted/10 transition-colors">
                         <div className="flex items-center gap-4">
                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", s.status === 'open' ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500")}>
                               {s.status === 'open' ? <CheckCircle2 className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                            </div>
                            <div>
                               <p className="text-sm font-black">{new Date(s.openingTime).toLocaleDateString("ar-EG")}</p>
                               <p className="text-[10px] text-muted-foreground font-bold">بواسطة: {s.openedBy}</p>
                            </div>
                         </div>
                         <div className="text-left">
                            {s.status === 'closed' ? (
                               <div className="space-y-1">
                                  <p className="text-sm font-black">{s.actualBalance?.toLocaleString()} د.ع</p>
                                  <p className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full inline-block", s.difference === 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                     {s.difference === 0 ? "مطابق" : `فرق: ${s.difference?.toLocaleString()} د.ع`}
                                  </p>
                               </div>
                            ) : (
                               <p className="text-xs font-black text-green-600 flex items-center gap-1"><Unlock className="h-3 w-3" /> وردية مفتوحة</p>
                            )}
                         </div>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
