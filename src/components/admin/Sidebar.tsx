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
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/equipment', label: 'Equipment', icon: Truck },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/branches', label: 'Branches', icon: MapPin },
  { href: '/admin/social', label: 'Social Links', icon: Share2 },
  { href: '/admin/requests', label: 'Requests', icon: MessageSquare },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  username: string;
}

export default function Sidebar({ username }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <aside className={`bg-[#151515] border-r border-[#222] flex flex-col h-screen sticky top-0 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#222]">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-[#F5C400] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-black font-bold text-sm">AT</span>
            </div>
            <span className="text-white font-semibold text-sm truncate">Al Tayeb Admin</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] text-[#B8B8B8] hover:text-white flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-colors ${
                isActive
                  ? 'bg-[#F5C400]/10 text-[#F5C400]'
                  : 'text-[#B8B8B8] hover:bg-[#1a1a1a] hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#222] p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="w-7 h-7 bg-[#F5C400]/20 rounded-full flex items-center justify-center">
              <span className="text-[#F5C400] text-xs font-bold">{username.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-white text-sm truncate">{username}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
