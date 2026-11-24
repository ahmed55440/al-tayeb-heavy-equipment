import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const totalEquipment = (await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM equipment'))?.count ?? 0;
    const availableEquipment = (await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM equipment WHERE status = 'available'"))?.count ?? 0;
    const soldEquipment = (await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM equipment WHERE status = 'sold'"))?.count ?? 0;
    const reservedEquipment = (await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM equipment WHERE status = 'reserved'"))?.count ?? 0;
    
    const totalCategories = (await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM categories WHERE is_active = 1'))?.count ?? 0;
    const newRequests = (await queryOne<{ count: number }>("SELECT COUNT(*) as count FROM equipment_requests WHERE status = 'new'"))?.count ?? 0;
    const totalRequests = (await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM equipment_requests'))?.count ?? 0;
    const totalBanners = (await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM banners WHERE is_active = 1'))?.count ?? 0;
    const totalBranches = (await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM branches WHERE is_active = 1'))?.count ?? 0;

    const recentRequests = await query('SELECT * FROM equipment_requests ORDER BY created_at DESC LIMIT 5');
    const recentEquipment = await query(`
      SELECT e.*, 
        c.name_ar as category_name_ar,
        (SELECT image_path FROM equipment_images WHERE equipment_id = e.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM equipment e
      LEFT JOIN categories c ON e.category_id = c.id
      ORDER BY e.created_at DESC LIMIT 5
    `);

    return NextResponse.json({
      success: true,
      stats: {
        totalEquipment,
        availableEquipment,
        soldEquipment,
        reservedEquipment,
        totalCategories,
        newRequests,
        totalRequests,
        totalBanners,
        totalBranches,
      },
      recentRequests,
      recentEquipment,
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
