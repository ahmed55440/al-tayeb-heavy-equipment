'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Share2, ExternalLink, X } from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Toast from '@/components/admin/Toast';

interface SocialItem {
  id: number;
  platform: string;
  url: string;
  icon: string;
  sort_order: number;
  is_active: number;
}

export default function AdminSocialPage() {
  const [links, setLinks] = useState<SocialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    platform: 'Facebook',
    url: '',
    icon: 'facebook',
    sort_order: 0,
    is_active: true,
  });

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/social-links?all=true');
      const data = await res.json();
      if (data.success) {
        setLinks(data.links || []);
      }
    } catch {
      setToast({ message: 'Failed to load social links', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const openCreateModal = () => {
    setEditingLink(null);
    setFormData({
      platform: 'Facebook',
      url: '',
      icon: 'facebook',
      sort_order: links.length + 1,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (link: SocialItem) => {
    setEditingLink(link);
    setFormData({
      platform: link.platform,
      url: link.url,
      icon: link.icon || link.platform.toLowerCase(),
      sort_order: link.sort_order ?? 0,
      is_active: Boolean(link.is_active),
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) {
      setToast({ message: 'URL is required', type: 'error' });
      return;
    }

    try {
      const url = editingLink ? `/api/social-links/${editingLink.id}` : '/api/social-links';
      const method = editingLink ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setToast({
          message: editingLink ? 'Social link updated!' : 'Social link added!',
          type: 'success',
        });
        setModalOpen(false);
        fetchLinks();
      } else {
        setToast({ message: data.error || 'Failed to save', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error saving social link', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/social-links/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setToast({ message: 'Social link removed', type: 'success' });
        setLinks((prev) => prev.filter((l) => l.id !== deleteId));
      } else {
        setToast({ message: data.error || 'Failed to delete', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error deleting', type: 'error' });
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
            Social Media & External Links
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Connect your showroom channels (Facebook, Instagram, TikTok, YouTube, etc.).
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-[#F5C400] hover:bg-[#FFD429] text-black font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#F5C400]/10 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Social Link</span>
        </button>
      </div>

      {/* Social Links List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            <div className="w-8 h-8 border-3 border-[#F5C400] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading social links...
          </div>
        ) : links.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-[#151515] border border-[#262626] rounded-2xl p-8">
            <Share2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No social media accounts linked yet. Add one above.
          </div>
        ) : (
          links.map((link) => (
            <div
              key={link.id}
              className="bg-[#151515] border border-[#262626] rounded-2xl p-5 flex items-center justify-between hover:border-[#333] transition-all"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F5C400]/10 border border-[#F5C400]/20 flex items-center justify-center text-[#F5C400] font-bold text-sm flex-shrink-0">
                  {link.platform.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{link.platform}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        link.is_active
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-gray-500/15 text-gray-400'
                      }`}
                    >
                      {link.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-[#F5C400] flex items-center gap-1 truncate mt-0.5"
                  >
                    <span className="truncate">{link.url}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                <button
                  onClick={() => openEditModal(link)}
                  className="p-1.5 text-gray-400 hover:text-[#F5C400] hover:bg-[#222] rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(link.id)}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#2a2a2a] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#222] mb-5">
              <h2 className="text-lg font-bold text-white">
                {editingLink ? 'Edit Social Link' : 'Add Social Link'}
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
                  Platform Name
                </label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  placeholder="Facebook, Instagram, TikTok, YouTube, WhatsApp..."
                  required
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Target URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://facebook.com/altayeb"
                  required
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-[#F5C400] focus:ring-[#F5C400] bg-[#0D0D0D] border-gray-700"
                />
                <span className="text-sm text-gray-300">Active (Visible in header & footer)</span>
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
                  {editingLink ? 'Save Changes' : 'Add Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Social Link"
        message="Are you sure you want to remove this social media link?"
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
