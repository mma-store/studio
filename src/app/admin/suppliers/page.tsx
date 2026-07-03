
'use client';

import { useState, useMemo, useEffect } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  BadgeDollarSign, 
  Loader2,
  Trash2,
  Edit2,
  Save
} from "lucide-react";
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
import { collection, query, orderBy, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function SuppliersPage() {
  const db = useFirestore();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const suppliersQuery = useMemo(() => query(collection(db, 'suppliers'), orderBy('name')), [db]);
  const { data: suppliers, loading } = useCollection(suppliersQuery);

  useEffect(() => {
    if (!isDialogOpen) setEditingSupplier(null);
  }, [isDialogOpen]);

  const filtered = suppliers.filter((s: any) => 
    s.name.toLowerCase().includes(search.toLowerCase()) || s.phone?.includes(search)
  );

  const handleAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const supplierData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      updatedAt: Date.now()
    };

    try {
      if (editingSupplier) {
        await updateDoc(doc(db, 'suppliers', editingSupplier.id), supplierData);
        toast({ title: "تم التحديث" });
      } else {
        await addDoc(collection(db, 'suppliers'), { ...supplierData, balance: 0, createdAt: Date.now() });
        toast({ title: "تم الإضافة" });
      }
      setIsDialogOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditInit = (supplier: any) => {
    setEditingSupplier(supplier);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذا المورد؟")) return;
    try {
      await deleteDoc(doc(db, 'suppliers', id));
      toast({ title: "تم الحذف" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">الموردين</h1>
          <p className="text-muted-foreground font-medium text-sm">إدارة شركات ومكاتب التجهيز.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 font-bold gap-2 shadow-lg">
              <Plus className="h-5 w-5" /> إضافة مورد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px] max-w-md">
            <DialogHeader><DialogTitle className="text-2xl font-black">{editingSupplier ? "تعديل المورد" : "مورد جديد"}</DialogTitle></DialogHeader>
            <form onSubmit={handleAction} className="space-y-5 pt-4">
               <div className="space-y-2">
                 <Label className="font-bold">اسم الشركة / المورد</Label>
                 <Input name="name" defaultValue={editingSupplier?.name} required className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">رقم الهاتف</Label>
                 <Input name="phone" defaultValue={editingSupplier?.phone} className="rounded-xl h-12 bg-muted/20 border-none text-left" dir="ltr" />
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">العنوان</Label>
                 <Input name="address" defaultValue={editingSupplier?.address} className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <DialogFooter>
                 <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl font-black text-lg">
                   {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 ml-2" />}
                   {editingSupplier ? "حفظ التعديلات" : "حفظ المورد"}
                 </Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="بحث..." className="h-12 rounded-xl pr-10 border-none shadow-sm bg-white" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-[32px] overflow-hidden bg-white shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-right py-5 px-6">المورد</TableHead>
              <TableHead className="text-right">الهاتف</TableHead>
              <TableHead className="text-right">الرصيد</TableHead>
              <TableHead className="text-left px-6">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(4).fill(0).map((_, i) => <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-12 w-full" /></TableCell></TableRow>)
            ) : filtered.length > 0 ? (
              filtered.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell className="font-black text-sm px-6">{s.name}</TableCell>
                <TableCell className="font-bold text-xs" dir="ltr">{s.phone || '---'}</TableCell>
                <TableCell className="font-black text-red-600">{s.balance?.toLocaleString()} د.ع</TableCell>
                <TableCell className="text-left px-6">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="text-primary rounded-xl" onClick={() => handleEditInit(s)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive rounded-xl" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))) : <TableRow><TableCell colSpan={4} className="text-center py-10 opacity-30">لا يوجد موردين.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
