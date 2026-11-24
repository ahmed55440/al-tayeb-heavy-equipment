import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');

    let sql = 'SELECT * FROM banners';
    if (all !== 'true') {
      sql += ' WHERE is_active = 1';
    }
    sql += ' ORDER BY sort_order ASC, created_at DESC';

    const banners = await query(sql);
    return NextResponse.json({ success: true, data: banners, banners });
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

    const result = await execute(`
      INSERT INTO banners (title_ar, title_en, description_ar, description_en, image_desktop, image_mobile, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title_ar, title_en, description_ar, description_en, image_desktop, image_mobile, sort_order, is_active ? 1 : 0]);

    const banner = await queryOne('SELECT * FROM banners WHERE id = ?', [result.lastInsertRowid]);
    return NextResponse.json({ success: true, data: banner, banner }, { status: 201 });
  } catch (error) {
    console.error('Banner create error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
