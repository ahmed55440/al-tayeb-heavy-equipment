'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, FolderTree, ExternalLink } from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Toast from '@/components/admin/Toast';
import { useAdminLocale } from '@/lib/admin-i18n';

interface CategoryItem {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  description_ar: string;
  description_en: string;
  image: string;
  sort_order: number;
  is_active: number;
}

export default function AdminCategoriesPage() {
  const { t, isRtl } = useAdminLocale();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories?all=true');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch {
      setToast({ message: t('error'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/categories/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setToast({ message: t('categoryDeletedSuccess'), type: 'success' });
        setCategories((prev) => prev.filter((c) => c.id !== deleteId));
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
            {t('categoriesTitle')}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {t('categoriesSubtitle')}
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 bg-[#F5C400] hover:bg-[#FFD429] text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#F5C400]/10 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addNewCategory')}</span>
        </Link>
      </div>

      {/* Categories Table */}
      <div className="bg-[#151515] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className={`w-full text-sm text-gray-300 ${isRtl ? 'text-right' : 'text-left'}`}>
            <thead className="bg-[#1A1A1A] text-xs uppercase tracking-wider text-gray-400 border-b border-[#262626]">
              <tr>
                <th className="py-4 px-4 font-semibold">{t('tableImage')}</th>
                <th className="py-4 px-4 font-semibold">{t('categoryNameAr')}</th>
                <th className="py-4 px-4 font-semibold">{t('categoryNameEn')}</th>
                <th className="py-4 px-4 font-semibold">{t('customSlug')}</th>
                <th className="py-4 px-4 font-semibold text-center">{t('sortOrder')}</th>
                <th className="py-4 px-4 font-semibold">{t('status')}</th>
                <th className={`py-4 px-4 font-semibold ${isRtl ? 'text-left' : 'text-right'}`}>{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="w-8 h-8 border-3 border-[#F5C400] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    {t('loading')}
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <FolderTree className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    {t('noCategoriesFound')}
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-[#1C1C1C] transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-14 h-12 rounded-lg bg-[#222] overflow-hidden relative border border-[#333]">
                        {c.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.image}
                            alt={c.name_en || c.name_ar}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <FolderTree className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {c.name_ar}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {c.name_en}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-400">
                      {c.slug}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-xs text-gray-400">
                      {c.sort_order}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          c.is_active
                            ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
                        }`}
                      >
                        {c.is_active ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className={`py-3 px-4 ${isRtl ? 'text-left' : 'text-right'}`}>
                      <div className={`flex items-center gap-2 ${isRtl ? 'justify-start' : 'justify-end'}`}>
                        <Link
                          href={`/category/${c.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#252525] rounded-lg transition-colors"
                          title={t('viewOnSite')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/categories/${c.id}`}
                          className="p-1.5 text-gray-400 hover:text-[#F5C400] hover:bg-[#252525] rounded-lg transition-colors"
                          title={t('edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title={t('deleteCategoryTitle')}
        message={t('deleteCategoryMsg')}
        confirmLabel={t('yesDelete')}
        cancelLabel={t('cancel')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
