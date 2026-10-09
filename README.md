# Dina — Fine Jewellery Store

A Next.js storefront and admin dashboard for Dina, backed by Supabase. Customers check out over WhatsApp.

- **Storefront**: home, collections, product pages, cart, checkout and an order confirmation page. The design is ported from the original static site, which is kept in `legacy/` for reference.
- **WhatsApp checkout**: the order is saved in Supabase, then the customer sends it to the store's WhatsApp number in one tap. The message is pre-filled with the items, totals and address.
- **Admin dashboard** at `/admin`: overview stats, orders (status, payment, notes, WhatsApp the customer), products (with image upload), categories, promo codes, customers and store settings.

## Stack

Next.js 16 (App Router, Server Actions) · Supabase (Postgres, Auth, Storage, RLS) · plain CSS

## Setup

### 1. Create the database

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run these two files in order:
   - `supabase/migrations/0001_init.sql`: tables, row-level security, order functions and the `product-images` storage bucket
   - `supabase/seed.sql`: the original 12 products, 4 categories and the promo codes `DINA10`, `DINA20` and `JAIPUR15`

### 2. Create an admin user

1. In Supabase, go to **Authentication → Users → Add user** and create a user with an email and password.
2. Run this in the SQL Editor:

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```

### 3. Configure and run

```bash
cp .env.example .env.local   # add your Supabase URL and anon key
npm install
npm run dev
```

1. Open http://localhost:3000/admin, sign in, go to **Settings** and enter the store's WhatsApp number with its country code (for example `919876543210`).
2. Open http://localhost:3000 and place a test order.

## How checkout works

1. The customer fills in their details and taps **Place Order via WhatsApp**.
2. A server action calls the `place_order` Postgres function, which:
   - reads prices from the database (never from the browser)
   - checks the promo code and stock
   - works out shipping
   - writes the order and its items in one transaction
3. The customer lands on `/order/<id>` and taps **Send Order on WhatsApp**. This opens a `wa.me` link to the store's number, pre-filled with the order summary and a link back to the order.
4. The order appears in the dashboard as **pending**. You confirm it with the customer on WhatsApp, then move it through `confirmed → processing → shipped → delivered`. **Message customer** on the order page opens WhatsApp with a status update already written.

When you cancel an order, its items go back into stock. Products with a blank stock value count as made to order and are never limited.

## Optional: WhatsApp Cloud API notifications

The click-to-chat flow above needs no Meta setup. If you also want automatic messages:

1. Set up WhatsApp in a Meta developer app and copy the access token and phone number ID.
2. Create and get approval for two message templates in WhatsApp Manager:

   | Env var | Default name | Body variables |
   |---|---|---|
   | `WHATSAPP_TEMPLATE_NEW_ORDER` | `new_order_alert` | `{{1}}` order number, `{{2}}` customer name, `{{3}}` total, `{{4}}` customer phone |
   | `WHATSAPP_TEMPLATE_STATUS_UPDATE` | `order_status_update` | `{{1}}` customer first name, `{{2}}` order number, `{{3}}` new status, `{{4}}` store name |

3. Fill in the `WHATSAPP_*` variables in `.env.local`.

Once that's done:
- The store number from Settings gets a `new_order_alert` for every order.
- The order page gets a **Send WhatsApp update** checkbox. It sends `order_status_update` to the customer when you change the status.

If a message fails to send, the error is logged and the order is not affected.

## Project layout

```
src/
  app/
    (shop)/            storefront: home, product/[slug], checkout, order/[id]
    admin/login/       admin sign-in
    admin/(dashboard)/ overview, orders, products, categories, promos, customers, settings
    admin/actions.ts   all dashboard server actions (each checks admin rights)
  components/shop/     header, footer, cart (localStorage), product grid/detail, checkout form
  components/admin/    nav, product form, shared widgets
  lib/                 Supabase clients, data access, WhatsApp helpers, types
  proxy.ts             refreshes the Supabase session and guards /admin
  styles/              shop.css (ported design), admin.css
supabase/
  migrations/0001_init.sql
  seed.sql
legacy/                the original static HTML site
```

## Security notes

- Customers use the anon key and can't read or change orders directly. Orders can only be created through `place_order`. The confirmation page reads a single order through `get_order`, looked up by its random UUID.
- Every admin read and write goes through row-level security (`public.is_admin()`), and every server action calls `requireAdmin()` as well.
- No service-role key is needed anywhere.
- Anyone can submit orders. If you start getting spam orders, add rate limiting or a captcha to checkout.
