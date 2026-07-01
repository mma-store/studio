
'use client';

import { useState, useMemo } from "react";
import { Plus, Search, Layers, Edit2, Trash2, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc, addDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/cloudinary";

export default function CategoriesPage() {
  const db = useFirestore();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const categoriesQuery = useMemo(() => query(collection(db, 'categories'), orderBy('name')), [db]);
  const { data: categories, loading } = useCollection(categoriesQuery);

  const filtered = categories.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setUploadedImageUrl(url);
      toast({ title: "تم رفع الصورة بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل رفع الصورة." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addDoc(collection(db, 'categories'), {
        name: formData.get('name'),
        image: uploadedImageUrl,
        itemsCount: 0,
        createdAt: Date.now()
      });
      setIsAddOpen(false);
      setUploadedImageUrl("");
      toast({ title: "تم الإضافة", description: "تم إضافة القسم الجديد بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ القسم." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟ سيتم حذف التصنيف فقط ولن تُحذف المنتجات المرتبطة به.")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      toast({ title: "تم الحذف", description: "تم حذف القسم بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحذف." });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">الأقسام</h1>
          <p className="text-muted-foreground font-medium">إدارة تصنيفات المنتجات في المتجر.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2 h-12 px-6 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" /> إضافة قسم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px]">
            <DialogHeader><DialogTitle className="text-2xl font-black">قسم جديد</DialogTitle></DialogHeader>
            <form onSubmit={handleAddCategory} className="space-y-6 pt-4">
               <div className="space-y-2">
                 <Label className="font-bold">اسم القسم</Label>
                 <Input name="name" required placeholder="مثال: محركات، سكوترات..." className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <div className="space-y-4">
                 <Label className="font-bold">صورة القسم</Label>
                 <div className="relative aspect-video rounded-2xl border-2 border-dashed bg-muted/10 overflow-hidden flex items-center justify-center">
                    {uploadedImageUrl ? (
                      <Image src={uploadedImageUrl} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-30">
                         {isUploading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <ImageIcon className="h-10 w-10" />}
                         <span className="text-xs font-bold">{isUploading ? 'جاري الرفع...' : 'ارفع صورة'}</span>
                      </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={isUploading} />
                 </div>
               </div>
               <DialogFooter>
                 <Button type="submit" disabled={isUploading || isSaving} className="w-full h-12 rounded-xl font-black">
                   {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "حفظ القسم"}
                 </Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="ابحث عن قسم..." 
          className="h-12 rounded-xl pr-10 border-none shadow-sm bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-[32px] overflow-hidden bg-white shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-right py-5">القسم</TableHead>
              <TableHead className="text-right">عدد المنتجات</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((cat: any) => (
              <TableRow key={cat.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden relative border">
                      <Image src={cat.image || `https://picsum.photos/seed/${cat.id}/100/100`} alt={cat.name} fill className="object-cover" />
                    </div>
                    <span className="font-bold">{cat.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-bold">{cat.itemsCount || 0}</TableCell>
                <TableCell className="text-left">
                  <div className="flex justify-end gap-2 px-4">
                    <Button variant="ghost" size="icon" className="rounded-lg hover:bg-primary/5 text-primary"><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-lg text-destructive hover:bg-red-50" onClick={() => handleDelete(cat.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10 opacity-30 font-bold">لا يوجد أقسام حالياً.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
