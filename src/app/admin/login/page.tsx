'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, AlertCircle, ArrowLeft, ArrowRight, Languages } from 'lucide-react';
import { useAdminLocale } from '@/lib/admin-i18n';

export default function AdminLoginPage() {
  const router = useRouter();
  const { t, locale, toggleLocale, isRtl } = useAdminLocale();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setError(data.error || t('invalidCredentials'));
      }
    } catch {
      setError(t('connectionError'));
    } finally {
      setLoading(false);
    }
  };

  const SubmitArrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 relative" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Language Switcher in top corner */}
      <div className={`absolute top-6 ${isRtl ? 'left-6' : 'right-6'} z-20`}>
        <button
          onClick={toggleLocale}
          type="button"
          className="inline-flex items-center gap-2 bg-[#151515] hover:bg-[#202020] text-gray-300 hover:text-white border border-[#2a2a2a] px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-md"
        >
          <Languages className="w-4 h-4 text-[#F5C400]" />
          <span>{locale === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
        </button>
      </div>

      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F5C400]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-[#151515] border border-[#262626] rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-[#F5C400] to-[#FFD429] rounded-2xl flex items-center justify-center shadow-lg shadow-[#F5C400]/20 mb-4">
            <Shield className="w-7 h-7 text-black stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {t('loginTitle')}
          </h1>
          <p className="text-sm text-[#F5C400] font-medium mt-0.5">Al Tayeb Heavy Equipment</p>
          <p className="text-xs text-gray-400 mt-2">{t('loginSubtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              {t('loginUsername')}
            </label>
            <div className="relative">
              <User className={`w-5 h-5 text-gray-500 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2`} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="admin"
                dir="ltr"
                className={`w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5C400] focus:ring-1 focus:ring-[#F5C400] transition-colors text-sm`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              {t('loginPassword')}
            </label>
            <div className="relative">
              <Lock className={`w-5 h-5 text-gray-500 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2`} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                dir="ltr"
                className={`w-full bg-[#0D0D0D] border border-[#2a2a2a] rounded-xl ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5C400] focus:ring-1 focus:ring-[#F5C400] transition-colors text-sm`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#F5C400] hover:bg-[#FFD429] text-black font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-[#F5C400]/20 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{t('loginBtn')}</span>
                <SubmitArrow className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#222] text-center">
          <p className="text-xs text-gray-500">
            {t('defaultCreds')} <span className="text-gray-400 font-mono">admin</span> / <span className="text-gray-400 font-mono">admin123456</span>
          </p>
        </div>
      </div>
    </div>
  );
}
