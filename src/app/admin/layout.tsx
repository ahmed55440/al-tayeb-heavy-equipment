'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { AdminLocaleProvider, useAdminLocale } from '@/lib/admin-i18n';

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('Admin');
  const { isRtl } = useAdminLocale();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if ((data.authenticated || data.success) && data.user) {
          setUsername(data.user.username);
          setLoading(false);
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#080808] text-white" dir={isRtl ? 'rtl' : 'ltr'}>
        {children}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#F5C400] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">
            {isRtl ? 'جاري التحقق من صلاحيات الدخول...' : 'Verifying admin credentials...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#080808] text-white" dir={isRtl ? 'rtl' : 'ltr'}>
      <Sidebar username={username} />
      <main className="flex-1 overflow-y-auto min-h-screen p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLocaleProvider>
      <AdminShell>{children}</AdminShell>
    </AdminLocaleProvider>
  );
}
