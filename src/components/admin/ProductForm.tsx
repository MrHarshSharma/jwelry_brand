"use client";

import { useState, useTransition } from "react";
import { discardUpload, saveProduct, type ProductPayload } from "@/app/admin/actions";
import { slugify } from "@/lib/format";
import { PRODUCT_IMAGES_BUCKET as BUCKET } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import type { Product, ProductColor } from "@/lib/types";

export default function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: { id: string; name: string }[];
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [colors, setColors] = useState<ProductColor[]>(product?.colors ?? []);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(undefined);
    const supabase = createClient();
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${slugify(name) || "product"}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
      if (error) {
        setError(`Upload failed: ${error.message}`);
        break;
      }
      urls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    }
    setImages((imgs) => [...imgs, ...urls]);
    setUploading(false);
  }

  function removeImage(i: number) {
    const url = images[i];
    setImages(images.filter((_, j) => j !== i));
    // Saved images are cleaned up when the product is saved. Fresh uploads were never saved, so delete them now.
    if (!product?.images.includes(url)) void discardUpload(url);
  }

  function move(i: number, dir: -1 | 1) {
    setImages((imgs) => {
      const next = [...imgs];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      return next;
    });
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const s = (k: string) => String(fd.get(k) ?? "");
    const n = (k: string) => (s(k).trim() === "" ? null : Number(s(k)));
    const lines = (k: string, sep: RegExp) => s(k).split(sep).map((x) => x.trim()).filter(Boolean);

    const payload: ProductPayload = {
      id: product?.id,
      name,
      slug: slug || slugify(name),
      category_id: s("category_id") || null,
      description: s("description"),
      price: n("price") ?? NaN,
      original_price: n("original_price"),
      badge: s("badge") || null,
      stock: n("stock"),
      metal: s("metal"),
      stone: s("stone"),
      occasion: s("occasion"),
      sku: s("sku"),
      delivery: s("delivery"),
      sizes: lines("sizes", /,/),
      care: lines("care", /\n/),
      colors,
      images,
      rating: n("rating") ?? 5,
      reviews_count: n("reviews_count") ?? 0,
      is_active: fd.get("is_active") === "on",
      is_featured: fd.get("is_featured") === "on",
    };
    setError(undefined);
    startTransition(async () => {
      const res = await saveProduct(payload);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form onSubmit={submit} className="adm-grid-2 adm-product-form">
      <div className="adm-stack">
        <section className="adm-card adm-form">
          <h2>Details</h2>
          <label className="adm-field">
            <span>Name *</span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              required
            />
          </label>
          <label className="adm-field">
            <span>URL slug</span>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="auto from name"
            />
          </label>
          <label className="adm-field">
            <span>Description</span>
            <textarea name="description" rows={5} defaultValue={product?.description} />
          </label>
          <div className="adm-row">
            <label className="adm-field">
              <span>Metal</span>
              <input name="metal" defaultValue={product?.metal ?? ""} placeholder="18K Yellow Gold" />
            </label>
            <label className="adm-field">
              <span>Stone</span>
              <input name="stone" defaultValue={product?.stone ?? ""} placeholder="Diamond · 0.5 ct" />
            </label>
          </div>
          <div className="adm-row">
            <label className="adm-field">
              <span>Occasion</span>
              <input name="occasion" defaultValue={product?.occasion ?? ""} placeholder="Wedding · Festive" />
            </label>
            <label className="adm-field">
              <span>SKU</span>
              <input name="sku" defaultValue={product?.sku ?? ""} />
            </label>
          </div>
          <label className="adm-field">
            <span>Sizes (comma separated)</span>
            <input name="sizes" defaultValue={product?.sizes.join(", ")} placeholder="6, 6.5, 7" />
          </label>
          <label className="adm-field">
            <span>Care instructions (one per line)</span>
            <textarea name="care" rows={4} defaultValue={product?.care.join("\n")} />
          </label>
          <label className="adm-field">
            <span>Delivery note</span>
            <input name="delivery" defaultValue={product?.delivery ?? ""} placeholder="Free insured shipping · 5–7 business days" />
          </label>
        </section>

        <section className="adm-card adm-form">
          <h2>Colours</h2>
          {colors.map((c, i) => (
            <div className="adm-row adm-color-row" key={i}>
              <input
                type="color"
                value={c.hex}
                onChange={(e) => setColors(colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))}
              />
              <input
                value={c.name}
                placeholder="Yellow Gold"
                onChange={(e) => setColors(colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
              />
              <button type="button" className="adm-btn" onClick={() => setColors(colors.filter((_, j) => j !== i))}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="adm-btn" onClick={() => setColors([...colors, { name: "", hex: "#C9A84C" }])}>
            + Add colour
          </button>
        </section>
      </div>

      <div className="adm-stack">
        <section className="adm-card adm-form">
          <h2>Pricing & inventory</h2>
          <div className="adm-row">
            <label className="adm-field">
              <span>Price (₹) *</span>
              <input name="price" type="number" min={0} step={1} defaultValue={product?.price} required />
            </label>
            <label className="adm-field">
              <span>Compare-at price (₹)</span>
              <input name="original_price" type="number" min={0} step={1} defaultValue={product?.original_price ?? ""} />
            </label>
          </div>
          <div className="adm-row">
            <label className="adm-field">
              <span>Stock</span>
              <input name="stock" type="number" min={0} step={1} defaultValue={product?.stock ?? ""} placeholder="blank = made to order" />
            </label>
            <label className="adm-field">
              <span>Category</span>
              <select name="category_id" defaultValue={product?.category_id ?? ""}>
                <option value="">— None —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>
          <div className="adm-row">
            <label className="adm-field">
              <span>Badge</span>
              <select name="badge" defaultValue={product?.badge ?? ""}>
                <option value="">None</option>
                <option value="new">New</option>
                <option value="sale">Sale</option>
                <option value="bestseller">Bestseller</option>
              </select>
            </label>
            <label className="adm-field">
              <span>Rating (0–5)</span>
              <input name="rating" type="number" min={0} max={5} defaultValue={product?.rating ?? 5} />
            </label>
            <label className="adm-field">
              <span>Reviews</span>
              <input name="reviews_count" type="number" min={0} defaultValue={product?.reviews_count ?? 0} />
            </label>
          </div>
          <label className="adm-check">
            <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} /> Visible in store
          </label>
          <label className="adm-check">
            <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured ?? false} /> Feature on home page
          </label>
        </section>

        <section className="adm-card adm-form">
          <h2>Images</h2>
          <div className="adm-images">
            {images.map((src, i) => (
              <div className="adm-image" key={src + i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" />
                {i === 0 && <span className="adm-image-main">Main</span>}
                <div className="adm-image-tools">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move left">←</button>
                  <button type="button" disabled={i === images.length - 1} onClick={() => move(i, 1)} aria-label="Move right">→</button>
                  <button type="button" onClick={() => removeImage(i)} aria-label="Remove">✕</button>
                </div>
              </div>
            ))}
          </div>
          <label className={`adm-btn adm-upload${uploading ? " busy" : ""}`} aria-busy={uploading}>
            {uploading ? <><i className="fas fa-spinner fa-spin" /> Uploading…</> : <><i className="fas fa-upload" /> Upload images</>}
            <input type="file" accept="image/*" multiple hidden disabled={uploading} onChange={(e) => upload(e.target.files)} />
          </label>
          <div className="adm-row">
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="…or paste an image URL" />
            <button
              type="button"
              className="adm-btn"
              onClick={() => {
                if (imageUrl.trim()) setImages([...images, imageUrl.trim()]);
                setImageUrl("");
              }}
            >
              Add
            </button>
          </div>
        </section>

        <div className="adm-save-bar">
          {error && <p className="adm-error">{error}</p>}
          <button className="adm-btn adm-btn-primary" disabled={pending || uploading}>
            {pending ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Saving…
              </>
            ) : product ? (
              "Save changes"
            ) : (
              "Create product"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
