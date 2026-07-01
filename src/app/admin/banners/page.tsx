
'use client';

import { 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Loader2,
  ExternalLink
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
      toast({ title: "تم رفع الصورة" });
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
        link: formData.get('link') || "/catalog",
        image: uploadedImageUrl,
        isActive: true,
        createdAt: Date.now()
      });
      setIsAddOpen(false);
      setUploadedImageUrl("");
      toast({ title: "تم الإضافة بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحفظ." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذا البنر؟")) return;
    await deleteDoc(doc(db, 'banners', id));
    toast({ title: "تم الحذف" });
  };

  const toggleStatus = async (id: string, current: boolean) => {
    await updateDoc(doc(db, 'banners', id), { isActive: !current });
  };

  return (
    <div className="space-y-8 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">إدارة البنرات</h1>
          <p className="text-muted-foreground text-sm">البنرات التي تظهر في الصفحة الرئيسية.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl font-bold h-11 gap-2 shadow-lg">
              <Plus className="h-5 w-5" /> إضافة بنر
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[28px] max-w-lg">
            <DialogHeader><DialogTitle className="text-xl font-black">بنر جديد</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-5 pt-4">
               <div className="space-y-2">
                 <Label className="font-bold">العنوان</Label>
                 <Input name="title" required placeholder="مثال: خصم 20%" className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">الوصف</Label>
                 <Input name="subtitle" placeholder="مثال: على كافة قطع الغيار" className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">الرابط</Label>
                 <Input name="link" placeholder="/catalog" className="rounded-xl h-12 bg-muted/20 border-none text-left" dir="ltr" />
               </div>
               <div className="space-y-4">
                 <Label className="font-bold">الصورة (1200x500)</Label>
                 <div className="relative aspect-[2.4/1] rounded-2xl border-2 border-dashed bg-muted/10 overflow-hidden flex items-center justify-center">
                    {uploadedImageUrl ? (
                      <Image src={uploadedImageUrl} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-30">
                         {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <ImageIcon className="h-10 w-10" />}
                         <span className="text-xs font-bold">{isUploading ? 'جاري الرفع...' : 'ارفع صورة'}</span>
                      </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={isUploading} />
                 </div>
               </div>
               <DialogFooter>
                 <Button type="submit" disabled={isUploading || !uploadedImageUrl} className="w-full h-12 rounded-xl font-black">نشر البنر</Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-52 rounded-[28px]" />)
        ) : banners.map((banner: any) => (
          <Card key={banner.id} className="rounded-[28px] border-none shadow-sm overflow-hidden group">
            <div className="relative aspect-[2.4/1]">
               <Image src={banner.image} alt={banner.title} fill className="object-cover" />
               <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-black">{banner.title}</h3>
                  <p className="text-xs opacity-80">{banner.subtitle}</p>
               </div>
               <div className="absolute top-4 right-4 flex gap-2">
                  <div className="bg-white/90 backdrop-blur rounded-full px-3 py-1 flex items-center gap-2 shadow-lg">
                     <span className="text-[10px] font-black text-black">نشط</span>
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
