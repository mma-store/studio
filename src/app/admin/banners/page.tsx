
'use client';

import { 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  ToggleLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export default function BannersPage() {
  const db = useFirestore();
  const bannersQuery = useMemo(() => query(collection(db, 'banners'), orderBy('createdAt', 'desc')), [db]);
  const { data: banners, loading } = useCollection(bannersQuery);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setUploadedImageUrl(url);
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل رفع الصورة." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await addDoc(collection(db, 'banners'), {
        title: formData.get('title'),
        subtitle: formData.get('subtitle'),
        link: formData.get('link') || "#",
        image: uploadedImageUrl,
        isActive: true,
        createdAt: Date.now()
      });
      setIsAddOpen(false);
      setUploadedImageUrl("");
      toast({ title: "تم الإضافة", description: "تم نشر البنر الجديد بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحفظ." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا البنر؟")) return;
    await deleteDoc(doc(db, 'banners', id));
    toast({ title: "تم الحذف" });
  };

  const toggleStatus = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'banners', id), { isActive: !current });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">البنرات الترويجية</h1>
          <p className="text-muted-foreground font-medium text-sm">إدارة العروض التي تظهر في السلايدر الرئيسي للتطبيق.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" /> إضافة بنر جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px] max-w-2xl">
            <DialogHeader><DialogTitle className="text-2xl font-black">إنشاء بنر ترويجي</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-6 pt-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">العنوان الرئيسي</Label>
                    <Input name="title" required placeholder="مثال: خصم الصيف" className="rounded-xl h-12 bg-muted/30 border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">العنوان الفرعي</Label>
                    <Input name="subtitle" placeholder="مثال: خصم 20% على الخوذ" className="rounded-xl h-12 bg-muted/30 border-none" />
                  </div>
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">رابط التوجيه (اختياري)</Label>
                 <Input name="link" placeholder="/catalog/category-id" className="rounded-xl h-12 bg-muted/30 border-none text-left" dir="ltr" />
               </div>
               <div className="space-y-4">
                 <Label className="font-bold">صورة البنر (يفضل مقاس عرضي 1200x500)</Label>
                 <div className="relative aspect-[21/9] rounded-2xl border-2 border-dashed bg-muted/20 overflow-hidden flex items-center justify-center">
                    {uploadedImageUrl ? (
                      <Image src={uploadedImageUrl} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-40">
                         {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <ImageIcon className="h-10 w-10" />}
                         <span className="text-xs font-bold">{isUploading ? 'جاري الرفع...' : 'ارفع الصورة'}</span>
                      </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={isUploading} />
                 </div>
               </div>
               <DialogFooter>
                 <Button type="submit" disabled={isUploading || !uploadedImageUrl} className="w-full h-14 rounded-2xl font-black text-lg">نشر البنر الآن</Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-[32px]" />)
        ) : banners.map((banner: any) => (
          <Card key={banner.id} className="rounded-[32px] border-none shadow-sm overflow-hidden group relative">
            <div className="relative aspect-[21/9]">
               <Image src={banner.image} alt={banner.title} fill className="object-cover" />
               <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8 text-white">
                  <h3 className="text-2xl font-black">{banner.title}</h3>
                  <p className="text-sm opacity-90">{banner.subtitle}</p>
               </div>
               <div className="absolute top-4 right-4 flex gap-2">
                  <div className="bg-white/90 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-2 shadow-lg">
                     <span className="text-[10px] font-black text-black uppercase">الحالة</span>
                     <Switch checked={banner.isActive} onCheckedChange={() => toggleStatus(banner.id, banner.isActive)} />
                  </div>
                  <Button variant="destructive" size="icon" className="rounded-full shadow-lg h-9 w-9" onClick={() => handleDelete(banner.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
               </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
