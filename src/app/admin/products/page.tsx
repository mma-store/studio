
'use client';

import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Image as ImageIcon,
  Download,
  Trash2,
  Edit2,
  Eye,
  Loader2,
  X,
  Package,
  Camera,
  Upload,
  History,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, addDoc, doc, deleteDoc, updateDoc, where } from "firebase/firestore";
import { useMemo, useState, useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { uploadToCloudinary, getOptimizedUrl } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ProductsManagementPage() {
  const db = useFirestore();
  const router = useRouter();
  const { tenantId } = useUser();
  
  const productsQuery = useMemo(() => query(
    collection(db, 'products'), 
    where('tenantId', '==', tenantId),
    orderBy('createdAt', 'desc')
  ), [db, tenantId]);
  const { data: products, loading } = useCollection(productsQuery);
  
  const categoriesQuery = useMemo(() => query(
    collection(db, 'categories'), 
    where('tenantId', '==', tenantId),
    orderBy('name')
  ), [db, tenantId]);
  const { data: categories } = useCollection(categoriesQuery);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isDialogOpen) {
      setEditingProduct(null);
      setUploadedImages([]);
      setSelectedCategory("");
    }
  }, [isDialogOpen]);

  const filteredProducts = products.filter((p: any) => 
    (p.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    (p.barcode || "").includes(searchQuery)
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const url = await uploadToCloudinary(files[i]);
        newUrls.push(url);
      }
      setUploadedImages(prev => [...prev, ...newUrls]);
      toast({ title: "تم الرفع", description: `تم رفع ${newUrls.length} صور بنجاح.` });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في الرفع", description: "فشل رفع بعض الصور." });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) return;
    if (!selectedCategory) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى اختيار القسم أولاً." });
      return;
    }
    
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    const productData: any = {
      tenantId,
      name: formData.get('name'),
      barcode: formData.get('barcode'),
      category: selectedCategory,
      retailPrice: Number(formData.get('retailPrice')) || 0,
      wholesalePrice: Number(formData.get('wholesalePrice')) || 0,
      purchasePrice: Number(formData.get('purchasePrice')) || 0,
      stock: Number(formData.get('stock')) || 0,
      description: formData.get('description'),
      storageLocation: formData.get('storageLocation'),
      images: uploadedImages,
      isFeatured: formData.get('isFeatured') === 'on',
      updatedAt: Date.now(),
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast({ title: "تم التحديث", description: "تم تحديث بيانات المنتج بنجاح." });
      } else {
        productData.createdAt = Date.now();
        productData.status = 'available';
        await addDoc(collection(db, 'products'), productData);
        toast({ title: "تم الإضافة", description: "تم إضافة المنتج بنجاح." });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حفظ البيانات." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditInit = (product: any) => {
    setEditingProduct(product);
    setUploadedImages(product.images || []);
    setSelectedCategory(product.category || "");
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج نهائياً؟")) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "تم الحذف", description: "تم حذف المنتج بنجاح." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حذف المنتج." });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">إدارة المنتجات</h1>
          <p className="text-muted-foreground font-medium text-sm">إضافة، تعديل، وحذف قطع الغيار والاكسسوارات.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-xl border-2 font-bold h-11 gap-2">
             <Download className="h-4 w-4" /> تصدير Excel
           </Button>
           
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
             <DialogTrigger asChild>
                <Button className="rounded-xl font-bold h-11 shadow-lg shadow-primary/20 gap-2">
                  <Plus className="h-5 w-5" /> إضافة منتج جديد
                </Button>
             </DialogTrigger>
             <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] p-0 border-none shadow-2xl">
                <div className="p-8 space-y-6">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black text-right">
                      {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-bold text-right">يرجى ملء كافة التفاصيل لضمان ظهور المنتج بشكل صحيح.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAction} className="space-y-8 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8" dir="rtl">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="font-bold">اسم المنتج</Label>
                          <Input name="name" defaultValue={editingProduct?.name} required placeholder="مثال: فلتر زيت أصلي" className="rounded-2xl h-14 bg-muted/30 border-none px-6 text-lg font-bold" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">الباركود</Label>
                          <Input name="barcode" defaultValue={editingProduct?.barcode} placeholder="697000..." className="rounded-2xl h-14 bg-muted/30 border-none px-6 text-lg" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="font-bold">سعر الشراء</Label>
                            <Input name="purchasePrice" defaultValue={editingProduct?.purchasePrice} type="number" required className="rounded-2xl h-14 bg-muted/30 border-none text-center font-black text-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">سعر المفرد</Label>
                            <Input name="retailPrice" defaultValue={editingProduct?.retailPrice} type="number" required className="rounded-2xl h-14 bg-muted/30 border-none text-center font-black text-xl text-primary" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="font-bold">سعر الجملة</Label>
                            <Input name="wholesalePrice" defaultValue={editingProduct?.wholesalePrice} type="number" className="rounded-2xl h-14 bg-muted/30 border-none text-center font-black text-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">الكمية المتوفرة</Label>
                            <Input name="stock" defaultValue={editingProduct?.stock} type="number" required className="rounded-2xl h-14 bg-muted/30 border-none text-center font-black text-xl" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="font-bold">القسم (التصنيف)</Label>
                          <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                            <SelectTrigger className="rounded-2xl h-14 bg-muted/30 border-none px-6 text-lg font-bold">
                              <SelectValue placeholder="اختر قسم المنتج" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl p-2 shadow-2xl border-none">
                              {categories.length > 0 ? (
                                categories.map((cat: any) => (
                                  <SelectItem key={cat.id} value={cat.name} className="rounded-xl font-bold py-3">
                                    {cat.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <p className="p-4 text-center text-xs opacity-50 font-bold">لا يوجد أقسام مضافة</p>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">موقع التخزين</Label>
                          <Input name="storageLocation" defaultValue={editingProduct?.storageLocation} placeholder="مثال: رف A1" className="rounded-2xl h-14 bg-muted/30 border-none px-6" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">وصف المنتج</Label>
                          <Textarea name="description" defaultValue={editingProduct?.description} placeholder="اكتب تفاصيل إضافية..." className="rounded-2xl min-h-[120px] bg-muted/30 border-none p-6 text-sm font-medium" />
                        </div>
                        <div className="flex items-center gap-2 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                           <Checkbox name="isFeatured" id="isFeatured" defaultChecked={editingProduct?.isFeatured} />
                           <label htmlFor="isFeatured" className="text-sm font-bold cursor-pointer select-none">
                              تمييز المنتج في الواجهة الرئيسية
                           </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t" dir="rtl">
                      <Label className="font-black text-lg">صور المنتج</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                         {uploadedImages.map((url, i) => (
                           <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 bg-muted group">
                              <Image src={getOptimizedUrl(url, { thumbnail: true })} alt="Uploaded" fill className="object-cover" />
                              <button type="button" onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 z-10"><X className="h-3 w-3" /></button>
                           </div>
                         ))}
                         <button type="button" onClick={() => cameraInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-2 hover:bg-primary/5"><Camera className="h-8 w-8 text-primary" /><span className="text-[10px] font-black">تصوير</span></button>
                         <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:bg-muted/10">
                            {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
                            <span className="text-[10px] font-black">جهاز</span>
                         </button>
                         <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                         <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </div>
                    </div>

                    <DialogFooter className="pt-8 gap-4 flex-row justify-end" dir="rtl">
                      <Button type="submit" className="rounded-2xl h-14 px-12 shadow-xl font-black text-lg gap-2" disabled={isUploading || isSaving}>
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {editingProduct ? "حفظ التعديلات" : "حفظ المنتج والنشـر"}
                      </Button>
                      <Button type="button" variant="ghost" className="rounded-xl h-14 px-8 font-bold" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
                    </DialogFooter>
                  </form>
                </div>
             </DialogContent>
           </Dialog>
        </div>
      </div>

      <div className="relative max-w-md" dir="rtl">
        <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="بحث بالاسم، الباركود، أو الفئة..." 
          className="h-14 rounded-2xl bg-white pr-12 border-none shadow-sm text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-[32px] border-none bg-white shadow-sm overflow-hidden" dir="rtl">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/30">
              <TableHead className="text-right py-6 px-6 font-black text-xs">المنتج والباركود</TableHead>
              <TableHead className="text-right font-black text-xs">التصنيف</TableHead>
              <TableHead className="text-right font-black text-xs">الأسعار</TableHead>
              <TableHead className="text-right font-black text-xs">المخزون</TableHead>
              <TableHead className="text-left px-6 font-black text-xs">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><div className="flex items-center gap-3"><Skeleton className="h-14 w-14 rounded-xl" /><div className="space-y-2"><Skeleton className="h-4 w-40" /></div></div></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell className="px-6 text-left"><Skeleton className="h-10 w-10" /></TableCell>
                </TableRow>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-muted/5 transition-colors group">
                  <TableCell className="px-6">
                    <div className="flex items-center gap-4 py-2">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 bg-muted">
                        {p.images?.[0] ? <Image src={getOptimizedUrl(p.images[0], { thumbnail: true })} alt={p.name} fill className="object-cover" /> : <ImageIcon className="h-5 w-5 opacity-20" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-sm">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground font-black">{p.barcode || '---'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="rounded-full font-black text-[10px] px-3">{p.category}</Badge></TableCell>
                  <TableCell><span className="text-primary font-black text-sm">{(p.retailPrice || 0).toLocaleString()} د.ع</span></TableCell>
                  <TableCell><span className={cn("font-black text-sm", (p.stock || 0) < 5 ? "text-destructive" : "")}>{p.stock || 0} قطعة</span></TableCell>
                  <TableCell className="text-left px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-2xl"><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-[24px] p-2 w-52 shadow-2xl border-none">
                        <DropdownMenuItem className="rounded-xl gap-3 p-3 font-bold cursor-pointer" onClick={() => window.open(`/product/${p.id}`, '_blank')}><Eye className="h-4 w-4 text-blue-500" /> عرض وتفاصيل</DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl gap-3 p-3 font-bold cursor-pointer" onClick={() => handleEditInit(p)}><Edit2 className="h-4 w-4 text-orange-500" /> تعديل البيانات</DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl gap-3 p-3 font-bold cursor-pointer text-primary" onClick={() => router.push(`/admin/inventory?search=${p.name}`)}><History className="h-4 w-4" /> سجل المشتريات</DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl gap-3 p-3 font-bold cursor-pointer text-destructive" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="h-4 w-4" /> حذف المنتج</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="h-64 text-center opacity-30 font-black">لا توجد نتائج</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
