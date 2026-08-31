
'use client';

import { 
  Plus, 
  Search, 
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
  Save,
  Zap,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { InventoryService } from "@/services/inventory-service";
import { cn } from "@/lib/utils";

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        InventoryService.getProducts(),
        InventoryService.getCategories()
      ]);
      setProducts(p);
      setCategories(c);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل تحميل البيانات المحلية" });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => 
      (p.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
      (p.barcode || "").includes(searchQuery)
    );
  }, [products, searchQuery]);

  const handleAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    const productData = {
      id: editingProduct?.id,
      name: formData.get('name'),
      barcode: formData.get('barcode'),
      category: formData.get('category'),
      retailPrice: Number(formData.get('retailPrice')),
      purchasePrice: Number(formData.get('purchasePrice')),
      stockQuantity: Number(formData.get('stock')),
      description: formData.get('description'),
    };

    try {
      await InventoryService.saveProduct(productData);
      toast({ title: "تم الحفظ بنجاح محلياً" });
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في الحفظ في SQLite" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف نهائي من الجهاز؟")) return;
    await InventoryService.deleteProduct(id);
    loadData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">إدارة المنتجات (SQLite)</h1>
          <p className="text-muted-foreground font-medium text-sm">DUBSAR 2.0 Local Storage Core</p>
        </div>
        <div className="flex items-center gap-3">
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
             <DialogTrigger asChild>
                <Button className="rounded-xl font-bold h-11 gap-2">
                  <Plus className="h-5 w-5" /> إضافة منتج
                </Button>
             </DialogTrigger>
             <DialogContent className="max-w-2xl rounded-[32px]">
                <form onSubmit={handleAction} className="space-y-6">
                  <DialogHeader><DialogTitle className="text-2xl font-black">منتج جديد</DialogTitle></DialogHeader>
                  <div className="grid grid-cols-2 gap-4" dir="rtl">
                    <div className="space-y-2">
                      <Label>الاسم</Label>
                      <Input name="name" defaultValue={editingProduct?.name} required />
                    </div>
                    <div className="space-y-2">
                      <Label>الباركود</Label>
                      <Input name="barcode" defaultValue={editingProduct?.barcode} />
                    </div>
                    <div className="space-y-2">
                      <Label>سعر الشراء</Label>
                      <Input name="purchasePrice" type="number" defaultValue={editingProduct?.purchasePrice} />
                    </div>
                    <div className="space-y-2">
                      <Label>سعر البيع</Label>
                      <Input name="retailPrice" type="number" defaultValue={editingProduct?.retailPrice} />
                    </div>
                    <div className="space-y-2">
                      <Label>الكمية</Label>
                      <Input name="stock" type="number" defaultValue={editingProduct?.stockQuantity} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin" /> : "حفظ في القاعدة المحلية"}</Button>
                  </DialogFooter>
                </form>
             </DialogContent>
           </Dialog>
        </div>
      </div>

      <div className="relative max-w-md" dir="rtl">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="بحث..." className="h-14 rounded-2xl pr-12 border-none shadow-sm bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="rounded-[32px] border-none bg-white shadow-sm overflow-hidden" dir="rtl">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="text-right py-6 px-6 font-black">المنتج</TableHead>
              <TableHead className="text-right font-black">الأسعار</TableHead>
              <TableHead className="text-right font-black">المخزون</TableHead>
              <TableHead className="text-left px-6 font-black">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(3).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={4} className="p-8"><Skeleton className="h-10 w-full" /></TableCell></TableRow>)
            ) : filteredProducts.map((p: any) => (
              <TableRow key={p.id} className="hover:bg-muted/5">
                <TableCell className="px-6 font-bold">{p.name}</TableCell>
                <TableCell className="font-black text-primary">{p.retailPrice?.toLocaleString()} د.ع</TableCell>
                <TableCell className="font-black">{p.stockQuantity} قطعة</TableCell>
                <TableCell className="text-left px-6">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => {setEditingProduct(p); setIsDialogOpen(true);}}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
