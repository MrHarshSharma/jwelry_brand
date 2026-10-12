import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import HeroSlider from "@/components/shop/HeroSlider";
import { ProductCarousel } from "@/components/shop/ProductGrid";
import Testimonials from "@/components/shop/Testimonials";
import { BRAND } from "@/lib/brand";
import { getActiveProducts, getCategories } from "@/lib/data";
import { storeJsonLd, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const BUDGETS = [
  { label: "Under", amount: "₹25,000", href: "/shop?max=25000" },
  { label: "Under", amount: "₹50,000", href: "/shop?max=50000" },
  { label: "Under", amount: "₹1,00,000", href: "/shop?max=100000" },
  { label: "Above", amount: "₹1,00,000", href: "/shop?min=100000" },
];

// Thin line icons (24×24, drawn with the current text colour).
const ICONS = {
  gem: (
    <>
      <path d="M6 3h12l3 6-9 12L3 9z" />
      <path d="M3 9h18M9 3l-1 6 4 12 4-12-1-6" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4L19 9a2.83 2.83 0 0 0-4-4L4 16z" />
      <path d="M13.5 6.5l4 4" />
    </>
  ),
  parcel: (
    <>
      <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8M7.5 5.5l9 5" />
    </>
  ),
  chat: (
    <>
      <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-4.9A8.5 8.5 0 1 1 21 11.5z" />
      <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
    </>
  ),
};

const PROMISES: { icon: keyof typeof ICONS; title: string; desc: string }[] = [
  { icon: "gem", title: "Handcrafted", desc: "Shaped, set and finished by hand by our artisans in Nagpur." },
  { icon: "pencil", title: "Made to Order", desc: "Made once you order, so sizes and finishes can be adjusted." },
  { icon: "parcel", title: "Delivery Across India", desc: "Carefully packed and shipped to your doorstep." },
  { icon: "chat", title: "Order on WhatsApp", desc: "Confirm your order and ask anything directly with us." },
];

export default async function HomePage() {
  const [products, categories] = await Promise.all([getActiveProducts(), getCategories()]);
  const featured = products.filter((p) => p.is_featured);
  const newest = [...products].reverse().slice(0, 10);

  return (
    <>
      <JsonLd data={[storeJsonLd(), websiteJsonLd()]} />

      {/* ── Hero banner ── */}
      <HeroSlider slides={BRAND.heroSlides} />

      {/* ── Promises ── */}
      <section className="home-section promise-section">
        <ul className="promise-strip">
          {PROMISES.map((p) => (
            <li className="promise-item" key={p.title}>
              <svg
                className="promise-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {ICONS[p.icon]}
              </svg>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </li>
          ))}
        </ul>
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
        <div className="budget-band">
          <div className="budget-intro">
            <span className="budget-eyebrow">Shop by Budget</span>
            <h2 className="budget-heading">Find the piece for every occasion</h2>
          </div>
          <nav className="budget-list" aria-label="Shop by budget">
            {BUDGETS.map((b) => (
              <Link key={b.href} href={b.href} className="budget-item">
                <span className="budget-label">{b.label}</span>
                <span className="budget-amount">{b.amount}</span>
                <span className="budget-cta">
                  Shop <i className="fas fa-arrow-right" />
                </span>
              </Link>
            ))}
          </nav>
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

      <Testimonials />
    </>
  );
}
