
'use client';

import { Bell, Search, Settings, ShieldCheck, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export function SuperAdminHeader() {
  const auth = useAuth();
  const { profile } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: "تم تسجيل الخروج" });
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white dark:bg-slate-900 px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="h-8 w-px bg-slate-200 mx-2" />
        <div className="flex items-center gap-2">
           <ShieldCheck className="h-5 w-5 text-primary" />
           <span className="text-xs font-black uppercase tracking-widest text-slate-400">Platform Management</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 border-r pr-4 border-slate-200">
          <Link href="/admin">
            <Button variant="outline" className="rounded-xl font-bold h-9 gap-2">
               <User className="h-4 w-4" /> واجهة التاجر
            </Button>
          </Link>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 rounded-xl p-1 gap-2 hover:bg-slate-100 transition-all">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={profile?.photoURL || ""} />
                <AvatarFallback className="bg-slate-900 text-white font-black text-[10px]">SA</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start pr-1 hidden sm:flex text-right">
                 <span className="text-[10px] font-black uppercase tracking-tighter text-primary">Super Admin</span>
                 <span className="text-xs font-bold leading-none text-slate-800">{profile?.displayName || 'المدير العام'}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-none shadow-2xl">
            <DropdownMenuLabel className="font-bold">حساب المنصة</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-xl font-medium cursor-pointer" onClick={() => router.push('/profile')}>الملف الشخصي</DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl font-medium cursor-pointer" onClick={() => router.push('/super-admin/settings')}>إعدادات السيرفر</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="rounded-xl font-bold cursor-pointer text-red-600 gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
