
'use client';

import { 
  ChevronRight, 
  Wrench, 
  Clock, 
  User, 
  Bike, 
  ClipboardList, 
  Package, 
  BadgeDollarSign, 
  Printer, 
  MessageCircle,
  Save,
  Search,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Settings2,
  Zap,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { useFirestore, useDoc, useCollection } from "@/firebase";
import { doc, updateDoc, collection, query, serverTimestamp } from "firebase/firestore";
import { useMemo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { workshopDiagnosisAssistant } from "@/ai/flows/workshop-diagnosis-assistant";

export default function RepairOrderDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const db = useFirestore();
  
  const orderRef = useMemo(() => id && id !== 'default' ? doc(db, 'repairOrders', id) : null, [db, id]);
  const { data: order, loading } = useDoc<any>(orderRef);
  
  const [laborCost, setLaborCost] = useState(0);
  const [usedParts, setUsedParts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<any>(null);

  const inventoryQuery = useMemo(() => query(collection(db, 'products')), [db]);
  const { data: products } = useCollection(inventoryQuery);

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode?.includes(searchTerm)
  ).slice(0, 5);

  useEffect(() => {
    if (order) {
      setLaborCost(order.laborCost || 0);
      setUsedParts(order.partsUsed || []);
    }
  }, [order]);

  const subtotalParts = usedParts.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  const total = subtotalParts + Number(laborCost);

  const addPart = (product: any) => {
    if (usedParts.find(p => p.productId === product.id)) {
       toast({ title: "موجود مسبقاً", description: "هذه القطعة مضافة بالفعل للفاتورة." });
       return;
    }
    setUsedParts([...usedParts, {
      productId: product.id,
      name: product.name,
      price: product.retailPrice,
      quantity: 1
    }]);
    setSearchTerm("");
  };

  const handleAiDiagnosis = async () => {
    if (!order?.problemDescription) return;
    setAiLoading(true);
    try {
      const result = await workshopDiagnosisAssistant({ symptomsDescription: order.problemDescription });
      setAiDiagnosis(result.diagnoses);
      toast({ title: "اكتمل التشخيص", description: "قام الذكاء الاصطناعي بتحليل الأعطال." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل استدعاء مساعد الذكاء الاصطناعي." });
    } finally {
      setAiLoading(false);
    }
  };

  const removePart = (productId: string) => {
    setUsedParts(usedParts.filter(p => p.productId !== productId));
  };

  const updateStatus = async (newStatus: string) => {
    if (!orderRef) return;
    try {
      await updateDoc(orderRef, { status: newStatus, updatedAt: serverTimestamp() });
      toast({ title: "تم التحديث", description: "تم تغيير حالة المهمة بنجاح." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل تحديث الحالة." });
    }
  };

  const saveInvoice = async () => {
    if (!orderRef) return;
    setIsSaving(true);
    try {
      await updateDoc(orderRef, {
        partsUsed: usedParts,
        laborCost: Number(laborCost),
        totalAmount: total,
        updatedAt: serverTimestamp()
      });
      toast({ title: "تم الحفظ", description: "تم حفظ بيانات التكاليف والفاتورة." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ البيانات." });
    } finally {
      setIsSaving(false);
    }
  };

  const notifyCustomer = () => {
    if (!order) return;
    const statusLabels: any = {
      received: "تم الاستلام",
      inspection: "قيد الفحص",
      waiting_parts: "انتظار قطع",
      in_progress: "قيد التصليح",
      quality_check: "فحص الجودة",
      ready: "جاهز للاستلام",
      delivered: "تم التسليم",
      cancelled: "ملغي"
    };
    const statusLabel = statusLabels[order.status] || order.status;
    const message = `مرحباً ${order.customerName}،\nنود إعلامكم بأن حالة دراجتكم (${order.bikeBrand} ${order.bikeModel}) تحت رقم الطلب ${order.orderNumber} هي الآن: *${statusLabel}*.\nالمبلغ الكلي حتى الآن: ${total.toLocaleString()} د.ع.\nشكراً لتعاملكم مع مجمع محمد علاء.`;
    
    window.open(`https://wa.me/${order.phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading && id !== 'default') return <div className="p-8"><Skeleton className="h-[600px] rounded-[32px]" /></div>;
  if (!order && id !== 'default') return <div className="p-8 text-center font-bold">لم يتم العثور على أمر التصليح.</div>;

  const statusConfig: any = {
    received: { label: "تم الاستلام", color: "bg-blue-100 text-blue-700 border-blue-200" },
    inspection: { label: "قيد الفحص", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    waiting_parts: { label: "انتظار قطع", color: "bg-orange-100 text-orange-700 border-orange-200" },
    in_progress: { label: "قيد التصليح", color: "bg-purple-100 text-purple-700 border-purple-200" },
    quality_check: { label: "فحص الجودة", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    ready: { label: "جاهز للاستلام", color: "bg-green-100 text-green-700 border-green-200" },
    delivered: { label: "تم التسليم", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    cancelled: { label: "ملغي", color: "bg-red-100 text-red-700 border-red-200" },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
           <Link href="/admin/workshop">
              <Button variant="ghost" size="icon" className="rounded-xl bg-white shadow-sm">
                <ChevronRight className="h-5 w-5 rotate-180" />
              </Button>
           </Link>
           <div>
              {order ? (
                <>
                  <div className="flex items-center gap-2">
                     <h1 className="text-2xl font-black">{order.orderNumber}</h1>
                     <Badge className={cn("rounded-full px-3 py-1 font-bold text-[10px]", statusConfig[order.status]?.color)}>
                        {statusConfig[order.status]?.label}
                     </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">آخر تحديث: {order.updatedAt ? new Date(order.updatedAt).toLocaleString("ar-EG") : 'غير محدد'}</p>
                </>
              ) : <Skeleton className="h-8 w-48" />}
           </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <Button variant="outline" className="rounded-xl border-2 font-bold h-11 gap-2 bg-purple-50 text-purple-700 border-purple-100" onClick={handleAiDiagnosis} disabled={aiLoading || !order}>
             {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} تشخيص بالذكاء الاصطناعي
           </Button>
           <Button variant="outline" className="rounded-xl border-2 font-bold h-11 gap-2" onClick={notifyCustomer} disabled={!order}>
             <MessageCircle className="h-5 w-5 text-emerald-600" /> إبلاغ العميل
           </Button>
           <Button className="rounded-xl font-bold h-11 shadow-lg shadow-primary/20 gap-2 px-8" onClick={saveInvoice} disabled={isSaving || !order}>
             <Save className="h-5 w-5" /> {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
           </Button>
        </div>
      </div>

      {aiDiagnosis && (
        <Card className="rounded-[32px] border-none shadow-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-8 relative overflow-hidden">
           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                 <Zap className="h-8 w-8 text-yellow-400 fill-current" />
                 <h2 className="text-2xl font-black">تشخيص الـ AI المقترح</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {aiDiagnosis.map((d: any, i: number) => (
                   <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-3">
                      <h3 className="font-black text-lg underline decoration-yellow-400 underline-offset-8">{d.diagnosis}</h3>
                      <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase opacity-60">الأسباب المحتملة:</p>
                         <ul className="text-xs space-y-1 opacity-90 list-disc list-inside">
                           {d.commonCauses.map((c: string, idx: number) => <li key={idx}>{c}</li>)}
                         </ul>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase opacity-60">خطوات الحل:</p>
                         <ul className="text-xs space-y-1 opacity-90 list-decimal list-inside">
                           {d.troubleshootingSteps.map((s: string, idx: number) => <li key={idx}>{s}</li>)}
                         </ul>
                      </div>
                   </div>
                 ))}
              </div>
              <Button variant="secondary" className="rounded-full font-black px-10" onClick={() => setAiDiagnosis(null)}>إخفاء التشخيص</Button>
           </div>
           <Zap className="absolute -right-10 -bottom-10 h-64 w-64 opacity-5" />
        </Card>
      )}

      {order && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
             <Card className="rounded-[32px] border-none shadow-sm">
                <CardHeader>
                   <CardTitle className="text-lg font-black flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" /> العميل والدراجة
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="p-4 rounded-2xl bg-muted/30 space-y-3">
                      <div className="flex justify-between">
                         <span className="text-xs text-muted-foreground font-bold">الاسم:</span>
                         <span className="text-sm font-black">{order.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-xs text-muted-foreground font-bold">الهاتف:</span>
                         <span className="text-sm font-black text-left" dir="ltr">{order.phoneNumber}</span>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Bike className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-sm font-black">{order.bikeBrand} {order.bikeModel}</p>
                            <p className="text-[10px] text-muted-foreground font-bold">{order.plateNumber} | {order.bikeColor}</p>
                         </div>
                      </div>
                      <div className="p-4 rounded-2xl border-2 border-dashed border-muted-foreground/10 space-y-2">
                         <p className="text-xs font-black flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" /> وصف المشكلة:
                         </p>
                         <p className="text-xs text-muted-foreground leading-relaxed">{order.problemDescription}</p>
                      </div>
                   </div>
                </CardContent>
             </Card>

             <Card className="rounded-[32px] border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30">
                   <CardTitle className="text-lg font-black flex items-center gap-2">
                      <Settings2 className="h-5 w-5 text-primary" /> تحديث حالة المهمة
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="flex flex-col">
                      {Object.entries(statusConfig).map(([key, config]: [string, any]) => (
                        <button 
                          key={key}
                          onClick={() => updateStatus(key)}
                          className={cn(
                            "flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b last:border-0",
                            order.status === key ? "bg-primary/5 border-primary/20" : "opacity-60"
                          )}
                        >
                           <div className="flex items-center gap-3">
                              <div className={cn("h-3 w-3 rounded-full", config.color.split(' ')[0])} />
                              <span className="text-sm font-bold">{config.label}</span>
                           </div>
                           {order.status === key && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </button>
                      ))}
                   </div>
                </CardContent>
             </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
             <Card className="rounded-[32px] border-none shadow-sm min-h-[400px]">
                <CardHeader className="flex flex-row items-center justify-between">
                   <div className="space-y-1">
                      <CardTitle className="text-lg font-black flex items-center gap-2">
                         <Package className="h-5 w-5 text-primary" /> قطع الغيار المستخدمة
                      </CardTitle>
                      <CardDescription className="font-medium text-xs">إضافة قطع من المخزون مباشرة للطلب.</CardDescription>
                   </div>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="relative">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="ابحث عن قطعة غيار لإضافتها (الاسم أو الباركود)..." 
                        className="h-14 rounded-2xl pr-12 bg-muted/20 border-none shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-card rounded-2xl shadow-xl border z-50 p-2 space-y-1">
                           {filteredProducts.map(p => (
                             <button 
                              key={p.id}
                              onClick={() => addPart(p)}
                              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors text-right"
                             >
                                <div className="flex items-center gap-3">
                                   <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-black text-xs">
                                      {p.name?.[0]}
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold">{p.name}</p>
                                      <p className="text-[10px] text-muted-foreground">{p.barcode}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <span className="text-sm font-black text-primary">{p.retailPrice?.toLocaleString()} د.ع</span>
                                   <Badge variant="outline" className="rounded-full text-[8px]">{p.stock} متوفر</Badge>
                                </div>
                             </button>
                           ))}
                        </div>
                      )}
                   </div>

                   <div className="space-y-3">
                      {usedParts.length > 0 ? (
                        usedParts.map((part) => (
                          <div key={part.productId} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/20 transition-all">
                             <div className="flex items-center gap-4">
                                <span className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-xs font-black shadow-sm">{part.quantity}x</span>
                                <span className="text-sm font-bold">{part.name}</span>
                             </div>
                             <div className="flex items-center gap-4">
                                <span className="text-sm font-black">{ (part.price * part.quantity).toLocaleString() } د.ع</span>
                                <button onClick={() => removePart(part.productId)} className="text-destructive hover:bg-destructive/10 p-2 rounded-xl transition-colors">
                                   <Trash2 className="h-4 w-4" />
                                </button>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-32 flex flex-col items-center justify-center text-muted-foreground opacity-30 gap-2">
                           <Package className="h-12 w-12" />
                           <p className="font-bold">لم يتم إضافة أي قطع بعد</p>
                        </div>
                      )}
                   </div>
                </CardContent>
             </Card>

             <Card className="rounded-[32px] border-none shadow-sm bg-primary/5 border-2 border-primary/10 overflow-hidden">
                <CardHeader>
                   <CardTitle className="text-lg font-black flex items-center gap-2">
                      <BadgeDollarSign className="h-5 w-5 text-primary" /> تفاصيل التكلفة
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <Label className="font-bold">أجور اليد (Labor Cost)</Label>
                         <div className="relative">
                            <Input 
                              type="number" 
                              value={laborCost}
                              onChange={(e) => setLaborCost(Number(e.target.value))}
                              className="h-14 rounded-2xl text-2xl font-black bg-white border-none shadow-sm pr-6" 
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">د.ع</span>
                         </div>
                         <p className="text-[10px] text-muted-foreground font-medium">تشمل أجور الفحص والتصليح والتنظيف.</p>
                      </div>

                      <div className="bg-white dark:bg-card p-6 rounded-3xl shadow-sm space-y-4">
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-medium">مجموع القطع:</span>
                            <span className="font-bold">{subtotalParts.toLocaleString()} د.ع</span>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground font-medium">أجور العمل:</span>
                            <span className="font-bold">{Number(laborCost).toLocaleString()} د.ع</span>
                         </div>
                         <div className="h-px bg-muted" />
                         <div className="flex items-center justify-between">
                            <span className="text-lg font-black">الإجمالي:</span>
                            <span className="text-3xl font-black text-primary underline decoration-primary/20 underline-offset-8">
                               {total.toLocaleString()} <span className="text-sm">د.ع</span>
                            </span>
                         </div>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}
