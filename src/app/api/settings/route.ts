import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const rows = await query<{
      key: string;
      value_ar: string;
      value_en: string;
      type: string;
    }>('SELECT * FROM settings');

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

    await execute(`
      INSERT INTO settings (key, value_ar, value_en, type, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value_ar = excluded.value_ar,
        value_en = excluded.value_en,
        type = COALESCE(excluded.type, settings.type),
        updated_at = datetime('now')
    `, [key, value_ar ?? '', value_en ?? '', type ?? 'text']);

    return NextResponse.json({ success: true, message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Update setting error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update setting' }, { status: 500 });
  }
}
