import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const reqItem = await queryOne('SELECT * FROM equipment_requests WHERE id = ?', [id]);

    if (!reqItem) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: reqItem });
  } catch (error) {
    console.error('Get request error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch request' }, { status: 500 });
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

    const existing = await queryOne('SELECT * FROM equipment_requests WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    const { status, admin_notes } = data;

    await execute(`
      UPDATE equipment_requests SET
        status = COALESCE(?, status),
        admin_notes = COALESCE(?, admin_notes),
        updated_at = datetime('now')
      WHERE id = ?
    `, [status ?? null, admin_notes ?? null, id]);

    const updated = await queryOne('SELECT * FROM equipment_requests WHERE id = ?', [id]);
    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error('Update request error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update request' }, { status: 500 });
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
    const existing = await queryOne('SELECT * FROM equipment_requests WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    await execute('DELETE FROM equipment_requests WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete request' }, { status: 500 });
  }
}
