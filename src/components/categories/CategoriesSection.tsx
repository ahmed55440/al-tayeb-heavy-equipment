'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, FolderTree } from 'lucide-react';
import { useLocale } from '@/components/ui/LocaleProvider';
import SectionTitle from '@/components/ui/SectionTitle';

interface CategoryItem {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  description_ar: string;
  description_en: string;
  image: string;
}

interface CategoriesSectionProps {
  categories: CategoryItem[];
  titleAr?: string;
  titleEn?: string;
}

export default function CategoriesSection({
  categories = [],
  titleAr = 'فئات المعدات المتوفرة',
  titleEn = 'Equipment Categories',
}: CategoriesSectionProps) {
  const { isRtl } = useLocale();

  if (categories.length === 0) return null;

  return (
    <section id="categories" className="py-16 md:py-24 bg-[#080808] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading with Yellow Glass Accent */}
        <SectionTitle
          title={isRtl ? titleAr : titleEn}
          subtitle={
            isRtl
              ? 'تصفح أسطول المعدات الثقيلة المتاح في صالة العرض والمستودعات المركزية'
              : 'Browse our premier fleet of heavy machinery available in our showroom and warehouses'
          }
          center={true}
        />

        {/* Categories Grid: 3 cols desktop, 2 tablet, 1 mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {categories.map((cat) => {
            const name = isRtl ? cat.name_ar || cat.name_en : cat.name_en || cat.name_ar;
            const desc = isRtl ? cat.description_ar || cat.description_en : cat.description_en || cat.description_ar;

            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group relative h-72 sm:h-80 rounded-3xl overflow-hidden bg-[#151515] border border-[#262626] hover:border-[#F5C400]/60 transition-all duration-500 shadow-xl flex flex-col justify-end p-6"
              >
                {/* Background Machinery Image */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter brightness-75 group-hover:brightness-90"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center text-gray-700">
                      <FolderTree className="w-16 h-16" />
                    </div>
                  )}

                  {/* High-contrast Industrial Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F5C400]/15 border border-[#F5C400]/30 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5C400]"></span>
                    <span className="text-[11px] font-bold text-[#F5C400] tracking-wider uppercase">
                      {isRtl ? 'تصنيف معدات' : 'MACHINERY CLASS'}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#F5C400] transition-colors">
                    {name}
                  </h3>

                  {desc && (
                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                      {desc}
                    </p>
                  )}

                  <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#F5C400] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                    <span>{isRtl ? 'استعراض المعدات' : 'Explore Machinery'}</span>
                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
