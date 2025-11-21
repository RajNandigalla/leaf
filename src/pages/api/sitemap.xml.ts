import { NextApiRequest, NextApiResponse } from 'next';
import { env } from '@/utils/env';

export default function sitemap(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = env('NEXT_PUBLIC_BASE_URL');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Add more URLs as your application grows -->
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
}
