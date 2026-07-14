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
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO_URL = "https://up6.cc/2026/07/178308238964931.png";

export default function SaaSLandingPage() {
  const WHATSAPP_NUMBER = "9647858833838";

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

      {/* Hero Section - Redesigned for Premium SaaS */}
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
            <Link href="/store/demo-store" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-16 px-12 rounded-2xl text-xl border-2 border-slate-200 hover:bg-slate-50 font-black text-slate-800">
                مشاهدة عرض تجريبي
              </Button>
            </Link>
          </div>

          {/* Floating Dashboard Preview */}
          <div className="relative mt-24 max-w-6xl mx-auto group">
             <div className="rounded-[48px] overflow-hidden border-[12px] border-white shadow-[0_50px_100px_rgba(10,25,47,0.15)] bg-slate-100 animate-in fade-in zoom-in-95 duration-1000 group-hover:scale-[1.01] transition-transform">
                <div className="aspect-video relative">
                   <Image 
                     src="https://picsum.photos/seed/saas_hero/1200/800" 
                     alt="Dashboard Preview" 
                     fill 
                     className="object-cover"
                   />
                   <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                      <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[40px] shadow-2xl border border-white/50 flex items-center gap-8">
                         <div className="h-20 w-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-xl">
                            <LayoutDashboard className="h-10 w-10" />
                         </div>
                         <div className="text-right">
                            <p className="font-black text-2xl text-primary">لوحة القيادة الذكية</p>
                            <p className="text-sm font-bold text-slate-500">راقب نمو أعمالك لحظة بلحظة</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             {/* Background Glows */}
             <div className="absolute -z-10 -top-24 -right-24 h-96 w-96 bg-blue-100/50 rounded-full blur-[100px] opacity-60" />
             <div className="absolute -z-10 -bottom-24 -left-24 h-96 w-96 bg-purple-100/50 rounded-full blur-[100px] opacity-60" />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 border-y border-slate-100 bg-slate-50/50">
         <div className="container mx-auto px-6">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-12">موثوق من قبل رواد الأعمال في كافة المحافظات</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
               {[
                  { label: "تاجر عراقي", value: "+1,200", icon: Users },
                  { label: "قائمة مبيعات", value: "+500K", icon: ShoppingCart },
                  { label: "مدينة مغطاة", value: "18", icon: Globe },
                  { label: "دعم فني", value: "24/7", icon: MessageCircle },
               ].map((stat, i) => (
                  <div key={i} className="text-center space-y-3">
                     <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mx-auto text-primary shadow-sm border border-slate-100">
                        <stat.icon className="h-6 w-6" />
                     </div>
                     <h4 className="text-4xl font-black text-primary tracking-tighter">{stat.value}</h4>
                     <p className="text-xs font-bold text-slate-500">{stat.label}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-white">
        <div className="container mx-auto px-6 space-y-24">
          <div className="text-center space-y-5 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-primary">نظام متكامل، بلا تعقيدات</h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">استبدل السجلات الورقية والبرامج القديمة بنظام سحابي مرن ينمو مع طموحاتك.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "متجر إلكتروني احترافي", desc: "احصل على موقع عام يعرض منتجاتك لزبائنك مع سلة تسوق وربط مباشر بالواتساب.", icon: Globe, color: "bg-blue-600" },
              { title: "نظام نقطة بيع (POS)", icon: Monitor, desc: "إصدار فواتير ورقية سريعة، دعم الباركود، وإدارة مبيعات المحل الفعلية.", color: "bg-primary" },
              { title: "إدارة المخازن والكميات", icon: Package, desc: "تتبع حركة الأصناف، تنبيهات عند نقص المخزون، وسجل كامل للمشتريات.", color: "bg-indigo-600" },
              { title: "ديون وحسابات الزبائن", icon: CreditCard, desc: "إدارة البيع بالآجل، كشوفات حساب تفصيلية لكل زبون، ووصلات قبض رسمية.", color: "bg-emerald-600" },
              { title: "إدارة الورشة والصيانة", icon: Zap, desc: "نظام متخصص لورش التصليح مع تشخيص ذكي للأعطال ومتابعة حالة المهام.", color: "bg-purple-600" },
              { title: "تقارير مالية ذكية", icon: BarChart3, desc: "إحصائيات دقيقة عن الأرباح، المصاريف، وأداء المبيعات اليومي والشهري.", color: "bg-slate-900" }
            ].map((f, i) => (
              <Card key={i} className="rounded-[40px] border-none bg-slate-50/80 hover:bg-white hover:shadow-[0_30px_60px_rgba(10,25,47,0.08)] transition-all duration-500 p-10 group border-2 border-transparent hover:border-primary/10">
                <CardContent className="p-0 space-y-8">
                  <div className={cn("h-16 w-16 rounded-3xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all", f.color)}>
                    <f.icon className="h-8 w-8" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-primary">{f.title}</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-slate-50">
        <div className="container mx-auto px-6 space-y-20">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
             <h2 className="text-4xl md:text-5xl font-black text-primary">خطط اشتراك شفافة</h2>
             <p className="text-slate-500 font-medium">ابدأ مجاناً وقم بالترقية عندما تحتاج ميزات إضافية لدعم نموك.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
             {[
               { name: "الباقة الأساسية", price: "0", desc: "مثالية للمشاريع الناشئة", features: ["1 متجر إلكتروني", "حتى 10 منتجات", "نظام POS قياسي", "تقارير مبسطة"], cta: "ابدأ مجاناً", active: false, href: "/onboarding" },
               { name: "باقة الأعمال", price: "15,000", desc: "للنمو والتوسع السريع", features: ["منتجات غير محدودة", "تقارير مالية متقدمة", "3 حسابات للموظفين", "تنبيهات المخزون", "إدارة ديون الزبائن"], cta: "اشترك الآن", active: true, href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('أريد الاشتراك في باقة الأعمال')}` },
               { name: "باقة المؤسسات", price: "35,000", desc: "للمؤسسات والمجمعات الكبرى", features: ["دومين خاص", "دعم فني مخصص", "تحديثات ذات أولوية", "إدارة فروع متعددة", "تكاملات برمجية خاصة"], cta: "تواصل معنا", active: false, href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('أريد الاستفسار عن باقة المؤسسات')}` }
             ].map((plan, i) => (
               <Card key={i} className={cn(
                 "rounded-[48px] border-none p-12 flex flex-col space-y-8 transition-all duration-500",
                 plan.active ? "bg-primary text-white scale-110 shadow-[0_40px_80px_rgba(10,25,47,0.25)] relative z-10" : "bg-white border border-slate-100 text-primary"
               )}>
                 <div className="space-y-4">
                    <h3 className={cn("text-xs font-black uppercase tracking-widest opacity-70", plan.active ? "text-secondary" : "text-primary")}>{plan.name}</h3>
                    <div className="flex items-baseline gap-2">
                       <span className="text-5xl font-black">{plan.price === "0" ? "مجانية" : plan.price}</span>
                       {plan.price !== "0" && <span className="text-sm font-bold opacity-60">د.ع / شهر</span>}
                    </div>
                    <p className="text-sm font-medium opacity-80">{plan.desc}</p>
                 </div>
                 <div className={cn("h-px", plan.active ? "bg-white/10" : "bg-slate-100")} />
                 <ul className="flex-1 space-y-5">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm font-bold">
                        <div className={cn("h-5 w-5 rounded-full flex items-center justify-center", plan.active ? "bg-secondary/20 text-secondary" : "bg-primary/10 text-primary")}>
                           <Check className="h-3 w-3" strokeWidth={3} />
                        </div>
                        {f}
                      </li>
                    ))}
                 </ul>
                 <a href={plan.href} className="w-full">
                   <Button className={cn(
                     "w-full h-16 rounded-[24px] font-black text-lg shadow-lg transition-all active:scale-95",
                     plan.active ? "bg-secondary hover:bg-secondary/90 text-white" : "bg-primary hover:bg-primary/90 text-white"
                   )}>{plan.cta}</Button>
                 </a>
               </Card>
             ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-primary text-white overflow-hidden relative">
         <div className="container mx-auto px-6 text-center space-y-12 relative z-10">
            <div className="h-20 w-20 bg-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 backdrop-blur-2xl border border-white/20">
               <Rocket className="h-10 w-10 text-secondary" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black leading-tight max-w-4xl mx-auto tracking-tighter">مستقبل تجارتك يبدأ بضغطة زر واحدة.</h2>
            <div className="flex justify-center pt-8">
               <Link href="/onboarding">
                  <Button className="h-20 px-16 rounded-[28px] bg-white text-primary hover:bg-slate-50 font-black text-2xl shadow-2xl transition-transform active:scale-95">أنشئ متجرك الآن</Button>
               </Link>
            </div>
         </div>
         <div className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] bg-secondary/20 rounded-full blur-[120px]" />
         <div className="absolute left-0 bottom-0 -translate-x-1/2 translate-y-1/2 h-[600px] w-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
      </section>

      {/* Standardized Footer */}
      <footer className="bg-slate-900 text-slate-400 py-24 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20 text-right">
             <div className="col-span-1 md:col-span-1 space-y-8">
                <div className="relative h-12 w-40">
                  <Image src={LOGO_URL} alt="Platform Logo" fill className="object-contain brightness-0 invert opacity-60" />
                </div>
                <p className="text-sm font-medium leading-relaxed">المنصة السحابية المتكاملة لتمكين التجار في العراق من التحول الرقمي وإدارة المبيعات والمخازن بذكاء.</p>
                <div className="flex gap-4">
                   <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary hover:text-white transition-all cursor-pointer"><MessageCircle className="h-5 w-5" /></a>
                   <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer"><Smartphone className="h-5 w-5" /></div>
                </div>
             </div>
             <div className="space-y-6">
                <h4 className="text-white font-black text-lg">المنصة</h4>
                <ul className="space-y-4 text-sm font-bold">
                   <li><a href="#features" className="hover:text-secondary transition-colors">المميزات</a></li>
                   <li><a href="#pricing" className="hover:text-secondary transition-colors">الأسعار</a></li>
                   <li><a href="#" className="hover:text-secondary transition-colors">المطورين (API)</a></li>
                </ul>
             </div>
             <div className="space-y-6">
                <h4 className="text-white font-black text-lg">الدعم</h4>
                <ul className="space-y-4 text-sm font-bold">
                   <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-secondary transition-colors">مركز المساعدة</a></li>
                   <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-secondary transition-colors">اتصل بنا</a></li>
                   <li><a href="#" className="hover:text-secondary transition-colors">حالة النظام</a></li>
                </ul>
             </div>
             <div className="space-y-6">
                <h4 className="text-white font-black text-lg">قانوني</h4>
                <ul className="space-y-4 text-sm font-bold">
                   <li><a href="#" className="hover:text-secondary transition-colors">شروط الخدمة</a></li>
                   <li><a href="#" className="hover:text-secondary transition-colors">سياسة الخصوصية</a></li>
                </ul>
             </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col items-center gap-6">
             <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
                <div className="flex items-center gap-2 text-xs font-bold">
                   <span>تطوير وبرمجة:</span>
                   <span className="text-secondary font-black">حسين صلاح - Hussein Salah</span>
                </div>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}