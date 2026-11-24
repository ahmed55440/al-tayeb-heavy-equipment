import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { slugify } from '@/lib/utils';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const category = await queryOne(
      'SELECT * FROM categories WHERE id = ? OR slug = ?',
      [isNaN(Number(id)) ? -1 : Number(id), id]
    );

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category, category });
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
    const body = await request.json();

    const existing = await queryOne<{
      id: number;
      slug: string;
      name_en: string;
      name_ar: string;
      description_ar: string;
      description_en: string;
      image: string;
      sort_order: number;
      is_active: number;
    }>('SELECT * FROM categories WHERE id = ?', [Number(id)]);

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
      if (newBaseSlug && newBaseSlug !== existing.slug) {
        slug = newBaseSlug;
        let counter = 1;
        while (true) {
          const conflict = await queryOne('SELECT id FROM categories WHERE slug = ? AND id != ?', [slug, existing.id]);
          if (!conflict) break;
          slug = `${newBaseSlug}-${counter}`;
          counter++;
        }
      }
    }

    await execute(`
      UPDATE categories SET
        name_ar = ?, name_en = ?, slug = ?, description_ar = ?, description_en = ?,
        image = ?, sort_order = ?, is_active = ?
      WHERE id = ?
    `, [
      body.name_ar ?? existing.name_ar,
      body.name_en ?? existing.name_en,
      slug,
      body.description_ar ?? existing.description_ar ?? '',
      body.description_en ?? existing.description_en ?? '',
      body.image ?? existing.image ?? '',
      body.sort_order ?? existing.sort_order ?? 0,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : existing.is_active,
      existing.id
    ]);

    const updated = await queryOne('SELECT * FROM categories WHERE id = ?', [existing.id]);
    return NextResponse.json({ success: true, data: updated, category: updated });
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
    const existing = await queryOne('SELECT id FROM categories WHERE id = ?', [Number(id)]);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    await execute('DELETE FROM categories WHERE id = ?', [Number(id)]);
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Category delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
