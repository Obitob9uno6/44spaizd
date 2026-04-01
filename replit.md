# SPAIZD — California Streetwear E-Commerce

## Architecture

This is a fullstack app running on Replit:

- **Frontend**: React + Vite (port 5000) with Tailwind CSS, dark theme, JetBrains Mono font
- **Backend**: Express.js API server (port 3001) with PostgreSQL
- **Database**: Replit PostgreSQL — `products`, `orders`, and `users` tables

## Development

```bash
npm run dev
```
Starts both servers concurrently:
- Vite dev server on port 5000 (with `/api` proxy to port 3001)
- Express API on port 3001

## Key Files

- `server/index.js` — Express API server with all REST routes (auth, payments, products, orders)
- `server/db.js` — PostgreSQL connection pool
- `src/api/client.js` — Frontend API client (fetch-based, sends JWT Bearer token)
- `src/lib/AuthContext.jsx` — React auth context with JWT stored in localStorage
- `src/components/AgeGate.jsx` — 21+ age verification modal (checked via localStorage)
- `src/components/GoogleSignIn.jsx` — Google OAuth button (requires GOOGLE_CLIENT_ID)
- `src/pages/Login.jsx` — Login page with Google social login
- `src/pages/Checkout.jsx` — Checkout with Stripe card payment
- `vite.config.js` — Vite config with proxy to backend; injects env vars via `define`
- `build-server.js` — esbuild script for production server bundle

## Environment Variables / Secrets

| Key | Purpose | Where |
|-----|---------|--------|
| `DATABASE_URL` | PostgreSQL connection string | Auto-set by Replit DB |
| `JWT_SECRET` | Signs user JWT tokens | Env var (auto-set) |
| `STRIPE_SECRET_KEY` | Stripe server-side key (`sk_...`) | Replit Secret |
| `STRIPE_PUBLISHABLE_KEY` | Stripe client-side key (`pk_...`) | Replit Secret |
| `ADMIN_PASSWORD` | Admin panel password (default: `spaizd2024`) | Env var |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Replit Secret (not yet set) |

> **Note**: Google social login is built but not yet activated. To enable it, add a `GOOGLE_CLIENT_ID` secret from console.cloud.google.com — create an OAuth 2.0 credential, add your Replit domain as an authorized origin, and set the secret. The `GoogleSignIn` component and `/api/auth/google` route are already implemented.

## API Routes

### Auth
- `POST /api/auth/google` — verify Google ID token, return JWT + user
- `GET /api/auth/me` — get current user (requires Bearer token)

### Payments
- `POST /api/payments/create-intent` — create Stripe PaymentIntent, returns `clientSecret`

### Products
- `GET /api/products` — list with optional `category`, `is_active`, `featured`, `sort`, `limit` query params
- `GET /api/products/:id` — single product
- `POST /api/products` — create product
- `PUT /api/products/:id` — update product
- `DELETE /api/products/:id` — delete product
- `PATCH /api/products/:id/stock` — update stock only

### Orders
- `GET /api/orders` — list orders
- `POST /api/orders` — create order (includes `payment_intent_id` field)
- `PUT /api/orders/:id` — update order status
- `DELETE /api/orders/:id` — delete order

### Admin Auth
- `POST /api/admin/login` — password check (set `ADMIN_PASSWORD` env var, defaults to `spaizd2024`)

## Features

### 21+ Age Gate
- Shown on first visit, dismissed result stored in `localStorage` key `spaizd_age_confirmed`
- "I AM UNDER 21" redirects user to google.com

### Social Login (Google)
- Google One Tap / button via `@/components/GoogleSignIn.jsx`
- Backend verifies Google ID token via `google-auth-library`
- Issues a 7-day JWT stored in `localStorage` as `spaizd_user_token`
- User object stored in `localStorage` as `spaizd_user`
- Navbar shows user avatar/name with sign-out dropdown when logged in

### Stripe Payments
- Stripe Elements `CardElement` embedded in checkout
- Flow: frontend creates PaymentIntent via `/api/payments/create-intent` → confirms card with Stripe → creates order record on success
- Gracefully falls back to manual order placement if `STRIPE_PUBLISHABLE_KEY` is not set

## Admin Panel

Visit `/admin` — protected by session password stored in `sessionStorage`.
Default password: `spaizd2024` (set `ADMIN_PASSWORD` environment variable to change).

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
