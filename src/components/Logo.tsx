import { BRAND } from "@/lib/brand";

/** Small gold jhumka (bell earring), the mark from the Lavni logo. */
export function Jhumka({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 44" fill="currentColor" aria-hidden="true">
      <path d="M12 0v7" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <path d="M12 7l2.6 2.6L12 12.2 9.4 9.6z" />
      <path d="M12 13.5c-5.2 0-9.4 4.6-9.4 11.2h18.8c0-6.6-4.2-11.2-9.4-11.2z" />
      <rect x="1.4" y="24.6" width="21.2" height="2.2" rx="1.1" />
      <path d="M3.5 26.8v4M7.75 26.8v6M12 26.8v8M16.25 26.8v6M20.5 26.8v4" stroke="currentColor" strokeWidth="0.9" fill="none" />
      <circle cx="3.5" cy="32" r="1.5" />
      <circle cx="7.75" cy="34" r="1.6" />
      <circle cx="12" cy="36.6" r="1.8" />
      <circle cx="16.25" cy="34" r="1.6" />
      <circle cx="20.5" cy="32" r="1.5" />
    </svg>
  );
}

/**
 * The Lavni wordmark: "Lavni" with a jhumka hanging from the i, and "Handmade Jewellery" underneath.
 * `tone` picks maroon (for light backgrounds) or light (for maroon backgrounds); colours come from CSS.
 */
export default function Logo({
  tone = "maroon",
  tagline = true,
  className = "",
}: {
  tone?: "maroon" | "light";
  tagline?: boolean;
  className?: string;
}) {
  return (
    <span className={`logo logo--${tone} ${className}`} aria-label={`${BRAND.name} ${BRAND.tagline}`} role="img">
      <span className="logo-word">
        Lavni
        <Jhumka className="logo-jhumka" />
      </span>
      {tagline && <span className="logo-tag">{BRAND.tagline}</span>}
    </span>
  );
}
