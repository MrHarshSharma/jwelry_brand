"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

/** Search box that filters the orders list as you type. Keeps the current status tab. */
export default function OrdersSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlQ = params.get("q") ?? "";
  const [q, setQ] = useState(urlQ);
  const [pushedQ, setPushedQ] = useState(urlQ);
  const [pending, startTransition] = useTransition();

  // Pick up changes made outside the box (back button, "all orders" links) without clobbering typing.
  if (urlQ !== pushedQ) {
    setPushedQ(urlQ);
    setQ(urlQ);
  }

  useEffect(() => {
    if (q.trim() === urlQ) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (q.trim()) next.set("q", q.trim());
      else next.delete("q");
      next.delete("page");
      setPushedQ(q.trim());
      startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
    }, 300);
    return () => clearTimeout(t);
  }, [q, urlQ, params, pathname, router]);

  return (
    <div className="adm-search">
      <i className="fas fa-search" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search order #, name or phone"
        aria-label="Search orders"
      />
      {pending && <i className="fas fa-spinner fa-spin adm-inline-spin" />}
    </div>
  );
}
