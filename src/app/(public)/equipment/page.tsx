import getDb from '@/lib/db';
import EquipmentCatalog from '@/components/equipment/EquipmentCatalog';
import { Truck } from 'lucide-react';

export const revalidate = 0;

async function getEquipmentPageData() {
  const db = getDb();

  const categories = db
    .prepare('SELECT id, name_ar, name_en, slug FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC')
    .all() as any[];

  const equipmentList = db
    .prepare(`
      SELECT e.*, 
        c.name_ar as category_name_ar, 
        c.name_en as category_name_en,
        c.slug as category_slug,
        (SELECT image_path FROM equipment_images WHERE equipment_id = e.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM equipment e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.is_published = 1
      ORDER BY e.sort_order ASC, e.id DESC
    `)
    .all() as any[];

  for (const eq of equipmentList) {
    const imgs = db
      .prepare('SELECT image_path FROM equipment_images WHERE equipment_id = ? ORDER BY is_primary DESC, sort_order ASC')
      .all(eq.id) as Array<{ image_path: string }>;
    eq.images = imgs.map((i) => i.image_path);
  }

  return { categories, equipmentList };
}

export default async function EquipmentListingPage() {
  const { categories, equipmentList } = await getEquipmentPageData();

  return (
    <div className="py-12 md:py-20 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Banner Title */}
        <div className="mb-10 text-center sm:text-right rtl:sm:text-right ltr:sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F5C400]/15 border border-[#F5C400]/30 text-[#F5C400] text-xs font-bold uppercase mb-3">
            <Truck className="w-3.5 h-3.5" />
            <span>HEAVY MACHINERY CATALOG</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            فهرس جميع المعدات المتوفرة
          </h1>
          <p className="mt-2 text-sm text-gray-400 max-w-2xl">
            استعرض أسطول المعدات الثقيلة المتاحة للتسليم الفوري مع إمكانية المعاينة والتجربة الميدانية.
          </p>
        </div>

        {/* Dynamic Catalog Component */}
        <EquipmentCatalog
          initialEquipment={equipmentList}
          categories={categories}
        />
      </div>
    </div>
  );
}
