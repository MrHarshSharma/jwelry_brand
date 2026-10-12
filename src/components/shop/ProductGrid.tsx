"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "./cart";

export const BADGE_CLASS = { new: "badge-new", sale: "badge-sale", bestseller: "badge-bestseller" } as const;
const BADGE_LABEL = { new: "New", sale: "Sale", bestseller: "Bestseller" } as const;

/** True when a product needs a size or colour picked before it can go into the cart. */
export const needsOptions = (p: Product) => p.sizes.length > 1 || p.colors.length > 1;

/** Responsive grid of product cards (shop page). */
export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="prod-grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

/** Horizontally scrolling row of product cards with arrow buttons (home page). */
export function ProductCarousel({ products }: { products: Product[] }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: -1 | 1) =>
    track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className="pcarousel">
      <button className="pcarousel-arrow prev" onClick={() => scroll(-1)} aria-label="Previous products">
        <i className="fas fa-chevron-left" />
      </button>
      <div className="pcarousel-track" ref={track}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <button className="pcarousel-arrow next" onClick={() => scroll(1)} aria-label="Next products">
        <i className="fas fa-chevron-right" />
      </button>
    </div>
  );
}

export function ProductCard({ product: p }: { product: Product }) {
  const router = useRouter();
  const { add, open } = useCart();
  const [added, setAdded] = useState(false);
  const [opening, startOpening] = useTransition();
  const soldOut = p.stock === 0;
  const href = `/product/${p.slug}`;
  const off = p.original_price && p.original_price > p.price ? Math.round((1 - p.price / p.original_price) * 100) : 0;

  function onAdd() {
    if (needsOptions(p)) {
      startOpening(() => router.push(href));
      return;
    }
    add({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      image: p.images[0] ?? "",
      size: p.sizes[0],
      color: p.colors[0]?.name,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
    open();
  }

  return (
    <div className="pcard">
      <Link href={href} className="pcard-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.images[0]} alt={p.name} loading="lazy" />
        {soldOut ? (
          <span className="pcard-badge pcard-badge-muted">Sold out</span>
        ) : (
          p.badge && <span className={`pcard-badge ${BADGE_CLASS[p.badge]}`}>{BADGE_LABEL[p.badge]}</span>
        )}
        {p.reviews_count > 0 && (
          <span className="pcard-rating">
            <i className="fas fa-star" /> {p.rating} <span className="pcard-rating-sep">|</span> {p.reviews_count}
          </span>
        )}
      </Link>
      <div className="pcard-info">
        <Link href={href} className="pcard-title">
          {p.name}
        </Link>
        <div className="pcard-price">
          <span className="pcard-now">{formatINR(p.price)}</span>
          {off > 0 && (
            <>
              <span className="pcard-was">{formatINR(p.original_price!)}</span>
              <span className="pcard-off">{off}% off</span>
            </>
          )}
        </div>
        <button className="pcard-btn" onClick={onAdd} disabled={soldOut || opening} aria-busy={opening}>
          {soldOut ? (
            "Sold out"
          ) : opening ? (
            <>
              <i className="fas fa-spinner fa-spin" /> Loading…
            </>
          ) : added ? (
            "Added ✓"
          ) : needsOptions(p) ? (
            "Choose options"
          ) : (
            "Add to cart"
          )}
        </button>
      </div>
    </div>
  );
}
