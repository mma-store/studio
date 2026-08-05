
'use client';

import { useState, useMemo } from "react";
import { 
  Puzzle, 
  CheckCircle2, 
  Zap, 
  Settings, 
  ExternalLink, 
  CreditCard, 
  Truck, 
  MessageSquare, 
  Globe, 
  ShieldCheck,
  Loader2,
  Lock,
  ArrowUpRight,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, where, doc, setDoc, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { cn } from "@/lib/utils";

const categoryMap: any = {
  payments: { label: "المدفوعات", icon: CreditCard, color: "text-emerald-600 bg-emerald-50" },
  delivery: { label: "التوصيل والشحن", icon: Truck, color: "text-blue-600 bg-blue-50" },
  messaging: { label: "المراسلة والتنبيهات", icon: MessageSquare, color: "text-purple-600 bg-purple-50" },
  ai: { label: "الذكاء الاصطناعي", icon: Zap, color: "text-orange-600 bg-orange-50" },
  accounting: { label: "المحاسبة", icon: Globe, color: "text-indigo-600 bg-indigo-50" },
};

export default function MerchantIntegrationsPage() {
  const db = useFirestore();
  const { tenantId } = useUser();
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get all active global integrations
  const { data: globalIntegrations, loading: globalLoading } = useCollection(
    query(collection(db, 'integrations'), where('enabled', '==', true), orderBy('name'))
  );

  // Get tenant-specific integrations
  const { data: tenantIntegrations, loading: tenantLoading } = useCollection(
    tenantId ? query(collection(db, 'tenantIntegrations'), where('tenantId', '==', tenantId)) : null
  );

  const handleConnect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedIntegration || !tenantId) return;

    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const config: any = {};
    selectedIntegration.requiredConfiguration?.forEach((field: string) => {
      config[field] = formData.get(field);
    });

    try {
      const integrationId = selectedIntegration.id;
      const docId = `${tenantId}_${integrationId}`;
      
      await setDoc(doc(db, 'tenantIntegrations', docId), {
        tenantId,
        integrationId,
        enabled: true,
        configuration: config,
        connectedAt: Date.now(),
        status: 'connected'
      }, { merge: true });

      toast({ title: "تم الربط بنجاح", description: `متجرك الآن مرتبط بـ ${selectedIntegration.name}` });
      setIsConfiguring(false);
      setSelectedIntegration(null);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الربط" });
    } finally {
      setIsSaving(false);
    }
  };

  const isConnected = (id: string) => {
    return tenantIntegrations.some(ti => ti.integrationId === id && ti.enabled);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900">الربط والتكامل (Integrations)</h1>
        <p className="text-muted-foreground font-medium">اربط متجرك بأدوات الطرف الثالث لتعزيز المبيعات والأتمتة.</p>
      </div>

      {globalLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-[32px]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {globalIntegrations.map((int: any) => {
             const Cat = categoryMap[int.category] || { label: int.category, icon: Puzzle, color: "bg-slate-50" };
             const connected = isConnected(int.id);
             
             return (
               <Card key={int.id} className="rounded-[40px] border-none shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden bg-white flex flex-col">
                  <CardHeader className="p-8 pb-4">
                     <div className="flex items-center justify-between mb-6">
                        <div className={cn("h-16 w-16 rounded-[24px] flex items-center justify-center shadow-inner relative overflow-hidden", Cat.color)}>
                           {int.logo ? <Image src={int.logo} alt={int.name} fill className="object-contain p-3" /> : <Puzzle className="h-8 w-8" />}
                        </div>
                        <Badge className={cn(
                          "rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest border-none",
                          connected ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"
                        )}>
                           {connected ? "متصل" : "غير نشط"}
                        </Badge>
                     </div>
                     <div className="space-y-2">
                        <CardTitle className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">{int.name}</CardTitle>
                        <CardDescription className="font-bold text-xs flex items-center gap-2">
                           <Cat.icon className="h-3 w-3" /> {Cat.label}
                        </CardDescription>
                     </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between gap-6">
                     <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-3">
                        {int.description}
                     </p>
                     <div className="pt-4 flex gap-2">
                        <Button 
                          onClick={() => { setSelectedIntegration(int); setIsConfiguring(true); }}
                          className={cn(
                            "flex-1 rounded-2xl h-12 font-black gap-2 transition-all",
                            connected ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-primary text-white shadow-lg"
                          )}
                        >
                           {connected ? <Settings className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                           {connected ? "الإعدادات" : "ربط الخدمة"}
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 bg-slate-50"><ExternalLink className="h-4 w-4" /></Button>
                     </div>
                  </CardContent>
               </Card>
             );
           })}
        </div>
      )}

      {/* Configuration Dialog */}
      <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
         <DialogContent className="rounded-[40px] max-w-lg p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-8 bg-slate-900 text-white space-y-2">
               <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center mb-2">
                  <Puzzle className="h-8 w-8 text-primary" />
               </div>
               <DialogTitle className="text-2xl font-black">إعدادات {selectedIntegration?.name}</DialogTitle>
               <DialogDescription className="text-slate-400 font-bold">يرجى إدخال مفاتيح الربط الخاصة بالخدمة لتفعيل التكامل.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleConnect} className="p-8 space-y-6 text-right">
               {selectedIntegration?.requiredConfiguration?.map((field: string) => (
                 <div key={field} className="space-y-2">
                    <Label className="font-black text-xs uppercase tracking-widest opacity-60">{field.replace(/_/g, ' ')}</Label>
                    <Input 
                      name={field} 
                      required 
                      defaultValue={tenantIntegrations.find(ti => ti.integrationId === selectedIntegration.id)?.configuration?.[field]}
                      className="h-14 rounded-2xl bg-muted/30 border-none px-6 font-mono text-xs" 
                    />
                 </div>
               ))}
               
               <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
                  <Lock className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                     يتم تشفير هذه البيانات وتخزينها بأمان في خوادمنا السحابية. لا تظهر هذه المفاتيح لأي شخص آخر.
                  </p>
               </div>

               <DialogFooter className="pt-4">
                  <Button disabled={isSaving} type="submit" className="w-full h-16 rounded-[24px] font-black text-lg gap-2 shadow-2xl">
                     {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
                     حفظ وتفعيل التكامل
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
    </div>
  );
}
