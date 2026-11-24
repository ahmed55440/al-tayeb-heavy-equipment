'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, Calendar, Tag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLocale } from '@/components/ui/LocaleProvider';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatPrice } from '@/lib/utils';

export interface EquipmentCardProps {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  brand: string;
  model: string;
  year: string;
  price: string;
  price_type: string;
  status: string;
  is_featured?: number;
  primary_image?: string;
  category_name_ar?: string;
  category_name_en?: string;
  images?: string[];
}

export default function EquipmentCard({ equipment }: { equipment: EquipmentCardProps }) {
  const { isRtl, locale } = useLocale();
  const [imageIndex, setImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Collect all photos available for this equipment
  const photos = equipment.images && equipment.images.length > 0
    ? equipment.images
    : equipment.primary_image
    ? [equipment.primary_image]
    : [];

  // Automatic image slideshow when user hovers or periodic rotation every 3s
  useEffect(() => {
    if (!isHovered || photos.length <= 1) return;

    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % photos.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isHovered, photos.length]);

  const name = isRtl ? equipment.name_ar || equipment.name_en : equipment.name_en || equipment.name_ar;
  const currentPhoto = photos[imageIndex] || photos[0];

  return (
    <Link
      href={`/equipment/${equipment.slug}`}
      className="group bg-[#151515] border border-[#262626] hover:border-[#F5C400]/80 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#F5C400]/10 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setImageIndex(0);
      }}
    >
      <div>
        {/* Machinery Photo Area */}
        <div className="relative aspect-[16/10] bg-[#0D0D0D] overflow-hidden">
          {currentPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentPhoto}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-[#1A1A1A]">
              <Truck className="w-12 h-12 opacity-40 mb-2" />
              <span className="text-xs text-gray-500">Al Tayeb Equipment</span>
            </div>
          )}

          {/* Status Badge (Top-Right / Left depending on RTL) */}
          <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
            <StatusBadge status={equipment.status} locale={locale} />
            {Boolean(equipment.is_featured) && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F5C400] text-black shadow-md">
                {isRtl ? 'مميز' : 'FEATURED'}
              </span>
            )}
          </div>

          {/* Photo Slideshow Indicator Dots if multiple photos exist */}
          {photos.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm">
              {photos.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === imageIndex ? 'w-4 bg-[#F5C400]' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Category Pill Tag at bottom */}
          {(equipment.category_name_ar || equipment.category_name_en) && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-black/70 text-gray-200 border border-white/10 backdrop-blur-md">
                {isRtl ? equipment.category_name_ar : equipment.category_name_en}
              </span>
            </div>
          )}
        </div>

        {/* Card Details Body */}
        <div className="p-5 space-y-3">
          {/* Brand & Model Pills */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-bold text-[#F5C400] uppercase tracking-wider">
              {equipment.brand || 'INTERNATIONAL'}
            </span>
            {equipment.year && (
              <span className="flex items-center gap-1 text-gray-400 font-mono">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>{equipment.year}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#F5C400] transition-colors line-clamp-1">
            {name}
          </h3>

          {/* Model Specification if available */}
          {equipment.model && (
            <p className="text-xs text-gray-400 line-clamp-1 font-mono">
              Model: {equipment.model}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer: Price & Details Link */}
      <div className="px-5 py-4 border-t border-[#222] bg-[#121212] flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-gray-500 block">
            {isRtl ? 'السعر التقديري' : 'PRICE'}
          </span>
          {equipment.price_type === 'contact' || !equipment.price ? (
            <span className="text-xs sm:text-sm font-bold text-[#F5C400]">
              {isRtl ? 'اتصل للسعر' : 'Contact for Price'}
            </span>
          ) : (
            <span className="text-sm sm:text-base font-extrabold text-white font-mono">
              {formatPrice(equipment.price, locale)}{' '}
              <span className="text-xs font-sans text-gray-400 font-normal">
                {isRtl ? 'ج.م' : 'EGP'}
              </span>
            </span>
          )}
        </div>

        <div className="w-8 h-8 rounded-full bg-[#1F1F1F] group-hover:bg-[#F5C400] text-gray-400 group-hover:text-black flex items-center justify-center transition-colors">
          {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </div>
      </div>
    </Link>
  );
}
