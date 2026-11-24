'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CategoryForm from '@/components/admin/CategoryForm';

export default function EditCategoryPage() {
  const params = useParams();
  const id = params?.id as string;
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCategory() {
      try {
        const res = await fetch(`/api/categories/${id}`);
        const data = await res.json();
        if (data.success && data.category) {
          const c = data.category;
          setInitialData({
            id: c.id,
            name_ar: c.name_ar,
            name_en: c.name_en,
            slug: c.slug,
            description_ar: c.description_ar || '',
            description_en: c.description_en || '',
            image: c.image || '',
            sort_order: c.sort_order ?? 0,
            is_active: Boolean(c.is_active),
          });
        } else {
          setError(data.error || 'Category not found');
        }
      } catch {
        setError('Failed to fetch category data');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadCategory();
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
        <p className="text-sm">{error || 'Category not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Edit Category: {initialData.name_ar || initialData.name_en}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Update category titles, descriptions, and cover image.
        </p>
      </div>

      <CategoryForm initialData={initialData} isEdit={true} />
    </div>
  );
}
