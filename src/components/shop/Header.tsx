"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./cart";

const LINKS = [
  { href: "/#collections", label: "Collections" },
  { href: "/shop", label: "Shop" },
  { href: "/#craft", label: "Our Story" },
];

export default function Header() {
  const pathname = usePathname();
  const overHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, open } = useCart();

  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  const solid = !overHero || scrolled;

  return (
    <>
      <header className={`topbar${solid ? " scrolled" : ""}`}>
        <button
          className={`hamburger-btn${menuOpen ? " open" : ""}`}
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className="nav-left">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="topbar-logo">
          Dina<em>.</em>
        </Link>
        <div className="nav-right">
          <button className="nav-icon-btn" aria-label="Cart" onClick={open}>
            <i className="fas fa-shopping-bag" />
            <span className="nav-cart-dot">{count}</span>
          </button>
        </div>
      </header>
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
            {l.label}
          </Link>
        ))}
      </div>
      {!overHero && <div className="topbar-spacer" />}
    </>
  );
}
