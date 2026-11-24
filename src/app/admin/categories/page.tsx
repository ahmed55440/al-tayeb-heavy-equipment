'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, FolderTree, ExternalLink } from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Toast from '@/components/admin/Toast';

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
      setToast({ message: 'Failed to load categories', type: 'error' });
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
        setToast({ message: 'Category deleted successfully', type: 'success' });
        setCategories((prev) => prev.filter((c) => c.id !== deleteId));
      } else {
        setToast({ message: data.error || 'Failed to delete category', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error deleting category', type: 'error' });
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
            Equipment Categories
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Organize heavy equipment into dynamic categories with images and descriptions.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 bg-[#F5C400] hover:bg-[#FFD429] text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#F5C400]/10 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </Link>
      </div>

      {/* Categories Table */}
      <div className="bg-[#151515] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#1A1A1A] text-xs uppercase tracking-wider text-gray-400 border-b border-[#262626]">
              <tr>
                <th className="py-4 px-4 font-semibold">Image</th>
                <th className="py-4 px-4 font-semibold">Name (Arabic)</th>
                <th className="py-4 px-4 font-semibold">Name (English)</th>
                <th className="py-4 px-4 font-semibold">Slug</th>
                <th className="py-4 px-4 font-semibold text-center">Sort Order</th>
                <th className="py-4 px-4 font-semibold">Status</th>
                <th className="py-4 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="w-8 h-8 border-3 border-[#F5C400] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <FolderTree className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    No categories found. Create your first category above.
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
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/category/${c.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#252525] rounded-lg transition-colors"
                          title="View on site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/categories/${c.id}`}
                          className="p-1.5 text-gray-400 hover:text-[#F5C400] hover:bg-[#252525] rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
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
        title="Delete Category"
        message="Are you sure you want to delete this category? Equipment in this category will become uncategorized."
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
