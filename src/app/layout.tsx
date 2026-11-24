import type { Metadata } from 'next';
import './globals.css';
import { LocaleProvider } from '@/components/ui/LocaleProvider';

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
    <html lang="ar" dir="rtl" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="min-h-full flex flex-col bg-[#080808] text-white">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
