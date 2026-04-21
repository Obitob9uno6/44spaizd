import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    const { prefix = 'images/' } = req.query;
    
    const { blobs } = await list({ prefix });

    const files = blobs.map((blob) => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
      filename: blob.pathname.split('/').pop() || 'unknown',
    }));

    return res.status(200).json({ files });
  } catch (error) {
    console.error('List error:', error);
    return res.status(500).json({ error: 'Failed to list files', details: error.message });
  }
}
