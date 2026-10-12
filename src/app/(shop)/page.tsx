import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { ProductCarousel } from "@/components/shop/ProductGrid";
import Testimonials from "@/components/shop/Testimonials";
import { getActiveProducts, getCategories } from "@/lib/data";
import { storeJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const BUDGETS = [
  { label: "Under", amount: "₹25,000", href: "/shop?max=25000" },
  { label: "Under", amount: "₹50,000", href: "/shop?max=50000" },
  { label: "Under", amount: "₹1,00,000", href: "/shop?max=100000" },
  { label: "Above", amount: "₹1,00,000", href: "/shop?min=100000" },
];

const PROMISES = [
  { icon: "fas fa-hand-sparkles", title: "Handcrafted", desc: "Shaped, set and finished by hand by our artisans in Nagpur." },
  { icon: "fas fa-pen-nib", title: "Made to Order", desc: "Made once you order, so sizes and finishes can be adjusted." },
  { icon: "fas fa-truck", title: "Delivery Across India", desc: "Carefully packed and shipped to your doorstep." },
  { icon: "fab fa-whatsapp", title: "Order on WhatsApp", desc: "Confirm your order and ask anything directly with us." },
];

export default async function HomePage() {
  const [products, categories] = await Promise.all([getActiveProducts(), getCategories()]);
  const featured = products.filter((p) => p.is_featured);
  const newest = [...products].reverse().slice(0, 10);

  return (
    <>
      <JsonLd data={[storeJsonLd(), websiteJsonLd()]} />

      {/* ── Hero banner ── */}
      <section className="hero-banner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="hero-banner-img"
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=80"
          alt="Handmade jewellery by Lavni, Nagpur"
        />
        <div className="hero-banner-content">
          <span className="hero-eyebrow">Handmade Jewellery · Nagpur</span>
          <h1 className="hero-title">
            Adorned in <em>tradition</em>
          </h1>
          <p className="hero-text">
            Maharashtrian jewellery shaped by hand — from the curve of a nath to the last bead of a thushi.
          </p>
          <div className="hero-actions">
            <Link href="/shop" className="btn btn-primary">
              Shop Now
            </Link>
            <a href="#collections" className="btn btn-outline">
              Explore Collections
            </a>
          </div>
        </div>
      </section>

      {/* ── Shop by category ── */}
      {categories.length > 0 && (
        <section className="home-section" id="collections">
          <h2 className="section-title section-title-center">Shop by Category</h2>
          <div className="cat-circles">
            {categories.map((c) => (
              <Link key={c.id} href={`/shop?category=${c.slug}`} className="cat-circle">
                <span className="cat-circle-media">
                  {c.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image_url} alt={c.name} loading="lazy" />
                  )}
                </span>
                <span className="cat-circle-name">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Product rows ── */}
      {featured.length > 0 && (
        <section className="home-section">
          <div className="section-head">
            <h2 className="section-title">Featured Pieces</h2>
            <Link href="/shop" className="view-all">
              View All
            </Link>
          </div>
          <ProductCarousel products={featured} />
        </section>
      )}

      {newest.length > 0 && (
        <section className="home-section">
          <div className="section-head">
            <h2 className="section-title">New Arrivals</h2>
            <Link href="/shop?sort=newest" className="view-all">
              View All
            </Link>
          </div>
          <ProductCarousel products={newest} />
        </section>
      )}

      {/* ── Shop by budget ── */}
      <section className="home-section">
        <h2 className="section-title section-title-center">Shop by Budget</h2>
        <div className="budget-grid">
          {BUDGETS.map((b) => (
            <Link key={b.href} href={b.href} className="budget-card">
              <span className="budget-label">{b.label}</span>
              <span className="budget-amount">{b.amount}</span>
              <span className="budget-cta">
                Shop now <i className="fas fa-arrow-right" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Story ── */}
      <section className="home-section" id="story">
        <div className="story-card">
          <div className="story-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/image/necklace.jpg" alt="A handmade Lavni necklace" loading="lazy" />
          </div>
          <div className="story-body">
            <span className="hero-eyebrow">Our Story</span>
            <h2 className="story-title">
              Where craft meets <em>culture</em>
            </h2>
            <p>
              Lavni takes its spirit from Lavani — the colour, rhythm and confidence of Maharashtra&rsquo;s most joyful
              stage. Our jewellery carries that same spirit: bold, graceful and made to be celebrated.
            </p>
            <p>
              From our workshop in Nagpur, each piece is handmade in small batches, keeping alive the craft of the
              nath, the thushi and the kolhapuri saaj — for brides, for festivals, and for every day in between.
            </p>
            <div className="story-stats">
              <div>
                <strong>100%</strong>
                <span>Handmade</span>
              </div>
              <div>
                <strong>Nagpur</strong>
                <span>Our atelier</span>
              </div>
              <div>
                <strong>India</strong>
                <span>We deliver</span>
              </div>
            </div>
            <Link href="/shop" className="btn btn-primary">
              Explore the Collection
            </Link>
          </div>
        </div>
      </section>

      {/* ── Promises ── */}
      <section className="home-section">
        <div className="promise-grid">
          {PROMISES.map((p) => (
            <div className="promise-card" key={p.title}>
              <i className={p.icon} />
              <div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Testimonials />
    </>
  );
}
