import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'spaizd-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

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

// Admin auth middleware
function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    if (!decoded.isAdmin) return res.status(403).json({ error: 'Forbidden' });
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Optional auth
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.slice(7), JWT_SECRET);
    } catch { /* ignore */ }
  }
  next();
}

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

app.delete('/api/subscribers/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM subscribers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete subscriber' });
  }
});

// ── Users (admin) ─────────────────────────────────────────
app.get('/api/users', adminAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, avatar, created_date FROM users ORDER BY created_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ── Reviews ───────────────────────────────────────────────
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

app.delete('/api/reviews/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

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
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

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

app.delete('/api/products/:productId/reviews/:reviewId', adminAuthMiddleware, async (req, res) => {
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

app.post('/api/products', adminAuthMiddleware, async (req, res) => {
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

app.put('/api/products/:id', adminAuthMiddleware, async (req, res) => {
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

app.delete('/api/products/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.patch('/api/products/:id/stock', adminAuthMiddleware, async (req, res) => {
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
app.get('/api/orders', adminAuthMiddleware, async (req, res) => {
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
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { items, subtotal, shipping, status, shipping_address, payment_intent_id, promo_code } = req.body;
    const userId = req.user?.userId || null;

    // Calculate totals
    let calcSubtotal = 0;
    for (const item of items) {
      const productResult = await client.query('SELECT price FROM products WHERE id = $1', [item.product_id]);
      if (productResult.rows.length === 0) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      calcSubtotal += productResult.rows[0].price * item.quantity;
    }

    const calcShipping = shipping || 0;
    const total = calcSubtotal + calcShipping;

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, items, subtotal, shipping, total, status, shipping_address, payment_intent_id, promo_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, JSON.stringify(items), calcSubtotal, calcShipping, total, status || 'pending', 
       JSON.stringify(shipping_address), payment_intent_id || null, promo_code || null]
    );

    // Decrement stock
    for (const item of items) {
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(orderResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
});

app.get('/api/orders/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

app.patch('/api/orders/:id/status', adminAuthMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_date = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ── Settings ──────────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings');
    const settings = {};
    for (const row of result.rows) {
      settings[row.key] = row.value;
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', adminAuthMiddleware, async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2`,
        [key, String(value)]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ── Admin Auth ────────────────────────────────────────────
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const admin = result.rows[0];
    // Simple password check (in production, use bcrypt)
    if (admin.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/admin/me', adminAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name FROM admins WHERE id = $1', [req.user.adminId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Admin not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admin' });
  }
});

// ── Promo Codes ───────────────────────────────────────────
app.get('/api/promo-codes', adminAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM promo_codes ORDER BY created_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch promo codes' });
  }
});

app.post('/api/promo-codes', adminAuthMiddleware, async (req, res) => {
  try {
    const { code, discount_type, discount_value, min_order, max_uses, expires_at, is_active } = req.body;
    const result = await pool.query(
      `INSERT INTO promo_codes (code, discount_type, discount_value, min_order, max_uses, expires_at, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [code.toUpperCase(), discount_type, discount_value, min_order || 0, max_uses || null, expires_at || null, is_active !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create promo code' });
  }
});

app.post('/api/promo-codes/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const result = await pool.query(
      'SELECT * FROM promo_codes WHERE code = $1 AND is_active = true',
      [code.toUpperCase()]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid promo code' });
    }
    const promo = result.rows[0];
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Promo code expired' });
    }
    if (promo.max_uses && promo.uses >= promo.max_uses) {
      return res.status(400).json({ error: 'Promo code usage limit reached' });
    }
    if (promo.min_order && subtotal < promo.min_order) {
      return res.status(400).json({ error: `Minimum order $${promo.min_order} required` });
    }
    res.json(promo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to validate promo code' });
  }
});

app.delete('/api/promo-codes/:id', adminAuthMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM promo_codes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete promo code' });
  }
});

// ── Analytics ─────────────────────────────────────────────
app.get('/api/analytics/summary', adminAuthMiddleware, async (req, res) => {
  try {
    const [ordersRes, usersRes, productsRes, revenueRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM orders'),
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM products WHERE is_active = true'),
      pool.query("SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE status != 'cancelled'"),
    ]);
    res.json({
      total_orders: parseInt(ordersRes.rows[0].count),
      total_users: parseInt(usersRes.rows[0].count),
      active_products: parseInt(productsRes.rows[0].count),
      total_revenue: parseFloat(revenueRes.rows[0].revenue),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel serverless
export default app;
