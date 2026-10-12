import "server-only";
import { cache } from "react";
import { createClient } from "./supabase/server";
import type { ShopFilters } from "./shop";
import type { Category, Product, StoreSettings } from "./types";

const PRODUCT_SELECT = "*, category:categories(slug, name)";

export async function getSettings(): Promise<StoreSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_settings")
    .select("whatsapp_number, shipping_fee, free_shipping_threshold")
    .eq("id", 1)
    .single();
  return data ?? { whatsapp_number: "", shipping_fee: 199, free_shipping_threshold: 10000 };
}

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return data;
});

export async function getActiveProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at")
    .order("name");
  if (error) throw error;
  return data as Product[];
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data as Product | null;
});

/** Products matching the shop page filters. `categoryId` is the resolved id of `filters.category`. */
export async function searchProducts(filters: ShopFilters, categoryId: string | null): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true);

  // Characters that would break PostgREST's or() filter syntax are dropped.
  const q = filters.q.replace(/[,()%*\\]/g, " ").trim();
  if (q) {
    query = query.or(
      ["name", "description", "metal", "stone", "occasion", "sku"].map((col) => `${col}.ilike.%${q}%`).join(","),
    );
  }
  if (categoryId) query = query.eq("category_id", categoryId);
  if (filters.metals.length) query = query.in("metal", filters.metals);
  if (filters.min !== null) query = query.gte("price", filters.min);
  if (filters.max !== null) query = query.lte("price", filters.max);
  if (filters.sale) query = query.not("original_price", "is", null);
  if (filters.inStock) query = query.or("stock.is.null,stock.gt.0");

  switch (filters.sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "price_asc":
      query = query.order("price");
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "name":
      break;
    default:
      query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  }
  const { data, error } = await query.order("name");
  if (error) throw error;
  return data as Product[];
}

export type ShopFacets = {
  categories: (Category & { count: number })[];
  metals: { name: string; count: number }[];
  priceRange: { min: number; max: number };
};

/** Filter options for the shop sidebar, with counts across all visible products. */
export const getShopFacets = cache(async (): Promise<ShopFacets> => {
  const supabase = await createClient();
  const [categories, { data, error }] = await Promise.all([
    getCategories(),
    supabase.from("products").select("category_id, metal, price").eq("is_active", true),
  ]);
  if (error) throw error;

  const metals = new Map<string, number>();
  data.forEach((p) => p.metal && metals.set(p.metal, (metals.get(p.metal) ?? 0) + 1));
  const prices = data.map((p) => p.price);

  return {
    categories: categories.map((c) => ({ ...c, count: data.filter((p) => p.category_id === c.id).length })),
    metals: [...metals].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
    priceRange: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 },
  };
});
