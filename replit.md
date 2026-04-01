# SPAIZD — California Streetwear E-Commerce

## Architecture

This is a fullstack app running on Replit:

- **Frontend**: React + Vite (port 5000) with Tailwind CSS, dark theme, JetBrains Mono font
- **Backend**: Express.js API server (port 3001) with PostgreSQL
- **Database**: Replit PostgreSQL — `products` and `orders` tables

## Development

```bash
npm run dev
```
Starts both servers concurrently:
- Vite dev server on port 5000 (with `/api` proxy to port 3001)
- Express API on port 3001

## Key Files

- `server/index.js` — Express API server with all REST routes
- `server/db.js` — PostgreSQL connection pool
- `src/api/client.js` — Frontend API client (fetch-based)
- `vite.config.js` — Vite config with proxy to backend
- `build-server.js` — esbuild script for production server bundle

## API Routes

### Products
- `GET /api/products` — list with optional `category`, `is_active`, `featured`, `sort`, `limit` query params
- `GET /api/products/:id` — single product
- `POST /api/products` — create product
- `PUT /api/products/:id` — update product
- `DELETE /api/products/:id` — delete product

### Orders
- `GET /api/orders` — list orders
- `POST /api/orders` — create order
- `PUT /api/orders/:id` — update order status

### Admin Auth
- `POST /api/admin/login` — password check (set `ADMIN_PASSWORD` env var, defaults to `admin123`)

## Admin Panel

Visit `/admin` — protected by session password stored in `sessionStorage`.
Default password: `admin123` (set `ADMIN_PASSWORD` environment variable to change).

## Cart

Cart uses localStorage only (`src/lib/cartStore.js`) — no server-side cart.

## Build for Production

```bash
npm run build
npm start
```

The Express server in production serves:
- API routes at `/api/*`
- Static frontend files from `dist/public/`
