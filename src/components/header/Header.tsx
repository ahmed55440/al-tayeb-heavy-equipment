'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Globe } from 'lucide-react';
import { useLocale } from '@/components/ui/LocaleProvider';
import MobileMenu from '@/components/header/MobileMenu';

interface HeaderProps {
  siteNameAr?: string;
  siteNameEn?: string;
  logoUrl?: string;
  phone?: string;
  whatsapp?: string;
}

export default function Header({
  siteNameAr = 'معرض الطيب للمعدات الثقيلة',
  siteNameEn = 'Al Tayeb Heavy Equipment',
  logoUrl,
  phone,
  whatsapp,
}: HeaderProps) {
  const { locale, toggleLocale, isRtl } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#080808]/90 backdrop-blur-md border-b border-[#222] shadow-2xl py-3'
            : 'bg-[#080808] border-b border-[#1A1A1A] py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* LEFT GROUP: Language Switcher + Showroom Logo */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Language Switcher button (Far LEFT) */}
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151515] hover:bg-[#202020] border border-[#2a2a2a] text-xs font-bold text-gray-300 hover:text-white transition-all shadow-sm"
              title="Switch Language / تغيير اللغة"
              aria-label="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#F5C400]" />
              <span className="tracking-wide">
                {locale === 'ar' ? 'EN' : 'عربي'}
              </span>
            </button>

            {/* Showroom Logo + Brand Name */}
            <Link href="/" className="flex items-center gap-3 group">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={isRtl ? siteNameAr : siteNameEn}
                  className="h-10 sm:h-12 object-contain transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#F5C400] to-[#FFD429] flex items-center justify-center text-black font-black text-xl shadow-lg shadow-[#F5C400]/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                  ط
                </div>
              )}

              <div className="flex flex-col">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight group-hover:text-[#F5C400] transition-colors leading-none">
                  {isRtl ? siteNameAr : siteNameEn}
                </span>
                <span className="text-[10px] sm:text-xs text-[#F5C400] font-semibold tracking-wider uppercase mt-1 leading-none">
                  {isRtl ? siteNameEn : siteNameAr}
                </span>
              </div>
            </Link>
          </div>

          {/* Quick links on Desktop (Center-Right) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-300">
            <Link
              href="/"
              className="hover:text-[#F5C400] transition-colors"
            >
              {isRtl ? 'الرئيسية' : 'Home'}
            </Link>
            <Link
              href="/equipment"
              className="hover:text-[#F5C400] transition-colors"
            >
              {isRtl ? 'جميع المعدات' : 'All Equipment'}
            </Link>
            <Link
              href="/#categories"
              className="hover:text-[#F5C400] transition-colors"
            >
              {isRtl ? 'الفئات' : 'Categories'}
            </Link>
            <Link
              href="/contact"
              className="hover:text-[#F5C400] transition-colors"
            >
              {isRtl ? 'اتصل بنا' : 'Contact'}
            </Link>
            <Link
              href="/request"
              className="px-3.5 py-1.5 rounded-xl bg-[#F5C400]/10 hover:bg-[#F5C400]/20 text-[#F5C400] border border-[#F5C400]/30 transition-colors text-xs font-bold"
            >
              {isRtl ? 'طلب معدة خاصة' : 'Custom Request'}
            </Link>
          </nav>

          {/* RIGHT: Hamburger menu icon (Far RIGHT) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2.5 bg-[#151515] hover:bg-[#222] border border-[#2a2a2a] text-gray-300 hover:text-[#F5C400] rounded-xl transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-[#F5C400]"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </header>

      {/* Slide-out Navigation Drawer */}
      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        siteNameAr={siteNameAr}
        siteNameEn={siteNameEn}
        logoUrl={logoUrl}
        phone={phone}
        whatsapp={whatsapp}
      />
    </>
  );
}
