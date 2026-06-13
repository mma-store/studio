
'use client';

import { 
  Store, 
  Globe, 
  Phone, 
  MapPin, 
  Save, 
  Shield, 
  MessageCircle,
  Smartphone,
  Palette,
  BellRing
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">إعدادات النظام</h1>
          <p className="text-muted-foreground font-medium text-sm">إدارة معلومات المجمع، الأمان، وتفضيلات المظهر.</p>
        </div>
        <Button className="rounded-xl font-bold h-11 shadow-lg shadow-primary/20 gap-2 px-8">
          <Save className="h-5 w-5" /> حفظ كافة التغييرات
        </Button>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="bg-white dark:bg-card p-1 rounded-2xl h-14 border shadow-sm">
          <TabsTrigger value="store" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">معلومات المجمع</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">الإشعارات</TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">الأمان</TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">المظهر</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-[32px] border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-black">
                  <Store className="h-5 w-5 text-primary" /> المعلومات الأساسية
                </CardTitle>
                <CardDescription className="font-medium">البيانات الرسمية التي تظهر للعملاء في الفواتير والتطبيق.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold mr-1">اسم المجمع</Label>
                  <Input defaultValue="مجمع محمد علاء" className="rounded-2xl h-12 bg-muted/30 border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold mr-1">الوصف العام</Label>
                  <Textarea placeholder="اكتب وصفاً مختصراً للمجمع..." className="rounded-2xl bg-muted/30 border-none min-h-[100px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold mr-1">رقم الهاتف الأساسي</Label>
                    <Input defaultValue="07700000000" className="rounded-2xl h-12 bg-muted/30 border-none text-left" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold mr-1">رقم الواتساب</Label>
                    <Input defaultValue="07700000000" className="rounded-2xl h-12 bg-muted/30 border-none text-left" dir="ltr" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-none shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-black">
                  <MapPin className="h-5 w-5 text-primary" /> الموقع والتواصل الاجتماعي
                </CardTitle>
                <CardDescription className="font-medium">عناوين الفروع وروابط حسابات المجمع.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold mr-1">العنوان الرئيسي</Label>
                  <Input defaultValue="بغداد، الكرادة، ساحة كهرمانة" className="rounded-2xl h-12 bg-muted/30 border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold mr-1">رابط Google Maps</Label>
                  <Input placeholder="https://goo.gl/maps/..." className="rounded-2xl h-12 bg-muted/30 border-none text-left" dir="ltr" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label className="font-bold mr-1">فيسبوك</Label>
                    <Input placeholder="اسم الصفحة" className="rounded-2xl h-12 bg-muted/30 border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold mr-1">انستغرام</Label>
                    <Input placeholder="@username" className="rounded-2xl h-12 bg-muted/30 border-none" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
           <Card className="rounded-[32px] border-none shadow-sm max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-black">
                  <BellRing className="h-5 w-5 text-primary" /> تفضيلات الإشعارات
                </CardTitle>
                <CardDescription className="font-medium">التحكم في متى وكيف يتم إخطار الإدارة والعملاء.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <p className="font-bold">إشعارات الطلبات الجديدة</p>
                       <p className="text-xs text-muted-foreground font-medium">إرسال إشعار فوري عند استلام طلب جديد من التطبيق.</p>
                    </div>
                    <Switch defaultChecked />
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <p className="font-bold">تنبيهات انخفاض المخزون</p>
                       <p className="text-xs text-muted-foreground font-medium">تنبيه الإدارة عند وصول أي منتج للحد الأدنى.</p>
                    </div>
                    <Switch defaultChecked />
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <p className="font-bold">رسائل واتساب تلقائية</p>
                       <p className="text-xs text-muted-foreground font-medium">إرسال تفاصيل الطلب للعميل عبر الواتساب تلقائياً.</p>
                    </div>
                    <Switch />
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="appearance">
           <Card className="rounded-[32px] border-none shadow-sm max-w-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-black">
                  <Palette className="h-5 w-5 text-primary" /> مظهر المنصة
                </CardTitle>
                <CardDescription className="font-medium">تخصيص الألوان والسمات الخاصة بلوحة الإدارة.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <p className="font-bold">الوضع الليلي التلقائي</p>
                       <p className="text-xs text-muted-foreground font-medium">تغيير المظهر بناءً على إعدادات نظام التشغيل.</p>
                    </div>
                    <Switch />
                 </div>
                 <div className="space-y-4">
                    <p className="text-sm font-bold">اللون الأساسي للنظام</p>
                    <div className="flex gap-4">
                       <div className="h-10 w-10 rounded-full bg-primary border-4 border-white shadow-sm ring-2 ring-primary cursor-pointer" />
                       <div className="h-10 w-10 rounded-full bg-blue-600 border-4 border-white shadow-sm cursor-pointer" />
                       <div className="h-10 w-10 rounded-full bg-green-600 border-4 border-white shadow-sm cursor-pointer" />
                       <div className="h-10 w-10 rounded-full bg-purple-600 border-4 border-white shadow-sm cursor-pointer" />
                    </div>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
