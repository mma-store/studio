
"use client";

import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  MapPin, 
  Heart, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  Moon, 
  Sun,
  ShieldCheck,
  Headphones
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function ProfilePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const MENU_ITEMS = [
    { label: "المعلومات الشخصية", icon: User, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "عناوين التوصيل", icon: MapPin, color: "text-red-500", bg: "bg-red-50" },
    { label: "قائمة المفضلة", icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
    { label: "الأمان والخصوصية", icon: ShieldCheck, color: "text-green-500", bg: "bg-green-50" },
    { label: "مركز المساعدة", icon: Headphones, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "إعدادات التطبيق", icon: Settings, color: "text-gray-500", bg: "bg-gray-50" },
  ];

  return (
    <div className="flex min-h-screen bg-[#FDF8F5]">
      <main className="flex-1 pb-24">
        <Header />
        
        <div className="container p-6 space-y-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center gap-4 pt-4">
             <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>MA</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-1 right-1 h-8 w-8 bg-primary rounded-full border-4 border-white flex items-center justify-center">
                   <Settings className="h-4 w-4 text-white" />
                </div>
             </div>
             <div className="text-center">
                <h2 className="text-2xl font-black">محمد علاء</h2>
                <p className="text-sm text-muted-foreground font-medium">mohammed.ala@example.com</p>
             </div>
          </div>

          {/* Quick Actions / Toggles */}
          <div className="bg-white p-4 rounded-[28px] shadow-sm flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-orange-100 text-orange-600">
                   {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </div>
                <span className="font-bold">الوضع الليلي</span>
             </div>
             <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
          </div>

          {/* Menu Options */}
          <div className="bg-white overflow-hidden rounded-[32px] shadow-sm">
             {MENU_ITEMS.map((item, idx) => (
               <button 
                key={idx} 
                className={`w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors ${idx !== MENU_ITEMS.length - 1 ? 'border-b border-muted/50' : ''}`}
               >
                  <div className="flex items-center gap-4">
                     <div className={`h-10 w-10 flex items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
                        <item.icon className="h-5 w-5" />
                     </div>
                     <span className="font-bold text-sm">{item.label}</span>
                  </div>
                  <ChevronLeft className="h-5 w-5 text-muted-foreground" />
               </button>
             ))}
          </div>

          <Button variant="ghost" className="w-full h-14 rounded-full text-destructive font-black gap-2 hover:bg-destructive/5 hover:text-destructive transition-all">
             <LogOut className="h-5 w-5" />
             تسجيل الخروج
          </Button>
          
          <div className="text-center space-y-1">
             <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">MMA App Version 1.0.4</p>
             <p className="text-[10px] text-muted-foreground">صنع بكل حب في العراق ❤️</p>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
