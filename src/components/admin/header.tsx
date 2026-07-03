
'use client';

import { Bell, Search, Settings, Sun, Moon, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/dropdown-menu"; // Note: ensure correct relative path or alias
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { SyncIndicator } from "@/components/layout/sync-indicator";

export function AdminHeader() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const auth = useAuth();
  const { profile } = useUser();
  const router = useRouter();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      root.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast({ title: "تم تسجيل الخروج" });
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="relative hidden lg:block">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="بحث سريع..." 
            className="h-10 w-64 rounded-xl bg-muted/50 pr-10 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <SyncIndicator />
        
        <div className="flex items-center gap-2 border-r pr-4 mr-2 border-muted">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl hover:bg-muted text-foreground">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Link href="/admin/notifications">
            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-muted text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </Link>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 rounded-xl p-1 gap-2 hover:bg-muted transition-all">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={profile?.photoURL || ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-[10px]">
                  {profile?.displayName?.[0] || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start pr-1 hidden sm:flex text-right">
                 <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">الإدارة</span>
                 <span className="text-xs font-bold leading-none text-foreground">{profile?.displayName || 'المدير'}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-none shadow-2xl">
            <DropdownMenuLabel className="font-bold">حسابي</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-xl font-medium cursor-pointer" onClick={() => router.push('/profile')}>الملف الشخصي</DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl font-medium cursor-pointer" onClick={() => router.push('/admin/settings')}>الإعدادات</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="rounded-xl font-bold cursor-pointer text-destructive gap-2"
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
