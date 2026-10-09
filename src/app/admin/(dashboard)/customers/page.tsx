import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatDate, formatINR } from "@/lib/format";
import type { Customer } from "@/lib/types";

export default async function CustomersPage() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.from("customers").select("*").order("last_order_at", { ascending: false });
  if (error) throw new Error(error.message);
  const customers = data as Customer[];

  return (
    <>
      <div className="adm-head">
        <h1>Customers <span className="adm-muted">({customers.length})</span></h1>
      </div>
      <div className="adm-card adm-card-flush">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>WhatsApp</th>
                <th>City</th>
                <th>Orders</th>
                <th>Total spent</th>
                <th>Last order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.phone}>
                  <td>
                    {c.name}
                    {c.email && <div className="adm-muted">{c.email}</div>}
                  </td>
                  <td>
                    <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="adm-link">
                      <i className="fab fa-whatsapp" /> {c.phone}
                    </a>
                  </td>
                  <td>{c.city}</td>
                  <td>
                    <Link href={`/admin/orders?q=${encodeURIComponent(c.phone)}`} className="adm-link">{c.orders_count}</Link>
                  </td>
                  <td>{formatINR(c.total_spent)}</td>
                  <td className="adm-muted">{formatDate(c.last_order_at)}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={6} className="adm-empty">Customers appear here after their first order.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
