import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const isVercel = Boolean(process.env.VERCEL);
const DB_PATH = isVercel
  ? path.join('/tmp', 'altayeb.db')
  : path.join(process.cwd(), 'database', 'altayeb.db');

// Ensure database directory exists or copy to /tmp for Vercel
if (isVercel) {
  if (!fs.existsSync(DB_PATH)) {
    const sourceDb = path.join(process.cwd(), 'database', 'altayeb.db');
    if (fs.existsSync(sourceDb)) {
      try {
        fs.copyFileSync(sourceDb, DB_PATH);
      } catch (e) {
        console.error('Error copying db to /tmp:', e);
      }
    }
  }
} else {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value_ar TEXT DEFAULT '',
      value_en TEXT DEFAULT '',
      type TEXT DEFAULT 'text',
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_ar TEXT NOT NULL DEFAULT '',
      name_en TEXT NOT NULL DEFAULT '',
      slug TEXT UNIQUE NOT NULL,
      description_ar TEXT DEFAULT '',
      description_en TEXT DEFAULT '',
      image TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS equipment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name_ar TEXT NOT NULL DEFAULT '',
      name_en TEXT NOT NULL DEFAULT '',
      slug TEXT UNIQUE NOT NULL,
      brand TEXT DEFAULT '',
      model TEXT DEFAULT '',
      year TEXT DEFAULT '',
      price TEXT DEFAULT '',
      price_type TEXT DEFAULT 'fixed',
      description_ar TEXT DEFAULT '',
      description_en TEXT DEFAULT '',
      specs_ar TEXT DEFAULT '',
      specs_en TEXT DEFAULT '',
      status TEXT DEFAULT 'available',
      is_featured INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS equipment_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_id INTEGER NOT NULL,
      image_path TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_primary INTEGER DEFAULT 0,
      FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_ar TEXT DEFAULT '',
      title_en TEXT DEFAULT '',
      description_ar TEXT DEFAULT '',
      description_en TEXT DEFAULT '',
      image_desktop TEXT DEFAULT '',
      image_mobile TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_ar TEXT DEFAULT '',
      name_en TEXT DEFAULT '',
      address_ar TEXT DEFAULT '',
      address_en TEXT DEFAULT '',
      maps_link TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      url TEXT NOT NULL DEFAULT '',
      icon TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS equipment_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ref_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      equipment_name TEXT DEFAULT '',
      brand TEXT DEFAULT '',
      model TEXT DEFAULT '',
      specs TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'new',
      admin_notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Insert default settings if not exist
  const defaultSettings: Array<[string, string, string, string]> = [
    ['site_name_ar', 'معرض الطيب للمعدات الثقيلة', 'Al Tayeb Heavy Equipment', 'text'],
    ['site_name_en', 'Al Tayeb Heavy Equipment', 'Al Tayeb Heavy Equipment', 'text'],
    ['site_description_ar', 'نوفر لك المعدات التي تحتاجها بأفضل الاختيارات', 'We provide you with the equipment you need with the best choices', 'text'],
    ['site_description_en', 'Discover quality heavy machinery for your business', 'Discover quality heavy machinery for your business', 'text'],
    ['whatsapp_number', '', '', 'text'],
    ['whatsapp_message_ar', 'مرحباً، أنا مهتم بـ {equipment}، موديل {model}. أرجو تزويدي بمزيد من المعلومات.', '', 'text'],
    ['whatsapp_message_en', 'Hello, I am interested in {equipment}, Model {model}. Please provide more information.', '', 'text'],
    ['phone_number', '', '', 'text'],
    ['logo', '', '', 'image'],
    ['logo_alt', '', '', 'image'],
    ['favicon', '', '', 'image'],
    ['intro_logo', '', '', 'image'],
    ['footer_text_ar', 'جميع الحقوق محفوظة © معرض الطيب للمعدات الثقيلة', '', 'text'],
    ['footer_text_en', 'All rights reserved © Al Tayeb Heavy Equipment', '', 'text'],
    ['hero_title_ar', 'معرض الطيب للمعدات الثقيلة', '', 'text'],
    ['hero_title_en', 'Al Tayeb Heavy Equipment', '', 'text'],
    ['hero_subtitle_ar', 'نوفر لك المعدات التي تحتاجها بأفضل الاختيارات', '', 'text'],
    ['hero_subtitle_en', 'Discover quality heavy machinery for your business', '', 'text'],
    ['categories_title_ar', 'تصفح حسب الفئة', '', 'text'],
    ['categories_title_en', 'Browse by Category', '', 'text'],
    ['featured_title_ar', 'معدات مميزة', '', 'text'],
    ['featured_title_en', 'Featured Equipment', '', 'text'],
    ['request_title_ar', 'محتاج معدة غير موجودة؟', '', 'text'],
    ['request_title_en', 'Looking for Equipment Not Available?', '', 'text'],
    ['request_subtitle_ar', 'أخبرنا بالمعدة التي تبحث عنها وسنتواصل معك عند توفرها', '', 'text'],
    ['request_subtitle_en', 'Tell us what equipment you need and we will contact you when available', '', 'text'],
    ['meta_title_ar', 'معرض الطيب للمعدات الثقيلة', '', 'text'],
    ['meta_title_en', 'Al Tayeb Heavy Equipment', '', 'text'],
    ['meta_description_ar', 'معرض الطيب للمعدات الثقيلة - نوفر لك أفضل المعدات الثقيلة بأسعار منافسة', '', 'text'],
    ['meta_description_en', 'Al Tayeb Heavy Equipment - Quality heavy machinery at competitive prices', '', 'text'],
    ['intro_enabled', '1', '', 'text'],
  ];

  const insertSetting = db.prepare(
    'INSERT OR IGNORE INTO settings (key, value_ar, value_en, type) VALUES (?, ?, ?, ?)'
  );

  for (const [key, valAr, valEn, type] of defaultSettings) {
    insertSetting.run(key, valAr, valEn, type);
  }
}

export default getDb;
