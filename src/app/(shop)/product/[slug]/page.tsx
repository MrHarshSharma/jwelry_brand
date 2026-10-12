import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { ProductCarousel } from "@/components/shop/ProductGrid";
import ProductDetail from "@/components/shop/ProductDetail";
import { getActiveProducts, getProductBySlug } from "@/lib/data";
import { formatINR } from "@/lib/format";
import { breadcrumbJsonLd, metaDescription, productJsonLd } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Piece not found", robots: { index: false } };

  const title = product.category ? `${product.name} — Handmade ${product.category.name}` : product.name;
  const description = metaDescription(
    `${product.name}, handmade in Nagpur. ${product.description} ${formatINR(product.price)} · Order on WhatsApp.`,
  );
  const url = `/product/${product.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      images: product.images.slice(0, 4).map((src) => ({ url: src, alt: product.name })),
    },
    twitter: { card: "summary_large_image", title, description, images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const all = await getActiveProducts();
  const sameCategory = all.filter((p) => p.id !== product.id && p.category_id === product.category_id);
  const others = all.filter((p) => p.id !== product.id && p.category_id !== product.category_id);
  const related = [...sameCategory, ...others].slice(0, 10);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    ...(product.category ? [{ name: product.category.name, path: `/shop?category=${product.category.slug}` }] : []),
    { name: product.name, path: `/product/${product.slug}` },
  ];

  return (
    <>
      <JsonLd data={[productJsonLd(product), breadcrumbJsonLd(crumbs)]} />
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <i className="fas fa-chevron-right" />
        {product.category && (
          <>
            <Link href={`/shop?category=${product.category.slug}`}>{product.category.name}</Link>
            <i className="fas fa-chevron-right" />
          </>
        )}
        <span>{product.name}</span>
      </div>

      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="home-section">
          <div className="section-head">
            <h2 className="section-title">You May Also Like</h2>
            <Link href={product.category ? `/shop?category=${product.category.slug}` : "/shop"} className="view-all">
              View All
            </Link>
          </div>
          <ProductCarousel products={related} />
        </section>
      )}
    </>
  );
}
