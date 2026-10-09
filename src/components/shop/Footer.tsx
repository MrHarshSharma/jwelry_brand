import Link from "next/link";

export default function Footer({ categories }: { categories: { slug: string; name: string }[] }) {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <span className="footer-logo-mark">
            Dina<em>.</em>
          </span>
          <p className="footer-tagline">
            &ldquo;Crafted for eternity,
            <br />
            given with love.&rdquo;
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram" /></a>
            <a href="#" aria-label="Pinterest"><i className="fab fa-pinterest-p" /></a>
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
            <a href="#" aria-label="YouTube"><i className="fab fa-youtube" /></a>
          </div>
        </div>
        <div className="footer-col">
          <h5>Collections</h5>
          <ul>
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
            <li><a href="#">Size Guide</a></li>
            <li><a href="#">Care Guide</a></li>
            <li><a href="#">Shipping & Returns</a></li>
            <li><a href="#">Certification</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Atelier</h5>
          <address>
            14 Johari Bazaar
            <br />
            Jaipur, Rajasthan 302003
            <br />
            <br />
            <a href="tel:+911412345678">+91 141 234 5678</a>
            <br />
            <a href="mailto:hello@elara.in">hello@elara.in</a>
            <br />
            <br />
            Mon – Sat · 10am to 7pm
          </address>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Dina Fine Jewellery. All rights reserved.</p>
        <div className="footer-certs">
          <span className="cert-badge">BIS</span>
          <span className="cert-badge">GIA</span>
          <span className="cert-badge">KP</span>
        </div>
        <div className="footer-bottom-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
