'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, ArrowRight } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import Toast from '@/components/admin/Toast';
import { useAdminLocale } from '@/lib/admin-i18n';

interface CategoryData {
  id?: number;
  name_ar: string;
  name_en: string;
  slug?: string;
  description_ar: string;
  description_en: string;
  image: string;
  sort_order: number;
  is_active: boolean;
}

interface CategoryFormProps {
  initialData?: CategoryData;
  isEdit?: boolean;
}

export default function CategoryForm({ initialData, isEdit }: CategoryFormProps) {
  const router = useRouter();
  const { t, isRtl } = useAdminLocale();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<CategoryData>({
    name_ar: initialData?.name_ar || '',
    name_en: initialData?.name_en || '',
    slug: initialData?.slug || '',
    description_ar: initialData?.description_ar || '',
    description_en: initialData?.description_en || '',
    image: initialData?.image || '',
    sort_order: initialData?.sort_order ?? 0,
    is_active: initialData?.is_active ?? true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_ar && !formData.name_en) {
      setToast({ message: t('nameAr'), type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const url = isEdit && initialData?.id ? `/api/categories/${initialData.id}` : '/api/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setToast({
          message: isEdit ? t('categoryUpdatedSuccess') : t('categoryCreatedSuccess'),
          type: 'success',
        });
        setTimeout(() => {
          router.push('/admin/categories');
        }, 1000);
      } else {
        setToast({ message: data.error || t('error'), type: 'error' });
      }
    } catch {
      setToast({ message: t('error'), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-[#222] pb-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <BackIcon className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#F5C400] hover:bg-[#FFD429] text-black font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-[#F5C400]/20 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isEdit ? t('saveChanges') : t('addNewCategory')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">{t('categoryNamesSection')}</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                {t('categoryNameAr')}
              </label>
              <input
                type="text"
                name="name_ar"
                value={formData.name_ar}
                onChange={handleChange}
                dir="rtl"
                placeholder="مثال: اللوادر (Wheel Loaders)"
                required
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                {t('categoryNameEn')}
              </label>
              <input
                type="text"
                name="name_en"
                value={formData.name_en}
                onChange={handleChange}
                dir="ltr"
                placeholder="e.g. Wheel Loaders"
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                {t('customSlug')}
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="loaders"
                dir="ltr"
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                {t('descriptionAr')}
              </label>
              <textarea
                name="description_ar"
                rows={3}
                value={formData.description_ar}
                onChange={handleChange}
                dir="rtl"
                placeholder="نبذة عن معدات هذه الفئة واستخداماتها..."
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                {t('descriptionEn')}
              </label>
              <textarea
                name="description_en"
                rows={3}
                value={formData.description_en}
                onChange={handleChange}
                dir="ltr"
                placeholder="Category overview and machine specifications..."
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">{t('categoryCoverImg')}</h2>
            <ImageUploader
              value={formData.image}
              onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
              label={t('categoryCoverImg')}
            />
          </div>

          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">{t('categorySettingsSection')}</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                {t('sortOrder')}
              </label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleChange}
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-700 text-[#F5C400] focus:ring-[#F5C400] bg-[#0D0D0D]"
                />
                <span className="text-sm font-medium text-white">{t('active')}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
