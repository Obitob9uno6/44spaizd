import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import pool from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'spaizd-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

// Auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Optional auth — attaches user if token present, never blocks
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.slice(7), JWT_SECRET);
    } catch { /* ignore invalid token */ }
  }
  next();
}

// ── Image Upload ──────────────────────────────────────────
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// ── Google Auth ───────────────────────────────────────────
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Missing credential' });

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    if (!GOOGLE_CLIENT_ID) {
      return res.status(503).json({ error: 'Google auth not configured' });
    }

    const { OAuth2Client } = await import('google-auth-library');
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture: avatar } = payload;

    // Find or create user
    let result = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    let user;
    if (result.rows.length === 0) {
      const insert = await pool.query(
        `INSERT INTO users (google_id, email, name, avatar, provider)
         VALUES ($1, $2, $3, $4, 'google')
         ON CONFLICT (email) DO UPDATE SET google_id=$1, name=$3, avatar=$4, updated_date=NOW()
         RETURNING *`,
        [googleId, email, name, avatar]
      );
      user = insert.rows[0];
    } else {
      user = result.rows[0];
      await pool.query('UPDATE users SET name=$1, avatar=$2, updated_date=NOW() WHERE id=$3', [name, avatar, user.id]);
      user.name = name;
      user.avatar = avatar;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name, avatar FROM users WHERE id = $1', [req.user.userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ── Stripe Payments ───────────────────────────────────────
app.post('/api/payments/create-intent', async (req, res) => {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }
  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const { amount, currency = 'usd' } = req.body;
    if (!amount || amount < 50) return res.status(400).json({ error: 'Invalid amount' });
    const paymentIntent = await stripe.paymentIntents.create({ amount, currency });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// ── Email helper ──────────────────────────────────────────
function createMailTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587');
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

function escHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function sendOrderConfirmation(order, address) {
  const transport = createMailTransport();
  if (!transport) {
    console.log('[email] SMTP not configured — skipping order confirmation email');
    return;
  }
  const toEmail = address?.email;
  if (!toEmail) return;

  const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
  const itemRows = items.map(i =>
    `<tr><td style="padding:4px 8px">${escHtml(i.product_name || i.name)} (${escHtml(i.size)})</td><td style="padding:4px 8px;text-align:right">x${escHtml(i.quantity)}</td><td style="padding:4px 8px;text-align:right">$${(i.price * i.quantity).toFixed(2)}</td></tr>`
  ).join('');

  const addr = address;
  const addrLine = [addr.address, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).map(escHtml).join(', ');

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#111">
      <h2 style="letter-spacing:2px;font-size:18px">ORDER CONFIRMED</h2>
      <p style="color:#666;font-size:13px">Thanks for your order, ${escHtml(addr.name) || 'customer'}! Here's your summary:</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin:16px 0">
        <thead><tr style="border-bottom:2px solid #eee">
          <th style="padding:4px 8px;text-align:left">Item</th>
          <th style="padding:4px 8px;text-align:right">Qty</th>
          <th style="padding:4px 8px;text-align:right">Price</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr><td colspan="2" style="padding:4px 8px;text-align:right;color:#666">Subtotal</td><td style="padding:4px 8px;text-align:right">$${Number(order.subtotal).toFixed(2)}</td></tr>
          <tr><td colspan="2" style="padding:4px 8px;text-align:right;color:#666">Shipping</td><td style="padding:4px 8px;text-align:right">$${Number(order.shipping).toFixed(2)}</td></tr>
          <tr style="font-weight:bold"><td colspan="2" style="padding:8px 8px;text-align:right">Total</td><td style="padding:8px 8px;text-align:right">$${Number(order.total).toFixed(2)}</td></tr>
        </tfoot>
      </table>
      <p style="font-size:13px;color:#444"><strong>Ship to:</strong><br/>${addrLine}</p>
      <p style="font-size:11px;color:#999;margin-top:24px">SPAIZD — Good Vibes, Better Fits</p>
    </div>`;

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || `"SPAIZD" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `SPAIZD Order #${order.id} Confirmed`,
      html,
    });
    console.log(`[email] Order confirmation sent to ${toEmail}`);
  } catch (err) {
    console.error('[email] Failed to send confirmation:', err.message);
  }
}

// ── Subscribers ───────────────────────────────────────────
app.post('/api/subscribers', async (req, res) => {
  try {
    const { email, source = 'newsletter' } = req.body;
    if (!email?.trim()) return res.status(400).json({ error: 'Email required' });
    await pool.query(
      `INSERT INTO subscribers (email, source) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET is_active = true`,
      [email.trim().toLowerCase(), source]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

app.get('/api/subscribers', adminAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subscribers ORDER BY created_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

// ── Reviews ───────────────────────────────────────────────
// Admin: get all reviews with product name
app.get('/api/reviews', adminAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, p.name AS product_name
      FROM reviews r
      LEFT JOIN products p ON p.id = r.product_id
      ORDER BY r.created_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Admin: approve a review
app.patch('/api/reviews/:id/approve', adminAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE reviews SET approved = true WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve review' });
  }
});

// Admin: delete any review by id
app.delete('/api/reviews/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Public: get product reviews (filtered by approved when moderation is on)
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const settingResult = await pool.query(
      "SELECT value FROM settings WHERE key = 'reviews_require_approval'"
    );
    const moderationOn = settingResult.rows[0]?.value === 'true';
    const query = moderationOn
      ? 'SELECT * FROM reviews WHERE product_id = $1 AND approved = true ORDER BY created_date DESC'
      : 'SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_date DESC';
    const result = await pool.query(query, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const { reviewer_name, rating, comment } = req.body;
    if (!reviewer_name?.trim()) return res.status(400).json({ error: 'Name required' });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1–5' });

    const settingResult = await pool.query(
      "SELECT value FROM settings WHERE key = 'reviews_require_approval'"
    );
    const moderationOn = settingResult.rows[0]?.value === 'true';
    const approved = !moderationOn;

    const result = await pool.query(
      `INSERT INTO reviews (product_id, reviewer_name, rating, comment, approved)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.params.id, reviewer_name.trim(), parseInt(rating), comment?.trim() || '', approved]
    );
    const review = result.rows[0];
    if (!approved) {
      return res.status(201).json({ ...review, _pending_approval: true });
    }
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

app.delete('/api/products/:productId/reviews/:reviewId', async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = $1 AND product_id = $2', [req.params.reviewId, req.params.productId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// ── Products ─────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const { category, is_active, featured, sort = '-created_date', limit = 100 } = req.query;
    let where = [];
    let values = [];
    let idx = 1;

    if (category !== undefined && category !== '') {
      where.push(`category = $${idx++}`);
      values.push(category);
    }
    if (is_active !== undefined) {
      where.push(`is_active = $${idx++}`);
      values.push(is_active === 'true');
    }
    if (featured !== undefined) {
      where.push(`featured = $${idx++}`);
      values.push(featured === 'true');
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    let orderBy = 'created_date DESC';
    if (sort === 'price') orderBy = 'price ASC';
    else if (sort === '-price') orderBy = 'price DESC';
    else if (sort === 'created_date') orderBy = 'created_date ASC';
    else if (sort === 'name') orderBy = 'name ASC';
    else if (sort === 'stock') orderBy = 'stock ASC';

    const query = `SELECT * FROM products ${whereClause} ORDER BY ${orderBy} LIMIT $${idx}`;
    values.push(parseInt(limit));

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const {
      name, slug, price, compare_price, category, description,
      materials, weight, sizes, images, stock, badge, featured,
      is_active, sku, origin
    } = req.body;
    const result = await pool.query(
      `INSERT INTO products
        (name, slug, price, compare_price, category, description, materials, weight,
         sizes, images, stock, badge, featured, is_active, sku, origin)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [name, slug || '', price || 0, compare_price || null, category || 'tees',
       description || '', materials || '', weight || '', JSON.stringify(sizes || []),
       JSON.stringify(images || []), stock || 0, badge || '', featured || false,
       is_active !== false, sku || '', origin || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const {
      name, slug, price, compare_price, category, description,
      materials, weight, sizes, images, stock, badge, featured,
      is_active, sku, origin
    } = req.body;
    const result = await pool.query(
      `UPDATE products SET
        name=$1, slug=$2, price=$3, compare_price=$4, category=$5,
        description=$6, materials=$7, weight=$8, sizes=$9, images=$10,
        stock=$11, badge=$12, featured=$13, is_active=$14, sku=$15, origin=$16,
        updated_date=NOW()
       WHERE id=$17 RETURNING *`,
      [name, slug || '', price || 0, compare_price || null, category || 'tees',
       description || '', materials || '', weight || '', JSON.stringify(sizes || []),
       JSON.stringify(images || []), stock || 0, badge || '', featured || false,
       is_active !== false, sku || '', origin || '', req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.patch('/api/products/:id/stock', async (req, res) => {
  try {
    const { stock } = req.body;
    const result = await pool.query(
      'UPDATE products SET stock=$1, updated_date=NOW() WHERE id=$2 RETURNING *',
      [parseInt(stock) || 0, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// ── Orders ────────────────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const { sort = '-created_date', limit = 200, status } = req.query;
    let where = [];
    let values = [];
    let idx = 1;

    if (status) {
      where.push(`status = $${idx++}`);
      values.push(status);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    let orderBy = 'created_date DESC';
    if (sort === 'created_date') orderBy = 'created_date ASC';
    if (sort === '-total') orderBy = 'total DESC';

    values.push(parseInt(limit));
    const result = await pool.query(
      `SELECT * FROM orders ${whereClause} ORDER BY ${orderBy} LIMIT $${idx}`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', optionalAuth, async (req, res) => {
  try {
    const { items, subtotal, shipping, total, status, shipping_address, payment_intent_id } = req.body;
    const userId = req.user?.userId || null;
    const result = await pool.query(
      `INSERT INTO orders (items, subtotal, shipping, total, status, shipping_address, user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [JSON.stringify(items || []), subtotal || 0, shipping || 0,
       total || 0, status || 'pending', JSON.stringify(shipping_address || {}), userId]
    );

    if (items && items.length > 0) {
      for (const item of items) {
        if (item.product_id && item.quantity) {
          await pool.query(
            `UPDATE products SET stock = GREATEST(stock - $1, 0), updated_date = NOW() WHERE id = $2`,
            [parseInt(item.quantity), item.product_id]
          );
        }
      }
    }

    const order = result.rows[0];
    const addr = typeof shipping_address === 'string' ? JSON.parse(shipping_address) : (shipping_address || {});
    sendOrderConfirmation(order, addr).catch(() => {});

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Public order lookup by email + order id
app.get('/api/orders/lookup', async (req, res) => {
  try {
    const { email, id } = req.query;
    if (!email?.trim() || !id) return res.status(400).json({ error: 'email and id are required' });
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) return res.status(400).json({ error: 'id must be a positive integer' });
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [numericId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = result.rows[0];
    const addr = typeof order.shipping_address === 'string'
      ? JSON.parse(order.shipping_address)
      : (order.shipping_address || {});
    if (!addr.email || addr.email.toLowerCase() !== email.trim().toLowerCase()) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to lookup order' });
  }
});

// Get logged-in user's own orders
app.get('/api/orders/my', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_date DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE orders SET status=$1, updated_date=NOW() WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM orders WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// ── Admin auth ────────────────────────────────────────────
function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Admin auth required' });
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
}

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'spaizd2024';
  if (password === adminPassword) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ success: true, role: 'admin', token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// ── Settings ──────────────────────────────────────────────
// Public: get one or all settings
app.get('/api/settings', async (req, res) => {
  try {
    const { key } = req.query;
    if (key) {
      const result = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
      if (result.rows.length === 0) return res.json({ value: null });
      return res.json({ value: result.rows[0].value });
    }
    const result = await pool.query('SELECT key, value FROM settings ORDER BY key');
    const settings = {};
    for (const row of result.rows) settings[row.key] = row.value;
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Admin-only: set a setting
app.post('/api/settings', adminAuthMiddleware, async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key?.trim()) return res.status(400).json({ error: 'key is required' });
    const safeValue = value ?? '';
    // Validate ISO date format for time-based settings
    if (key.trim() === 'next_drop_at' && safeValue !== '') {
      const ts = new Date(safeValue).getTime();
      if (isNaN(ts)) return res.status(400).json({ error: 'next_drop_at must be a valid ISO date string' });
    }
    await pool.query(
      `INSERT INTO settings (key, value, updated_date) VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_date = NOW()`,
      [key.trim(), safeValue]
    );
    res.json({ success: true, key: key.trim(), value: safeValue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save setting' });
  }
});

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        source VARCHAR(50) NOT NULL DEFAULT 'newsletter',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_date TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('[db] subscribers table ready');

    await pool.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
    `);
    console.log('[db] orders.user_id column ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_date TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log('[db] settings table ready');

    await pool.query(`
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT true
    `);
    console.log('[db] reviews.approved column ready');
  } catch (err) {
    console.error('[db] init error:', err.message);
  }
}

initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});
