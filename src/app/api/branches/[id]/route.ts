import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const branch = await queryOne('SELECT * FROM branches WHERE id = ?', [id]);

    if (!branch) {
      return NextResponse.json({ success: false, error: 'Branch not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, branch, data: branch });
  } catch (error) {
    console.error('Get branch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch branch' }, { status: 500 });
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

    const existing = await queryOne('SELECT * FROM branches WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Branch not found' }, { status: 404 });
    }

    const { name_ar, name_en, address_ar, address_en, maps_link, phone, sort_order, is_active } = data;

    await execute(`
      UPDATE branches SET
        name_ar = ?,
        name_en = ?,
        address_ar = ?,
        address_en = ?,
        maps_link = ?,
        phone = ?,
        sort_order = ?,
        is_active = ?
      WHERE id = ?
    `, [
      name_ar ?? '',
      name_en ?? '',
      address_ar ?? '',
      address_en ?? '',
      maps_link ?? '',
      phone ?? '',
      sort_order ?? 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      id
    ]);

    const updated = await queryOne('SELECT * FROM branches WHERE id = ?', [id]);
    return NextResponse.json({ success: true, branch: updated, data: updated });
  } catch (error) {
    console.error('Update branch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update branch' }, { status: 500 });
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
    const existing = await queryOne('SELECT * FROM branches WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Branch not found' }, { status: 404 });
    }

    await execute('DELETE FROM branches WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Delete branch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete branch' }, { status: 500 });
  }
}
