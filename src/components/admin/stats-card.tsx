'use client';

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
  };
  color?: "primary" | "blue" | "green" | "orange" | "purple" | "red";
}

const colorMap = {
  primary: "bg-primary text-white",
  blue: "bg-blue-600 text-white shadow-blue-500/20",
  green: "bg-emerald-600 text-white shadow-emerald-500/20",
  orange: "bg-orange-600 text-white shadow-orange-500/20",
  purple: "bg-purple-600 text-white shadow-purple-500/20",
  red: "bg-rose-600 text-white shadow-rose-500/20",
};

export function StatsCard({ title, value, description, icon: Icon, trend, color = "primary" }: StatsCardProps) {
  return (
    <Card className="rounded-[32px] border-none bg-white dark:bg-card shadow-[0_10px_30px_rgba(10,25,47,0.04)] hover:shadow-xl transition-all duration-500 group overflow-hidden border border-slate-100">
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{title}</span>
                <h3 className="text-3xl font-black pt-1 text-primary tracking-tighter">{value}</h3>
             </div>
             {trend && (
               <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase",
                    trend.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {trend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {trend.value}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">مقارنة بأمس</span>
               </div>
             )}
          </div>
          <div className={cn("flex h-14 w-14 items-center justify-center rounded-[20px] shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6", colorMap[color])}>
            <Icon className="h-7 w-7" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}