
'use client';

import { 
  Plus, 
  Trash2, 
  Tags,
  Loader2,
  Calendar,
  Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, addDoc, doc, deleteDoc, where } from "firebase/firestore";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function OffersPage() {
  const db = useFirestore();
  const { tenantId } = useUser();
  
  const offersQuery = useMemo(() => query(
    collection(db, 'offers'), 
    where('tenantId', '==', tenantId),
    orderBy('createdAt', 'desc')
  ), [db, tenantId]);
  const { data: offers, loading } = useCollection(offersQuery);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await addDoc(collection(db, 'offers'), {
        tenantId,
        title: formData.get('title'),
        description: formData.get('description'),
        buttonText: formData.get('buttonText') || "تسوق الآن",
        image: uploadedImageUrl,
        createdAt: Date.now()
      });
      setIsAddOpen(false);
      setUploadedImageUrl("");
      toast({ title: "تم الإضافة", description: "تم إضافة العرض بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحفظ." });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">العروض الخاصة</h1>
          <p className="text-muted-foreground font-medium text-sm">إدارة البطاقات التسويقية الملونة في الواجهة الرئيسية.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" /> إضافة عرض جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px]">
            <DialogHeader><DialogTitle className="text-2xl font-black">إضافة عرض ترويجي</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-6 pt-4">
               <div className="space-y-2">
                 <Label className="font-bold">عنوان العرض</Label>
                 <Input name="title" required placeholder="مثال: خصومات نهاية الأسبوع" className="rounded-xl h-12 bg-muted/30 border-none" />
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">الوصف القصير</Label>
                 <Textarea name="description" required placeholder="مثال: احصل على قطعة مجانية عند شراء أي قطعتين" className="rounded-xl bg-muted/30 border-none" />
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">نص الزر</Label>
                 <Input name="buttonText" placeholder="تسوق الآن" className="rounded-xl h-12 bg-muted/30 border-none" />
               </div>
               <DialogFooter>
                 <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg">حفظ العرض</Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-[32px]" />)
        ) : offers.map((offer: any) => (
          <Card key={offer.id} className="rounded-[32px] border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
               <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <Gift className="h-6 w-6" />
               </div>
               <div>
                  <h3 className="text-xl font-black">{offer.title}</h3>
                  <p className="text-sm opacity-70 mt-1 line-clamp-2">{offer.description}</p>
               </div>
               <Button variant="secondary" className="rounded-full font-black px-6 h-9">{offer.buttonText}</Button>
            </div>
            <button 
              onClick={() => deleteDoc(doc(db, 'offers', offer.id))}
              className="absolute top-4 left-4 h-8 w-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </Card>
        ))}
      </div>
    </div>
  );
}
