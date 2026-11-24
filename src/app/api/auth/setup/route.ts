import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if any admin user already exists
    const existingAdmin = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM admin_users');
    if (existingAdmin && existingAdmin.count > 0) {
      return NextResponse.json(
        { success: false, error: 'Admin user already exists. Setup is disabled.' },
        { status: 403 }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const result = await execute(
      'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );

    return NextResponse.json({
      success: true,
      user: { id: result.lastInsertRowid, username },
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
