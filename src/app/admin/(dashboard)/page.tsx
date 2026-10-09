import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin";
import { formatDate, formatINR } from "@/lib/format";
import { ORDER_STATUSES, type Order } from "@/lib/types";

export default async function OverviewPage() {
  const supabase = await requireAdmin();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [{ data: orders }, { data: recent }, { count: productCount }, { data: lowStock }] = await Promise.all([
    supabase.from("orders").select("status, total, created_at"),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("products").select("id, name, stock").not("stock", "is", null).lte("stock", 3).order("stock"),
  ]);

  const all = orders ?? [];
  const live = all.filter((o) => o.status !== "cancelled");
  const revenue = live.reduce((s, o) => s + o.total, 0);
  const monthRevenue = live.filter((o) => new Date(o.created_at) >= monthStart).reduce((s, o) => s + o.total, 0);
  const byStatus = Object.fromEntries(ORDER_STATUSES.map((s) => [s, all.filter((o) => o.status === s).length]));

  return (
    <>
      <div className="adm-head">
        <h1>Overview</h1>
      </div>

      <div className="adm-stats">
        <Stat label="Pending orders" value={byStatus.pending} href="/admin/orders?status=pending" accent />
        <Stat label="Total orders" value={all.length} href="/admin/orders" />
        <Stat label="Revenue (all time)" value={formatINR(revenue)} />
        <Stat label="Revenue this month" value={formatINR(monthRevenue)} />
        <Stat label="Active products" value={productCount ?? 0} href="/admin/products" />
      </div>

      <div className="adm-grid-2">
        <section className="adm-card">
          <div className="adm-card-head">
            <h2>Recent orders</h2>
            <Link href="/admin/orders" className="adm-link">View all</Link>
          </div>
          <table className="adm-table">
            <tbody>
              {(recent as Order[] | null)?.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/admin/orders/${o.id}`} className="adm-link">{o.order_number}</Link></td>
                  <td>{o.customer_name}</td>
                  <td className="adm-muted">{formatDate(o.created_at)}</td>
                  <td>{formatINR(o.total)}</td>
                  <td><StatusBadge status={o.status} /></td>
                </tr>
              ))}
              {!recent?.length && (
                <tr><td className="adm-empty">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <div className="adm-stack">
          <section className="adm-card">
            <h2>Orders by status</h2>
            <ul className="adm-status-list">
              {ORDER_STATUSES.map((s) => (
                <li key={s}>
                  <Link href={`/admin/orders?status=${s}`}><StatusBadge status={s} /></Link>
                  <strong>{byStatus[s]}</strong>
                </li>
              ))}
            </ul>
          </section>
          <section className="adm-card">
            <h2>Low stock</h2>
            {lowStock?.length ? (
              <ul className="adm-status-list">
                {lowStock.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/products/${p.id}`} className="adm-link">{p.name}</Link>
                    <strong className={p.stock === 0 ? "adm-danger" : undefined}>{p.stock}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="adm-muted">Nothing running low.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, href, accent }: { label: string; value: React.ReactNode; href?: string; accent?: boolean }) {
  const body = (
    <>
      <div className="adm-stat-label">{label}</div>
      <div className="adm-stat-value">{value}</div>
    </>
  );
  return href ? (
    <Link href={href} className={`adm-stat${accent ? " accent" : ""}`}>{body}</Link>
  ) : (
    <div className="adm-stat">{body}</div>
  );
}
