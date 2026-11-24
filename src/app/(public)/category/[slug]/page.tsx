import { query, queryOne } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FolderTree, ArrowLeft, ArrowRight, Truck } from 'lucide-react';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import type { Metadata } from 'next';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCategoryData(slug: string) {
  const category = await queryOne(
    'SELECT * FROM categories WHERE slug = ? OR id = ?',
    [slug, isNaN(Number(slug)) ? -1 : Number(slug)]
  ) as any;

  if (!category) return null;

  const equipment = await query(`
    SELECT e.*, 
      c.name_ar as category_name_ar, 
      c.name_en as category_name_en,
      (SELECT image_path FROM equipment_images WHERE equipment_id = e.id AND is_primary = 1 LIMIT 1) as primary_image
    FROM equipment e
    LEFT JOIN categories c ON e.category_id = c.id
    WHERE e.category_id = ? AND e.is_published = 1
    ORDER BY e.sort_order ASC, e.id DESC
  `, [category.id]);

  for (const eq of equipment) {
    const imgs = await query<{ image_path: string }>(
      'SELECT image_path FROM equipment_images WHERE equipment_id = ? ORDER BY is_primary DESC, sort_order ASC',
      [eq.id]
    );
    eq.images = imgs.map((i) => i.image_path);
  }

  return { category, equipment };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryData(slug);
  if (!data) return { title: 'Category Not Found' };

  return {
    title: `${data.category.name_ar || data.category.name_en} | معرض الطيب للمعدات الثقيلة`,
    description: data.category.description_ar || data.category.description_en,
  };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data) {
    notFound();
  }

  const { category, equipment } = data;

  return (
    <div className="py-12 md:py-20 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-[#151515] border border-[#262626] p-8 sm:p-12 mb-12 shadow-2xl">
          {category.image && (
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={category.image}
                alt={category.name_ar}
                className="w-full h-full object-cover filter brightness-[0.25] blur-sm scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/80 to-transparent"></div>
            </div>
          )}

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F5C400]/15 border border-[#F5C400]/30 text-[#F5C400] text-xs font-bold uppercase mb-4">
              <FolderTree className="w-3.5 h-3.5" />
              <span>فئة المعدات / CATEGORY</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {category.name_ar}
            </h1>

            {category.name_en && (
              <p className="text-sm font-semibold text-[#F5C400] uppercase tracking-wider mt-1">
                {category.name_en}
              </p>
            )}

            {category.description_ar && (
              <p className="text-sm text-gray-300 mt-4 leading-relaxed">
                {category.description_ar}
              </p>
            )}
          </div>
        </div>

        {/* Equipment List */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white">
            المعدات المتوفرة ضمن هذه الفئة ({equipment.length})
          </h2>
          <Link
            href="/equipment"
            className="text-xs text-[#F5C400] hover:underline flex items-center gap-1 font-bold"
          >
            <span>استعراض كافة المعدات</span>
            <span>←</span>
          </Link>
        </div>

        {equipment.length === 0 ? (
          <div className="py-16 text-center bg-[#151515] border border-[#262626] rounded-3xl p-8 max-w-xl mx-auto">
            <Truck className="w-14 h-14 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">
              لا توجد معدات مدرجة حالياً تحت هذه الفئة
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              يمكنك طلب توفير أي معدة تابعة لهذه الفئة وسنقوم بتجهيزها لك فوراً.
            </p>
            <Link
              href="/request"
              className="inline-flex items-center gap-2 bg-[#F5C400] text-black font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#FFD429]"
            >
              طلب استيراد معدة
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {equipment.map((item: any) => (
              <EquipmentCard key={item.id} equipment={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
