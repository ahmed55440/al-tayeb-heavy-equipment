import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    const totalEquipment = (db.prepare('SELECT COUNT(*) as count FROM equipment').get() as { count: number }).count;
    const availableEquipment = (db.prepare("SELECT COUNT(*) as count FROM equipment WHERE status = 'available'").get() as { count: number }).count;
    const soldEquipment = (db.prepare("SELECT COUNT(*) as count FROM equipment WHERE status = 'sold'").get() as { count: number }).count;
    const reservedEquipment = (db.prepare("SELECT COUNT(*) as count FROM equipment WHERE status = 'reserved'").get() as { count: number }).count;
    
    const totalCategories = (db.prepare('SELECT COUNT(*) as count FROM categories WHERE is_active = 1').get() as { count: number }).count;
    const newRequests = (db.prepare("SELECT COUNT(*) as count FROM equipment_requests WHERE status = 'new'").get() as { count: number }).count;
    const totalRequests = (db.prepare('SELECT COUNT(*) as count FROM equipment_requests').get() as { count: number }).count;
    const totalBanners = (db.prepare('SELECT COUNT(*) as count FROM banners WHERE is_active = 1').get() as { count: number }).count;
    const totalBranches = (db.prepare('SELECT COUNT(*) as count FROM branches WHERE is_active = 1').get() as { count: number }).count;

    const recentRequests = db.prepare('SELECT * FROM equipment_requests ORDER BY created_at DESC LIMIT 5').all();
    const recentEquipment = db.prepare(`
      SELECT e.*, 
        c.name_ar as category_name_ar,
        (SELECT image_path FROM equipment_images WHERE equipment_id = e.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM equipment e
      LEFT JOIN categories c ON e.category_id = c.id
      ORDER BY e.created_at DESC LIMIT 5
    `).all();

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
    return NextResponse.json({ success: false, error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
