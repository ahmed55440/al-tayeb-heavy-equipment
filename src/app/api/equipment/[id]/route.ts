import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const db = getDb();

    // Try by id or slug
    const equipment = db.prepare(`
      SELECT e.*, 
        c.name_ar as category_name_ar, 
        c.name_en as category_name_en,
        c.slug as category_slug
      FROM equipment e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.id = ? OR e.slug = ?
    `).get(isNaN(Number(id)) ? -1 : Number(id), id);

    if (!equipment) {
      return NextResponse.json(
        { success: false, error: 'Equipment not found' },
        { status: 404 }
      );
    }

    const equipmentRecord = equipment as { id: number };
    const images = db.prepare(
      'SELECT * FROM equipment_images WHERE equipment_id = ? ORDER BY sort_order ASC'
    ).all(equipmentRecord.id);

    return NextResponse.json({
      success: true,
      data: { ...equipment, images },
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
    const db = getDb();
    const body = await request.json();

    const existing = db.prepare('SELECT * FROM equipment WHERE id = ?').get(Number(id)) as {
      id: number;
      slug: string;
      name_en: string;
      name_ar: string;
    } | undefined;

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
      if (newBaseSlug !== existing.slug) {
        slug = newBaseSlug;
        let counter = 1;
        while (true) {
          const conflict = db.prepare('SELECT id FROM equipment WHERE slug = ? AND id != ?').get(slug, existing.id);
          if (!conflict) break;
          slug = `${newBaseSlug}-${counter}`;
          counter++;
        }
      }
    }

    db.prepare(`
      UPDATE equipment SET
        category_id = ?, name_ar = ?, name_en = ?, slug = ?, brand = ?, model = ?,
        year = ?, price = ?, price_type = ?, description_ar = ?, description_en = ?,
        specs_ar = ?, specs_en = ?, status = ?, is_featured = ?, is_published = ?,
        sort_order = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(
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
    );

    // Handle images update if provided
    if (body.images && Array.isArray(body.images)) {
      // Remove old images
      db.prepare('DELETE FROM equipment_images WHERE equipment_id = ?').run(existing.id);
      // Insert new images
      const insertImage = db.prepare(
        'INSERT INTO equipment_images (equipment_id, image_path, sort_order, is_primary) VALUES (?, ?, ?, ?)'
      );
      for (let i = 0; i < body.images.length; i++) {
        const img = body.images[i];
        insertImage.run(
          existing.id,
          img.image_path || img,
          img.sort_order ?? i,
          img.is_primary ?? (i === 0 ? 1 : 0)
        );
      }
    }

    const updated = db.prepare('SELECT * FROM equipment WHERE id = ?').get(existing.id);
    const images = db.prepare(
      'SELECT * FROM equipment_images WHERE equipment_id = ? ORDER BY sort_order ASC'
    ).all(existing.id);

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
    const db = getDb();

    const existing = db.prepare('SELECT id FROM equipment WHERE id = ?').get(Number(id));
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Equipment not found' },
        { status: 404 }
      );
    }

    // Images are deleted automatically via ON DELETE CASCADE
    db.prepare('DELETE FROM equipment WHERE id = ?').run(Number(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Equipment delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
