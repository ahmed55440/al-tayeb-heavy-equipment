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
import { useAdminLocale } from '@/lib/admin-i18n';

export default function AdminSettingsPage() {
  const { t, isRtl } = useAdminLocale();
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
      setToast({ message: t('error'), type: 'error' });
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
        setToast({ message: t('settingsSavedSuccess'), type: 'success' });
      } else {
        setToast({ message: data.error || t('error'), type: 'error' });
      }
    } catch {
      setToast({ message: t('error'), type: 'error' });
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

  const tabs = [
    { id: 'brand', label: t('brandTab'), icon: Globe },
    { id: 'contact', label: t('contactTab'), icon: Phone },
    { id: 'content', label: t('contentTab'), icon: Layout },
    { id: 'intro', label: t('introTab'), icon: Sparkles },
    { id: 'seo', label: t('seoTab'), icon: Search },
  ];

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
            {t('settingsTitle')}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {t('settingsSubtitle')}
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
          <span>{saving ? t('saving') : t('saveAllSettings')}</span>
        </button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#222]">
        {tabs.map((tab) => {
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
            <h2 className="text-base font-bold text-white mb-2">{t('siteNameAr')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {t('siteNameAr')} *
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
                  {t('siteNameEn')} *
                </label>
                <input
                  type="text"
                  value={getVal('site_name_en', 'en')}
                  onChange={(e) => updateVal('site_name_en', e.target.value, 'en')}
                  dir="ltr"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {t('siteTaglineAr')}
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
                  {t('siteTaglineEn')}
                </label>
                <input
                  type="text"
                  value={getVal('site_description_en', 'en')}
                  onChange={(e) => updateVal('site_description_en', e.target.value, 'en')}
                  dir="ltr"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white mb-1">{t('lightLogo')}</h2>
              <p className="text-xs text-gray-400">{isRtl ? 'يستخدم في الهيدر والفوتر وشاشات الموقع.' : 'Used in header, footer, and intro.'}</p>
              <ImageUploader
                value={getVal('logo', 'ar')}
                onChange={(url) => updateVal('logo', url, 'ar', 'image')}
                label={t('lightLogo')}
              />
            </div>

            <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white mb-1">{t('darkLogo')}</h2>
              <p className="text-xs text-gray-400">{isRtl ? 'شعار إضافي مخصص للوضع الداكن أو الفاتح.' : 'Alternative dark or monochrome logo.'}</p>
              <ImageUploader
                value={getVal('logo_alt', 'ar')}
                onChange={(url) => updateVal('logo_alt', url, 'ar', 'image')}
                label={t('darkLogo')}
              />
            </div>

            <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white mb-1">{t('faviconImage')}</h2>
              <p className="text-xs text-gray-400">{isRtl ? 'أيقونة تبويب المتصفح (32x32 أو 64x64).' : 'Browser tab icon (32x32 or 64x64).'}</p>
              <ImageUploader
                value={getVal('favicon', 'ar')}
                onChange={(url) => updateVal('favicon', url, 'ar', 'image')}
                label={t('faviconImage')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Contact Info & WhatsApp */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">{t('contactTab')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {t('mainPhone')}
                </label>
                <input
                  type="text"
                  value={getVal('phone_number', 'ar')}
                  onChange={(e) => updateVal('phone_number', e.target.value, 'ar')}
                  dir="ltr"
                  placeholder="+20 100 000 0000"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {t('mainWhatsapp')}
                </label>
                <input
                  type="text"
                  value={getVal('whatsapp_number', 'ar')}
                  onChange={(e) => updateVal('whatsapp_number', e.target.value, 'ar')}
                  dir="ltr"
                  placeholder="+201000000000"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">{isRtl ? 'رسائل الواتساب الجاهزة عند الطلب' : 'WhatsApp Prefilled Messages'}</h2>
            <p className="text-xs text-gray-500">
              {isRtl ? 'المتغيرات المدعومة:' : 'Supported variables:'} <code className="text-[#F5C400] font-mono">{'{equipment}'}</code> {isRtl ? 'و' : 'and'} <code className="text-[#F5C400] font-mono">{'{model}'}</code>
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                {isRtl ? 'قالب الرسالة التلقائية (بالعربية)' : 'Message Template (Arabic)'}
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
                {isRtl ? 'قالب الرسالة التلقائية (بالإنجليزية)' : 'Message Template (English)'}
              </label>
              <textarea
                rows={3}
                value={getVal('whatsapp_message_en', 'en')}
                onChange={(e) => updateVal('whatsapp_message_en', e.target.value, 'en')}
                dir="ltr"
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
            <h2 className="text-base font-bold text-white mb-2">{isRtl ? 'قسم طلب معدة غير موجودة' : 'Equipment Request Section'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {isRtl ? 'عنوان القسم (بالعربية)' : 'Section Title (Arabic)'}
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
                  {isRtl ? 'عنوان القسم (بالإنجليزية)' : 'Section Title (English)'}
                </label>
                <input
                  type="text"
                  value={getVal('request_title_en', 'en')}
                  onChange={(e) => updateVal('request_title_en', e.target.value, 'en')}
                  dir="ltr"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {isRtl ? 'العنوان الفرعي للقسم (بالعربية)' : 'Section Subtitle (Arabic)'}
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
                  {isRtl ? 'العنوان الفرعي للقسم (بالإنجليزية)' : 'Section Subtitle (English)'}
                </label>
                <input
                  type="text"
                  value={getVal('request_subtitle_en', 'en')}
                  onChange={(e) => updateVal('request_subtitle_en', e.target.value, 'en')}
                  dir="ltr"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">{isRtl ? 'عناوين أقسام الرئيسية (الفئات والمعدات المميزة)' : 'Section Titles (Categories & Featured)'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {isRtl ? 'عنوان قسم الفئات (بالعربية)' : 'Categories Heading (Arabic)'}
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
                  {isRtl ? 'عنوان قسم الفئات (بالإنجليزية)' : 'Categories Heading (English)'}
                </label>
                <input
                  type="text"
                  value={getVal('categories_title_en', 'en')}
                  onChange={(e) => updateVal('categories_title_en', e.target.value, 'en')}
                  dir="ltr"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {isRtl ? 'عنوان المعدات المميزة (بالعربية)' : 'Featured Equipment Heading (Arabic)'}
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
                  {isRtl ? 'عنوان المعدات المميزة (بالإنجليزية)' : 'Featured Equipment Heading (English)'}
                </label>
                <input
                  type="text"
                  value={getVal('featured_title_en', 'en')}
                  onChange={(e) => updateVal('featured_title_en', e.target.value, 'en')}
                  dir="ltr"
                  className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">{isRtl ? 'حقوق الفوتر والنصوص' : 'Footer Rights & Text'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  {isRtl ? 'حقوق الحفظ في الفوتر (بالعربية)' : 'Footer Copyright (Arabic)'}
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
                  {isRtl ? 'حقوق الحفظ في الفوتر (بالإنجليزية)' : 'Footer Copyright (English)'}
                </label>
                <input
                  type="text"
                  value={getVal('footer_text_en', 'en')}
                  onChange={(e) => updateVal('footer_text_en', e.target.value, 'en')}
                  dir="ltr"
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
            <h2 className="text-base font-bold text-white mb-2">{t('introTab')}</h2>
            <p className="text-xs text-gray-400">
              {isRtl
                ? 'عند التفعيل، سيرى الزائر لأول مرة أنيميشن سينمائي عالي الجودة للودر أصفر يقوم بكنس الرمل وإظهار اسم المعرض والشعار.'
                : 'When enabled, visitors entering for the first time will experience the full-screen cinematic wheel loader animation pushing sand and revealing the showroom name and logo.'}
            </p>

            <label className="flex items-center gap-3 cursor-pointer pt-3">
              <input
                type="checkbox"
                checked={getVal('intro_enabled', 'ar') === '1'}
                onChange={(e) => updateVal('intro_enabled', e.target.checked ? '1' : '0', 'ar')}
                className="w-5 h-5 rounded text-[#F5C400] focus:ring-[#F5C400] bg-[#0D0D0D] border-gray-700"
              />
              <span className="text-sm font-semibold text-white">
                {t('cinematicIntroEnabled')}
              </span>
            </label>
          </div>

          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-1">{isRtl ? 'شعار شاشة المقدمة السينمائية (اختياري)' : 'Intro Animation Logo (Optional)'}</h2>
            <p className="text-xs text-gray-400">
              {isRtl ? 'شعار مخصص يظهر أسفل اسم المعرض بعد انقشاع الرمل والدخان.' : 'Specific logo revealed under the showroom name during the cinematic animation.'}
            </p>
            <ImageUploader
              value={getVal('intro_logo', 'ar')}
              onChange={(url) => updateVal('intro_logo', url, 'ar', 'image')}
              label={isRtl ? 'شعار شاشة المقدمة' : 'Intro Logo'}
            />
          </div>
        </div>
      )}

      {/* Tab 5: SEO & Metadata */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          <div className="bg-[#151515] border border-[#262626] rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-2">{t('seoTab')}</h2>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                {t('metaTitleAr')}
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
                {t('metaTitleEn')}
              </label>
              <input
                type="text"
                value={getVal('meta_title_en', 'en')}
                onChange={(e) => updateVal('meta_title_en', e.target.value, 'en')}
                dir="ltr"
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                {t('metaDescAr')}
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
                {t('metaDescEn')}
              </label>
              <textarea
                rows={3}
                value={getVal('meta_description_en', 'en')}
                onChange={(e) => updateVal('meta_description_en', e.target.value, 'en')}
                dir="ltr"
                className="w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5C400]"
              ></textarea>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
