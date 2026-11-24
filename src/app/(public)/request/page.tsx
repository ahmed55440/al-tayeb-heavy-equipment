import RequestForm from '@/components/contact/RequestForm';
import { query } from '@/lib/db';
import type { Metadata } from 'next';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'طلب معدة غير موجودة | معرض الطيب للمعدات الثقيلة',
  description: 'أخبرنا بالمعدة الثقيلة التي تبحث عنها وسنتواصل معك فور توفرها أو نقوم باستيرادها خصيصاً لمشروعك.',
};

export default async function RequestPage() {
  const settingsRows = await query<{
    key: string;
    value_ar: string;
    value_en: string;
  }>('SELECT * FROM settings WHERE key LIKE "request_%"');

  const settings: Record<string, string> = {};
  for (const s of settingsRows) {
    settings[s.key] = s.value_ar || '';
  }

  return (
    <div className="py-12 md:py-20 bg-[#080808]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <RequestForm
          titleAr={settings['request_title_ar']}
          subtitleAr={settings['request_subtitle_ar']}
        />
      </div>
    </div>
  );
}
