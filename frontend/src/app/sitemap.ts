import { MetadataRoute } from 'next';
import { catalogApi } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

  let products = [];
  try {
    const res = await catalogApi.getProducts({ take: 1000 });
    products = res.items || [];
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error);
  }

  const productUrls = products.map((product: any) => ({
    url: `${baseUrl}/shop/${product.id}`,
    lastModified: new Date(product.updatedAt || product.createdAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productUrls,
  ];
}
