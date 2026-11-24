import getDb from '@/lib/db';

export async function getPublicLayoutData() {
  const db = getDb();

  const settingsRows = db.prepare('SELECT * FROM settings').all() as Array<{
    key: string;
    value_ar: string;
    value_en: string;
  }>;

  const settings: Record<string, { ar: string; en: string }> = {};
  for (const s of settingsRows) {
    settings[s.key] = { ar: s.value_ar || '', en: s.value_en || '' };
  }

  const socialLinks = db
    .prepare('SELECT * FROM social_links WHERE is_active = 1 ORDER BY sort_order ASC, id ASC')
    .all() as any[];

  const branches = db
    .prepare('SELECT * FROM branches WHERE is_active = 1 ORDER BY sort_order ASC, id ASC')
    .all() as any[];

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
