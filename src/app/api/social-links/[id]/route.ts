import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const link = await queryOne('SELECT * FROM social_links WHERE id = ?', [id]);

    if (!link) {
      return NextResponse.json({ success: false, error: 'Social link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, link, data: link });
  } catch (error) {
    console.error('Get social link error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch social link' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const existing = await queryOne<any>('SELECT * FROM social_links WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Social link not found' }, { status: 404 });
    }

    const { platform, url, icon, sort_order, is_active } = data;

    await execute(`
      UPDATE social_links SET
        platform = ?,
        url = ?,
        icon = ?,
        sort_order = ?,
        is_active = ?
      WHERE id = ?
    `, [
      platform ?? existing.platform,
      url ?? existing.url,
      icon ?? existing.icon,
      sort_order ?? 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      id
    ]);

    const updated = await queryOne('SELECT * FROM social_links WHERE id = ?', [id]);
    return NextResponse.json({ success: true, link: updated, data: updated });
  } catch (error) {
    console.error('Update social link error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update social link' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await queryOne<any>('SELECT * FROM social_links WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Social link not found' }, { status: 404 });
    }

    await execute('DELETE FROM social_links WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Social link deleted successfully' });
  } catch (error) {
    console.error('Delete social link error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete social link' }, { status: 500 });
  }
}
