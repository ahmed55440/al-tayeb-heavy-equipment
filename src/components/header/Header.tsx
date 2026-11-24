'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Globe } from 'lucide-react';
import { useLocale } from '@/components/ui/LocaleProvider';
import MobileMenu from '@/components/header/MobileMenu';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useTheme } from '@/components/ui/ThemeProvider';

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
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLight = theme === 'light';

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? isLight
              ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg py-3'
              : 'bg-[#080808]/90 backdrop-blur-md border-b border-[#222] shadow-2xl py-3'
            : isLight
            ? 'bg-white border-b border-gray-200 py-4'
            : 'bg-[#080808] border-b border-[#1A1A1A] py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* LEFT GROUP: Language Switcher + Theme Switcher + Showroom Logo */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Action buttons (Language + Theme) */}
            <div className="flex items-center gap-2">
              {/* Language Switcher button */}
              <button
                type="button"
                onClick={toggleLocale}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  isLight
                    ? 'bg-[#F3F3F3] hover:bg-[#EAEAEA] border border-[#D1D5DB] text-gray-800'
                    : 'bg-[#151515] hover:bg-[#202020] border border-[#2a2a2a] text-gray-300 hover:text-white'
                }`}
                title="Switch Language / تغيير اللغة"
                aria-label="Switch Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#F5C400]" />
                <span className="tracking-wide">
                  {locale === 'ar' ? 'EN' : 'عربي'}
                </span>
              </button>

              {/* Theme Switcher button (Sun / Moon) */}
              <ThemeToggle />
            </div>

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
                <span className={`font-extrabold text-base sm:text-lg tracking-tight group-hover:text-[#F5C400] transition-colors leading-none ${
                  isLight ? 'text-black' : 'text-white'
                }`}>
                  {isRtl ? siteNameAr : siteNameEn}
                </span>
                <span className="text-[10px] sm:text-xs text-[#F5C400] font-semibold tracking-wider uppercase mt-1 leading-none">
                  {isRtl ? siteNameEn : siteNameAr}
                </span>
              </div>
            </Link>
          </div>

          {/* Quick links on Desktop (Center-Right) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link
              href="/"
              className={`hover:text-[#F5C400] transition-colors ${
                isLight ? 'text-gray-800' : 'text-gray-300'
              }`}
            >
              {isRtl ? 'الرئيسية' : 'Home'}
            </Link>
            <Link
              href="/equipment"
              className={`hover:text-[#F5C400] transition-colors ${
                isLight ? 'text-gray-800' : 'text-gray-300'
              }`}
            >
              {isRtl ? 'جميع المعدات' : 'All Equipment'}
            </Link>
            <Link
              href="/#categories"
              className={`hover:text-[#F5C400] transition-colors ${
                isLight ? 'text-gray-800' : 'text-gray-300'
              }`}
            >
              {isRtl ? 'الفئات' : 'Categories'}
            </Link>
            <Link
              href="/contact"
              className={`hover:text-[#F5C400] transition-colors ${
                isLight ? 'text-gray-800' : 'text-gray-300'
              }`}
            >
              {isRtl ? 'اتصل بنا' : 'Contact'}
            </Link>
            <Link
              href="/request"
              className="px-3.5 py-1.5 rounded-xl bg-[#F5C400]/15 hover:bg-[#F5C400]/25 text-[#B45309] dark:text-[#F5C400] border border-[#F5C400]/40 transition-colors text-xs font-bold"
            >
              {isRtl ? 'طلب معدة خاصة' : 'Custom Request'}
            </Link>
          </nav>

          {/* RIGHT: Hamburger menu icon */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={`p-2.5 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-1 focus:ring-[#F5C400] ${
              isLight
                ? 'bg-[#F3F3F3] hover:bg-[#EAEAEA] border border-[#D1D5DB] text-gray-800 hover:text-[#B45309]'
                : 'bg-[#151515] hover:bg-[#222] border border-[#2a2a2a] text-gray-300 hover:text-[#F5C400]'
            }`}
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
