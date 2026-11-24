'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Toast from '@/components/admin/Toast';

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
      setToast({ message: 'Failed to load banners', type: 'error' });
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
        setToast({ message: 'Banner deleted successfully', type: 'success' });
        setBanners((prev) => prev.filter((b) => b.id !== deleteId));
      } else {
        setToast({ message: data.error || 'Failed to delete banner', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error deleting banner', type: 'error' });
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
            Homepage Hero Banners
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage the cinematic 3.5s rotating hero sliders, headlines, and background images.
          </p>
        </div>
        <Link
          href="/admin/banners/new"
          className="inline-flex items-center gap-2 bg-[#F5C400] hover:bg-[#FFD429] text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#F5C400]/10 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slide</span>
        </Link>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            <div className="w-8 h-8 border-3 border-[#F5C400] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading hero slides...
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-[#151515] border border-[#262626] rounded-2xl p-8">
            <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No hero slides found. Add your first slide above.
          </div>
        ) : (
          banners.map((b) => (
            <div
              key={b.id}
              className="bg-[#151515] border border-[#262626] rounded-2xl overflow-hidden flex flex-col group hover:border-[#383838] transition-all"
            >
              <div className="relative aspect-[16/9] bg-[#0D0D0D] overflow-hidden">
                {b.image_desktop ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.image_desktop}
                    alt={b.title_en || b.title_ar}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md ${
                      b.is_active
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                    }`}
                  >
                    {b.is_active ? 'Active' : 'Draft'}
                  </span>
                  <span className="text-[11px] font-mono bg-black/60 text-[#F5C400] px-2 py-0.5 rounded-full border border-white/10">
                    #{b.sort_order}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-base truncate">
                    {b.title_ar || b.title_en}
                  </h3>
                  <p className="text-xs text-[#F5C400] truncate mt-0.5">
                    {b.title_en}
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-2">
                    {b.description_ar || b.description_en}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-[#222]">
                  <Link
                    href={`/admin/banners/${b.id}`}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-[#F5C400] px-3 py-1.5 rounded-lg bg-[#222] hover:bg-[#2a2a2a] transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => setDeleteId(b.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Hero Slide"
        message="Are you sure you want to remove this banner slide from the homepage hero carousel?"
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
