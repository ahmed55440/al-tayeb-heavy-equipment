const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname);
const dbPath = path.join(dbDir, 'altayeb.db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Ensure tables
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

console.log('Tables initialized');

// Create default admin user if not exists
const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get().count;
if (adminCount === 0) {
  const hash = bcrypt.hashSync('admin123456', 12);
  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run('admin', hash);
  console.log('Created default admin user: admin / admin123456');
}

// Default Settings
const defaultSettings = [
  ['site_name_ar', 'معرض الطيب للمعدات الثقيلة', 'Al Tayeb Heavy Equipment', 'text'],
  ['site_name_en', 'Al Tayeb Heavy Equipment', 'Al Tayeb Heavy Equipment', 'text'],
  ['site_description_ar', 'المعرض الرائد في تجارة واستيراد وتوريد كافة أنواع المعدات الثقيلة بأعلى مواصفات الجودة', 'Leading showroom for importing and supplying heavy machinery with international standards', 'text'],
  ['site_description_en', 'Discover quality heavy machinery for your business with international standards and direct warranty', 'Discover quality heavy machinery for your business with international standards and direct warranty', 'text'],
  ['whatsapp_number', '+201000000000', '+201000000000', 'text'],
  ['whatsapp_message_ar', 'مرحباً، أنا مهتم بـ {equipment}، موديل {model}. أرجو تزويدي بمزيد من المعلومات والتفاصيل.', '', 'text'],
  ['whatsapp_message_en', 'Hello, I am interested in {equipment}, Model {model}. Please provide more information and details.', '', 'text'],
  ['phone_number', '+201000000000', '+201000000000', 'text'],
  ['logo', '', '', 'image'],
  ['logo_alt', '', '', 'image'],
  ['favicon', '', '', 'image'],
  ['intro_logo', '', '', 'image'],
  ['footer_text_ar', 'جميع الحقوق محفوظة © معرض الطيب للمعدات الثقيلة — رواد توريد المعدات الإنشائية والصناعية', '', 'text'],
  ['footer_text_en', 'All rights reserved © Al Tayeb Heavy Equipment — Leaders in heavy construction and industrial machinery', '', 'text'],
  ['hero_title_ar', 'معرض الطيب للمعدات الثقيلة', 'Al Tayeb Heavy Equipment', 'text'],
  ['hero_title_en', 'Al Tayeb Heavy Equipment', 'Al Tayeb Heavy Equipment', 'text'],
  ['hero_subtitle_ar', 'نوفر لك أقوى المعدات العالمية من كبرى الماركات الدولية بأفضل الأسعار وأعلى معايير الكفاءة', '', 'text'],
  ['hero_subtitle_en', 'Providing premium world-class heavy machinery from top global manufacturers with guaranteed performance', '', 'text'],
  ['categories_title_ar', 'فئات المعدات المتوفرة', '', 'text'],
  ['categories_title_en', 'Equipment Categories', '', 'text'],
  ['featured_title_ar', 'معدات مختارة ومميزة', '', 'text'],
  ['featured_title_en', 'Featured Heavy Machinery', '', 'text'],
  ['request_title_ar', 'محتاج معدة غير موجودة؟', '', 'text'],
  ['request_title_en', 'Looking for Equipment Not Available?', '', 'text'],
  ['request_subtitle_ar', 'أخبرنا بالمعدة التي تبحث عنها وسنتواصل معك فوراً عند توفرها أو نوفرها لك خصيصاً', '', 'text'],
  ['request_subtitle_en', 'Tell us what equipment you need and we will contact you immediately when available or source it for you', '', 'text'],
  ['meta_title_ar', 'معرض الطيب للمعدات الثقيلة | لودرات وحفارات وبلدوزرات', '', 'text'],
  ['meta_title_en', 'Al Tayeb Heavy Equipment | Wheel Loaders, Excavators, Bulldozers', '', 'text'],
  ['meta_description_ar', 'معرض الطيب للمعدات الثقيلة - أكبر تشكيلة من الحفارات واللوادر والبلدوزرات والروافع بأفضل الأسعار وبحالة ممتازة', '', 'text'],
  ['meta_description_en', 'Al Tayeb Heavy Equipment - Premier showroom for wheel loaders, excavators, bulldozers, and cranes.', '', 'text'],
  ['intro_enabled', '1', '1', 'text'],
];

const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value_ar, value_en, type) VALUES (?, ?, ?, ?)');
for (const [k, ar, en, type] of defaultSettings) {
  insertSetting.run(k, ar, en, type);
}

// Categories
const initialCategories = [
  {
    name_ar: 'اللوادر (Wheel Loaders)',
    name_en: 'Wheel Loaders',
    slug: 'wheel-loaders',
    description_ar: 'تشكيلة متكاملة من لوادر كاتر بيلر، كوماتسو، وهيونداي بمختلف السعات والأحجام لأعمال الحفر والتحميل والردم.',
    description_en: 'Complete selection of Caterpillar, Komatsu, and Hyundai wheel loaders for earthmoving and loading.',
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1000&q=80',
    sort_order: 1,
  },
  {
    name_ar: 'الحفارات (Excavators)',
    name_en: 'Excavators',
    slug: 'excavators',
    description_ar: 'حفارات هيدروليكية مجنزرة وكاوتش بأعماق حفر وقدرات مختلفة لمشاريع الإنشاءات والبنية التحتية والمحاجر.',
    description_en: 'Hydraulic crawler and wheeled excavators with varied digging depths and power for infrastructure projects.',
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1000&q=80',
    sort_order: 2,
  },
  {
    name_ar: 'البلدوزرات (Bulldozers)',
    name_en: 'Bulldozers',
    slug: 'bulldozers',
    description_ar: 'بلدوزرات قوية لتسوية الأراضي وتكسير الصخور والأعمال الشاقة بقدرات دفع استثنائية وجنازير متينة.',
    description_en: 'Heavy-duty bulldozers for site grading, rock ripping, and earth leveling with maximum traction.',
    image: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1000&q=80',
    sort_order: 3,
  },
  {
    name_ar: 'الأوناش والروافع (Cranes)',
    name_en: 'Cranes',
    slug: 'cranes',
    description_ar: 'أوناش متحركة وتلسكوبية لمختلف حمولات الرفع في مواقع البناء والتشييد والمصانع.',
    description_en: 'Mobile and telescopic cranes with high lifting capacities for construction and industrial sites.',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1000&q=80',
    sort_order: 4,
  },
  {
    name_ar: 'الكلاركات (Forklifts)',
    name_en: 'Forklifts',
    slug: 'forklifts',
    description_ar: 'روافع شوكية ديزل وكهربائية لمناولة المواد والمستودعات والخدمات اللوجستية.',
    description_en: 'Diesel and electric forklifts for material handling, warehouses, and logistics operations.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80',
    sort_order: 5,
  },
  {
    name_ar: 'معدات ثقيلة أخرى (Other Heavy Equipment)',
    name_en: 'Other Heavy Equipment',
    slug: 'other-equipment',
    description_ar: 'جريدرات، مداحل أسفلت وتربة، وقلابات ثقيلة لكافة التجهيزات الإنشائية والطرق.',
    description_en: 'Motor graders, soil/asphalt compactors, and heavy dump trucks for road construction.',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1000&q=80',
    sort_order: 6,
  },
];

const insertCategory = db.prepare(`
  INSERT OR IGNORE INTO categories (name_ar, name_en, slug, description_ar, description_en, image, sort_order, is_active)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1)
`);

for (const c of initialCategories) {
  insertCategory.run(c.name_ar, c.name_en, c.slug, c.description_ar, c.description_en, c.image, c.sort_order);
}

// Banners
const initialBanners = [
  {
    title_ar: 'معرض الطيب للمعدات الثقيلة',
    title_en: 'Al Tayeb Heavy Equipment',
    description_ar: 'أقوى تشكيلة من الحفارات واللوادر والبلدوزرات بحالة الوكالة وبأسعار تنافسية',
    description_en: 'The finest collection of excavators, wheel loaders, and bulldozers in showroom condition',
    image_desktop: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1920&q=85',
    image_mobile: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=85',
    sort_order: 1,
  },
  {
    title_ar: 'كفاءة عالية وجودة معتمدة',
    title_en: 'High Performance & Certified Quality',
    description_ar: 'جميع معداتنا مفحوصة بدقة من قِبل مهندسين متخصصين لضمان أفضل إنتاجية لمشروعك',
    description_en: 'Every piece of machinery is rigorously inspected by certified specialists for peak job-site performance',
    image_desktop: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1920&q=85',
    image_mobile: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=85',
    sort_order: 2,
  },
  {
    title_ar: 'نوفر لك أي معدة غير متوفرة',
    title_en: 'Custom Machinery Sourcing',
    description_ar: 'تواصل معنا مباشرة عبر الواتساب وسنلبي كافة احتياجاتك من المعدات الثقيلة وقطع الغيار',
    description_en: 'Direct WhatsApp and phone assistance to source any heavy equipment or attachments globally',
    image_desktop: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1920&q=85',
    image_mobile: 'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=85',
    sort_order: 3,
  },
];

const insertBanner = db.prepare(`
  INSERT OR IGNORE INTO banners (title_ar, title_en, description_ar, description_en, image_desktop, image_mobile, sort_order, is_active)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1)
`);

for (const b of initialBanners) {
  insertBanner.run(b.title_ar, b.title_en, b.description_ar, b.description_en, b.image_desktop, b.image_mobile, b.sort_order);
}

// Branches
const initialBranches = [
  {
    name_ar: 'المعرض الرئيسي — طريق السويس الصحراوي',
    name_en: 'Main Showroom — Cairo-Suez Highway',
    address_ar: 'طريق القاهرة - السويس الصحراوي، الكيلو 45، المنطقة الصناعية',
    address_en: 'Cairo - Suez Desert Road, Km 45, Industrial Zone',
    maps_link: 'https://maps.google.com',
    phone: '+201001234567',
    sort_order: 1,
  },
  {
    name_ar: 'فرع الإسكندرية — الطريق الدولي الساحلي',
    name_en: 'Alexandria Branch — International Coastal Road',
    address_ar: 'الطريق الدولي الساحلي، بجوار كوبري العامرية، الإسكندرية',
    address_en: 'International Coastal Highway, near Amreya Bridge, Alexandria',
    maps_link: 'https://maps.google.com',
    phone: '+201007654321',
    sort_order: 2,
  },
];

const insertBranch = db.prepare(`
  INSERT OR IGNORE INTO branches (name_ar, name_en, address_ar, address_en, maps_link, phone, sort_order, is_active)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1)
`);

for (const br of initialBranches) {
  insertBranch.run(br.name_ar, br.name_en, br.address_ar, br.address_en, br.maps_link, br.phone, br.sort_order);
}

// Social links
const initialSocial = [
  { platform: 'Facebook', url: 'https://facebook.com', icon: 'facebook', sort_order: 1 },
  { platform: 'Instagram', url: 'https://instagram.com', icon: 'instagram', sort_order: 2 },
  { platform: 'TikTok', url: 'https://tiktok.com', icon: 'tiktok', sort_order: 3 },
  { platform: 'YouTube', url: 'https://youtube.com', icon: 'youtube', sort_order: 4 },
];

const insertSocial = db.prepare(`
  INSERT OR IGNORE INTO social_links (platform, url, icon, sort_order, is_active)
  VALUES (?, ?, ?, ?, 1)
`);

for (const s of initialSocial) {
  insertSocial.run(s.platform, s.url, s.icon, s.sort_order);
}

// Sample Equipment
const catMap = {};
db.prepare('SELECT id, slug FROM categories').all().forEach(c => { catMap[c.slug] = c.id; });

const equipmentCount = db.prepare('SELECT COUNT(*) as count FROM equipment').get().count;

if (equipmentCount === 0) {
  const sampleEquipment = [
    {
      catSlug: 'wheel-loaders',
      name_ar: 'لودر كاتر بيلر CAT 966H',
      name_en: 'Caterpillar CAT 966H Wheel Loader',
      slug: 'cat-966h-wheel-loader',
      brand: 'Caterpillar',
      model: 'CAT 966H',
      year: '2020',
      price: '3250000',
      price_type: 'fixed',
      status: 'available',
      is_featured: 1,
      description_ar: 'لودر كاتر بيلر موديل CAT 966H بحالة ممتازة وجاهز للعمل الفوري في المحاجر ومواقع البناء. محرك ديزل قوي طراز Cat C11 ACERT بقوة 262 حصان. كابينة مكيفة بالكامل مع نظام تحكم هيدروليكي فائق الدقة. إطارات بحالة 85% وسجل صيانة كامل لدى الوكيل.',
      description_en: 'Caterpillar 966H Wheel Loader in mint condition, ready for quarry operations and heavy earthmoving. Powered by Cat C11 ACERT engine delivering 262 HP. Fully air-conditioned cab, responsive joystick hydraulics, 85% tire tread life, and complete authorized dealer service history.',
      specs_ar: 'سعة الباكت: 4.2 متر مكعب | قوة المحرك: 262 حصان | الوزن التشغيلي: 23.7 طن | ساعات العمل: 4,800 ساعة | ناقل الحركة: أوتوماتيكي باورشيفت 4 سرعات | نوع الوقود: ديزل',
      specs_en: 'Bucket Capacity: 4.2 m³ | Engine Power: 262 HP | Operating Weight: 23.7 tonnes | Operating Hours: 4,800 hrs | Transmission: 4-speed Powershift | Fuel Type: Diesel',
      images: [
        'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1200&q=80',
      ]
    },
    {
      catSlug: 'wheel-loaders',
      name_ar: 'لودر كوماتسو Komatsu WA470-6',
      name_en: 'Komatsu WA470-6 Wheel Loader',
      slug: 'komatsu-wa470-6-loader',
      brand: 'Komatsu',
      model: 'WA470-6',
      year: '2019',
      price: '',
      price_type: 'contact',
      status: 'available',
      is_featured: 1,
      description_ar: 'لودر كوماتسو WA470 ياباني أصلي استيراد حديث بحالة المصنع. نظام توفير الوقود الذكي، كابينة واسعة برؤية بانورامية 360 درجة، محرك كوماتسو توربو فائق التحمل. فحص شامل للضفيرة والمنظومة الهيدروليكية.',
      description_en: 'Authentic Komatsu WA470-6 Japanese import in factory condition. Smart fuel-saving system, panoramic 360 cab visibility, high-endurance Komatsu turbocharged engine. Complete inspection of electrical and hydraulic systems.',
      specs_ar: 'سعة الباكت: 4.5 متر مكعب | قوة المحرك: 273 حصان | الوزن التشغيلي: 24.1 طن | ساعات العمل: 5,200 ساعة | الكاوتش: نظيف جداً | الفحص: فحص معتمد',
      specs_en: 'Bucket Capacity: 4.5 m³ | Engine Power: 273 HP | Operating Weight: 24.1 tonnes | Operating Hours: 5,200 hrs | Tires: Excellent condition | Inspection: Certified',
      images: [
        'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
      ]
    },
    {
      catSlug: 'excavators',
      name_ar: 'حفار كوماتسو مجنزر PC300-8',
      name_en: 'Komatsu PC300-8 Crawler Excavator',
      slug: 'komatsu-pc300-8-excavator',
      brand: 'Komatsu',
      model: 'PC300-8',
      year: '2021',
      price: '4800000',
      price_type: 'fixed',
      status: 'available',
      is_featured: 1,
      description_ar: 'حفار كوماتسو PC300 جيل 8 بحالة ممتازة جداً. مزود بخط جاك شاكوش جاهز للتركيب، جنزير عريض للأراضي الوعرة، ذراع حفر طويل مع باكت صخري مقوى. نظام تبريد استوائي مخصص للأجواء الحارة.',
      description_en: 'Komatsu PC300-8 hydraulic crawler excavator in pristine condition. Pre-piped for hydraulic breaker/hammer attachment, heavy-duty undercarriage tracks, heavy rock bucket with reinforced teeth. Tropical cooling package for desert heat.',
      specs_ar: 'عمق الحفر الأقصى: 7.3 متر | قوة المحرك: 260 حصان | الوزن التشغيلي: 31.6 طن | سعة الباكت: 1.6 متر مكعب | الشاكوش: خط هيدروليكي مجهز | ساعات التشغيل: 3,400 ساعة',
      specs_en: 'Max Digging Depth: 7.3 m | Engine Output: 260 HP | Operating Weight: 31.6 tonnes | Bucket Capacity: 1.6 m³ | Breaker Line: Pre-piped | Hours: 3,400 hrs',
      images: [
        'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1200&q=80',
      ]
    },
    {
      catSlug: 'excavators',
      name_ar: 'حفار كاتر بيلر CAT 330D2L',
      name_en: 'Caterpillar CAT 330D2L Hydraulic Excavator',
      slug: 'cat-330d2l-excavator',
      brand: 'Caterpillar',
      model: 'CAT 330D2L',
      year: '2018',
      price: '4200000',
      price_type: 'fixed',
      status: 'available',
      is_featured: 1,
      description_ar: 'حفار كاتر بيلر 330D2L عالي الكفاءة للأعمال الشاقة ومشاريع الطرق الكبرى. طلمبات هيدروليكية جديدة، محرك كات C7.1 بحالة الزيرو. تسليم فوري مع إمكانية المعاينة والتجربة الميدانية.',
      description_en: 'Caterpillar 330D2L heavy-duty hydraulic excavator designed for mega projects and quarry ripping. Brand-new hydraulic pumps, Cat C7.1 engine in top tier condition. Ready for immediate job-site delivery.',
      specs_ar: 'الوزن التشغيلي: 30.5 طن | المحرك: Cat C7.1 ACERT | قوة المحرك: 208 حصان | عمق الحفر: 6.9 متر | سعة الباكت: 1.8 متر مكعب | كابينة مشمولة: مكيف هواء رقمي',
      specs_en: 'Operating Weight: 30.5 tonnes | Engine: Cat C7.1 ACERT | Power: 208 HP | Dig Depth: 6.9 m | Bucket: 1.8 m³ | Cab: Digital Air Conditioning',
      images: [
        'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80',
      ]
    },
    {
      catSlug: 'bulldozers',
      name_ar: 'بلدوزر كاتر بيلر CAT D8R',
      name_en: 'Caterpillar D8R Heavy Track Bulldozer',
      slug: 'cat-d8r-bulldozer',
      brand: 'Caterpillar',
      model: 'CAT D8R',
      year: '2017',
      price: '',
      price_type: 'contact',
      status: 'available',
      is_featured: 1,
      description_ar: 'بلدوزر كاتر بيلر D8R جبار للأعمال الصخرية وتجهيز المواقع والردم الثقيل. مزود بريبار خلفي (تكسير صخور) وشفرة أمامية نصف دائرية بسعة عالية. جنازير مدعمة وسكينة جديدة.',
      description_en: 'Legendary Caterpillar D8R heavy bulldozer for earth pushing and site leveling. Equipped with rear single-shank rock ripper and semi-universal high-capacity blade. Heavy undercarriage and freshly replaced cutting edges.',
      specs_ar: 'قوة المحرك: 305 حصان | سعة الشفرة: 8.7 متر مكعب | الوزن الكلي: 38 طن | نوع الريبار: سنجل شاش صخري | ناقل الحركة: باورشيفت تروس كوكبية | الحالة: ممتازة',
      specs_en: 'Flywheel Power: 305 HP | Blade Capacity: 8.7 m³ | Operating Weight: 38 tonnes | Ripper Type: Heavy Single-Shank | Transmission: Planetary Powershift | Condition: Mint',
      images: [
        'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1200&q=80',
      ]
    },
    {
      catSlug: 'cranes',
      name_ar: 'ونش تلسكوبي تادانو TADANO GT-550E حمولة 55 طن',
      name_en: 'Tadano GT-550E 55-Ton Truck Crane',
      slug: 'tadano-gt550e-crane',
      brand: 'Tadano',
      model: 'GT-550E',
      year: '2019',
      price: '5900000',
      price_type: 'fixed',
      status: 'available',
      is_featured: 1,
      description_ar: 'ونش تادانو ياباني حمولة 55 طن على شاسيه شاحنة نيسان ديزل. بوم تلسكوبي من 5 أقسام بطول إجمالي 42 متراً بالإضافة إلى وصلة جيب 14 متر. كمبيوتر ونظام أمان أوتوماتيكي معتمد.',
      description_en: 'Tadano GT-550E 55-tonne capacity hydraulic truck crane. 5-section hexagonal boom extending up to 42 meters plus 14m lattice jib. Full electronic load moment indicator (AML) and certified wire ropes.',
      specs_ar: 'أقصى حمولة رفع: 55 طن عند 3 أمتار | طول البوم الرئيسي: 42 متر | طول الجيب: 14 متر | أقصى ارتفاع رفع: 56.5 متر | المحرك: ديزل نيسان 6 سلندر | فحص الرفع: شهادة معايرة سارية',
      specs_en: 'Max Lifting Capacity: 55t @ 3m | Main Boom Length: 42 m | Jib Length: 14 m | Max Tip Height: 56.5 m | Carrier Engine: Nissan Diesel 6-Cylinder | Certification: Valid Load Chart',
      images: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1200&q=80',
      ]
    },
    {
      catSlug: 'forklifts',
      name_ar: 'كلارك تويوتا ديزل Toyota 5 Ton',
      name_en: 'Toyota 5-Ton Diesel Forklift 8FD50N',
      slug: 'toyota-5-ton-forklift',
      brand: 'Toyota',
      model: '8FD50N',
      year: '2022',
      price: '1450000',
      price_type: 'fixed',
      status: 'available',
      is_featured: 0,
      description_ar: 'رافعة شوكية تويوتا ديزل حمولة 5 طن موديل حديث، شوك متحركة هايدروليك جانبي Side Shift، صاري تريبل بارتفاع رفع 4.5 متر، كاوتش سوليد مصمت مانع للثقوب.',
      description_en: 'Toyota 8FD50N 5-ton diesel forklift, equipped with hydraulic side-shifter, triplex mast with 4.5m lifting height, solid puncture-proof tires, and Toyota SAS safety system.',
      specs_ar: 'حمولة الرفع: 5000 كجم | ارتفاع الرفع: 4.5 متر | نوع المحرك: تويوتا ديزل 1KD | ناقل الحركة: أوتوماتيك | الإطارات: سوليد كاوتش مصمت | الإضافات: سايد شيفتر',
      specs_en: 'Load Capacity: 5000 kg | Mast Height: 4.5 m | Engine: Toyota Diesel 1KD | Transmission: Automatic | Tires: Solid Puncture-Proof | Attachments: Integrated Side Shift',
      images: [
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      ]
    },
  ];

  const insertEq = db.prepare(`
    INSERT INTO equipment (
      category_id, name_ar, name_en, slug, brand, model, year, price, price_type,
      description_ar, description_en, specs_ar, specs_en, status, is_featured, is_published, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
  `);

  const insertImg = db.prepare(`
    INSERT INTO equipment_images (equipment_id, image_path, sort_order, is_primary)
    VALUES (?, ?, ?, ?)
  `);

  sampleEquipment.forEach((eq, index) => {
    const catId = catMap[eq.catSlug] || null;
    const res = insertEq.run(
      catId, eq.name_ar, eq.name_en, eq.slug, eq.brand, eq.model, eq.year,
      eq.price, eq.price_type, eq.description_ar, eq.description_en,
      eq.specs_ar, eq.specs_en, eq.status, eq.is_featured
    );
    const eqId = res.lastInsertRowid;
    eq.images.forEach((img, i) => {
      insertImg.run(eqId, img, i, i === 0 ? 1 : 0);
    });
  });

  console.log('Seeded sample equipment');
}

console.log('Database seed complete!');
