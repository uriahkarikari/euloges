import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://www.euloges.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: memorials, error } = await supabase
    .from("memorials")
    .select("id, updated_at")
    .eq("status", "published")
    .eq("privacy", "public")
    .eq("allow_search_indexing", true);

  if (error) {
    console.error("Unable to generate memorial sitemap:", error);
    throw error;
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const memorialPages: MetadataRoute.Sitemap = (memorials ?? []).map(
    (memorial) => ({
      url: `${SITE_URL}/brochure/${memorial.id}`,
      lastModified: memorial.updated_at
        ? new Date(memorial.updated_at)
        : undefined,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  return [...staticPages, ...memorialPages];
}
