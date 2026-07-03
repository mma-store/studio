
'use client';

import { useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  BadgeDollarSign, 
  Loader2,
  Trash2,
  Edit2
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
import { collection, query, orderBy, addDoc, deleteDoc, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function SuppliersPage() {
  const db = useFirestore();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const suppliersQuery = useMemo(() => query(collection(db, 'suppliers'), orderBy('name')), [db]);
  const { data: suppliers, loading } = useCollection(suppliersQuery);

  const filtered = suppliers.filter((s: any) => 
    s.name.toLowerCase().includes(search.toLowerCase()) || s.phone?.includes(search)
  );

  const handleAddSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addDoc(collection(db, 'suppliers'), {
        name: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        balance: 0,
        createdAt: Date.now()
      });
      setIsAddOpen(false);
      toast({ title: "تم الإضافة", description: "تم تسجيل المورد بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل الحفظ." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المورد؟")) return;
    await deleteDoc(doc(db, 'suppliers', id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">الموردين</h1>
          <p className="text-muted-foreground font-medium">إدارة شركات ومكاتب تجهيز قطع الغيار.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 font-bold gap-2 shadow-lg">
              <Plus className="h-5 w-5" /> إضافة مورد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px] max-w-md">
            <DialogHeader><DialogTitle className="text-2xl font-black">مورد جديد</DialogTitle></DialogHeader>
            <form onSubmit={handleAddSupplier} className="space-y-5 pt-4">
               <div className="space-y-2">
                 <Label className="font-bold">اسم الشركة / المورد</Label>
                 <Input name="name" required className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">رقم الهاتف</Label>
                 <Input name="phone" required className="rounded-xl h-12 bg-muted/20 border-none text-left" dir="ltr" />
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">العنوان</Label>
                 <Input name="address" className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <DialogFooter>
                 <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl font-black text-lg">
                   {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "حفظ المورد"}
                 </Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="بحث باسم المورد أو الهاتف..." 
          className="h-12 rounded-xl pr-10 border-none shadow-sm bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-[32px] overflow-hidden bg-white shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-right py-5 px-6">المورد</TableHead>
              <TableHead className="text-right">الهاتف</TableHead>
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">الرصيد (له)</TableHead>
              <TableHead className="text-left px-6">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="px-6"><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((s: any) => (
              <TableRow key={s.id} className="hover:bg-muted/5 transition-colors">
                <TableCell className="font-black text-sm px-6">{s.name}</TableCell>
                <TableCell className="font-bold text-xs" dir="ltr">{s.phone}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{s.address}</TableCell>
                <TableCell className="font-black text-red-600">{s.balance?.toLocaleString()} د.ع</TableCell>
                <TableCell className="text-left px-6">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5 rounded-xl"><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-red-50 rounded-xl" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 opacity-30 font-bold">لا يوجد موردين حالياً.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
