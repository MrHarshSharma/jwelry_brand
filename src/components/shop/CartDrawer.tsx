"use client";

import Link from "next/link";
import { useEffect } from "react";
import { formatINR } from "@/lib/format";
import { useCart } from "./cart";

export default function CartDrawer() {
  const { items, count, subtotal, isOpen, close, setQty, remove } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  return (
    <>
      <div className={`cart-veil${isOpen ? " open" : ""}`} onClick={close} />
      <aside className={`cart-panel${isOpen ? " open" : ""}`} aria-label="Shopping cart">
        <div className="cart-panel-head">
          <div>
            <span className="cart-panel-title">Cart</span>
            <span className="cart-panel-count">({count})</span>
          </div>
          <button className="cart-close" onClick={close} aria-label="Close cart">
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="cart-panel-body">
          {items.length === 0 ? (
            <div className="cart-void">
              <i className="fas fa-shopping-bag" />
              <p>Your cart is empty</p>
              <Link href="/shop" onClick={close}>
                Begin Shopping
              </Link>
            </div>
          ) : (
            <ul className="cart-list">
              {items.map((item) => (
                <li className="cart-row" key={item.key}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="cart-row-img" src={item.image} alt={item.name} />
                  <div>
                    <Link href={`/product/${item.slug}`} onClick={close} className="cart-row-name">
                      {item.name}
                    </Link>
                    <div className="cart-row-price">
                      {formatINR(item.price)}
                      {item.size && ` · ${item.size}`}
                      {item.color && ` · ${item.color}`}
                    </div>
                    <div className="cart-row-qty">
                      <button className="cqty" onClick={() => setQty(item.key, item.qty - 1)} aria-label="Decrease">
                        −
                      </button>
                      <span className="cqty-n">{item.qty}</span>
                      <button className="cqty" onClick={() => setQty(item.key, item.qty + 1)} aria-label="Increase">
                        +
                      </button>
                    </div>
                  </div>
                  <button className="cart-row-del" onClick={() => remove(item.key)} aria-label="Remove">
                    <i className="fas fa-times" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="cart-panel-foot">
            <div className="cart-total-row">
              <span className="cart-total-label">Subtotal</span>
              <span className="cart-total-val">{formatINR(subtotal)}</span>
            </div>
            <p className="cart-foot-note">Shipping & discounts at checkout</p>
            <Link href="/checkout" className="btn-to-checkout" onClick={close}>
              Proceed to Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
