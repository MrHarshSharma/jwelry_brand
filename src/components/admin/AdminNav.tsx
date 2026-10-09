"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Overview", icon: "fa-chart-line" },
  { href: "/admin/orders", label: "Orders", icon: "fa-receipt" },
  { href: "/admin/products", label: "Products", icon: "fa-gem" },
  { href: "/admin/categories", label: "Categories", icon: "fa-layer-group" },
  { href: "/admin/promos", label: "Promo Codes", icon: "fa-tag" },
  { href: "/admin/customers", label: "Customers", icon: "fa-users" },
  { href: "/admin/settings", label: "Settings", icon: "fa-cog" },
];

export default function AdminNav({ pendingOrders }: { pendingOrders: number }) {
  const pathname = usePathname();
  return (
    <nav className="adm-nav">
      {NAV.map((n) => {
        const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} className={active ? "active" : undefined}>
            <i className={`fas ${n.icon}`} />
            {n.label}
            {n.href === "/admin/orders" && pendingOrders > 0 && <span className="adm-nav-count">{pendingOrders}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
