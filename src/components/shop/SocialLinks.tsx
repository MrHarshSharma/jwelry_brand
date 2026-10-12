import { BRAND } from "@/lib/brand";

const ICONS = {
  instagram: { icon: "fa-instagram", label: "Instagram" },
  facebook: { icon: "fa-facebook-f", label: "Facebook" },
  pinterest: { icon: "fa-pinterest-p", label: "Pinterest" },
  youtube: { icon: "fa-youtube", label: "YouTube" },
} as const;

/** Round social icons for every network that has a link in BRAND.social. Renders nothing if none are set. */
export default function SocialLinks({ className = "social-links" }: { className?: string }) {
  const networks = (Object.keys(ICONS) as (keyof typeof ICONS)[]).filter((k) => BRAND.social[k]);
  if (!networks.length) return null;
  return (
    <div className={className}>
      {networks.map((k) => (
        <a
          key={k}
          href={BRAND.social[k]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${BRAND.name} on ${ICONS[k].label}`}
        >
          <i className={`fab ${ICONS[k].icon}`} />
        </a>
      ))}
    </div>
  );
}

export const hasSocialLinks = () => Object.values(BRAND.social).some(Boolean);
