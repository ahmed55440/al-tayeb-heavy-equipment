import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let sql = 'SELECT * FROM social_links';
    if (!all) {
      sql += ' WHERE is_active = 1';
    }
    sql += ' ORDER BY sort_order ASC, id ASC';

    const links = await query(sql);
    return NextResponse.json({ success: true, links, data: links });
  } catch (error) {
    console.error('Fetch social links error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch social links' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { platform, url, icon, sort_order, is_active } = data;

    if (!platform || !url) {
      return NextResponse.json({ success: false, error: 'Platform and URL are required' }, { status: 400 });
    }

    const result = await execute(`
      INSERT INTO social_links (platform, url, icon, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?)
    `, [
      platform,
      url,
      icon || '',
      sort_order ?? 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    ]);

    const newLink = await queryOne('SELECT * FROM social_links WHERE id = ?', [result.lastInsertRowid]);
    return NextResponse.json({ success: true, link: newLink, data: newLink }, { status: 201 });
  } catch (error) {
    console.error('Create social link error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create social link' }, { status: 500 });
  }
}
