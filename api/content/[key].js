import { put, get } from '@vercel/blob';

// Get or update content stored as JSON in Blob
export default async function handler(req, res) {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ error: 'Missing content key' });
  }

  // GET - retrieve content
  if (req.method === 'GET') {
    try {
      const contentPath = `content/${key}.json`;
      const result = await get(contentPath, { access: 'public' });

      if (!result) {
        // Return default empty content if not found
        return res.status(200).json({ key, data: {} });
      }

      const content = JSON.parse(await result.blob.text());
      return res.status(200).json({ key, data: content });
    } catch (error) {
      console.error('Get content error:', error);
      return res.status(200).json({ key, data: {} }); // Return empty on error
    }
  }

  // POST - update content
  if (req.method === 'POST') {
    // Verify admin authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.slice(7);
    const adminToken = req.headers['x-admin-token'] || process.env.ADMIN_TOKEN;

    if (token !== adminToken) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    try {
      const { data } = req.body;

      if (!data) {
        return res.status(400).json({ error: 'No data provided' });
      }

      const contentPath = `content/${key}.json`;
      const jsonContent = JSON.stringify(data, null, 2);
      const buffer = Buffer.from(jsonContent);

      const blob = await put(contentPath, buffer, {
        access: 'public',
        contentType: 'application/json',
      });

      return res.status(200).json({
        key,
        data,
        saved: true,
        pathname: blob.pathname,
      });
    } catch (error) {
      console.error('Save content error:', error);
      return res.status(500).json({ error: 'Failed to save content', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
