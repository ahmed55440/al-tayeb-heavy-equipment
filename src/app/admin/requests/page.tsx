'use client';

import { useEffect, useState } from 'react';
import {
  MessageSquare,
  Search,
  Phone,
  PhoneCall,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Toast from '@/components/admin/Toast';
import { getWhatsAppUrl, getPhoneUrl } from '@/lib/utils';

interface EquipmentRequestItem {
  id: number;
  ref_number: string;
  customer_name: string;
  phone: string;
  equipment_name: string;
  brand: string;
  model: string;
  specs: string;
  notes: string;
  status: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<EquipmentRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [id: number]: string }>({});

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/requests?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch {
      setToast({ message: 'Failed to fetch customer requests', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        setToast({ message: 'Request status updated', type: 'success' });
      }
    } catch {
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const handleSaveNotes = async (id: number) => {
    const notes = editingNotes[id];
    if (notes === undefined) return;

    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notes }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, admin_notes: notes } : r))
        );
        setToast({ message: 'Internal notes saved', type: 'success' });
      }
    } catch {
      setToast({ message: 'Failed to save notes', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/requests/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setToast({ message: 'Request deleted successfully', type: 'success' });
        setRequests((prev) => prev.filter((r) => r.id !== deleteId));
      }
    } catch {
      setToast({ message: 'Failed to delete request', type: 'error' });
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Customer Equipment Requests
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Inquiries from customers looking for specific heavy machinery not currently in stock.
        </p>
      </div>

      {/* Filters and search */}
      <div className="bg-[#151515] border border-[#262626] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, phone, ref, equipment..."
            className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C400]"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'new', 'under_review', 'available', 'contacted', 'completed', 'cancelled'].map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-xl capitalize font-medium whitespace-nowrap transition-colors ${
                  statusFilter === s
                    ? 'bg-[#F5C400] text-black font-semibold'
                    : 'bg-[#0D0D0D] text-gray-400 hover:text-white border border-[#222]'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            )
          )}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-gray-500">
            <div className="w-8 h-8 border-3 border-[#F5C400] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading customer requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-[#151515] border border-[#262626] rounded-2xl p-8">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No equipment requests found for this filter.
          </div>
        ) : (
          requests.map((r) => {
            const isExpanded = expandedId === r.id;
            const whatsappMsg = `مرحباً أ/ ${r.customer_name}، بخصوص طلبك رقم (${r.ref_number}) للاستفسار عن معدة ${r.equipment_name || ''} موديل ${r.model || ''}. يسعدنا إفادتك من معرض الطيب للمعدات الثقيلة.`;
            const waUrl = getWhatsAppUrl(r.phone, whatsappMsg);
            const callUrl = getPhoneUrl(r.phone);

            return (
              <div
                key={r.id}
                className="bg-[#151515] border border-[#262626] rounded-2xl overflow-hidden hover:border-[#333] transition-all"
              >
                {/* Header row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F5C400]/10 border border-[#F5C400]/20 flex items-center justify-center text-[#F5C400] font-bold text-xs flex-shrink-0 mt-0.5">
                      REQ
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-[#F5C400] bg-[#F5C400]/10 px-2 py-0.5 rounded">
                          {r.ref_number}
                        </span>
                        <h3 className="font-bold text-white text-base">
                          {r.customer_name}
                        </h3>
                        <span className="text-xs text-gray-400 font-mono">
                          {r.phone}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                        <span>Equipment: <strong className="text-white">{r.equipment_name || 'Not specified'}</strong></span>
                        {r.brand && <span>• Brand: <strong className="text-gray-300">{r.brand}</strong></span>}
                        {r.model && <span>• Model: <strong className="text-gray-300">{r.model}</strong></span>}
                        <span>• Date: {new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <select
                      value={r.status}
                      onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border focus:outline-none ${
                        r.status === 'new'
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          : r.status === 'under_review'
                          ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                          : r.status === 'available'
                          ? 'bg-green-500/15 text-green-400 border-green-500/30'
                          : r.status === 'contacted'
                          ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                          : r.status === 'completed'
                          ? 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                      }`}
                    >
                      <option value="new">New (جديد)</option>
                      <option value="under_review">Under Review (قيد المراجعة)</option>
                      <option value="available">Available (متوفر الآن)</option>
                      <option value="contacted">Contacted (تم التواصل)</option>
                      <option value="completed">Completed (مكتمل)</option>
                      <option value="cancelled">Cancelled (ملغي)</option>
                    </select>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                      title="Open WhatsApp chat with customer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>

                    <a
                      href={callUrl}
                      className="inline-flex items-center gap-1.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                      title="Call customer directly"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Call</span>
                    </a>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      className="p-1.5 text-gray-400 hover:text-white bg-[#222] rounded-xl transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand Details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => setDeleteId(r.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="bg-[#0D0D0D] p-5 border-t border-[#222] grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-300">
                    <div className="space-y-3">
                      <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                        Customer Specifications & Notes
                      </h4>
                      {r.specs && (
                        <div className="p-3 bg-[#151515] rounded-xl border border-[#222]">
                          <strong className="text-gray-400 block mb-1">Desired Specifications:</strong>
                          <p className="whitespace-pre-wrap">{r.specs}</p>
                        </div>
                      )}
                      {r.notes && (
                        <div className="p-3 bg-[#151515] rounded-xl border border-[#222]">
                          <strong className="text-gray-400 block mb-1">Customer Notes:</strong>
                          <p className="whitespace-pre-wrap">{r.notes}</p>
                        </div>
                      )}
                      {!r.specs && !r.notes && (
                        <p className="text-gray-500 italic">No extra notes provided by customer.</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                        Internal Staff / Admin Notes
                      </h4>
                      <textarea
                        rows={3}
                        defaultValue={r.admin_notes || ''}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({ ...prev, [r.id]: e.target.value }))
                        }
                        placeholder="Write internal notes about negotiations, sourcing progress, or quotes..."
                        className="w-full bg-[#151515] border border-[#262626] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#F5C400]"
                      ></textarea>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(r.id)}
                          className="bg-[#F5C400] text-black font-semibold px-4 py-1.5 rounded-lg text-xs hover:bg-[#FFD429] transition-colors"
                        >
                          Save Admin Notes
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Request"
        message="Are you sure you want to permanently delete this customer request?"
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
