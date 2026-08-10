/**
 * @fileOverview المساعدات التقنية لعمليات المصادقة وتوحيد البيانات.
 */

/**
 * دالة موحدة لتنظيف وتنسيق رقم الهاتف العراقي.
 * تضمن تحويل كافة التنسيقات (07, +964, 00964) إلى التنسيق القياسي (7XXXXXXXXX).
 */
export function normalizePhoneNumber(phone: string): string {
  // إزالة كافة الرموز غير الرقمية
  let digits = phone.replace(/\D/g, '');
  
  // معالجة البادئات الدولية
  if (digits.startsWith('00964')) {
    digits = digits.substring(5);
  } else if (digits.startsWith('964')) {
    digits = digits.substring(3);
  }
  
  // إزالة الصفر الرائد إذا وجد
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  
  return digits;
}

/**
 * توليد البريد الإلكتروني الداخلي للمنصة بناءً على الرقم الموحد.
 */
export function getInternalEmail(normalizedPhone: string): string {
  return `${normalizedPhone}@dubsar.platform`;
}
