import CategoryRow from "@/components/admin/CategoryRow";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { requireAdmin } from "@/lib/admin";
import type { Category } from "@/lib/types";
import { saveCategory } from "../../actions";
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
                <th>Image</th>
                <th>Products</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(categories as Category[] | null)?.map((c) => (
                <CategoryRow key={c.id} category={c} productCount={counts.get(c.id) ?? 0} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section className="adm-card">
        <h2>Add category</h2>
        <form action={saveCategory} className="adm-inline-form">
          <input name="sort_order" type="number" placeholder="#" aria-label="Order" className="adm-input-xs" />
          <input name="name" placeholder="Name" required />
          <input name="slug" placeholder="slug (optional)" />
          <ImageUploadField name="image_url" folder="categories" />
          <SubmitButton className="adm-btn adm-btn-primary" pendingText="Adding…">Add</SubmitButton>
        </form>
      </section>
    </>
  );
}
