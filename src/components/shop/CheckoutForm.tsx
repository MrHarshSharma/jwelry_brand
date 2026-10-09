"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { checkPromo, placeOrder, type CheckoutInput } from "@/app/(shop)/checkout/actions";
import { formatINR } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/types";
import { useCart } from "./cart";
import Steps from "./Steps";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const PAY_ICONS = { cod: "fa-money-bill-wave", upi: "fa-mobile-alt", bank_transfer: "fa-university" } as const;
const PAY_SUBS = {
  cod: "Pay when your order arrives",
  upi: "We'll share our UPI ID on WhatsApp",
  bank_transfer: "We'll share bank details on WhatsApp",
} as const;

type Customer = CheckoutInput["customer"];
const EMPTY: Customer = {
  name: "", phone: "", email: "", address: "", landmark: "", city: "", state: "", pincode: "", notes: "",
  payment_method: "cod",
};

export default function CheckoutForm({ shippingFee, freeShippingThreshold }: { shippingFee: number; freeShippingThreshold: number }) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [customer, setCustomer] = useState<Customer>(EMPTY);
  const [errorField, setErrorField] = useState<string>();
  const [error, setError] = useState<string>();
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; pct: number } | null>(null);
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [pending, startTransition] = useTransition();
  const [placed, setPlaced] = useState(false);

  const discount = promo ? Math.round((subtotal * promo.pct) / 100) : 0;
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const total = subtotal - discount + shipping;

  if (items.length === 0 && !placed) {
    return (
      <>
        <Steps current={0} />
        <div className="empty-state">
          <i className="fas fa-shopping-bag" />
          <h2>Your cart is empty</h2>
          <p>Add pieces to your cart before checking out.</p>
          <Link href="/shop" className="btn-return">Return to Shop</Link>
        </div>
      </>
    );
  }

  const set = (field: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setCustomer((c) => ({ ...c, [field]: e.target.value }));
    if (errorField === field) setErrorField(undefined);
  };
  const cls = (field: keyof Customer) => (errorField === field ? "error" : undefined);

  async function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code || applyingPromo) return;
    setApplyingPromo(true);
    const pct = await checkPromo(code).finally(() => setApplyingPromo(false));
    if (pct) {
      setPromo({ code, pct });
      setPromoMsg({ ok: true, text: `${pct}% discount applied.` });
    } else {
      setPromo(null);
      setPromoMsg({ ok: false, text: "That promo code isn't valid." });
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const res = await placeOrder({
        customer,
        items: items.map((i) => ({ product_id: i.productId, quantity: i.qty, size: i.size, color: i.color })),
        promoCode: promo?.code,
      });
      if (!res.ok) {
        setError(res.error);
        setErrorField(res.field);
        return;
      }
      setPlaced(true);
      clear();
      router.push(`/order/${res.orderId}?new=1`);
    });
  }

  return (
    <>
      <Steps current={1} />
      <form className="checkout-layout" onSubmit={submit} noValidate>
        <div className="form-area">
          <div className="form-block">
            <div className="form-block-title"><i className="far fa-user" /> Contact</div>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="name">Full Name</label>
                <input id="name" className={cls("name")} value={customer.name} onChange={set("name")} placeholder="Priya Sharma" autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="phone">WhatsApp Number</label>
                <input id="phone" type="tel" className={cls("phone")} value={customer.phone} onChange={set("phone")} placeholder="+91 98765 43210" autoComplete="tel" />
              </div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="email">Email <span className="field-opt">(optional)</span></label>
                <input id="email" type="email" className={cls("email")} value={customer.email} onChange={set("email")} placeholder="priya@example.com" autoComplete="email" />
              </div>
            </div>
          </div>

          <div className="form-block">
            <div className="form-block-title"><i className="fas fa-map-marker-alt" /> Shipping Address</div>
            <div className="field-grid full" style={{ marginBottom: 14 }}>
              <div className="field">
                <label htmlFor="address">Address</label>
                <input id="address" className={cls("address")} value={customer.address} onChange={set("address")} placeholder="House No., Street, Area" autoComplete="street-address" />
              </div>
            </div>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="city">City</label>
                <input id="city" className={cls("city")} value={customer.city} onChange={set("city")} placeholder="Mumbai" autoComplete="address-level2" />
              </div>
              <div className="field">
                <label htmlFor="state">State</label>
                <select id="state" className={cls("state")} value={customer.state} onChange={set("state")}>
                  <option value="">Select State</option>
                  {STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="field-grid three" style={{ marginTop: 14 }}>
              <div className="field">
                <label htmlFor="pincode">Pincode</label>
                <input id="pincode" inputMode="numeric" maxLength={6} className={cls("pincode")} value={customer.pincode} onChange={set("pincode")} placeholder="400001" autoComplete="postal-code" />
              </div>
              <div className="field" style={{ gridColumn: "span 2" }}>
                <label htmlFor="landmark">Landmark <span className="field-opt">(optional)</span></label>
                <input id="landmark" value={customer.landmark} onChange={set("landmark")} placeholder="Near metro station" />
              </div>
            </div>
            <div className="field-grid full" style={{ marginTop: 14 }}>
              <div className="field">
                <label htmlFor="notes">Order Notes <span className="field-opt">(optional)</span></label>
                <textarea id="notes" rows={3} value={customer.notes} onChange={set("notes")} placeholder="Engraving, gift wrap, delivery instructions…" />
              </div>
            </div>
          </div>

          <div className="form-block">
            <div className="form-block-title"><i className="far fa-credit-card" /> Payment</div>
            <div className="pay-options">
              {(Object.keys(PAYMENT_METHODS) as (keyof typeof PAYMENT_METHODS)[]).map((m) => (
                <label className="pay-opt" key={m}>
                  <input type="radio" name="pay" value={m} checked={customer.payment_method === m} onChange={set("payment_method")} />
                  <span className="pay-opt-icon"><i className={`fas ${PAY_ICONS[m]}`} /></span>
                  <div>
                    <div className="pay-opt-label">{PAYMENT_METHODS[m]}</div>
                    <div className="pay-opt-sub">{PAY_SUBS[m]}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <aside className="summary-panel">
          <div className="summary-head">Order Summary</div>
          <div className="summary-items">
            {items.map((item) => (
              <div className="summary-row" key={item.key}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="summary-img" src={item.image} alt={item.name} />
                <div>
                  <div className="summary-name">{item.name}</div>
                  <div className="summary-qty">
                    Qty: {item.qty}
                    {item.size && ` · ${item.size}`}
                    {item.color && ` · ${item.color}`}
                  </div>
                </div>
                <div className="summary-price">{formatINR(item.price * item.qty)}</div>
              </div>
            ))}
          </div>

          <div className="promo-row">
            <input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyPromo();
                }
              }}
              placeholder="Promo code"
              aria-label="Promo code"
            />
            <button type="button" onClick={applyPromo} disabled={applyingPromo} aria-busy={applyingPromo}>
              {applyingPromo ? <i className="fas fa-spinner fa-spin" /> : promo ? `${promo.pct}% Off ✓` : "Apply"}
            </button>
          </div>
          {promoMsg && <div className={`promo-msg ${promoMsg.ok ? "ok" : "err"}`}>{promoMsg.text}</div>}

          <div className="summary-totals">
            <div className="total-row"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            {discount > 0 && (
              <div className="total-row"><span>Discount ({promo?.code})</span><span className="discount-label">−{formatINR(discount)}</span></div>
            )}
            <div className="total-row">
              <span>Shipping</span>
              <span className={shipping === 0 ? "free-label" : undefined}>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
            </div>
            <div className="total-row grand"><span>Total</span><span>{formatINR(total)}</span></div>
          </div>

          <div className="summary-cta">
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="btn-place btn-whatsapp" type="submit" disabled={pending}>
              {pending ? (
                <><i className="fas fa-spinner fa-spin" /> Placing Order…</>
              ) : (
                <><i className="fab fa-whatsapp" /> Place Order via WhatsApp</>
              )}
            </button>
            <div className="secure-tag">
              <i className="fas fa-lock" /> You&rsquo;ll confirm the order with us on WhatsApp
            </div>
          </div>
        </aside>
      </form>
    </>
  );
}
