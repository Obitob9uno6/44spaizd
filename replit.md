# SPAIZD — California Cannabis-Inspired Streetwear E-Commerce

> "Good Vibes, Better Fits" — Premium cannabis-inspired streetwear for the cultivation community.

## Architecture

Fullstack app running on Replit:

- **Frontend**: React + Vite (port 5000) with Tailwind CSS, dark theme, JetBrains Mono font
- **Backend**: Express.js API server (port 3001) with PostgreSQL
- **Database**: Replit PostgreSQL — `products`, `orders`, `users`, `subscribers`, `settings`, `reviews`, `promo_codes` tables

## Development

```bash
npm run dev
```
Starts both servers concurrently:
- Vite dev server on port 5000 (with `/api` proxy to port 3001)
- Express API on port 3001

## Key Files

- `server/index.js` — Express API server with all REST routes (auth, payments, products, orders, promo codes, settings, reviews, subscribers, users, AI chat)
- `src/components/ChatWidget.jsx` — Floating AI customer service chatbot widget (OpenAI-powered via Replit AI Integrations)
- `server/db.js` — PostgreSQL connection pool
- `src/api/client.js` — Frontend API client (fetch-based, sends JWT Bearer token)
- `src/lib/AuthContext.jsx` — React auth context with JWT stored in localStorage
- `src/lib/cartStore.js` — Client-side cart (localStorage)
- `src/lib/wishlistStore.js` — Client-side wishlist (localStorage)
- `src/components/AgeGate.jsx` — 21+ age verification modal (checked via localStorage)
- `src/components/Navbar.jsx` — Main navigation with dropdown menus (Shop, Drops), drop countdown banner, wishlist/cart icons
- `src/components/PageHero.jsx` — Reusable page hero with unique cannabis plant background images per page
- `src/components/CannabisBackground.jsx` — Subtle cannabis leaf watermark background across all pages
- `src/components/SmokeOverlay.jsx` — Canvas-based particle smoke effect (18 particles, scroll-reactive)
- `src/components/CartPanel.jsx` — Slide-out cart panel with drying rack background image
- `src/components/icons/CannabisLeaf.jsx` — Custom cannabis leaf icon (PNG with CSS filters for coloring)
- `src/components/GoogleSignIn.jsx` — Google OAuth button (requires GOOGLE_CLIENT_ID)
- `src/pages/Checkout.jsx` — Checkout with Stripe card payment and promo code support
- `vite.config.js` — Vite config with proxy to backend; injects env vars via `define`
- `build-server.js` — esbuild script for production server bundle

## Pages

| Route | Page | Hero Image |
|-------|------|------------|
| `/` | Home | Original hero image (external URL) |
| `/shop` | Shop (filterable catalog) | Grow room under lights (weed1) |
| `/product/:id` | Product detail | — |
| `/drops` | Drops (upcoming/out now tabs) | Blue-toned plant (weed62) |
| `/about` | About (story, mission, values) | Dark purple frosty bud (weed6) |
| `/vip` | VIP Club (tiers, perks) | Autumn-toned bud (weed14) |
| `/wishlist` | Wishlist (saved items) | Trichome macro (weed2) |
| `/checkout` | Checkout | — |
| `/order-confirmation` | Order confirmation | — |
| `/login` | Login (Google OAuth) | — |
| `/account/orders` | User order history | — |
| `/order-lookup` | Order lookup by email | — |
| `/privacy` | Privacy policy | — |
| `/terms` | Terms of service | — |
| `/connect` | Connect (social links) | Dark purple frosty bud (weed6) |
| `/shipping` | Shipping & returns | — |
| `/admin` | Admin panel | — |

## Environment Variables / Secrets

| Key | Purpose | Where |
|-----|---------|--------|
| `DATABASE_URL` | PostgreSQL connection string | Auto-set by Replit DB |
| `JWT_SECRET` | Signs user JWT tokens | Env var (auto-set) |
| `STRIPE_SECRET_KEY` | Stripe server-side key (`sk_...`) | Replit Secret |
| `STRIPE_PUBLISHABLE_KEY` | Stripe client-side key (`pk_...`) | Replit Secret |
| `ADMIN_PASSWORD` | Admin panel password (default: `spaizd2024`) | Env var |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Replit Secret (not yet set) |
| `SMTP_HOST` | Email SMTP host | Env var (optional) |
| `SMTP_USER` | Email SMTP username | Env var (optional) |
| `SMTP_PASS` | Email SMTP password | Env var (optional) |
| `SMTP_PORT` | Email SMTP port | Env var (optional) |

## API Routes

### Auth
- `POST /api/auth/google` — verify Google ID token, return JWT + user
- `GET /api/auth/me` — get current user (requires Bearer token)

### Payments
- `POST /api/payments/create-intent` — create Stripe PaymentIntent, returns `clientSecret`

### Products (admin-protected: POST/PUT/DELETE/PATCH)
- `GET /api/products` — list with optional `category`, `is_active`, `featured`, `sort`, `limit` query params
- `GET /api/products/:id` — single product
- `POST /api/products` — create product
- `PUT /api/products/:id` — update product
- `DELETE /api/products/:id` — delete product
- `PATCH /api/products/:id/stock` — update stock only

### Orders (admin-protected: GET list, PUT, DELETE)
- `GET /api/orders` — list orders
- `GET /api/orders/lookup?email=` — lookup by email
- `GET /api/orders/user` — user's own orders (requires auth)
- `POST /api/orders` — create order (server-authoritative pricing, promo validation with row locking)
- `PUT /api/orders/:id` — update order status
- `DELETE /api/orders/:id` — delete order

### Promo Codes (all admin-protected)
- `GET /api/promo-codes` — list all
- `POST /api/promo-codes` — create
- `PUT /api/promo-codes/:id` — update
- `DELETE /api/promo-codes/:id` — delete
- `POST /api/promo-codes/validate` — validate a code (public)

### Settings
- `GET /api/settings/:key` — get a setting value
- `PUT /api/settings/:key` — set a setting value (admin-protected)

### Reviews
- `GET /api/reviews/:productId` — get approved reviews for a product
- `POST /api/reviews` — submit a review
- `GET /api/reviews` — list all reviews (admin)
- `PATCH /api/reviews/:id/approve` — approve/reject a review (admin)
- `DELETE /api/reviews/:id` — delete a review (admin)

### Subscribers
- `POST /api/subscribers` — subscribe email
- `GET /api/subscribers` — list (admin)
- `DELETE /api/subscribers/:id` — delete (admin)

### Users (admin-protected)
- `GET /api/users` — list all users

### Admin Auth
- `POST /api/admin/login` — password check (default: `spaizd2024`)

### Uploads (admin-protected)
- `POST /api/upload` — upload product image

## Features

### 21+ Age Gate
- Shown on first visit, dismissed result stored in `localStorage` key `spaizd_age_confirmed`
- "I AM UNDER 21" redirects user to google.com

### Navigation
- Dropdown menus for SHOP (Tees, Hoodies, Outerwear) and DROPS (Upcoming, Out Now)
- Top-level links: CONNECT, VIP CLUB, ABOUT
- Drop countdown banner fixed under navbar (shows when a drop is scheduled or live)
- Cannabis leaf icon for wishlist, scissors icon for cart ("Trim Room")

### Cannabis Theming
- Custom cannabis leaf icon (PNG) replaces heart icon for wishlist throughout the site
- Unique high-def cannabis plant photos as hero backgrounds per page
- Subtle cannabis leaf watermark overlay across all pages
- Canvas-based organic smoke particle effect
- Drying rack background image in cart panel

### Social Login (Google)
- Google One Tap / button via `@/components/GoogleSignIn.jsx`
- Backend verifies Google ID token via `google-auth-library`
- Issues a 7-day JWT stored in `localStorage` as `spaizd_user_token`

### Stripe Payments
- Stripe Elements `CardElement` embedded in checkout
- Flow: frontend creates PaymentIntent → confirms card → creates order record on success
- Gracefully falls back to manual order placement if Stripe keys not set

### Promo Codes
- Admin CRUD for promo codes (percent or flat discount, expiration, max uses)
- Server-side validation with `FOR UPDATE` row locking to prevent race conditions
- Applied at checkout with real-time discount preview

### Wishlist
- Client-side localStorage with cannabis leaf icon
- Syncs product data from server on page load

### Reviews
- User-submitted reviews with star ratings
- Admin approval workflow before public display

### Email Notifications
- Order confirmation emails via SMTP (graceful no-op if not configured)

## Admin Panel

Visit `/admin` — protected by session password stored in `sessionStorage`.
Default password: `spaizd2024` (set `ADMIN_PASSWORD` environment variable to change).

Admin pages: Overview, Products, Drops, Inventory, Orders, Subscribers, Reviews, Promo Codes, Users, Store Settings.

All admin API endpoints are secured with `adminAuthMiddleware` (JWT with `role==='admin'`).

## Cart

Cart uses localStorage only (`src/lib/cartStore.js`) — no server-side cart. Cart icon is a scissors ("Trim Room" theme).

## Build for Production

```bash
npm run build
npm start
```

The Express server in production serves:
- API routes at `/api/*`
- Static frontend files from `dist/public/`
