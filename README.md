**Welcome to your Base44/spaizd project** 
...
**About**
Here is a full list of the current features of the site based on the current codebase:

Frontend/User-Facing Features:

Product Catalog: Users can browse products by categories (Tees, Hoodies, Outerwear, Pants, Headwear, Accessories) and sort them by Newest, Price: Low → High, and Price: High → Low.
Product Detail Pages (PDP): Detailed product views with multiple images, descriptions, materials, weight, origin, stock status, and size selection.
Shopping Cart ("Trim Room"):
Add/remove items from the cart.
Update item quantities.
Displays subtotal, shipping costs (free shipping over $150), and total.
Persistent cart across sessions (using local storage).
Checkout Process:
Collects shipping information (name, email, address, city, state, zip, country).
Order creation upon submission.
Order Confirmation Page: Displays a confirmation message after a successful order.
VIP Club Promotion:
Dedicated VIP page highlighting benefits (early access, exclusive drops, member pricing).
Newsletter signup for VIP waitlist.
Newsletter Subscription: Email signup form for general updates.
Dynamic Hero Section: Homepage banner with a countdown to the next drop and call-to-action buttons.
Featured Collection: Displays a curated selection of featured products on the homepage.
Responsive Design: Optimized for both mobile and desktop viewing.
Styling & UX:
"Trap-lux" cannabis-coded streetwear aesthetic.
Deep violet and neon purple color system with nebula-inspired accents.
Subtle ambient smoke wisps and scanner line animation.
framer-motion for subtle micro-interactions and transitions (e.g., hover effects, card animations).
Custom scrollbar styling.
"Scissors snip" animation on cart interaction.
Backend/Admin Features (Admin Panel):

Admin Login: Access restricted to users with role: admin.
Admin Layout: Dedicated navigation for admin sections.
Overview Dashboard: Provides statistics such as total products, orders, revenue, active drops, and recent orders.
Product Management (CRUD): Full functionality to add, edit, and delete products, including:
Product Name, URL Slug, Price, Compare At Price.
Category, Description, Materials, Weight, Origin.
Available Sizes, Product Images.
Stock Quantity, Badge (NEW, LIMITED, SOLD OUT, POPULAR), Featured status, Active status, SKU.
Drops Manager: Tool to quickly update product badges (NEW, LIMITED, SOLD OUT) and featured status.
Order Management: View all customer orders, including detailed item lists and shipping addresses.
Order Status Updates: Ability to change the status of orders (e.g., pending, confirmed, shipped, delivered, cancelled).

*This covers both the user-facing and administrative functionalities currently implemented.*

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)
