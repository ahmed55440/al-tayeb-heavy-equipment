import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active');

    let sql = 'SELECT * FROM categories';
    const params: number[] = [];

    if (activeOnly === 'true' || activeOnly === '1') {
      sql += ' WHERE is_active = ?';
      params.push(1);
    }

    sql += ' ORDER BY sort_order ASC, created_at DESC';

    const categories = await query(sql, params);

    return NextResponse.json({ success: true, data: categories, categories });
  } catch (error) {
    console.error('Categories list error:', error);
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
      name_ar = '',
      name_en = '',
      description_ar = '',
      description_en = '',
      image = '',
      sort_order = 0,
      is_active = 1,
    } = body;

    // Generate unique slug
    let baseSlug = slugify(name_en || name_ar) || 'category';
    let slug = baseSlug;
    let counter = 1;
    while (await queryOne('SELECT id FROM categories WHERE slug = ?', [slug])) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const result = await execute(`
      INSERT INTO categories (name_ar, name_en, slug, description_ar, description_en, image, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name_ar, name_en, slug, description_ar, description_en, image, sort_order, is_active ? 1 : 0]);

    const category = await queryOne('SELECT * FROM categories WHERE id = ?', [result.lastInsertRowid]);

    return NextResponse.json({ success: true, data: category, category }, { status: 201 });
  } catch (error) {
    console.error('Category create error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
