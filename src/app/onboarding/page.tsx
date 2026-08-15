
'use client';

import { useState, useEffect } from "react";
import { useFirestore, useUser } from "@/firebase";
import { doc, writeBatch, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ScrollText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { UserProfile } from "@/lib/types/roles";

export default function OnboardingPage() {
  const db = useFirestore();
  const router = useRouter();
  const { user, profile, loading: identityLoading } = useUser();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    address: "",
    businessType: "retail",
  });

  // Idempotent Check: If user already has a tenant, move them to admin
  useEffect(() => {
    if (!identityLoading && profile?.tenantId) {
      toast({ title: "لديك متجر بالفعل", description: "جاري نقلك للوحة التحكم..." });
      router.replace('/admin');
    }
  }, [identityLoading, profile, router]);

  const generateSlug = (name: string) => {
    return name.trim().toLowerCase().replace(/[^\u0621-\u064A\u0660-\u0669a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-");
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      // 1. Double check idempotency via Query (just in case profile isn't synced yet)
      const tenantsRef = collection(db, "tenants");
      const q = query(tenantsRef, where("ownerUid", "==", user.uid));
      const existingTenants = await getDocs(q);

      if (!existingTenants.empty) {
        const existingData = existingTenants.docs[0].data();
        toast({ title: "متجرك موجود بالفعل" });
        
        // Repair profile if needed
        if (!profile?.tenantId) {
          await writeBatch(db)
            .set(doc(db, "accountProfiles", user.uid), { ...profile, tenantId: existingData.tenantId }, { merge: true })
            .commit();
        }
        
        router.replace("/admin");
        return;
      }

      const slug = generateSlug(formData.businessName);
      const now = Date.now();
      const newTenantId = `T-${Date.now().toString().slice(-6)}`;

      // 2. Slug uniqueness check
      const slugRef = doc(db, "slugs", slug);
      const slugSnap = await getDoc(slugRef);
      if (slugSnap.exists()) {
        toast({ variant: "destructive", title: "الرابط محجوز", description: "يرجى اختيار اسم متجر آخر." });
        setLoading(false);
        return;
      }

      // 3. Atomic Batch Creation
      const batch = writeBatch(db);
      
      batch.set(doc(db, "tenants", newTenantId), {
        tenantId: newTenantId,
        businessName: formData.businessName.trim(),
        slug,
        ownerName: formData.ownerName.trim(),
        ownerUid: user.uid,
        phone: user.phoneNumber || "",
        address: formData.address.trim(),
        status: "active",
        createdAt: now
      });

      batch.set(slugRef, { tenantId: newTenantId, ownerUid: user.uid });

      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: formData.ownerName.trim(),
        accountType: 'merchant',
        role: 'owner',
        tenantId: newTenantId,
        status: 'active',
        createdAt: now
      };

      batch.set(doc(db, "accountProfiles", user.uid), newProfile);
      batch.set(doc(db, "users", user.uid), newProfile);

      await batch.commit();
      toast({ title: "تم التأسيس بنجاح!" });
      router.replace("/admin");
      
    } catch (error: any) {
      toast({ variant: "destructive", title: "فشل التأسيس", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (identityLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin opacity-20" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F5] p-4">
      <Card className="w-full max-w-2xl rounded-[48px] border-none shadow-2xl overflow-hidden bg-white">
        <div className="p-8"><Link href="/"><Button variant="ghost" className="rounded-full gap-2 font-bold"><ArrowLeft className="h-4 w-4 rotate-180" /> العودة للمنصة</Button></Link></div>
        <CardHeader className="text-center pb-6">
           <div className="mx-auto h-16 w-16 bg-primary rounded-3xl flex items-center justify-center text-white mb-4 shadow-xl">
              <ScrollText className="h-10 w-10" />
           </div>
           <h2 className="text-3xl font-black text-primary">تأسيس متجر جديد</h2>
           <CardDescription className="font-bold">أدخل بيانات متجرك للبدء في البيع فوراً</CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-10">
          <form onSubmit={handleOnboarding} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-black text-xs mr-2 opacity-60">اسم المتجر</Label>
                <Input name="businessName" required value={formData.businessName} onChange={(e)=>setFormData({...formData, businessName: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black" placeholder="مثال: مجمع السلام" />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-xs mr-2 opacity-60">المدير المسؤول</Label>
                <Input name="ownerName" required value={formData.ownerName} onChange={(e)=>setFormData({...formData, ownerName: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black" placeholder="اسم صاحب المتجر" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="font-black text-xs mr-2 opacity-60">العنوان</Label>
                <Input name="address" required value={formData.address} onChange={(e)=>setFormData({...formData, address: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black" placeholder="المحافظة، المنطقة، أقرب نقطة دالة" />
              </div>
            </div>
            
            <Button type="submit" disabled={loading} className="w-full h-18 rounded-[28px] font-black text-xl shadow-2xl bg-primary hover:bg-primary/90 gap-3">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
              تأسيس وإطلاق المتجر
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
