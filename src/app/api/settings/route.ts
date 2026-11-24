import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM settings').all() as Array<{
      key: string;
      value_ar: string;
      value_en: string;
      type: string;
    }>;

    const settings: Record<string, { ar: string; en: string; type: string }> = {};
    for (const row of rows) {
      settings[row.key] = {
        ar: row.value_ar || '',
        en: row.value_en || '',
        type: row.type || 'text',
      };
    }

    return NextResponse.json({ success: true, settings, rows });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { key, value_ar, value_en, type } = await request.json();
    if (!key) {
      return NextResponse.json({ success: false, error: 'Setting key is required' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(`
      INSERT INTO settings (key, value_ar, value_en, type, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value_ar = excluded.value_ar,
        value_en = excluded.value_en,
        type = COALESCE(excluded.type, settings.type),
        updated_at = datetime('now')
    `).run(key, value_ar ?? '', value_en ?? '', type ?? 'text');

    const updated = db.prepare('SELECT * FROM settings WHERE key = ?').get(key);
    return NextResponse.json({ success: true, setting: updated });
  } catch (error) {
    console.error('Update setting error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update setting' }, { status: 500 });
  }
}
