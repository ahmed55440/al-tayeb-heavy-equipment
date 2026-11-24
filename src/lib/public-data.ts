import { query } from '@/lib/db';

export async function getPublicLayoutData() {
  const settingsRows = await query<{
    key: string;
    value_ar: string;
    value_en: string;
  }>('SELECT * FROM settings');

  const settings: Record<string, { ar: string; en: string }> = {};
  for (const s of settingsRows) {
    settings[s.key] = { ar: s.value_ar || '', en: s.value_en || '' };
  }

  const socialLinks = await query(
    'SELECT * FROM social_links WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
  );

  const branches = await query(
    'SELECT * FROM branches WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
  );

  return {
    siteNameAr: settings['site_name_ar']?.ar || 'معرض الطيب للمعدات الثقيلة',
    siteNameEn: settings['site_name_en']?.en || 'Al Tayeb Heavy Equipment',
    logoUrl: settings['logo']?.ar || '',
    phone: settings['phone_number']?.ar || '',
    whatsapp: settings['whatsapp_number']?.ar || '',
    whatsappMsgAr: settings['whatsapp_message_ar']?.ar || '',
    whatsappMsgEn: settings['whatsapp_message_en']?.en || '',
    footerTextAr: settings['footer_text_ar']?.ar || '',
    footerTextEn: settings['footer_text_en']?.en || '',
    socialLinks,
    branches,
  };
}
