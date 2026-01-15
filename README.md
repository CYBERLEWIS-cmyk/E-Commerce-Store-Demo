# Lewis.Inc — E-Commerce Store (Portfolio Demo)

A premium, multi-page e-commerce storefront built with **HTML, CSS, and Vanilla JavaScript**.  
This project demonstrates a complete front-end shopping flow: browsing → product details → cart → checkout → order confirmation.

> Note: This is a **portfolio demo**. Payments are simulated and no real transactions occur.

---

## Live Pages

- `index.html` — Landing page + featured products
- `products.html` — All products + category chips + search + sorting
- `category.html` — Category-specific product listing
- `product.html` — Product detail page + wishlist + add to cart
- `checkout.html` — Checkout form + delivery options + dynamic totals
- `order-success.html` — Order confirmation + order summary snapshot

---

## Key Features

### Shopping Experience
- Product catalog with category browsing
- Search (routes to products page with query)
- Sorting:
    - **Newest**
    - **Price: Low → High**
    - **Price: High → Low**
- Product detail view with description and quick actions

### Cart + Checkout Flow
- Slide-out cart drawer from any page
- Quantity controls (+ / −) and remove items
- Subtotal updates in real-time
- Checkout page with:
    - Delivery options (Standard / Express)
    - Dynamic totals (subtotal + delivery)
- Order success page that renders an **order snapshot** saved before clearing cart

### Wishlist
- Heart icon on product cards
- Wishlist state saved using `localStorage`

---

## Tech Stack

- **HTML5**
- **CSS3** (responsive layout, premium UI styling)
- **Vanilla JavaScript** (modular file structure + state management)

No frameworks, no build tools.

---

## Project Structure

```txt
/
├─ index.html
├─ products.html
├─ category.html
├─ product.html
├─ checkout.html
├─ order-success.html
│
├─ css/
│  └─ style.css
│
└─ js/
   ├─ data.js     # Product + category data
   ├─ store.js    # Cart + wishlist logic (localStorage)
   ├─ ui.js       # Rendering + UI interactions (cart drawer, grids)
   └─ page.js     # Page routing/render logic per page
