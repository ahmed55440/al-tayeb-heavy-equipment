'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import EquipmentForm from '@/components/admin/EquipmentForm';

export default function EditEquipmentPage() {
  const params = useParams();
  const id = params?.id as string;
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEquipment() {
      try {
        const res = await fetch(`/api/equipment/${id}`);
        const data = await res.json();
        if (data.success && data.equipment) {
          const eq = data.equipment;
          const imageList = eq.images ? eq.images.map((img: any) => img.image_path) : [];

          setInitialData({
            id: eq.id,
            category_id: eq.category_id,
            name_ar: eq.name_ar,
            name_en: eq.name_en,
            slug: eq.slug,
            brand: eq.brand || '',
            model: eq.model || '',
            year: eq.year || '',
            price: eq.price || '',
            price_type: eq.price_type || 'fixed',
            description_ar: eq.description_ar || '',
            description_en: eq.description_en || '',
            specs_ar: eq.specs_ar || '',
            specs_en: eq.specs_en || '',
            status: eq.status || 'available',
            is_featured: Boolean(eq.is_featured),
            is_published: Boolean(eq.is_published),
            images: imageList,
          });
        } else {
          setError(data.error || 'Equipment not found');
        }
      } catch {
        setError('Failed to fetch equipment data');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadEquipment();
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
        <p className="text-sm">{error || 'Equipment not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Edit Equipment: {initialData.name_ar || initialData.name_en}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Update machinery details, pricing, status, and photos.
        </p>
      </div>

      <EquipmentForm initialData={initialData} isEdit={true} />
    </div>
  );
}
