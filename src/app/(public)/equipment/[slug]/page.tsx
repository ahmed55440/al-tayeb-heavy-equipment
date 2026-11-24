import { query, queryOne } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Truck,
  Calendar,
  MessageSquare,
  Phone,
  ShieldCheck,
  CheckCircle,
  Share2,
  ArrowLeft,
  ArrowRight,
  Info,
  Wrench,
} from 'lucide-react';
import ImageGallery from '@/components/equipment/ImageGallery';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatPrice, getWhatsAppUrl, getPhoneUrl } from '@/lib/utils';
import type { Metadata } from 'next';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getEquipmentDetail(slug: string) {
  // Find equipment by slug or id
  const equipment = await queryOne(`
    SELECT e.*, 
      c.name_ar as category_name_ar, 
      c.name_en as category_name_en,
      c.slug as category_slug
    FROM equipment e
    LEFT JOIN categories c ON e.category_id = c.id
    WHERE (e.slug = ? OR e.id = ?) AND e.is_published = 1
  `, [slug, isNaN(Number(slug)) ? -1 : Number(slug)]) as any;

  if (!equipment) return null;

  // Images
  const images = await query<{ id: number; image_path: string }>(
    'SELECT id, image_path FROM equipment_images WHERE equipment_id = ? ORDER BY is_primary DESC, sort_order ASC',
    [equipment.id]
  );

  equipment.images = images;

  // Settings for WhatsApp & Phone
  const settingsRows = await query<{
    key: string;
    value_ar: string;
    value_en: string;
  }>('SELECT * FROM settings');
  const settings: Record<string, string> = {};
  for (const s of settingsRows) {
    settings[s.key] = s.value_ar || s.value_en || '';
  }

  // Related equipment from the same category
  const related = await query(`
    SELECT e.*, 
      c.name_ar as category_name_ar, 
      c.name_en as category_name_en,
      (SELECT image_path FROM equipment_images WHERE equipment_id = e.id AND is_primary = 1 LIMIT 1) as primary_image
    FROM equipment e
    LEFT JOIN categories c ON e.category_id = c.id
    WHERE e.category_id = ? AND e.id != ? AND e.is_published = 1
    ORDER BY e.sort_order ASC, e.id DESC
    LIMIT 3
  `, [equipment.category_id, equipment.id]);

  return { equipment, settings, related };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getEquipmentDetail(slug);
  if (!data) return { title: 'Equipment Not Found' };

  const { equipment } = data;
  return {
    title: `${equipment.name_ar || equipment.name_en} | معرض الطيب للمعدات الثقيلة`,
    description: `${equipment.brand} ${equipment.model} - ${equipment.description_ar?.slice(0, 150) || ''}`,
    openGraph: {
      title: `${equipment.name_ar || equipment.name_en} | معرض الطيب`,
      description: equipment.description_ar?.slice(0, 150),
      images: equipment.images?.[0]?.image_path ? [equipment.images[0].image_path] : [],
    },
  };
}

export default async function EquipmentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getEquipmentDetail(slug);

  if (!data) {
    notFound();
  }

  const { equipment, settings, related } = data;

  // Format Specs list from string (pipe-separated or lines)
  const rawSpecs = equipment.specs_ar || equipment.specs_en || '';
  const specItems = rawSpecs
    .split(/[|\n]/)
    .map((s: string) => s.trim())
    .filter(Boolean);

  // WhatsApp integration
  const whatsappNumber = settings['whatsapp_number'] || '+201000000000';
  const whatsappTemplate =
    settings['whatsapp_message_ar'] ||
    'مرحباً، أنا مهتم بـ {equipment}، موديل {model}. أرجو تزويدي بمزيد من المعلومات والأسعار.';
  const whatsappMsg = whatsappTemplate
    .replace('{equipment}', equipment.name_ar || equipment.name_en)
    .replace('{model}', equipment.model || '');
  const whatsappUrl = getWhatsAppUrl(whatsappNumber, whatsappMsg);

  // Phone integration
  const phoneNumber = settings['phone_number'] || '+201000000000';
  const phoneUrl = getPhoneUrl(phoneNumber);

  return (
    <div className="py-10 md:py-16 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 overflow-x-auto pb-1">
          <Link href="/" className="hover:text-white transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/equipment" className="hover:text-white transition-colors">
            المعدات
          </Link>
          {equipment.category_name_ar && (
            <>
              <span>/</span>
              <Link
                href={`/category/${equipment.category_slug}`}
                className="hover:text-white transition-colors"
              >
                {equipment.category_name_ar}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-200 truncate">{equipment.name_ar || equipment.name_en}</span>
        </nav>

        {/* Product Details Grid: Gallery (Left) & Info Panel (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Photos & Gallery (7 cols on Desktop) */}
          <div className="lg:col-span-7">
            <ImageGallery
              images={equipment.images}
              title={equipment.name_ar || equipment.name_en}
            />

            {/* Quality & Warranty Banner */}
            <div className="mt-8 p-5 bg-[#121212] border border-[#222] rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F5C400]/10 border border-[#F5C400]/20 flex items-center justify-center text-[#F5C400] flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-white text-sm">
                  فحص فني شامل ومعاينة حية
                </h4>
                <p className="text-gray-400 mt-0.5">
                  تخضع جميع معدات معرض الطيب لكشف هندسي دقيق على المحرك والطلمبات والضفيرة والكاوتش مع إمكانية التجربة الميدانية.
                </p>
              </div>
            </div>
          </div>

          {/* Details & Contact Actions (5 cols on Desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#151515] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              {/* Status and Category */}
              <div className="flex items-center justify-between gap-3">
                <StatusBadge status={equipment.status} locale="ar" />
                {equipment.category_name_ar && (
                  <span className="text-xs font-bold text-[#F5C400] bg-[#F5C400]/10 border border-[#F5C400]/20 px-3 py-1 rounded-full">
                    {equipment.category_name_ar}
                  </span>
                )}
              </div>

              {/* Title & Brand */}
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
                  {equipment.brand}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight leading-tight">
                  {equipment.name_ar || equipment.name_en}
                </h1>
                {equipment.name_en && (
                  <p className="text-xs text-[#F5C400] font-semibold mt-1">
                    {equipment.name_en}
                  </p>
                )}
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#0D0D0D] border border-[#222] rounded-2xl text-xs">
                <div>
                  <span className="text-gray-500 block mb-0.5">العلامة التجارية:</span>
                  <strong className="text-white font-medium">{equipment.brand || '—'}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">الموديل:</span>
                  <strong className="text-white font-mono font-medium">{equipment.model || '—'}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">سنة الصنع:</span>
                  <strong className="text-white font-mono font-medium">{equipment.year || '—'}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">حالة التوفر:</span>
                  <strong className="text-green-400 font-medium">{equipment.status}</strong>
                </div>
              </div>

              {/* Price Box */}
              <div className="p-5 bg-gradient-to-r from-black via-[#181818] to-black border border-[#262626] rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    السعر المطلوب
                  </span>
                  {equipment.price_type === 'contact' || !equipment.price ? (
                    <span className="text-lg font-black text-[#F5C400]">
                      اتصل للسعر (Contact for Price)
                    </span>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                        {formatPrice(equipment.price, 'ar')}
                      </span>
                      <span className="text-xs text-gray-400 font-bold">ج.م (EGP)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* THE TWO MANDATORY CONTACT BUTTONS */}
              <div className="space-y-3 pt-2">
                {/* Button 1: اطلب الآن / Request Now (WhatsApp with prefilled message) */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-base py-4 px-6 rounded-2xl transition-all shadow-xl shadow-[#25D366]/20 active:scale-98"
                >
                  <MessageSquare className="w-5 h-5 fill-current" />
                  <span>اطلب الآن عبر واتساب / Request Now</span>
                </a>

                {/* Button 2: اتصال / Call Now */}
                <a
                  href={phoneUrl}
                  className="w-full flex items-center justify-center gap-3 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white border border-[#383838] hover:border-[#F5C400] font-bold text-base py-4 px-6 rounded-2xl transition-all shadow-md active:scale-98"
                >
                  <Phone className="w-5 h-5 text-[#F5C400]" />
                  <span>اتصال هاتفي مباشر / Call Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Description & Technical Specifications */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Description */}
          <div className="lg:col-span-7 bg-[#151515] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-[#222] pb-4">
              <Info className="w-5 h-5 text-[#F5C400]" />
              <span>وصف وحالة المعدة</span>
            </h2>

            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line space-y-4">
              <p>{equipment.description_ar || equipment.description_en || 'لا يوجد وصف مفصل متاح حالياً لهذه المعدة.'}</p>
              {equipment.description_en && equipment.description_ar && (
                <div className="pt-4 border-t border-[#222]">
                  <h4 className="text-xs font-bold text-gray-400 mb-2">English Description:</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{equipment.description_en}</p>
                </div>
              )}
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="lg:col-span-5 bg-[#151515] border border-[#262626] rounded-3xl p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-[#222] pb-4">
              <Wrench className="w-5 h-5 text-[#F5C400]" />
              <span>المواصفات الفنية (Specifications)</span>
            </h2>

            {specItems.length > 0 ? (
              <div className="space-y-2.5">
                {specItems.map((spec: string, idx: number) => {
                  const parts = spec.split(/[:：]/);
                  const key = parts[0]?.trim();
                  const val = parts.slice(1).join(':').trim();

                  return (
                    <div
                      key={idx}
                      className="p-3 bg-[#0D0D0D] border border-[#222] rounded-xl flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-400">{key}</span>
                      <strong className="text-white font-medium">{val || key}</strong>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-6 text-center">
                لم يتم إدخال بنود تفصيلية للمواصفات الفنية.
              </p>
            )}
          </div>
        </div>

        {/* Related Equipment Section */}
        {related.length > 0 && (
          <div className="mt-20 pt-16 border-t border-[#1C1C1C]">
            <h2 className="text-2xl font-black text-white mb-8">
              معدات مشابهة من نفس الفئة
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((item: any) => (
                <EquipmentCard key={item.id} equipment={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
