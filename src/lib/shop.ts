// Shop page filters. They live in the URL (/shop?q=…&category=…) so results can be bookmarked and shared.

export const SORTS = {
  featured: "Featured",
  newest: "Newest",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  name: "Name: A–Z",
} as const;
export type SortKey = keyof typeof SORTS;

export type ShopFilters = {
  q: string;
  category: string | null;
  metals: string[];
  min: number | null;
  max: number | null;
  sale: boolean;
  inStock: boolean;
  sort: SortKey;
};

type Params = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const many = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);
const price = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return one(v) !== "" && Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
};

export function parseShopParams(sp: Params): ShopFilters {
  const sort = one(sp.sort);
  return {
    q: one(sp.q).trim().slice(0, 100),
    category: one(sp.category) || null,
    metals: many(sp.metal).filter(Boolean),
    min: price(sp.min),
    max: price(sp.max),
    sale: one(sp.sale) === "1",
    inStock: one(sp.stock) === "1",
    sort: sort in SORTS ? (sort as SortKey) : "featured",
  };
}

export function shopHref(f: ShopFilters) {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.category) p.set("category", f.category);
  f.metals.forEach((m) => p.append("metal", m));
  if (f.min !== null) p.set("min", String(f.min));
  if (f.max !== null) p.set("max", String(f.max));
  if (f.sale) p.set("sale", "1");
  if (f.inStock) p.set("stock", "1");
  if (f.sort !== "featured") p.set("sort", f.sort);
  const s = p.toString();
  return `/shop${s ? `?${s}` : ""}`;
}

export const EMPTY_FILTERS: ShopFilters = parseShopParams({});

export const hasActiveFilters = (f: ShopFilters) =>
  Boolean(f.q || f.category || f.metals.length || f.min !== null || f.max !== null || f.sale || f.inStock);
