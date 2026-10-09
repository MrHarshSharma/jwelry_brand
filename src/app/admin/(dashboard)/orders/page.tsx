import Link from "next/link";
import { Suspense } from "react";
import OrderFieldSelect from "@/components/admin/OrderFieldSelect";
import OrdersSearch from "@/components/admin/OrdersSearch";
import { requireAdmin } from "@/lib/admin";
import { formatDate, formatINR } from "@/lib/format";
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, type Order } from "@/lib/types";

const labels = (values: readonly string[]) => Object.fromEntries(values.map((v) => [v, v]));

const PAGE_SIZE = 25;

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const supabase = await requireAdmin();
  const sp = await searchParams;
  const status = typeof sp.status === "string" && (ORDER_STATUSES as readonly string[]).includes(sp.status) ? sp.status : null;
  // Characters that would break PostgREST's or() filter syntax are dropped.
  const q = typeof sp.q === "string" ? sp.q.replace(/[,()%*\\]/g, "").trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);

  let query = supabase
    .from("orders")
    .select("id, order_number, customer_name, customer_phone, city, total, status, payment_status, payment_method, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (status) query = query.eq("status", status);
  if (q) query = query.or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`);
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  const orders = data as Order[];
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const href = (over: Record<string, string | number | null>) => {
    const p = new URLSearchParams();
    const merged = { status, q: q || null, page: null, ...over };
    for (const [k, v] of Object.entries(merged)) if (v !== null && v !== "") p.set(k, String(v));
    const s = p.toString();
    return `/admin/orders${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <div className="adm-head">
        <h1>Orders</h1>
        <Suspense>
          <OrdersSearch />
        </Suspense>
      </div>

      <div className="adm-tabs">
        <Link href={href({ status: null })} className={!status ? "active" : undefined}>All</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={href({ status: s })} className={status === s ? "active" : undefined}>
            {s}
          </Link>
        ))}
      </div>

      <div className="adm-card adm-card-flush">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/admin/orders/${o.id}`} className="adm-link">{o.order_number}</Link></td>
                  <td className="adm-muted">{formatDate(o.created_at)}</td>
                  <td>
                    {o.customer_name}
                    <div className="adm-muted">{o.customer_phone} · {o.city}</div>
                  </td>
                  <td>{formatINR(o.total)}</td>
                  <td>
                    <OrderFieldSelect orderId={o.id} field="status" value={o.status} options={labels(ORDER_STATUSES)} />
                  </td>
                  <td>
                    <OrderFieldSelect
                      orderId={o.id}
                      field="payment_status"
                      value={o.payment_status}
                      options={labels(PAYMENT_STATUSES)}
                    />
                  </td>
                  <td>
                    <OrderFieldSelect orderId={o.id} field="payment_method" value={o.payment_method} options={PAYMENT_METHODS} />
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="adm-empty">
                    {q ? `No orders match “${q}”.` : "No orders found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pages > 1 && (
        <div className="adm-pager">
          {page > 1 && <Link href={href({ page: page - 1 })} className="adm-btn">← Previous</Link>}
          <span className="adm-muted">Page {page} of {pages}</span>
          {page < pages && <Link href={href({ page: page + 1 })} className="adm-btn">Next →</Link>}
        </div>
      )}
    </>
  );
}
