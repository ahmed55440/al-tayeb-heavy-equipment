import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { settings } = await request.json();
    if (!Array.isArray(settings)) {
      return NextResponse.json({ success: false, error: 'Settings array required' }, { status: 400 });
    }

    const db = getDb();
    const updateStmt = db.prepare(`
      INSERT INTO settings (key, value_ar, value_en, type, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value_ar = excluded.value_ar,
        value_en = excluded.value_en,
        type = COALESCE(excluded.type, settings.type),
        updated_at = datetime('now')
    `);

    const updateMany = db.transaction((items) => {
      for (const item of items) {
        updateStmt.run(
          item.key,
          item.value_ar ?? '',
          item.value_en ?? '',
          item.type ?? 'text'
        );
      }
    });

    updateMany(settings);

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Bulk update settings error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
