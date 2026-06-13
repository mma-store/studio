import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Wrench, 
  CheckCircle2, 
  Zap, 
  Star,
  ShieldCheck
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const FEATURED_CATEGORIES = [
  { name: "محركات", icon: Zap, color: "bg-orange-100 text-orange-600" },
  { name: "إطارات", icon: Star, color: "bg-blue-100 text-blue-600" },
  { name: "صيانة", icon: Wrench, color: "bg-green-100 text-green-600" },
  { name: "إكسسوارات", icon: ShieldCheck, color: "bg-purple-100 text-purple-600" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <SidebarNav />
      
      <main className="flex-1 pb-20 md:pb-0">
        <Header />
        
        <div className="container px-4 py-6 space-y-8 animate-fade-in">
          {/* Hero Banner Slider managed by Admin */}
          <section className="relative overflow-hidden rounded-3xl bg-secondary text-white shadow-lg h-[200px] md:h-[300px]">
            <Image 
              src="https://picsum.photos/seed/moto1/1200/400" 
              alt="Promo Banner"
              fill
              className="object-cover opacity-60"
              priority
              data-ai-hint="motorcycle showroom"
            />
            <div className="absolute inset-0 flex flex-col justify-center p-8 space-y-4">
              <Badge className="w-fit bg-primary text-white border-none">عروض الصيف</Badge>
              <h2 className="text-3xl font-bold md:text-5xl max-w-lg">خصم يصل إلى 30% على خدمات الصيانة</h2>
              <Button className="md3-button w-fit bg-white text-black hover:bg-white/90">
                احجز موعدك الآن
              </Button>
            </div>
          </section>

          {/* Quick Stats/Links for Staff (Conditional in real app) */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="md3-card bg-orange-50 border-orange-100 border">
              <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                <Wrench className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">دراجات قيد الصيانة</p>
                </div>
              </CardContent>
            </Card>
             <Card className="md3-card bg-green-50 border-green-100 border">
              <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">45</p>
                  <p className="text-xs text-muted-foreground">طلبات مكتملة اليوم</p>
                </div>
              </CardContent>
            </Card>
            <Card className="md3-card bg-blue-50 border-blue-100 border">
              <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                <Zap className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">150</p>
                  <p className="text-xs text-muted-foreground">منتج جديد بالمستودع</p>
                </div>
              </CardContent>
            </Card>
            <Card className="md3-card bg-purple-50 border-purple-100 border">
              <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                <Star className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">4.9</p>
                  <p className="text-xs text-muted-foreground">تقييم العملاء</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">التصنيفات الرئيسية</h3>
              <Button variant="link" className="text-primary font-bold">عرض الكل</Button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {FEATURED_CATEGORIES.map((cat) => (
                <div key={cat.name} className="flex flex-col items-center gap-3 p-4 bg-card rounded-[28px] shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <div className={cn("h-16 w-16 rounded-full flex items-center justify-center", cat.color)}>
                    <cat.icon className="h-8 w-8" />
                  </div>
                  <span className="font-bold">{cat.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Dynamic Featured Products */}
          <section className="space-y-4">
             <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">الأكثر مبيعاً</h3>
              <Button variant="link" className="text-primary font-bold">عرض الكل</Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="min-w-[200px] md:min-w-[240px] md3-card overflow-hidden shrink-0 border-none">
                  <div className="relative h-40 w-full bg-muted">
                    <Image 
                      src={`https://picsum.photos/seed/product${i}/400/400`} 
                      alt="Product"
                      fill
                      className="object-cover"
                      data-ai-hint="motorcycle parts"
                    />
                    <Button variant="outline" size="icon" className="absolute top-2 left-2 rounded-full h-8 w-8 bg-white/80 border-none">
                      <Star className="h-4 w-4 text-orange-400 fill-orange-400" />
                    </Button>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs text-muted-foreground">هوندا • موديل 2023</p>
                    <h4 className="font-bold line-clamp-1">فلتر زيت محرك أصلي</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold">15,000 د.ع</span>
                      <Button size="icon" className="rounded-full h-8 w-8 bg-primary text-white">
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
