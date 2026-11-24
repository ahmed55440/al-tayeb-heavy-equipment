'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, ArrowRight } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import Toast from '@/components/admin/Toast';
import { useAdminLocale } from '@/lib/admin-i18n';

interface CategoryOption {
  id: number;
  name_ar: string;
  name_en: string;
}

interface EquipmentData {
  id?: number;
  category_id?: number | null;
  name_ar: string;
  name_en: string;
  slug?: string;
  brand: string;
  model: string;
  year: string;
  price: string;
  price_type: string;
  description_ar: string;
  description_en: string;
  specs_ar: string;
  specs_en: string;
  status: string;
  is_featured: boolean;
  is_published: boolean;
  images?: string[];
}

interface EquipmentFormProps {
  initialData?: EquipmentData;
  isEdit?: boolean;
}

export default function EquipmentForm({ initialData, isEdit }: EquipmentFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { t, isRtl } = useAdminLocale();

  const [formData, setFormData] = useState<EquipmentData>({
    category_id: initialData?.category_id || null,
    name_ar: initialData?.name_ar || '',
    name_en: initialData?.name_en || '',
    slug: initialData?.slug || '',
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    year: initialData?.year || '',
    price: initialData?.price || '',
    price_type: initialData?.price_type || 'fixed',
    description_ar: initialData?.description_ar || '',
    description_en: initialData?.description_en || '',
    specs_ar: initialData?.specs_ar || '',
    specs_en: initialData?.specs_en || '',
    status: initialData?.status || 'available',
    is_featured: initialData?.is_featured ?? false,
    is_published: initialData?.is_published ?? true,
    images: initialData?.images || [],
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories?all=true');
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
      setToast({
        message: isRtl ? 'يرجى إدخال اسم المعدة بالعربية أو الإنجليزية' : 'Equipment name is required',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const url = isEdit && initialData?.id ? `/api/equipment/${initialData.id}` : '/api/equipment';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setToast({
          message: isEdit
            ? isRtl ? 'تم تحديث بيانات المعدة بنجاح!' : 'Equipment updated successfully!'
            : isRtl ? 'تمت إضافة المعدة بنجاح إلى المعرض!' : 'Equipment created successfully!',
          type: 'success',
        });
        setTimeout(() => {
          router.push('/admin/equipment');
        }, 1000);
      } else {
        setToast({ message: data.error || (isRtl ? 'فشل حفظ المعدة' : 'Failed to save'), type: 'error' });
      }
    } catch {
      setToast({ message: isRtl ? 'حدث خطأ أثناء الاتصال' : 'Error submitting form', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
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
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t('back')}</span>
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#F5C400] hover:bg-[#FFD429] text-black font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#F5C400]/20 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isEdit ? t('saveChanges') : t('publishEquipment')}</span>
        </button>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Details) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Basic Info */}
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">{t('basicInfo')}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {t('nameAr')}
                </label>
                <input
                  type="text"
                  name="name_ar"
                  value={formData.name_ar}
                  onChange={handleChange}
                  dir="rtl"
                  placeholder="مثال: لودر كاتر بيلر CAT 966H"
                  required
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {t('nameEn')}
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleChange}
                  placeholder="e.g. Caterpillar CAT 966H Wheel Loader"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {t('brand')}
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Caterpillar, Komatsu..."
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {t('model')}
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="966H, PC300-8..."
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {t('year')}
                </label>
                <input
                  type="text"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="2021"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>
          </div>

          {/* Card: Pricing & Category */}
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">{t('pricingCategory')}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {t('priceOption')}
                </label>
                <select
                  name="price_type"
                  value={formData.price_type}
                  onChange={handleChange}
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                >
                  <option value="fixed">{t('fixedPrice')}</option>
                  <option value="contact">{t('contactForPriceOption')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {t('priceEgp')}
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={formData.price_type === 'contact'}
                  placeholder="3500000"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400] disabled:opacity-40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {t('category')}
                </label>
                <select
                  name="category_id"
                  value={formData.category_id || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category_id: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                >
                  <option value="">{t('selectCategory')}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isRtl ? c.name_ar : c.name_en || c.name_ar}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card: Descriptions */}
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">{t('descriptions')}</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                {t('descriptionAr')}
              </label>
              <textarea
                name="description_ar"
                rows={4}
                value={formData.description_ar}
                onChange={handleChange}
                dir="rtl"
                placeholder="تفاصيل حالة المعدة، سجل الصيانة، الكابينة، المحرك..."
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                {t('descriptionEn')}
              </label>
              <textarea
                name="description_en"
                rows={4}
                value={formData.description_en}
                onChange={handleChange}
                placeholder="Comprehensive description of condition, engine, hydraulics..."
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              ></textarea>
            </div>
          </div>

          {/* Card: Technical Specifications */}
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">{t('techSpecs')}</h2>
            <p className="text-xs text-gray-500">{t('specsTip')}</p>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                {t('specsAr')}
              </label>
              <textarea
                name="specs_ar"
                rows={3}
                value={formData.specs_ar}
                onChange={handleChange}
                dir="rtl"
                placeholder="سعة الباكت: 4.2 متر مكعب | قوة المحرك: 262 حصان | ساعات العمل: 4,800 ساعة"
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                {t('specsEn')}
              </label>
              <textarea
                name="specs_en"
                rows={3}
                value={formData.specs_en}
                onChange={handleChange}
                placeholder="Bucket: 4.2 m³ | Power: 262 HP | Operating Weight: 23.7 t | Hours: 4,800 hrs"
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Right Column (Images & Status) */}
        <div className="space-y-6">
          {/* Status & Options */}
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">{t('statusVisibility')}</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                {t('availabilityStatus')}
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              >
                <option value="available">{t('available')}</option>
                <option value="reserved">{t('reserved')}</option>
                <option value="sold">{t('sold')}</option>
                <option value="maintenance">{t('maintenance')}</option>
              </select>
            </div>

            <div className="pt-2 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-[#F5C400] focus:ring-[#F5C400] bg-[#0D0D0D] border-gray-700"
                />
                <span className="text-sm text-gray-300">{t('featureOnHome')}</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-[#F5C400] focus:ring-[#F5C400] bg-[#0D0D0D] border-gray-700"
                />
                <span className="text-sm text-gray-300">{t('published')}</span>
              </label>
            </div>
          </div>

          {/* Image Uploader */}
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">{t('photosTitle')}</h2>
            <p className="text-xs text-gray-400">{t('photosTip')}</p>
            <ImageUploader
              images={formData.images || []}
              onChange={(urls: string[]) => setFormData((prev) => ({ ...prev, images: urls }))}
              type="equipment"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
