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
  const [openAcc, setOpenAcc] = useState<string | null>("desc");
  const [buying, startBuying] = useTransition();

  const soldOut = p.stock === 0;
  const maxQty = Math.min(p.stock ?? 20, 20);
  const off = p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : 0;

  function addToCart() {
    add({ productId: p.id, slug: p.slug, name: p.name, price: p.price, image: p.images[0] ?? "", size, color }, qty);
  }

  const accordions = [
    { id: "desc", title: "Description", body: <p>{p.description}</p> },
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
        <div className="info-cat">{p.category?.name}</div>
        <h1 className="info-name">{p.name}</h1>
        <div className="rating-row">
          <span className="stars-g">{stars(p.rating)}</span>
          <span className="rev-c">{p.reviews_count} reviews</span>
          <span className="dot-sep">|</span>
          {soldOut ? (
            <span className="out-stock-tag">Sold out</span>
          ) : (
            <span className="in-stock-tag">{p.stock !== null && p.stock <= 3 ? `Only ${p.stock} left` : "In Stock"}</span>
          )}
        </div>

        <div className="price-area">
          <span className="price-main">{formatINR(p.price)}</span>
          {p.original_price && (
            <>
              <span className="price-orig">{formatINR(p.original_price)}</span>
              <span className="price-off">{off}% off</span>
            </>
          )}
          <div className="tax-line">Inclusive of all taxes</div>
        </div>

        {(p.metal || p.stone || p.occasion) && (
          <div className="spec-row">
            {p.metal && <Spec k="Metal" v={p.metal} />}
            {p.stone && <Spec k="Stone" v={p.stone} />}
            {p.occasion && <Spec k="Occasion" v={p.occasion} />}
            {p.sku && <Spec k="SKU" v={p.sku} />}
          </div>
        )}

        {p.colors.length > 0 && (
          <div className="opt-block">
            <div className="opt-label">
              Colour <span className="opt-val">{color}</span>
            </div>
            <div className="swatches">
              {p.colors.map((c) => (
                <button
                  key={c.name}
                  className={`swatch${c.name === color ? " active" : ""}`}
                  style={{ background: c.hex }}
                  title={c.name}
                  aria-label={c.name}
                  onClick={() => setColor(c.name)}
                />
              ))}
            </div>
          </div>
        )}

        {p.sizes.length > 0 && (
          <div className="opt-block">
            <div className="opt-label">
              Size <span className="opt-val">{size}</span>
            </div>
            <div className="sizes">
              {p.sizes.map((s) => (
                <button key={s} className={`sz-btn${s === size ? " active" : ""}`} onClick={() => setSize(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {!soldOut && (
          <div className="opt-block">
            <div className="opt-label">Quantity</div>
            <div className="qty-row">
              <button className="qty-minus" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <div className="qty-display">{qty}</div>
              <button className="qty-plus" onClick={() => setQty((q) => Math.min(maxQty, q + 1))}>+</button>
            </div>
          </div>
        )}

        <div className="action-row">
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
              {buying ? <><i className="fas fa-spinner fa-spin" /> Loading…</> : "Buy Now"}
            </button>
          )}
        </div>

        <div className="cert-strip">
          <i className="fas fa-hand-sparkles" /> Handmade in Nagpur · Made to order for you
        </div>

        {accordions.map((a) => (
          <div key={a.id} className={`acc${openAcc === a.id ? " open" : ""}`}>
            <div className="acc-hdr" onClick={() => setOpenAcc(openAcc === a.id ? null : a.id)}>
              {a.title} <i className="fas fa-chevron-down" />
            </div>
            <div className="acc-body">{a.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="spec-tile">
      <div className="spec-tile-k">{k}</div>
      <div className="spec-tile-v">{v}</div>
    </div>
  );
}
