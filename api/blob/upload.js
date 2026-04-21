import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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
    const formData = await req.json();
    const { file, folder = 'images' } = formData;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(file.split(',')[1], 'base64');
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/jpeg',
    });

    return res.status(200).json({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
}
