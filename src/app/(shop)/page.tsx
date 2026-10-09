import Link from "next/link";
import Newsletter from "@/components/shop/Newsletter";
import ProductGrid from "@/components/shop/ProductGrid";
import Testimonials from "@/components/shop/Testimonials";
import { getActiveProducts, getCategories } from "@/lib/data";
import { formatINR } from "@/lib/format";

const MARQUEE = [
  "BIS Hallmarked Gold",
  "GIA Certified Diamonds",
  "Conflict-Free Gemstones",
  "Handcrafted to Order",
  "Lifetime Repair Guarantee",
  "Free Insured Shipping",
];

const PROMISES = [
  { icon: "fa-gem", title: "Ethically Sourced", desc: "Conflict-free diamonds. Responsibly mined gold. Verified at every step of our supply chain." },
  { icon: "fa-pen-nib", title: "Made to Order", desc: "Every piece is crafted by a named artisan in our Jaipur atelier. No warehouses. No mass production." },
  { icon: "fa-infinity", title: "Lifetime Service", desc: "We restore, re-polish and re-set your Dina piece for life — at no charge. Always." },
  { icon: "fa-shield-alt", title: "Fully Certified", desc: "BIS hallmark, GIA grading reports, and a Certificate of Authenticity with every piece." },
];

export default async function HomePage() {
  const [products, categories] = await Promise.all([getActiveProducts(), getCategories()]);
  const featuredProducts = products.filter((p) => p.is_featured);
  const featured = featuredProducts[0] ?? products[0];
  const [firstWord, ...rest] = featured?.name.split(" ") ?? [];

  return (
    <>
      <section className="hero">
        <div className="hero-left">
          <div className="hero-pre">Jaipur Atelier · Est. 1982</div>
          <h1 className="hero-h1">
            The art of
            <br />
            the <em>rare</em>
          </h1>
          <p className="hero-desc">
            Every piece at Dina begins with a hand-drawn sketch and ends with a name — that of the artisan who crafted
            it. Not jewellery. Legacy.
          </p>
          <div className="hero-cta-row">
            <Link href="/shop" className="hero-cta">Explore the Edit</Link>
            <a href="#collections" className="hero-cta-ghost">Our Collections</a>
          </div>
        </div>
        <div className="hero-right loaded">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85"
            alt="Diamond pendant necklace"
          />
        </div>
        <div className="hero-strip" />
      </section>

      <div className="marquee-wrap" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span className="marquee-item" key={i}>
              <i className="fas fa-circle" /> {m}
            </span>
          ))}
        </div>
      </div>

      {featured && (
        <div className="featured">
          <div className="featured-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={featured.images[0]} alt={featured.name} />
            <span className="featured-img-label">
              {featured.name}
              {featured.sku && ` · ${featured.sku}`}
            </span>
          </div>
          <div className="featured-body">
            <div className="featured-eyebrow">Signature Piece</div>
            <h2 className="featured-h2">
              {firstWord}
              <br />
              <em>{rest.join(" ")}</em>
            </h2>
            <p className="featured-desc">{featured.description}</p>
            <div className="featured-price">
              {formatINR(featured.price)} <span>incl. all taxes</span>
            </div>
            <Link href={`/product/${featured.slug}`} className="btn-discover">
              View This Piece <i className="fas fa-arrow-right" />
            </Link>
          </div>
        </div>
      )}

      <section className="categories" id="collections">
        <div className="cat-header">
          <div>
            <span className="cat-eyebrow">Explore</span>
            <h2 className="cat-title">
              Our <em>Collections</em>
            </h2>
          </div>
          <Link href="/shop" className="cat-view-all">View All Pieces</Link>
        </div>
        <div className="cat-grid">
          {categories.map((c, i) => {
            const count = products.filter((p) => p.category_id === c.id).length;
            return (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className={`cat-card${i === 0 ? " cat-card--large" : ""}`}
              >
                {c.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="cat-card-img" src={c.image_url} alt={c.name} loading="lazy" />
                )}
                <div className="cat-card-veil" />
                <div className="cat-card-foot">
                  <div className="cat-card-name">{c.name}</div>
                  <div className="cat-card-pieces">
                    {count} {count === 1 ? "Piece" : "Pieces"}
                  </div>
                  <span className="cat-card-enter">
                    Enter <i className="fas fa-arrow-right" style={{ fontSize: 9 }} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="products" id="products">
          <div className="products-header">
            <span className="products-eyebrow">The Edit</span>
            <h2 className="products-title">
              Fine <em>Jewellery</em>
            </h2>
          </div>
          <ProductGrid products={featuredProducts} />
        </section>
      )}

      <section className="statement" id="craft">
        <div className="statement-left">
          <div className="statement-eyebrow">Est. 1982</div>
          <h2 className="statement-h2">
            Where gold
            <br />
            meets <em>devotion</em>
          </h2>
        </div>
        <div className="statement-right">
          <p className="statement-p">
            From a single workshop on Johari Bazaar in Jaipur, three generations of the Dina family have kept one
            promise: that every piece leaving our doors will outlast the hands that made it.
          </p>
          <p className="statement-p">
            We use only conflict-free diamonds certified under the Kimberley Process, BIS-hallmarked 18K and 22K gold,
            and hand-selected gemstones graded in-house before setting.
          </p>
          <div className="statement-nums">
            <div className="s-num">
              <div className="s-num-val">42</div>
              <div className="s-num-label">Years</div>
            </div>
            <div className="s-num">
              <div className="s-num-val">3</div>
              <div className="s-num-label">Generations</div>
            </div>
            <div className="s-num">
              <div className="s-num-val">GIA</div>
              <div className="s-num-label">Certified</div>
            </div>
          </div>
        </div>
      </section>

      <div className="promise">
        {PROMISES.map((p) => (
          <div className="promise-item" key={p.title}>
            <div className="promise-icon"><i className={`fas ${p.icon}`} /></div>
            <div className="promise-title">{p.title}</div>
            <p className="promise-desc">{p.desc}</p>
          </div>
        ))}
      </div>

      <Testimonials />
      <Newsletter />
    </>
  );
}
