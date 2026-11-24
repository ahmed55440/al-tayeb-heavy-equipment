import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { generateRefNumber } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let sql = 'SELECT * FROM equipment_requests WHERE 1=1';
    const params: (string | number)[] = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (customer_name LIKE ? OR phone LIKE ? OR equipment_name LIKE ? OR ref_number LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY created_at DESC';

    const requests = await query(sql, params);

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Fetch requests error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { customer_name, phone, equipment_name, brand, model, specs, notes } = data;

    if (!customer_name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Customer name and phone number are required' },
        { status: 400 }
      );
    }

    const ref_number = generateRefNumber();

    const result = await execute(`
      INSERT INTO equipment_requests (
        ref_number, customer_name, phone, equipment_name, brand, model, specs, notes, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', datetime('now'), datetime('now'))
    `, [
      ref_number,
      customer_name.trim(),
      phone.trim(),
      equipment_name ? equipment_name.trim() : '',
      brand ? brand.trim() : '',
      model ? model.trim() : '',
      specs ? specs.trim() : '',
      notes ? notes.trim() : ''
    ]);

    const savedRequest = await queryOne('SELECT * FROM equipment_requests WHERE id = ?', [result.lastInsertRowid]);

    return NextResponse.json(
      {
        success: true,
        ref_number,
        request: savedRequest,
        message: 'Request submitted successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Submit request error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit request' }, { status: 500 });
  }
}
