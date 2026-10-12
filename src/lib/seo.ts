import { absoluteUrl, BRAND, SITE_URL } from "./brand";
import type { Product } from "./types";

/** The shop as a local business in Nagpur — powers Google's business panel and local results. */
export function storeJsonLd() {
  // Only real profile links: skip empty values and bare network home pages (placeholders).
  const sameAs = Object.values(BRAND.social).filter((url) => url && new URL(url).pathname.replace(/\/$/, "") !== "");
  return {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "@id": `${SITE_URL}/#store`,
    name: BRAND.legalName,
    alternateName: BRAND.name,
    description: BRAND.description,
    url: SITE_URL,
    logo: absoluteUrl("/icon.svg"),
    image: absoluteUrl("/opengraph-image"),
    address: {
      "@type": "PostalAddress",
      ...(BRAND.address.street && { streetAddress: BRAND.address.street }),
      addressLocality: BRAND.address.city,
      addressRegion: BRAND.address.region,
      ...(BRAND.address.postalCode && { postalCode: BRAND.address.postalCode }),
      addressCountry: BRAND.address.country,
    },
    areaServed: { "@type": "Country", name: "India" },
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Bank Transfer",
    ...(BRAND.phone && { telephone: BRAND.phone }),
    ...(BRAND.email && { email: BRAND.email }),
    ...(sameAs.length && { sameAs }),
  };
}

/** Lets Google show a search box for the site that searches the shop page. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: BRAND.legalName,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#store` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/shop?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(p: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.images.map(absoluteUrl),
    ...(p.sku && { sku: p.sku }),
    brand: { "@type": "Brand", name: BRAND.legalName },
    ...(p.category && { category: p.category.name }),
    ...(p.metal && { material: p.metal }),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${p.slug}`),
      price: p.price,
      priceCurrency: "INR",
      availability: p.stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE_URL}/#store` },
      areaServed: "IN",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

/** Plain-text summary for meta descriptions (search engines show ~155 characters). */
export const metaDescription = (text: string, max = 155) =>
  text.length <= max ? text : text.slice(0, text.lastIndexOf(" ", max - 1)) + "…";

