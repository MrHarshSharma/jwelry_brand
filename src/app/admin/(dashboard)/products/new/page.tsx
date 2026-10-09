import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin";

export default async function NewProductPage() {
  const supabase = await requireAdmin();
  const { data: categories } = await supabase.from("categories").select("id, name").order("sort_order");
  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/products" className="adm-link adm-back">← Products</Link>
          <h1>New product</h1>
        </div>
      </div>
      <ProductForm categories={categories ?? []} />
    </>
  );
}
