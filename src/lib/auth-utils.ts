/**
 * @fileOverview المساعدات التقنية الموحدة للهوية الرقمية.
 * هذا الملف هو المرجع الوحيد لكافة عمليات تنظيف البيانات وتوليد معرفات الدخول.
 */

/**
 * دالة موحدة لتنظيف وتنسيق رقم الهاتف العراقي.
 * تحول كافة التنسيقات (07, +964, 00964) إلى التنسيق الخام (7XXXXXXXXX).
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return "";
  
  // 1. إزالة كافة الرموز غير الرقمية والفراغات
  let digits = phone.replace(/\D/g, '');
  
  // 2. معالجة البادئات الدولية
  if (digits.startsWith('00964')) {
    digits = digits.substring(5);
  } else if (digits.startsWith('964')) {
    digits = digits.substring(3);
  }
  
  // 3. إزالة الصفر الرائد (Leading Zero)
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  
  return digits;
}

/**
 * توليد البريد الإلكتروني الداخلي للمنصة.
 * هذا المعرف هو "اسم المستخدم" الحقيقي في Firebase Auth.
 */
export function getInternalEmail(normalizedPhone: string): string {
  if (!normalizedPhone) return "";
  return `${normalizedPhone}@dubsar.platform`;
}
