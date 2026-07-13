
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
  LayoutDashboard
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
  return (
    <div className="min-h-screen bg-white text-slate-900 font-almarai selection:bg-primary/20 overflow-x-hidden">
      
      {/* Platform Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-32">
              <Image src={LOGO_URL} alt="Platform Logo" fill className="object-contain" />
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-bold text-sm hidden sm:flex">Merchant Login</Button>
            </Link>
            <Link href="/onboarding">
              <Button className="rounded-xl font-black shadow-lg shadow-primary/20">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-6 text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary border border-primary/10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Zap className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-widest">Next Generation Retail Platform</span>
          </div>
          
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Launch Your Brand & <span className="text-primary italic">Scale Your Sales</span> in Minutes.
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
              A comprehensive Multi-Tenant SaaS platform for managing online stores, POS systems, inventory, and workshop repairs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Link href="/onboarding">
              <Button className="h-16 px-10 rounded-2xl text-xl font-black shadow-2xl shadow-primary/30 gap-3 group">
                Create Your Store <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" className="h-16 px-10 rounded-2xl text-xl border-2 font-black">
              View Demo Store
            </Button>
          </div>

          {/* Dashboard Preview Placeholder */}
          <div className="relative mt-20 max-w-6xl mx-auto rounded-[40px] overflow-hidden border shadow-2xl bg-slate-100 animate-in fade-in zoom-in-95 duration-1000">
             <div className="aspect-video relative">
                <Image 
                  src="https://picsum.photos/seed/platform_dash/1200/800" 
                  alt="Dashboard Preview" 
                  fill 
                  className="object-cover opacity-80"
                  data-ai-hint="saas dashboard"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="bg-white/20 backdrop-blur-xl p-8 rounded-full shadow-2xl border border-white/30">
                      <LayoutDashboard className="h-20 w-20 text-white" />
                   </div>
                </div>
             </div>
          </div>
        </div>
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
           <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
           <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-slate-50">
        <div className="container mx-auto px-6 space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black">Powerful Features for Growing Businesses</h2>
            <p className="text-slate-500 font-medium max-w-lg mx-auto">Everything you need to manage your business effectively, all in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Online Storefront", desc: "Get a professional, mobile-ready public shop for your products.", icon: Globe, color: "bg-blue-500" },
              { title: "Smart POS System", desc: "Manage physical sales with barcode support and debt tracking.", icon: Monitor, color: "bg-primary" },
              { title: "Inventory Engine", desc: "Real-time stock tracking with low-stock alerts and history.", icon: Package, color: "bg-orange-500" },
              { title: "Workshop & Repairs", desc: "Specialized CMS for repair orders with AI-powered diagnosis.", icon: Zap, color: "bg-purple-500" },
              { title: "Deep Analytics", desc: "Visual reports on sales, profits, and customer behavior.", icon: BarChart3, color: "bg-emerald-500" },
              { title: "Staff Roles", desc: "Assign specific permissions to employees for secure management.", icon: Users, color: "bg-slate-700" }
            ].map((f, i) => (
              <Card key={i} className="rounded-[32px] border-none shadow-sm hover:shadow-xl transition-all duration-500 p-8 group hover:-translate-y-2 bg-white">
                <CardContent className="p-0 space-y-6">
                  <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-lg", f.color)}>
                    <f.icon className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black">{f.title}</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Business Types Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-8">
             <h2 className="text-4xl font-black leading-tight">Tailored for Multiple <span className="text-primary underline decoration-primary/20">Industries</span></h2>
             <p className="text-lg text-slate-500 font-medium">Whether you sell motorcycle parts or manage a high-end fashion boutique, our platform adapts to your needs.</p>
             <div className="grid grid-cols-2 gap-4">
                {["Motorcycle Spare Parts", "Fashion & Apparel", "Electronics & Gadgets", "General Retail", "Automotive Services", "Pharmacy & Health"].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm">
                    <Check className="h-5 w-5 text-primary shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
             </div>
          </div>
          <div className="flex-1 relative h-[500px] w-full rounded-[40px] overflow-hidden shadow-2xl">
             <Image 
              src="https://picsum.photos/seed/industries/800/600" 
              alt="Multi Industry Support" 
              fill 
              className="object-cover"
              data-ai-hint="retail business"
             />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="container mx-auto px-6 space-y-20 relative z-10">
          <div className="text-center space-y-4">
             <h2 className="text-4xl font-black">Simple, Transparent Pricing</h2>
             <p className="text-slate-400 font-medium">No hidden fees. Choose the plan that scales with your growth.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { name: "Starter", price: "Free", desc: "Perfect for new small businesses", features: ["1 Online Store", "Up to 50 Products", "Standard POS", "Basic Reports"], cta: "Start for Free", active: false },
               { name: "Business", price: "$29", desc: "Best for growing retailers", features: ["Unlimited Products", "Advanced Reports", "3 Staff Accounts", "Inventory Alerts", "Customer Debts"], cta: "Get Started", active: true },
               { name: "Enterprise", price: "Custom", desc: "For large scale operations", features: ["Custom Domain", "Dedicated Support", "Priority Updates", "Full Multi-Store", "Custom Integrations"], cta: "Contact Sales", active: false }
             ].map((plan, i) => (
               <Card key={i} className={cn(
                 "rounded-[40px] border-none p-10 flex flex-col space-y-8 transition-all duration-500",
                 plan.active ? "bg-primary text-white scale-105 shadow-2xl shadow-primary/30" : "bg-white/5 border border-white/10 text-white"
               )}>
                 <div className="space-y-4">
                    <h3 className="text-2xl font-black uppercase tracking-tighter opacity-70">{plan.name}</h3>
                    <div className="flex items-baseline gap-2">
                       <span className="text-5xl font-black">{plan.price}</span>
                       {plan.price !== "Free" && plan.price !== "Custom" && <span className="text-sm opacity-60">/month</span>}
                    </div>
                    <p className="text-sm font-medium opacity-80">{plan.desc}</p>
                 </div>
                 <div className="h-px bg-white/10" />
                 <ul className="flex-1 space-y-4">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm font-bold">
                        <Check className={cn("h-5 w-5", plan.active ? "text-white" : "text-primary")} />
                        {f}
                      </li>
                    ))}
                 </ul>
                 <Button className={cn(
                   "w-full h-14 rounded-2xl font-black text-lg",
                   plan.active ? "bg-white text-primary hover:bg-slate-100" : "bg-primary text-white"
                 )}>{plan.cta}</Button>
               </Card>
             ))}
          </div>
        </div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-3xl space-y-12">
          <h2 className="text-4xl font-black text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              { q: "How long does it take to set up my store?", a: "You can create your store and add your first product in less than 60 seconds with our onboarding wizard." },
              { q: "Can I use my own barcode scanner?", a: "Yes, our POS system is compatible with all standard USB and Bluetooth barcode scanners." },
              { q: "Is my data secure?", a: "We use enterprise-grade cloud encryption and tenant isolation to ensure your business data is never accessible by others." },
              { q: "Can I upgrade or downgrade my plan at any time?", a: "Absolutely! You can change your subscription status through your dashboard settings." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-none px-6 rounded-[24px] bg-slate-50">
                <AccordionTrigger className="font-black text-left hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="font-medium text-slate-500 leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t py-20 text-center space-y-10">
        <div className="container mx-auto px-6">
          <div className="relative h-12 w-32 mx-auto mb-8">
            <Image src={LOGO_URL} alt="Platform Logo" fill className="object-contain grayscale opacity-30" />
          </div>
          <div className="flex justify-center gap-10 text-sm font-bold text-slate-500">
             <a href="#" className="hover:text-primary">About Us</a>
             <a href="#" className="hover:text-primary">Privacy Policy</a>
             <a href="#" className="hover:text-primary">Terms of Service</a>
             <a href="#" className="hover:text-primary">Contact</a>
          </div>
          <div className="pt-10 border-t flex flex-col items-center gap-4 opacity-50">
             <p className="text-xs font-black uppercase tracking-widest">© {new Date().getFullYear()} Platform. All rights reserved.</p>
             <p className="text-[11px] font-bold">Developed by <span className="text-primary">Hussein Salah</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
