"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { useCart } from "./cart";

const LINKS = [
  { href: "/shop", label: "Shop All" },
  { href: "/#collections", label: "Collections" },
  { href: "/#story", label: "Our Story" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shadow, setShadow] = useState(false);
  const { count, open } = useCart();

  // Close the mobile menu on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setShadow(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${shadow ? " raised" : ""}`}>
      <div className="site-header-inner">
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
        <nav className="header-nav" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="header-logo" aria-label="Lavni — home">
          <Logo />
        </Link>
        <div className="header-icons">
          <Link href="/shop" className="header-icon" aria-label="Search">
            <i className="fas fa-search" />
          </Link>
          <button className="header-icon" aria-label={`Cart, ${count} items`} onClick={open}>
            <i className="fas fa-shopping-bag" />
            {count > 0 && <span className="header-cart-count">{count}</span>}
          </button>
        </div>
      </div>
      <nav className={`mobile-menu${menuOpen ? " open" : ""}`} aria-label="Mobile">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
