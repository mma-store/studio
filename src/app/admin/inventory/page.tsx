
'use client';

import { useState, useMemo } from "react";
import { Search, Box, AlertTriangle, History, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, where, addDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function InventoryPage() {
  const db = useFirestore();
  const { profile, tenantId } = useUser();
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newStock, setNewStock] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const productsQuery = useMemo(() => query(
    collection(db, 'products'), 
    where('tenantId', '==', tenantId),
    orderBy('stock', 'asc')
  ), [db, tenantId]);
  const { data: products, loading } = useCollection(productsQuery);

  const filtered = products.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search)
  );

  const handleUpdateStock = async () => {
    if (!editingProduct) return;
    setIsUpdating(true);
    
    const docRef = doc(db, 'products', editingProduct.id);
    const updateData = {
      stock: newStock,
      updatedAt: Date.now()
    };

    updateDoc(docRef, updateData)
      .then(() => {
        toast({ title: "تم التحديث", description: `تم تعديل كمية ${editingProduct.name} بنجاح.` });
        
        addDoc(collection(db, "auditLogs"), {
          tenantId,
          userId: profile?.uid || "admin",
          userName: profile?.displayName || "مدير",
          action: "تعديل مخزن يدوي",
          target: editingProduct.name,
          details: `تغيير الكمية من ${editingProduct.stock} إلى ${newStock}`,
          timestamp: Date.now()
        });
        
        setEditingProduct(null);
      })
      .catch(async (err) => {
        const perr = new FirestorePermissionError({
          path: docRef.path,
          operation: "update",
          requestResourceData: updateData
        });
        errorEmitter.emit('permission-error', perr);
      })
      .finally(() => setIsUpdating(false));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">إدارة المخزون</h1>
          <p className="text-muted-foreground font-medium">مراقبة مستويات المخزون وتنبيهات النقص.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl gap-2 h-11 border-2 font-bold"><History className="h-4 w-4" /> سجل الحركات</Button>
          <Button className="rounded-xl gap-2 h-11 font-bold shadow-lg shadow-primary/20"><Box className="h-5 w-5" /> جرد المخزن</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-[28px] border-none shadow-sm bg-orange-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest">مخزون منخفض</p>
                <h3 className="text-3xl font-black text-orange-900">{products.filter((p: any) => p.stock < 5 && p.stock > 0).length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-none shadow-sm bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-red-800 uppercase tracking-widest">نفذت الكمية</p>
                <h3 className="text-3xl font-black text-red-900">{products.filter((p: any) => p.stock === 0).length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[28px] border-none shadow-sm bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Box className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">إجمالي الأصناف</p>
                <h3 className="text-3xl font-black text-blue-900">{products.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="البحث بالاسم أو الباركود..." 
          className="h-14 rounded-2xl pr-12 border-none shadow-sm bg-white text-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-[32px] overflow-hidden bg-white shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-right py-6 px-6">المنتج</TableHead>
              <TableHead className="text-right">الموقع</TableHead>
              <TableHead className="text-right">الكمية الحالية</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-left px-6">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><Skeleton className="h-6 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="px-6"><Skeleton className="h-8 w-24 rounded-xl" /></TableCell>
                </TableRow>
              ))
            ) : filtered.map((p: any) => (
              <TableRow key={p.id} className="hover:bg-muted/5 transition-colors">
                <TableCell className="font-bold px-6 py-4">{p.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs font-bold">{p.storageLocation || 'غير محدد'}</TableCell>
                <TableCell className={cn("font-black text-lg", p.stock < 5 ? "text-destructive" : "text-primary")}>{p.stock}</TableCell>
                <TableCell>
                  <Badge className={cn(
                    "rounded-full border-none font-black text-[10px] px-3 py-1",
                    p.stock === 0 ? "bg-red-100 text-red-700" : p.stock < 5 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                  )}>
                    {p.stock === 0 ? "نفذت" : p.stock < 5 ? "منخفض" : "متوفر"}
                  </Badge>
                </TableCell>
                <TableCell className="text-left px-6">
                  <button 
                    className="rounded-xl font-black text-primary hover:bg-primary/5 px-4 py-2"
                    onClick={() => {
                      setEditingProduct(p);
                      setNewStock(p.stock);
                    }}
                  >
                    تعديل الكمية
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="rounded-[32px] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">تعديل المخزون</DialogTitle>
            <DialogDescription className="text-xs">قم بتحديث الكمية الفعلية للمنتج في المخزن حالياً.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
             <div className="text-center space-y-1">
                <p className="font-bold text-sm text-muted-foreground">{editingProduct?.name}</p>
                <p className="text-[10px] font-black uppercase opacity-50">{editingProduct?.barcode}</p>
             </div>
             <div className="space-y-2">
                <Label className="font-black text-xs mr-1 uppercase tracking-widest opacity-60">الكمية الجديدة</Label>
                <Input 
                  type="number" 
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="h-16 rounded-2xl text-3xl font-black text-center bg-muted/20 border-none"
                />
             </div>
          </div>
          <DialogFooter>
             <Button 
              disabled={isUpdating}
              className="w-full h-14 rounded-2xl font-black text-lg gap-2"
              onClick={handleUpdateStock}
             >
                {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                حفظ التعديل
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
