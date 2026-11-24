export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || `item-${Date.now()}`;
}

export function generateRefNumber(): string {
  const prefix = 'REQ';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function getWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function getPhoneUrl(phone: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  return `tel:${cleanPhone}`;
}

export function formatPrice(price: string, locale: string = 'ar'): string {
  if (!price || price === '0') return locale === 'ar' ? 'اتصل للسعر' : 'Contact for Price';
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function getLocalizedValue<T extends { [key: string]: unknown }>(
  item: T,
  field: string,
  locale: string
): string {
  const localizedKey = `${field}_${locale}` as keyof T;
  const fallbackKey = `${field}_${locale === 'ar' ? 'en' : 'ar'}` as keyof T;
  const value = item[localizedKey] as string;
  if (value) return value;
  return (item[fallbackKey] as string) || '';
}

export const statusLabels: Record<string, { ar: string; en: string; color: string }> = {
  available: { ar: 'متوفر', en: 'Available', color: 'bg-green-500' },
  sold: { ar: 'مباع', en: 'Sold', color: 'bg-red-500' },
  reserved: { ar: 'محجوز', en: 'Reserved', color: 'bg-yellow-500' },
  maintenance: { ar: 'صيانة', en: 'Maintenance', color: 'bg-orange-500' },
};

export const requestStatusLabels: Record<string, { ar: string; en: string; color: string }> = {
  new: { ar: 'جديد', en: 'New', color: 'bg-blue-500' },
  under_review: { ar: 'قيد المراجعة', en: 'Under Review', color: 'bg-yellow-500' },
  available: { ar: 'متوفر', en: 'Available', color: 'bg-green-500' },
  contacted: { ar: 'تم التواصل', en: 'Contacted', color: 'bg-purple-500' },
  completed: { ar: 'مكتمل', en: 'Completed', color: 'bg-gray-500' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', color: 'bg-red-500' },
};
