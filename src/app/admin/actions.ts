"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { BRAND } from "@/lib/brand";
import { getSettings } from "@/lib/data";
import { slugify } from "@/lib/format";
import { PRODUCT_IMAGES_BUCKET, productImagePath } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, type OrderStatus, type ProductColor } from "@/lib/types";
import { sendTemplate } from "@/lib/whatsapp";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const optStr = (fd: FormData, key: string) => str(fd, key) || null;
const optInt = (fd: FormData, key: string) => {
  const v = str(fd, key);
  if (!v) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0) throw new Error(`${key.replace(/_/g, " ")} must be a whole number`);
  return n;
};
const int = (fd: FormData, key: string) => {
  const n = optInt(fd, key);
  if (n === null) throw new Error(`${key.replace(/_/g, " ")} is required`);
  return n;
};
function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export async function signIn(_prev: string | null, fd: FormData): Promise<string | null> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: str(fd, "email"), password: str(fd, "password") });
  if (error) return error.message;
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export async function updateOrder(fd: FormData) {
  const supabase = await requireAdmin();
  const id = str(fd, "id");
  const status = str(fd, "status") as OrderStatus;
  const paymentStatus = str(fd, "payment_status");
  if (!ORDER_STATUSES.includes(status)) throw new Error("Invalid status");
  if (!(PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) throw new Error("Invalid payment status");
  const paymentMethod = str(fd, "payment_method");
  if (!(paymentMethod in PAYMENT_METHODS)) throw new Error("Invalid payment method");

  const { data: before } = await supabase.from("orders").select("status").eq("id", id).single();
  const { data: order, error } = await supabase
    .from("orders")
    .update({
      status,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      admin_notes: optStr(fd, "admin_notes"),
    })
    .eq("id", id)
    .select("order_number, customer_name, customer_phone")
    .single();
  check(error);

  // Optional Cloud API status message to the customer.
  if (order && before?.status !== status && fd.get("notify") === "on") {
    const { store_name } = await getSettings();
    await sendTemplate(order.customer_phone, process.env.WHATSAPP_TEMPLATE_STATUS_UPDATE ?? "", [
      order.customer_name.split(" ")[0],
      order.order_number,
      status,
      store_name,
    ]);
  }
  revalidatePath("/admin", "layout");
}

const ORDER_FIELD_VALUES = {
  status: ORDER_STATUSES as readonly string[],
  payment_status: PAYMENT_STATUSES as readonly string[],
  payment_method: Object.keys(PAYMENT_METHODS),
};
export type OrderField = keyof typeof ORDER_FIELD_VALUES;

/** Change one field of an order from the orders list. */
export async function updateOrderField(id: string, field: OrderField, value: string): Promise<{ error: string } | void> {
  const supabase = await requireAdmin();
  if (!(field in ORDER_FIELD_VALUES) || !ORDER_FIELD_VALUES[field].includes(value)) return { error: "Invalid value" };
  const { error } = await supabase.from("orders").update({ [field]: value }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
}

export async function deleteOrder(fd: FormData) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("orders").delete().eq("id", str(fd, "id"));
  check(error);
  revalidatePath("/admin", "layout");
  redirect("/admin/orders");
}

// ─── Products ───────────────────────────────────────────────────────────────

export type ProductPayload = {
  id?: string;
  name: string;
  slug: string;
  category_id: string | null;
  description: string;
  price: number;
  original_price: number | null;
  badge: string | null;
  stock: number | null;
  metal: string;
  stone: string;
  occasion: string;
  sku: string;
  delivery: string;
  sizes: string[];
  care: string[];
  colors: ProductColor[];
  images: string[];
  rating: number;
  reviews_count: number;
  is_active: boolean;
  is_featured: boolean;
};

export async function saveProduct(p: ProductPayload): Promise<{ error: string } | void> {
  const supabase = await requireAdmin();
  if (!p.name.trim()) return { error: "Name is required" };
  if (!Number.isInteger(p.price) || p.price < 0) return { error: "Price must be a whole number of rupees" };
  if (p.stock !== null && (!Number.isInteger(p.stock) || p.stock < 0)) return { error: "Stock must be a whole number" };
  if (p.badge && !["new", "sale", "bestseller"].includes(p.badge)) return { error: "Invalid badge" };

  const row = {
    name: p.name.trim(),
    slug: slugify(p.slug || p.name),
    category_id: p.category_id || null,
    description: p.description.trim(),
    price: p.price,
    original_price: p.original_price || null,
    badge: p.badge || null,
    stock: p.stock,
    metal: p.metal.trim() || null,
    stone: p.stone.trim() || null,
    occasion: p.occasion.trim() || null,
    sku: p.sku.trim() || null,
    delivery: p.delivery.trim() || null,
    sizes: p.sizes.map((s) => s.trim()).filter(Boolean),
    care: p.care.map((s) => s.trim()).filter(Boolean),
    colors: p.colors.filter((c) => c.name.trim()),
    images: p.images.filter(Boolean),
    rating: Math.min(5, Math.max(0, Math.round(p.rating))),
    reviews_count: Math.max(0, Math.round(p.reviews_count)),
    is_active: p.is_active,
    is_featured: p.is_featured,
  };

  const previousImages = p.id
    ? ((await supabase.from("products").select("images").eq("id", p.id).single()).data?.images ?? [])
    : [];

  const { error } = p.id
    ? await supabase.from("products").update(row).eq("id", p.id)
    : await supabase.from("products").insert(row);
  if (error) {
    return { error: error.code === "23505" ? "Another product already uses that slug or SKU" : error.message };
  }
  await removeUnusedImages(supabase, previousImages.filter((url: string) => !row.images.includes(url)));
  revalidatePath("/admin", "layout");
  redirect("/admin/products");
}

/** Delete a newly uploaded image that was removed or replaced in a form before it was saved. */
export async function discardUpload(url: string) {
  const supabase = await requireAdmin();
  await removeUnusedImages(supabase, [url]);
}

/**
 * Delete images from storage once nothing refers to them any more. Call it after the product or
 * category row has been updated or deleted. Skips files outside our bucket, files a product or
 * category still shows, and files used as thumbnails on past orders.
 */
async function removeUnusedImages(supabase: Awaited<ReturnType<typeof requireAdmin>>, urls: string[]) {
  const candidates = [...new Set(urls)].filter((url) => productImagePath(url));
  if (!candidates.length) return;

  const [products, categories, orderItems] = await Promise.all([
    supabase.from("products").select("images").overlaps("images", candidates),
    supabase.from("categories").select("image_url").in("image_url", candidates),
    supabase.from("order_items").select("product_image").in("product_image", candidates),
  ]);
  if (products.error || categories.error || orderItems.error) {
    // If we can't tell whether a file is still in use, keep it.
    console.error("Image cleanup skipped", products.error ?? categories.error ?? orderItems.error);
    return;
  }
  const inUse = new Set<string>([
    ...products.data.flatMap((p) => p.images as string[]),
    ...categories.data.map((c) => c.image_url as string),
    ...orderItems.data.map((i) => i.product_image as string),
  ]);

  const paths = candidates.filter((url) => !inUse.has(url)).map((url) => productImagePath(url)!);
  if (!paths.length) return;
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  if (error) console.error("Failed to delete images", paths, error);
}

export async function toggleProduct(fd: FormData) {
  const supabase = await requireAdmin();
  const field = str(fd, "field");
  if (field !== "is_active" && field !== "is_featured") throw new Error("Invalid field");
  const { error } = await supabase
    .from("products")
    .update({ [field]: str(fd, "value") === "true" })
    .eq("id", str(fd, "id"));
  check(error);
  revalidatePath("/admin/products");
}

export async function deleteProduct(fd: FormData) {
  const supabase = await requireAdmin();
  const { data: deleted, error } = await supabase.from("products").delete().eq("id", str(fd, "id")).select("images");
  check(error);
  await removeUnusedImages(supabase, deleted?.[0]?.images ?? []);
  revalidatePath("/admin", "layout");
  redirect("/admin/products");
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function saveCategory(fd: FormData) {
  const supabase = await requireAdmin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!name) throw new Error("Category name is required");
  const row = {
    name,
    slug: slugify(str(fd, "slug") || name),
    image_url: optStr(fd, "image_url"),
    sort_order: optInt(fd, "sort_order") ?? 0,
  };
  const previousImage = id
    ? (await supabase.from("categories").select("image_url").eq("id", id).single()).data?.image_url
    : null;

  const { error } = id
    ? await supabase.from("categories").update(row).eq("id", id)
    : await supabase.from("categories").insert(row);
  if (error?.code === "23505") throw new Error(`A category with slug "${row.slug}" already exists`);
  check(error);
  if (previousImage && previousImage !== row.image_url) await removeUnusedImages(supabase, [previousImage]);
  revalidatePath("/admin/categories");
}

export async function deleteCategory(fd: FormData) {
  const supabase = await requireAdmin();
  const { data: deleted, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", str(fd, "id"))
    .select("image_url");
  check(error);
  const image = deleted?.[0]?.image_url;
  if (image) await removeUnusedImages(supabase, [image]);
  revalidatePath("/admin/categories");
}

// ─── Promo codes ────────────────────────────────────────────────────────────

export async function createPromo(fd: FormData) {
  const supabase = await requireAdmin();
  const code = str(fd, "code").toUpperCase().replace(/\s+/g, "");
  const pct = int(fd, "percent_off");
  if (!code) throw new Error("Code is required");
  if (pct < 1 || pct > 90) throw new Error("Discount must be between 1% and 90%");
  const expires = str(fd, "expires_at");
  const { error } = await supabase.from("promo_codes").insert({
    code,
    percent_off: pct,
    // End of the chosen day, India time
    expires_at: expires ? new Date(`${expires}T23:59:59+05:30`).toISOString() : null,
  });
  if (error?.code === "23505") throw new Error(`Promo code ${code} already exists`);
  check(error);
  revalidatePath("/admin/promos");
}

export async function togglePromo(fd: FormData) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("promo_codes")
    .update({ is_active: str(fd, "value") === "true" })
    .eq("code", str(fd, "code"));
  check(error);
  revalidatePath("/admin/promos");
}

export async function deletePromo(fd: FormData) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("promo_codes").delete().eq("code", str(fd, "code"));
  check(error);
  revalidatePath("/admin/promos");
}

// ─── Settings ───────────────────────────────────────────────────────────────

export async function saveSettings(fd: FormData) {
  const supabase = await requireAdmin();
  const whatsapp = str(fd, "whatsapp_number").replace(/\D/g, "");
  if (whatsapp && whatsapp.length < 11) {
    throw new Error("Enter the WhatsApp number with country code, e.g. 919876543210");
  }
  const { error } = await supabase
    .from("store_settings")
    .update({
      store_name: str(fd, "store_name") || BRAND.name,
      whatsapp_number: whatsapp,
      shipping_fee: int(fd, "shipping_fee"),
      free_shipping_threshold: int(fd, "free_shipping_threshold"),
    })
    .eq("id", 1);
  check(error);
  revalidatePath("/admin/settings");
}
