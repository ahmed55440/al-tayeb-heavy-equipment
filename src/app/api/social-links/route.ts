import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let query = 'SELECT * FROM social_links';
    if (!all) {
      query += ' WHERE is_active = 1';
    }
    query += ' ORDER BY sort_order ASC, id ASC';

    const links = db.prepare(query).all();
    return NextResponse.json({ success: true, links });
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

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO social_links (platform, url, icon, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      platform,
      url,
      icon || '',
      sort_order ?? 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1
    );

    const newLink = db.prepare('SELECT * FROM social_links WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ success: true, link: newLink }, { status: 201 });
  } catch (error) {
    console.error('Create social link error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create social link' }, { status: 500 });
  }
}
