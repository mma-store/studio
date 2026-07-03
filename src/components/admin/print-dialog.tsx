
'use client';

import { 
  Printer, 
  Layout, 
  CreditCard, 
  FileText, 
  ChevronRight, 
  X,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: 'invoice' | 'receipt' | 'voucher' | 'statement';
}

export function PrintDialog({ isOpen, onClose, data, type }: PrintDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<'A4' | '80mm' | '58mm'>('80mm');
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    // محاكاة عملية الطباعة
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-[40px] max-w-xl p-0 overflow-hidden border-none shadow-2xl">
         <div className="p-8 border-b bg-primary text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                  <Printer className="h-6 w-6" />
               </div>
               <div>
                  <h3 className="text-xl font-black">خيارات الطباعة</h3>
                  <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Printer Management System</p>
               </div>
            </div>
            <button onClick={onClose} className="hover:rotate-90 transition-transform"><X className="h-8 w-8" /></button>
         </div>

         <div className="p-10 space-y-8">
            <div className="grid grid-cols-3 gap-4">
               <button 
                onClick={() => setSelectedFormat('A4')}
                className={cn("p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3", selectedFormat === 'A4' ? "border-primary bg-primary/5 text-primary shadow-xl" : "border-muted opacity-60")}
               >
                  <FileText className="h-8 w-8" />
                  <span className="font-black text-xs">A4 القياسي</span>
               </button>
               <button 
                onClick={() => setSelectedFormat('80mm')}
                className={cn("p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3", selectedFormat === '80mm' ? "border-primary bg-primary/5 text-primary shadow-xl" : "border-muted opacity-60")}
               >
                  <Layout className="h-8 w-8" />
                  <span className="font-black text-xs">80mm حراري</span>
               </button>
               <button 
                onClick={() => setSelectedFormat('58mm')}
                className={cn("p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3", selectedFormat === '58mm' ? "border-primary bg-primary/5 text-primary shadow-xl" : "border-muted opacity-60")}
               >
                  <CreditCard className="h-8 w-8" />
                  <span className="font-black text-xs">58mm صغير</span>
               </button>
            </div>

            <div className="bg-muted/30 p-8 rounded-[32px] space-y-4 border border-dashed border-muted-foreground/20">
               <h4 className="font-black text-sm uppercase tracking-wider opacity-60 mb-4">معاينة تفاصيل المستند</h4>
               <div className="flex justify-between items-center"><span className="text-sm font-bold">نوع السند:</span><span className="font-black text-primary">{type === 'invoice' ? 'فاتورة مبيعات' : 'سند مالي'}</span></div>
               <div className="flex justify-between items-center"><span className="text-sm font-bold">الرقم المرجعي:</span><span className="font-black"># {data?.orderNumber || data?.voucherNumber || '0000'}</span></div>
               <div className="flex justify-between items-center"><span className="text-sm font-bold">إجمالي المبلغ:</span><span className="font-black text-lg">{data?.total?.toLocaleString() || '0'} د.ع</span></div>
            </div>

            <div className="grid gap-4">
               <Button disabled={isPrinting} className="h-20 rounded-3xl text-2xl font-black gap-4 shadow-xl active:scale-95" onClick={handlePrint}>
                  {isPrinting ? <Loader2 className="h-8 w-8 animate-spin" /> : <Printer className="h-8 w-8" />} تأكيد الطباعة
               </Button>
               <Button variant="ghost" className="font-bold text-muted-foreground" onClick={onClose}>إلغاء</Button>
            </div>
         </div>
      </DialogContent>
    </Dialog>
  );
}
