import { formatINR } from "./format";
import { PAYMENT_METHODS, type Order, type OrderItem, type OrderStatus } from "./types";

/** Digits only, with India's country code added to bare 10-digit numbers. */
export function normalizePhone(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) digits = "91" + digits;
  return digits;
}

/** Click-to-chat link that opens WhatsApp with a pre-filled message. */
export function waLink(phone: string, text: string) {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(text)}`;
}

/** Message the customer sends to the store to confirm their order. */
export function orderMessage(order: Order, items: OrderItem[], siteUrl?: string) {
  const lines = items.map((i) => {
    const opts = [i.size && `Size ${i.size}`, i.color].filter(Boolean).join(", ");
    return `• ${i.product_name}${opts ? ` (${opts})` : ""} × ${i.quantity} — ${formatINR(i.unit_price * i.quantity)}`;
  });
  return [
    `Hello! I'd like to confirm my order *${order.order_number}*.`,
    "",
    ...lines,
    "",
    `Subtotal: ${formatINR(order.subtotal)}`,
    order.discount ? `Discount${order.promo_code ? ` (${order.promo_code})` : ""}: −${formatINR(order.discount)}` : null,
    `Shipping: ${order.shipping ? formatINR(order.shipping) : "Free"}`,
    `*Total: ${formatINR(order.total)}*`,
    `Payment: ${PAYMENT_METHODS[order.payment_method] ?? order.payment_method}`,
    "",
    `Name: ${order.customer_name}`,
    `Phone: ${order.customer_phone}`,
    `Address: ${order.address}${order.landmark ? `, ${order.landmark}` : ""}, ${order.city}, ${order.state} ${order.pincode}`,
    order.notes ? `Note: ${order.notes}` : null,
    siteUrl ? `\nOrder link: ${siteUrl}/order/${order.id}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");
}

const STATUS_COPY: Record<OrderStatus, string> = {
  pending: "has been received and is awaiting confirmation",
  confirmed: "is confirmed",
  processing: "is being prepared in our atelier",
  shipped: "has been shipped",
  delivered: "has been delivered",
  cancelled: "has been cancelled",
};

/** Message the store sends the customer about their order status. */
export function statusMessage(order: Pick<Order, "customer_name" | "order_number" | "status" | "total">, storeName: string) {
  const first = order.customer_name.split(" ")[0];
  return `Hello ${first}, your ${storeName} order *${order.order_number}* (${formatINR(order.total)}) ${STATUS_COPY[order.status]}. Thank you!`;
}

// ─── Meta WhatsApp Cloud API (optional) ─────────────────────────────────────

export const cloudApiEnabled = () =>
  Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

/**
 * Send an approved template message through the WhatsApp Cloud API.
 * Business-initiated messages must use templates, so free-form text is not supported here.
 * Never throws: a failed notification must not fail the order.
 */
export async function sendTemplate(to: string, template: string, bodyParams: string[]) {
  if (!cloudApiEnabled() || !template) return { ok: false, skipped: true };
  const version = process.env.WHATSAPP_API_VERSION || "v25.0";
  try {
    const res = await fetch(
      `https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: normalizePhone(to),
          type: "template",
          template: {
            name: template,
            language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en" },
            components: [
              { type: "body", parameters: bodyParams.map((text) => ({ type: "text", text })) },
            ],
          },
        }),
      },
    );
    if (!res.ok) {
      console.error("WhatsApp Cloud API error", res.status, await res.text());
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("WhatsApp Cloud API request failed", err);
    return { ok: false };
  }
}
