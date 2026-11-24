import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let sql = 'SELECT * FROM branches';
    if (!all) {
      sql += ' WHERE is_active = 1';
    }
    sql += ' ORDER BY sort_order ASC, id ASC';

    const branches = await query(sql);
    return NextResponse.json({ success: true, branches, data: branches });
  } catch (error) {
    console.error('Fetch branches error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch branches' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name_ar, name_en, address_ar, address_en, maps_link, phone, sort_order, is_active } = data;

    if (!name_ar && !name_en) {
      return NextResponse.json({ success: false, error: 'Branch name is required' }, { status: 400 });
    }

    const result = await execute(`
      INSERT INTO branches (name_ar, name_en, address_ar, address_en, maps_link, phone, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name_ar || '',
      name_en || '',
      address_ar || '',
      address_en || '',
      maps_link || '',
      phone || '',
      sort_order ?? 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    ]);

    const newBranch = await queryOne('SELECT * FROM branches WHERE id = ?', [result.lastInsertRowid]);
    return NextResponse.json({ success: true, branch: newBranch, data: newBranch }, { status: 201 });
  } catch (error) {
    console.error('Create branch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create branch' }, { status: 500 });
  }
}
