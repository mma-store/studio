
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
  History
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
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, addDoc, doc, deleteDoc } from "firebase/firestore";
import { useMemo, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { uploadToCloudinary, getOptimizedUrl } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

export default function ProductsManagementPage() {
  const db = useFirestore();
  const productsQuery = useMemo(() => query(collection(db, 'products'), orderBy('createdAt', 'desc')), [db]);
  const { data: products, loading } = useCollection(productsQuery);
  
  // Fetch existing categories
  const categoriesQuery = useMemo(() => query(collection(db, 'categories'), orderBy('name')), [db]);
  const { data: categories } = useCollection(categoriesQuery);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
      toast({ variant: "destructive", title: "خطأ في الرفع", description: "فشل رفع بعض الصور، يرجى المحاولة لاحقاً." });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) return;
    if (!selectedCategory) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى اختيار القسم أولاً." });
      return;
    }
    
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    const productData = {
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
      status: 'available',
      isFeatured: formData.get('isFeatured') === 'on',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      await addDoc(collection(db, 'products'), productData);
      toast({ title: "تم الإضافة", description: "تم إضافة المنتج بنجاح." });
      setIsAddDialogOpen(false);
      setUploadedImages([]);
      setSelectedCategory("");
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حفظ المنتج." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج نهائياً؟ سيتم إزالة الروابط الصور من النظام.")) return;
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
           
           <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
             <DialogTrigger asChild>
                <Button className="rounded-xl font-bold h-11 shadow-lg shadow-primary/20 gap-2">
                  <Plus className="h-5 w-5" /> إضافة منتج جديد
                </Button>
             </DialogTrigger>
             <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] p-0 border-none shadow-2xl">
                <div className="p-8 space-y-6">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black text-right">إضافة منتج جديد</DialogTitle>
                    <DialogDescription className="text-muted-foreground font-bold text-right">يرجى ملء كافة التفاصيل لضمان ظهور المنتج بشكل صحيح للزبائن.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-8 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8" dir="rtl">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="font-bold">اسم المنتج</Label>
                          <Input name="name" required placeholder="مثال: فلتر زيت أصلي" className="rounded-2xl h-14 bg-muted/30 border-none px-6 text-lg font-bold" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">الباركود</Label>
                          <Input name="barcode" placeholder="697000..." className="rounded-2xl h-14 bg-muted/30 border-none px-6 text-lg" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="font-bold">سعر الشراء</Label>
                            <Input name="purchasePrice" type="number" required className="rounded-2xl h-14 bg-muted/30 border-none text-center font-black text-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">سعر المفرد</Label>
                            <Input name="retailPrice" type="number" required className="rounded-2xl h-14 bg-muted/30 border-none text-center font-black text-xl text-primary" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="font-bold">سعر الجملة</Label>
                            <Input name="wholesalePrice" type="number" className="rounded-2xl h-14 bg-muted/30 border-none text-center font-black text-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">الكمية المتوفرة</Label>
                            <Input name="stock" type="number" required className="rounded-2xl h-14 bg-muted/30 border-none text-center font-black text-xl" />
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
                          <p className="text-[10px] text-muted-foreground mr-1 font-bold">يجب أن يكون القسم مضافاً مسبقاً من صفحة الأقسام.</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">موقع التخزين</Label>
                          <Input name="storageLocation" placeholder="مثال: رف A1" className="rounded-2xl h-14 bg-muted/30 border-none px-6" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">وصف المنتج</Label>
                          <Textarea name="description" placeholder="اكتب تفاصيل إضافية عن المنتج هنا..." className="rounded-2xl min-h-[120px] bg-muted/30 border-none p-6 text-sm font-medium leading-relaxed" />
                        </div>
                        <div className="flex items-center gap-2 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                           <Checkbox name="isFeatured" id="isFeatured" />
                           <label htmlFor="isFeatured" className="text-sm font-bold cursor-pointer select-none">
                              تمييز المنتج في الواجهة الرئيسية للمتجر
                           </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t" dir="rtl">
                      <div className="flex items-center justify-between">
                         <Label className="font-black text-lg">صور المنتج</Label>
                         <span className="text-xs text-muted-foreground font-bold">يمكنك اختيار ملفات أو التصوير مباشرة</span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                         {uploadedImages.map((url, i) => (
                           <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 bg-muted shadow-sm group">
                              <Image src={getOptimizedUrl(url, { thumbnail: true })} alt="Uploaded" fill className="object-cover" />
                              <button 
                                type="button" 
                                onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                              >
                                <X className="h-3 w-3" />
                              </button>
                           </div>
                         ))}

                         <button
                           type="button"
                           disabled={isUploading}
                           onClick={() => cameraInputRef.current?.click()}
                           className={cn(
                             "aspect-square rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-all bg-white dark:bg-slate-900 group",
                             isUploading && "opacity-50 pointer-events-none"
                           )}
                         >
                            <Camera className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-primary">تصوير منتج</span>
                            <input 
                              type="file" 
                              ref={cameraInputRef}
                              accept="image/*" 
                              capture="environment" 
                              className="hidden" 
                              onChange={handleImageUpload} 
                            />
                         </button>

                         <button
                           type="button"
                           disabled={isUploading}
                           onClick={() => fileInputRef.current?.click()}
                           className={cn(
                             "aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:bg-muted/10 transition-all bg-white dark:bg-slate-900",
                             isUploading && "opacity-50 pointer-events-none"
                           )}
                         >
                            {isUploading ? (
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            ) : (
                              <Upload className="h-8 w-8 text-muted-foreground" />
                            )}
                            <span className="text-[10px] font-black text-muted-foreground">من الاستوديو</span>
                            <input 
                              type="file" 
                              ref={fileInputRef}
                              multiple 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleImageUpload} 
                            />
                         </button>
                      </div>
                    </div>

                    <DialogFooter className="pt-8 gap-4 flex-row justify-end" dir="rtl">
                      <Button type="submit" className="rounded-2xl h-14 px-12 shadow-xl shadow-primary/20 font-black text-lg gap-2" disabled={isUploading || isSaving}>
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                        حفظ المنتج والنشـر
                      </Button>
                      <Button type="button" variant="ghost" className="rounded-xl h-14 px-8 font-bold" onClick={() => setIsAddDialogOpen(false)}>إلغاء</Button>
                    </DialogFooter>
                  </form>
                </div>
             </DialogContent>
           </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4" dir="rtl">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="بحث بالاسم، الباركود، أو الفئة..." 
            className="h-14 rounded-2xl bg-white dark:bg-card pr-12 border-none shadow-sm text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-14 rounded-2xl border-none shadow-sm bg-white dark:bg-card px-8 gap-2 font-black">
           <Filter className="h-5 w-5" /> تصفية النتائج
        </Button>
      </div>

      <div className="rounded-[32px] border-none bg-white dark:bg-card shadow-sm overflow-hidden" dir="rtl">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-right font-black text-xs uppercase tracking-widest py-6 px-6">المنتج والباركود</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">التصنيف</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">الأسعار (تكلفة/مفرد)</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">المخزون</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">آخر تجهيز</TableHead>
              <TableHead className="text-left font-black text-xs uppercase tracking-widest px-6">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><div className="flex items-center gap-3"><Skeleton className="h-14 w-14 rounded-xl" /><div className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-20" /></div></div></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="px-6 text-left"><Skeleton className="h-10 w-10 rounded-xl" /></TableCell>
                </TableRow>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-muted/5 transition-colors group">
                  <TableCell className="px-6">
                    <div className="flex items-center gap-4 py-2">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 bg-muted shadow-sm transition-transform group-hover:scale-105">
                        {p.images?.[0] ? (
                          <Image 
                            src={getOptimizedUrl(p.images[0], { thumbnail: true })} 
                            alt={p.name} 
                            fill 
                            className="object-cover" 
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <ImageIcon className="h-5 w-5 opacity-20" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-black text-sm leading-tight line-clamp-1">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground font-black tracking-widest uppercase flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" /> {p.barcode || 'لا يوجد باركود'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-full bg-muted/60 text-[10px] font-black px-4 py-1 border-none">{p.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                       <span className="text-primary font-black text-sm">مفرد: {(p.retailPrice || 0).toLocaleString()}</span>
                       <span className="text-muted-foreground font-bold text-[10px]">تكلفة: {(p.purchasePrice || 0).toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                       <span className={cn("font-black text-sm", (p.stock || 0) < 10 ? "text-destructive" : "text-foreground")}>{p.stock || 0} قطعة</span>
                       <span className="text-[10px] text-muted-foreground font-bold">{p.storageLocation || 'غير محدد'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black">{p.lastPurchaseDate ? new Date(p.lastPurchaseDate).toLocaleDateString("ar-EG") : '-'}</span>
                       {p.lastPurchasePrice && <span className="text-[9px] text-muted-foreground font-bold">بـ {p.lastPurchasePrice.toLocaleString()} د.ع</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-left px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-muted group-active:scale-90 transition-all"><MoreHorizontal className="h-5 w-5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-[24px] p-2 w-52 shadow-2xl border-none">
                        <DropdownMenuLabel className="font-black text-xs uppercase tracking-widest p-3 opacity-50">الإجراءات</DropdownMenuLabel>
                        <DropdownMenuItem className="rounded-xl gap-3 p-3 font-bold cursor-pointer" onClick={() => window.open(`/product/${p.id}`, '_blank')}><Eye className="h-4 w-4 text-blue-500" /> عرض وتفاصيل</DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl gap-3 p-3 font-bold cursor-pointer"><Edit2 className="h-4 w-4 text-orange-500" /> تعديل البيانات</DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl gap-3 p-3 font-bold cursor-pointer text-primary"><History className="h-4 w-4" /> سجل المشتريات</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="rounded-xl gap-3 p-3 font-bold cursor-pointer text-destructive hover:bg-destructive/5"
                          onClick={() => handleDeleteProduct(p.id)}
                        >
                          <Trash2 className="h-4 w-4" /> حذف المنتج نهائياً
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-80 text-center">
                  <div className="flex flex-col items-center justify-center gap-6 opacity-30">
                    <Package className="h-24 w-24" strokeWidth={1} />
                    <div className="space-y-1">
                      <p className="font-black text-2xl">لا توجد نتائج بحث</p>
                    </div>
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
