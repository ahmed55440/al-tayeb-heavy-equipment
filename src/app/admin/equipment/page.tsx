'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Truck,
  Star,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Toast from '@/components/admin/Toast';

interface EquipmentItem {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  brand: string;
  model: string;
  year: string;
  price: string;
  price_type: string;
  status: string;
  is_featured: number;
  is_published: number;
  category_name_ar: string;
  category_name_en: string;
  primary_image: string;
}

export default function AdminEquipmentListPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/equipment?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEquipment(data.equipment || []);
      }
    } catch {
      setToast({ message: 'Failed to load equipment', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEquipment();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/equipment/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setToast({ message: 'Equipment deleted successfully', type: 'success' });
        setEquipment((prev) => prev.filter((item) => item.id !== deleteId));
      } else {
        setToast({ message: data.error || 'Failed to delete', type: 'error' });
      }
    } catch {
      setToast({ message: 'Failed to delete equipment', type: 'error' });
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
            Equipment Inventory
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your showroom machinery, prices, specifications, and images.
          </p>
        </div>
        <Link
          href="/admin/equipment/new"
          className="inline-flex items-center gap-2 bg-[#F5C400] hover:bg-[#FFD429] text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#F5C400]/10 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Equipment</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#151515] border border-[#262626] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, brand, model..."
            className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C400]"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5C400] w-full sm:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-[#151515] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#1A1A1A] text-xs uppercase tracking-wider text-gray-400 border-b border-[#262626]">
              <tr>
                <th className="py-4 px-4 font-semibold">Image</th>
                <th className="py-4 px-4 font-semibold">Equipment Name</th>
                <th className="py-4 px-4 font-semibold">Brand & Model</th>
                <th className="py-4 px-4 font-semibold">Category</th>
                <th className="py-4 px-4 font-semibold">Price</th>
                <th className="py-4 px-4 font-semibold">Status</th>
                <th className="py-4 px-4 font-semibold text-center">Featured</th>
                <th className="py-4 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <div className="w-8 h-8 border-3 border-[#F5C400] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading equipment catalog...
                  </td>
                </tr>
              ) : equipment.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <Truck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    No equipment found matching criteria.
                  </td>
                </tr>
              ) : (
                equipment.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1C1C1C] transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-14 h-12 rounded-lg bg-[#222] overflow-hidden relative border border-[#333]">
                        {item.primary_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.primary_image}
                            alt={item.name_en || item.name_ar}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            <Truck className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">
                        {item.name_ar}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.name_en}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-200">{item.brand}</span>{' '}
                      <span className="text-gray-400">{item.model}</span>
                      {item.year && <span className="text-xs text-gray-500 block">Year: {item.year}</span>}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">
                      {item.category_name_ar || item.category_name_en || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-white">
                      {item.price_type === 'contact' || !item.price ? (
                        <span className="text-xs text-[#F5C400] bg-[#F5C400]/10 px-2 py-0.5 rounded">
                          Contact for Price
                        </span>
                      ) : (
                        <span>{Number(item.price).toLocaleString()} EGP</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          item.status === 'available'
                            ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                            : item.status === 'sold'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.is_featured ? (
                        <Star className="w-4 h-4 text-[#F5C400] fill-[#F5C400] mx-auto" />
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/equipment/${item.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#252525] rounded-lg transition-colors"
                          title="View on site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/equipment/${item.id}`}
                          className="p-1.5 text-gray-400 hover:text-[#F5C400] hover:bg-[#252525] rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(item.id)}
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
        title="Delete Equipment"
        message="Are you sure you want to permanently delete this equipment record and all associated images?"
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
