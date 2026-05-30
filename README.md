# SPAIZD Shopify Theme

This repository is a Shopify Online Store 2.0 Liquid theme. It does **not** use React, Vite, Next.js, app-generator exports, or a JavaScript build pipeline. Shopify renders the storefront with Liquid templates, JSON templates, editable sections, snippets, CSS, and vanilla JavaScript.

## Theme structure

The uploadable theme uses Shopify's standard directory structure:

- `assets/` — CSS, JavaScript, favicon, and bundled image assets.
- `config/` — Theme Editor global settings.
- `layout/` — the global `theme.liquid` shell.
- `locales/` — translation strings.
- `sections/` — Online Store 2.0 sections and section groups.
- `snippets/` — reusable Liquid snippets.
- `templates/` — JSON templates for home, product, collection, cart, pages, search, policy, and 404.
- `templates/customers/` — customer account/login templates.

## Local checks

```bash
npm run check
```

The check script validates required Shopify directories, JSON syntax, JSON template section references, Liquid schema JSON, and Theme Editor presets for reusable sections.

## Build an uploadable zip

```bash
npm run zip
```

This creates `dist/spaizd-shopify-theme.zip` containing only Shopify theme directories.

## Manual Shopify setup after upload

1. In Shopify Admin, go to **Online Store → Themes → Add theme → Upload zip file**.
2. Upload `dist/spaizd-shopify-theme.zip`.
3. Open **Customize** on the uploaded theme.
4. In the **Header** section, verify these defaults are present:
   - Brand name: `SPAIZD`
   - Logo link: `/`
   - Logo font: `system_ui`
   - Logo size: `32`
   - Letter spacing: `4`
   - Logo color: `#FFFFFF`
   - Navigation: Shop `/collections/all-products`, Drops `/pages/drops`, Visitors `/collections/visitors`, Explorers `/collections/explorers`, VIP `/pages/vip`, About `/pages/about`
   - Navigation alignment: `Right`
   - Navigation font size: `14`
   - Navigation spacing: `30`
   - Navigation color: `#C5D9C2`
   - Background: `#0A0A0F`
   - Border: `#2A2440`
   - Accent color 1: `#7B2FBE`
   - Accent color 2: `#39FF14`
   - Glitch effect opacity: `0.3`
5. Create or verify Shopify pages with these handles and assign the matching templates:
   - `about` → `page.about`
   - `drops` → `page.drops`
   - `vip` → `page.vip`
   - `contact` → `page.contact`
   - `size-guide` → `page.size-guide`
6. Create or verify collections with these handles:
   - `all-products`
   - `visitors`
   - `explorers`
7. Add products with variants and inventory, then assign products to the relevant collections.
8. Configure Shopify policies under **Settings → Policies**; the theme includes policy styling.
9. Configure social links and newsletter fallback email in the **Footer** section.
10. QA before publishing:
    - Product page loads and variants switch.
    - Add-to-cart opens the cart drawer.
    - Cart drawer quantity/remove controls update the cart.
    - Cart page update/remove works.
    - Checkout buttons route to Shopify checkout.
    - Mobile menu opens/closes and links navigate.
    - No horizontal scrolling on mobile.

## Shopify CLI workflow

If Shopify CLI is installed and authenticated:

```bash
shopify theme check
shopify theme dev --store your-store.myshopify.com
shopify theme push --unpublished --store your-store.myshopify.com
```
