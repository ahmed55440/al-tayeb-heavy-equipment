import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const branch = db.prepare('SELECT * FROM branches WHERE id = ?').get(id);

    if (!branch) {
      return NextResponse.json({ success: false, error: 'Branch not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, branch });
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
    const db = getDb();

    const existing = db.prepare('SELECT * FROM branches WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Branch not found' }, { status: 404 });
    }

    const { name_ar, name_en, address_ar, address_en, maps_link, phone, sort_order, is_active } = data;

    db.prepare(`
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
    `).run(
      name_ar ?? '',
      name_en ?? '',
      address_ar ?? '',
      address_en ?? '',
      maps_link ?? '',
      phone ?? '',
      sort_order ?? 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      id
    );

    const updated = db.prepare('SELECT * FROM branches WHERE id = ?').get(id);
    return NextResponse.json({ success: true, branch: updated });
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
    const db = getDb();

    const existing = db.prepare('SELECT * FROM branches WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Branch not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM branches WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Delete branch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete branch' }, { status: 500 });
  }
}
