'use client';

import EquipmentCard, { EquipmentCardProps } from '@/components/equipment/EquipmentCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Truck } from 'lucide-react';
import { useLocale } from '@/components/ui/LocaleProvider';

interface EquipmentGridProps {
  equipment: EquipmentCardProps[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function EquipmentGrid({
  equipment = [],
  loading = false,
  emptyMessage,
}: EquipmentGridProps) {
  const { isRtl } = useLocale();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="py-16 text-center bg-[#151515] border border-[#262626] rounded-3xl p-8 max-w-xl mx-auto">
        <Truck className="w-14 h-14 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">
          {emptyMessage || (isRtl ? 'لا توجد معدات مطابقة حالياً' : 'No equipment found')}
        </h3>
        <p className="text-xs text-gray-400">
          {isRtl
            ? 'يمكنك تقديم طلب خاص بالمعدة التي تبحث عنها وسنقوم بتوفيرها لك فوراً.'
            : 'You can submit a custom equipment request and we will source it for you.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {equipment.map((item) => (
        <EquipmentCard key={item.id} equipment={item} />
      ))}
    </div>
  );
}
