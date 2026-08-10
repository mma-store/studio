'use client';

import { 
  Rocket, 
  Store, 
  Package, 
  Monitor, 
  BarChart3, 
  Check, 
  ArrowRight,
  Zap, 
  ShieldCheck,
  Globe,
  LayoutDashboard,
  MessageCircle,
  Smartphone,
  CreditCard,
  ShoppingCart,
  Star,
  ScrollText,
  Tablet,
  History,
  Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DubsarLandingPage() {
  const db = useFirestore();

  const plansQuery = useMemo(() => query(
    collection(db, 'plans'), 
    where('active', '==', true),
    orderBy('displayOrder', 'asc')
  ), [db]);
  const { data: plans, loading: plansLoading } = useCollection(plansQuery);

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-slate-900 font-almarai selection:bg-primary/10 overflow-x-hidden" dir="rtl">
      
      {/* Dubsar Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-primary/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                <ScrollText className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-primary">دوبسار <span className="text-secondary">DUBSAR</span></span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10 text-sm font-black text-slate-600">
            <a href="#heritage" className="hover:text-primary transition-colors">عن دوبسار</a>
            <a href="#features" className="hover:text-primary transition-colors">المميزات</a>
            <a href="#pricing" className="hover:text-primary transition-colors">الأسعار</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-bold text-sm text-slate-700 hover:bg-slate-50 rounded-xl px-6">دخول التجار</Button>
            </Link>
            <Link href="/onboarding">
              <Button className="rounded-xl font-black shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white px-8 h-11">أنشئ متجرك</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Heritage Meets Cloud */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <History className="h-4 w-4" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">أول من دوّن التجارة.. واليوم أول من يقودها سحابياً</span>
          </div>
          
          <div className="space-y-8 max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-8xl font-black leading-[1.1] tracking-tight text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
              من ألواح بابل <br className="hidden md:block" /> إلى <span className="text-secondary italic">سحابة اليوم</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
              دوبسار هو المساعد الرقمي الذي تحتاجه لإدارة تجارتك. نظام واحد يجمع لك المتجر الإلكتروني، نقطة البيع، إدارة المخازن، والتقارير المالية بهوية بلاد الرافدين العريقة.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-16 px-14 rounded-2xl text-xl font-black shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 text-white gap-3 group">
                ابدأ رحلتك مع دوبسار <ArrowRight className="h-6 w-6 group-hover:-translate-x-1 transition-transform rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Heritage Section */}
      <section id="heritage" className="py-24 bg-white border-y border-primary/5">
        <div className="container mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 text-right">
                 <h2 className="text-4xl font-black text-primary">لماذا "دوبسار"؟</h2>
                 <div className="space-y-6">
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                       في حضارة بلاد الرافدين العريقة، كان **"دوبسار" (DUBSAR)** هو اللقب الذي يُطلق على الكاتب المتخصص في تدوين المعاملات التجارية والسجلات الرسمية على الألواح الطينية.
                    </p>
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                       منذ آلاف السنين، بدأت التجارة والتدوين من أرضنا. واليوم، نعيد إحياء هذا الدور بوسائل العصر الحديث؛ لنحول سجلاتك الورقية المتعبة إلى نظام سحابي متطور، آمن، وفائق السرعة.
                    </p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-secondary/5 border border-secondary/10">
                       <Tablet className="h-8 w-8 text-secondary mb-3" />
                       <h4 className="font-black text-primary mb-1">أصالة الجذور</h4>
                       <p className="text-xs font-bold text-slate-500">مستوحى من عراقة تدوين بابل وآشور.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                       <Zap className="h-8 w-8 text-primary mb-3" />
                       <h4 className="font-black text-primary mb-1">قوة السحاب</h4>
                       <p className="text-xs font-bold text-slate-500">أحدث تكنولوجيا الـ SaaS في العالم.</p>
                    </div>
                 </div>
              </div>
              <div className="relative aspect-square rounded-[48px] overflow-hidden bg-muted group shadow-2xl border-8 border-white">
                 <Image 
                  src="https://images.unsplash.com/photo-1599599810613-2d2c1626241a?auto=format&fit=crop&w=800&q=80" 
                  alt="Ancient Tablet History" 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale hover:grayscale-0"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-10">
                    <span className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">Heritage Concept</span>
                    <h3 className="text-white text-2xl font-black italic">"من الطين إلى السحاب.."</h3>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32">
         <div className="container mx-auto px-6 space-y-16">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
               <h2 className="text-4xl md:text-5xl font-black text-primary">نظام واحد، إمكانيات لا محدودة</h2>
               <p className="text-slate-500 font-medium">كل ما تحتاجه لإدارة متجرك، ورشتك، ومخازنك في مكان واحد.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { title: "نقطة بيع POS", desc: "واجهة بيع سريعة تدعم الباركود والطباعة الحرارية بكفاءة عالية.", icon: Monitor, color: "bg-blue-500" },
                 { title: "إدارة المخازن", desc: "تتبع دقيق للمخزون، تنبيهات النقص، وإدارة الموردين.", icon: Package, color: "bg-orange-500" },
                 { title: "الورشة الذكية", desc: "نظام خاص لورش الصيانة لمتابعة المهام وتبليغ العملاء آلياً.", icon: Wrench, color: "bg-purple-500" },
                 { title: "تقارير حية", desc: "تحليل ذكي للأرباح، المبيعات، والديون عبر لوحات تحكم تفاعلية.", icon: BarChart3, color: "bg-emerald-500" },
                 { title: "متجر إلكتروني", desc: "واجهة عرض لمنتجاتك تسمح للزبائن بالطلب المباشر عبر الإنترنت.", icon: Globe, color: "bg-indigo-500" },
                 { title: "منصة مطورين", desc: "إمكانية الربط البرمجي (API) والـ Webhooks لتوسيع نظامك.", icon: Languages, color: "bg-rose-500" }
               ].map((feature, i) => (
                 <Card key={i} className="rounded-[40px] border-none shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden bg-white p-10">
                    <div className={cn("h-16 w-16 rounded-3xl mb-8 flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform", feature.color)}>
                       <feature.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-black text-primary mb-4">{feature.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                 </Card>
               ))}
            </div>
         </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-primary/5">
        <div className="container mx-auto px-6 space-y-20">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
             <h2 className="text-4xl md:text-5xl font-black text-primary">خطط تناسب طموحاتك</h2>
             <p className="text-slate-500 font-medium">اختر الباقة المناسبة وابدأ في تدوين نجاحك اليوم.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
             {plansLoading ? (
               Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-[600px] rounded-[48px]" />)
             ) : plans.map((plan: any, i: number) => (
               <Card key={i} className={cn(
                 "rounded-[48px] border-none p-12 flex flex-col space-y-8 transition-all duration-500 hover:-translate-y-2",
                 plan.highlighted ? "bg-primary text-white scale-105 shadow-2xl relative z-10" : "bg-white border border-primary/5 text-primary shadow-sm"
               )}>
                 <div className="space-y-4">
                    <h3 className={cn("text-xs font-black uppercase tracking-widest opacity-70", plan.highlighted ? "text-accent" : "text-primary")}>{plan.name}</h3>
                    <div className="flex items-baseline gap-2">
                       <span className="text-5xl font-black">{plan.monthlyPrice === 0 ? "مجانية" : plan.monthlyPrice.toLocaleString()}</span>
                       {plan.monthlyPrice !== 0 && <span className="text-sm font-bold opacity-60">د.ع / شهر</span>}
                    </div>
                    <p className="text-sm font-medium opacity-80">{plan.description}</p>
                 </div>
                 <div className={cn("h-px", plan.highlighted ? "bg-white/10" : "bg-slate-100")} />
                 <ul className="flex-1 space-y-5">
                    {plan.features?.map((f: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-3 text-sm font-bold">
                        <div className={cn("h-5 w-5 rounded-full flex items-center justify-center", plan.highlighted ? "bg-accent/20 text-accent" : "bg-primary/10 text-primary")}>
                           <Check className="h-3 w-3" strokeWidth={3} />
                        </div>
                        {f}
                      </li>
                    ))}
                 </ul>
                 <Link href="/onboarding" className="w-full">
                   <Button className={cn(
                     "w-full h-16 rounded-[24px] font-black text-lg shadow-lg transition-all active:scale-95",
                     plan.highlighted ? "bg-secondary hover:bg-secondary/90 text-white" : "bg-primary hover:bg-primary/90 text-white"
                   )}>
                      {plan.monthlyPrice === 0 ? "ابدأ التجربة" : "اشترك الآن"}
                   </Button>
                 </Link>
               </Card>
             ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-24 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 bg-white/5 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto px-6 text-center space-y-12 relative z-10">
          <div className="flex flex-col items-center gap-4">
             <div className="h-16 w-16 bg-white rounded-3xl flex items-center justify-center text-primary shadow-2xl">
                <ScrollText className="h-10 w-10" />
             </div>
             <h2 className="text-3xl font-black tracking-tighter">دوبسار <span className="text-secondary">DUBSAR</span></h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm font-bold opacity-60">
             <a href="#" className="hover:text-secondary transition-colors">عن المنصة</a>
             <a href="#" className="hover:text-secondary transition-colors">الشروط والأحكام</a>
             <a href="#" className="hover:text-secondary transition-colors">سياسة الخصوصية</a>
             <a href="#" className="hover:text-secondary transition-colors">تواصل معنا</a>
          </div>

          <div className="h-px bg-white/10 max-w-4xl mx-auto" />
          
          <p className="text-sm font-medium opacity-40">جميع الحقوق محفوظة © {new Date().getFullYear()} دوبسار - سجل نجاحك معنا.</p>
        </div>
      </footer>
    </div>
  );
}

function Wrench(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}