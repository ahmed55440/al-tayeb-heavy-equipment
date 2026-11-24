'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BannerForm from '@/components/admin/BannerForm';

export default function EditBannerPage() {
  const params = useParams();
  const id = params?.id as string;
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBanner() {
      try {
        const res = await fetch(`/api/banners/${id}`);
        const data = await res.json();
        if (data.success && data.banner) {
          const b = data.banner;
          setInitialData({
            id: b.id,
            title_ar: b.title_ar || '',
            title_en: b.title_en || '',
            description_ar: b.description_ar || '',
            description_en: b.description_en || '',
            image_desktop: b.image_desktop || '',
            image_mobile: b.image_mobile || '',
            sort_order: b.sort_order ?? 0,
            is_active: Boolean(b.is_active),
          });
        } else {
          setError(data.error || 'Banner not found');
        }
      } catch {
        setError('Failed to fetch banner data');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadBanner();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#F5C400] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
        <h2 className="font-bold text-lg mb-1">Error</h2>
        <p className="text-sm">{error || 'Banner not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Edit Hero Slide: {initialData.title_ar || initialData.title_en}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Update slide images, title overlays, and display order.
        </p>
      </div>

      <BannerForm initialData={initialData} isEdit={true} />
    </div>
  );
}
