-- Dina storefront schema.
-- Run in the Supabase SQL editor (or `supabase db push`), then run supabase/seed.sql.

create extension if not exists pgcrypto;

-- ─── Helpers ──────────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ─── Admins ───────────────────────────────────────────────────────────────
-- A Supabase auth user is a dashboard admin when they have a row here.

create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ─── Catalogue ────────────────────────────────────────────────────────────

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  image_url   text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table public.products (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  category_id     uuid references public.categories (id) on delete set null,
  description     text not null default '',
  price           integer not null check (price >= 0),          -- rupees
  original_price  integer check (original_price is null or original_price >= 0),
  badge           text check (badge in ('new', 'sale', 'bestseller')),
  rating          smallint not null default 5 check (rating between 0 and 5),
  reviews_count   integer not null default 0,
  metal           text,
  stone           text,
  sizes           text[] not null default '{}',
  colors          jsonb not null default '[]',                   -- [{ "name": "...", "hex": "#..." }]
  images          text[] not null default '{}',
  care            text[] not null default '{}',
  delivery        text,
  sku             text unique,
  occasion        text,
  stock           integer check (stock is null or stock >= 0),   -- null = made to order / unlimited
  is_active       boolean not null default true,
  is_featured     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.promo_codes (
  code        text primary key check (code = upper(code)),
  percent_off integer not null check (percent_off between 1 and 90),
  is_active   boolean not null default true,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

create table public.store_settings (
  id                      integer primary key default 1 check (id = 1),
  store_name              text not null default 'Dina',
  whatsapp_number         text not null default '',  -- digits with country code, e.g. 919876543210
  shipping_fee            integer not null default 199,
  free_shipping_threshold integer not null default 10000,
  updated_at              timestamptz not null default now()
);
insert into public.store_settings (id) values (1);
create trigger store_settings_updated_at before update on public.store_settings
  for each row execute function public.set_updated_at();

-- ─── Orders ───────────────────────────────────────────────────────────────

create type public.order_status as enum
  ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');

create sequence public.order_number_seq start 1001;

create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null unique default ('DN' || nextval('public.order_number_seq')),
  status          public.order_status not null default 'pending',
  customer_name   text not null,
  customer_phone  text not null,
  customer_email  text,
  address         text not null,
  city            text not null,
  state           text not null,
  pincode         text not null,
  landmark        text,
  notes           text,
  payment_method  text not null default 'cod' check (payment_method in ('cod', 'upi', 'bank_transfer')),
  payment_status  text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  subtotal        integer not null default 0,
  discount        integer not null default 0,
  shipping        integer not null default 0,
  total           integer not null default 0,
  promo_code      text,
  admin_notes     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index orders_status_idx on public.orders (status);
create index orders_created_idx on public.orders (created_at desc);
create index orders_phone_idx on public.orders (customer_phone);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  product_name  text not null,
  product_image text,
  sku           text,
  unit_price    integer not null,
  quantity      integer not null check (quantity > 0),
  size          text,
  color         text
);
create index order_items_order_idx on public.order_items (order_id);

-- Return stock to tracked products when an order is cancelled (and take it again if un-cancelled).
create or replace function public.restock_on_cancel()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  dir integer;
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    dir := 1;
  elsif old.status = 'cancelled' and new.status <> 'cancelled' then
    dir := -1;
  else
    return new;
  end if;

  update public.products p
     set stock = greatest(p.stock + dir * oi.quantity, 0)
    from public.order_items oi
   where oi.order_id = new.id and oi.product_id = p.id and p.stock is not null;
  return new;
end $$;
create trigger orders_restock after update of status on public.orders
  for each row execute function public.restock_on_cancel();

-- Customers, derived from orders and grouped by phone number.
create view public.customers with (security_invoker = true) as
select
  customer_phone                                     as phone,
  (array_agg(customer_name order by created_at desc))[1]  as name,
  (array_agg(customer_email order by created_at desc))[1] as email,
  (array_agg(city order by created_at desc))[1]          as city,
  count(*)                                           as orders_count,
  coalesce(sum(total) filter (where status <> 'cancelled'), 0) as total_spent,
  max(created_at)                                    as last_order_at
from public.orders
group by customer_phone;

-- ─── Public RPCs (called by the storefront with the anon key) ─────────────

-- Validate a promo code and return its discount percentage (null when invalid).
create or replace function public.check_promo(p_code text)
returns integer
language sql stable security definer set search_path = public as $$
  select percent_off from public.promo_codes
   where code = upper(trim(p_code))
     and is_active
     and (expires_at is null or expires_at > now());
$$;

-- Create an order. Prices, discount and shipping are computed here from the
-- database so the client can never set them.
--   p_customer: { name, phone, email, address, city, state, pincode, landmark, notes, payment_method }
--   p_items:    [{ product_id, quantity, size, color }]
create or replace function public.place_order(p_customer jsonb, p_items jsonb, p_promo_code text default null)
returns table (order_id uuid, order_no text, order_total integer)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  v_id        uuid;
  v_number    text;
  v_settings  public.store_settings;
  v_product   public.products;
  v_item      jsonb;
  v_qty       integer;
  v_subtotal  integer := 0;
  v_discount  integer := 0;
  v_shipping  integer;
  v_pct       integer;
  v_promo     text := nullif(upper(trim(coalesce(p_promo_code, ''))), '');
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'Too many items in one order';
  end if;
  if coalesce(trim(p_customer->>'name'), '') = ''
     or coalesce(trim(p_customer->>'phone'), '') = ''
     or coalesce(trim(p_customer->>'address'), '') = ''
     or coalesce(trim(p_customer->>'city'), '') = ''
     or coalesce(trim(p_customer->>'state'), '') = ''
     or coalesce(trim(p_customer->>'pincode'), '') = '' then
    raise exception 'Please fill in all required details';
  end if;

  if v_promo is not null then
    v_pct := public.check_promo(v_promo);
    if v_pct is null then
      raise exception 'Promo code % is not valid', v_promo;
    end if;
  end if;

  select * into v_settings from public.store_settings where id = 1;

  insert into public.orders (
    customer_name, customer_phone, customer_email, address, city, state, pincode,
    landmark, notes, payment_method, promo_code
  ) values (
    left(trim(p_customer->>'name'), 120),
    left(trim(p_customer->>'phone'), 20),
    nullif(left(trim(coalesce(p_customer->>'email', '')), 200), ''),
    left(trim(p_customer->>'address'), 500),
    left(trim(p_customer->>'city'), 100),
    left(trim(p_customer->>'state'), 100),
    left(trim(p_customer->>'pincode'), 10),
    nullif(left(trim(coalesce(p_customer->>'landmark', '')), 200), ''),
    nullif(left(trim(coalesce(p_customer->>'notes', '')), 1000), ''),
    coalesce(nullif(p_customer->>'payment_method', ''), 'cod'),
    v_promo
  )
  returning id, order_number into v_id, v_number;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::integer;
    if v_qty is null or v_qty < 1 or v_qty > 20 then
      raise exception 'Invalid quantity';
    end if;

    select * into v_product from public.products
     where id = (v_item->>'product_id')::uuid and is_active
     for update;
    if not found then
      raise exception 'A product in your cart is no longer available';
    end if;

    if v_product.stock is not null then
      if v_product.stock < v_qty then
        raise exception '% has only % left in stock', v_product.name, v_product.stock;
      end if;
      update public.products set stock = stock - v_qty where id = v_product.id;
    end if;

    insert into public.order_items (order_id, product_id, product_name, product_image, sku, unit_price, quantity, size, color)
    values (v_id, v_product.id, v_product.name, v_product.images[1], v_product.sku, v_product.price, v_qty,
            nullif(left(v_item->>'size', 40), ''), nullif(left(v_item->>'color', 40), ''));

    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  if v_pct is not null then
    v_discount := round(v_subtotal * v_pct / 100.0);
  end if;
  v_shipping := case when v_subtotal >= v_settings.free_shipping_threshold then 0 else v_settings.shipping_fee end;

  update public.orders
     set subtotal = v_subtotal,
         discount = v_discount,
         shipping = v_shipping,
         total    = v_subtotal - v_discount + v_shipping
   where id = v_id;

  return query select v_id, v_number, v_subtotal - v_discount + v_shipping;
end $$;

-- Fetch one order (with items) for the customer's confirmation page.
-- Orders are looked up by their unguessable uuid, never by order number.
create or replace function public.get_order(p_id uuid)
returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(o) - 'admin_notes' || jsonb_build_object(
           'items', coalesce((select jsonb_agg(to_jsonb(i)) from public.order_items i where i.order_id = o.id), '[]'::jsonb))
    from public.orders o
   where o.id = p_id;
$$;

revoke all on function public.place_order(jsonb, jsonb, text) from public;
revoke all on function public.get_order(uuid) from public;
revoke all on function public.check_promo(text) from public;
grant execute on function public.place_order(jsonb, jsonb, text) to anon, authenticated;
grant execute on function public.get_order(uuid) to anon, authenticated;
grant execute on function public.check_promo(text) to anon, authenticated;

-- ─── Row level security ───────────────────────────────────────────────────

alter table public.admins          enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.promo_codes     enable row level security;
alter table public.store_settings  enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;

create policy "admins read own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

create policy "categories are public" on public.categories
  for select using (true);
create policy "admins manage categories" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "active products are public" on public.products
  for select using (is_active or public.is_admin());
create policy "admins manage products" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admins manage promo codes" on public.promo_codes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "settings are public" on public.store_settings
  for select using (true);
create policy "admins update settings" on public.store_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admins manage orders" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage order items" on public.order_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ─── Storage: product images ──────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product images are public" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "admins upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "admins update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
create policy "admins delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
