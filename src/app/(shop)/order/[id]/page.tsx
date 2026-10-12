import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Steps from "@/components/shop/Steps";
import { getSettings } from "@/lib/data";
import { formatDate, formatINR } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/lib/types";
import { orderMessage, waLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Your Order", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function OrderPage({ params, searchParams }: PageProps<"/order/[id]">) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const [{ data }, settings] = await Promise.all([supabase.rpc("get_order", { p_id: id }), getSettings()]);
  if (!data) notFound();
  const order = data as Order & { items: OrderItem[] };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const whatsappUrl = settings.whatsapp_number
    ? waLink(settings.whatsapp_number, orderMessage(order, order.items, siteUrl))
    : null;

  return (
    <>
      <Steps current={order.status === "pending" ? 2 : 4} />
      <div className="success-screen show">
        <div className="success-ring">
          <i className={order.status === "cancelled" ? "fas fa-times" : "fas fa-check"} />
        </div>
        <h2>
          {isNew ? <>Almost <em>there</em></> : <>Order <em>{order.status}</em></>}
        </h2>
        {isNew ? (
          <p>
            Your order has been reserved. Send it to us on WhatsApp to confirm — we&rsquo;ll reply with payment and
            delivery details.
          </p>
        ) : (
          <p>Placed on {formatDate(order.created_at)}</p>
        )}
        <div className="order-ref">Order · {order.order_number}</div>

        {whatsappUrl && order.status !== "cancelled" && (
          <div className="success-btns">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp btn-whatsapp-lg">
              <i className="fab fa-whatsapp" /> {isNew ? "Send Order on WhatsApp" : "Message Us on WhatsApp"}
            </a>
          </div>
        )}

        <div className="order-card">
          {order.items.map((i) => (
            <div className="summary-row" key={i.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {i.product_image ? <img className="summary-img" src={i.product_image} alt={i.product_name} /> : <div />}
              <div>
                <div className="summary-name">{i.product_name}</div>
                <div className="summary-qty">
                  Qty: {i.quantity}
                  {i.size && ` · ${i.size}`}
                  {i.color && ` · ${i.color}`}
                </div>
              </div>
              <div className="summary-price">{formatINR(i.unit_price * i.quantity)}</div>
            </div>
          ))}
          <div className="summary-totals">
            <div className="total-row"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
            {order.discount > 0 && (
              <div className="total-row"><span>Discount ({order.promo_code})</span><span className="discount-label">−{formatINR(order.discount)}</span></div>
            )}
            <div className="total-row"><span>Shipping</span><span>{order.shipping ? formatINR(order.shipping) : "Free"}</span></div>
            <div className="total-row grand"><span>Total</span><span>{formatINR(order.total)}</span></div>
          </div>
          <p className="order-card-addr">
            <strong>{order.customer_name}</strong> · {order.customer_phone}
            <br />
            {order.address}
            {order.landmark && `, ${order.landmark}`}, {order.city}, {order.state} {order.pincode}
          </p>
        </div>

        <div className="success-btns">
          <Link href="/shop" className="btn-shop-again">Continue Shopping</Link>
        </div>
      </div>
    </>
  );
}
