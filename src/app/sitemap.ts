import { MetadataRoute } from 'next';
import getDb from '@/lib/db';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://altayeb-heavyequipment.com';
  const db = getDb();

  const equipment = db
    .prepare('SELECT slug, updated_at FROM equipment WHERE is_published = 1')
    .all() as Array<{ slug: string; updated_at: string }>;

  const categories = db
    .prepare('SELECT slug FROM categories WHERE is_active = 1')
    .all() as Array<{ slug: string }>;

  const equipmentUrls = equipment.map((item) => ({
    url: `${baseUrl}/equipment/${item.slug}`,
    lastModified: new Date(item.updated_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/equipment`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/request`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...categoryUrls,
    ...equipmentUrls,
  ];
}
