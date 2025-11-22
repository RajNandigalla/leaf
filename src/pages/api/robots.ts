import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`;

  const robotsTxt = `
        # Allow all crawlers
        User-agent: *
        Allow: /
        
        # Sitemap location
        Sitemap: ${baseUrl}/api/sitemap.xml
    `
    .replace(/^\s+/gm, '')
    .trim();

  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(robotsTxt);
}
