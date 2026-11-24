'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import Toast from '@/components/admin/Toast';

interface BannerData {
  id?: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  image_desktop: string;
  image_mobile: string;
  sort_order: number;
  is_active: boolean;
}

interface BannerFormProps {
  initialData?: BannerData;
  isEdit?: boolean;
}

export default function BannerForm({ initialData, isEdit }: BannerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<BannerData>({
    title_ar: initialData?.title_ar || '',
    title_en: initialData?.title_en || '',
    description_ar: initialData?.description_ar || '',
    description_en: initialData?.description_en || '',
    image_desktop: initialData?.image_desktop || '',
    image_mobile: initialData?.image_mobile || '',
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
    if (!formData.image_desktop) {
      setToast({ message: 'Desktop image is required', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const url = isEdit && initialData?.id ? `/api/banners/${initialData.id}` : '/api/banners';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setToast({
          message: isEdit ? 'Banner updated successfully!' : 'Banner created successfully!',
          type: 'success',
        });
        setTimeout(() => {
          router.push('/admin/banners');
        }, 1000);
      } else {
        setToast({ message: data.error || 'Failed to save banner', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error submitting banner', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hero Banners</span>
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
          <span>{isEdit ? 'Save Changes' : 'Create Slide'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">Headline & Subtitle</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Headline Title (Arabic)
              </label>
              <input
                type="text"
                name="title_ar"
                value={formData.title_ar}
                onChange={handleChange}
                dir="rtl"
                placeholder="معرض الطيب للمعدات الثقيلة"
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Headline Title (English)
              </label>
              <input
                type="text"
                name="title_en"
                value={formData.title_en}
                onChange={handleChange}
                placeholder="Al Tayeb Heavy Equipment"
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Description / Subtitle (Arabic)
              </label>
              <textarea
                name="description_ar"
                rows={3}
                value={formData.description_ar}
                onChange={handleChange}
                dir="rtl"
                placeholder="نوفر لك المعدات التي تحتاجها بأفضل الاختيارات..."
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Description / Subtitle (English)
              </label>
              <textarea
                name="description_en"
                rows={3}
                value={formData.description_en}
                onChange={handleChange}
                placeholder="Discover quality heavy machinery for your business..."
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">Slide Settings</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Slide Order (Sequence)
              </label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleChange}
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded text-[#F5C400] focus:ring-[#F5C400] bg-[#0D0D0D] border-gray-700"
              />
              <span className="text-sm text-gray-300">Active (Visible in hero carousel)</span>
            </label>
          </div>

          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">Desktop Banner Image *</h2>
            <ImageUploader
              images={formData.image_desktop ? [formData.image_desktop] : []}
              onChange={(urls) => setFormData((prev) => ({ ...prev, image_desktop: urls[0] || '' }))}
              type="banners"
              single={true}
              maxImages={1}
            />
          </div>

          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">Mobile Banner Image (Optional)</h2>
            <ImageUploader
              images={formData.image_mobile ? [formData.image_mobile] : []}
              onChange={(urls) => setFormData((prev) => ({ ...prev, image_mobile: urls[0] || '' }))}
              type="banners"
              single={true}
              maxImages={1}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
