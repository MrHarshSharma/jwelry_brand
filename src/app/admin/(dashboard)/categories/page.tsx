import ConfirmButton from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/admin";
import type { Category } from "@/lib/types";
import { deleteCategory, saveCategory } from "../../actions";
import SubmitButton from "@/components/admin/SubmitButton";

export default async function CategoriesPage() {
  const supabase = await requireAdmin();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("category_id"),
  ]);
  const counts = new Map<string, number>();
  products?.forEach((p) => p.category_id && counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1));

  return (
    <>
      <div className="adm-head">
        <h1>Categories</h1>
      </div>

      <div className="adm-card adm-card-flush">
        <div className="adm-table-wrap">
          <table className="adm-table adm-edit-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Image URL</th>
                <th>Products</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(categories as Category[] | null)?.map((c) => (
                <tr key={c.id}>
                  <td colSpan={4}>
                    <form action={saveCategory} className="adm-inline-form">
                      <input type="hidden" name="id" value={c.id} />
                      <input name="sort_order" type="number" defaultValue={c.sort_order} className="adm-input-xs" />
                      <input name="name" defaultValue={c.name} required />
                      <input name="slug" defaultValue={c.slug} />
                      <input name="image_url" defaultValue={c.image_url ?? ""} placeholder="/image/ring.jpg" />
                      <SubmitButton pendingText="Saving…">Save</SubmitButton>
                    </form>
                  </td>
                  <td>{counts.get(c.id) ?? 0}</td>
                  <td className="adm-actions">
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <ConfirmButton message={`Delete ${c.name}? Its products will become uncategorised.`}>Delete</ConfirmButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section className="adm-card">
        <h2>Add category</h2>
        <form action={saveCategory} className="adm-inline-form">
          <input name="sort_order" type="number" placeholder="Order" className="adm-input-xs" />
          <input name="name" placeholder="Name" required />
          <input name="slug" placeholder="slug (optional)" />
          <input name="image_url" placeholder="Image URL (optional)" />
          <SubmitButton className="adm-btn adm-btn-primary" pendingText="Adding…">Add</SubmitButton>
        </form>
      </section>
    </>
  );
}
