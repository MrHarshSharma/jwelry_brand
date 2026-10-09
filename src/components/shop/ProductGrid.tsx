"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatINR, stars } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "./cart";

export const BADGE_CLASS = { new: "badge-new", sale: "badge-sale", bestseller: "badge-bestseller" } as const;

/** True when a product can go straight into the cart without picking a size or colour. */
export const needsOptions = (p: Product) => p.sizes.length > 1 || p.colors.length > 1;

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="prod-grid">
      {products.map((p) => (
        <ProductTile key={p.id} product={p} />
      ))}
    </div>
  );
}

function ProductTile({ product: p }: { product: Product }) {
  const router = useRouter();
  const { add, open } = useCart();
  const [added, setAdded] = useState(false);
  const [opening, startOpening] = useTransition();
  const soldOut = p.stock === 0;

  function onAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (needsOptions(p)) {
      startOpening(() => router.push(`/product/${p.slug}`));
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
    <Link href={`/product/${p.slug}`} className="prod-tile">
      <div className="prod-tile-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.images[0]} alt={p.name} loading="lazy" />
        {soldOut ? (
          <span className="prod-tile-badge badge-new">Sold Out</span>
        ) : (
          p.badge && <span className={`prod-tile-badge ${BADGE_CLASS[p.badge]}`}>{p.badge}</span>
        )}
        {!soldOut && (
          <div className="prod-tile-hover">
            <button className="tile-add-btn" onClick={onAdd} disabled={opening} aria-busy={opening}>
              {opening ? (
                <>
                  <i className="fas fa-spinner fa-spin" /> Loading…
                </>
              ) : added ? (
                "Added ✓"
              ) : needsOptions(p) ? (
                "Choose Options"
              ) : (
                "Add to Cart"
              )}
            </button>
          </div>
        )}
      </div>
      <div className="prod-tile-info">
        <div className="prod-tile-cat">{p.category?.name}</div>
        <div className="prod-tile-name">{p.name}</div>
        <div className="prod-tile-price-row">
          <span className="p-now">{formatINR(p.price)}</span>
          {p.original_price && <span className="p-was">{formatINR(p.original_price)}</span>}
        </div>
        <div className="prod-tile-stars">
          {stars(p.rating)} <span>({p.reviews_count})</span>
        </div>
      </div>
    </Link>
  );
}
