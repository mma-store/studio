
'use client';

import { useState, useMemo } from "react";
import { Plus, Edit2, ImageIcon, Loader2, Save, AlertTriangle } from "lucide-react";
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
import { useTenant } from "@/hooks/use-tenant";
import { collection, query, orderBy, doc, addDoc, updateDoc, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { uploadToCloudinary, getOptimizedUrl } from "@/lib/cloudinary";

export default function CategoriesPage() {
  const db = useFirestore();
  const { tenantId, isLinkedToStore } = useTenant();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const categoriesQuery = useMemo(() => {
    if (!tenantId) return null;
    return query(
      collection(db, 'categories'), 
      where('tenantId', '==', tenantId),
      orderBy('name')
    );
  }, [db, tenantId]);
  
  const { data: categories, loading } = useCollection(categoriesQuery);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setUploadedImageUrl(url);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الرفع" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // VERIFY TENANT BEFORE WRITE - CRITICAL FOR saas-prod
    if (!tenantId || !isLinkedToStore) {
      console.error("DIAGNOSTIC: Write blocked - No active tenantId context found.");
      toast({ variant: "destructive", title: "خطأ أمني", description: "لم يتم التعرف على متجرك. يرجى تسجيل الدخول مجدداً." });
      return;
    }
    
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    
    const categoryData = {
      tenantId,
      name,
      image: uploadedImageUrl,
      updatedAt: Date.now()
    };

    console.log("DIAGNOSTIC: CATEGORY WRITE STARTED", { database: 'saas-prod', tenantId, categoryData });

    try {
      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), categoryData);
        console.log("DIAGNOSTIC: CATEGORY WRITE SUCCESS (Update)", editingCategory.id);
        toast({ title: "تم التحديث بنجاح" });
      } else {
        const finalData = { ...categoryData, itemsCount: 0, createdAt: Date.now() };
        const docRef = await addDoc(collection(db, 'categories'), finalData);
        console.log("DIAGNOSTIC: CATEGORY WRITE SUCCESS (Add)", docRef.id);
        toast({ title: "تمت الإضافة بنجاح" });
      }
      setIsDialogOpen(false);
      setUploadedImageUrl("");
      setEditingCategory(null);
    } catch (error: any) {
      console.error("DIAGNOSTIC: CATEGORY WRITE FAILED", { code: error.code, message: error.message });
      toast({ variant: "destructive", title: "فشل الحفظ", description: `Firestore Error: ${error.code}` });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLinkedToStore && !loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-[40px] gap-4">
        <AlertTriangle className="h-16 w-16 text-red-600" />
        <h2 className="text-2xl font-black text-red-900">غير مرتبط بمتجر</h2>
        <p className="text-red-700 font-medium">يبدو أن حسابك غير مرتبط بمتجر في النظام الجديد. يرجى إتمام عملية التأسيس.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black">إدارة الأقسام</h1>
          <p className="text-muted-foreground font-medium text-sm">قاعدة البيانات الحالية: <span className="text-primary font-bold">saas-prod</span></p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 font-bold gap-2">
              <Plus className="h-5 w-5" /> إضافة قسم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-right">قسم جديد</DialogTitle>
              <DialogDescription className="text-right">سيتم ربط هذا القسم بالمتجر: {tenantId}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAction} className="space-y-6 pt-4">
               <div className="space-y-2">
                 <Label className="font-bold">اسم القسم</Label>
                 <Input name="name" defaultValue={editingCategory?.name} required className="rounded-xl h-12 bg-muted/30 border-none font-bold" />
               </div>
               
               <div className="space-y-4">
                 <Label className="font-bold">صورة القسم</Label>
                 <div className="relative aspect-video rounded-2xl border-2 border-dashed bg-muted/10 overflow-hidden flex items-center justify-center">
                    {uploadedImageUrl ? (
                      <Image src={getOptimizedUrl(uploadedImageUrl)} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-40">
                         {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <ImageIcon className="h-10 w-10" />}
                         <span className="text-xs font-black">اضغط لرفع صورة</span>
                      </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} disabled={isUploading} accept="image/*" />
                 </div>
               </div>

               <DialogFooter>
                 <Button type="submit" disabled={isSaving || isUploading} className="w-full h-14 rounded-2xl font-black text-lg">
                   {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                   تأكيد الحفظ في saas-prod
                 </Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-[32px] overflow-hidden bg-white shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-right py-6 px-8">القسم</TableHead>
              <TableHead className="text-right">عدد العناصر</TableHead>
              <TableHead className="text-left px-8">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(3).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={3} className="p-8"><Skeleton className="h-10 w-full" /></TableCell></TableRow>)
            ) : categories.length > 0 ? (
              categories.map((cat: any) => (
                <TableRow key={cat.id}>
                  <TableCell className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-muted relative overflow-hidden">
                        {cat.image && <Image src={cat.image} alt="" fill className="object-cover" />}
                      </div>
                      <span className="font-black">{cat.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">{cat.itemsCount || 0}</TableCell>
                  <TableCell className="text-left px-8">
                     <Button variant="ghost" size="icon" onClick={() => { setEditingCategory(cat); setUploadedImageUrl(cat.image || ""); setIsDialogOpen(true); }}><Edit2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={3} className="h-40 text-center opacity-30 font-bold">لا توجد أقسام في قاعدة البيانات الجديدة.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
