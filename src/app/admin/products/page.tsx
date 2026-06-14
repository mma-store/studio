
'use client';

import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Image as ImageIcon,
  ArrowUpDown,
  Download,
  Trash2,
  Edit2,
  Eye,
  Loader2,
  X
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, addDoc, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

export default function ProductsManagementPage() {
  const db = useFirestore();
  const productsQuery = useMemo(() => query(collection(db, 'products'), orderBy('createdAt', 'desc')), [db]);
  const { data: products, loading } = useCollection(productsQuery);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const filteredProducts = products.filter((p: any) => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.barcode?.includes(searchQuery)
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file));
      const urls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...urls]);
      toast({ title: "تم الرفع", description: "تم رفع الصور بنجاح إلى Cloudinary." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في الرفع", description: "تعذر رفع الصور." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const productData = {
      name: formData.get('name'),
      barcode: formData.get('barcode'),
      category: formData.get('category'),
      retailPrice: Number(formData.get('retailPrice')),
      wholesalePrice: Number(formData.get('wholesalePrice')),
      purchasePrice: Number(formData.get('purchasePrice')),
      stock: Number(formData.get('stock')),
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
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حفظ المنتج." });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
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
             <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">إضافة منتج جديد للمتجر</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="space-y-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-bold">اسم المنتج</Label>
                        <Input name="name" required placeholder="مثال: فلتر زيت أصلي" className="rounded-xl h-12 bg-muted/30 border-none" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">الباركود</Label>
                        <Input name="barcode" placeholder="697000..." className="rounded-xl h-12 bg-muted/30 border-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold">سعر الشراء</Label>
                          <Input name="purchasePrice" type="number" required className="rounded-xl h-12 bg-muted/30 border-none" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">سعر المفرد</Label>
                          <Input name="retailPrice" type="number" required className="rounded-xl h-12 bg-muted/30 border-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-bold">سعر الجملة</Label>
                          <Input name="wholesalePrice" type="number" className="rounded-xl h-12 bg-muted/30 border-none" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold">الكمية المتوفرة</Label>
                          <Input name="stock" type="number" required className="rounded-xl h-12 bg-muted/30 border-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-bold">التصنيف</Label>
                        <Input name="category" required placeholder="مثال: محركات" className="rounded-xl h-12 bg-muted/30 border-none" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">موقع التخزين</Label>
                        <Input name="storageLocation" placeholder="مثال: رف A1" className="rounded-xl h-12 bg-muted/30 border-none" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">وصف المنتج</Label>
                        <Textarea name="description" className="rounded-xl min-h-[100px] bg-muted/30 border-none" />
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                         <Checkbox name="isFeatured" id="isFeatured" />
                         <label htmlFor="isFeatured" className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            تمييز المنتج في الواجهة الرئيسية
                         </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <Label className="font-bold">صور المنتج (Cloudinary)</Label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                       {uploadedImages.map((url, i) => (
                         <div key={i} className="relative aspect-square rounded-xl overflow-hidden border bg-muted">
                            <Image src={url} alt="Uploaded" fill className="object-cover" />
                            <button 
                              type="button" 
                              onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                         </div>
                       ))}
                       <label className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors gap-2 text-muted-foreground">
                          {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6" />}
                          <span className="text-[10px] font-bold">رفع صورة</span>
                          <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                       </label>
                    </div>
                  </div>

                  <DialogFooter className="pt-6">
                    <Button type="button" variant="outline" className="rounded-xl h-12 px-8" onClick={() => setIsAddDialogOpen(false)}>إلغاء</Button>
                    <Button type="submit" className="rounded-xl h-12 px-12 shadow-lg shadow-primary/20" disabled={isUploading}>حفظ المنتج</Button>
                  </DialogFooter>
                </form>
             </DialogContent>
           </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="بحث بالاسم، الباركود، أو الفئة..." 
            className="h-12 rounded-xl bg-white dark:bg-card pr-10 border-none shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 rounded-xl border-none shadow-sm bg-white dark:bg-card px-6 gap-2 font-bold">
           <Filter className="h-4 w-4" /> تصفية
        </Button>
      </div>

      <div className="rounded-[32px] border-none bg-white dark:bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-right font-black text-xs uppercase tracking-widest py-5">المنتج</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">التصنيف</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">السعر (مفرد)</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">المخزون</TableHead>
              <TableHead className="text-right font-black text-xs uppercase tracking-widest">الحالة</TableHead>
              <TableHead className="text-left font-black text-xs uppercase tracking-widest">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="flex items-center gap-3"><Skeleton className="h-12 w-12 rounded-xl" /><Skeleton className="h-4 w-32" /></div></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-muted/5 transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-3 py-1">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-muted shadow-inner">
                        <Image 
                          src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/100/100`} 
                          alt={p.name} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm leading-tight">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">{p.barcode || 'لا يوجد باركود'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-full bg-muted/50 text-[10px] font-bold px-3">{p.category}</Badge>
                  </TableCell>
                  <TableCell className="font-black text-primary">{p.retailPrice?.toLocaleString()} د.ع</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                       <span className={cn("font-bold text-sm", p.stock < 10 ? "text-destructive" : "")}>{p.stock} قطعة</span>
                       <span className="text-[10px] text-muted-foreground font-medium">{p.storageLocation || 'غير محدد'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "rounded-full px-3 py-1 border-none font-bold text-[10px]",
                      p.status === 'available' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                       {p.status === 'available' ? 'متوفر' : 'غير متوفر'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-muted"><MoreHorizontal className="h-5 w-5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48">
                        <DropdownMenuLabel className="font-bold">الإجراءات</DropdownMenuLabel>
                        <DropdownMenuItem className="rounded-xl gap-2 font-medium cursor-pointer"><Eye className="h-4 w-4" /> عرض التفاصيل</DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl gap-2 font-medium cursor-pointer"><Edit2 className="h-4 w-4" /> تعديل المنتج</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="rounded-xl gap-2 font-medium cursor-pointer text-destructive"
                          onClick={() => handleDeleteProduct(p.id)}
                        >
                          <Trash2 className="h-4 w-4" /> حذف المنتج
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 opacity-20" />
                    <p className="font-bold">لا توجد منتجات مطابقة للبحث</p>
                    <Button onClick={() => setSearchQuery("")} variant="link" className="text-primary font-bold">مسح البحث</Button>
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
