import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');

    let query = 'SELECT * FROM banners';
    if (all !== 'true') {
      query += ' WHERE is_active = 1';
    }
    query += ' ORDER BY sort_order ASC, created_at DESC';

    const banners = db.prepare(query).all();
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    console.error('Banners list error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDb();
    const body = await request.json();

    const {
      title_ar = '',
      title_en = '',
      description_ar = '',
      description_en = '',
      image_desktop = '',
      image_mobile = '',
      sort_order = 0,
      is_active = 1,
    } = body;

    const result = db.prepare(`
      INSERT INTO banners (title_ar, title_en, description_ar, description_en, image_desktop, image_mobile, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title_ar, title_en, description_ar, description_en, image_desktop, image_mobile, sort_order, is_active ? 1 : 0);

    const banner = db.prepare('SELECT * FROM banners WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ success: true, data: banner }, { status: 201 });
  } catch (error) {
    console.error('Banner create error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
