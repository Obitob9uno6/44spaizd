import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import pool from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

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

// ── Image Upload ──────────────────────────────────────────
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
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

// Bulk stock update
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

app.post('/api/orders', async (req, res) => {
  try {
    const { items, subtotal, shipping, total, status, shipping_address } = req.body;
    const result = await pool.query(
      `INSERT INTO orders (items, subtotal, shipping, total, status, shipping_address)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [JSON.stringify(items || []), subtotal || 0, shipping || 0,
       total || 0, status || 'pending', JSON.stringify(shipping_address || {})]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
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
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'spaizd2024';
  if (password === adminPassword) {
    res.json({ success: true, role: 'admin' });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
