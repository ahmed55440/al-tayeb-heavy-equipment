import type { Metadata } from 'next';
import './globals.css';
import { LocaleProvider } from '@/components/ui/LocaleProvider';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

export const metadata: Metadata = {
  title: 'معرض الطيب للمعدات الثقيلة | Al Tayeb Heavy Equipment',
  description:
    'المعرض الرائد في تجارة واستيراد وتوريد كافة أنواع المعدات الثقيلة (لوادر، حفارات، بلدوزرات، أوناش، كلاركات) بأعلى معايير الجودة والكفاءة.',
  keywords: [
    'معدات ثقيلة',
    'لوادر',
    'حفارات',
    'بلدوزرات',
    'أوناش',
    'كلاركات',
    'معرض الطيب',
    'Heavy Equipment',
    'Wheel Loaders',
    'Excavators',
    'Bulldozers',
    'Cranes',
    'Caterpillar',
    'Komatsu',
  ],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'معرض الطيب للمعدات الثقيلة | Al Tayeb Heavy Equipment',
    description:
      'أقوى تشكيلة من المعدات الثقيلة المستوردة بحالة الوكالة وبأسعار منافسة.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="h-full dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('al_tayeb_theme') || 'dark';
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'light') {
                    document.documentElement.style.backgroundColor = '#FFFFFF';
                    document.documentElement.style.color = '#111111';
                  } else {
                    document.documentElement.style.backgroundColor = '#080808';
                    document.documentElement.style.color = '#FFFFFF';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col transition-colors duration-200">
        <ThemeProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
