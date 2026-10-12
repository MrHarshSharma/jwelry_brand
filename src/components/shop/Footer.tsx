import Link from "next/link";
import Logo from "@/components/Logo";
import SocialLinks from "@/components/shop/SocialLinks";
import { BRAND } from "@/lib/brand";


export default function Footer({ categories }: { categories: { slug: string; name: string }[] }) {
  const { address } = BRAND;

  return (
    <footer>
      <div className="footer-top">
        <div>
          <Link href="/" className="footer-logo-mark" aria-label={`${BRAND.name} — home`}>
            <Logo />
          </Link>
          <p className="footer-tagline">Handmade in Nagpur, worn with pride.</p>
          <SocialLinks className="footer-social" />
        </div>
        <div className="footer-col">
          <h5>Collections</h5>
          <ul>
            <li><Link href="/shop">Shop All</Link></li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/shop?category=${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h5>Help</h5>
          <ul>
            <li><Link href="/shop">Browse &amp; Search</Link></li>
            <li><Link href="/#craft">Our Story</Link></li>
            <li><Link href="/checkout">Checkout</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Atelier</h5>
          <address>
            {address.street && (
              <>
                {address.street}
                <br />
              </>
            )}
            {address.city}, {address.region}
            {address.postalCode && ` ${address.postalCode}`}
            <br />
            India
            {(BRAND.phone || BRAND.email) && <br />}
            {BRAND.phone && (
              <>
                <br />
                <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`}>{BRAND.phone}</a>
              </>
            )}
            {BRAND.email && (
              <>
                <br />
                <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
              </>
            )}
            {BRAND.hours && (
              <>
                <br />
                <br />
                {BRAND.hours}
              </>
            )}
          </address>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} {BRAND.legalName}, Nagpur. All rights reserved.
        </p>
        <p className="footer-made">Handcrafted in Maharashtra</p>
      </div>
    </footer>
  );
}
