import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmButton from "@/components/admin/ConfirmButton";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin";
import type { Product } from "@/lib/types";
import { deleteProduct } from "../../../actions";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const supabase = await requireAdmin();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id, name").order("sort_order"),
  ]);
  if (!product) notFound();

  return (
    <>
      <div className="adm-head">
        <div>
          <Link href="/admin/products" className="adm-link adm-back">← Products</Link>
          <h1>{product.name}</h1>
        </div>
        <div className="adm-head-actions">
          <a href={`/product/${product.slug}`} target="_blank" className="adm-btn">View in store</a>
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={product.id} />
            <ConfirmButton message={`Delete ${product.name}? Past orders keep their line items.`}>Delete</ConfirmButton>
          </form>
        </div>
      </div>
      <ProductForm product={product as Product} categories={categories ?? []} />
    </>
  );
}
