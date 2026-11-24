'use client';

import { useEffect, useState } from 'react';
import {
  Save,
  Globe,
  Phone,
  Layout,
  FileText,
  Search,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import Toast from '@/components/admin/Toast';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'brand' | 'contact' | 'content' | 'intro' | 'seo'>('brand');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [settings, setSettings] = useState<{ [key: string]: { ar: string; en: string; type: string } }>({});

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings || {});
      }
    } catch {
      setToast({ message: 'Failed to fetch settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const getVal = (key: string, lang: 'ar' | 'en' = 'ar'): string => {
    return settings[key]?.[lang] || '';
  };

  const updateVal = (key: string, val: string, lang: 'ar' | 'en' = 'ar', type: string = 'text') => {
    setSettings((prev) => ({
      ...prev,
      [key]: {
        ar: lang === 'ar' ? val : prev[key]?.ar || '',
        en: lang === 'en' ? val : prev[key]?.en || '',
        type,
      },
    }));
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = Object.entries(settings).map(([key, val]) => ({
        key,
        value_ar: val.ar,
        value_en: val.en,
        type: val.type,
      }));

      const res = await fetch('/api/settings/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: payload }),
      });

      const data = await res.json();
      if (data.success) {
        setToast({ message: 'All website settings saved successfully!', type: 'success' });
      } else {
        setToast({ message: data.error || 'Failed to save settings', type: 'error' });
      }
    } catch {
      setToast({ message: 'Error saving settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#F5C400] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveAll} className="space-y-8 max-w-5xl">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#222] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Dynamic Website Settings
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage showroom identity, contact numbers, text headlines, intro animation, and SEO.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#F5C400] hover:bg-[#FFD429] text-black font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-[#F5C400]/20 disabled:opacity-50 w-fit"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save All Settings</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#222]">
        {[
          { id: 'brand', label: 'Brand Identity & Logos', icon: Globe },
          { id: 'contact', label: 'Contact & WhatsApp', icon: Phone },
          { id: 'content', label: 'Homepage Content', icon: Layout },
          { id: 'intro', label: 'Cinematic Intro', icon: Sparkles },
          { id: 'seo', label: 'SEO & Metadata', icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#F5C400] text-black shadow-md'
                  : 'bg-[#151515] text-gray-400 hover:text-white hover:bg-[#1E1E1E]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Brand Identity */}
      {activeTab === 'brand' && (
        <div className="space-y-6">
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">Showroom Name</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Showroom Name (Arabic) *
                </label>
                <input
                  type="text"
                  value={getVal('site_name_ar', 'ar')}
                  onChange={(e) => updateVal('site_name_ar', e.target.value, 'ar')}
                  dir="rtl"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Showroom Name (English) *
                </label>
                <input
                  type="text"
                  value={getVal('site_name_en', 'en')}
                  onChange={(e) => updateVal('site_name_en', e.target.value, 'en')}
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Tagline / Brief Description (Arabic)
                </label>
                <input
                  type="text"
                  value={getVal('site_description_ar', 'ar')}
                  onChange={(e) => updateVal('site_description_ar', e.target.value, 'ar')}
                  dir="rtl"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Tagline / Brief Description (English)
                </label>
                <input
                  type="text"
                  value={getVal('site_description_en', 'en')}
                  onChange={(e) => updateVal('site_description_en', e.target.value, 'en')}
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white mb-1">Main Logo</h2>
              <p className="text-xs text-gray-400">Used in header, footer, and intro.</p>
              <ImageUploader
                images={getVal('logo', 'ar') ? [getVal('logo', 'ar')] : []}
                onChange={(urls) => updateVal('logo', urls[0] || '', 'ar', 'image')}
                type="logos"
                single={true}
                maxImages={1}
              />
            </div>

            <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white mb-1">Alternative Logo</h2>
              <p className="text-xs text-gray-400">Optional white or monochrome variant.</p>
              <ImageUploader
                images={getVal('logo_alt', 'ar') ? [getVal('logo_alt', 'ar')] : []}
                onChange={(urls) => updateVal('logo_alt', urls[0] || '', 'ar', 'image')}
                type="logos"
                single={true}
                maxImages={1}
              />
            </div>

            <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white mb-1">Favicon</h2>
              <p className="text-xs text-gray-400">Browser tab icon (32x32 or 64x64).</p>
              <ImageUploader
                images={getVal('favicon', 'ar') ? [getVal('favicon', 'ar')] : []}
                onChange={(urls) => updateVal('favicon', urls[0] || '', 'ar', 'image')}
                type="logos"
                single={true}
                maxImages={1}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Contact Info & WhatsApp */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">Primary Phone & WhatsApp</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Direct Call Phone Number
                </label>
                <input
                  type="text"
                  value={getVal('phone_number', 'ar')}
                  onChange={(e) => updateVal('phone_number', e.target.value, 'ar')}
                  placeholder="+20 100 000 0000"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  WhatsApp Number (with country code e.g. +20...)
                </label>
                <input
                  type="text"
                  value={getVal('whatsapp_number', 'ar')}
                  onChange={(e) => updateVal('whatsapp_number', e.target.value, 'ar')}
                  placeholder="+201000000000"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">WhatsApp Prefilled Messages</h2>
            <p className="text-xs text-gray-500">
              Variables supported: <code className="text-[#F5C400] font-mono">{'{equipment}'}</code> and <code className="text-[#F5C400] font-mono">{'{model}'}</code>
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Message Template (Arabic)
              </label>
              <textarea
                rows={3}
                value={getVal('whatsapp_message_ar', 'ar')}
                onChange={(e) => updateVal('whatsapp_message_ar', e.target.value, 'ar')}
                dir="rtl"
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Message Template (English)
              </label>
              <textarea
                rows={3}
                value={getVal('whatsapp_message_en', 'en')}
                onChange={(e) => updateVal('whatsapp_message_en', e.target.value, 'en')}
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              ></textarea>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Content Headlines */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">Equipment Request Section</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Section Title (Arabic)
                </label>
                <input
                  type="text"
                  value={getVal('request_title_ar', 'ar')}
                  onChange={(e) => updateVal('request_title_ar', e.target.value, 'ar')}
                  dir="rtl"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Section Title (English)
                </label>
                <input
                  type="text"
                  value={getVal('request_title_en', 'en')}
                  onChange={(e) => updateVal('request_title_en', e.target.value, 'en')}
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Section Subtitle (Arabic)
                </label>
                <input
                  type="text"
                  value={getVal('request_subtitle_ar', 'ar')}
                  onChange={(e) => updateVal('request_subtitle_ar', e.target.value, 'ar')}
                  dir="rtl"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Section Subtitle (English)
                </label>
                <input
                  type="text"
                  value={getVal('request_subtitle_en', 'en')}
                  onChange={(e) => updateVal('request_subtitle_en', e.target.value, 'en')}
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">Section Titles (Categories & Featured)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Categories Heading (Arabic)
                </label>
                <input
                  type="text"
                  value={getVal('categories_title_ar', 'ar')}
                  onChange={(e) => updateVal('categories_title_ar', e.target.value, 'ar')}
                  dir="rtl"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Categories Heading (English)
                </label>
                <input
                  type="text"
                  value={getVal('categories_title_en', 'en')}
                  onChange={(e) => updateVal('categories_title_en', e.target.value, 'en')}
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Featured Equipment Heading (Arabic)
                </label>
                <input
                  type="text"
                  value={getVal('featured_title_ar', 'ar')}
                  onChange={(e) => updateVal('featured_title_ar', e.target.value, 'ar')}
                  dir="rtl"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Featured Equipment Heading (English)
                </label>
                <input
                  type="text"
                  value={getVal('featured_title_en', 'en')}
                  onChange={(e) => updateVal('featured_title_en', e.target.value, 'en')}
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">Footer Rights & Text</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Footer Copyright (Arabic)
                </label>
                <input
                  type="text"
                  value={getVal('footer_text_ar', 'ar')}
                  onChange={(e) => updateVal('footer_text_ar', e.target.value, 'ar')}
                  dir="rtl"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Footer Copyright (English)
                </label>
                <input
                  type="text"
                  value={getVal('footer_text_en', 'en')}
                  onChange={(e) => updateVal('footer_text_en', e.target.value, 'en')}
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cinematic Intro Animation */}
      {activeTab === 'intro' && (
        <div className="space-y-6">
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">Cinematic Wheel Loader Intro</h2>
            <p className="text-xs text-gray-400">
              When enabled, visitors entering for the first time will experience the full-screen cinematic wheel loader animation pushing sand and revealing the showroom name and logo.
            </p>

            <label className="flex items-center gap-3 cursor-pointer pt-3">
              <input
                type="checkbox"
                checked={getVal('intro_enabled', 'ar') === '1'}
                onChange={(e) => updateVal('intro_enabled', e.target.checked ? '1' : '0', 'ar')}
                className="w-5 h-5 rounded text-[#F5C400] focus:ring-[#F5C400] bg-[#0D0D0D] border-gray-700"
              />
              <span className="text-sm font-semibold text-white">
                Enable Cinematic Intro on first visit
              </span>
            </label>
          </div>

          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-1">Intro Animation Logo (Optional)</h2>
            <p className="text-xs text-gray-400">
              Specific logo revealed under the showroom name during the cinematic animation.
            </p>
            <ImageUploader
              images={getVal('intro_logo', 'ar') ? [getVal('intro_logo', 'ar')] : []}
              onChange={(urls) => updateVal('intro_logo', urls[0] || '', 'ar', 'image')}
              type="logos"
              single={true}
              maxImages={1}
            />
          </div>
        </div>
      )}

      {/* Tab 5: SEO & Metadata */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">Search Engine Optimization (SEO)</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Meta Title (Arabic)
              </label>
              <input
                type="text"
                value={getVal('meta_title_ar', 'ar')}
                onChange={(e) => updateVal('meta_title_ar', e.target.value, 'ar')}
                dir="rtl"
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Meta Title (English)
              </label>
              <input
                type="text"
                value={getVal('meta_title_en', 'en')}
                onChange={(e) => updateVal('meta_title_en', e.target.value, 'en')}
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Meta Description (Arabic)
              </label>
              <textarea
                rows={3}
                value={getVal('meta_description_ar', 'ar')}
                onChange={(e) => updateVal('meta_description_ar', e.target.value, 'ar')}
                dir="rtl"
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Meta Description (English)
              </label>
              <textarea
                rows={3}
                value={getVal('meta_description_en', 'en')}
                onChange={(e) => updateVal('meta_description_en', e.target.value, 'en')}
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              ></textarea>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
