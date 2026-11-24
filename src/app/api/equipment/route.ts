import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const status = searchParams.get('status');
    const published = searchParams.get('published');

    let sql = `
      SELECT e.*, 
        c.name_ar as category_name_ar, 
        c.name_en as category_name_en,
        c.slug as category_slug,
        (SELECT image_path FROM equipment_images WHERE equipment_id = e.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM equipment e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (category) {
      sql += ' AND (c.slug = ? OR c.id = ?)';
      params.push(category, isNaN(Number(category)) ? -1 : Number(category));
    }

    if (search) {
      sql += ' AND (e.name_ar LIKE ? OR e.name_en LIKE ? OR e.brand LIKE ? OR e.model LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (featured === 'true' || featured === '1') {
      sql += ' AND e.is_featured = 1';
    }

    if (status) {
      sql += ' AND e.status = ?';
      params.push(status);
    }

    if (published === 'true' || published === '1') {
      sql += ' AND e.is_published = 1';
    } else if (published === 'false' || published === '0') {
      sql += ' AND e.is_published = 0';
    }

    sql += ' ORDER BY e.sort_order ASC, e.created_at DESC';

    const equipment = await query(sql, params);

    return NextResponse.json({ success: true, data: equipment, equipment });
  } catch (error) {
    console.error('Equipment list error:', error);
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
      category_id,
      name_ar = '',
      name_en = '',
      brand = '',
      model = '',
      year = '',
      price = '',
      price_type = 'fixed',
      description_ar = '',
      description_en = '',
      specs_ar = '',
      specs_en = '',
      status = 'available',
      is_featured = 0,
      is_published = 1,
      sort_order = 0,
    } = body;

    // Generate slug from name_en or name_ar
    let baseSlug = slugify(name_en || name_ar) || 'equipment';
    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await queryOne('SELECT id FROM equipment WHERE slug = ?', [slug])) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const result = await execute(`
      INSERT INTO equipment (
        category_id, name_ar, name_en, slug, brand, model, year, price, price_type,
        description_ar, description_en, specs_ar, specs_en, status,
        is_featured, is_published, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      category_id || null,
      name_ar, name_en, slug, brand, model, year, price, price_type,
      description_ar, description_en, specs_ar, specs_en, status,
      is_featured ? 1 : 0, is_published ? 1 : 0, sort_order
    ]);

    // Handle images if provided
    if (body.images && Array.isArray(body.images)) {
      for (let i = 0; i < body.images.length; i++) {
        const img = body.images[i];
        await execute(
          'INSERT INTO equipment_images (equipment_id, image_path, sort_order, is_primary) VALUES (?, ?, ?, ?)',
          [
            result.lastInsertRowid,
            img.image_path || img,
            img.sort_order ?? i,
            img.is_primary ?? (i === 0 ? 1 : 0)
          ]
        );
      }
    }

    const equipment = await queryOne('SELECT * FROM equipment WHERE id = ?', [result.lastInsertRowid]);

    return NextResponse.json({ success: true, data: equipment, equipment }, { status: 201 });
  } catch (error) {
    console.error('Equipment create error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
