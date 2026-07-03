
'use client';

import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Layers, Edit2, Trash2, ImageIcon, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { uploadToCloudinary, getOptimizedUrl } from "@/lib/cloudinary";

export default function CategoriesPage() {
  const db = useFirestore();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const categoriesQuery = useMemo(() => query(collection(db, 'categories'), orderBy('name')), [db]);
  const { data: categories, loading } = useCollection(categoriesQuery);

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingCategory(null);
      setUploadedImageUrl("");
    }
  }, [isDialogOpen]);

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
      toast({ variant: "destructive", title: "خطأ في الرفع" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    
    const categoryData = {
      name: name,
      image: uploadedImageUrl,
      updatedAt: Date.now()
    };

    try {
      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), categoryData);
        toast({ title: "تم تحديث القسم بنجاح" });
      } else {
        await addDoc(collection(db, 'categories'), { 
          ...categoryData, 
          itemsCount: 0, 
          createdAt: Date.now() 
        });
        toast({ title: "تم إضافة القسم الجديد بنجاح" });
      }
      setIsDialogOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحفظ" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditInit = (cat: any) => {
    setEditingCategory(cat);
    setUploadedImageUrl(cat.image || "");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟ سيؤدي ذلك لإزالة التصنيف من كافة المنتجات التابعة له.")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      toast({ title: "تم حذف القسم بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحذف" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black">إدارة الأقسام</h1>
          <p className="text-muted-foreground font-medium text-sm">أضف تصنيفات لقطع الغيار لتنظيم المتجر الإلكتروني.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5" /> إضافة قسم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px] max-w-md border-none shadow-2xl p-0 overflow-hidden">
            <div className="bg-primary p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-right">
                  {editingCategory ? "تعديل بيانات القسم" : "إنشاء قسم جديد"}
                </DialogTitle>
                <DialogDescription className="text-white/80 font-bold text-right">أدخل اسماً مميزاً وصورة تعبر عن محتوى القسم.</DialogDescription>
              </DialogHeader>
            </div>
            <form onSubmit={handleAction} className="p-8 space-y-6">
               <div className="space-y-2">
                 <Label className="font-bold mr-1">اسم القسم</Label>
                 <Input name="name" defaultValue={editingCategory?.name} required placeholder="مثال: فلاتر زيت، إطارات..." className="rounded-xl h-12 bg-muted/30 border-none px-4 font-bold" />
               </div>
               
               <div className="space-y-4">
                 <Label className="font-bold mr-1">صورة القسم</Label>
                 <div className="relative aspect-[16/9] rounded-2xl border-2 border-dashed border-primary/20 bg-muted/10 overflow-hidden flex items-center justify-center group">
                    {uploadedImageUrl ? (
                      <>
                        <Image src={getOptimizedUrl(uploadedImageUrl)} alt="Preview" fill className="object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setUploadedImageUrl("")}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-40">
                         {isUploading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <ImageIcon className="h-10 w-10 text-primary" />}
                         <span className="text-xs font-black">{isUploading ? 'جاري الرفع...' : 'اضغط لاختيار صورة'}</span>
                      </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={isUploading} accept="image/*" />
                 </div>
               </div>

               <DialogFooter className="pt-4">
                 <Button type="submit" disabled={isUploading || isSaving} className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-xl">
                   {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                   {editingCategory ? "حفظ التغييرات" : "نشر القسم الجديد"}
                 </Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="ابحث عن قسم..." 
          className="h-14 rounded-2xl pr-12 border-none shadow-sm bg-white text-lg font-bold" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <div className="rounded-[32px] overflow-hidden bg-white shadow-sm border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-right py-6 px-8 font-black text-xs uppercase tracking-widest">القسم</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">عدد المنتجات</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest text-left px-8">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-8"><div className="flex items-center gap-3"><Skeleton className="h-12 w-12 rounded-xl" /><Skeleton className="h-4 w-32" /></div></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell className="px-8 text-left"><Skeleton className="h-8 w-16" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((cat: any) => (
              <TableRow key={cat.id} className="hover:bg-muted/5 transition-colors group">
                <TableCell className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-muted relative overflow-hidden border shadow-inner shrink-0">
                      {cat.image ? (
                        <Image src={getOptimizedUrl(cat.image, { thumbnail: true })} alt={cat.name} fill className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center opacity-20"><ImageIcon className="h-6 w-6" /></div>
                      )}
                    </div>
                    <span className="font-black text-lg text-slate-800">{cat.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-black text-primary text-lg">{cat.itemsCount || 0}</TableCell>
                <TableCell className="text-left px-8">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="rounded-xl text-primary hover:bg-primary/5" onClick={() => handleEditInit(cat)}>
                      <Edit2 className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-xl text-destructive hover:bg-destructive/5" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-20 opacity-30">
                  <div className="flex flex-col items-center gap-4">
                    <Layers className="h-16 w-16" strokeWidth={1} />
                    <p className="font-black text-xl">لا توجد أقسام مضافة حالياً.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
