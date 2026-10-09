import ConfirmButton from "@/components/admin/ConfirmButton";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import type { PromoCode } from "@/lib/types";
import { createPromo, deletePromo, togglePromo } from "../../actions";
import SubmitButton from "@/components/admin/SubmitButton";

export default async function PromosPage() {
  const supabase = await requireAdmin();
  const [{ data }, { data: usage }] = await Promise.all([
    supabase.from("promo_codes").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("promo_code").not("promo_code", "is", null).neq("status", "cancelled"),
  ]);
  const promos = (data ?? []) as PromoCode[];
  const uses = new Map<string, number>();
  usage?.forEach((o) => uses.set(o.promo_code!, (uses.get(o.promo_code!) ?? 0) + 1));
  const now = new Date().getTime();

  return (
    <>
      <div className="adm-head">
        <h1>Promo codes</h1>
      </div>

      <section className="adm-card">
        <h2>New promo code</h2>
        <form action={createPromo} className="adm-inline-form">
          <input name="code" placeholder="CODE" required className="adm-upper" />
          <input name="percent_off" type="number" min={1} max={90} placeholder="% off" required className="adm-input-sm" />
          <label className="adm-inline-label">
            Expires <input name="expires_at" type="date" />
          </label>
          <SubmitButton className="adm-btn adm-btn-primary" pendingText="Creating…">Create</SubmitButton>
        </form>
      </section>

      <div className="adm-card adm-card-flush">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Expires</th>
                <th>Orders</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => {
                const expired = p.expires_at !== null && new Date(p.expires_at).getTime() < now;
                return (
                  <tr key={p.code}>
                    <td><strong>{p.code}</strong></td>
                    <td>{p.percent_off}%</td>
                    <td className="adm-muted">{p.expires_at ? formatDate(p.expires_at) : "Never"}</td>
                    <td>{uses.get(p.code) ?? 0}</td>
                    <td><StatusBadge status={expired ? "expired" : p.is_active ? "active" : "inactive"} /></td>
                    <td className="adm-actions">
                      <form action={togglePromo}>
                        <input type="hidden" name="code" value={p.code} />
                        <input type="hidden" name="value" value={String(!p.is_active)} />
                        <SubmitButton pendingText={p.is_active ? "Disabling…" : "Enabling…"}>
                          {p.is_active ? "Disable" : "Enable"}
                        </SubmitButton>
                      </form>
                      <form action={deletePromo}>
                        <input type="hidden" name="code" value={p.code} />
                        <ConfirmButton message={`Delete promo code ${p.code}?`}>Delete</ConfirmButton>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {promos.length === 0 && (
                <tr><td colSpan={6} className="adm-empty">No promo codes yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
