
'use client';

import { 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Trash2, 
  MoreHorizontal,
  Wrench,
  ShoppingBag,
  Warehouse,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, deleteDoc, doc } from "firebase/firestore";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const roleMap = {
  admin: { label: "مدير نظام", icon: ShieldCheck, color: "bg-red-100 text-red-700" },
  sales_employee: { label: "موظف مبيعات", icon: ShoppingBag, color: "bg-blue-100 text-blue-700" },
  workshop_technician: { label: "فني ورشة", icon: Wrench, color: "bg-green-100 text-green-700" },
  warehouse_employee: { label: "أمين مخزن", icon: Warehouse, color: "bg-orange-100 text-orange-700" },
};

export default function EmployeesPage() {
  const db = useFirestore();
  // جلب المستخدمين الذين لديهم أدوار موظفين فقط
  const staffQuery = useMemo(() => query(
    collection(db, 'users'), 
    where('role', 'in', ['admin', 'sales_employee', 'workshop_technician', 'warehouse_employee']),
    orderBy('createdAt', 'desc')
  ), [db]);
  const { data: staff, loading } = useCollection(staffQuery);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">إدارة فريق العمل</h1>
          <p className="text-muted-foreground font-medium text-sm">إدارة حسابات الموظفين والصلاحيات في المجمع.</p>
        </div>
        <Button className="rounded-xl h-11 font-bold gap-2 shadow-lg shadow-primary/20">
          <UserPlus className="h-5 w-5" /> إضافة موظف جديد
        </Button>
      </div>

      <div className="rounded-[32px] border-none bg-white dark:bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/30">
              <TableHead className="text-right font-black text-xs uppercase py-6 px-6">الموظف</TableHead>
              <TableHead className="text-right font-black text-xs uppercase">الدور الوظيفي</TableHead>
              <TableHead className="text-right font-black text-xs uppercase">رقم الهاتف</TableHead>
              <TableHead className="text-right font-black text-xs uppercase">تاريخ التعيين</TableHead>
              <TableHead className="text-left font-black text-xs uppercase px-6">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6"><Skeleton className="h-12 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="px-6 text-left"><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : staff.map((member: any) => {
              const roleConfig = roleMap[member.role as keyof typeof roleMap] || { label: member.role, icon: ShieldAlert, color: "bg-muted text-muted-foreground" };
              const Icon = roleConfig.icon;
              return (
                <TableRow key={member.id} className="hover:bg-muted/5">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                        {member.displayName?.[0] || 'E'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-sm">{member.displayName}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">{member.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("rounded-full border-none font-bold text-[10px] gap-1.5 px-3 py-1", roleConfig.color)}>
                       <Icon className="h-3.5 w-3.5" />
                       {roleConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-sm" dir="ltr">{member.phoneNumber}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-bold">
                    {new Date(member.createdAt).toLocaleDateString("ar-EG")}
                  </TableCell>
                  <TableCell className="text-left px-6">
                    <Button variant="ghost" size="icon" className="rounded-xl text-destructive hover:bg-red-50">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
