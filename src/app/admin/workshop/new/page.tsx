'use client';

import { 
  ChevronRight, 
  Save, 
  User, 
  Bike, 
  ClipboardList, 
  Camera,
  Calendar,
  AlertCircle,
  Loader2,
  X,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useState, useRef } from "react";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/lib/cloudinary";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function NewRepairOrderPage() {
  const db = useFirestore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file));
      const urls = await Promise.all(uploadPromises);
      setUploadedPhotos(prev => [...prev, ...urls]);
      toast({ title: "تم الرفع", description: "تم رفع صور الحالة بنجاح." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل رفع الصور." });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const orderData = {
      orderNumber: `RE-${Math.floor(Math.random() * 90000) + 10000}`,
      customerName: formData.get('customerName'),
      phoneNumber: formData.get('phoneNumber'),
      bikeBrand: formData.get('bikeBrand'),
      bikeModel: formData.get('bikeModel'),
      bikeType: formData.get('bikeType'),
      bikeColor: formData.get('bikeColor'),
      plateNumber: formData.get('plateNumber'),
      problemDescription: formData.get('problemDescription'),
      bikePhotos: uploadedPhotos,
      status: 'received',
      partsUsed: [],
      laborCost: 0,
      totalAmount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await addDoc(collection(db, 'repairOrders'), orderData);
      toast({ title: "تم بنجاح", description: "تم إنشاء أمر التصليح بنجاح." });
      router.push('/admin/workshop');
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء حفظ البيانات." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Link href="/admin/workshop">
              <Button variant="ghost" size="icon" className="rounded-xl bg-white shadow-sm">
                <ChevronRight className="h-5 w-5" />
              </Button>
           </Link>
           <div>
              <h1 className="text-2xl font-black">أمر تصليح جديد</h1>
              <p className="text-xs text-muted-foreground font-medium">إدخال بيانات الدراجة والمشكلة المبلغ عنها.</p>
           </div>
        </div>
        <Button 
          form="repair-form" 
          type="submit" 
          className="rounded-xl font-bold h-11 shadow-lg shadow-primary/20 gap-2 px-8"
          disabled={loading || isUploading}
        >
          <Save className="h-5 w-5" /> {loading ? "جاري الحفظ..." : "حفظ أمر التصليح"}
        </Button>
      </div>

      <form id="repair-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 rounded-[32px] border-none shadow-sm h-fit">
           <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black text-right">
                 <User className="h-5 w-5 text-primary" /> بيانات العميل
              </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="space-y-2">
                 <Label className="font-bold mr-1">اسم العميل</Label>
                 <Input name="customerName" required placeholder="الاسم الكامل" className="rounded-2xl h-12 bg-muted/30 border-none" />
              </div>
              <div className="space-y-2">
                 <Label className="font-bold mr-1">رقم الهاتف</Label>
                 <Input name="phoneNumber" required placeholder="07XXXXXXXXX" className="rounded-2xl h-12 bg-muted/30 border-none text-left" dir="ltr" />
              </div>
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex gap-3">
                 <AlertCircle className="h-5 w-5 text-primary shrink-0" />
                 <p className="text-[10px] font-bold text-primary/80">تأكد من صحة رقم الهاتف لإرسال تحديثات الحالة عبر الواتساب لاحقاً.</p>
              </div>
           </CardContent>
        </Card>

        <Card className="md:col-span-2 rounded-[32px] border-none shadow-sm">
           <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black text-right">
                 <Bike className="h-5 w-5 text-primary" /> بيانات الدراجة
              </CardTitle>
           </CardHeader>
           <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label className="font-bold mr-1">الماركة (Brand)</Label>
                 <Input name="bikeBrand" required placeholder="مثال: Honda" className="rounded-2xl h-12 bg-muted/30 border-none" />
              </div>
              <div className="space-y-2">
                 <Label className="font-bold mr-1">الموديل (Model)</Label>
                 <Input name="bikeModel" required placeholder="مثال: CBR 600" className="rounded-2xl h-12 bg-muted/30 border-none" />
              </div>
              <div className="space-y-2">
                 <Label className="font-bold mr-1">رقم اللوحة</Label>
                 <Input name="plateNumber" placeholder="رقم الدراجة" className="rounded-2xl h-12 bg-muted/30 border-none" />
              </div>
              <div className="space-y-2">
                 <Label className="font-bold mr-1">اللون</Label>
                 <Input name="bikeColor" placeholder="لون الدراجة" className="rounded-2xl h-12 bg-muted/30 border-none" />
              </div>
           </CardContent>
        </Card>

        <Card className="md:col-span-3 rounded-[32px] border-none shadow-sm">
           <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-black text-right">
                 <ClipboardList className="h-5 w-5 text-primary" /> تفاصيل المشكلة
              </CardTitle>
           </CardHeader>
           <CardContent className="space-y-6">
              <div className="space-y-2">
                 <Label className="font-bold mr-1">وصف المشكلة / طلب العميل</Label>
                 <Textarea name="problemDescription" required placeholder="اكتب تفاصيل العطل أو الصيانة المطلوبة..." className="rounded-2xl bg-muted/30 border-none min-h-[120px]" />
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                 <Label className="font-bold block text-right">صور الدراجة عند الاستلام</Label>
                 <div className="flex flex-wrap gap-4">
                    {uploadedPhotos.map((url, i) => (
                      <div key={i} className="relative h-32 w-32 rounded-2xl overflow-hidden border bg-muted shadow-sm group">
                         <Image src={url} alt="Bike Status" fill className="object-cover" />
                         <button 
                           type="button" 
                           onClick={() => setUploadedPhotos(prev => prev.filter((_, idx) => idx !== i))}
                           className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <X className="h-4 w-4" />
                         </button>
                      </div>
                    ))}

                    <div className="flex gap-4">
                       <button
                         type="button"
                         disabled={isUploading}
                         onClick={() => cameraInputRef.current?.click()}
                         className={cn(
                           "h-32 w-32 rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-primary gap-2 hover:bg-primary/5 transition-all bg-white dark:bg-slate-900 group",
                           isUploading && "opacity-50 pointer-events-none"
                         )}
                       >
                          <Camera className="h-8 w-8 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black">تصوير الحالة</span>
                          <input 
                            type="file" 
                            ref={cameraInputRef}
                            accept="image/*" 
                            capture="environment" 
                            className="hidden" 
                            onChange={handlePhotoUpload} 
                          />
                       </button>

                       <button
                         type="button"
                         disabled={isUploading}
                         onClick={() => fileInputRef.current?.click()}
                         className={cn(
                           "h-32 w-32 rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground gap-2 hover:bg-muted/10 transition-all bg-white dark:bg-slate-900",
                           isUploading && "opacity-50 pointer-events-none"
                         )}
                       >
                          {isUploading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          ) : (
                            <Upload className="h-8 w-8" />
                          )}
                          <span className="text-[10px] font-black">من الاستوديو</span>
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            multiple 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handlePhotoUpload} 
                          />
                       </button>
                    </div>
                 </div>
              </div>
           </CardContent>
        </Card>
      </form>
    </div>
  );
}
