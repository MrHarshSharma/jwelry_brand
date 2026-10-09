import Link from "next/link";
import SwitchButton from "@/components/admin/SwitchButton";
import { requireAdmin } from "@/lib/admin";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/types";
import { toggleProduct } from "../../actions";

export default async function ProductsPage() {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(slug, name)")
    .order("created_at", { ascending: false })
    .order("name"); // tiebreaker: seeded rows share one created_at
  if (error) throw new Error(error.message);
  const products = data as Product[];

  return (
    <>
      <div className="adm-head">
        <h1>Products <span className="adm-muted">({products.length})</span></h1>
        <Link href="/admin/products/new" className="adm-btn adm-btn-primary"><i className="fas fa-plus" /> New product</Link>
      </div>
      <div className="adm-card adm-card-flush">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th />
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Visible</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={p.is_active ? undefined : "adm-row-dim"}>
                  <td className="adm-thumb-cell">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.images[0] && <img src={p.images[0]} alt="" className="adm-thumb" />}
                  </td>
                  <td>
                    <Link href={`/admin/products/${p.id}`} className="adm-link">{p.name}</Link>
                    <div className="adm-muted">{p.sku}</div>
                  </td>
                  <td>{p.category?.name ?? <span className="adm-muted">—</span>}</td>
                  <td>
                    {formatINR(p.price)}
                    {p.original_price && <div className="adm-muted adm-strike">{formatINR(p.original_price)}</div>}
                  </td>
                  <td>
                    {p.stock === null ? (
                      <span className="adm-muted">Made to order</span>
                    ) : (
                      <span className={p.stock === 0 ? "adm-danger" : undefined}>{p.stock}</span>
                    )}
                  </td>
                  <td><Toggle id={p.id} field="is_featured" on={p.is_featured} /></td>
                  <td><Toggle id={p.id} field="is_active" on={p.is_active} /></td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={7} className="adm-empty">No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Toggle({ id, field, on }: { id: string; field: string; on: boolean }) {
  return (
    <form action={toggleProduct}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={String(!on)} />
      <SwitchButton on={on} label={`Toggle ${field}`} />
    </form>
  );
}
