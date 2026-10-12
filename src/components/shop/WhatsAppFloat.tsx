"use client";

import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/brand";

/**
 * Floating "chat on WhatsApp" button, bottom-right. On product pages the message includes the page link.
 * Until a store WhatsApp number is saved in Admin → Settings it links to whatsapp.com as a placeholder.
 */
const PLACEHOLDER = "https://www.whatsapp.com/";

export default function WhatsAppFloat({ number }: { number: string }) {
  const pathname = usePathname();
  // Checkout and order pages have their own WhatsApp step, and the button would cover their summary on phones.
  if (pathname.startsWith("/checkout") || pathname.startsWith("/order/")) return null;

  const onProduct = pathname.startsWith("/product/");
  const digits = number.replace(/\D/g, "");
  const href = () => {
    if (!digits) return PLACEHOLDER;
    const text = onProduct
      ? `Hello ${BRAND.name}! I have a question about this piece: ${window.location.href}`
      : `Hello ${BRAND.name}! I'd like to know more about your jewellery.`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  };

  return (
    <a
      className="wa-float"
      href={digits ? `https://wa.me/${digits}` : PLACEHOLDER}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      // Build the message at click time so it includes the page the visitor is on.
      onClick={(e) => (e.currentTarget.href = href())}
    >
      <i className="fab fa-whatsapp" />
      <span className="wa-float-label">Chat with us</span>
    </a>
  );
}
