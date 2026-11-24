'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  FolderTree,
  Image as ImageIcon,
  MapPin,
  Share2,
  Settings,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import { useAdminLocale } from '@/lib/admin-i18n';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface SidebarProps {
  username: string;
}

export default function Sidebar({ username }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { locale, toggleLocale, t, isRtl } = useAdminLocale();

  const navItems = [
    { href: '/admin/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/admin/equipment', label: t('equipment'), icon: Truck },
    { href: '/admin/categories', label: t('categories'), icon: FolderTree },
    { href: '/admin/banners', label: t('banners'), icon: ImageIcon },
    { href: '/admin/branches', label: t('branches'), icon: MapPin },
    { href: '/admin/social', label: t('social'), icon: Share2 },
    { href: '/admin/requests', label: t('requests'), icon: MessageSquare },
    { href: '/admin/settings', label: t('settings'), icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <aside
      className={`bg-[#151515] ${
        isRtl ? 'border-l' : 'border-r'
      } border-[#222] flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 ${
        collapsed ? 'w-[72px]' : 'w-[250px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#222]">
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#F5C400] to-[#FFD429] rounded-lg flex items-center justify-center flex-shrink-0 text-black font-extrabold text-sm shadow">
              ط
            </div>
            <div className="min-w-0">
              <span className="text-white font-bold text-sm block truncate">
                {isRtl ? 'إدارة الطيب' : 'Al Tayeb Admin'}
              </span>
              <span className="text-[10px] text-[#F5C400] block truncate">
                {isRtl ? 'لوحة التحكم' : 'Control Center'}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-gray-400 hover:text-white flex-shrink-0 cursor-pointer"
          title={collapsed ? 'توسيع' : 'طي'}
        >
          {collapsed ? (
            isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />
          ) : (
            isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />
          )}
        </button>
      </div>

      {/* Language & Theme Controls in Sidebar */}
      <div className="px-3 pt-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={toggleLocale}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#1A1A1A] hover:bg-[#222] border border-[#2a2a2a] rounded-xl text-xs font-bold text-gray-300 hover:text-[#F5C400] transition-colors cursor-pointer"
          title={isRtl ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'}
        >
          <Globe size={14} className="text-[#F5C400]" />
          {!collapsed && (
            <span className="tracking-wide">
              {locale === 'ar' ? 'English (EN)' : 'العربية (AR)'}
            </span>
          )}
        </button>

        {/* Theme Switcher Toggle */}
        <ThemeToggle showLabel={!collapsed} className="w-full justify-center" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#F5C400] text-black shadow-lg shadow-[#F5C400]/20 font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-[#1f1f1f]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User & Logout */}
      <div className="p-3 border-t border-[#222] space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-[#F5C400] hover:bg-[#1a1a1a] transition-colors w-full"
          title={t('viewWebsite')}
        >
          <ExternalLink size={16} className="flex-shrink-0" />
          {!collapsed && <span>{t('viewWebsite')}</span>}
        </Link>

        <div className="flex items-center justify-between pt-1">
          {!collapsed && (
            <div className="min-w-0 pr-2 rtl:pr-0 rtl:pl-2">
              <p className="text-white text-xs font-semibold truncate">{username}</p>
              <p className="text-gray-500 text-[10px]">{isRtl ? 'مسؤول النظام' : 'Administrator'}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0 cursor-pointer"
            title={t('logout')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
