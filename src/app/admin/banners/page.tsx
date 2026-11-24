'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Toast from '@/components/admin/Toast';
import { useAdminLocale } from '@/lib/admin-i18n';

interface BannerItem {
  id: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  image_desktop: string;
  image_mobile: string;
  sort_order: number;
  is_active: number;
}

export default function AdminBannersPage() {
  const { t, isRtl } = useAdminLocale();
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/banners?all=true');
      const data = await res.json();
      if (data.success) {
        setBanners(data.banners || []);
      }
    } catch {
      setToast({ message: t('error'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/banners/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setToast({ message: t('slideDeletedSuccess'), type: 'success' });
        setBanners((prev) => prev.filter((b) => b.id !== deleteId));
      } else {
        setToast({ message: data.error || t('error'), type: 'error' });
      }
    } catch {
      setToast({ message: t('error'), type: 'error' });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {t('bannersTitle')}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {t('bannersSubtitle')}
          </p>
        </div>
        <Link
          href="/admin/banners/new"
          className="inline-flex items-center gap-2 bg-[#F5C400] hover:bg-[#FFD429] text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#F5C400]/10 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addNewSlide')}</span>
        </Link>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            <div className="w-8 h-8 border-3 border-[#F5C400] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            {t('loading')}
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full bg-[#151515] border border-[#262626] rounded-2xl p-12 text-center text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#F5C400]" />
            <p>{t('noBannersFound')}</p>
          </div>
        ) : (
          banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-[#151515] border border-[#262626] rounded-2xl overflow-hidden shadow-xl flex flex-col group hover:border-[#3a3a3a] transition-all"
            >
              {/* Image Preview */}
              <div className="relative aspect-video w-full bg-[#1e1e1e] overflow-hidden">
                {banner.image_desktop ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={banner.image_desktop}
                    alt={banner.title_en || banner.title_ar || 'Hero Banner'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md ${
                      banner.is_active
                        ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/40'
                    }`}
                  >
                    {banner.is_active ? t('active') : t('inactive')}
                  </span>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-black/60 text-[#F5C400] border border-[#F5C400]/30 backdrop-blur-md">
                    #{banner.sort_order}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white line-clamp-1">
                    {banner.title_ar || banner.title_en || 'بدون عنوان'}
                  </h3>
                  {banner.title_en && banner.title_ar && (
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                      {banner.title_en}
                    </p>
                  )}
                  {(banner.description_ar || banner.description_en) && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-2">
                      {banner.description_ar || banner.description_en}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#222]">
                  <span className="text-xs text-gray-500">
                    {banner.image_mobile ? 'سطح المكتب + الهاتف' : 'سطح المكتب'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/banners/${banner.id}`}
                      className="p-1.5 text-gray-400 hover:text-[#F5C400] hover:bg-[#252525] rounded-lg transition-colors"
                      title={t('edit')}
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(banner.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title={t('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title={t('deleteBannerTitle')}
        message={t('deleteBannerMsg')}
        confirmLabel={t('yesDelete')}
        cancelLabel={t('cancel')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
