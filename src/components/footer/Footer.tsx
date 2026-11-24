'use client';

import Link from 'next/link';
import {
  Phone,
  MessageSquare,
  MapPin,
  ArrowUp,
  Share2,
  Shield,
} from 'lucide-react';
import { useLocale } from '@/components/ui/LocaleProvider';

interface SocialItem {
  id: number;
  platform: string;
  url: string;
  icon: string;
}

interface FooterProps {
  siteNameAr?: string;
  siteNameEn?: string;
  logoUrl?: string;
  footerTextAr?: string;
  footerTextEn?: string;
  phone?: string;
  whatsapp?: string;
  socialLinks?: SocialItem[];
}

export default function Footer({
  siteNameAr = 'معرض الطيب للمعدات الثقيلة',
  siteNameEn = 'Al Tayeb Heavy Equipment',
  logoUrl,
  footerTextAr = 'جميع الحقوق محفوظة © معرض الطيب للمعدات الثقيلة — رواد تجارة واستيراد وتوريد كافة المعدات الإنشائية والصناعية',
  footerTextEn = 'All rights reserved © Al Tayeb Heavy Equipment — Leaders in heavy construction and industrial machinery',
  phone,
  whatsapp,
  socialLinks = [],
}: FooterProps) {
  const { isRtl } = useLocale();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050505] border-t border-[#1F1F1F] text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={isRtl ? siteNameAr : siteNameEn}
                  className="h-10 object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#F5C400] text-black font-black flex items-center justify-center text-xl shadow-lg shadow-[#F5C400]/20">
                  ط
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-white text-base leading-tight">
                  {isRtl ? siteNameAr : siteNameEn}
                </h3>
                <p className="text-[10px] text-[#F5C400] font-semibold tracking-wider uppercase">
                  {isRtl ? siteNameEn : siteNameAr}
                </p>
              </div>
            </Link>

            <p className="text-xs text-gray-400 leading-relaxed">
              {isRtl
                ? 'المعرض المتخصص في استيراد وتجارة وصيانة أحدث المعدات الثقيلة (لوادر، حفارات، بلدوزرات، أوناش، كلاركات) بأعلى كفاءة وأفضل خطط أسعار.'
                : 'Premier showroom specialized in importing, selling, and servicing heavy equipment with peak productivity and guaranteed performance.'}
            </p>

            {/* Social media links */}
            {socialLinks.length > 0 && (
              <div className="pt-2 flex items-center gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-[#151515] hover:bg-[#F5C400] hover:text-black text-gray-400 border border-[#2a2a2a] flex items-center justify-center text-xs font-bold transition-all"
                    title={s.platform}
                  >
                    {s.platform.charAt(0)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {isRtl ? 'روابط سريعة' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-[#F5C400] transition-colors">
                  {isRtl ? 'الرئيسية' : 'Home'}
                </Link>
              </li>
              <li>
                <Link href="/equipment" className="hover:text-[#F5C400] transition-colors">
                  {isRtl ? 'جميع المعدات المتوفرة' : 'All Available Equipment'}
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-[#F5C400] transition-colors">
                  {isRtl ? 'فئات المعدات' : 'Equipment Categories'}
                </Link>
              </li>
              <li>
                <Link href="/request" className="hover:text-[#F5C400] transition-colors">
                  {isRtl ? 'طلب معدة غير موجودة' : 'Request Equipment'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#F5C400] transition-colors">
                  {isRtl ? 'اتصل بنا ومواقع الفروع' : 'Contact & Locations'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories Showcase */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {isRtl ? 'أبرز المعدات' : 'Machinery Showcase'}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/category/wheel-loaders" className="hover:text-[#F5C400] transition-colors">
                  {isRtl ? 'لوادر كاتر بيلر وكوماتسو' : 'Wheel Loaders'}
                </Link>
              </li>
              <li>
                <Link href="/category/excavators" className="hover:text-[#F5C400] transition-colors">
                  {isRtl ? 'حفارات هيدروليكية مجنزرة' : 'Excavators'}
                </Link>
              </li>
              <li>
                <Link href="/category/bulldozers" className="hover:text-[#F5C400] transition-colors">
                  {isRtl ? 'بلدوزرات الخدمة الشاقة' : 'Bulldozers'}
                </Link>
              </li>
              <li>
                <Link href="/category/cranes" className="hover:text-[#F5C400] transition-colors">
                  {isRtl ? 'أوناش وروافع تلسكوبية' : 'Cranes'}
                </Link>
              </li>
              <li>
                <Link href="/category/forklifts" className="hover:text-[#F5C400] transition-colors">
                  {isRtl ? 'كلاركات وروافع شوكية' : 'Forklifts'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {isRtl ? 'التواصل المباشر' : 'Direct Support'}
            </h4>
            <ul className="space-y-3 text-xs">
              {phone && (
                <li className="flex items-center gap-2.5 text-gray-300">
                  <Phone className="w-4 h-4 text-[#F5C400] flex-shrink-0" />
                  <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white font-mono">
                    {phone}
                  </a>
                </li>
              )}
              {whatsapp && (
                <li className="flex items-center gap-2.5 text-[#25D366]">
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <a
                    href={`https://wa.me/${whatsapp.replace(/[^0-9+]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline font-mono"
                  >
                    {whatsapp}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2.5 text-gray-400">
                <MapPin className="w-4 h-4 text-[#F5C400] flex-shrink-0 mt-0.5" />
                <span>
                  {isRtl
                    ? 'طريق القاهرة - السويس الصحراوي / الطريق الدولي بالإسكندرية'
                    : 'Cairo-Suez Highway / Alexandria International Highway'}
                </span>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 text-[11px] text-gray-600 hover:text-[#F5C400] transition-colors"
                >
                  <Shield className="w-3 h-3" />
                  <span>{isRtl ? 'بوابة الإدارة (Admin Panel)' : 'Admin Portal'}</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 mt-10 border-t border-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p className="text-center sm:text-left">
            {isRtl ? footerTextAr : footerTextEn}
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-gray-400 hover:text-[#F5C400] transition-colors cursor-pointer"
          >
            <span>{isRtl ? 'العودة للأعلى' : 'Back to top'}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
