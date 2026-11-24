import { query } from '@/lib/db';
import ContactSection from '@/components/contact/ContactSection';
import type { Metadata } from 'next';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'اتصل بنا ومواقع المعارض | معرض الطيب للمعدات الثقيلة',
  description: 'تواصل مع معرض الطيب للمعدات الثقيلة، تعرف على فروعنا في طريق السويس والإسكندرية، واحصل على استشارة هندسية فورية.',
};

export default async function ContactPage() {
  const branches = await query(
    'SELECT * FROM branches WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
  );

  const socialLinks = await query(
    'SELECT * FROM social_links WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
  );

  const settingsRows = await query<{
    key: string;
    value_ar: string;
  }>('SELECT * FROM settings');
  const settings: Record<string, string> = {};
  for (const s of settingsRows) {
    settings[s.key] = s.value_ar || '';
  }

  return (
    <div className="py-8 bg-[#080808]">
      <ContactSection
        branches={branches}
        socialLinks={socialLinks}
        phone={settings['phone_number']}
        whatsapp={settings['whatsapp_number']}
      />
    </div>
  );
}
