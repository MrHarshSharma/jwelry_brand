"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatINR, stars } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCart } from "./cart";
import { BADGE_CLASS } from "./ProductGrid";

export default function ProductDetail({ product: p }: { product: Product }) {
  const router = useRouter();
  const { add, open } = useCart();
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState(p.sizes[0]);
  const [color, setColor] = useState(p.colors[0]?.name);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [openAcc, setOpenAcc] = useState<string | null>(null);
  const [buying, startBuying] = useTransition();

  const soldOut = p.stock === 0;
  const maxQty = Math.min(p.stock ?? 20, 20);
  const off = p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : 0;

  function addToCart() {
    add({ productId: p.id, slug: p.slug, name: p.name, price: p.price, image: p.images[0] ?? "", size, color }, qty);
  }

  // A choice with only one value isn't a choice: show it as a detail instead of a picker.
  const pickColour = p.colors.length > 1;
  const pickSize = p.sizes.length > 1;
  const details = [
    ["Metal", p.metal],
    ["Stone", p.stone],
    ["Colour", !pickColour ? p.colors[0]?.name : null],
    ["Size", !pickSize ? p.sizes[0] : null],
    ["Occasion", p.occasion],
    ["SKU", p.sku],
  ].filter((d): d is [string, string] => Boolean(d[1]));

  const accordions = [
    p.care.length > 0 && {
      id: "care",
      title: "Care Instructions",
      body: (
        <ul>
          {p.care.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      ),
    },
    p.delivery && { id: "delivery", title: "Delivery & Returns", body: <p>{p.delivery}</p> },
  ].filter(Boolean) as { id: string; title: string; body: React.ReactNode }[];

  return (
    <div className="product-wrap">
      <div className="gallery-side">
        <div className="gallery-sticky">
          <div className="main-img-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="main-img" src={p.images[imgIdx]} alt={p.name} />
            {p.badge && <span className={`badge-overlay ${BADGE_CLASS[p.badge]}`}>{p.badge}</span>}
          </div>
          {p.images.length > 1 && (
            <div className="thumbs-strip">
              {p.images.map((src, i) => (
                <div key={src} className={`thumb-item${i === imgIdx ? " active" : ""}`} onClick={() => setImgIdx(i)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="info-side">
        {p.category && <div className="info-cat">{p.category.name}</div>}
        <h1 className="info-name">{p.name}</h1>
        <div className="rating-row">
          {p.reviews_count > 0 && (
            <>
              <span className="stars-g">{stars(p.rating)}</span>
              <span className="rev-c">{p.reviews_count} reviews</span>
              <span className="dot-sep">·</span>
            </>
          )}
          {soldOut ? (
            <span className="out-stock-tag">Sold out</span>
          ) : (
            <span className="in-stock-tag">{p.stock !== null && p.stock <= 3 ? `Only ${p.stock} left` : "In stock"}</span>
          )}
        </div>

        <div className="pd-price">
          <span className="price-main">{formatINR(p.price)}</span>
          {p.original_price && (
            <>
              <span className="price-orig">{formatINR(p.original_price)}</span>
              <span className="price-off">{off}% off</span>
            </>
          )}
          <span className="tax-line">Incl. of all taxes</span>
        </div>

        {p.description && <p className="pd-desc">{p.description}</p>}

        {details.length > 0 && (
          <section className="pd-specs" aria-labelledby="pd-specs-title">
            <h2 className="pd-specs-title" id="pd-specs-title">
              Product Details
            </h2>
            <dl className="pd-details">
              {details.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {(pickColour || pickSize) && (
          <div className="pd-options">
            {pickColour && (
              <div className="pd-opt">
                <span className="pd-opt-label">
                  Colour <b>{color}</b>
                </span>
                <div className="swatches">
                  {p.colors.map((c) => (
                    <button
                      key={c.name}
                      className={`swatch${c.name === color ? " active" : ""}`}
                      style={{ background: c.hex }}
                      title={c.name}
                      aria-label={c.name}
                      aria-pressed={c.name === color}
                      onClick={() => setColor(c.name)}
                    />
                  ))}
                </div>
              </div>
            )}
            {pickSize && (
              <div className="pd-opt">
                <span className="pd-opt-label">
                  Size <b>{size}</b>
                </span>
                <div className="sizes">
                  {p.sizes.map((s) => (
                    <button
                      key={s}
                      className={`sz-btn${s === size ? " active" : ""}`}
                      aria-pressed={s === size}
                      onClick={() => setSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pd-buy">
          {!soldOut && (
            <div className="qty-row" aria-label="Quantity">
              <button className="qty-minus" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                −
              </button>
              <div className="qty-display" aria-live="polite">{qty}</div>
              <button className="qty-plus" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} aria-label="Increase quantity">
                +
              </button>
            </div>
          )}
          <button
            className="btn-add-cart"
            disabled={soldOut}
            onClick={() => {
              addToCart();
              setAdded(true);
              setTimeout(() => setAdded(false), 1400);
              open();
            }}
          >
            {soldOut ? "Sold Out" : added ? "Added ✓" : "Add to Cart"}
          </button>
          {!soldOut && (
            <button
              className="btn-buy"
              disabled={buying}
              aria-busy={buying}
              onClick={() => {
                addToCart();
                startBuying(() => router.push("/checkout"));
              }}
            >
              {buying ? (
                <>
                  <i className="fas fa-spinner fa-spin" /> Loading…
                </>
              ) : (
                "Buy Now"
              )}
            </button>
          )}
        </div>

        <ul className="pd-assure">
          <li>
            <i className="fas fa-hand-sparkles" /> Handmade in Nagpur
          </li>
          <li>
            <i className="fas fa-pen-nib" /> Made to order
          </li>
          <li>
            <i className="fab fa-whatsapp" /> Order on WhatsApp
          </li>
        </ul>

        <div className="pd-accordions">
          {accordions.map((a) => (
            <div key={a.id} className={`acc${openAcc === a.id ? " open" : ""}`}>
              <button
                className="acc-hdr"
                aria-expanded={openAcc === a.id}
                onClick={() => setOpenAcc(openAcc === a.id ? null : a.id)}
              >
                {a.title} <i className="fas fa-chevron-down" />
              </button>
              <div className="acc-body">{a.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
