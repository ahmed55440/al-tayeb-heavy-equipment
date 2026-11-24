'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Home,
  Truck,
  FolderTree,
  Phone,
  MapPin,
  HelpCircle,
  Bell,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { useLocale } from '@/components/ui/LocaleProvider';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  siteNameAr?: string;
  siteNameEn?: string;
  logoUrl?: string;
  phone?: string;
  whatsapp?: string;
}

export default function MobileMenu({
  isOpen,
  onClose,
  siteNameAr = 'معرض الطيب',
  siteNameEn = 'Al Tayeb Heavy Equipment',
  logoUrl,
  phone,
  whatsapp,
}: MobileMenuProps) {
  const { locale, toggleLocale, isRtl } = useLocale();

  // Prevent background body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const menuItems = [
    {
      href: '/',
      labelAr: 'الرئيسية',
      labelEn: 'Home',
      icon: Home,
    },
    {
      href: '/equipment',
      labelAr: 'جميع المعدات',
      labelEn: 'All Equipment',
      icon: Truck,
    },
    {
      href: '/#categories',
      labelAr: 'فئات المعدات',
      labelEn: 'Equipment Categories',
      icon: FolderTree,
    },
    {
      href: '/contact',
      labelAr: 'اتصل بنا',
      labelEn: 'Contact Us',
      icon: Phone,
    },
    {
      href: '/#locations',
      labelAr: 'موقع المعرض والفروع',
      labelEn: 'Showroom Location',
      icon: MapPin,
    },
    {
      href: '/request',
      labelAr: 'محتاج معدة غير متوفرة؟',
      labelEn: 'Looking for Equipment Not Available?',
      icon: HelpCircle,
      highlight: true,
    },
    {
      href: '/request?notify=true',
      labelAr: 'أبلغني عند التوفر',
      labelEn: 'Notify Me When Available',
      icon: Bell,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      ></div>

      {/* Menu Drawer */}
      <div
        className={`relative z-10 w-full max-w-md bg-[#0D0D0D] border-l border-[#222] h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-[#222]">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={isRtl ? siteNameAr : siteNameEn}
                  className="h-9 object-contain"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-[#F5C400] text-black font-extrabold flex items-center justify-center text-lg">
                  ط
                </div>
              )}
              <div>
                <h3 className="font-bold text-white text-base leading-tight">
                  {isRtl ? siteNameAr : siteNameEn}
                </h3>
                <p className="text-[11px] text-[#F5C400] font-medium">
                  {isRtl ? siteNameEn : siteNameAr}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white bg-[#1A1A1A] hover:bg-[#252525] rounded-xl transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="py-6 space-y-2">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all group ${
                    item.highlight
                      ? 'bg-[#F5C400]/10 text-[#F5C400] border border-[#F5C400]/30 hover:bg-[#F5C400]/20'
                      : 'text-gray-300 hover:text-white hover:bg-[#1A1A1A]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      item.highlight
                        ? 'bg-[#F5C400] text-black'
                        : 'bg-[#181818] text-gray-400 group-hover:text-[#F5C400] group-hover:bg-[#222]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1">
                    {isRtl ? item.labelAr : item.labelEn}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Drawer Actions */}
        <div className="pt-6 border-t border-[#222] space-y-4">
          {/* Language Switcher pill */}
          <button
            onClick={toggleLocale}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#151515] hover:bg-[#1E1E1E] border border-[#2a2a2a] rounded-xl text-xs font-semibold text-gray-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#F5C400]" />
              <span>{isRtl ? 'تغيير اللغة' : 'Change Language'}</span>
            </span>
            <span className="text-[#F5C400] font-bold">
              {locale === 'ar' ? 'English (EN)' : 'العربية (AR)'}
            </span>
          </button>

          {/* Contact shortcuts */}
          {(phone || whatsapp) && (
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9+]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 py-2.5 rounded-xl font-bold transition-colors"
                >
                  WhatsApp
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                  className="bg-[#1A1A1A] hover:bg-[#252525] text-white border border-[#333] py-2.5 rounded-xl font-bold transition-colors"
                >
                  {isRtl ? 'اتصال هاتف' : 'Call Phone'}
                </a>
              )}
            </div>
          )}

          <p className="text-center text-[10px] text-gray-600">
            معرض الطيب للمعدات الثقيلة © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
