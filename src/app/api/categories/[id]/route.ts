import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const db = getDb();

    const category = db.prepare(
      'SELECT * FROM categories WHERE id = ? OR slug = ?'
    ).get(isNaN(Number(id)) ? -1 : Number(id), id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Category get error:', error);
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

    const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(Number(id)) as {
      id: number;
      slug: string;
      name_en: string;
      name_ar: string;
    } | undefined;

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Regenerate slug if name changed
    let slug = existing.slug;
    if (body.name_en !== undefined || body.name_ar !== undefined) {
      const newName = body.name_en || body.name_ar || existing.name_en || existing.name_ar;
      const newBaseSlug = slugify(newName);
      if (newBaseSlug !== existing.slug) {
        slug = newBaseSlug;
        let counter = 1;
        while (true) {
          const conflict = db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').get(slug, existing.id);
          if (!conflict) break;
          slug = `${newBaseSlug}-${counter}`;
          counter++;
        }
      }
    }

    db.prepare(`
      UPDATE categories SET
        name_ar = ?, name_en = ?, slug = ?, description_ar = ?, description_en = ?,
        image = ?, sort_order = ?, is_active = ?
      WHERE id = ?
    `).run(
      body.name_ar ?? existing.name_ar,
      body.name_en ?? existing.name_en,
      slug,
      body.description_ar ?? '',
      body.description_en ?? '',
      body.image ?? '',
      body.sort_order ?? 0,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
      existing.id
    );

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(existing.id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Category update error:', error);
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

    const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(Number(id));
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM categories WHERE id = ?').run(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Category delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
