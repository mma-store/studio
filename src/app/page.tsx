
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
  ChevronDown,
  Zap, 
  ShieldCheck,
  Globe,
  LayoutDashboard,
  MessageCircle,
  Smartphone,
  CreditCard,
  History,
  MousePointerClick,
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
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-32">
              <Image src={LOGO_URL} alt="Platform Logo" fill className="object-contain" />
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10 text-sm font-bold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">المميزات</a>
            <a href="#sectors" className="hover:text-blue-600 transition-colors">القطاعات</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">الأسعار</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">الأسئلة الشائعة</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-bold text-sm text-slate-700 hover:bg-slate-50">دخول التجار</Button>
            </Link>
            <Link href="/onboarding">
              <Button className="rounded-xl font-black shadow-xl shadow-blue-900/10 bg-[#0A192F] hover:bg-[#112240] text-white px-6">انضم إلينا مجاناً</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-28 md:pt-24 md:pb-40 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6 text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-100 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Zap className="h-4 w-4 fill-current" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">منصة التجارة الإلكترونية الأولى في العراق</span>
          </div>
          
          <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-7xl font-black leading-[1.2] tracking-tight text-[#0A192F] animate-in fade-in slide-in-from-bottom-4 duration-1000">
              أطلق تجارتك اليوم وبع في <span className="text-blue-600 underline decoration-blue-100 underline-offset-8">كل مكان</span> بالعراق.
            </h1>
            <p className="text-lg md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
              نظام سحابي متكامل يمنحك متجراً إلكترونياً احترافياً، نظام مبيعات POS، إدارة مخازن، وتقارير مالية دقيقة.. كل ذلك في منصة واحدة سهلة الاستخدام.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-16 px-12 rounded-2xl text-xl font-black shadow-2xl shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 text-white gap-3 group">
                ابدأ تجربتك المجانية <ArrowRight className="h-6 w-6 group-hover:-translate-x-1 transition-transform rotate-180" />
              </Button>
            </Link>
            <Link href="/store/demo-store" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-16 px-12 rounded-2xl text-xl border-2 border-slate-200 hover:bg-slate-50 font-black text-slate-800">
                مشاهدة متجر تجريبي
              </Button>
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mt-16 max-w-6xl mx-auto">
             <div className="rounded-[40px] overflow-hidden border-8 border-white shadow-[0_40px_100px_rgba(0,0,0,0.1)] bg-slate-100 animate-in fade-in zoom-in-95 duration-1000">
                <div className="aspect-video relative">
                   <Image 
                     src="https://picsum.photos/seed/platform_dash/1200/800" 
                     alt="Dashboard Preview" 
                     fill 
                     className="object-cover opacity-90"
                   />
                   <div className="absolute inset-0 bg-blue-900/10 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl border border-white/50 flex items-center gap-6">
                         <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <LayoutDashboard className="h-10 w-10" />
                         </div>
                         <div className="text-right">
                            <p className="font-black text-xl text-[#0A192F]">لوحة تحكم ذكية</p>
                            <p className="text-sm font-bold text-slate-500">تحكم بمتجرك ومبيعاتك من أي مكان</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             {/* Decorative Elements */}
             <div className="absolute -z-10 -top-20 -right-20 h-64 w-64 bg-blue-100 rounded-full blur-3xl opacity-50" />
             <div className="absolute -z-10 -bottom-20 -left-20 h-64 w-64 bg-purple-100 rounded-full blur-3xl opacity-50" />
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-16 border-y border-slate-100 bg-white">
         <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
               { label: "تاجر عراقي", value: "+1,200", icon: Users },
               { label: "قائمة مبيعات", value: "+500K", icon: ShoppingCart },
               { label: "مدينة مغطاة", value: "18", icon: Globe },
               { label: "دعم فني", value: "24/7", icon: MessageCircle },
            ].map((stat, i) => (
               <div key={i} className="text-center space-y-2">
                  <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center mx-auto text-blue-600 mb-3">
                     <stat.icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-3xl font-black text-[#0A192F]">{stat.value}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
               </div>
            ))}
         </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-white">
        <div className="container mx-auto px-6 space-y-24">
          <div className="text-center space-y-5 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-[#0A192F]">كل ما تحتاجه للنمو في مكان واحد</h2>
            <p className="text-slate-500 font-medium leading-relaxed">صممنا لك أدوات قوية وسهلة الاستخدام لتساعدك على إدارة تجارتك دون تعقيدات تقنية.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { title: "متجر إلكتروني احترافي", desc: "احصل على موقع عام يعرض منتجاتك لزبائنك مع سلة تسوق وربط مباشر بالواتساب.", icon: Globe, color: "bg-blue-600" },
              { title: "نظام نقطة بيع (POS)", icon: Monitor, desc: "إصدار فواتير ورقية سريعة، دعم الباركود، وإدارة مبيعات المحل الفعلية.", color: "bg-[#0A192F]" },
              { title: "إدارة المخازن والكميات", icon: Package, desc: "تتبع حركة الأصناف، تنبيهات عند نقص المخزون، وسجل كامل للمشتريات.", color: "bg-orange-500" },
              { title: "ديون وحسابات الزبائن", icon: CreditCard, desc: "إدارة البيع بالآجل، كشوفات حساب تفصيلية لكل زبون، ووصلات قبض رسمية.", color: "bg-emerald-600" },
              { title: "إدارة الورشة والصيانة", icon: Zap, desc: "نظام متخصص لورش التصليح مع تشخيص ذكي للأعطال ومتابعة حالة المهام.", color: "bg-purple-600" },
              { title: "تقارير مالية ذكية", icon: BarChart3, desc: "إحصائيات دقيقة عن الأرباح، المصاريف، وأداء المبيعات اليومي والشهري.", color: "bg-indigo-600" }
            ].map((f, i) => (
              <Card key={i} className="rounded-[40px] border-none bg-slate-50/50 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 p-10 group border-2 border-transparent hover:border-blue-100">
                <CardContent className="p-0 space-y-8">
                  <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform", f.color)}>
                    <f.icon className="h-8 w-8" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-[#0A192F]">{f.title}</h3>
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
             <h2 className="text-4xl font-black text-[#0A192F]">باقات اشتراك مرنة وبسيطة</h2>
             <p className="text-slate-500 font-medium">اختر الخطة التي تناسب حجم أعمالك. لا توجد رسوم خفية.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { name: "الباقة الأساسية", price: "0", desc: "مثالية للمشاريع الجديدة والناشئة", features: ["1 متجر إلكتروني", "حتى 10 منتجات", "نظام POS قياسي", "تقارير مبيعات مبسطة"], cta: "ابدأ مجاناً", active: false, href: "/onboarding" },
               { name: "باقة الأعمال", price: "15,000", desc: "للمحلات والمجمعات الطموحة للنمو", features: ["منتجات غير محدودة", "تقارير مالية متقدمة", "3 حسابات للموظفين", "تنبيهات المخزون", "إدارة ديون الزبائن"], cta: "اشترك الآن", active: true, href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('أريد الاشتراك في باقة الأعمال')}` },
               { name: "باقة المؤسسات", price: "35,000", desc: "للمؤسسات التي تحتاج دعماً مخصصاً", features: ["دومين خاص (Custom Domain)", "دعم فني مخصص", "تحديثات ذات أولوية", "إدارة فروع متعددة", "تكاملات برمجية خاصة"], cta: "تواصل معنا", active: false, href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('أريد الاستفسار عن باقة المؤسسات')}` }
             ].map((plan, i) => (
               <Card key={i} className={cn(
                 "rounded-[48px] border-none p-12 flex flex-col space-y-8 transition-all duration-500",
                 plan.active ? "bg-[#0A192F] text-white scale-105 shadow-2xl shadow-blue-900/20" : "bg-white border border-slate-100 text-[#0A192F]"
               )}>
                 <div className="space-y-4">
                    <h3 className={cn("text-xs font-black uppercase tracking-widest opacity-70", plan.active ? "text-blue-400" : "text-blue-600")}>{plan.name}</h3>
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
                        <div className={cn("h-5 w-5 rounded-full flex items-center justify-center", plan.active ? "bg-blue-400/20 text-blue-400" : "bg-blue-600/10 text-blue-600")}>
                           <Check className="h-3 w-3" strokeWidth={3} />
                        </div>
                        {f}
                      </li>
                    ))}
                 </ul>
                 <a href={plan.href} className="w-full">
                   <Button className={cn(
                     "w-full h-16 rounded-[24px] font-black text-lg shadow-lg",
                     plan.active ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-[#0A192F] hover:bg-[#112240] text-white"
                   )}>{plan.cta}</Button>
                 </a>
               </Card>
             ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-blue-600 text-white overflow-hidden relative">
         <div className="container mx-auto px-6 text-center space-y-12 relative z-10">
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
               <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black leading-tight max-w-3xl mx-auto">انضم إلى مئات التجار الذين يثقون بمنصتنا لإدارة أعمالهم يومياً.</h2>
            <div className="flex justify-center pt-8">
               <Link href="/onboarding">
                  <Button className="h-16 px-12 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-black text-xl shadow-2xl transition-transform active:scale-95">ابدأ مجاناً اليوم</Button>
               </Link>
            </div>
         </div>
         <div className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 h-[500px] w-[500px] bg-white/10 rounded-full blur-[100px]" />
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-24 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20 text-right">
             <div className="col-span-1 md:col-span-1 space-y-8">
                <div className="relative h-12 w-36">
                  <Image src={LOGO_URL} alt="Platform Logo" fill className="object-contain brightness-0 invert opacity-50" />
                </div>
                <p className="text-sm font-medium leading-relaxed">منصة عراقية رائدة لتمكين التجار وأصحاب المحلات من التحول الرقمي وإدارة المبيعات بذكاء.</p>
                <div className="flex gap-4">
                   <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all cursor-pointer"><MessageCircle className="h-4 w-4" /></a>
                   <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all cursor-pointer"><Smartphone className="h-4 w-4" /></div>
                </div>
             </div>
             <div className="space-y-6">
                <h4 className="text-white font-black text-lg">المنصة</h4>
                <ul className="space-y-4 text-sm font-bold">
                   <li><a href="#" className="hover:text-blue-400 transition-colors">المميزات</a></li>
                   <li><a href="#pricing" className="hover:text-blue-400 transition-colors">الأسعار</a></li>
                   <li><a href="#" className="hover:text-blue-400 transition-colors">المطورين (API)</a></li>
                   <li><a href="#" className="hover:text-blue-400 transition-colors">التكاملات</a></li>
                </ul>
             </div>
             <div className="space-y-6">
                <h4 className="text-white font-black text-lg">الدعم</h4>
                <ul className="space-y-4 text-sm font-bold">
                   <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-blue-400 transition-colors">مركز المساعدة</a></li>
                   <li><a href="#" className="hover:text-blue-400 transition-colors">المدونة</a></li>
                   <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-blue-400 transition-colors">اتصل بنا</a></li>
                   <li><a href="#" className="hover:text-blue-400 transition-colors">حالة النظام</a></li>
                </ul>
             </div>
             <div className="space-y-6">
                <h4 className="text-white font-black text-lg">قانوني</h4>
                <ul className="space-y-4 text-sm font-bold">
                   <li><a href="#" className="hover:text-blue-400 transition-colors">شروط الخدمة</a></li>
                   <li><a href="#" className="hover:text-blue-400 transition-colors">سياسة الخصوصية</a></li>
                </ul>
             </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col items-center gap-6">
             <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
                <div className="flex items-center gap-2 text-xs font-bold">
                   <span>تطوير وبرمجة:</span>
                   <span className="text-blue-500 font-black">حسين صلاح - Hussein Salah</span>
                </div>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
