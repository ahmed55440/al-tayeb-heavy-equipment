'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Truck } from 'lucide-react';
import { useLocale } from '@/components/ui/LocaleProvider';
import EquipmentCard, { EquipmentCardProps } from '@/components/equipment/EquipmentCard';

interface CategoryItem {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
}

interface EquipmentCatalogProps {
  initialEquipment: EquipmentCardProps[];
  categories: CategoryItem[];
}

export default function EquipmentCatalog({
  initialEquipment = [],
  categories = [],
}: EquipmentCatalogProps) {
  const { isRtl } = useLocale();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredEquipment = useMemo(() => {
    return initialEquipment.filter((item) => {
      // Category check
      if (selectedCategory !== 'all') {
        const matchesCategory =
          item.category_name_ar === selectedCategory ||
          item.category_name_en === selectedCategory ||
          (item as any).category_slug === selectedCategory;
        if (!matchesCategory) return false;
      }

      // Status check
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameAr = (item.name_ar || '').toLowerCase();
        const nameEn = (item.name_en || '').toLowerCase();
        const brand = (item.brand || '').toLowerCase();
        const model = (item.model || '').toLowerCase();

        return (
          nameAr.includes(query) ||
          nameEn.includes(query) ||
          brand.includes(query) ||
          model.includes(query)
        );
      }

      return true;
    });
  }, [initialEquipment, selectedCategory, statusFilter, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Header Bar */}
      <div className="bg-[#151515] border border-[#262626] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isRtl
                  ? 'ابحث باسم المعدة، الماركة، أو الموديل...'
                  : 'Search by equipment name, brand, model...'
              }
              className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl pl-10 rtl:pl-4 rtl:pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C400]"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[#F5C400] flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-[#F5C400] w-full sm:w-auto"
            >
              <option value="all">{isRtl ? 'كافة الحالات' : 'All Statuses'}</option>
              <option value="available">{isRtl ? 'متوفر حالياً' : 'Available'}</option>
              <option value="reserved">{isRtl ? 'محجوز' : 'Reserved'}</option>
              <option value="sold">{isRtl ? 'مباع' : 'Sold'}</option>
            </select>
          </div>
        </div>

        {/* Categories Tab Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-[#222]">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#F5C400] text-black shadow-md'
                : 'bg-[#0D0D0D] text-gray-400 hover:text-white border border-[#262626]'
            }`}
          >
            {isRtl ? 'كافة الفئات (الكل)' : 'All Categories'}
          </button>

          {categories.map((c) => {
            const label = isRtl ? c.name_ar : c.name_en;
            const isSelected = selectedCategory === c.slug;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#F5C400] text-black shadow-md'
                    : 'bg-[#0D0D0D] text-gray-400 hover:text-white border border-[#262626]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span>
          {isRtl
            ? `عرض ${filteredEquipment.length} معدة متوفرة`
            : `Showing ${filteredEquipment.length} equipment items`}
        </span>
        {selectedCategory !== 'all' && (
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-[#F5C400] hover:underline"
          >
            {isRtl ? 'إعادة تعيين التصفية' : 'Reset filter'}
          </button>
        )}
      </div>

      {/* Equipment Cards Grid */}
      {filteredEquipment.length === 0 ? (
        <div className="py-20 text-center bg-[#151515] border border-[#262626] rounded-3xl p-8 max-w-xl mx-auto">
          <Truck className="w-14 h-14 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">
            {isRtl ? 'لا توجد معدات مطابقة لخيارات البحث' : 'No matching equipment found'}
          </h3>
          <p className="text-xs text-gray-400 mb-6">
            {isRtl
              ? 'جرّب البحث بكلمات أخرى أو تصفح باقي الفئات، أو أرسل لنا طلب توفير مخصص.'
              : 'Try different search keywords or submit a custom equipment sourcing request.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredEquipment.map((item) => (
            <EquipmentCard key={item.id} equipment={item} />
          ))}
        </div>
      )}
    </div>
  );
}
