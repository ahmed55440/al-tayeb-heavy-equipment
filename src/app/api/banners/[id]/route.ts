import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const banner = await queryOne('SELECT * FROM banners WHERE id = ?', [Number(id)]);
    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: banner, banner });
  } catch (error) {
    console.error('Banner get error:', error);
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

    const existing = await queryOne<Record<string, unknown>>('SELECT * FROM banners WHERE id = ?', [Number(id)]);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    await execute(`
      UPDATE banners SET
        title_ar = ?, title_en = ?, description_ar = ?, description_en = ?,
        image_desktop = ?, image_mobile = ?, sort_order = ?, is_active = ?
      WHERE id = ?
    `, [
      body.title_ar ?? existing.title_ar,
      body.title_en ?? existing.title_en,
      body.description_ar ?? existing.description_ar,
      body.description_en ?? existing.description_en,
      body.image_desktop ?? existing.image_desktop,
      body.image_mobile ?? existing.image_mobile,
      body.sort_order ?? existing.sort_order,
      body.is_active !== undefined ? (body.is_active ? 1 : 0) : existing.is_active,
      Number(id)
    ]);

    const updated = await queryOne('SELECT * FROM banners WHERE id = ?', [Number(id)]);
    return NextResponse.json({ success: true, data: updated, banner: updated });
  } catch (error) {
    console.error('Banner update error:', error);
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
    const existing = await queryOne('SELECT id FROM banners WHERE id = ?', [Number(id)]);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    await execute('DELETE FROM banners WHERE id = ?', [Number(id)]);
    return NextResponse.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Banner delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
