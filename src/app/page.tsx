
'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Rocket, 
  ArrowRight,
  Zap, 
  ShieldCheck,
  Globe,
  ScrollText,
  History,
  Monitor,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default function DubsarLandingPage() {
  const router = useRouter();
  const [isTauri, setIsTauri] = useState(false);
  const [checkingEnv, setCheckingEnv] = useState(true);

  useEffect(() => {
    // التحقق هل نحن في بيئة Tauri Desktop
    const checkTauri = () => {
      const isDesktop = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__;
      setIsTauri(!!isDesktop);
      
      if (isDesktop) {
        // إذا كان تطبيق مكتبي، توجه فوراً لصفحة الدخول المحلية
        router.replace('/login');
      } else {
        setCheckingEnv(false);
      }
    };

    checkTauri();
  }, [router]);

  if (checkingEnv) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FDF8F5] gap-4">
        <div className="h-16 w-16 bg-primary rounded-3xl flex items-center justify-center text-white animate-bounce shadow-2xl">
          <ScrollText className="h-10 w-10" />
        </div>
        <div className="text-center space-y-2">
          <p className="font-black text-primary text-xl">DUBSAR 2.0</p>
          <p className="text-muted-foreground text-xs font-bold animate-pulse">Initializing Desktop Core...</p>
        </div>
      </div>
    );
  }

  // واجهة الويب العامة (تظهر فقط في المتصفح)
  return (
    <div className="min-h-screen bg-[#FDF8F5] text-slate-900 font-almarai selection:bg-primary/10 overflow-x-hidden" dir="rtl">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-primary/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
              <ScrollText className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-primary">دوبسار <span className="text-secondary">DUBSAR</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" className="font-bold rounded-xl">دخول</Button></Link>
            <Link href="/onboarding"><Button className="rounded-xl font-black shadow-lg">ابدأ الآن</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-32 text-center space-y-12">
        <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
          <History className="h-4 w-4" />
          <span className="text-xs font-black uppercase">أول من دوّن التجارة.. واليوم أول من يقودها سحابياً ومحلياً</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-primary leading-tight">
          مستقبل الإدارة <br /> بين يديك <span className="text-secondary">محلياً</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-3xl mx-auto font-medium">
          دوبسار 2.0: النظام المكتبي الأول الذي يعمل بدون إنترنت مع إمكانية الربط السحابي الاختياري.
        </p>
        <div className="flex justify-center gap-6">
          <Link href="/onboarding">
            <Button className="h-16 px-12 rounded-2xl text-xl font-black shadow-2xl bg-primary hover:bg-primary/90">تأسيس متجر سحابي</Button>
          </Link>
          <Button variant="outline" className="h-16 px-12 rounded-2xl text-xl font-black border-2 gap-3">
            <Monitor className="h-6 w-6" /> تحميل نسخة الويندوز
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "عمل أوفلاين كامل", desc: "النظام يعمل 100% بدون إنترنت، بياناتك في جهازك دائماً.", icon: Zap, color: "bg-blue-500" },
            { title: "قاعدة بيانات SQLite", desc: "أداء فائق وسرعة في البحث والجرد باستخدام تقنيات المكتبي.", icon: Monitor, color: "bg-emerald-500" },
            { title: "ترخيص لمرة واحدة", desc: "تملك البرنامج للأبد بدون اشتراكات شهرية إجبارية.", icon: ShieldCheck, color: "bg-purple-500" }
          ].map((f, i) => (
            <Card key={i} className="p-10 rounded-[40px] border-none shadow-sm hover:shadow-xl transition-all">
              <div className={`h-14 w-14 rounded-2xl ${f.color} text-white flex items-center justify-center mb-6 shadow-lg`}>
                <f.icon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-primary mb-4">{f.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
