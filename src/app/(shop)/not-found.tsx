import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <i className="far fa-gem" />
      <h2>We couldn&rsquo;t find that piece</h2>
      <p>It may have been moved or is no longer available.</p>
      <Link href="/shop" className="btn-return">Return to Shop</Link>
    </div>
  );
}
