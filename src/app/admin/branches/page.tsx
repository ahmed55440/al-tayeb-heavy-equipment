'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, MapPin, ExternalLink, Phone, Save, X } from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Toast from '@/components/admin/Toast';

interface BranchItem {
  id: number;
  name_ar: string;
  name_en: string;
  address_ar: string;
  address_en: string;
  maps_link: string;
  phone: string;
  sort_order: number;
  is_active: number;
}

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    address_ar: '',
    address_en: '',
    maps_link: '',
    phone: '',
    sort_order: 0,
    is_active: true,
  });

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/branches?all=true');
      const data = await res.json();
      if (data.success) {
        setBranches(data.branches || []);
      }
    } catch {
      setToast({ message: 'Failed to load branches', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const openCreateModal = () => {
    setEditingBranch(null);
    setFormData({
      name_ar: '',
      name_en: '',
      address_ar: '',
      address_en: '',
      maps_link: '',
      phone: '',
      sort_order: branches.length + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (branch: BranchItem) => {
    setEditingBranch(branch);
    setFormData({
      name_ar: branch.name_ar,
      name_en: branch.name_en,
      address_ar: branch.address_ar || '',
      address_en: branch.address_en || '',
      maps_link: branch.maps_link || '',
      phone: branch.phone || '',
      sort_order: branch.sort_order ?? 0,
      is_active: Boolean(branch.is_active),
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_ar && !formData.name_en) {
      setToast({ message: 'Branch name is required', type: 'error' });
      return;
    }

    try {
      const url = editingBranch ? `/api/branches/${editingBranch.id}` : '/api/branches';
      const method = editingBranch ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setToast({
          message: editingBranch ? 'Branch updated successfully!' : 'Branch created successfully!',
          type: 'success',
        });
        setModalOpen(false);
        fetchBranches();
      } else {
        setToast({ message: data.error || 'Failed to save branch', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error saving branch', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/branches/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setToast({ message: 'Branch deleted successfully', type: 'success' });
        setBranches((prev) => prev.filter((b) => b.id !== deleteId));
      } else {
        setToast({ message: data.error || 'Failed to delete branch', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error deleting branch', type: 'error' });
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
            Showroom Branches & Locations
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your showroom branches, Google Maps directions, and phone numbers.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-[#F5C400] hover:bg-[#FFD429] text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#F5C400]/10 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Showroom Branch</span>
        </button>
      </div>

      {/* Branches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            <div className="w-8 h-8 border-3 border-[#F5C400] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading branches...
          </div>
        ) : branches.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-[#151515] border border-[#262626] rounded-2xl p-8">
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No branches configured. Add your first showroom location above.
          </div>
        ) : (
          branches.map((b) => (
            <div
              key={b.id}
              className="bg-[#151515] border border-[#262626] rounded-2xl p-6 flex flex-col justify-between hover:border-[#383838] transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F5C400]/10 border border-[#F5C400]/20 flex items-center justify-center text-[#F5C400] flex-shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        {b.name_ar}
                      </h3>
                      <p className="text-xs text-[#F5C400]">{b.name_en}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      b.is_active
                        ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                        : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
                    }`}
                  >
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-xs text-gray-400">
                  {b.address_ar && (
                    <p className="line-clamp-2">
                      <strong className="text-gray-300">العنوان:</strong> {b.address_ar}
                    </p>
                  )}
                  {b.address_en && (
                    <p className="line-clamp-2">
                      <strong className="text-gray-300">Address:</strong> {b.address_en}
                    </p>
                  )}
                  {b.phone && (
                    <p className="flex items-center gap-2 text-gray-300">
                      <Phone className="w-3.5 h-3.5 text-[#F5C400]" />
                      <span>{b.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 mt-5 border-t border-[#222]">
                {b.maps_link ? (
                  <a
                    href={b.maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#F5C400] hover:underline"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-1.5 text-gray-400 hover:text-[#F5C400] hover:bg-[#222] rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(b.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#2a2a2a] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#222] mb-5">
              <h2 className="text-lg font-bold text-white">
                {editingBranch ? 'Edit Branch Location' : 'Add New Branch'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Branch Name (Arabic) *
                </label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  dir="rtl"
                  placeholder="مثال: المعرض الرئيسي — طريق السويس الصحراوي"
                  required
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Branch Name (English)
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="e.g. Main Showroom — Cairo-Suez Highway"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Address (Arabic)
                </label>
                <textarea
                  rows={2}
                  value={formData.address_ar}
                  onChange={(e) => setFormData({ ...formData, address_ar: e.target.value })}
                  dir="rtl"
                  placeholder="العنوان التفصيلي باللغة العربية..."
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Address (English)
                </label>
                <textarea
                  rows={2}
                  value={formData.address_en}
                  onChange={(e) => setFormData({ ...formData, address_en: e.target.value })}
                  placeholder="Detailed address in English..."
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+20 100 000 0000"
                    className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                    className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  value={formData.maps_link}
                  onChange={(e) => setFormData({ ...formData, maps_link: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-[#F5C400] focus:ring-[#F5C400] bg-[#0D0D0D] border-gray-700"
                />
                <span className="text-sm text-gray-300">Active (Visible on website)</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#F5C400] hover:bg-[#FFD429] text-black font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#F5C400]/20"
                >
                  {editingBranch ? 'Save Changes' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Branch"
        message="Are you sure you want to remove this showroom branch?"
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
