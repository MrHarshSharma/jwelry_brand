"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { ShopFacets } from "@/lib/data";
import { formatINR } from "@/lib/format";
import { EMPTY_FILTERS, hasActiveFilters, SORTS, shopHref, type ShopFilters, type SortKey } from "@/lib/shop";

const PRICE_PRESETS: { label: string; min: number | null; max: number | null }[] = [
  { label: "Under ₹25,000", min: null, max: 25000 },
  { label: "₹25,000 – ₹75,000", min: 25000, max: 75000 },
  { label: "₹75,000 – ₹1,50,000", min: 75000, max: 150000 },
  { label: "Above ₹1,50,000", min: 150000, max: null },
];

/**
 * Filter sidebar, search and sort for the shop page. Every change is pushed to the URL;
 * the server re-renders the results (passed in as children) for the new query.
 */
export default function ShopBrowser({
  filters,
  facets,
  resultCount,
  children,
}: {
  filters: ShopFilters;
  facets: ShopFacets;
  resultCount: number;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(filters.q);
  const [minInput, setMinInput] = useState(filters.min?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(filters.max?.toString() ?? "");
  const [panelOpen, setPanelOpen] = useState(false);

  // Keep the text inputs in step when the URL changes from elsewhere (chips, "Clear all", back button).
  // `pushedQ` is the last query the search box sent, so a slow response never overwrites what's being typed.
  const [pushedQ, setPushedQ] = useState(filters.q);
  const [syncedHref, setSyncedHref] = useState(shopHref(filters));
  if (syncedHref !== shopHref(filters)) {
    setSyncedHref(shopHref(filters));
    if (filters.q !== pushedQ) {
      setQuery(filters.q);
      setPushedQ(filters.q);
    }
    setMinInput(filters.min?.toString() ?? "");
    setMaxInput(filters.max?.toString() ?? "");
  }

  function apply(next: Partial<ShopFilters>) {
    startTransition(() => router.replace(shopHref({ ...filters, ...next }), { scroll: false }));
  }

  // Search as you type, after a short pause.
  useEffect(() => {
    if (query.trim() === filters.q) return;
    const t = setTimeout(() => {
      setPushedQ(query.trim());
      startTransition(() => router.replace(shopHref({ ...filters, q: query.trim() }), { scroll: false }));
    }, 350);
    return () => clearTimeout(t);
  }, [query, filters, router]);

  const toggleMetal = (m: string) =>
    apply({ metals: filters.metals.includes(m) ? filters.metals.filter((x) => x !== m) : [...filters.metals, m] });

  const applyPriceInputs = () => {
    const parse = (v: string) => (v.trim() === "" || Number.isNaN(Number(v)) ? null : Math.max(0, Math.floor(Number(v))));
    let [min, max] = [parse(minInput), parse(maxInput)];
    if (min !== null && max !== null && min > max) [min, max] = [max, min];
    apply({ min, max });
  };

  const categoryName = facets.categories.find((c) => c.slug === filters.category)?.name;
  const chips: { label: string; clear: Partial<ShopFilters> }[] = [
    filters.q && { label: `“${filters.q}”`, clear: { q: "" } },
    categoryName && { label: categoryName, clear: { category: null } },
    ...filters.metals.map((m) => ({ label: m, clear: { metals: filters.metals.filter((x) => x !== m) } })),
    (filters.min !== null || filters.max !== null) && {
      label:
        filters.min !== null && filters.max !== null
          ? `${formatINR(filters.min)} – ${formatINR(filters.max)}`
          : filters.min !== null
            ? `From ${formatINR(filters.min)}`
            : `Up to ${formatINR(filters.max!)}`,
      clear: { min: null, max: null },
    },
    filters.sale && { label: "On sale", clear: { sale: false } },
    filters.inStock && { label: "In stock", clear: { inStock: false } },
  ].filter(Boolean) as { label: string; clear: Partial<ShopFilters> }[];

  return (
    <div className="shop-layout">
      <aside className={`shop-filters${panelOpen ? " open" : ""}`} aria-label="Filters">
        <div className="shop-filters-head">
          <span>Filters</span>
          <button className="shop-filters-close" onClick={() => setPanelOpen(false)} aria-label="Close filters">
            <i className="fas fa-times" />
          </button>
        </div>

        <FilterGroup title="Collection">
          <label className="shop-opt">
            <input type="radio" name="category" checked={!filters.category} onChange={() => apply({ category: null })} />
            <span>All pieces</span>
          </label>
          {facets.categories.map((c) => (
            <label className="shop-opt" key={c.id}>
              <input
                type="radio"
                name="category"
                checked={filters.category === c.slug}
                onChange={() => apply({ category: c.slug })}
              />
              <span>{c.name}</span>
              <em>{c.count}</em>
            </label>
          ))}
        </FilterGroup>

        <FilterGroup title="Price">
          {PRICE_PRESETS.map((p) => (
            <label className="shop-opt" key={p.label}>
              <input
                type="radio"
                name="price"
                checked={filters.min === p.min && filters.max === p.max}
                onChange={() => apply({ min: p.min, max: p.max })}
              />
              <span>{p.label}</span>
            </label>
          ))}
          <form
            className="shop-price-inputs"
            onSubmit={(e) => {
              e.preventDefault();
              applyPriceInputs();
            }}
          >
            <input
              inputMode="numeric"
              placeholder={`Min ${formatINR(facets.priceRange.min)}`}
              value={minInput}
              onChange={(e) => setMinInput(e.target.value.replace(/\D/g, ""))}
              aria-label="Minimum price"
            />
            <span>–</span>
            <input
              inputMode="numeric"
              placeholder={`Max ${formatINR(facets.priceRange.max)}`}
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value.replace(/\D/g, ""))}
              aria-label="Maximum price"
            />
            <button type="submit" aria-label="Apply price range" disabled={pending} aria-busy={pending}>
              <i className={pending ? "fas fa-spinner fa-spin" : "fas fa-arrow-right"} />
            </button>
          </form>
        </FilterGroup>

        {facets.metals.length > 0 && (
          <FilterGroup title="Metal">
            {facets.metals.map((m) => (
              <label className="shop-opt" key={m.name}>
                <input type="checkbox" checked={filters.metals.includes(m.name)} onChange={() => toggleMetal(m.name)} />
                <span>{m.name}</span>
                <em>{m.count}</em>
              </label>
            ))}
          </FilterGroup>
        )}

        <FilterGroup title="Availability">
          <label className="shop-opt">
            <input type="checkbox" checked={filters.inStock} onChange={() => apply({ inStock: !filters.inStock })} />
            <span>In stock only</span>
          </label>
          <label className="shop-opt">
            <input type="checkbox" checked={filters.sale} onChange={() => apply({ sale: !filters.sale })} />
            <span>On sale</span>
          </label>
        </FilterGroup>

        <button className="shop-filters-done" onClick={() => setPanelOpen(false)}>
          Show {resultCount} {resultCount === 1 ? "piece" : "pieces"}
        </button>
      </aside>
      {panelOpen && <div className="shop-filters-veil" onClick={() => setPanelOpen(false)} />}

      <div className="shop-main">
        <div className="shop-toolbar">
          <div className="shop-search">
            <i className="fas fa-search" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rings, diamonds, gold…"
              aria-label="Search products"
            />
            {pending && <i className="fas fa-spinner fa-spin shop-search-spin" />}
          </div>
          <button className="shop-filters-toggle" onClick={() => setPanelOpen(true)}>
            <i className="fas fa-sliders-h" /> Filters{chips.length > 0 && ` (${chips.length})`}
          </button>
          <label className="shop-sort">
            <span>Sort</span>
            <select value={filters.sort} onChange={(e) => apply({ sort: e.target.value as SortKey })}>
              {Object.entries(SORTS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="shop-summary">
          <span className="shop-count">
            {resultCount} {resultCount === 1 ? "piece" : "pieces"}
          </span>
          {chips.map((c) => (
            <button key={c.label} className="shop-chip" onClick={() => apply(c.clear)}>
              {c.label} <i className="fas fa-times" />
            </button>
          ))}
          {hasActiveFilters(filters) && (
            <button className="shop-clear" onClick={() => apply({ ...EMPTY_FILTERS, sort: filters.sort })}>
              Clear all
            </button>
          )}
        </div>

        <div className={`shop-results${pending ? " pending" : ""}`} aria-busy={pending}>
          {children}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="shop-group">
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}
