import type { Metadata } from "next";
import Link from "next/link";
import ProductGrid from "@/components/shop/ProductGrid";
import ShopBrowser from "@/components/shop/ShopBrowser";
import { getShopFacets, searchProducts } from "@/lib/data";
import { hasActiveFilters, parseShopParams } from "@/lib/shop";

export async function generateMetadata({ searchParams }: PageProps<"/shop">): Promise<Metadata> {
  const filters = parseShopParams(await searchParams);
  const facets = await getShopFacets();
  const category = facets.categories.find((c) => c.slug === filters.category);
  const title = category ? `Handmade ${category.name} in Nagpur` : "Shop Handmade Jewellery";
  const description = category
    ? `Shop handmade ${category.name.toLowerCase()} by Lavni, Nagpur. Traditional Maharashtrian designs, made to order and delivered across India.`
    : "Browse Lavni's handmade jewellery — nath, thushi, kolhapuri saaj, jhumkas and bridal sets from Nagpur. Search, filter by price and metal, and order on WhatsApp.";
  const canonical = category ? `/shop?category=${category.slug}` : "/shop";
  // Collection pages are worth indexing; searches and other filter combinations are near-duplicates.
  const onlyCategory = !hasActiveFilters({ ...filters, category: null }) && filters.sort === "featured";
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    robots: onlyCategory ? undefined : { index: false, follow: true },
  };
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const filters = parseShopParams(await searchParams);
  const facets = await getShopFacets();
  const category = facets.categories.find((c) => c.slug === filters.category) ?? null;
  const products = await searchProducts(filters, category?.id ?? null);

  return (
    <div className="shop-page">
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <i className="fas fa-chevron-right" />
        {category ? (
          <>
            <Link href="/shop">Shop</Link>
            <i className="fas fa-chevron-right" />
            <span>{category.name}</span>
          </>
        ) : (
          <span>Shop</span>
        )}
      </div>

      <header className="shop-hero">
        <span className="products-eyebrow">{category ? "Collection" : "The Atelier"}</span>
        <h1 className="products-title">
          {category ? (
            <em>{category.name}</em>
          ) : (
            <>
              Shop <em>All</em>
            </>
          )}
        </h1>
      </header>

      <ShopBrowser filters={filters} facets={facets} resultCount={products.length}>
        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="shop-empty">
            <i className="far fa-gem" />
            <h2>No pieces match</h2>
            <p>
              {hasActiveFilters(filters)
                ? "Try removing a filter or searching for something else."
                : "New pieces are on their way."}
            </p>
            {hasActiveFilters(filters) && (
              <Link href="/shop" className="btn-return">
                Clear filters
              </Link>
            )}
          </div>
        )}
      </ShopBrowser>
    </div>
  );
}
