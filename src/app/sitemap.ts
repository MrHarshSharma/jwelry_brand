import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/brand";
import { createPublicClient } from "@/lib/supabase/public";

// Built on request so new products appear without a redeploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("slug, images, updated_at").eq("is_active", true),
    supabase.from("categories").select("slug"),
  ]);

  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/shop"), changeFrequency: "daily", priority: 0.9 },
    ...(categories ?? []).map((c) => ({
      url: absoluteUrl(`/shop?category=${c.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...(products ?? []).map((p) => ({
      url: absoluteUrl(`/product/${p.slug}`),
      lastModified: p.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: (p.images as string[]).slice(0, 1).map(absoluteUrl),
    })),
  ];
}
