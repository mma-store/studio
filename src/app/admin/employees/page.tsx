
'use client';

import { 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Loader2,
  Plus,
  Edit2,
  Save,
  ShieldAlert,
  Lock,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { LocalAuthService, LocalUser } from "@/services/local-auth-service";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function LocalEmployeesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await LocalAuthService.getUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await LocalAuthService.createUser({
        username: formData.get('username') as string,
        displayName: formData.get('displayName') as string,
        pin: formData.get('pin') as string,
        role: formData.get('role') as string,
        permissions: ['sales.view', 'inventory.view'] // Default set
      });
      setIsAddOpen(false);
      toast({ title: "تم الحفظ", description: "تم تسجيل الموظف في القاعدة المحلية." });
      loadUsers();
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف المستخدم نهائياً؟")) return;
    await LocalAuthService.deleteUser(id);
    loadUsers();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">المستخدمين والصلاحيات</h1>
          <p className="text-muted-foreground font-medium text-sm">إدارة الحسابات المحلية (DUBSAR Offline Mode).</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-11 font-bold gap-2">
              <UserPlus className="h-5 w-5" /> إضافة مستخدم محلي
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[32px]">
            <DialogHeader><DialogTitle className="text-2xl font-black">حساب جديد</DialogTitle></DialogHeader>
            <form onSubmit={handleAddEmployee} className="space-y-5 pt-4">
               <div className="space-y-2">
                  <Label>اسم المستخدم (English)</Label>
                  <Input name="username" required placeholder="ali99" className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <div className="space-y-2">
                  <Label>الاسم المعروض</Label>
                  <Input name="displayName" required placeholder="علي محمد" className="rounded-xl h-12 bg-muted/20 border-none" />
               </div>
               <div className="space-y-2">
                  <Label>رمز الدخول (PIN)</Label>
                  <Input name="pin" required type="password" placeholder="••••" className="rounded-xl h-12 bg-muted/20 border-none text-center" />
               </div>
               <div className="space-y-2">
                  <Label>الدور</Label>
                  <Select name="role" defaultValue="staff">
                    <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-none"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl">
                       <SelectItem value="manager">مدير فرع</SelectItem>
                       <SelectItem value="staff">موظف (صلاحيات محدودة)</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <DialogFooter>
                  <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl font-black">حفظ الحساب</Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-[32px] border-none bg-white shadow-sm overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-right py-6 px-6">المستخدم</TableHead>
              <TableHead className="text-right">الدور</TableHead>
              <TableHead className="text-right">آخر دخول</TableHead>
              <TableHead className="text-left px-6">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
            ) : users.map((u: any) => (
              <TableRow key={u.id}>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">{u.username[0]}</div>
                    <div className="flex flex-col"><span className="font-black text-sm">{u.displayName}</span><span className="text-[10px] text-muted-foreground">@{u.username}</span></div>
                  </div>
                </TableCell>
                <TableCell><Badge className="rounded-full font-black text-[10px]">{u.role}</Badge></TableCell>
                <TableCell className="text-xs font-bold opacity-50">{u.lastLogin ? new Date(u.lastLogin).toLocaleString("ar-EG") : 'لم يدخل بعد'}</TableCell>
                <TableCell className="text-left px-6">
                   {u.role !== 'owner' && <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(u.id)}><Trash2 className="h-4 w-4" /></Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
