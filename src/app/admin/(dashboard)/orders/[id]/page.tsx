import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmButton from "@/components/admin/ConfirmButton";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin";
import { formatDate, formatINR } from "@/lib/format";
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, type Order, type OrderItem } from "@/lib/types";
import { cloudApiEnabled, statusMessage, waLink } from "@/lib/whatsapp";
import { deleteOrder, updateOrder } from "../../../actions";
import SubmitButton from "@/components/admin/SubmitButton";

export default async function OrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const supabase = await requireAdmin();
  const { data } = await supabase.from("orders").select("*, items:order_items(*)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const order = data as Order & { items: OrderItem[] };

  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/orders" className="adm-link adm-back">← Orders</Link>
          <h1>
            {order.order_number} <StatusBadge status={order.status} />
          </h1>
          <p className="adm-muted">Placed {formatDate(order.created_at)}</p>
        </div>
        <a
          href={waLink(order.customer_phone, statusMessage(order))}
          target="_blank"
          rel="noopener noreferrer"
          className="adm-btn adm-btn-whatsapp"
        >
          <i className="fab fa-whatsapp" /> Message customer
        </a>
      </div>

      <div className="adm-grid-2">
        <div className="adm-stack">
          <section className="adm-card">
            <h2>Items</h2>
            <table className="adm-table">
              <tbody>
                {order.items.map((i) => (
                  <tr key={i.id}>
                    <td className="adm-thumb-cell">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {i.product_image && <img src={i.product_image} alt="" className="adm-thumb" />}
                    </td>
                    <td>
                      {i.product_id ? (
                        <Link href={`/admin/products/${i.product_id}`} className="adm-link">{i.product_name}</Link>
                      ) : (
                        i.product_name
                      )}
                      <div className="adm-muted">
                        {[i.sku, i.size && `Size ${i.size}`, i.color].filter(Boolean).join(" · ")}
                      </div>
                    </td>
                    <td className="adm-muted">{formatINR(i.unit_price)} × {i.quantity}</td>
                    <td className="adm-right">{formatINR(i.unit_price * i.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="adm-totals">
              <dt>Subtotal</dt><dd>{formatINR(order.subtotal)}</dd>
              {order.discount > 0 && (<><dt>Discount ({order.promo_code})</dt><dd>−{formatINR(order.discount)}</dd></>)}
              <dt>Shipping</dt><dd>{order.shipping ? formatINR(order.shipping) : "Free"}</dd>
              <dt className="grand">Total</dt><dd className="grand">{formatINR(order.total)}</dd>
            </dl>
          </section>

          <section className="adm-card">
            <h2>Customer</h2>
            <dl className="adm-dl">
              <dt>Name</dt><dd>{order.customer_name}</dd>
              <dt>WhatsApp</dt>
              <dd>
                <a href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="adm-link">
                  {order.customer_phone}
                </a>{" "}
                · <Link href={`/admin/orders?q=${encodeURIComponent(order.customer_phone)}`} className="adm-link">all orders</Link>
              </dd>
              {order.customer_email && (<><dt>Email</dt><dd>{order.customer_email}</dd></>)}
              <dt>Address</dt>
              <dd>
                {order.address}
                {order.landmark && <>, {order.landmark}</>}
                <br />
                {order.city}, {order.state} {order.pincode}
              </dd>
              <dt>Payment</dt><dd>{PAYMENT_METHODS[order.payment_method] ?? order.payment_method}</dd>
              {order.notes && (<><dt>Customer note</dt><dd>{order.notes}</dd></>)}
            </dl>
          </section>
        </div>

        <div className="adm-stack">
          <section className="adm-card">
            <h2>Manage</h2>
            <form action={updateOrder} className="adm-form">
              <input type="hidden" name="id" value={order.id} />
              <label className="adm-field">
                <span>Order status</span>
                <select name="status" defaultValue={order.status}>
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="adm-field">
                <span>Payment status</span>
                <select name="payment_status" defaultValue={order.payment_status}>
                  {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="adm-field">
                <span>Payment method</span>
                <select name="payment_method" defaultValue={order.payment_method}>
                  {Object.entries(PAYMENT_METHODS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                </select>
              </label>
              <label className="adm-field">
                <span>Internal notes</span>
                <textarea name="admin_notes" rows={4} defaultValue={order.admin_notes ?? ""} placeholder="Only visible to admins" />
              </label>
              {cloudApiEnabled() && (
                <label className="adm-check">
                  <input type="checkbox" name="notify" defaultChecked /> Send WhatsApp update to customer if status changes
                </label>
              )}
              <SubmitButton className="adm-btn adm-btn-primary" pendingText="Saving…">Save changes</SubmitButton>
            </form>
            <p className="adm-hint">
              Cancelling an order returns its items to stock (for products with tracked stock).
            </p>
          </section>

          <section className="adm-card">
            <h2>Danger zone</h2>
            <form action={deleteOrder}>
              <input type="hidden" name="id" value={order.id} />
              <ConfirmButton message={`Delete order ${order.order_number}? This cannot be undone.`}>
                Delete order
              </ConfirmButton>
            </form>
            <p className="adm-hint">Prefer cancelling — deleting does not restore stock.</p>
          </section>
        </div>
      </div>
    </>
  );
}
