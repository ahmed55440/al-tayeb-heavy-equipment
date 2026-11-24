import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Try by id or slug
    const equipment = await queryOne(`
      SELECT e.*, 
        c.name_ar as category_name_ar, 
        c.name_en as category_name_en,
        c.slug as category_slug
      FROM equipment e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.id = ? OR e.slug = ?
    `, [isNaN(Number(id)) ? -1 : Number(id), id]);

    if (!equipment) {
      return NextResponse.json(
        { success: false, error: 'Equipment not found' },
        { status: 404 }
      );
    }

    const equipmentRecord = equipment as { id: number };
    const images = await query(
      'SELECT * FROM equipment_images WHERE equipment_id = ? ORDER BY sort_order ASC',
      [equipmentRecord.id]
    );

    return NextResponse.json({
      success: true,
      data: { ...equipment, images },
      equipment: { ...equipment, images },
    });
  } catch (error) {
    console.error('Equipment get error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const existing = await queryOne<{
      id: number;
      slug: string;
      name_en: string;
      name_ar: string;
    }>('SELECT * FROM equipment WHERE id = ?', [Number(id)]);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Equipment not found' },
        { status: 404 }
      );
    }

    // If name changed, regenerate slug
    let slug = existing.slug;
    if (body.name_en !== undefined || body.name_ar !== undefined) {
      const newName = body.name_en || body.name_ar || existing.name_en || existing.name_ar;
      const newBaseSlug = slugify(newName);
      if (newBaseSlug && newBaseSlug !== existing.slug) {
        slug = newBaseSlug;
        let counter = 1;
        while (true) {
          const conflict = await queryOne('SELECT id FROM equipment WHERE slug = ? AND id != ?', [slug, existing.id]);
          if (!conflict) break;
          slug = `${newBaseSlug}-${counter}`;
          counter++;
        }
      }
    }

    await execute(`
      UPDATE equipment SET
        category_id = ?, name_ar = ?, name_en = ?, slug = ?, brand = ?, model = ?,
        year = ?, price = ?, price_type = ?, description_ar = ?, description_en = ?,
        specs_ar = ?, specs_en = ?, status = ?, is_featured = ?, is_published = ?,
        sort_order = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [
      body.category_id ?? null,
      body.name_ar ?? '',
      body.name_en ?? '',
      slug,
      body.brand ?? '',
      body.model ?? '',
      body.year ?? '',
      body.price ?? '',
      body.price_type ?? 'fixed',
      body.description_ar ?? '',
      body.description_en ?? '',
      body.specs_ar ?? '',
      body.specs_en ?? '',
      body.status ?? 'available',
      body.is_featured ? 1 : 0,
      body.is_published ? 1 : 0,
      body.sort_order ?? 0,
      existing.id
    ]);

    // Handle images update if provided
    if (body.images && Array.isArray(body.images)) {
      await execute('DELETE FROM equipment_images WHERE equipment_id = ?', [existing.id]);
      for (let i = 0; i < body.images.length; i++) {
        const img = body.images[i];
        await execute(
          'INSERT INTO equipment_images (equipment_id, image_path, sort_order, is_primary) VALUES (?, ?, ?, ?)',
          [
            existing.id,
            img.image_path || img,
            img.sort_order ?? i,
            img.is_primary ?? (i === 0 ? 1 : 0)
          ]
        );
      }
    }

    const updated = await queryOne('SELECT * FROM equipment WHERE id = ?', [existing.id]);
    const images = await query(
      'SELECT * FROM equipment_images WHERE equipment_id = ? ORDER BY sort_order ASC',
      [existing.id]
    );

    return NextResponse.json({ success: true, data: { ...(updated as any), images } });
  } catch (error) {
    console.error('Equipment update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const existing = await queryOne('SELECT id FROM equipment WHERE id = ?', [Number(id)]);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Equipment not found' },
        { status: 404 }
      );
    }

    // Images are deleted automatically via ON DELETE CASCADE (or manual cleanup)
    await execute('DELETE FROM equipment_images WHERE equipment_id = ?', [Number(id)]);
    await execute('DELETE FROM equipment WHERE id = ?', [Number(id)]);

    return NextResponse.json({ success: true, message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Equipment delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
