import { SUPABASE_URL } from "./supabase/env";

export const PRODUCT_IMAGES_BUCKET = "product-images";

/**
 * Path of a file inside the product-images bucket, or null when the URL points anywhere else
 * (e.g. /image/… files shipped with the site, or pasted external URLs), which we must never delete.
 */
export function productImagePath(url: string): string | null {
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  if (!url.startsWith(prefix)) return null;
  const path = decodeURIComponent(url.slice(prefix.length).split(/[?#]/)[0]);
  return path || null;
}
