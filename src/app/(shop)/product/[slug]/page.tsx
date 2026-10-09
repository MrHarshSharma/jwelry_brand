import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/shop/ProductDetail";
import { getActiveProducts, getProductBySlug } from "@/lib/data";
import { formatINR } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return product ? { title: `${product.name} — Dina`, description: product.description } : {};
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const all = await getActiveProducts();
  const sameCategory = all.filter((p) => p.id !== product.id && p.category_id === product.category_id);
  const others = all.filter((p) => p.id !== product.id && p.category_id !== product.category_id);
  const related = [...sameCategory, ...others].slice(0, 4);

  return (
    <>
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
        <section className="related">
          <div className="related-hdr">
            <div>
              <span className="related-eyebrow">You May Also Like</span>
              <h2 className="related-title">
                Complete <em>the Look</em>
              </h2>
            </div>
          </div>
          <div className="related-grid">
            {related.map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} className="related-card">
                <div className="related-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images[0]} alt={p.name} loading="lazy" />
                </div>
                <div className="related-info">
                  <div className="related-cat">{p.category?.name}</div>
                  <div className="related-name">{p.name}</div>
                  <div className="related-price">{formatINR(p.price)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
