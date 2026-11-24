'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLocale } from '@/components/ui/LocaleProvider';

interface BannerSlide {
  id: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  image_desktop: string;
  image_mobile: string;
}

interface HeroSliderProps {
  banners: BannerSlide[];
  defaultTitleAr?: string;
  defaultTitleEn?: string;
  defaultSubtitleAr?: string;
  defaultSubtitleEn?: string;
}

export default function HeroSlider({
  banners = [],
  defaultTitleAr = 'معرض الطيب للمعدات الثقيلة',
  defaultTitleEn = 'Al Tayeb Heavy Equipment',
  defaultSubtitleAr = 'نوفر لك المعدات التي تحتاجها بأفضل الاختيارات وأعلى معايير الكفاءة العالمية.',
  defaultSubtitleEn = 'Discover quality heavy machinery for your business with guaranteed performance.',
}: HeroSliderProps) {
  const { isRtl } = useLocale();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // If no banners from DB, provide high-res fallback slides
  const slides = banners.length > 0 ? banners : [
    {
      id: 1,
      title_ar: defaultTitleAr,
      title_en: defaultTitleEn,
      description_ar: defaultSubtitleAr,
      description_en: defaultSubtitleEn,
      image_desktop: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1920&q=85',
      image_mobile: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=85',
    },
    {
      id: 2,
      title_ar: 'أقوى تشكيلة من اللوادر والحفارات',
      title_en: 'Superior Fleet of Loaders & Excavators',
      description_ar: 'جاهزية فورية للتشغيل في كبرى مواقع الإنشاءات والمحاجر مع إشراف هندسي متكامل.',
      description_en: 'Immediate operational readiness for massive infrastructure and quarry operations.',
      image_desktop: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1920&q=85',
      image_mobile: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=85',
    },
  ];

  // Auto rotate every 3.5 seconds (3500ms)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex] || slides[0];
  const title = isRtl ? currentSlide.title_ar || currentSlide.title_en : currentSlide.title_en || currentSlide.title_ar;
  const desc = isRtl ? currentSlide.description_ar || currentSlide.description_en : currentSlide.description_en || currentSlide.description_ar;

  return (
    <div
      className="relative w-full h-[65vh] sm:h-[75vh] md:h-[82vh] max-h-[850px] bg-[#080808] overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Background Slides with Crossfade */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image */}
            <picture className="w-full h-full">
              {slide.image_mobile && (
                <source media="(max-width: 640px)" srcSet={slide.image_mobile} />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image_desktop || slide.image_mobile}
                alt={slide.title_en || slide.title_ar || 'Hero Equipment'}
                className={`w-full h-full object-cover transform scale-100 ${
                  isActive ? 'scale-105 transition-transform duration-[6000ms]' : ''
                }`}
              />
            </picture>

            {/* Dark Industrial Gradient Overlays for Maximum Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-black/50"></div>
          </div>
        );
      })}

      {/* Hero Content Overlay Card */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl">
          {/* Glassmorphism text card container */}
          <div className="p-6 sm:p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80 space-y-4">
            {/* Section Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5C400]/15 border border-[#F5C400]/30 text-[#F5C400] text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#F5C400] animate-ping"></span>
              <span>{isRtl ? 'المعرض المعتمد' : 'Official Showroom'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-gray-300 font-normal leading-relaxed line-clamp-3">
              {desc}
            </p>

            {/* Call to Actions */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link
                href="/equipment"
                className="inline-flex items-center gap-2 bg-[#F5C400] hover:bg-[#FFD429] text-black font-extrabold text-sm px-6 py-3.5 rounded-xl transition-all shadow-xl shadow-[#F5C400]/20 active:scale-95"
              >
                <span>{isRtl ? 'تصفح المعدات المتوفرة' : 'Browse Inventory'}</span>
                {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>

              <Link
                href="/request"
                className="inline-flex items-center gap-2 bg-[#151515]/80 hover:bg-[#202020] text-white border border-white/20 hover:border-[#F5C400] text-sm px-5 py-3.5 rounded-xl transition-all backdrop-blur-md"
              >
                <span>{isRtl ? 'طلب معدة غير موجودة' : 'Request Equipment'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Navigation Arrows (Bottom-Right or Center-Sides) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 hover:bg-[#F5C400] text-white hover:text-black border border-white/10 hover:border-[#F5C400] flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 hover:bg-[#F5C400] text-white hover:text-black border border-white/10 hover:border-[#F5C400] flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicators at Bottom */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'w-7 h-2 bg-[#F5C400]'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
