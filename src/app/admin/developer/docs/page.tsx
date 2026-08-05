
'use client';

import { 
  FileText, 
  Key, 
  Webhook as WebhookIcon, 
  Code, 
  Terminal, 
  ArrowRight,
  BookOpen,
  Copy,
  ChevronLeft,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export default function DeveloperDocsPage() {
  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم نسخ الكود" });
  };

  const API_EXAMPLE = `curl -X GET "https://api.platform.store/v1/products" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;

  const WEBHOOK_EXAMPLE = `{
  "id": "evt_123456789",
  "event": "order.created",
  "created_at": 1712345678,
  "data": {
    "order_number": "MMA-99823",
    "total": 150000,
    "customer": "علي محمد"
  }
}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900">مركز المطورين (API Docs)</h1>
          <p className="text-muted-foreground font-medium">كل ما تحتاجه للربط البرمجي وبناء تطبيقات مخصصة لمتجرك.</p>
        </div>
        <Link href="/admin/developer/api-keys">
           <Button variant="outline" className="rounded-xl border-2 font-bold h-11 gap-2">
             <Key className="h-4 w-4" /> إدارة المفاتيح
           </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-[32px] border p-6 shadow-sm sticky top-24">
              <h3 className="font-black text-sm uppercase tracking-widest text-slate-400 mb-6">محتويات الدليل</h3>
              <nav className="flex flex-col gap-2">
                 {[
                   { label: 'المصادقة (Auth)', icon: ShieldCheck },
                   { label: 'المنتجات (Products)', icon: Globe },
                   { label: 'الطلبات (Orders)', icon: FileText },
                   { label: 'تنبيهات Webhooks', icon: WebhookIcon },
                   { label: 'حدود الاستخدام', icon: Zap }
                 ].map((item, i) => (
                   <button key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-right transition-colors group">
                      <item.icon className="h-4 w-4 opacity-30 group-hover:text-primary transition-all" />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{item.label}</span>
                   </button>
                 ))}
              </nav>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
           <Tabs defaultValue="api" className="space-y-8">
              <TabsList className="bg-white p-1.5 rounded-2xl h-14 border shadow-sm w-fit">
                 <TabsTrigger value="api" className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-primary data-[state=active]:text-white">واجهة الـ API</TabsTrigger>
                 <TabsTrigger value="webhooks" className="rounded-xl px-8 font-black text-sm data-[state=active]:bg-primary data-[state=active]:text-white">الـ Webhooks</TabsTrigger>
              </TabsList>

              <TabsContent value="api" className="space-y-8 animate-in slide-in-from-bottom-4">
                 <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-10 border-b">
                       <CardTitle className="text-2xl font-black flex items-center gap-3"><ShieldCheck className="h-7 w-7 text-primary" /> المصادقة (Authentication)</CardTitle>
                       <CardDescription className="text-base font-medium">يتم استخدام مفاتيح API الخاصة بك للمصادقة على طلبات الـ HTTP.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                       <p className="text-slate-600 leading-relaxed font-medium">
                          يجب إرسال مفتاح الـ API الخاص بك في ترويسة (Header) الطلب تحت مسمى <code className="bg-muted px-2 py-0.5 rounded font-black text-primary">Authorization</code> مسبوقاً بكلمة <code className="font-bold">Bearer</code>.
                       </p>
                       <div className="relative group">
                          <pre className="bg-slate-900 text-emerald-400 p-8 rounded-[32px] font-mono text-xs overflow-x-auto shadow-2xl" dir="ltr">
                             {API_EXAMPLE}
                          </pre>
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="absolute top-4 right-4 h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyCode(API_EXAMPLE)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                       </div>
                    </CardContent>
                 </Card>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="rounded-[32px] border-none shadow-sm bg-white p-8 space-y-4">
                       <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Terminal className="h-6 w-6" /></div>
                       <h3 className="text-xl font-black">Endpoints المتاحة</h3>
                       <ul className="space-y-4">
                          {['GET /products', 'POST /orders', 'GET /customers'].map(route => (
                            <li key={route} className="flex items-center justify-between border-b pb-2">
                               <code className="text-[11px] font-black text-primary">{route}</code>
                               <span className="text-[10px] font-bold text-muted-foreground">Standard REST</span>
                            </li>
                          ))}
                       </ul>
                    </Card>
                    <Card className="rounded-[32px] border-none shadow-sm bg-white p-8 space-y-4">
                       <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center"><Zap className="h-6 w-6" /></div>
                       <h3 className="text-xl font-black">حدود الطلبات</h3>
                       <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                          لضمان استقرار المنصة، يتم تحديد عدد الطلبات بـ <span className="font-black text-slate-800">100 طلب في الدقيقة</span> لكل مفتاح API. يمكنك الترقية لزيادة هذا الحد.
                       </p>
                    </Card>
                 </div>
              </TabsContent>

              <TabsContent value="webhooks" className="space-y-8 animate-in slide-in-from-bottom-4">
                 <Card className="rounded-[40px] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="p-10 border-b">
                       <CardTitle className="text-2xl font-black flex items-center gap-3"><WebhookIcon className="h-7 w-7 text-primary" /> هيكلية البيانات (Payload)</CardTitle>
                       <CardDescription className="text-base font-medium">عند حدوث أي حدث، سنرسل طلب POST بصيغة JSON إلى رابطك.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                       <p className="text-slate-600 font-medium">مثال لبيانات حدث <code className="text-primary font-black">order.created</code>:</p>
                       <div className="relative group">
                          <pre className="bg-slate-900 text-blue-300 p-8 rounded-[32px] font-mono text-xs overflow-x-auto shadow-2xl" dir="ltr">
                             {WEBHOOK_EXAMPLE}
                          </pre>
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="absolute top-4 right-4 h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => copyCode(WEBHOOK_EXAMPLE)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                       </div>
                    </CardContent>
                 </Card>
              </TabsContent>
           </Tabs>
        </div>
      </div>
    </div>
  );
}
