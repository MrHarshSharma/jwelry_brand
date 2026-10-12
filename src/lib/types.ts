export type Badge = "new" | "sale" | "bestseller";

export type Category = {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  sort_order: number;
};

export type ProductColor = { name: string; hex: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  description: string;
  price: number;
  original_price: number | null;
  badge: Badge | null;
  rating: number;
  reviews_count: number;
  metal: string | null;
  stone: string | null;
  sizes: string[];
  colors: ProductColor[];
  images: string[];
  care: string[];
  delivery: string | null;
  sku: string | null;
  occasion: string | null;
  stock: number | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  category?: Pick<Category, "slug" | "name"> | null;
};

export const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = {
  cod: "Cash on Delivery",
  upi: "UPI",
  bank_transfer: "Bank Transfer",
} as const;
export type PaymentMethod = keyof typeof PAYMENT_METHODS;

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  sku: string | null;
  unit_price: number;
  quantity: number;
  size: string | null;
  color: string | null;
};

export type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
  notes: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promo_code: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

export type PromoCode = {
  code: string;
  percent_off: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
};

export type StoreSettings = {
  whatsapp_number: string;
  shipping_fee: number;
  free_shipping_threshold: number;
};

export type Customer = {
  phone: string;
  name: string;
  email: string | null;
  city: string;
  orders_count: number;
  total_spent: number;
  last_order_at: string;
};
