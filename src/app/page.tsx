import { query } from '@/lib/db';
import Header from '@/components/header/Header';
import HeroSlider from '@/components/hero/HeroSlider';
import CategoriesSection from '@/components/categories/CategoriesSection';
import EquipmentGrid from '@/components/equipment/EquipmentGrid';
import RequestForm from '@/components/contact/RequestForm';
import ContactSection from '@/components/contact/ContactSection';
import Footer from '@/components/footer/Footer';
import CinematicIntro from '@/components/intro/CinematicIntro';
import SectionTitle from '@/components/ui/SectionTitle';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Truck } from 'lucide-react';

export const revalidate = 0; // dynamic on every request

async function getHomePageData() {
  // Settings
  const settingsRows = await query<{
    key: string;
    value_ar: string;
    value_en: string;
  }>('SELECT * FROM settings');
  const settings: Record<string, { ar: string; en: string }> = {};
  for (const s of settingsRows) {
    settings[s.key] = { ar: s.value_ar || '', en: s.value_en || '' };
  }

  // Active Banners
  const banners = await query(
    'SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
  );

  // Active Categories
  const categories = await query(
    'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
  );

  // Featured Equipment
  const featuredEquipment = await query(`
    SELECT e.*, 
      c.name_ar as category_name_ar, 
      c.name_en as category_name_en,
      (SELECT image_path FROM equipment_images WHERE equipment_id = e.id AND is_primary = 1 LIMIT 1) as primary_image
    FROM equipment e
    LEFT JOIN categories c ON e.category_id = c.id
    WHERE e.is_published = 1 AND e.is_featured = 1
    ORDER BY e.sort_order ASC, e.id DESC
    LIMIT 6
  `);

  // If not enough featured, get latest equipment
  let equipmentList = featuredEquipment;
  if (equipmentList.length === 0) {
    equipmentList = await query(`
      SELECT e.*, 
        c.name_ar as category_name_ar, 
        c.name_en as category_name_en,
        (SELECT image_path FROM equipment_images WHERE equipment_id = e.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM equipment e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.is_published = 1
      ORDER BY e.sort_order ASC, e.id DESC
      LIMIT 6
    `);
  }

  // Fetch images for each equipment item
  for (const eq of equipmentList) {
    const imgs = await query<{ image_path: string }>(
      'SELECT image_path FROM equipment_images WHERE equipment_id = ? ORDER BY is_primary DESC, sort_order ASC',
      [eq.id]
    );
    eq.images = imgs.map((i) => i.image_path);
  }

  // Active Branches
  const branches = await query(
    'SELECT * FROM branches WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
  );

  // Active Social Links
  const socialLinks = await query(
    'SELECT * FROM social_links WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
  );

  return {
    settings,
    banners,
    categories,
    equipmentList,
    branches,
    socialLinks,
  };
}

export default async function HomePage() {
  const {
    settings,
    banners,
    categories,
    equipmentList,
    branches,
    socialLinks,
  } = await getHomePageData();

  const siteNameAr = settings['site_name_ar']?.ar || 'معرض الطيب للمعدات الثقيلة';
  const siteNameEn = settings['site_name_en']?.en || 'Al Tayeb Heavy Equipment';
  const logoUrl = settings['logo']?.ar || '';
  const introLogo = settings['intro_logo']?.ar || logoUrl;
  const introEnabled = settings['intro_enabled']?.ar !== '0';
  const phone = settings['phone_number']?.ar || '';
  const whatsapp = settings['whatsapp_number']?.ar || '';

  return (
    <>
      {/* 1. Cinematic Intro Animation */}
      <CinematicIntro
        siteNameAr={siteNameAr}
        siteNameEn={siteNameEn}
        logoUrl={introLogo}
        enabled={introEnabled}
      />

      {/* 2. Main Header & Navigation */}
      <Header
        siteNameAr={siteNameAr}
        siteNameEn={siteNameEn}
        logoUrl={logoUrl}
        phone={phone}
        whatsapp={whatsapp}
      />

      <main className="flex-1">
        {/* 3. Hero Banner / Automatic Slider */}
        <HeroSlider
          banners={banners}
          defaultTitleAr={settings['hero_title_ar']?.ar}
          defaultTitleEn={settings['hero_title_en']?.en}
          defaultSubtitleAr={settings['hero_subtitle_ar']?.ar}
          defaultSubtitleEn={settings['hero_subtitle_en']?.en}
        />

        {/* 4. Equipment Categories Section */}
        <CategoriesSection
          categories={categories}
          titleAr={settings['categories_title_ar']?.ar}
          titleEn={settings['categories_title_en']?.en}
        />

        {/* 5. Featured Equipment Section */}
        <section className="py-16 md:py-24 bg-[#0B0B0B] border-y border-[#181818]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F5C400]/15 border border-[#F5C400]/30 text-[#F5C400] text-xs font-bold uppercase mb-3">
                  <Truck className="w-3.5 h-3.5" />
                  <span>PREMIER SHOWROOM INVENTORY</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {settings['featured_title_ar']?.ar || 'معدات مميزة ومختارة'}
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  {settings['site_description_ar']?.ar ||
                    'أحدث الإضافات إلى معرضنا بحالة الزيرو وفحص فني شامل'}
                </p>
              </div>

              <Link
                href="/equipment"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#F5C400] hover:text-[#FFD429] transition-colors py-2 group w-fit"
              >
                <span>عرض جميع المعدات المتوفرة</span>
                <span className="group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                  ←
                </span>
              </Link>
            </div>

            {/* Equipment Grid */}
            <EquipmentGrid equipment={equipmentList} />

            <div className="mt-12 text-center">
              <Link
                href="/equipment"
                className="inline-flex items-center gap-2 bg-[#181818] hover:bg-[#222] text-white border border-[#333] hover:border-[#F5C400] text-sm font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg"
              >
                <span>تصفح الفهرس الكامل للمعدات (Catalog)</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 6. Equipment Request Section ("محتاج معدة غير موجودة؟") */}
        <section className="py-16 md:py-24 bg-[#080808]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <RequestForm
              titleAr={settings['request_title_ar']?.ar}
              titleEn={settings['request_title_en']?.en}
              subtitleAr={settings['request_subtitle_ar']?.ar}
              subtitleEn={settings['request_subtitle_en']?.en}
            />
          </div>
        </section>

        {/* 7. Showroom Branches & Locations */}
        <ContactSection
          branches={branches}
          socialLinks={socialLinks}
          phone={phone}
          whatsapp={whatsapp}
        />
      </main>

      {/* 8. Footer */}
      <Footer
        siteNameAr={siteNameAr}
        siteNameEn={siteNameEn}
        logoUrl={logoUrl}
        footerTextAr={settings['footer_text_ar']?.ar}
        footerTextEn={settings['footer_text_en']?.en}
        phone={phone}
        whatsapp={whatsapp}
        socialLinks={socialLinks}
      />
    </>
  );
}
