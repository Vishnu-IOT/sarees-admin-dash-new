# Boutique Admin — Sarees E‑commerce Admin Panel

A full admin dashboard for the `sarees-ecommerce-api` backend. Built with
plain React + React Router + hand-written CSS — no Tailwind, no Bootstrap,
no UI kit. No charting library either: the dashboard's bar chart and donut
chart are small hand-rolled SVG/CSS components.

## What's inside

- **Dashboard** — revenue, order, product and customer stats, a 7‑day
  orders chart, an order-status donut, top categories, recent orders, and
  a low-stock callout. All computed client-side from the existing list
  endpoints (see "About analytics" below).
- **Products** — list with category/status filters, search, pagination,
  and a full create/edit form (category, subcategory, pricing, stock,
  saree-specific fields like color/material/pattern/length, up to 4 image
  URLs, status, "new arrival" flag).
- **Categories** & **Subcategories** — list, create, edit, delete, with
  the same "can't delete while it has products" rule your backend
  enforces surfaced clearly in the delete dialog.
- **Orders** — list with status/payment filters, and a detail page with
  an order-status stepper, line items, amount breakdown, customer info,
  shipping address, and actions to update order status, payment status,
  and tracking number (all three are separate PATCH endpoints on your
  backend, wired up as such).
- **Customers** — list, create, edit, delete, and a detail page showing
  a customer's order history and total spend.

## Getting started

```bash
npm install
cp .env.example .env
# edit .env to point at your running backend, e.g.:
# VITE_API_BASE_URL=http://localhost:3000/api
npm run dev
```

The app runs on `http://localhost:5173` by default and expects your
`sarees-ecommerce-api` backend to be running and reachable at
`VITE_API_BASE_URL`. Make sure the backend's CORS is open to the admin
panel's origin (it already uses `app.use(cors())` with no restrictions,
so this should work out of the box).

## About the login screen — please read

**Your backend has no authentication system.** Every route in
`userRoutes.js`, `productRoutes.js`, etc. is open to anyone who can reach
the API — there's no login endpoint, no tokens, no sessions.

So this admin panel's login screen is a **client-side-only gate**, not
real security. It checks the email/password you type against
`VITE_ADMIN_EMAIL` / `VITE_ADMIN_PASSWORD` in your `.env` file, and if
they match, stores a flag in `localStorage` so you stay signed in. That's
it — it doesn't call the backend, and it doesn't stop someone from
calling your API directly with a tool like `curl` or Postman.

This is fine for local development or a trusted internal network, but
**before you put this online, add real authentication to the backend**:

1. Add an `is_admin` (or similar) flag to the `User` model, or a separate
   `Admin` model/table.
2. Add a `POST /api/auth/login` route that checks a hashed password
   (e.g. with `bcrypt`) and returns a signed JWT (e.g. with
   `jsonwebtoken`).
3. Add middleware that verifies that JWT on every admin-only route, and
   apply it to the routes this panel calls for writes (`POST`, `PUT`,
   `PATCH`, `DELETE`).
4. In this panel, replace `src/context/AuthContext.jsx`'s `login()` with
   a real call to `/api/auth/login`, store the returned token instead of
   a local flag, and add an `Authorization: Bearer <token>` header in
   `src/api/client.js`.

## About analytics

There's no `/api/analytics` endpoint in the backend, so the Dashboard
pulls the existing `GET /api/products`, `/api/orders`, `/api/users` and
`/api/categories` endpoints (with a generous `limit`) and aggregates the
results in the browser. This works well for a small-to-medium catalogue.
If your data grows large, it's worth adding a real analytics endpoint to
the backend that does these aggregations in SQL instead.

## Project structure

```
src/
  api/            One file per backend resource — thin wrappers around axios,
                   matching each route file's exact endpoints and params.
  components/     Shared building blocks (Sidebar, Topbar, Modal, DataTable
                   bits, Badge, Pagination, charts, icons, etc.)
  context/         AuthContext (see above) and ToastContext (notifications).
  pages/          One folder per resource, each with a *List page and, where
                   relevant, a *Form modal or a *Detail page.
  styles/          variables.css (design tokens) → base.css (reset) →
                   layout.css (shell/sidebar/topbar) → components.css
                   (buttons, cards, tables, forms, modal…) → pages.css
                   (login screen, dashboard charts).
  utils/format.js  Currency/date formatting helpers.
```

## Design notes

The palette and type system are drawn from the product itself rather
than a generic dashboard template: a deep aubergine-black sidebar, a
kanjivaram-maroon and zari-gold accent pair, and an ivory content
background. The recurring "zari thread" border (a repeating gold dash
pattern) that tops stat cards, underlines the topbar, and divides the
sidebar is the one signature element, meant to echo a saree's woven
border without being literal about it. Fraunces (serif) carries page
titles and big numbers; Work Sans carries everything else.
