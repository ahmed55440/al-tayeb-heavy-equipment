'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  FolderTree,
  Image as ImageIcon,
  MessageSquare,
  MapPin,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import { useAdminLocale } from '@/lib/admin-i18n';

interface DashboardStats {
  totalEquipment: number;
  availableEquipment: number;
  soldEquipment: number;
  reservedEquipment: number;
  totalCategories: number;
  newRequests: number;
  totalRequests: number;
  totalBanners: number;
  totalBranches: number;
}

interface RecentRequest {
  id: number;
  ref_number: string;
  customer_name: string;
  phone: string;
  equipment_name: string;
  status: string;
  created_at: string;
}

interface RecentEquipment {
  id: number;
  name_ar: string;
  name_en: string;
  brand: string;
  model: string;
  price: string;
  price_type: string;
  status: string;
  primary_image: string;
  category_name_ar: string;
  category_name_en: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [recentEquipment, setRecentEquipment] = useState<RecentEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, isRtl } = useAdminLocale();

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setRecentRequests(data.recentRequests || []);
          setRecentEquipment(data.recentEquipment || []);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#F5C400] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            {t('overviewTitle')}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {t('welcomeAdmin')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/equipment/new"
            className="inline-flex items-center gap-2 bg-[#F5C400] hover:bg-[#FFD429] text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#F5C400]/10"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addEquipmentBtn')}</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#252525] text-white border border-[#333] text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <span>{t('viewWebsite')}</span>
            <ArrowUpRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title={t('totalEquipment')}
          value={stats?.totalEquipment || 0}
          icon={Truck}
          color="#F5C400"
          subtitle={`${stats?.availableEquipment || 0} ${t('availableInStock')}`}
        />
        <StatsCard
          title={t('newRequests')}
          value={stats?.newRequests || 0}
          icon={MessageSquare}
          color="#38BDF8"
          subtitle={`${stats?.totalRequests || 0} ${t('totalInquiries')}`}
        />
        <StatsCard
          title={t('activeCategories')}
          value={stats?.totalCategories || 0}
          icon={FolderTree}
          color="#A855F7"
          subtitle={t('machineryClasses')}
        />
        <StatsCard
          title={t('branchesCount')}
          value={stats?.totalBranches || 0}
          icon={MapPin}
          color="#22C55E"
          subtitle={`${stats?.totalBanners || 0} ${t('heroBannersCount')}`}
        />
      </div>

      {/* Two-column layout for recent items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Equipment */}
        <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#F5C400]" />
              <span>{t('latestEquipment')}</span>
            </h2>
            <Link
              href="/admin/equipment"
              className="text-xs text-[#F5C400] hover:underline flex items-center gap-1 font-bold"
            >
              <span>{t('viewAll')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentEquipment.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">{t('noRecentEquipment')}</p>
            ) : (
              recentEquipment.map((eq) => (
                <div
                  key={eq.id}
                  className="flex items-center gap-4 p-3 bg-[#0D0D0D] border border-[#222] rounded-xl hover:border-[#333] transition-colors"
                >
                  <div className="w-14 h-12 rounded-lg bg-[#222] overflow-hidden flex-shrink-0 relative">
                    {eq.primary_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={eq.primary_image}
                        alt={eq.name_ar || eq.name_en}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Truck className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {isRtl ? eq.name_ar || eq.name_en : eq.name_en || eq.name_ar}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {eq.brand} {eq.model} • {isRtl ? eq.category_name_ar : eq.category_name_en || 'General'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                        eq.status === 'available'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}
                    >
                      {eq.status === 'available' ? t('available') : eq.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#38BDF8]" />
              <span>{t('latestRequests')}</span>
            </h2>
            <Link
              href="/admin/requests"
              className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1 font-bold"
            >
              <span>{t('viewAll')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentRequests.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">{t('noRecentRequests')}</p>
            ) : (
              recentRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 bg-[#0D0D0D] border border-[#222] rounded-xl hover:border-[#333] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#F5C400] bg-[#F5C400]/10 px-2 py-0.5 rounded">
                        {req.ref_number}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {req.customer_name}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                        req.status === 'new'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                    <span>{t('desiredEquipment')}: <strong className="text-gray-300">{req.equipment_name || 'عام'}</strong></span>
                    <span className="font-mono">{req.phone}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
