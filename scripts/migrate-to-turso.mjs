import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';
import path from 'path';

const TURSO_URL = 'libsql://altayeb-db-ahmed55440.aws-ap-south-1.turso.io';
const TURSO_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTU1NDQ5MTQsImlkIjoiMDFhMjBlZDAtOTEwMS03MzUxLTkzOTQtMDNlZjI2YzBkMjgyIiwia2lkIjoiWENXZFVQbmI1MVlQd1RNZW1GTlBDcXRnTEtNdTNLM1d1STRVTUcyd3puTSIsInJpZCI6IjMyMjE1YWNjLTExNGUtNDY0My1iNTFlLWZlMWJkODlkMzYyOCJ9.2sOW8WbnrGXkwO0BdfsPWD71_PELerNiIyYXix48toml9nPmcwDZYdhO31924bfXr_O2xk9e-cjhLUB1_r5NAw';

const localDb = new Database(path.join(process.cwd(), 'database', 'altayeb.db'));
const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN,
});

async function migrate() {
  console.log('--- Starting Migration to Turso ---');

  // 1. Create Schema
  const schemaStatements = [
    `CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value_ar TEXT DEFAULT '',
      value_en TEXT DEFAULT '',
      type TEXT DEFAULT 'text',
      updated_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS categories (
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
    );`,
    `CREATE TABLE IF NOT EXISTS equipment (
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
    );`,
    `CREATE TABLE IF NOT EXISTS equipment_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipment_id INTEGER NOT NULL,
      image_path TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_primary INTEGER DEFAULT 0,
      FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS banners (
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
    );`,
    `CREATE TABLE IF NOT EXISTS branches (
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
    );`,
    `CREATE TABLE IF NOT EXISTS social_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      url TEXT NOT NULL DEFAULT '',
      icon TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS equipment_requests (
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
    );`
  ];

  for (const sql of schemaStatements) {
    await turso.execute(sql);
  }
  console.log('✓ Tables created in Turso.');

  const tables = [
    'admin_users',
    'settings',
    'categories',
    'equipment',
    'equipment_images',
    'banners',
    'branches',
    'social_links',
    'equipment_requests'
  ];

  for (const table of tables) {
    const rows = localDb.prepare(`SELECT * FROM ${table}`).all();
    if (rows.length === 0) continue;

    console.log(`Migrating ${rows.length} rows for table: ${table}...`);
    for (const row of rows) {
      const keys = Object.keys(row);
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(k => row[k]);

      const insertSql = `INSERT OR REPLACE INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
      await turso.execute({ sql: insertSql, args: values });
    }
  }

  console.log('✓ Data migration completed!');

  // Verify
  const eqCount = await turso.execute('SELECT COUNT(*) as count FROM equipment');
  console.log('Equipment count in Turso:', eqCount.rows[0].count);

  const catCount = await turso.execute('SELECT COUNT(*) as count FROM categories');
  console.log('Categories count in Turso:', catCount.rows[0].count);

  const bannerCount = await turso.execute('SELECT COUNT(*) as count FROM banners');
  console.log('Banners count in Turso:', bannerCount.rows[0].count);

  const userCount = await turso.execute('SELECT COUNT(*) as count FROM admin_users');
  console.log('Admin users count in Turso:', userCount.rows[0].count);
}

migrate().catch(console.error);
