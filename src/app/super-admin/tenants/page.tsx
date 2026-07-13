
'use client';

import { useState, useMemo } from "react";
import { 
  Store, 
  Search, 
  ShieldCheck, 
  ShieldX, 
  ExternalLink, 
  MoreVertical,
  Phone,
  Calendar,
  Loader2,
  Trash2,
  Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function TenantsManagementPage() {
  const db = useFirestore();
  const [search, setSearch] = useState("");
  
  const tenantsQuery = useMemo(() => query(collection(db, 'tenants'), orderBy('createdAt', 'desc')), [db]);
  const { data: tenants, loading } = useCollection(tenantsQuery);

  const filtered = tenants.filter((t: any) => 
    t.businessName?.toLowerCase().includes(search.toLowerCase()) || 
    t.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (tenantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await updateDoc(doc(db, 'tenants', tenantId), { status: newStatus });
      toast({ title: "تم تحديث الحالة", description: `المتجر الآن ${newStatus === 'active' ? 'نشط' : 'معطل'}.` });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في التحديث" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black">إدارة المتاجر المشتركة</h1>
        <p className="text-muted-foreground font-medium">التحكم في وصول المتاجر وحالات اشتراكهم في المنصة.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="بحث باسم المتجر أو الرابط..." 
          className="h-14 rounded-2xl pr-12 border-none shadow-sm bg-white text-lg font-bold"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-[32px] border-none bg-white shadow-sm overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-right py-6 px-6 font-black text-xs uppercase">المتجر (Tenant)</TableHead>
              <TableHead className="text-right font-black text-xs uppercase">الرابط (Slug)</TableHead>
              <TableHead className="text-right font-black text-xs uppercase">المالك</TableHead>
              <TableHead className="text-right font-black text-xs uppercase">تاريخ الانضمام</TableHead>
              <TableHead className="text-right font-black text-xs uppercase">الحالة</TableHead>
              <TableHead className="text-left px-6 font-black text-xs uppercase">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="px-6 py-4"><Skeleton className="h-12 w-full rounded-xl" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((tenant: any) => (
                <TableRow key={tenant.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">
                          {tenant.businessName?.[0]}
                       </div>
                       <div>
                          <p className="font-black text-sm">{tenant.businessName}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">{tenant.id}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-primary font-bold">/{tenant.slug}</TableCell>
                  <TableCell>
                     <div className="flex flex-col">
                        <span className="font-bold text-sm">{tenant.ownerName}</span>
                        <span className="text-[10px] text-muted-foreground" dir="ltr">{tenant.phone}</span>
                     </div>
                  </TableCell>
                  <TableCell className="text-[10px] font-bold text-muted-foreground">
                    {new Date(tenant.createdAt).toLocaleDateString("ar-EG")}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "rounded-full border-none font-black text-[10px] px-3",
                      tenant.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {tenant.status === 'active' ? 'نشط' : 'معطل'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-left px-6">
                     <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn("rounded-xl", tenant.status === 'active' ? "text-red-600" : "text-green-600")}
                          onClick={() => toggleStatus(tenant.id, tenant.status)}
                        >
                          {tenant.status === 'active' ? <ShieldX className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl text-blue-600" onClick={() => window.open(`/store/${tenant.slug}`, '_blank')}>
                           <ExternalLink className="h-5 w-5" />
                        </Button>
                     </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center opacity-30 font-black">لا توجد متاجر مطابقة</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
