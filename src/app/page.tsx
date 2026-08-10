
'use client';

import { 
  Rocket, 
  Store, 
  Package, 
  Monitor, 
  BarChart3, 
  Truck, 
  Users, 
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
  Star
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

const LOGO_URL = "https://up6.cc/2026/07/178308238964931.png";

export default function SaaSLandingPage() {
  const WHATSAPP_NUMBER = "9647858833838";
  const db = useFirestore();

  // Fetch dynamic plans from Firestore
  const plansQuery = useMemo(() => query(
    collection(db, 'plans'), 
    where('active', '==', true),
    orderBy('displayOrder', 'asc')
  ), [db]);
  const { data: plans, loading: plansLoading } = useCollection(plansQuery);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-almarai selection:bg-blue-100 overflow-x-hidden" dir="rtl">
      
      {/* Platform Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-36">
              <Image src={LOGO_URL} alt="Platform Logo" fill className="object-contain" />
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10 text-sm font-black text-slate-600">
            <a href="#features" className="hover:text-primary transition-colors">المميزات</a>
            <a href="#pricing" className="hover:text-primary transition-colors">الأسعار</a>
            <a href="#faq" className="hover:text-primary transition-colors">الأسئلة الشائعة</a>
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

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white">
        <div className="container mx-auto px-6 text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary/5 text-primary border border-primary/10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Zap className="h-4 w-4 fill-current" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">المنصة التجارية المتكاملة في العراق</span>
          </div>
          
          <div className="space-y-8 max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-8xl font-black leading-[1.1] tracking-tight text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
              حوّل نشاطك التجاري <br className="hidden md:block" /> إلى <span className="text-secondary italic">إمبراطورية سحابية</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
              نظام واحد يجمع لك المتجر الإلكتروني، نقطة البيع (POS)، إدارة المخازن، والتقارير المالية. ابدأ الآن وانضم لأكثر من 1,200 تاجر عراقي.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-16 px-14 rounded-2xl text-xl font-black shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 text-white gap-3 group">
                ابدأ تجربتك المجانية <ArrowRight className="h-6 w-6 group-hover:-translate-x-1 transition-transform rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-slate-50">
        <div className="container mx-auto px-6 space-y-20">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
             <h2 className="text-4xl md:text-5xl font-black text-primary">خطط اشتراك شفافة</h2>
             <p className="text-slate-500 font-medium">خطط صممت لتناسب نمو مشروعك، من البداية وحتى التوسع الكبير.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
             {plansLoading ? (
               Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-[600px] rounded-[48px]" />)
             ) : plans.map((plan: any, i: number) => (
               <Card key={i} className={cn(
                 "rounded-[48px] border-none p-12 flex flex-col space-y-8 transition-all duration-500",
                 plan.highlighted ? "bg-primary text-white scale-105 shadow-[0_40px_80px_rgba(10,25,47,0.25)] relative z-10" : "bg-white border border-slate-100 text-primary"
               )}>
                 <div className="space-y-4">
                    <h3 className={cn("text-xs font-black uppercase tracking-widest opacity-70", plan.highlighted ? "text-secondary" : "text-primary")}>{plan.name}</h3>
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
                        <div className={cn("h-5 w-5 rounded-full flex items-center justify-center", plan.highlighted ? "bg-secondary/20 text-secondary" : "bg-primary/10 text-primary")}>
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
      <footer className="bg-slate-900 text-slate-400 py-24 border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <div className="relative h-12 w-40 mx-auto mb-8">
            <Image src={LOGO_URL} alt="Platform Logo" fill className="object-contain brightness-0 invert opacity-60" />
          </div>
          <p className="text-sm font-medium opacity-40">جميع الحقوق محفوظة © {new Date().getFullYear()} مجمع محمد علاء</p>
        </div>
      </footer>
    </div>
  );
}
